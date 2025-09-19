import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PollSummaryResponse,
  PagePollSummaryResponse,
  PollSearchParam,
} from "../types";
import { getPolls } from "../api/client";
import { useAuth } from "../contexts/userContext";
import "../styles/poll.css";

function Poll() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [polls, setPolls] = useState<PollSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "CLOSED" | "">("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 추가된 필터 상태들
  const [sortBy, setSortBy] = useState<string>("createdAt,DESC");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [attributeFilters, setAttributeFilters] = useState<{
    multiple: boolean | null;
    anonymous: boolean | null;
    allowAddOption: boolean | null;
    allowRevote: boolean | null;
  }>({
    multiple: null,
    anonymous: null,
    allowAddOption: null,
    allowRevote: null,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const searchParams: PollSearchParam = {};

      if (searchQuery.trim()) {
        searchParams.query = searchQuery.trim();
      }
      if (statusFilter) {
        searchParams.status = statusFilter;
      }

      // 날짜 필터링
      if (dateFilter) {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        switch (dateFilter) {
          case "today":
            searchParams.deadlineFrom = today.toISOString();
            break;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            searchParams.deadlineFrom = weekAgo.toISOString();
            break;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            searchParams.deadlineFrom = monthAgo.toISOString();
            break;
        }
      }

      const pageableParams: { page: number; size: number; sort?: string[] } = {
        page: currentPage,
        size: 10,
      };

      // 정렬 옵션 적용
      pageableParams.sort = [sortBy];

      const response = await getPolls(searchParams, pageableParams);

      // API에서 받은 데이터를 속성 필터로 추가 필터링
      const filteredPolls = filterPollsByAttributes(response.content);
      setPolls(filteredPolls);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "투표 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [currentPage, statusFilter, sortBy, dateFilter, attributeFilters]);

  // 실시간 검색을 위한 debounced effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(0);
        fetchPolls();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchPolls();
  };

  const handleStatusChange = (status: "OPEN" | "CLOSED" | "") => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(0);
  };

  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    setCurrentPage(0);
  };

  const handleAttributeFilterChange = (
    attribute: keyof typeof attributeFilters,
    value: boolean | null
  ) => {
    setAttributeFilters((prev) => ({
      ...prev,
      [attribute]: value,
    }));
    setCurrentPage(0);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFilter("");
    setSortBy("createdAt,DESC");
    setAttributeFilters({
      multiple: null,
      anonymous: null,
      allowAddOption: null,
      allowRevote: null,
    });
    setCurrentPage(0);
  };

  // 로컬 필터링 함수 (API 필터링 후 클라이언트 사이드에서 추가 필터링)
  const filterPollsByAttributes = (polls: PollSummaryResponse[]) => {
    return polls.filter((poll) => {
      if (
        attributeFilters.multiple !== null &&
        poll.multiple !== attributeFilters.multiple
      )
        return false;
      if (
        attributeFilters.anonymous !== null &&
        poll.anonymous !== attributeFilters.anonymous
      )
        return false;
      if (
        attributeFilters.allowAddOption !== null &&
        poll.allowAddOption !== attributeFilters.allowAddOption
      )
        return false;
      if (
        attributeFilters.allowRevote !== null &&
        poll.allowRevote !== attributeFilters.allowRevote
      )
        return false;
      return true;
    });
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

  const getStatusBadge = (status: string) => {
    return (
      <span className={`status-badge ${status.toLowerCase()}`}>
        {status === "OPEN" ? "진행중" : "종료됨"}
      </span>
    );
  };

  if (loading) {
    return <div className="poll-loading">투표 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="poll-error">오류: {error}</div>;
  }

  return (
    <div className="poll-container">
      <div className="poll-header">
        <div className="header-top">
          <h1>투표 목록</h1>
          {user && (
            <button
              className="create-poll-btn"
              onClick={() => navigate("/polls/create")}
            >
              + 새 투표 만들기
            </button>
          )}
        </div>

        {/* 기본 검색 및 필터 */}
        <div className="poll-filters">
          <div className="search-form">
            <input
              type="text"
              placeholder="투표 제목 검색... (실시간 검색)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-row">
            <div className="status-filters">
              <label className="filter-label">상태:</label>
              <button
                className={`filter-button ${
                  statusFilter === "" ? "active" : ""
                }`}
                onClick={() => handleStatusChange("")}
              >
                전체
              </button>
              <button
                className={`filter-button ${
                  statusFilter === "OPEN" ? "active" : ""
                }`}
                onClick={() => handleStatusChange("OPEN")}
              >
                진행중
              </button>
              <button
                className={`filter-button ${
                  statusFilter === "CLOSED" ? "active" : ""
                }`}
                onClick={() => handleStatusChange("CLOSED")}
              >
                종료됨
              </button>
            </div>

            <div className="sort-filters">
              <label className="filter-label">정렬:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="createdAt,DESC">최신순</option>
                <option value="createdAt,ASC">오래된순</option>
                <option value="deadlineAt,ASC">마감임박순</option>
                <option value="deadlineAt,DESC">마감여유순</option>
              </select>
            </div>

            <div className="date-filters">
              <label className="filter-label">기간:</label>
              <select
                value={dateFilter}
                onChange={(e) => handleDateFilterChange(e.target.value)}
                className="date-select"
              >
                <option value="">전체 기간</option>
                <option value="today">오늘 마감</option>
                <option value="week">일주일 이내</option>
                <option value="month">한달 이내</option>
              </select>
            </div>
          </div>

          <div className="filter-controls">
            <button
              className="advanced-filter-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              고급 필터 {showAdvancedFilters ? "▲" : "▼"}
            </button>
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              필터 초기화
            </button>
          </div>
        </div>

        {/* 고급 필터 */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <h3>고급 필터 옵션</h3>

            <div className="attribute-filters">
              <div className="attribute-filter">
                <label className="filter-label">복수 선택:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="multiple"
                      checked={attributeFilters.multiple === null}
                      onChange={() =>
                        handleAttributeFilterChange("multiple", null)
                      }
                    />
                    전체
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="multiple"
                      checked={attributeFilters.multiple === true}
                      onChange={() =>
                        handleAttributeFilterChange("multiple", true)
                      }
                    />
                    가능
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="multiple"
                      checked={attributeFilters.multiple === false}
                      onChange={() =>
                        handleAttributeFilterChange("multiple", false)
                      }
                    />
                    불가능
                  </label>
                </div>
              </div>

              <div className="attribute-filter">
                <label className="filter-label">익명 투표:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="anonymous"
                      checked={attributeFilters.anonymous === null}
                      onChange={() =>
                        handleAttributeFilterChange("anonymous", null)
                      }
                    />
                    전체
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="anonymous"
                      checked={attributeFilters.anonymous === true}
                      onChange={() =>
                        handleAttributeFilterChange("anonymous", true)
                      }
                    />
                    익명
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="anonymous"
                      checked={attributeFilters.anonymous === false}
                      onChange={() =>
                        handleAttributeFilterChange("anonymous", false)
                      }
                    />
                    공개
                  </label>
                </div>
              </div>

              <div className="attribute-filter">
                <label className="filter-label">옵션 추가:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="allowAddOption"
                      checked={attributeFilters.allowAddOption === null}
                      onChange={() =>
                        handleAttributeFilterChange("allowAddOption", null)
                      }
                    />
                    전체
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="allowAddOption"
                      checked={attributeFilters.allowAddOption === true}
                      onChange={() =>
                        handleAttributeFilterChange("allowAddOption", true)
                      }
                    />
                    가능
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="allowAddOption"
                      checked={attributeFilters.allowAddOption === false}
                      onChange={() =>
                        handleAttributeFilterChange("allowAddOption", false)
                      }
                    />
                    불가능
                  </label>
                </div>
              </div>

              <div className="attribute-filter">
                <label className="filter-label">재투표:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="allowRevote"
                      checked={attributeFilters.allowRevote === null}
                      onChange={() =>
                        handleAttributeFilterChange("allowRevote", null)
                      }
                    />
                    전체
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="allowRevote"
                      checked={attributeFilters.allowRevote === true}
                      onChange={() =>
                        handleAttributeFilterChange("allowRevote", true)
                      }
                    />
                    가능
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="allowRevote"
                      checked={attributeFilters.allowRevote === false}
                      onChange={() =>
                        handleAttributeFilterChange("allowRevote", false)
                      }
                    />
                    불가능
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 필터링 상태 표시 */}
        <div className="filter-status">
          {(searchQuery ||
            statusFilter ||
            dateFilter ||
            Object.values(attributeFilters).some((v) => v !== null)) && (
            <div className="active-filters">
              <span className="filter-count">
                활성 필터:{" "}
                {
                  [
                    searchQuery && `검색: "${searchQuery}"`,
                    statusFilter &&
                      `상태: ${statusFilter === "OPEN" ? "진행중" : "종료됨"}`,
                    dateFilter && `기간: ${dateFilter}`,
                    attributeFilters.multiple !== null &&
                      `복수선택: ${
                        attributeFilters.multiple ? "가능" : "불가능"
                      }`,
                    attributeFilters.anonymous !== null &&
                      `익명: ${attributeFilters.anonymous ? "익명" : "공개"}`,
                    attributeFilters.allowAddOption !== null &&
                      `옵션추가: ${
                        attributeFilters.allowAddOption ? "가능" : "불가능"
                      }`,
                    attributeFilters.allowRevote !== null &&
                      `재투표: ${
                        attributeFilters.allowRevote ? "가능" : "불가능"
                      }`,
                  ].filter(Boolean).length
                }
                개
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 투표 목록 */}
      <div className="poll-list">
        {polls.length === 0 ? (
          <div className="no-polls">
            {searchQuery ||
            statusFilter ||
            dateFilter ||
            Object.values(attributeFilters).some((v) => v !== null)
              ? "검색 조건에 맞는 투표가 없습니다."
              : "투표가 없습니다."}
          </div>
        ) : (
          polls.map((poll) => (
            <div key={poll.id} className="poll-item">
              <div className="poll-item-header">
                <h3 className="poll-title">{poll.title}</h3>
                {getStatusBadge(poll.status)}
              </div>

              <div className="poll-info">
                <div className="poll-details">
                  <span className="poll-detail">
                    최대 선택: {poll.maxSelect}개
                  </span>
                  {poll.multiple && <span className="poll-tag">복수 선택</span>}
                  {poll.anonymous && <span className="poll-tag">익명</span>}
                  {poll.allowAddOption && (
                    <span className="poll-tag">옵션 추가 가능</span>
                  )}
                  {poll.allowRevote && (
                    <span className="poll-tag">재투표 가능</span>
                  )}
                </div>

                <div className="poll-dates">
                  <div>생성일: {formatDate(poll.createdAt)}</div>
                  <div>마감일: {formatDate(poll.deadlineAt)}</div>
                </div>
              </div>

              <div className="poll-actions">
                <button
                  className="poll-button view-button"
                  onClick={() => {
                    // TODO: 투표 상세 페이지로 이동
                    console.log("투표 상세보기:", poll.id);
                  }}
                >
                  상세보기
                </button>
                {poll.status === "OPEN" && (
                  <button
                    className="poll-button vote-button"
                    onClick={() => {
                      // TODO: 투표하기 기능
                      console.log("투표하기:", poll.id);
                    }}
                  >
                    투표하기
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            이전
          </button>

          <span className="page-info">
            {currentPage + 1} / {totalPages}
          </span>

          <button
            className="pagination-button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default Poll;
