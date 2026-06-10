"use client";

import type { ReactNode } from "react";

interface PytoStickyAsideProps {
  children: ReactNode;
  className?: string;
}

export default function PytoStickyAside({
  children,
  className = "",
}: PytoStickyAsideProps) {
  return (
    <aside
      className={`pyto-sticky-aside w-full md:w-52 lg:w-60 shrink-0 ${className}`.trim()}
    >
      <div className="sticky top-4 z-10 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        {children}
      </div>
    </aside>
  );
}
