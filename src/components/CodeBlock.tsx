"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  label?: string;
}

export default function CodeBlock({ code, label = "Code-Beispiel" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard nicht verfügbar */
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase opacity-60">{label}</p>
        <button
          type="button"
          className="btn btn-ghost btn-xs gap-1"
          onClick={handleCopy}
          aria-label="Code kopieren"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-success">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              Kopiert!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
              Kopieren
            </>
          )}
        </button>
      </div>
      <pre className="code-block text-sm overflow-x-auto rounded-lg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
