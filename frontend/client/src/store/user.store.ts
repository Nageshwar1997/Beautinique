import { create } from "zustand";
import { UserStoreType } from "../types/index";
import { removeUserLocal, removeUserSession } from "../utils";

export const useUserStore = create<UserStoreType>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  logout: () => {
    removeUserLocal();
    removeUserSession();
    set({ user: null, isAuthenticated: false });
  },
}));
