import type { Metadata } from "next";
import AdminPreviewShell from "@/components/AdminPreviewShell";
import ExpertTasksClient from "@/components/expert/ExpertTasksClient";
import ExpertTasksGate from "@/components/expert/ExpertTasksGate";
import { isAdminAuthenticated } from "@/lib/auth";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Experten-Aufgaben",
  description:
    "Python-Code schreiben, mit Pyodide ausführen und automatisch prüfen lassen – drei Level für Fortgeschrittene.",
  path: "/experten-aufgaben",
});

export default async function ExpertTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const adminPreview = preview === "1" && (await isAdminAuthenticated());

  if (adminPreview) {
    return (
      <AdminPreviewShell>
        <ExpertTasksClient adminPreview />
      </AdminPreviewShell>
    );
  }

  return (
    <ExpertTasksGate>
      <ExpertTasksClient />
    </ExpertTasksGate>
  );
}
