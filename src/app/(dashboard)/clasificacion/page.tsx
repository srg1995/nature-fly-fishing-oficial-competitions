"use client";

import { RefreshCw, Trophy, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/resultados/ExportButton";
import { useClasificacion } from "@/hooks/use-stats";
import { cn } from "@/lib/utils";

const positionColors: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "bg-amber-400", text: "text-amber-900", border: "border-amber-400" },
  2: { bg: "bg-slate-300", text: "text-slate-800", border: "border-slate-300" },
  3: { bg: "bg-orange-400", text: "text-orange-900", border: "border-orange-400" },
};

export default function ClasificacionPage() {
  const { data: clasificacion = [], isLoading, refetch, isFetching } = useClasificacion();
  const top10 = clasificacion.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Clasificación en Vivo
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Top 10 · Actualización automática cada 30 segundos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            Actualizar
          </Button>
          <ExportButton />
        </div>
      </div>

      {/* Podium — top 3 */}
      {!isLoading && top10.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd */}
          <div className="flex flex-col items-center pt-8">
            <div className="text-3xl mb-2">🥈</div>
            <Card className="w-full border-slate-300 border-2">
              <CardContent className="p-4 text-center">
                <p className="font-bold">{top10[1].nombreDuo}</p>
                <p className="text-xs text-muted-foreground">{top10[1].pescador1}</p>
                <p className="text-xs text-muted-foreground">{top10[1].pescador2}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {top10[1].totalPuntos.toLocaleString("es-ES")}
                </p>
                <p className="text-xs text-muted-foreground">puntos</p>
              </CardContent>
            </Card>
          </div>

          {/* 1st */}
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">🥇</div>
            <Card className="w-full border-amber-400 border-2 shadow-lg shadow-amber-100 dark:shadow-amber-900/20">
              <CardContent className="p-4 text-center">
                <Badge className="mb-1 bg-amber-400 text-amber-900 border-0">Líder</Badge>
                <p className="font-bold text-lg">{top10[0].nombreDuo}</p>
                <p className="text-xs text-muted-foreground">{top10[0].pescador1}</p>
                <p className="text-xs text-muted-foreground">{top10[0].pescador2}</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {top10[0].totalPuntos.toLocaleString("es-ES")}
                </p>
                <p className="text-xs text-muted-foreground">puntos</p>
              </CardContent>
            </Card>
          </div>

          {/* 3rd */}
          <div className="flex flex-col items-center pt-12">
            <div className="text-3xl mb-2">🥉</div>
            <Card className="w-full border-orange-400 border-2">
              <CardContent className="p-4 text-center">
                <p className="font-bold">{top10[2].nombreDuo}</p>
                <p className="text-xs text-muted-foreground">{top10[2].pescador1}</p>
                <p className="text-xs text-muted-foreground">{top10[2].pescador2}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {top10[2].totalPuntos.toLocaleString("es-ES")}
                </p>
                <p className="text-xs text-muted-foreground">puntos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Full top 10 list */}
      <div className="space-y-2">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
            ))
          : top10.map((duo, idx) => {
              const pos = idx + 1;
              const colors = positionColors[pos];
              return (
                <Card
                  key={duo.duoId}
                  className={cn(
                    "transition-all",
                    colors && `border-2 ${colors.border}`
                  )}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Position */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg flex-shrink-0",
                        colors ? `${colors.bg} ${colors.text}` : "bg-muted text-muted-foreground"
                      )}
                    >
                      {pos <= 3 ? <Medal className="w-5 h-5" /> : pos}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate">{duo.nombreDuo}</p>
                      <p className="text-sm text-muted-foreground">
                        {duo.pescador1} · {duo.pescador2}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {duo.plica && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {duo.plica}
                          </Badge>
                        )}
                        {duo.tramo && (
                          <span className="text-xs text-muted-foreground">{duo.tramo}</span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-center hidden sm:block">
                        <p className="text-lg font-bold">{duo.capturasValidas}</p>
                        <p className="text-xs text-muted-foreground">capturas</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-lg font-bold">{duo.mejorPieza} cm</p>
                        <p className="text-xs text-muted-foreground">mejor pieza</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {duo.totalPuntos.toLocaleString("es-ES")}
                        </p>
                        <p className="text-xs text-muted-foreground">puntos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Rest of classification */}
      {!isLoading && clasificacion.length > 10 && (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-muted-foreground px-2">Resto de clasificación</p>
          {clasificacion.slice(10).map((duo, idx) => (
            <div
              key={duo.duoId}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="w-8 text-center text-sm font-medium text-muted-foreground">
                {idx + 11}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{duo.nombreDuo}</p>
                <p className="text-xs text-muted-foreground">
                  {duo.pescador1} · {duo.pescador2}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="success" className="text-xs">
                  {duo.capturasValidas} cap.
                </Badge>
                <span className="text-sm font-bold text-primary">
                  {duo.totalPuntos.toLocaleString("es-ES")} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
