import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";
import { User } from "../types";
import { login } from "../api/auth";

export default function LoginPage({
  onSuccess,
}: {
  onSuccess: (u: User) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  // ⬇️ 폼 상태 (간단)
  const [studentNumber, setStudentNumber] = useState("");
  const [studentPassword, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErr(null);
    try {
      const u = await login({ studentNumber, studentPassword });
      onSuccess(u);
    } catch (e: any) {
      setErr(e.message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" aria-labelledby="loginTitle">
      {/* Header */}
      <header className="login-hero" aria-hidden="true">
        <div className="brand-dot" aria-hidden="true"></div>
        <h1 id="loginTitle" className="hero-title">
          로그인하기
        </h1>
        <p className="hero-sub">계속하려면 로그인을 해주세요.</p>
      </header>

      {/* Card */}
      <section className="auth-card" aria-label="Sign in form">
        <h2 className="card-title">로그인</h2>
        <p className="card-sub">학번과 비밀번호 입력해주세요</p>

        <form className="auth-form" noValidate onSubmit={onSubmit}>
          {/* Email */}
          <div className="field">
            <label htmlFor="email" className="field-label">
              학번
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="학번을 입력해주세요"
              className="text-field"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.currentTarget.value)}
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

          {/* Options row */}
          <div className="options-row">
            <Link to="#" className="link-muted">
              비밀번호를 분실하셨나요?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary">
            로그인
          </button>

          {/* Create account */}
          <p className="form-hint">
            계정이 없나요?{" "}
            <Link to="/register" className="link">
              회원가입
            </Link>
          </p>
        </form>
      </section>

      {/* Footer */}
      <footer className="login-footer" aria-hidden="true">
        © 2025 AM:PM. All rights reserved.
      </footer>
    </main>
  );
}
