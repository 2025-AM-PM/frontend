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

  // 기본 헤더
  const headers = new Headers({ Accept: "application/json" });
  if (init.headers)
    new Headers(init.headers).forEach((v, k) => headers.set(k, v));

  // 변경 메서드 또는 명시적 auth=true → Authorization 첨부
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
    } catch {}
  }

  if (!res.ok) {
    const err: any = new Error(
      (parsed && (parsed.message || parsed.error)) ||
        raw ||
        `${res.status} ${res.statusText}`
    );
    err.status = res.status;
    throw err;
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
