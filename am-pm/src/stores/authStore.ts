import { create } from "zustand";
import { produce } from "immer";
import { AuthState } from "../types";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiFetch } from "../api/client";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      setToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      logOut: async () => {
        try {
          await apiFetch<{ ok: boolean }>("/auth/logout", {
            method: "POST",
            auth: false,
            withCredentials: true,
          });
        } catch (e) {
          console.log(e);
        } finally {
          set({ accessToken: null, user: null });
        }
      },
    }),
    {
      name: "auth", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // ✅ 토큰은 저장하지 않고 user만 저장
      partialize: (state) => ({ user: state.user }),
      version: 1,
    }
  )
);

export const authStoreApi = {
  getState: () => useAuthStore.getState(),
  subscribe: useAuthStore.subscribe,
};
