"use client";

import { useEffect, useMemo, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";
import {
  normalizeCodeText,
  resolveCodeLanguage,
  shikiThemeForApp,
} from "@/lib/codeHighlight";
import { useAppTheme } from "@/lib/useAppTheme";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["python", "text"],
    });
  }
  return highlighterPromise;
}

interface CodeBlockProps {
  code: string;
  label?: string;
  language?: string;
  showCopy?: boolean;
  className?: string;
}

export default function CodeBlock({
  code,
  label = "Code-Beispiel",
  language = "python",
  showCopy = true,
  className = "",
}: CodeBlockProps) {
  const appTheme = useAppTheme();
  const normalized = useMemo(() => normalizeCodeText(code), [code]);
  const lang = resolveCodeLanguage(language);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return;
        const shikiTheme = shikiThemeForApp(appTheme);
        const useLang = highlighter.getLoadedLanguages().includes(lang) ? lang : "text";
        setHighlightedHtml(
          highlighter.codeToHtml(normalized, {
            lang: useLang,
            theme: shikiTheme,
          }),
        );
      })
      .catch(() => {
        if (!cancelled) setHighlightedHtml(null);
      });

    return () => {
      cancelled = true;
    };
  }, [normalized, lang, appTheme]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(normalized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard nicht verfügbar */
    }
  }

  const showHeader = Boolean(label) || showCopy;

  return (
    <div className={`code-block-shell ${className}`.trim()}>
      {showHeader && (
        <div className="flex items-center justify-between mb-2 gap-2">
          {label ? (
            <p className="text-xs font-semibold uppercase opacity-60">{label}</p>
          ) : (
            <span />
          )}
          {showCopy && (
            <button
              type="button"
              className="btn btn-ghost btn-xs gap-1 shrink-0"
              onClick={handleCopy}
              aria-label="Code kopieren"
            >
              {copied ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-success"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Kopiert!
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                  Kopieren
                </>
              )}
            </button>
          )}
        </div>
      )}
      {highlightedHtml ? (
        <div
          className="code-block-shiki text-sm overflow-x-auto rounded-lg"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="code-block text-sm overflow-x-auto rounded-lg">
          <code>{normalized}</code>
        </pre>
      )}
    </div>
  );
}
