import { apiFetch, loadMe } from "./client";
import { setAccessToken, setStoredUser, StorageKeys } from "./storage";
import type { User } from "../types";
import { useAuthStore } from "../stores/authStore";
import { pickBearerFromHeaders } from "./auth_helper";

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

// export async function login(req: LoginReq): Promise<User> {
//   const { data, headers } = await apiFetch<LoginRes>("/auth/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(req),
//   });
//   if (!data) throw new Error("로그인 실패");

//   // 1) 토큰 저장 (헤더 → 필요시 바디로 대체)
//   const raw =
//     headers.get("Authorization") ||
//     headers.get("authorization") ||
//     headers.get("authorizen");
//   const token =
//     raw && raw.toLowerCase().startsWith("bearer ") ? raw.slice(7) : null;

//   if (token) setAccessToken(token);

//   // 2) 사용자 저장
//   const user: User = {
//     studentId: data.studentId || null,
//     studentName: data.studentName || null,
//     studentNumber: data.studentNumber || null,
//     studentTier: data.studentTier || null,
//     role: data.role || null,
//   };
//   setStoredUser<User>(user);

//   return user;
// }

export async function login(req: LoginReq): Promise<User> {
  const { setToken, setUser, logOut } = useAuthStore.getState();

  const { data, headers } = await apiFetch<LoginRes>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  // 1) 헤더에서 accessToken
  let token = pickBearerFromHeaders(headers);

  // 2) (옵션) 바디 fallback
  if (!token && data && (data as any).accessToken) {
    token = (data as any).accessToken!;
  }

  if (!token) {
    logOut();
    throw new Error("로그인 실패: accessToken을 받지 못했습니다.");
  }
  setToken(token);

  // 3) 유저 반영: 응답에 유저가 있으면 그대로, 없으면 /api/me
  let user: User | null = null;
  if (data && ("studentName" in data || "role" in data)) {
    user = {
      studentId: data.studentId ?? null,
      studentName: data.studentName ?? null,
      studentNumber: data.studentNumber ?? null,
      studentTier: data.studentTier ?? null,
      role: data.role ?? null,
    } as User;
    setUser(user);
  } else {
    await loadMe();
    user = useAuthStore.getState().user as User | null;
  }

  if (!user) {
    logout();
    throw new Error("로그인 실패: 사용자 정보를 불러오지 못했습니다.");
  }
  return user;
}

export async function register(req: RegisterReq): Promise<number> {
  const { status } = await apiFetch<unknown>("/auth/signup", {
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
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE}/api/auth/reissue`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!res.ok) return null;

    let token = pickBearerFromHeaders(res.headers);

    useAuthStore.getState().setToken(token);
    return token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
