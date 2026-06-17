import type { Metadata } from "next";
import AdminPreviewShell from "@/components/AdminPreviewShell";
import MazeGame from "@/components/maze/MazeGame";
import LabyrinthGate from "@/components/maze/LabyrinthGate";
import { isAdminAuthenticated } from "@/lib/auth";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Pyto's Python-Labyrinth",
  description:
    "Steuere Pyto mit Python-Code durch ein Labyrinth – Belohnung nach Lektion 2 auf der PCEP Lernplattform.",
  path: "/labyrinth",
});

export default async function LabyrinthPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const adminPreview = preview === "1" && (await isAdminAuthenticated());

  if (adminPreview) {
    return (
      <AdminPreviewShell>
        <MazeGame adminPreview />
      </AdminPreviewShell>
    );
  }

  return (
    <LabyrinthGate>
      <MazeGame />
    </LabyrinthGate>
  );
}
