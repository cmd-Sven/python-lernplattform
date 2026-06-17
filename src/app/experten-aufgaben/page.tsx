import AdminPreviewShell from "@/components/AdminPreviewShell";
import ExpertTasksClient from "@/components/expert/ExpertTasksClient";
import ExpertTasksGate from "@/components/expert/ExpertTasksGate";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Experten-Aufgaben | PCEP Lernplattform",
  description: "Code schreiben, ausführen und automatisch prüfen lassen – Level 1 bis 3.",
};

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
