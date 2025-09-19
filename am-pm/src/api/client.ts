import { getAccessToken } from "./storage";
import {
  PagePollSummaryResponse,
  PollSearchParam,
  Pageable,
  PollCreateRequest,
  PollSummaryResponse,
  PollDetailResponse,
  PollResultResponse,
  PollVoteRequest,
} from "../types";

export const API_BASE = process.env.REACT_APP_API_BASE;
console.log("API_BASE", API_BASE);

export type ApiResponse<T> = {
  status: number;
  data: T | null;
  headers: Headers;
};

type Extra = { auth?: boolean; withCredentials?: boolean };

// ApiResponse, Extra, getAccessToken, API_BASE 등은 기존과 동일하다고 가정

export async function apiFetch<T>(
  path: string,
  init: RequestInit & Extra = {}
): Promise<ApiResponse<T>> {
  const method = (init.method || "GET").toUpperCase();
  const isMutating =
    method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  // ## 개선 3: 헤더 병합 로직 간소화
  const headers = new Headers({
    //Accept: "application/json",
    ...init.headers, // 기존 헤더를 바로 병합
  });

  // ## 개선 1: Body가 있다면 Content-Type 자동 설정
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (isMutating || init.auth) {
    const tk = getAccessToken();
    if (tk && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${tk}`);
    }
  }

  const credentials: RequestCredentials =
    isMutating || init.withCredentials ? "include" : "omit";

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials,
  });

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
