import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PollCreateRequest } from "../types";
import { createPoll } from "../api/client";
// import { useAuth } from "../contexts/userContext";
import "../styles/poll-create.css";
import { useAuthStore } from "../stores/authStore";

function PollCreate() {
  const navigate = useNavigate();
  const user = useAuthStore.getState().user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태들
  // 현재 날짜시간을 기본값으로 설정 (1주일 후)
  const getDefaultDeadline = () => {
    const now = new Date();
    now.setDate(now.getDate() + 7); // 7일 후
    now.setHours(23, 59, 0, 0); // 23:59로 설정
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM 형식
  };

  const [formData, setFormData] = useState<PollCreateRequest>({
    title: "",
    description: "",
    maxSelect: 1,
    multiple: false,
    anonymous: false,
    allowAddOption: false,
    allowRevote: false,
    resultVisibility: "ALWAYS",
    deadlineAt: getDefaultDeadline(),
    options: ["", ""],
  });

  // 로그인 상태 확인
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // 폼 데이터 업데이트
  const updateFormData = (field: keyof PollCreateRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 옵션 추가
  const addOption = () => {
    if (formData.options.length < 50) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  // 옵션 제거
  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  // 옵션 업데이트
  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  // 폼 검증
  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return "투표 제목을 입력해주세요.";
    }
    if (formData.title.length > 200) {
      return "투표 제목은 200자를 초과할 수 없습니다.";
    }
    if (formData.description && formData.description.length > 2000) {
      return "투표 설명은 2000자를 초과할 수 없습니다.";
    }
    if (!formData.deadlineAt) {
      return "마감일시를 선택해주세요.";
    }
    if (new Date(formData.deadlineAt) <= new Date()) {
      return "마감일시는 현재 시간보다 이후여야 합니다.";
    }

    const nonEmptyOptions = formData.options.filter((opt) => opt.trim());
    if (nonEmptyOptions.length < 2) {
      return "최소 2개의 투표 옵션을 입력해주세요.";
    }

    // 옵션별 길이 검증
    for (let i = 0; i < formData.options.length; i++) {
      const option = formData.options[i];
      if (option && option.length > 200) {
        return `투표 옵션 ${i + 1}은 200자를 초과할 수 없습니다.`;
      }
    }

    // 복수 선택과 maxSelect 검증
    if (formData.multiple && formData.maxSelect > nonEmptyOptions.length) {
      return "최대 선택 개수는 투표 옵션 개수보다 클 수 없습니다.";
    }

    return null;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 빈 옵션 제거
      const cleanedData = {
        ...formData,
        options: formData.options.filter((opt) => opt.trim()),
      };

      await createPoll(cleanedData);

      // 투표 목록 페이지로 이동
      navigate("/polls");
    } catch (err) {
      console.error("투표 생성 오류:", err);
      if (err instanceof Error) {
        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          setError("로그인이 필요합니다. 다시 로그인해 주세요.");
          navigate("/login");
        } else if (err.message.includes("500")) {
          setError(
            "서버 오류가 발생했습니다. 로그인 상태를 확인하고 다시 시도해 주세요."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("투표 생성에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그인하지 않은 사용자 처리
  if (!user) {
    return (
      <div className="poll-create-container">
        <div className="poll-loading">로그인 페이지로 이동 중...</div>
      </div>
    );
  }

  return (
    <div className="poll-create-container">
      <div className="poll-create-header">
        <h1>새 투표 만들기</h1>
        <button
          className="back-button"
          onClick={() => navigate("/polls")}
          type="button"
        >
          ← 투표 목록으로
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="poll-create-form">
        {/* 기본 정보 */}
        <div className="form-section">
          <h2>📝 기본 정보</h2>

          <div className="form-group">
            <label htmlFor="title">투표 제목 *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              placeholder="투표 제목을 입력하세요"
              maxLength={200}
              required
            />
            <small>{formData.title.length}/200</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">투표 설명</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="투표에 대한 자세한 설명을 입력하세요 (선택사항)"
              maxLength={2000}
              rows={4}
            />
            <small>{formData.description?.length || 0}/2000</small>
          </div>

          <div className="form-group">
            <label>마감일시 *</label>
            <div className="deadline-picker">
              <div className="date-section">
                <label htmlFor="deadline-date" className="sub-label">
                  날짜
                </label>
                <input
                  type="date"
                  id="deadline-date"
                  value={formData.deadlineAt.split("T")[0]}
                  onChange={(e) => {
                    const time = formData.deadlineAt.split("T")[1] || "23:59";
                    updateFormData("deadlineAt", `${e.target.value}T${time}`);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="time-section">
                <label htmlFor="deadline-time" className="sub-label">
                  시간
                </label>
                <input
                  type="time"
                  id="deadline-time"
                  value={formData.deadlineAt.split("T")[1] || "23:59"}
                  onChange={(e) => {
                    const date =
                      formData.deadlineAt.split("T")[0] ||
                      new Date().toISOString().split("T")[0];
                    updateFormData("deadlineAt", `${date}T${e.target.value}`);
                  }}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* 투표 옵션 */}
        <div className="form-section">
          <h2>🗳️ 투표 옵션</h2>

          {formData.options.map((option, index) => (
            <div key={index} className="option-group">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`옵션 ${index + 1}`}
                maxLength={200}
              />
              <small>{option.length}/200</small>
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="remove-option-btn"
                  aria-label="옵션 제거"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="add-option-btn"
            disabled={formData.options.length >= 50}
          >
            + 옵션 추가
          </button>

          <small>최소 2개, 최대 50개의 옵션을 만들 수 있습니다.</small>
        </div>

        {/* 투표 설정 */}
        <div className="form-section">
          <h2>⚙️ 투표 설정</h2>

          <div className="checkbox-group">
            <label>
              <span>복수 선택 허용</span>
              <input
                type="checkbox"
                checked={formData.multiple}
                onChange={(e) => updateFormData("multiple", e.target.checked)}
              />
              <div className="toggle-switch"></div>
            </label>
            <small>여러 옵션을 동시에 선택할 수 있도록 허용</small>
          </div>

          {formData.multiple && (
            <div className="form-group conditional-input">
              <label htmlFor="maxSelect">최대 선택 개수</label>
              <input
                type="number"
                id="maxSelect"
                value={formData.maxSelect}
                onChange={(e) =>
                  updateFormData("maxSelect", parseInt(e.target.value) || 1)
                }
                min={1}
                max={Math.min(
                  10,
                  formData.options.filter((opt) => opt.trim()).length || 1
                )}
              />
              <small>사용자가 선택할 수 있는 최대 옵션 개수</small>
            </div>
          )}

          <div className="checkbox-group">
            <label>
              <span>익명 투표</span>
              <input
                type="checkbox"
                checked={formData.anonymous}
                onChange={(e) => updateFormData("anonymous", e.target.checked)}
              />
              <div className="toggle-switch"></div>
            </label>
            <small>투표자의 이름을 공개하지 않음</small>
          </div>

          <div className="checkbox-group">
            <label>
              <span>옵션 추가 허용</span>
              <input
                type="checkbox"
                checked={formData.allowAddOption}
                onChange={(e) =>
                  updateFormData("allowAddOption", e.target.checked)
                }
              />
              <div className="toggle-switch"></div>
            </label>
            <small>투표자가 새로운 옵션을 추가할 수 있도록 허용</small>
          </div>

          <div className="checkbox-group">
            <label>
              <span>재투표 허용</span>
              <input
                type="checkbox"
                checked={formData.allowRevote}
                onChange={(e) =>
                  updateFormData("allowRevote", e.target.checked)
                }
              />
              <div className="toggle-switch"></div>
            </label>
            <small>투표자가 투표를 변경할 수 있도록 허용</small>
          </div>

          <div className="form-group">
            <label htmlFor="resultVisibility">결과 공개 설정</label>
            <select
              id="resultVisibility"
              value={formData.resultVisibility}
              onChange={(e) =>
                updateFormData("resultVisibility", e.target.value as any)
              }
            >
              <option value="ALWAYS">항상 공개</option>
              <option value="AFTER_CLOSE">마감 후 공개</option>
              <option value="AUTHENTICATED">로그인 사용자만</option>
              <option value="ADMIN_ONLY">관리자만</option>
            </select>
            <small>투표 결과를 언제 공개할지 설정</small>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/polls")}
            className="cancel-button"
            disabled={loading}
          >
            취소
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading && <span className="loading-spinner"></span>}
            {loading ? "투표 생성 중..." : "🚀 투표 만들기"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PollCreate;
