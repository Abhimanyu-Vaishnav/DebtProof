"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { applyGlobalTheme } from "@/utils/theme";

export type ThemeMode = "dark" | "light" | "system" | string;

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("debtproof_theme") || "system";
    setThemeState(savedTheme);
    applyGlobalTheme(savedTheme);

    const handleSystemChange = () => {
      const currentSaved = localStorage.getItem("debtproof_theme") || "system";
      if (currentSaved === "system") {
        applyGlobalTheme("system");
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches && !window.matchMedia("(prefers-color-scheme: dark)").matches;
        setResolvedTheme(prefersLight ? "light" : "dark");
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemChange);
    } else {
      mediaQuery.addListener(handleSystemChange);
    }

    const onThemeChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches && !window.matchMedia("(prefers-color-scheme: dark)").matches;
        const active = customEvent.detail === "system"
          ? (prefersLight ? "light" : "dark")
          : (customEvent.detail === "light" ? "light" : "dark");
        setResolvedTheme(active);
      }
    };

    window.addEventListener("debtproof_theme_changed", onThemeChanged);
    return () => {
      window.removeEventListener("debtproof_theme_changed", onThemeChanged);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemChange);
      } else {
        mediaQuery.removeListener(handleSystemChange);
      }
    };
  }, []);

  useEffect(() => {
    applyGlobalTheme(theme);
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches && !window.matchMedia("(prefers-color-scheme: dark)").matches;
    const active = theme === "system" ? (prefersLight ? "light" : "dark") : (theme === "light" ? "light" : "dark");
    setResolvedTheme(active);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyGlobalTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
