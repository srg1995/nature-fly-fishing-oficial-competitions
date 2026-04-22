import { redirect } from "next/navigation";
import { listCompetitions } from "@/lib/queries/competitions";

export const dynamic = "force-dynamic";

export default async function PanelHomePage() {
  // Placeholder hasta la Fase 2: redirige a la primera competición disponible.
  // La Fase 2 reemplazará esta página por el dashboard global con KPIs.
  const competitions = await listCompetitions();
  if (competitions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-2xl font-bold">Panel global</h1>
          <p className="text-muted-foreground text-sm">
            No hay competiciones configuradas todavía. El dashboard global se
            incorporará en la próxima fase.
          </p>
        </div>
      </div>
    );
  }
  redirect(`/panel/competiciones/${competitions[0].id}`);
}
