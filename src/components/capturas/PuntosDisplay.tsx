"use client";

import { calcularPuntos, describePuntuacion, LONGITUD_MINIMA_VALIDA } from "@/lib/puntuacion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PuntosDisplayProps {
  longitudCm: number | null;
  className?: string;
}

export function PuntosDisplay({ longitudCm, className }: PuntosDisplayProps) {
  if (longitudCm === null || longitudCm <= 0) {
    return (
      <div className={cn("p-4 rounded-xl bg-muted/50 text-center", className)}>
        <p className="text-sm text-muted-foreground">Introduce la longitud para ver los puntos</p>
      </div>
    );
  }

  const puntos = calcularPuntos(longitudCm);
  const esValida = longitudCm >= LONGITUD_MINIMA_VALIDA;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2 text-center transition-all",
        esValida
          ? "border-forest-300 bg-forest-50 dark:border-forest-700 dark:bg-forest-950/50"
          : "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <Badge variant={esValida ? "success" : "warning"}>
          {esValida ? "Talla mínima" : `< ${LONGITUD_MINIMA_VALIDA} cm`}
        </Badge>
      </div>
      <p className="text-4xl font-bold text-primary">{puntos}</p>
      <p className="text-sm text-muted-foreground mt-1">puntos</p>
      <p className="text-xs text-muted-foreground mt-2 font-mono">{describePuntuacion(longitudCm)}</p>
    </div>
  );
}
