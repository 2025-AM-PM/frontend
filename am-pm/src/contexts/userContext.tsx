import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../types";
import { logout, getCurrentUser } from "../api/auth";
import {
  getStoredUser,
  setStoredUser,
  hasAccessToken,
  StorageKeys,
} from "../api/storage";

type AuthCtx = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthed: boolean;
  reloadUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1) localStorage에 있으면 즉시 하이드레이션 (네트워크 없이)
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());

  // 2) state 변경 ↔ localStorage 동기화
  useEffect(() => {
    setStoredUser<User>(user);
  }, [user]);

  // 3) 탭 간 동기화 (다른 탭에서 로그인/로그아웃 반영)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === StorageKeys.user) {
        setUser(getStoredUser<User>());
      }
      if (e.key === StorageKeys.access && !e.newValue) {
        // 토큰이 사라지면 즉시 로그아웃 반영
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const reloadUser = async () => {
    // 토큰 없으면 비우고 종료
    if (!hasAccessToken()) {
      setUser(null);
      return;
    }
    // 서버에서 최신 유저 정보 가져오기
    const me = await getCurrentUser().catch(() => null);
    setUser(me);
  };

  const signOut = async () => {
    await logout(); // localStorage 비움
    setUser(null); // 현재 탭 UI 즉시 반영
    window.location.replace("/login"); // 뒤로가기 방지
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthed: !!user && hasAccessToken(), // 사용자 + 토큰 둘 다 있을 때 로그인으로 간주
      reloadUser,
      signOut,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용한다.");
  return ctx;
}
