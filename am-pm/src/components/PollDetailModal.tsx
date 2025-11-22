import { useState, useEffect, useCallback } from "react";
import {
  PollDetailResponse,
  PollResultResponse,
  PollVoteRequest,
} from "../types";
import {
  getPollDetail,
  getPollResults,
  votePoll,
  closePoll,
  deletePoll,
} from "../api/client";
// import { useAuth } from "../contexts/userContext";
import "../styles/pollDetailModal.css";
import { useAuthStore } from "../stores/authStore";

interface PollDetailModalProps {
  pollId: number;
  onClose: () => void;
  onPollUpdated?: () => void;
}

function PollDetailModal({
  pollId,
  onClose,
  onPollUpdated,
}: PollDetailModalProps) {
  const user = useAuthStore.getState().user;
  const [poll, setPoll] = useState<PollDetailResponse | null>(null);
  const [results, setResults] = useState<PollResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [voting, setVoting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [maxReachedAnimation, setMaxReachedAnimation] = useState<number | null>(
    null
  );

  const fetchPollDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pollData = await getPollDetail(pollId);
      setPoll(pollData);

      if (pollData.status === "CLOSED") {
        try {
          const resultsData = await getPollResults(pollId);
          setResults(resultsData);
          setShowResults(true);
        } catch (err) {
          console.warn("결과를 가져올 수 없습니다:", err);
        }
      }

      setSelectedOptions(pollData.mySelectedOptionIds || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "투표 정보를 불러올 수 없습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [pollId]); // ← 실제로 쓰는 값만

  useEffect(() => {
    fetchPollDetail();
  }, [fetchPollDetail]);

  const handleOptionSelect = (optionId: number) => {
    if (!poll || poll.status !== "OPEN") return;

    // 이미 투표했지만 재투표가 허용되지 않는 경우
    if (poll.voted && !poll.allowRevote) return;

    if (poll.multiple) {
      // 복수 선택 가능
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
      } else {
        if (selectedOptions.length < poll.maxSelect) {
          setSelectedOptions([...selectedOptions, optionId]);
        } else {
          // 최대 선택 수에 도달했을 때 애니메이션
          setMaxReachedAnimation(optionId);
          setTimeout(() => setMaxReachedAnimation(null), 600);
        }
      }
    } else {
      // 단일 선택
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (!poll || selectedOptions.length === 0) return;

    try {
      setVoting(true);
      const voteData: PollVoteRequest = {
        optionIds: selectedOptions,
      };

      await votePoll(pollId, voteData);

      // 투표 후 데이터 새로고침
      await fetchPollDetail();
      onPollUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "투표에 실패했습니다.");
    } finally {
      setVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!poll || poll.status !== "OPEN") return;

    if (!window.confirm("정말로 이 투표를 종료하시겠습니까?")) {
      return;
    }

    try {
      setClosing(true);
      await closePoll(pollId);
      await fetchPollDetail();
      onPollUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "투표 종료에 실패했습니다."
      );
    } finally {
      setClosing(false);
    }
  };

  const handleDeletePoll = async () => {
    if (!poll) return;

    if (
      !window.confirm(
        "정말로 이 투표를 삭제하시겠습니까?\n삭제된 투표는 복구할 수 없습니다."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await deletePoll(pollId);
      onPollUpdated?.();
      onClose(); // 삭제 후 모달 닫기
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "투표 삭제에 실패했습니다."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleShowResults = async () => {
    if (!poll) return;

    try {
      if (!results) {
        const resultsData = await getPollResults(pollId);
        setResults(resultsData);
      }
      setShowResults(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "결과를 불러올 수 없습니다."
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("ko-KR") +
      " " +
      date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getResultVisibilityText = (visibility: string) => {
    switch (visibility) {
      case "ALWAYS":
        return "항상 공개";
      case "AFTER_CLOSE":
        return "종료 후 공개";
      case "AUTHENTICATED":
        return "로그인 사용자만";
      case "ADMIN_ONLY":
        return "관리자만";
      default:
        return visibility;
    }
  };

  const canShowResults = () => {
    if (!poll) return false;

    switch (poll.resultVisibility) {
      case "ALWAYS":
        return true;
      case "AFTER_CLOSE":
        return poll.status === "CLOSED";
      case "AUTHENTICATED":
        return !!user;
      case "ADMIN_ONLY":
        return poll.createdBy === user?.studentId; // 투표 생성자만
      default:
        return false;
    }
  };

  const getOptionPercentage = (optionId: number) => {
    if (!results) return 0;

    const totalVotes = results.options.reduce((sum, opt) => sum + opt.count, 0);
    const option = results.options.find((opt) => opt.id === optionId);

    if (!option || totalVotes === 0) return 0;
    return (option.count / totalVotes) * 100;
  };

  const getOptionCount = (optionId: number) => {
    if (!results) return 0;
    const option = results.options.find((opt) => opt.id === optionId);
    return option?.count || 0;
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">
            <div className="spinner large"></div>
            <p>투표 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-error">
            <h3>오류 발생</h3>
            <p>{error || "투표 정보를 찾을 수 없습니다."}</p>
            <button className="button secondary" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content poll-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{poll.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* 핵심 투표 정보 */}
          <div className="poll-main-info">
            <div className="poll-status-header">
              <span className={`status-badge ${poll.status.toLowerCase()}`}>
                {poll.status === "OPEN" ? "진행중" : "종료됨"}
              </span>
              <div className="poll-deadline">
                <strong>마감: {formatDate(poll.deadlineAt)}</strong>
              </div>
            </div>

            {poll.description && (
              <div className="poll-description">
                <p>{poll.description}</p>
              </div>
            )}

            {/* 사용자에게 중요한 설정만 표시 */}
            <div className="poll-key-settings">
              {poll.maxSelect > 1 && (
                <span className="key-setting">
                  최대 {poll.maxSelect}개 선택 가능
                </span>
              )}
              {poll.anonymous && (
                <span className="key-setting anonymous">익명 투표</span>
              )}
              {poll.allowRevote && (
                <span className="key-setting revote">재투표 가능</span>
              )}
            </div>

            {/* 상세 정보 */}
            <div className="poll-advanced-info">
              <div className="advanced-info-grid">
                <div className="info-item">
                  <span className="info-label">생성일</span>
                  <span className="info-value">
                    {formatDate(poll.createdAt)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">복수 선택</span>
                  <span className="info-value">
                    {poll.multiple ? "가능" : "불가능"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">옵션 추가</span>
                  <span className="info-value">
                    {poll.allowAddOption ? "가능" : "불가능"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">결과 공개</span>
                  <span className="info-value">
                    {getResultVisibilityText(poll.resultVisibility)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 투표 옵션 */}
          <div className="poll-options-section">
            <div className="options-header">
              <h3>투표 옵션</h3>
              {!user && poll.status === "OPEN" && (
                <div className="login-notice">
                  💡 투표하려면 로그인이 필요합니다
                </div>
              )}
            </div>

            {showResults && results ? (
              // 결과 보기 모드
              <div className="poll-results">
                {poll.options.map((option) => {
                  const percentage = getOptionPercentage(option.id);
                  const count = getOptionCount(option.id);
                  const isSelected = (poll.mySelectedOptionIds || []).includes(
                    option.id
                  );

                  return (
                    <div
                      key={option.id}
                      className={`option-result ${
                        isSelected ? "selected" : ""
                      }`}
                    >
                      <div className="option-label">
                        <span className="option-text">{option.label}</span>
                        <span className="option-stats">
                          {count}표 ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="option-bar">
                        <div
                          className="option-progress"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      {!poll.anonymous && (
                        <div className="option-voters">
                          {results.options
                            .find((opt) => opt.id === option.id)
                            ?.voters.map((voter) => (
                              <span
                                key={voter.studentId}
                                className="voter-name"
                              >
                                {voter.studentName}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // 투표하기 모드
              <div className="poll-voting">
                {poll.options.map((option) => (
                  <label
                    key={option.id}
                    className={`option-item ${
                      selectedOptions.includes(option.id) ? "selected" : ""
                    } ${
                      poll.status !== "OPEN" ||
                      !user ||
                      (poll.voted && !poll.allowRevote)
                        ? "disabled"
                        : ""
                    } ${
                      maxReachedAnimation === option.id ? "max-reached" : ""
                    }`}
                  >
                    <input
                      type={poll.multiple ? "checkbox" : "radio"}
                      name="poll-option"
                      value={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionSelect(option.id)}
                      disabled={
                        poll.status !== "OPEN" ||
                        !user ||
                        (poll.voted && !poll.allowRevote)
                      }
                    />
                    <span className="option-label">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          {/* 왼쪽: 관리 버튼들 (투표 생성자만) */}
          <div className="button-group left-buttons">
            {/* 투표 종료 버튼 */}
            {poll.status === "OPEN" && poll.createdBy === user?.studentId && (
              <button
                className="button warning"
                onClick={handleClosePoll}
                disabled={closing}
              >
                {closing ? "종료 중..." : "투표 종료"}
              </button>
            )}

            {/* 투표 삭제 버튼 */}
            {poll.createdBy === user?.studentId && (
              <button
                className="button danger"
                onClick={handleDeletePoll}
                disabled={deleting}
              >
                {deleting ? "삭제 중..." : "투표 삭제"}
              </button>
            )}
          </div>

          {/* 오른쪽: 주요 액션 버튼들 */}
          <div className="button-group right-buttons">
            <button className="button secondary" onClick={onClose}>
              닫기
            </button>

            {/* 결과 보기/숨기기 버튼 */}
            {canShowResults() && (
              <button
                className="button tertiary"
                onClick={
                  showResults ? () => setShowResults(false) : handleShowResults
                }
              >
                {showResults ? "투표하기" : "결과보기"}
              </button>
            )}

            {/* 투표 버튼 */}
            {!showResults &&
              poll.status === "OPEN" &&
              user &&
              (!poll.voted || poll.allowRevote) && (
                <button
                  className="button primary"
                  onClick={handleVote}
                  disabled={selectedOptions.length === 0 || voting}
                >
                  {voting
                    ? poll.voted
                      ? "재투표 중..."
                      : "투표 중..."
                    : poll.voted
                    ? "재투표하기"
                    : "투표하기"}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PollDetailModal;
