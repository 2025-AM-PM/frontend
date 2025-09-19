import { apiFetch } from "./client";
import type { User } from "../types";

type LoginReq = { studentNumber: string; studentPassword: string };
type LoginRes = {
  studentName: string;
  studentNumber: string;
  studentTier: string;
};

export async function login(req: LoginReq): Promise<User> {
  const data = await apiFetch<LoginRes>("/student/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return {
    studentName: data.studentName || null,
    studentNumber: data.studentNumber || null,
    studentTier: data.studentTier || null,
  };
}

// 로그아웃
export async function logout(): Promise<void> {
  await apiFetch("/logout", { method: "POST" }); // 서버 계약에 맞게 수정 가능
}
