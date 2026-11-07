import type { EstadoCompeticion, NivelCompeticion } from "@/types";

export const nivelLabel: Record<NivelCompeticion, string> = {
  nacional: "Nacional",
  autonomica: "Autonómica",
  provincial: "Provincial",
  open: "Open",
};

export const estadoLabel: Record<EstadoCompeticion, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  en_curso: "En curso",
  finalizada: "Finalizada",
  archivada: "Archivada",
};

export function formatRange(inicio: string, fin: string): string {
  const ini = new Date(inicio);
  const f = new Date(fin);
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  return `${ini.toLocaleDateString("es-ES", opts)} – ${f.toLocaleDateString(
    "es-ES",
    opts
  )}`;
}
