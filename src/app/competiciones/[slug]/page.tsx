import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  Fish,
  Ruler,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCompetitionBySlug } from "@/lib/queries/competitions";
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

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicCompetitionDetailPage({ params }: Props) {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug);
  if (!competition) notFound();
  if (
    competition.estado === "borrador" ||
    competition.estado === "archivada"
  ) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Link
          href="/competiciones"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a competiciones
        </Link>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{nivelLabel[competition.nivel]}</Badge>
            <Badge>{estadoLabel[competition.estado]}</Badge>
          </div>
          <h1 className="text-3xl font-bold flex items-start gap-3">
            <Trophy className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            {competition.nombre}
          </h1>
          {competition.edicion ? (
            <p className="text-muted-foreground">{competition.edicion}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Fechas</div>
                <div className="font-medium">
                  {formatRange(competition.fechaInicio, competition.fechaFin)}
                </div>
              </div>
            </CardContent>
          </Card>

          {competition.lugar ? (
            <Card>
              <CardContent className="p-5 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Lugar</div>
                  <div className="font-medium">{competition.lugar}</div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {competition.organizador ? (
            <Card>
              <CardContent className="p-5 flex items-start gap-3">
                <Users className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    Organizador
                  </div>
                  <div className="font-medium">{competition.organizador}</div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Fish className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Mangas</div>
                <div className="font-medium">{competition.totalMangas}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Ruler className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">
                  Talla mínima
                </div>
                <div className="font-medium">
                  {competition.minimaLongitud} cm
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {competition.descripcion ? (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-2">Descripción</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {competition.descripcion}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {competition.rios.length > 0 || competition.tramos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competition.rios.length > 0 ? (
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-semibold mb-2">Ríos</h2>
                  <div className="flex flex-wrap gap-2">
                    {competition.rios.map((r) => (
                      <Badge key={r} variant="outline">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
            {competition.tramos.length > 0 ? (
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-semibold mb-2">Tramos</h2>
                  <div className="flex flex-wrap gap-2">
                    {competition.tramos.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
