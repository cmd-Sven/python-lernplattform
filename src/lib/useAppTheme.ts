"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, isAppTheme, type AppTheme } from "./themes";

export function readAppTheme(): AppTheme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const theme = document.documentElement.getAttribute("data-theme") ?? DEFAULT_THEME;
  return isAppTheme(theme) ? theme : DEFAULT_THEME;
}

export function useAppTheme(): AppTheme {
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);

  useEffect(() => {
    setTheme(readAppTheme());

    const observer = new MutationObserver(() => {
      setTheme(readAppTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
