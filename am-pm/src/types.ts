export interface Post {
  id: number; // 고유한 key로 사용될 id
  title: string;
  createdAt: string;
  view: number;
  link: string;
  author: string;
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
