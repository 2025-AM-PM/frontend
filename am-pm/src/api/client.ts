// src/api/client.ts
import {
  PagePollSummaryResponse,
  PollSearchParam,
  Pageable,
  PollCreateRequest,
  PollSummaryResponse,
} from "../types";

export const API_BASE = process.env.REACT_APP_API_BASE;

export type ApiResponse<T> = {
  status: number;
  data: T | null;
  headers: Headers;
};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text(); // ← 항상 텍스트로
  let parsed: any = null;

  if (raw && contentType.includes("application/json")) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      // JSON이 아니면 parsed는 null 유지
    }
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
