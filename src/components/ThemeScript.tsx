import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

export default function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
        var theme = stored === "light" || stored === "dark" || stored === "contrast"
          ? stored
          : "${DEFAULT_THEME}";
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "${DEFAULT_THEME}");
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
