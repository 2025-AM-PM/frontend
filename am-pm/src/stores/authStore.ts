import { create } from "zustand";
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
          localStorage.clear();
        }
      },
    }),
    {
      name: "auth", // localStorage key
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({ user: state.user }),
      version: 1,
    }
  )
);

export const authStoreApi = {
  getState: () => useAuthStore.getState(),
  subscribe: useAuthStore.subscribe,
};
