import { apiFetch } from "./client";
import { setAccessToken, setStoredUser, StorageKeys } from "./storage";
import type { User } from "../types";

type LoginReq = { studentNumber: string; studentPassword: string };
type LoginRes = {
  studentName: string;
  studentNumber: string;
  studentTier: string;
};
type RegisterReq = {
  studentName: string;
  studentNumber: string;
  studentPassword: string;
};

export async function login(req: LoginReq): Promise<User> {
  const { data, headers } = await apiFetch<LoginRes>("/student/login", {
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
  // 바디로 토큰을 준다면: const token = (data as any)?.accessToken ?? token;
  if (token) setAccessToken(token);

  // 2) 사용자 저장
  const user: User = {
    studentName: data.studentName || null,
    studentNumber: data.studentNumber || null,
    studentTier: data.studentTier || null,
  };
  setStoredUser<User>(user);

  return user;
}

export async function register(req: RegisterReq): Promise<number> {
  const { status } = await apiFetch<unknown>("/student/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return status; // 201 기대
}

/** 서버 호출 없이 클라이언트 상태만 정리 */
export function logout(): void {
  console.log("[logout] before", localStorage.getItem(StorageKeys.access));
  setAccessToken(null);
  setStoredUser<User>(null);
  console.log("[logout] after", localStorage.getItem(StorageKeys.access));
}
