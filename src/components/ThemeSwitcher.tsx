"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  type AppTheme,
  isAppTheme,
} from "@/lib/themes";

function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const initial = stored && isAppTheme(stored) ? stored : DEFAULT_THEME;
    setTheme(initial);
    setMounted(true);
  }, []);

  function selectTheme(next: AppTheme) {
    setTheme(next);
    applyTheme(next);
  }

  if (!mounted) {
    return (
      <div className="join join-horizontal">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="btn btn-ghost btn-sm join-item"
            aria-hidden
            tabIndex={-1}
          >
            {t.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="join join-horizontal"
      role="group"
      aria-label="Farbschema wählen"
    >
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`btn btn-sm join-item gap-1 ${
            theme === t.id ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => selectTheme(t.id)}
          aria-pressed={theme === t.id}
          title={t.label}
        >
          <span aria-hidden>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
