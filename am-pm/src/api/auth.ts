import { apiFetch } from "./client";
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
  const { data } = await apiFetch<LoginRes>("/student/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!data) throw new Error("로그인 실패");
  return {
    studentName: data.studentName || null,
    studentNumber: data.studentNumber || null,
    studentTier: data.studentTier || null,
  };
}

export async function register(req: RegisterReq): Promise<number> {
  const { status } = await apiFetch<unknown>("/student/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return status;
}

// 로그아웃
export async function logout(): Promise<void> {
  await apiFetch("/logout", { method: "POST" }); // 서버 계약에 맞게 수정 가능
}
