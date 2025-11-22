// RegisterPage.tsx
import { useState } from "react";
import {
  Form,
  useSubmit,
  useNavigation,
  useActionData,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import "../styles/login.css";
import { koreanToEng } from "../lib/koreantoEng";

type RegisterFormValues = {
  studentNumber: string;
  studentName: string;
  studentPassword: string;
  reStudentPassword: string;
};

type ActionData = {
  error?: string;
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    mode: "onSubmit",
  });

  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  const isSubmitting = navigation.state === "submitting";

  const onValid = (data: RegisterFormValues) => {
    const normalizedPassword = koreanToEng(data.studentPassword);
    const normalizedRePassword = koreanToEng(data.reStudentPassword);

    const formData = new FormData();
    formData.append("studentNumber", data.studentNumber);
    formData.append("studentName", data.studentName);
    formData.append("studentPassword", normalizedPassword);
    formData.append("reStudentPassword", normalizedRePassword);

    // RHF 유효성 검사를 통과한 경우에만 router action으로 전송
    submit(formData, { method: "post" });
  };

  const passwordValue = watch("studentPassword");

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

        {/* RHF + Router Form */}
        <Form
          className="auth-form"
          method="post"
          noValidate
          onSubmit={handleSubmit(onValid)}
        >
          {/* 학번 */}
          <div className="field">
            <label htmlFor="studentNumber" className="field-label">
              학번
            </label>
            <input
              id="studentNumber"
              type="text"
              autoComplete="username"
              placeholder="학번을 입력해주세요"
              className="text-field"
              {...register("studentNumber", {
                required: "학번을 입력해주세요.",
              })}
            />
            {errors.studentNumber && (
              <p className="field-error">{errors.studentNumber.message}</p>
            )}
          </div>

          {/* 이름 */}
          <div className="field">
            <label htmlFor="studentName" className="field-label">
              이름
            </label>
            <input
              id="studentName"
              type="text"
              autoComplete="name"
              placeholder="이름을 입력해주세요"
              className="text-field"
              {...register("studentName", {
                required: "이름을 입력해주세요.",
              })}
            />
            {errors.studentName && (
              <p className="field-error">{errors.studentName.message}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="field">
            <label htmlFor="studentPassword" className="field-label">
              비밀번호
            </label>
            <div className="password-wrap">
              <input
                id="studentPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="text-field with-icon"
                {...register("studentPassword", {
                  required: "비밀번호를 입력해주세요.",
                  minLength: {
                    value: 8,
                    message: "비밀번호는 8자 이상이어야 합니다.",
                  },
                })}
                onChange={(e) => {
                  const raw = e.target.value;
                  const normalized = koreanToEng(raw);
                  setValue("studentPassword", normalized, {
                    shouldValidate: true,
                  });
                }}
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
            {errors.studentPassword && (
              <p className="field-error">{errors.studentPassword.message}</p>
            )}
          </div>

          {/* 비밀번호 재입력 */}
          <div className="field">
            <label htmlFor="reStudentPassword" className="field-label">
              비밀번호 재입력
            </label>
            <div className="password-wrap">
              <input
                id="reStudentPassword"
                type={showRePassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="text-field with-icon"
                {...register("reStudentPassword", {
                  required: "비밀번호를 다시 입력해주세요.",
                  validate: (value) =>
                    koreanToEng(value) === koreanToEng(passwordValue) ||
                    "비밀번호가 일치하지 않습니다.",
                })}
                onChange={(e) => {
                  const raw = e.target.value;
                  const normalized = koreanToEng(raw);
                  setValue("reStudentPassword", normalized, {
                    shouldValidate: true,
                  });
                }}
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
            {errors.reStudentPassword && (
              <p className="field-error">{errors.reStudentPassword.message}</p>
            )}
          </div>

          {/* 서버 공통 에러 (라우팅 action에서 내려준 에러) */}
          {actionData?.error && (
            <p className="form-error" role="alert">
              {actionData.error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "회원가입 신청 중..." : "회원가입 신청"}
          </button>
        </Form>
      </section>

      {/* Footer */}
      <footer className="login-footer" aria-hidden="true">
        © 2025 AM:PM. All rights reserved.
      </footer>
    </main>
  );
}
