import { create } from "zustand";
import { produce } from "immer";
import { AuthState } from "../types";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,

  setToken: (token) => {
    set(
      produce<AuthState>((s) => {
        s.accessToken = token;
      })
    );
  },

  setUser: (user) => {
    set({ user });
  },

  logOut: () => {
    set({ accessToken: null, user: null });
  },
}));

export const authStoreApi = {
  getState: () => useAuthStore.getState(),
  subscribe: useAuthStore.subscribe,
};
