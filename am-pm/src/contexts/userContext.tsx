import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../types";
import { fetchMe, logout } from "../api/auth";
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

  // 2) 앱 시작 시, 토큰이 있으면 /me로 최신값 동기화(선택적)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!hasAccessToken()) return;
      const me = await fetchMe().catch(() => null);
      if (alive && me) setUser(me);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 3) state 변경 → localStorage에도 반영
  useEffect(() => {
    setStoredUser<User>(user);
  }, [user]);

  // 4) 탭 간 동기화 (다른 탭에서 로그인/로그아웃 반영)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === StorageKeys.user) {
        const next = getStoredUser<User>();
        setUser(next);
      }
      if (e.key === StorageKeys.access && !e.newValue) {
        // 토큰이 사라졌다면 즉시 로그아웃 반영
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const reloadUser = async () => {
    if (!hasAccessToken()) {
      setUser(null);
      return;
    }
    const me = await fetchMe().catch(() => null);
    if (me) setUser(me);
  };

  const signOut = async () => {
    await logout();
  };

  const value = useMemo(
    () => ({ user, setUser, isAuthed: !!user, reloadUser, signOut }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용한다.");
  return ctx;
}
