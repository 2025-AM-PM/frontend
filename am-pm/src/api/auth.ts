import { apiFetch } from "./client";
import { setAccessToken, setStoredUser } from "./storage";
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

  // 1) 토큰 저장 (헤더에서 우선 탐색, 필요 시 바디에서 보강)
  const raw =
    headers.get("Authorization") ||
    headers.get("authorization") ||
    headers.get("authorizen"); // 서버가 커스텀 키를 쓸 때 대비
  const tokenFromHeader =
    raw && raw.toLowerCase().startsWith("bearer ") ? raw.slice(7) : null;

  // (선택) 서버가 바디로 토큰을 준다면 아래 라인으로 교체
  // const tokenFromBody = (data as any)?.token ?? null;

  const token = tokenFromHeader; // || tokenFromBody
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

export async function fetchMe(signal?: AbortSignal): Promise<User | null> {
  const { data } = await apiFetch<User>("/api/student/me", {
    auth: true,
    signal,
  });
  // 서버 최신값으로 localStorage 동기화하고 반환
  if (data) setStoredUser<User>(data);
  return data ?? null;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/logout", { method: "POST" });
  } catch {}
  setAccessToken(null);
  setStoredUser<User>(null);
}
