import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { register } from "../api/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [studentNumber, setStudentNumber] = useState("");
  const [studentPassword, setPassword] = useState("");
  const [reStudentPassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!checkPassword(studentPassword, reStudentPassword)) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      setErr(null);

      console.log("회원가입 요청:", { studentName, studentNumber });

      const status = await register({
        studentName,
        studentNumber,
        studentPassword,
      });

      console.log("회원가입 응답 상태:", status);

      if (status === 200 || status === 201) {
        alert("신청 완료되었습니다. 관리자의 승인이 필요합니다.");
        // 강제 페이지 이동 (히스토리 교체)
        window.location.replace("/");
        return;
      }

      console.log("회원가입 실패 - 예상치 못한 상태 코드:", status);
      setErr(`회원가입 실패 (상태 코드: ${status})`);
    } catch (e: any) {
      console.error("회원가입 에러:", e);
      if (e?.status === 500) {
        alert("이미 가입된 사용자입니다. 관리자에게 문의하세요");
      } else if (e?.status === 400) {
        alert("입력 정보를 다시 확인해주세요.");
      } else {
        setErr(e?.message || `회원가입 실패 (${e?.status || '알 수 없는 오류'})`);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkPassword = (password: string, rePassowrd: string) => {
    return password === rePassowrd;
  };

  return (
    <main className="login-page" aria-labelledby="loginTitle">
      {/* Header */}
      <header className="login-hero" aria-hidden="true">
        <div className="brand-dot" aria-hidden="true"></div>
        <h1 id="loginTitle" className="hero-title">
          회원가입하기
        </h1>
        <p className="hero-sub">계속하려면 회원가입을 해주세요.</p>
      </header>

      {/* Card */}
      <section className="auth-card" aria-label="Sign in form">
        <h2 className="card-title">회원가입</h2>
        <p className="card-sub">학번, 비밀번호, 이름을 입력해주세요</p>

        <form className="auth-form" noValidate onSubmit={onSubmit}>
          {/* 학번 */}
          <div className="field">
            <label htmlFor="email" className="field-label">
              학번
            </label>
            <input
              id="email"
              type="text"
              autoComplete="name"
              placeholder="학번을 입력해주세요"
              className="text-field"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.currentTarget.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="name" className="field-label">
              이름
            </label>
            <input
              id="name"
              type="name"
              autoComplete="email"
              placeholder="이름을 입력해주세요"
              className="text-field"
              value={studentName}
              onChange={(e) => setStudentName(e.currentTarget.value)}
            />
          </div>

          {/* Password with show/hide only */}
          <div className="field">
            <label htmlFor="password" className="field-label">
              비밀번호
            </label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="text-field with-icon"
                value={studentPassword}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                className="icon-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                      fill="currentColor"
                    />
                    <path
                      d="M4 20 20 4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">
              비밀번호 재입력
            </label>
            <div className="password-wrap">
              <input
                id="password"
                type={showRePassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="text-field with-icon"
                value={reStudentPassword}
                onChange={(e) => setRePassword(e.currentTarget.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                className="icon-btn"
                aria-label={showRePassword ? "Hide password" : "Show password"}
                aria-pressed={showRePassword}
                onClick={() => setShowRePassword((v) => !v)}
              >
                {showRePassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                      fill="currentColor"
                    />
                    <path
                      d="M4 20 20 4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary">
            회원가입 신청
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="login-footer" aria-hidden="true">
        © 2025 AM:PM. All rights reserved.
      </footer>
    </main>
  );
}
