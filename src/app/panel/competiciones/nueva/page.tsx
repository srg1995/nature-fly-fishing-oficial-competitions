import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { NuevaCompeticionWizard } from "@/components/panel/wizard/NuevaCompeticionWizard";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NuevaCompeticionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.rol !== "super_admin") redirect("/panel");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/panel/competiciones">
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nueva competición</h1>
            <p className="text-sm text-muted-foreground">
              Crea una competición a nivel nacional, autonómico o provincial.
            </p>
          </div>
        </div>
        <NuevaCompeticionWizard />
      </div>
    </div>
  );
}
