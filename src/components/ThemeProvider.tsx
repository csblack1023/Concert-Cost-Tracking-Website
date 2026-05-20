"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "concert-cost-theme";

const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "light";
    setThemeState(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const setTheme = (next: string) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
