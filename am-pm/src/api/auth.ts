import { apiFetch } from "./client";
import { setAccessToken, setStoredUser, StorageKeys } from "./storage";
import type { User } from "../types";
import { useAuthStore } from "../stores/authStore";

let refreshPromise: Promise<string | null> | null = null;

type LoginReq = { studentNumber: string; studentPassword: string };
type LoginRes = {
  studentId: number;
  studentName: string;
  studentNumber: string;
  studentTier: string;
  role?: string;
};
type RegisterReq = {
  studentName: string;
  studentNumber: string;
  studentPassword: string;
};

export async function login(req: LoginReq): Promise<User> {
  const { data, headers } = await apiFetch<LoginRes>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!data) throw new Error("로그인 실패");

  // 1) 토큰 저장 (헤더 → 필요시 바디로 대체)
  const raw =
    headers.get("Authorization") ||
    headers.get("authorization") ||
    headers.get("authorizen");
  const token =
    raw && raw.toLowerCase().startsWith("bearer ") ? raw.slice(7) : null;

  if (token) setAccessToken(token);

  // 2) 사용자 저장
  const user: User = {
    studentId: data.studentId || null,
    studentName: data.studentName || null,
    studentNumber: data.studentNumber || null,
    studentTier: data.studentTier || null,
    role: data.role || null,
  };
  setStoredUser<User>(user);

  return user;
}

export async function register(req: RegisterReq): Promise<number> {
  const { status } = await apiFetch<unknown>("/signup", {
    method: "OPTIONS",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  return status;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await apiFetch<{
      studentId: number;
      studentName: string;
      studentNumber: string;
      role: string;
      studentTier: number;
    }>("/students/me", {
      method: "GET",
      auth: true,
    });

    if (!data) return null;

    const user: User = {
      studentId: data.studentId || null,
      studentName: data.studentName || null,
      studentNumber: data.studentNumber || null,
      studentTier: data.studentTier?.toString() || null,
      role: data.role || null,
    };

    setStoredUser<User>(user);
    return user;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

/** 서버 호출 없이 클라이언트 상태만 정리 */
export function logout(): void {
  console.log("[logout] before", localStorage.getItem(StorageKeys.access));
  setAccessToken(null);
  setStoredUser<User>(null);
  console.log("[logout] after", localStorage.getItem(StorageKeys.access));
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise; // single-flight

  refreshPromise = (async () => {
    const res = await fetch(`${process.env.REACT_APP_API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;

    const data = await res.json(); // { accessToken: string }
    const accessToken = data?.accessToken ?? null;

    useAuthStore.getState().setToken(accessToken);
    return accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
