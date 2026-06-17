import { NextResponse } from "next/server";
import {
  deleteGuestbookEntry,
  getGuestbookEntries,
  updateGuestbookEntry,
} from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  return null;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const entries = await getGuestbookEntries();
    return NextResponse.json({ entries });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, "Gästebuch konnte nicht geladen werden.") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { action } = body as { action?: string };

  if (action === "update-entry") {
    const { entryId, authorName, comment, stars, active } = body as {
      entryId?: string;
      authorName?: string;
      comment?: string;
      stars?: number;
      active?: boolean;
    };

    if (!entryId?.trim()) {
      return NextResponse.json({ error: "entryId fehlt" }, { status: 400 });
    }

    try {
      const entry = await updateGuestbookEntry(entryId, {
        authorName,
        comment,
        stars,
        active,
      });
      return NextResponse.json({ ok: true, entry });
    } catch (err) {
      return NextResponse.json(
        { error: getErrorMessage(err, "Speichern fehlgeschlagen") },
        { status: 500 },
      );
    }
  }

  if (action === "toggle-active") {
    const { entryId, active } = body as { entryId?: string; active?: boolean };
    if (!entryId?.trim()) {
      return NextResponse.json({ error: "entryId fehlt" }, { status: 400 });
    }

    try {
      const entry = await updateGuestbookEntry(entryId, { active: Boolean(active) });
      return NextResponse.json({ ok: true, entry });
    } catch (err) {
      return NextResponse.json(
        { error: getErrorMessage(err, "Status konnte nicht geändert werden.") },
        { status: 500 },
      );
    }
  }

  if (action === "delete-entry") {
    const { entryId } = body as { entryId?: string };
    if (!entryId?.trim()) {
      return NextResponse.json({ error: "entryId fehlt" }, { status: 400 });
    }

    try {
      await deleteGuestbookEntry(entryId);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json(
        { error: getErrorMessage(err, "Löschen fehlgeschlagen") },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}
