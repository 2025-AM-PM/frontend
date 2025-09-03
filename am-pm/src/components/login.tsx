import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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

        <form className="auth-form" noValidate>
          {/* Email */}
          <div className="field">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="학번을 입력해주세요"
              className="text-field"
            />
          </div>

          {/* Password with show/hide only */}
          <div className="field">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="text-field with-icon"
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {/* simple eye / eye-off icon */}
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

          {/* Options row (static) */}
          <div className="options-row">
            <label className="checkbox">
              <input type="checkbox" className="checkbox-input" />
              <span className="checkbox-label">로그인 유지하기</span>
            </label>
            <Link to="#" className="link-muted">
              비밀번호를 분실하셨나요?
            </Link>
          </div>

          {/* Primary button (no submit logic) */}
          <button type="button" className="btn btn-primary">
            Sign in
          </button>

          {/* Create account */}
          <p className="form-hint">
            계정이 없나요?{" "}
            <Link to="#" className="link">
              문의하기
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
