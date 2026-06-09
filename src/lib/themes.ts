export type AppTheme = "light" | "dark" | "contrast";

export const THEME_STORAGE_KEY = "pcep-theme";

export const DEFAULT_THEME: AppTheme = "light";

export const THEMES: { id: AppTheme; label: string; icon: string }[] = [
  { id: "light", label: "White", icon: "☀️" },
  { id: "dark", label: "Dark", icon: "🌙" },
  { id: "contrast", label: "Kontrast", icon: "◐" },
];

export function isAppTheme(value: string): value is AppTheme {
  return THEMES.some((t) => t.id === value);
}
