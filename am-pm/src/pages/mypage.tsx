import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import "../styles/mypage.css";
import { apiFetch } from "../api/client";
import { useAuthStore } from "../stores/authStore";

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type BaekjoonFormValues = {
  baekjoonId: string;
};

type StudentInfoResponse = {
  studentNumber: string;
  solvedAcInformationResponse: {
    handle: string;
    solvedCount: number;
    tier: number;
    rating: number;
  };
};

export default function Mypage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isIssuingCode, setIsIssuingCode] = useState(false);

  // 비밀번호 변경 폼 (RHF)
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // 백준 인증 폼 (RHF)
  const {
    register: registerBaekjoon,
    handleSubmit: handleBaekjoonSubmit,
    formState: { errors: baekjoonErrors, isSubmitting: isBaekjoonSubmitting },
  } = useForm<BaekjoonFormValues>({
    defaultValues: { baekjoonId: "" },
  });

  const togglePasswordForm = () => {
    setIsPasswordFormVisible((prev) => !prev);
    if (isPasswordFormVisible) {
      resetPasswordForm();
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

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
          rawCurrentPassword: values.currentPassword,
          newPassword: values.newPassword,
          newPasswordConfirm: values.confirmPassword,
        }),
        auth: true,
      });

      if (status !== 200) {
        throw new Error("오류가 발생했습니다. 다시 시도해주세요");
      }

      alert("비밀번호가 성공적으로 변경되었습니다.");
      togglePasswordForm();
    } catch (err: any) {
      console.error("[password change failed]", err);
      alert(`비밀번호 변경 실패: ${err?.message || String(err)}`);
    }
  };

  // 백준 인증 코드 발급
  const handleIssueCode = async () => {
    setIsIssuingCode(true);

    try {
      const res = await apiFetch<string>("/students/issue", {
        method: "POST",
        auth: true,
      });

      if (res.status === 200) {
        setVerificationCode(res?.data);
        console.log("[setVerificationCode]", res.data);
      }
    } catch (err: any) {
      console.error("[issue code failed]", err);
      alert(err?.message || "인증 코드 발급에 실패했습니다.");
    } finally {
      setIsIssuingCode(false);
    }
  };

  // 백준 최종 인증
  const handleFinalVerification = async ({
    baekjoonId,
  }: BaekjoonFormValues) => {
    if (!baekjoonId) {
      alert("백준 아이디를 입력해주세요.");
      return;
    }

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    console.log("서버로 전송하는 백준 아이디:", `'${baekjoonId}'`);

    try {
      const { status, data } = await apiFetch<StudentInfoResponse>(
        "/students/info",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solvedAcNickname: baekjoonId }),
          auth: true,
        }
      );

      if (status !== 200) {
        throw new Error(
          "인증에 실패했습니다. 아이디와 코드를 다시 확인해주세요."
        );
      }

      if (!data) {
        throw new Error("서버 응답이 올바르지 않습니다.");
      }

      alert("백준 계정 인증에 성공했습니다!");
      setIsVerified(true);

      setVerificationCode(null);
      // 필요하다면 여기에 user store 갱신 로직 추가 가능
    } catch (err: any) {
      console.error("[baekjoon verify failed]", err);
      alert(err?.message || "백준 계정 인증에 실패했습니다.");
    }
  };

  const handleCopyCode = () => {
    if (!verificationCode) return;

    navigator.clipboard
      .writeText(verificationCode)
      .then(() => alert("인증 코드가 복사되었습니다!"))
      .catch(() => alert("복사에 실패했습니다."));
  };

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

      {/* 프로필 영역 */}
      <section className="auth-card" aria-label="User profile information">
        <h2 className="card-title">내 프로필</h2>
        <div className="profile-info">
          <div className="field">
            <label className="field-label">이름</label>
            <div className="text-field-display">{user?.studentName}</div>
          </div>
          <div className="field">
            <label className="field-label">학번</label>
            <div className="text-field-display">{user?.studentId}</div>
          </div>
        </div>

        {isPasswordFormVisible && (
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="password-form"
          >
            <div className="field">
              <label className="field-label">현재 비밀번호</label>
              <input
                type="password"
                className="text-field"
                {...registerPassword("currentPassword", {
                  required: "현재 비밀번호를 입력해주세요.",
                })}
              />
              {passwordErrors.currentPassword && (
                <p className="error-message">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="field">
              <label className="field-label">새 비밀번호</label>
              <input
                type="password"
                className="text-field"
                {...registerPassword("newPassword", {
                  required: "새 비밀번호를 입력해주세요.",
                  maxLength: {
                    value: 12,
                    message: "최대 12자까지 입력 가능합니다.",
                  },
                  minLength: {
                    value: 8,
                    message: "최소 8자 이상 입력해주세요.",
                  },
                  pattern: {
                    // 특수문자가 반드시 포함되어야 한다는 패턴 정규식으로 작성
                    value: /^(?=.*[!@#$%^&*()_+\-=\]{};':"\\|,.<>?]).*$/,
                    message: "특수문자를 포함해야 합니다.",
                  },
                })}
              />
              {passwordErrors.newPassword && (
                <p className="error-message">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div className="field">
              <label className="field-label">새 비밀번호 확인</label>
              <input
                type="password"
                className="text-field"
                {...registerPassword("confirmPassword", {
                  required: "새 비밀번호를 다시 입력해주세요.",
                })}
              />
              {passwordErrors.confirmPassword && (
                <p className="error-message">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isPasswordSubmitting}
              >
                {isPasswordSubmitting ? "변경 중..." : "변경사항 저장"}
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

      {/* 백준 계정 영역 */}
      <section className="auth-card" aria-label="Baekjoon account information">
        <h2 className="card-title">백준 계정</h2>
        <div className="profile-info">
          <div className="field">
            <div className="text-field-display">
              {user?.studentTier || "아직 등록되지 않았습니다."}
            </div>
          </div>
        </div>

        {isVerified ? (
          <button className="btn btn-success full-width-btn" disabled>
            인증 완료
          </button>
        ) : verificationCode ? (
          // 인증 코드 발급 이후 UI
          <form
            className="verification-steps"
            onSubmit={handleBaekjoonSubmit(handleFinalVerification)}
          >
            <div className="field">
              <label className="field-label">인증할 백준 아이디</label>
              <input
                type="text"
                className="text-field"
                placeholder="solved.ac 닉네임을 입력하세요"
                {...registerBaekjoon("baekjoonId", {
                  required: "solved.ac 닉네임을 입력해주세요.",
                })}
              />
              {baekjoonErrors.baekjoonId && (
                <p className="error-message">
                  {baekjoonErrors.baekjoonId.message}
                </p>
              )}
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
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn-copy"
              >
                복사
              </button>
            </div>
            <button
              type="submit"
              className="btn btn-primary full-width-btn"
              disabled={isBaekjoonSubmitting}
            >
              {isBaekjoonSubmitting ? "확인 중..." : "인증 완료하기"}
            </button>
          </form>
        ) : (
          // 초기 상태: 인증하기 버튼
          <button
            className="btn btn-primary full-width-btn"
            onClick={handleIssueCode}
            disabled={isIssuingCode}
          >
            {isIssuingCode ? "코드 발급 중..." : "인증하기"}
          </button>
        )}
      </section>

      <footer className="login-footer" aria-hidden="true">
        © 2025 AM:PM. All rights reserved.
      </footer>
    </main>
  );
}
