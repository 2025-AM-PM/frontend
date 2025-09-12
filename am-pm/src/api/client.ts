export const API_BASE = process.env.REACT_APP_API_BASE;

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // 쿠키 세션 사용
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  // 204나 빈 본문이면 null 반환
  const data = await res.json();

  if (!res.ok) {
    const err = (data && (data.message || data.error)) || res.statusText;
    throw new Error(err);
  }
  return data as T;
}
