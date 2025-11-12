// src/AppBootstrap.tsx
import { useEffect, useState } from "react";
import { refreshAccessToken } from "../api/auth";
import { loadMe } from "../api/client";
import { useAuthStore } from "../stores/authStore";

export default function AppBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const logout = useAuthStore((s) => s.logOut);

  useEffect(() => {
    (async () => {
      try {
        const tk = await refreshAccessToken(); // 쿠키 → accessToken
        if (tk) {
          await loadMe(); // 유저 정보 적재
        } else {
          logout(); // 쿠키 없음/만료
        }
      } catch {
        logout();
      } finally {
        setReady(true);
      }
    })();
  }, [logout]);

  if (!ready) return null; // 필요하면 스플래시 UI로 교체
  return <>{children}</>;
}
