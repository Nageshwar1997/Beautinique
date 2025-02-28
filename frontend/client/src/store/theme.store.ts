import { create } from "zustand";
import { ThemeStoreType, ThemeType } from "../types";

const useThemeStore = create<ThemeStoreType>((set) => ({
  theme: (localStorage.getItem("theme") as ThemeType) || "dark",
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return { theme: newTheme };
    }),
}));

export default useThemeStore;
