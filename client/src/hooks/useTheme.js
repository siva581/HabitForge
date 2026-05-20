import { useCallback, useLayoutEffect } from "react";

const THEME_KEY = "habitforge-theme";

export function getStoredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "light" ? "light" : "dark";
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export function useTheme() {
  useLayoutEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  }, []);

  return { toggleTheme };
}
