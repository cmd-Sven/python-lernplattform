import { NextResponse } from "next/server";
import { createGuestbookEntry, getGuestbookEntries } from "@/lib/data";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function GET() {
  try {
    const entries = await getGuestbookEntries(true);
    return NextResponse.json({ entries });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, "Gästebuch konnte nicht geladen werden.") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { visitorId, authorName, comment, stars } = body as {
    visitorId?: string;
    authorName?: string;
    comment?: string;
    stars?: number;
  };

  if (!authorName?.trim()) {
    return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
  }
  if (!comment?.trim()) {
    return NextResponse.json({ error: "Kommentar fehlt" }, { status: 400 });
  }
  if (typeof stars !== "number" || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Bitte 1 bis 5 Sterne wählen." }, { status: 400 });
  }

  try {
    const entry = await createGuestbookEntry({
      visitorId: visitorId?.trim(),
      authorName,
      comment,
      stars,
    });
    return NextResponse.json({ ok: true, entry });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, "Eintrag konnte nicht gespeichert werden.") },
      { status: 500 },
    );
  }
}
