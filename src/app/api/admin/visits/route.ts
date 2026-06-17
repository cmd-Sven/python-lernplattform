import { NextResponse } from "next/server";
import { getVisitorStats } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weeks = Math.min(12, Math.max(1, Number(searchParams.get("weeks") ?? 4)));

  try {
    const stats = await getVisitorStats(weeks);
    return NextResponse.json({ stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Statistik nicht verfügbar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
