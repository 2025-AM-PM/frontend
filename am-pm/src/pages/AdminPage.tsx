import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/userContext";
import "../styles/admin.css";
import type { StudentRole } from "../types";
import {
  getSignupApplications,
  approveSignupApplications,
  rejectSignupApplications,
  getAllStudents,
  updateStudentRole,
  deleteStudent,
  type SignupApplicationResponse,
  type StudentResponse,
} from "../api/client";

// Using types from API client
type SignupApplication = SignupApplicationResponse;
type Student = StudentResponse;

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"applications" | "students">(
    "applications"
  );
  const [signupApplications, setSignupApplications] = useState<
    SignupApplication[]
  >([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<Set<number>>(
    new Set()
  );

  const fetchSignupApplications = async () => {
    setLoading(true);
    try {
      const applications = await getSignupApplications("PENDING");
      setSignupApplications(applications);
    } catch (error) {
      console.error("Failed to fetch signup applications:", error);
      alert("회원가입 신청 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await getAllStudents();

      // 현재 사용자를 맨 위로, 나머지는 이름순으로 정렬
      const currentUserId = user?.studentId;
      const currentUser = response.students.find((s) => s.id === currentUserId);
      const otherUsers = response.students
        .filter((s) => s.id !== currentUserId)
        .sort((a, b) => a.studentName.localeCompare(b.studentName));

      const sortedStudents = currentUser
        ? [currentUser, ...otherUsers]
        : otherUsers;
      setStudents(sortedStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      alert("학생 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (action: "approve" | "reject") => {
    const applicationIds = Array.from(selectedApplications);
    if (applicationIds.length === 0) {
      alert("선택된 신청이 없습니다.");
      return;
    }

    if (
      !window.confirm(
        `${applicationIds.length}건의 신청을 ${
          action === "approve" ? "승인" : "거부"
        }하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      if (action === "approve") {
        await approveSignupApplications(applicationIds);
      } else {
        await rejectSignupApplications(applicationIds);
      }

      alert(
        `${applicationIds.length}건의 신청이 ${
          action === "approve" ? "승인" : "거부"
        }되었습니다.`
      );
      setSelectedApplications(new Set());
      fetchSignupApplications();
    } catch (error) {
      console.error(`Failed to ${action} applications:`, error);
      alert(`처리 중 오류가 발생했습니다: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (studentId: number, newRole: StudentRole) => {
    const currentStudent = students.find((s) => s.id === studentId);
    if (!currentStudent) return;

    if (
      !window.confirm(
        `${currentStudent.studentName}의 권한을 ${newRole}로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await updateStudentRole(studentId, newRole);

      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId ? { ...student, role: newRole } : student
        )
      );
      alert("권한이 변경되었습니다.");
    } catch (error) {
      console.error("Failed to update student role:", error);
      alert(`권한 변경 중 오류가 발생했습니다: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleApplicationSelection = (id: number) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedApplications(newSelected);
  };

  const selectAllApplications = () => {
    if (selectedApplications.size === signupApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(signupApplications.map((app) => app.id)));
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (
      !window.confirm(
        `${student.studentName} 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await deleteStudent(studentId);

      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      alert("학생이 삭제되었습니다.");
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert(`학생 삭제 중 오류가 발생했습니다: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "applications") {
      fetchSignupApplications();
    } else {
      fetchStudents();
    }
  }, [activeTab]);

  // 관리자 권한 확인
  if (!user || user.role === "USER") {
    return (
      <div className="admin-access-denied">
        <h1>접근 권한이 없습니다</h1>
        <p>이 페이지는 관리자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>관리자 페이지</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${
            activeTab === "applications" ? "active" : ""
          }`}
          onClick={() => setActiveTab("applications")}
        >
          회원가입 신청 관리
        </button>
        <button
          className={`tab-button ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          학생 관리
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "applications" && (
          <div className="applications-section">
            <div className="section-header">
              <h2>회원가입 신청 목록</h2>
              <div className="action-buttons">
                <button
                  onClick={() => handleApplicationAction("approve")}
                  disabled={selectedApplications.size === 0 || loading}
                  className="approve-button"
                >
                  선택 승인 ({selectedApplications.size})
                </button>
                <button
                  onClick={() => handleApplicationAction("reject")}
                  disabled={selectedApplications.size === 0 || loading}
                  className="reject-button"
                >
                  선택 거부 ({selectedApplications.size})
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedApplications.size ===
                            signupApplications.length &&
                          signupApplications.length > 0
                        }
                        onChange={selectAllApplications}
                      />
                    </th>
                    <th>학번</th>
                    <th>이름</th>
                    <th>신청일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {signupApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedApplications.has(application.id)}
                          onChange={() =>
                            toggleApplicationSelection(application.id)
                          }
                        />
                      </td>
                      <td>{application.studentNumber}</td>
                      <td>{application.studentName}</td>
                      <td>
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`status ${application.status.toLowerCase()}`}
                        >
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="students-section">
            <div className="section-header">
              <h2>학생 목록</h2>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>학번</th>
                    <th>이름</th>
                    <th>권한</th>
                    <th>권한 변경</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className={
                        student.id === user?.studentId ? "current-user-row" : ""
                      }
                    >
                      <td>
                        {student.studentNumber}
                        {student.id === user?.studentId && (
                          <span className="current-user-badge">(본인)</span>
                        )}
                      </td>
                      <td>{student.studentName}</td>
                      <td>
                        <span className={`role ${student.role.toLowerCase()}`}>
                          {student.role}
                        </span>
                      </td>
                      <td>
                        <select
                          value={student.role}
                          onChange={(e) =>
                            handleRoleChange(
                              student.id,
                              e.target.value as StudentRole
                            )
                          }
                          disabled={loading || student.id === user?.studentId}
                          className="role-select"
                        >
                          <option value="USER">일반</option>
                          <option value="STAFF">임원</option>
                          <option value="PRESIDENT">회장</option>
                          <option value="SYSTEM_ADMIN">시스템 관리자</option>
                        </select>
                        {student.id === user?.studentId && (
                          <div className="self-action-disabled">
                            본인 권한 변경 불가
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          disabled={loading || student.id === user?.studentId}
                          className="delete-button"
                        >
                          {student.id === user?.studentId ? "본인" : "삭제"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">처리 중...</div>
        </div>
      )}
    </div>
  );
}
