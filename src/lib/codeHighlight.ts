import type { AppTheme } from "./themes";

export function normalizeCodeText(code: string): string {
  return code.replace(/\r\n/g, "\n").replace(/\t/g, "    ").trimEnd();
}

export function shikiThemeForApp(theme: AppTheme): string {
  if (theme === "dark" || theme === "contrast") return "github-dark";
  return "github-light";
}

export function resolveCodeLanguage(language?: string): string {
  const normalized = (language ?? "python").trim().toLowerCase();
  if (normalized === "py") return "python";
  if (normalized === "" || normalized === "text" || normalized === "plaintext") {
    return "text";
  }
  return normalized;
}
