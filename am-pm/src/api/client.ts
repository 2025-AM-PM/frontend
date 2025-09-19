// src/api/client.ts
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
