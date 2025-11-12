import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/boardList.css";
import { Post, PageData, BoardListProps, SortKey } from "../types";
import Header from "./header";

/** ===== Constants ===== */
const SORT_OPTIONS: Record<SortKey, string> = {
  "createdAt,desc": "최신순",
  "createdAt,asc": "오래된순",
  "views,desc": "조회수순",
};

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    title: "[공지] 커뮤니티 이용 규칙 안내",
    view: 1234,
    createdAt: "2025-09-28T10:30:00.000Z",
    link: "/",
    author: "테스트유저",
  },
  {
    id: 2,
    title: "새로운 기능 업데이트 소식",
    view: 856,
    createdAt: "2025-09-27T15:20:00.000Z",
    link: "/",
    author: "테스트유저",
  },
  {
    id: 3,
    title: "React 18의 새로운 기능들에 대한 심층 분석",
    view: 542,
    createdAt: "2025-09-26T09:15:00.000Z",
    link: "/",
    author: "테스트유저",
  },
  {
    id: 4,
    title: "CSS Grid vs Flexbox: 언제 무엇을 사용해야 할까?",
    view: 423,
    createdAt: "2025-09-25T14:45:00.000Z",
    link: "/",
    author: "테스트유저",
  },
  {
    id: 5,
    title: "TypeScript 실전 팁 모음",
    view: 389,
    createdAt: "2025-09-24T11:30:00.000Z",
    link: "/",
    author: "테스트유저",
  },
  {
    id: 6,
    title: "웹 접근성을 위한 ARIA 속성 가이드",
    view: 267,
    createdAt: "2025-09-23T16:20:00.000Z",
    link: "/",
    author: "테스트유저",
  },
  {
    id: 7,
    title: "Next.js 앱 성능 최적화 전략",
    view: 198,
    createdAt: "2025-09-22T13:10:00.000Z",
    link: "/",
    author: "테스트유저",
  },
  {
    id: 8,
    title: "디자인 시스템 구축하기",
    view: 156,
    createdAt: "2025-09-21T10:05:00.000Z",
    link: "/",
    author: "테스트유저",
  },
];

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
  title = "게시판",
}) => {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
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
        // === Mock 동작 (로컬 필터/정렬/페이지네이션) ===
        await new Promise((r) => setTimeout(r, 500)); // 스켈레톤 시연용

        let filtered = MOCK_POSTS;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = MOCK_POSTS.filter((p) =>
            p.title.toLowerCase().includes(q)
          );
        }

        const sorted = [...filtered].sort((a, b) => {
          switch (sortBy) {
            case "createdAt,desc":
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            case "createdAt,asc":
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            default:
              return 0;
          }
        });

        const totalPages = Math.ceil(sorted.length / pageSize) || 1;
        const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));
        const start = safePage * pageSize;
        const pageContent = sorted.slice(start, start + pageSize);

        setData({
          totalElements: sorted.length,
          totalPages,
          size: pageSize,
          content: pageContent,
          number: safePage,
          numberOfElements: pageContent.length,
          first: safePage === 0,
          last: safePage === totalPages - 1,
          empty: pageContent.length === 0,
        });
        if (safePage !== currentPage) setCurrentPage(safePage);
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
  }, [currentPage, sortBy, searchQuery, pageSize]);

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

  const PostRows = useMemo(() => {
    if (!data) return null;
    return data.content.map((post) => (
      <div className="post-card" key={post.id}>
        <div
          className="post-row"
          onClick={() => onSelectPost?.(post)}
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
              <span>{formatNumber(post.view)}</span>
            </div>
            <div className="post-date">{formatDate(post.createdAt)}</div>
          </div>
        </div>
      </div>
    ));
  }, [data, onSelectPost]);

  /** 페이지네이션 */
  const Pagination = useMemo(() => {
    if (!data || data.totalPages <= 1) return null;

    const btns: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(data.totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);
    for (let i = start; i <= end; i++) btns.push(i);

    return (
      <div className="pagination">
        <button
          className="page-button"
          disabled={data.first}
          onClick={() =>
            !data.first && setCurrentPage((p) => Math.max(0, p - 1))
          }
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
            onClick={() => setCurrentPage(i)}
            aria-current={i === currentPage ? "page" : undefined}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="page-button"
          disabled={data.last}
          onClick={() =>
            !data.last &&
            setCurrentPage((p) => Math.min(data.totalPages - 1, p + 1))
          }
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
    setCurrentPage(0);
    load();
  };

  const onRetry = () => load();

  const onToggleSort = () => setSortOpen((o) => !o);

  const onSelectSort = (value: SortKey) => {
    setSortBy(value);
    setCurrentPage(0);
    setSortOpen(false);
  };

  return (
    <div className="boardList-container">
      <Header />
      {/* Header */}
      <div className="board-header">
        <h1 className="board-title">{title}</h1>

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

      {/* Pagination */}
      {Pagination}
    </div>
  );
};

export default BoardList;
