"use client";

import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { RecentCatch } from "@/types";
import { formatTime } from "@/lib/utils";
import { LONGITUD_MINIMA_VALIDA } from "@/lib/puntuacion";

interface CapturaListProps {
  capturas: RecentCatch[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function CapturaList({ capturas, onDelete, isLoading }: CapturaListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (capturas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Sin capturas en esta sesión
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {capturas.map((c) => {
        const esValida = c.longitudCm >= LONGITUD_MINIMA_VALIDA;
        return (
          <div
            key={c.id}
            className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="flex-shrink-0">
              {c.valida ? (
                <CheckCircle2 className="w-5 h-5 text-forest-500" />
              ) : (
                <XCircle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{c.longitudCm} cm</span>
                <Badge variant={esValida ? "success" : "warning"} className="text-xs">
                  {c.puntos} pts
                </Badge>
                {!c.valida && (
                  <Badge variant="outline" className="text-xs">No válida</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {c.nombreDuo} · Manga {c.manga}
                {c.hora ? ` · ${formatTime(c.hora)}` : ""}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="flex-shrink-0 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar captura?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminará la captura de {c.longitudCm} cm del dúo {c.nombreDuo}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => onDelete(c.id)}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}
    </div>
  );
}
