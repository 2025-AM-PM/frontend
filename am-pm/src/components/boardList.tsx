import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/boardList.css";
import { PageData, BoardListProps, SortKey } from "../types";
import Header from "./header";
import { apiFetch } from "../api/client";

/** ===== Constants ===== */
const SORT_OPTIONS: Record<SortKey, string> = {
  "createdAt,desc": "최신순",
  "createdAt,asc": "오래된순",
  "views,desc": "조회수순",
};

/** ===== Utils ===== */
function formatDate(dateString: string) {
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatNumber(n: number) {
  return n.toLocaleString("ko-KR");
}

/** ===== Component ===== */
const BoardList: React.FC<BoardListProps> = ({
  pageSize = 8,
  onSelectPost,
  fetcher,
  category,
  title,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const categoryParam = useMemo(() => {
    return category ?? searchParams.get("category") ?? "";
  }, [category, searchParams]);

  const categoryLabel = useMemo(() => {
    const c = categoryParam.trim();
    if (!c) return "";
    // 예시: all/free/notice 같은 값들을 이쁘게
    const map: Record<string, string> = {
      all: "전체",
      notice: "공지사항",
      study: "스터디",
      job: "취업 정보",
      info: "학교 정보",
    };
    return map[c.toLowerCase()] ?? c;
  }, [categoryParam]);

  const pageTitle = useMemo(() => {
    if (title) return title; // props title이 오면 그걸 우선
    return categoryLabel ? `${categoryLabel} 게시판` : "게시판";
  }, [title, categoryLabel]);

  // URL에서 page 가져오기 (기본값 0)
  const currentPage = parseInt(searchParams.get("page") || "0", 10);

  const [sortBy, setSortBy] = useState<SortKey>("createdAt,desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOpen, setSortOpen] = useState<boolean>(false);

  const sortRef = useRef<HTMLDivElement | null>(null);

  /** 외부 클릭으로 정렬 메뉴 닫기 */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!sortRef.current) return;
      const target = e.target as Node;
      if (!sortRef.current.contains(target)) setSortOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /** 페이지 변경 핸들러 */
  const handlePageChange = (newPage: number) => {
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
  };

  /** 데이터 로딩 */
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      if (fetcher) {
        const page = await fetcher({
          page: currentPage,
          size: pageSize,
          sort: sortBy,
          q: searchQuery,
        });
        setData(page);
      } else {
        // API 연동
        const params = new URLSearchParams();

        const categoryParam = category || searchParams.get("category");

        if (categoryParam) {
          params.append("category", categoryParam.toUpperCase());
        }

        if (searchQuery) {
          params.append("q", searchQuery);
        }

        params.append("page", currentPage.toString());
        params.append("size", pageSize.toString());
        params.append("sort", sortBy);

        // 응답이 PageData 형태라고 가정
        const res = await apiFetch<PageData>(`/posts?${params.toString()}`);
        if (res.data) {
          setData(res.data);
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, searchQuery, pageSize, searchParams]);

  /** 렌더 조각들 */
  const SkeletonRows = useMemo(() => {
    return (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="post-card" key={`skeleton-${i}`}>
            <div className="skeleton-row">
              <div className="skeleton skeleton-badge" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-meta" />
            </div>
          </div>
        ))}
      </>
    );
  }, []);

  const EmptyState = (
    <div className="empty-state">
      <div className="empty-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      </div>
      <h3 className="empty-title">게시글이 없습니다.</h3>
      <p className="empty-subtitle">
        검색어를 바꾸거나 정렬 조건을 확인하세요.
      </p>
    </div>
  );

  const navigate = useNavigate();

  const PostRows = useMemo(() => {
    if (!data) return null;
    return data.content.map((post) => (
      <div className="post-card" key={post.id}>
        <div
          className="post-row"
          onClick={() => navigate(`/detail/${post.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelectPost?.(post);
          }}
        >
          <div className="post-content">
            <span className="post-title">{post.title}</span>
          </div>
          <div className="post-meta">
            <div className="post-author">{post.author}</div>
            <div className="post-views">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{formatNumber(post.views)}</span>
            </div>
            <div className="post-date">{formatDate(post.createdAt)}</div>
          </div>
        </div>
      </div>
    ));
  }, [data, onSelectPost]);

  /** 페이지네이션 */
  const Pagination = useMemo(() => {
    if (!data) return null;

    const blockSize = 10; // 1~10, 11~20 ...
    const currentBlock = Math.floor(currentPage / blockSize);
    const startPage = currentBlock * blockSize;
    const endPage = Math.min(data.totalPages - 1, startPage + blockSize - 1);

    const btns: number[] = [];
    for (let i = startPage; i <= endPage; i++) btns.push(i);

    return (
      <div className="pagination">
        <button
          className="page-button"
          disabled={data.first}
          onClick={() => !data.first && handlePageChange(currentPage - 1)}
          aria-label="이전 페이지"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {btns.map((i) => (
          <button
            key={`page-${i}`}
            className={`page-button ${i === currentPage ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
            aria-current={i === currentPage ? "page" : undefined}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="page-button"
          disabled={data.last}
          onClick={() => !data.last && handlePageChange(currentPage + 1)}
          aria-label="다음 페이지"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    );
  }, [data, currentPage]);

  /** 이벤트 핸들러들 */
  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handlePageChange(0); // 검색 시 0페이지로 리셋
    load();
  };

  const onRetry = () => load();

  const onToggleSort = () => setSortOpen((o) => !o);

  const onSelectSort = (value: SortKey) => {
    setSortBy(value);
    handlePageChange(0); // 정렬 변경 시 0페이지로 리셋
    setSortOpen(false);
  };

  return (
    <div className="boardList-container">
      <Header />
      {/* Header */}
      <div className="board-header">
        <h1 className="board-title">{pageTitle}</h1>

        <div className="board-actions" style={{ display: "flex", gap: "8px" }}>
          <button
            className="write-button"
            onClick={() => navigate(`/board/${categoryParam}/write`)}
            style={{
              padding: "0 12px",
              height: "36px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              backgroundColor: "white",
              fontSize: "14px",
              fontWeight: 500,
              color: "#374151",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            글쓰기
          </button>

          <div className="sort-dropdown" ref={sortRef}>
            <button
              className="sort-button"
              onClick={onToggleSort}
              aria-haspopup="menu"
              aria-expanded={sortOpen}
            >
              <span>정렬: {SORT_OPTIONS[sortBy]}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div className={`sort-menu ${sortOpen ? "open" : ""}`} role="menu">
              {(Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => (
                <div
                  key={key}
                  className={`sort-option ${sortBy === key ? "active" : ""}`}
                  data-value={key}
                  role="menuitem"
                  onClick={() => onSelectSort(key)}
                >
                  {SORT_OPTIONS[key]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <div className={`error-banner ${error ? "" : "hidden"}`}>
        <div className="error-content">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span className="error-message">
            게시글을 불러오는 중 오류가 발생했습니다.
          </span>
        </div>
        <button className="retry-button" onClick={onRetry}>
          재시도
        </button>
      </div>

      {/* Post List */}
      <div className="post-list" aria-live="polite">
        {loading ? SkeletonRows : data?.empty ? EmptyState : PostRows}
      </div>

      {/* Pagination */}
      {Pagination}

      {/* Search */}
      <div className="search-section">
        <form className="search-bar" onSubmit={onSubmitSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="게시글 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button" aria-label="검색">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            검색
          </button>
        </form>
      </div>
    </div>
  );
};

export default BoardList;
