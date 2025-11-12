import {
  PagePollSummaryResponse,
  PollSearchParam,
  Pageable,
  PollCreateRequest,
  PollSummaryResponse,
  PollDetailResponse,
  PollResultResponse,
  PollVoteRequest,
  User,
} from "../types";
import { authStoreApi, useAuthStore } from "../stores/authStore";
import { refreshAccessToken } from "./auth";

export const API_BASE = process.env.REACT_APP_API_BASE;

export type ApiResponse<T> = {
  status: number;
  data: T | null;
  headers: Headers;
};

type Extra = { auth?: boolean; withCredentials?: boolean };

export async function apiFetch<T>(
  path: string,
  init: RequestInit & Extra = {}
): Promise<ApiResponse<T>> {
  const method = (init.method || "GET").toUpperCase();
  const isMutating =
    method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  const isAuthEndpoint = path.startsWith("/auth/");

  // ## 개선 3: 헤더 병합 로직 간소화
  const headers = new Headers({
    //Accept: "application/json",
    ...init.headers, // 기존 헤더를 바로 병합
  });

  // ## 개선 1: Body가 있다면 Content-Type 자동 설정
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!isAuthEndpoint && (isMutating || init.auth)) {
    const tk = authStoreApi.getState().accessToken;
    if (tk && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${tk}`);
    }
  }

  const credentials: RequestCredentials =
    isMutating || init.withCredentials ? "include" : "omit";

  const url = `${process.env.REACT_APP_API_BASE}${path}`;
  const doFetch = () => fetch(url, { ...init, method, headers, credentials });

  let res = await doFetch();
  // const res = await fetch(`${process.env.REACT_APP_API_BASE}/api${path}`, {
  //   ...init,
  //   headers,
  //   credentials,
  // });

  if (!isAuthEndpoint && res.status === 401 && (isMutating || init.auth)) {
    const newTk = await refreshAccessToken(); // 쿠키 기반으로 accessToken 재발급 시도
    if (newTk) {
      headers.set("Authorization", `Bearer ${newTk}`);
      res = await doFetch(); // 딱 1회만 재시도
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();
  let parsed: any = null;

  if (raw && contentType.includes("application/json")) {
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // ## 개선 2: JSON 파싱 에러를 무시하지 않음
      console.error("Failed to parse JSON response:", e);
      // 혹은 여기서 특정 에러를 throw 할 수도 있습니다.
    }
  }

  if (!res.ok) {
    // ## 개선 4: 에러 객체 타입 (예시)
    const message =
      (parsed && (parsed.message || parsed.error)) ||
      raw ||
      `${res.status} ${res.statusText}`;
    const error = new Error(message) as any; // 실제로는 ApiError 같은 커스텀 클래스 사용 권장
    error.status = res.status;
    error.responseBody = parsed; // 디버깅을 위해 파싱된 body도 포함
    throw error;
  }

  return {
    status: res.status,
    data: (parsed as T) ?? null,
    headers: res.headers,
  };
}

// Poll API functions
export async function getPolls(
  params: PollSearchParam = {},
  pageable: Pageable = { page: 0, size: 10 }
): Promise<PagePollSummaryResponse> {
  const searchParams = new URLSearchParams();

  // Add pageable parameters first
  searchParams.append("page", pageable.page.toString());
  searchParams.append("size", pageable.size.toString());

  // Add search parameters only if they exist
  if (params.query && params.query.trim()) {
    searchParams.append("query", params.query.trim());
  }
  if (params.status) {
    searchParams.append("status", params.status);
  }
  if (params.deadlineFrom) {
    searchParams.append("deadlineFrom", params.deadlineFrom);
  }
  if (params.deadlineTo) {
    searchParams.append("deadlineTo", params.deadlineTo);
  }

  // Add sort parameters
  if (pageable.sort && pageable.sort.length > 0) {
    pageable.sort.forEach((s) => searchParams.append("sort", s));
  }

  const response = await apiFetch<PagePollSummaryResponse>(
    `/polls?${searchParams.toString()}`
  );

  return response.data!;
}

// Create poll
export async function createPoll(
  pollData: PollCreateRequest
): Promise<PollSummaryResponse> {
  const response = await apiFetch<PollSummaryResponse>("/polls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pollData),
  });

  return response.data!;
}

// Get poll detail
export async function getPollDetail(
  pollId: number
): Promise<PollDetailResponse> {
  const response = await apiFetch<PollDetailResponse>(`/polls/${pollId}`, {
    auth: true,
  });

  return response.data!;
}

// Get poll results
export async function getPollResults(
  pollId: number
): Promise<PollResultResponse> {
  const response = await apiFetch<PollResultResponse>(
    `/polls/${pollId}/results`,
    {
      auth: true,
    }
  );

  return response.data!;
}

// Vote on poll
export async function votePoll(
  pollId: number,
  voteData: PollVoteRequest
): Promise<void> {
  await apiFetch<void>(`/polls/${pollId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(voteData),
  });
}

// Close poll
export async function closePoll(pollId: number): Promise<PollSummaryResponse> {
  const response = await apiFetch<PollSummaryResponse>(
    `/polls/${pollId}/close`,
    {
      method: "POST",
    }
  );

  return response.data!;
}

// Delete poll
export async function deletePoll(pollId: number): Promise<void> {
  await apiFetch<void>(`/polls/${pollId}`, {
    method: "DELETE",
  });
}

// Admin API functions
export interface SignupApplicationResponse {
  id: number;
  studentNumber: string;
  studentName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
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
  status: "PENDING" | "APPROVED" | "REJECTED";
}

// Get signup applications
export async function getSignupApplications(
  status: "PENDING" | "APPROVED" | "REJECTED"
): Promise<SignupApplicationResponse[]> {
  const response = await apiFetch<SignupApplicationResponse[]>(
    `/admin/signup?status=${status}`,
    {
      auth: true,
    }
  );

  return response.data || [];
}

// Approve signup applications
export async function approveSignupApplications(
  applicationIds: number[]
): Promise<SignupApplicationProcessResponse> {
  const response = await apiFetch<SignupApplicationProcessResponse>(
    "/admin/signup/approve",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ applicationIds }),
      auth: true,
    }
  );

  return response.data!;
}

// Reject signup applications
export async function rejectSignupApplications(
  applicationIds: number[]
): Promise<SignupApplicationProcessResponse> {
  const response = await apiFetch<SignupApplicationProcessResponse>(
    "/admin/signup/reject",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ applicationIds }),
      auth: true,
    }
  );

  return response.data!;
}

// Get all students
export async function getAllStudents(): Promise<AllStudentResponse> {
  const response = await apiFetch<AllStudentResponse>("/admin/students", {
    auth: true,
  });

  return response.data!;
}

// Update student role
export async function updateStudentRole(
  studentId: number,
  role: "USER" | "ADMIN" | string
): Promise<StudentResponse> {
  const response = await apiFetch<StudentResponse>(
    `/admin/students/${studentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
      auth: true,
    }
  );

  return response.data!;
}

// Delete student
export async function deleteStudent(studentId: number): Promise<void> {
  await apiFetch<void>(`/admin/students/${studentId}`, {
    method: "DELETE",
    auth: true,
  });
}

// export async function getBoardData() {
//   const body = {
//     page: 0,
//     size: 10,
//     sort: [],
//   };
//   await apiFetch<Post[]>("/exhibits", {
//     method: "GET",
//   });
// }

export async function loadMe() {
  // 서버 응답 스키마에 맞춰 조정
  const res = await apiFetch<User>("/students/me", {
    method: "GET",
    auth: true,
  });
  // 예) { data: { studentName, studentTier, role, ... } }
  useAuthStore.getState().setUser(res.data);
}
