import { getAccessToken } from "./storage";

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
