import { create } from "zustand";
import { UserStoreType } from "../types/index";
import { removeUserLocal, removeUserSession } from "../utils";
import { useQueryStore } from "./query.store";

export const useUserStore = create<UserStoreType>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  logout: () => {
    removeUserLocal();
    removeUserSession();

    set(() => {
      const { queryClient } = useQueryStore.getState();
      queryClient.removeQueries({ queryKey: ["get_user_details"] });
      return { user: null, isAuthenticated: false };
    });
  },
}));
