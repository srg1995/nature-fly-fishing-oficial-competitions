"use client";

import { ResultadosTable } from "@/components/resultados/ResultadosTable";
import { ExportButton } from "@/components/resultados/ExportButton";
import { useClasificacion } from "@/hooks/use-stats";
import { useCurrentCompetition } from "@/hooks/use-current-competition";

export default function ResultadosPage() {
  const competition = useCurrentCompetition();
  const { data: clasificacion = [], isLoading } = useClasificacion(competition.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resultados</h2>
          <p className="text-muted-foreground text-sm">
            Tabla completa de clasificación con filtros y ordenación
          </p>
        </div>
        <ExportButton />
      </div>

      <ResultadosTable data={clasificacion} isLoading={isLoading} />
    </div>
  );
}
