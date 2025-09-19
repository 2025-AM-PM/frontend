import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; //  1. useNavigate 훅을 import 합니다.
import "../styles/mypage.css";

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        navigate('/login'); // 4. 토큰이 없으면 alert 후 로그인 페이지로 이동시킵니다.
        return;
      }

      const ORIGIN = "https://ampm-test.duckdns.org";
      const PROFILE_URL = `${ORIGIN}/api/student/mypage`;

      try {
        const res = await fetch(PROFILE_URL, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("사용자 정보를 불러오는데 실패했습니다.");
        }

        const data = await res.json();
        setProfile(prevProfile => ({
          ...prevProfile,
          name: data.studentName,
          studentId: data.studentNumber,
          // 참고: /api/student/mypage API는 baekjoonId를 반환하지 않으므로, 
          // 이 값은 다른 API를 통해 업데이트하거나 로그인 시점에 받아와야 합니다.
        }));

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


  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      navigate('/login');
      return;
    }
    
    const ORIGIN = "https://ampm-test.duckdns.org";
    const CHANGE_PASSWORD_URL = `${ORIGIN}/api/student/modify/password`; 

    try {
      const res = await fetch(CHANGE_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Authorization": `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({
          rawCurrentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          newPasswordConfirm: passwords.confirmPassword,
        }),
      });

      if (res.status !== 200) {
        const errorData = await res.json().catch(() => ({ message: "알 수 없는 오류 발생" }));
        throw new Error(errorData.message || `HTTP ${res.status} 오류`);
      }

      alert("비밀번호가 성공적으로 변경되었습니다.");
      togglePasswordForm();

    } catch (err: any) {
      console.error("[password change failed]", err);
      alert(`비밀번호 변경 실패: ${err?.message || String(err)}`);
    }
  };

  const handleVerifyBaekjoon = () => {
    alert("백준 인증 기능을 구현할 예정입니다.");
  };

  return (
    <main className="login-page" aria-labelledby="mypageTitle">
      <header className="login-hero" aria-hidden="true">
        <div className="brand-dot" aria-hidden="true"></div>
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
              <button type="button" className="btn btn-secondary" onClick={togglePasswordForm}>
                취소
              </button>
            </div>
          </form>
        )}

        {!isPasswordFormVisible && (
          <button className="btn btn-secondary full-width-btn" onClick={togglePasswordForm}>
            비밀번호 변경
          </button>
        )}
      </section>

      <section className="auth-card" aria-label="Baekjoon account information">
        <h2 className="card-title">백준 계정</h2>
        <div className="profile-info">
          <div className="field">
            <label className="field-label">백준 아이디</label>
            <div className="text-field-display">{profile.baekjoonId}</div>
          </div>
        </div>
        <button className="btn btn-primary full-width-btn" onClick={handleVerifyBaekjoon}>
          인증하기
        </button>
      </section>

      <footer className="login-footer" aria-hidden="true">
        © 2025 AM:PM. All rights reserved.
      </footer>
    </main>
  );
}