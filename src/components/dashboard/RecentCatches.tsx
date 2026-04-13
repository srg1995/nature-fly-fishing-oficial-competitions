"use client";

import { Fish, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecentCatch } from "@/types";
import { calcularPuntos, LONGITUD_MINIMA_VALIDA } from "@/lib/puntuacion";
import { formatTime } from "@/lib/utils";

interface RecentCatchesProps {
  catches: RecentCatch[];
  isLoading?: boolean;
}

export function RecentCatches({ catches, isLoading }: RecentCatchesProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Últimas Capturas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : catches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Fish className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No hay capturas registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {catches.map((c) => {
              const esValida = c.longitudCm >= LONGITUD_MINIMA_VALIDA;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.nombreDuo}</p>
                    <p className="text-xs text-muted-foreground">
                      Manga {c.manga} · {formatTime(c.hora)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <Badge variant={esValida ? "success" : "warning"} className="text-xs">
                      {c.longitudCm} cm
                    </Badge>
                    <span className="text-sm font-bold text-primary">
                      {calcularPuntos(c.longitudCm)} pts
                    </span>
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
