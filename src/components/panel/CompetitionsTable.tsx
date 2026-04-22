"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Competition, EstadoCompeticion, NivelCompeticion } from "@/types";

const nivelLabel: Record<NivelCompeticion, string> = {
  nacional: "Nacional",
  autonomica: "Autonómica",
  provincial: "Provincial",
};

const estadoVariant: Record<
  EstadoCompeticion,
  "default" | "secondary" | "destructive" | "outline"
> = {
  borrador: "outline",
  publicada: "secondary",
  en_curso: "default",
  finalizada: "secondary",
  archivada: "outline",
};

const estadoLabel: Record<EstadoCompeticion, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  en_curso: "En curso",
  finalizada: "Finalizada",
  archivada: "Archivada",
};

function formatRange(inicio: string, fin: string): string {
  const ini = new Date(inicio);
  const f = new Date(fin);
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  if (ini.getFullYear() === f.getFullYear()) {
    return `${ini.toLocaleDateString("es-ES", opts)} – ${f.toLocaleDateString(
      "es-ES",
      { ...opts, year: "numeric" }
    )}`;
  }
  return `${ini.toLocaleDateString("es-ES", {
    ...opts,
    year: "numeric",
  })} – ${f.toLocaleDateString("es-ES", { ...opts, year: "numeric" })}`;
}

interface Props {
  competitions: Competition[];
  isLoading?: boolean;
}

export function CompetitionsTable({ competitions, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
        Cargando competiciones...
      </div>
    );
  }
  if (competitions.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-semibold">No hay competiciones</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ajusta los filtros o crea una nueva competición.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Competición</th>
              <th className="px-4 py-3 text-left font-medium">Nivel</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Fechas</th>
              <th className="px-4 py-3 text-left font-medium">Lugar</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((c) => (
              <tr
                key={c.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/panel/competiciones/${c.id}`}
                    className="font-medium hover:underline"
                  >
                    {c.nombre}
                  </Link>
                  {c.edicion ? (
                    <div className="text-xs text-muted-foreground">
                      {c.edicion}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">{nivelLabel[c.nivel]}</td>
                <td className="px-4 py-3">
                  <Badge variant={estadoVariant[c.estado]}>
                    {estadoLabel[c.estado]}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatRange(c.fechaInicio, c.fechaFin)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.lugar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
