"use client";

import { Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DuoStats } from "@/types";

interface LiveRankingProps {
  duos: DuoStats[];
  isLoading?: boolean;
}

const positionColors: Record<number, string> = {
  1: "bg-amber-400 text-amber-900",
  2: "bg-slate-300 text-slate-800",
  3: "bg-orange-400 text-orange-900",
};

export function LiveRanking({ duos, isLoading }: LiveRankingProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-amber-500" />
            Clasificación en Vivo
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>En tiempo real</span>
          </div>
        </div>
        <CardDescription>Top 5 dúos por puntuación</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : duos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin datos de clasificación
          </p>
        ) : (
          <div className="space-y-2">
            {duos.slice(0, 5).map((duo, idx) => {
              const pos = idx + 1;
              const colorClass = positionColors[pos] ?? "bg-muted text-muted-foreground";
              return (
                <div
                  key={duo.duoId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${colorClass}`}
                  >
                    {pos}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{duo.nombreDuo}</p>
                    <p className="text-xs text-muted-foreground">
                      {duo.pescador1} · {duo.pescador2}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-primary">
                      {duo.totalPuntos.toLocaleString("es-ES")}
                    </p>
                    <Badge variant="success" className="text-xs">
                      {duo.capturasValidas} capturas
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
