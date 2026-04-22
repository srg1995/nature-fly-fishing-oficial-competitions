import Link from "next/link";
import { Trophy, MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listCompetitions } from "@/lib/queries/competitions";
import type { EstadoCompeticion, NivelCompeticion } from "@/types";

export const dynamic = "force-dynamic";

const nivelLabel: Record<NivelCompeticion, string> = {
  nacional: "Nacional",
  autonomica: "Autonómica",
  provincial: "Provincial",
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

export default async function PublicCompetitionsPage() {
  const competitions = await listCompetitions({
    estadosIn: ["publicada", "en_curso", "finalizada"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="py-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold">Competiciones</h1>
          <p className="text-muted-foreground mt-2">
            Todas las competiciones publicadas en la plataforma.
          </p>
        </div>

        {competitions.length === 0 ? (
          <div className="border rounded-lg p-12 text-center text-muted-foreground">
            Aún no hay competiciones publicadas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitions.map((c) => (
              <Link key={c.id} href={`/competiciones/${c.slug}`}>
                <Card className="h-full hover:border-primary transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline">{nivelLabel[c.nivel]}</Badge>
                      <Badge>{estadoLabel[c.estado]}</Badge>
                    </div>
                    <h2 className="font-semibold leading-tight">{c.nombre}</h2>
                    {c.edicion ? (
                      <p className="text-xs text-muted-foreground">
                        {c.edicion}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatRange(c.fechaInicio, c.fechaFin)}
                    </div>
                    {c.lugar ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {c.lugar}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
