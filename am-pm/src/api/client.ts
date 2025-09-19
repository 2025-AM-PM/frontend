import { getAccessToken } from "./storage";

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
    const message = (parsed && (parsed.message || parsed.error)) || raw || `${res.status} ${res.statusText}`;
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
