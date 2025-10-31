import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✨ Link를 추가합니다.
import "../styles/mypage.css";
import { apiFetch } from "../api/client";
interface UserProfile {
  name: string;
  studentId: string;
  baekjoonId: string;
}

export default function Mypage() {
  const navigate = useNavigate(); // 2. useNavigate를 초기화합니다.

  // 3. 초기 상태를 요청대로 빈 문자열("")로 설정합니다.
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    studentId: "",
    baekjoonId: "",
  });

  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false); // API 호출 로딩 상태
  const [verificationCode, setVerificationCode] = useState<string | null>(null); // 서버에서 받은 인증 코드
  const [isVerified, setIsVerified] = useState(false); // 최종 인증 완료 여부
  const [inputBaekjoonId, setInputBaekjoonId] = useState(""); // 사용자가 직접 입력하는 백준 아이디

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await apiFetch<{
          studentName: string;
          studentNumber: string;
        }>("/student/mypage", {
          method: "GET",
          auth: true,
        });

        if (data) {
          setProfile((prevProfile) => ({
            ...prevProfile,
            name: data.studentName,
            studentId: data.studentNumber,
            // 참고: /api/student/mypage API는 baekjoonId를 반환하지 않으므로,
            // 이 값은 다른 API를 통해 업데이트하거나 로그인 시점에 받아와야 합니다.
          }));
        }
      } catch (err: any) {
        console.error("[fetch user profile failed]", err);
        setProfile({
          name: "오류",
          studentId: "오류",
          baekjoonId: "오류",
        });
      }
    };

    fetchUserProfile();
  }, [navigate]); // 5. useEffect 의존성 배열에 navigate를 추가합니다. (권장사항)

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordForm = () => {
    setIsPasswordFormVisible(!isPasswordFormVisible);
    if (isPasswordFormVisible) {
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    try {
      const { status } = await apiFetch("/students/modify/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawCurrentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          newPasswordConfirm: passwords.confirmPassword,
        }),
      });
      if (status !== 200) {
        throw new Error(`오류가 발생했습니다. 다시 시도해주세요`);
      }

      alert("비밀번호가 성공적으로 변경되었습니다.");
      togglePasswordForm();
    } catch (err: any) {
      console.error("[password change failed]", err);
      alert(`비밀번호 변경 실패: ${err?.message || String(err)}`);
    }
  };

  // 1. 백준 인증 코드 발급 함수
  const handleIssueCode = async () => {
    setIsLoading(true);

    try {
      const { data } = await apiFetch<string>("/students/issue", {
        method: "POST",
        auth: true,
      });

      if (data) {
        setVerificationCode(data);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalVerification = async () => {
    // 이제 profile.baekjoonId 대신 사용자가 입력한 inputBaekjoonId를 확인합니다.
    if (!inputBaekjoonId) {
      alert("백준 아이디를 입력해주세요.");
      return;
    }

    console.log("서버로 전송하는 백준 아이디:", `'${inputBaekjoonId}'`);

    setIsLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    type info = {
      studentNumber: string;
      solvedAcInformationResponse: {
        handle: string;
        solvedCount: number;
        tier: number;
        rating: number;
      };
    };
    try {
      const { status, data } = await apiFetch<info>("/students/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solvedAcNickname: inputBaekjoonId }),
      });

      if (status !== 200)
        throw new Error(
          "인증에 실패했습니다. 아이디와 코드를 다시 확인해주세요."
        );

      // const data = await res.json();
      alert("백준 계정 인증에 성공했습니다!");
      setIsVerified(true);
      setVerificationCode(null);
      if (!data) throw new Error("errolr");

      setProfile((prev) => ({
        ...prev,
        baekjoonId: data.solvedAcInformationResponse.handle,
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 인증 코드 복사 함수
  const handleCopyCode = () => {
    if (verificationCode) {
      navigator.clipboard
        .writeText(verificationCode)
        .then(() => alert("인증 코드가 복사되었습니다!"))
        .catch(() => alert("복사에 실패했습니다."));
    }
  };

  //   const handleVerifyBaekjoon = () => {
  //     alert("백준 인증 기능을 구현할 예정입니다.");
  //   };

  return (
    <main className="login-page" aria-labelledby="mypageTitle">
      <header className="login-hero" aria-hidden="true">
        <Link to="/">
          <div className="brand-dot" aria-hidden="true"></div>
        </Link>
        <h1 id="mypageTitle" className="hero-title">
          마이페이지
        </h1>
      </header>

      <section className="auth-card" aria-label="User profile information">
        <h2 className="card-title">내 프로필</h2>
        <div className="profile-info">
          <div className="field">
            <label className="field-label">이름</label>
            <div className="text-field-display">{profile.name}</div>
          </div>
          <div className="field">
            <label className="field-label">학번</label>
            <div className="text-field-display">{profile.studentId}</div>
          </div>
        </div>

        {isPasswordFormVisible && (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="field">
              <label className="field-label">현재 비밀번호</label>
              <input
                type="password"
                name="currentPassword"
                className="text-field"
                value={passwords.currentPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <div className="field">
              <label className="field-label">새 비밀번호</label>
              <input
                type="password"
                name="newPassword"
                className="text-field"
                value={passwords.newPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <div className="field">
              <label className="field-label">새 비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                className="text-field"
                value={passwords.confirmPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                변경사항 저장
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={togglePasswordForm}
              >
                취소
              </button>
            </div>
          </form>
        )}

        {!isPasswordFormVisible && (
          <button
            className="btn-secondary full-width-btn"
            onClick={togglePasswordForm}
          >
            비밀번호 변경
          </button>
        )}
      </section>

      <section className="auth-card" aria-label="Baekjoon account information">
        <h2 className="card-title">백준 계정</h2>
        <div className="profile-info">
          <div className="field">
            <label className="field-label">백준 아이디</label>
            <div className="text-field-display">
              {profile.baekjoonId || "아직 등록되지 않았습니다."}
            </div>
          </div>
        </div>

        {isVerified ? (
          <button className="btn btn-success full-width-btn" disabled>
            인증 완료
          </button>
        ) : verificationCode ? (
          // ✨ --- 이 부분을 아래 코드로 교체하세요 ---
          <div className="verification-steps">
            <div className="field">
              <label className="field-label">인증할 백준 아이디</label>
              <input
                type="text"
                className="text-field"
                value={inputBaekjoonId}
                onChange={(e) => setInputBaekjoonId(e.target.value)}
                placeholder="solved.ac 닉네임을 입력하세요"
              />
            </div>
            <p className="verification-guide">
              위 아이디의{" "}
              <a
                href="https://solved.ac/settings/profile"
                target="_blank"
                rel="noopener noreferrer"
              >
                solved.ac 프로필
              </a>{" "}
              자기소개(Bio)란에 아래 코드를 붙여넣고 저장해주세요.
            </p>
            <div className="code-box">
              <span className="code-text">{verificationCode}</span>
              <button onClick={handleCopyCode} className="btn-copy">
                복사
              </button>
            </div>
            <button
              className="btn btn-primary full-width-btn"
              onClick={handleFinalVerification}
              disabled={isLoading}
            >
              {isLoading ? "확인 중..." : "인증 완료하기"}
            </button>
          </div>
        ) : (
          // 초기 상태
          <button
            className="btn btn-primary full-width-btn"
            onClick={handleIssueCode}
            disabled={isLoading}
          >
            {isLoading ? "코드 발급 중..." : "인증하기"}
          </button>
        )}
      </section>

      <footer className="login-footer" aria-hidden="true">
        © 2025 AM:PM. All rights reserved.
      </footer>
    </main>
  );
}
