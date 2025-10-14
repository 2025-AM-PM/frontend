export interface Post {
  id: number; // 고유한 key로 사용될 id
  title: string;
  createdAt: string;
  view: number;
  link: string;
  author: string;
}

export interface PostDetail {
  title?: string;
  author?: string;
  createdAt?: string;
  views?: number;
  likes?: number;
  markdown: string;
}

export interface MiniBoardProps {
  boardTitle: string;
  posts: Post[];
}

export interface User {
  studentId: number | null;
  studentName: string | null;
  studentTier: string | null;
  studentNumber: string | null;
  role: string | null;
}

export type StudentRole = "USER" | "STAFF" | "PRESIDENT" | "SYSTEM_ADMIN";

// Poll related types
export interface PollSummaryResponse {
  id: number;
  title: string;
  status: "OPEN" | "CLOSED";
  maxSelect: number;
  multiple: boolean;
  anonymous: boolean;
  allowAddOption: boolean;
  allowRevote: boolean;
  deadlineAt: string;
  createdBy: number;
  createdAt: string;
}

export interface PagePollSummaryResponse {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: PollSummaryResponse[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface PollSearchParam {
  query?: string;
  status?: "OPEN" | "CLOSED";
  deadlineFrom?: string;
  deadlineTo?: string;
}

export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

// Poll creation types
export interface PollCreateRequest {
  title: string;
  description?: string;
  maxSelect: number;
  multiple: boolean;
  anonymous: boolean;
  allowAddOption: boolean;
  allowRevote: boolean;
  resultVisibility: "ALWAYS" | "AFTER_CLOSE" | "AUTHENTICATED" | "ADMIN_ONLY";
  deadlineAt: string;
  options: string[];
}

// Poll detail types
export interface PollOptionResponse {
  id: number;
  label: string;
}

export interface PollDetailResponse {
  id: number;
  title: string;
  description: string;
  status: "OPEN" | "CLOSED";
  maxSelect: number;
  multiple: boolean;
  anonymous: boolean;
  allowAddOption: boolean;
  allowRevote: boolean;
  resultVisibility: "ALWAYS" | "AFTER_CLOSE" | "AUTHENTICATED" | "ADMIN_ONLY";
  deadlineAt: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  open: boolean;
  options: PollOptionResponse[];
  voted: boolean;
  mySelectedOptionIds: number[] | null;
}

// Poll voting types
export interface PollVoteRequest {
  optionIds: number[];
}

// Poll result types
export interface PollVoterResponse {
  studentId: number;
  studentName: string;
}

export interface PollResultOptionResponse {
  id: number;
  label: string;
  count: number;
  voters: PollVoterResponse[];
}

export interface PollResultResponse {
  poll: PollDetailResponse;
  options: PollResultOptionResponse[];
  voted: boolean;
  mySelectedOptionIds: number[] | null;
}

export interface PageData {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Post[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type SortKey =
  | "createdAt,desc"
  | "createdAt,asc"
  | "views,desc"
  | "title,asc";

export interface FetchParams {
  page: number;
  size: number;
  sort: SortKey;
  q: string;
}

export interface BoardListProps {
  pageSize?: number;
  onSelectPost?: (post: Post) => void;
  /**
   * 서버 API 연동 시 주입:
   * - 반환은 백엔드 페이징 응답 형식과 동일해야 함.
   * - 구현 예시: (p) => fetch(`/api/boards?page=${p.page}&size=${p.size}&sort=${p.sort}&q=${encodeURIComponent(p.q)}`).then(r=>r.json())
   */
  fetcher?: (params: FetchParams) => Promise<PageData>;
  /** 헤더 타이틀 (기본: '게시판') */
  title?: string;
}
