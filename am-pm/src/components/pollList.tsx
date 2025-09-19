import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PollSummaryResponse,
  PagePollSummaryResponse,
  PollSearchParam,
} from "../types";
import { getPolls } from "../api/client";
import { useAuth } from "../contexts/userContext";
import PollDetailModal from "./PollDetailModal";
import Header from "./header";
import "../styles/pollList.css";

function PollList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [polls, setPolls] = useState<PollSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
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

  // 모달 상태
  const [selectedPollId, setSelectedPollId] = useState<number | null>(null);

  const fetchPolls = async (
    loadingType: "initial" | "search" | "filter" = "initial"
  ) => {
    try {
      if (loadingType === "search") {
        setSearching(true);
      } else if (loadingType === "filter") {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }
      const searchParams: PollSearchParam = {};

      if (searchQuery.trim()) {
        searchParams.query = searchQuery.trim();
      }
      if (statusFilter) {
        searchParams.status = statusFilter;
      }

      // 날짜 필터링 - 마감 기한 기준으로 필터링
      if (dateFilter) {
        const now = new Date();

        // 현재 시점부터 필터링 시작 (이미 마감된 투표 제외)
        searchParams.deadlineFrom = now.toISOString();

        switch (dateFilter) {
          case "today":
            // 오늘 자정까지 마감되는 투표
            const endOfToday = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            );
            searchParams.deadlineTo = endOfToday.toISOString();
            break;
          case "week":
            // 일주일 후까지 마감되는 투표
            const weekLater = new Date(now);
            weekLater.setDate(weekLater.getDate() + 7);
            searchParams.deadlineTo = weekLater.toISOString();
            break;
          case "month":
            // 한달 후까지 마감되는 투표
            const monthLater = new Date(now);
            monthLater.setMonth(monthLater.getMonth() + 1);
            searchParams.deadlineTo = monthLater.toISOString();
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
      setSearching(false);
      setFilterLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로딩
  useEffect(() => {
    fetchPolls("initial");
  }, []);

  // 검색어가 아닌 필터들이 변경될 때
  useEffect(() => {
    fetchPolls("filter");
  }, [currentPage, statusFilter, sortBy, dateFilter, attributeFilters]);

  // 실시간 검색을 위한 debounced effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      fetchPolls("search");
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchPolls("search");
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
    // React 18의 자동 배칭을 활용하여 한 번에 상태 업데이트
    React.startTransition(() => {
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
    });
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

  if (loading && !searching && !filterLoading && polls.length === 0) {
    return <div className="poll-loading">투표 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="poll-error">오류: {error}</div>;
  }

  return (
    <>
      <Header />
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
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="투표 제목 검색... (실시간 검색)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`search-input ${searching ? "searching" : ""}`}
                />
                {searching && (
                  <div className="search-spinner">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
            </form>

            <div className="filter-row">
              <div className="status-filters">
                <label className="filter-label">상태:</label>
                <button
                  type="button"
                  className={`filter-button ${
                    statusFilter === "" ? "active" : ""
                  }`}
                  onClick={() => handleStatusChange("")}
                >
                  전체
                </button>
                <button
                  type="button"
                  className={`filter-button ${
                    statusFilter === "OPEN" ? "active" : ""
                  }`}
                  onClick={() => handleStatusChange("OPEN")}
                >
                  진행중
                </button>
                <button
                  type="button"
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
                <label className="filter-label">마감기한:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className="date-select"
                >
                  <option value="">전체 기간</option>
                  <option value="today">오늘 마감</option>
                  <option value="week">7일 이내 마감</option>
                  <option value="month">30일 이내 마감</option>
                </select>
              </div>
            </div>

            <div className="filter-controls">
              <button
                type="button"
                className="advanced-filter-toggle"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                고급 필터 {showAdvancedFilters ? "▲" : "▼"}
              </button>
              <button
                type="button"
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
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
                        `상태: ${
                          statusFilter === "OPEN" ? "진행중" : "종료됨"
                        }`,
                      dateFilter &&
                        `마감기한: ${
                          dateFilter === "today"
                            ? "오늘"
                            : dateFilter === "week"
                            ? "7일 이내"
                            : dateFilter === "month"
                            ? "30일 이내"
                            : dateFilter
                        }`,
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
        <div
          className={`poll-list ${searching || filterLoading ? "loading" : ""}`}
        >
          {searching && (
            <div className="search-overlay">
              <div className="search-loading">
                <div className="spinner large"></div>
                <span>검색 중...</span>
              </div>
            </div>
          )}
          {filterLoading && (
            <div className="filter-overlay">
              <div className="filter-loading">
                <div className="spinner large"></div>
                <span>필터 적용 중...</span>
              </div>
            </div>
          )}
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
                    {poll.multiple && (
                      <span className="poll-tag">복수 선택</span>
                    )}
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
                    onClick={() => setSelectedPollId(poll.id)}
                  >
                    상세보기
                  </button>
                  {poll.status === "OPEN" && (
                    <button
                      className="poll-button vote-button"
                      onClick={() => setSelectedPollId(poll.id)}
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
              type="button"
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
              type="button"
              className="pagination-button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 모달 */}
      {selectedPollId && (
        <PollDetailModal
          pollId={selectedPollId}
          onClose={() => setSelectedPollId(null)}
          onPollUpdated={() => {
            // 투표 목록 새로고침
            fetchPolls("filter");
          }}
        />
      )}
    </>
  );
}

export default PollList;
