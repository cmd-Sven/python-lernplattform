"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getOrCreateVisitorId } from "@/lib/visitor";

const SESSION_KEY_PREFIX = "pcep-visit-logged-";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const today = new Date().toISOString().slice(0, 10);
    const sessionKey = `${SESSION_KEY_PREFIX}${today}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    void fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, path: pathname || "/" }),
    })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(sessionKey, "1");
      })
      .catch(() => {
        // Tracking ist optional
      });
  }, [pathname]);

  return null;
}
