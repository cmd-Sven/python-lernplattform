import { NextResponse } from "next/server";
import { recordVisitorHit } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json();
  const { visitorId, path } = body as { visitorId?: string; path?: string };

  if (!visitorId?.trim()) {
    return NextResponse.json({ error: "visitorId fehlt" }, { status: 400 });
  }

  try {
    await recordVisitorHit(visitorId, path ?? "/");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
