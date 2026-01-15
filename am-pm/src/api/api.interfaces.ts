import type {
  PagePollSummaryResponse,
  PollSearchParam,
  Pageable,
  PollCreateRequest,
  PollSummaryResponse,
  PollDetailResponse,
  PollResultResponse,
  PollVoteRequest,
  User,
  DbHealthResponse,
} from "../types";

// ============================================================
// Core Types
// ============================================================

export type ApiResponse<T> = {
  status: number;
  data: T | null;
  headers: Headers;
};

export type Extra = { auth?: boolean; withCredentials?: boolean };

// ============================================================
// API Client Interface
// ============================================================

/**
 * 핵심 API 클라이언트 인터페이스
 * HTTP 요청을 추상화하여 테스트 시 모킹 가능
 */
export interface IApiClient {
  fetch<T>(path: string, init?: RequestInit & Extra): Promise<ApiResponse<T>>;
}

// ============================================================
// Service Interfaces
// ============================================================

/**
 * Poll 서비스 인터페이스
 */
export interface IPollService {
  getPolls(
    params?: PollSearchParam,
    pageable?: Pageable
  ): Promise<PagePollSummaryResponse>;
  getPollDetail(pollId: number): Promise<PollDetailResponse>;
  getPollResults(pollId: number): Promise<PollResultResponse>;
  createPoll(data: PollCreateRequest): Promise<PollSummaryResponse>;
  votePoll(pollId: number, data: PollVoteRequest): Promise<void>;
  closePoll(pollId: number): Promise<PollSummaryResponse>;
  deletePoll(pollId: number): Promise<void>;
}

/**
 * Auth 관련 요청/응답 타입
 */
export type LoginRequest = {
  studentNumber: string;
  studentPassword: string;
};

export type RegisterRequest = {
  studentName: string;
  studentNumber: string;
  studentPassword: string;
};

/**
 * Auth 서비스 인터페이스
 */
export interface IAuthService {
  login(req: LoginRequest): Promise<User>;
  register(req: RegisterRequest): Promise<number>;
  getCurrentUser(): Promise<User | null>;
  refreshAccessToken(): Promise<string | null>;
}

/**
 * Admin 관련 타입
 */
export type SignupStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SignupApplicationResponse {
  id: number;
  studentNumber: string;
  studentName: string;
  status: SignupStatus;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface StudentResponse {
  id: number;
  studentNumber: string;
  studentName: string;
  role: "USER" | "ADMIN" | string;
}

export interface AllStudentResponse {
  students: StudentResponse[];
  totalCount: number;
}

export interface SignupApplicationProcessResponse {
  total: number;
  status: SignupStatus;
}

/**
 * Admin 서비스 인터페이스
 */
export interface IAdminService {
  getSignupApplications(
    status: SignupStatus
  ): Promise<SignupApplicationResponse[]>;
  approveSignupApplications(
    ids: number[]
  ): Promise<SignupApplicationProcessResponse>;
  rejectSignupApplications(
    ids: number[]
  ): Promise<SignupApplicationProcessResponse>;
  getAllStudents(): Promise<AllStudentResponse>;
  updateStudentRole(studentId: number, role: string): Promise<StudentResponse>;
  deleteStudent(studentId: number): Promise<void>;
}

/**
 * DB Health 서비스 인터페이스
 */
export interface IDbService {
  healthCheck(): Promise<DbHealthResponse>;
}
