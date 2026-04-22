import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCards } from "@/components/panel/KpiCards";
import {
  FeedActividad,
  type AuditEntryWithUser,
} from "@/components/panel/FeedActividad";
import { CompetitionsTable } from "@/components/panel/CompetitionsTable";
import { getGlobalPanelStats } from "@/lib/queries/global-stats";
import { listCompetitions } from "@/lib/queries/competitions";
import { getAuditLog } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelHomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Non-super_admin users: redirect to first available competition.
  if (session.rol !== "super_admin") {
    const all = await listCompetitions();
    if (all.length > 0) {
      redirect(`/panel/competiciones/${all[0].id}`);
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-2xl font-bold">Sin competiciones asignadas</h1>
          <p className="text-muted-foreground text-sm">
            No hay competiciones disponibles todavía.
          </p>
        </div>
      </div>
    );
  }

  const [stats, competitions, audit] = await Promise.all([
    getGlobalPanelStats(),
    listCompetitions(),
    getAuditLog(null, 15),
  ]);

  const recientes = competitions.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Panel global</h1>
            <p className="text-sm text-muted-foreground">
              Torre de control de todas las competiciones.
            </p>
          </div>
          <Button asChild>
            <Link href="/panel/competiciones/nueva">
              <Plus className="h-4 w-4 mr-2" /> Nueva competición
            </Link>
          </Button>
        </div>

        <KpiCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Competiciones recientes</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/panel/competiciones">
                  Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <CompetitionsTable competitions={recientes} />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Actividad reciente</h2>
            <FeedActividad entries={audit as AuditEntryWithUser[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
