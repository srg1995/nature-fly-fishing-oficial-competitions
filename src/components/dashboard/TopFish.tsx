"use client";

import { Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BestFish } from "@/types";

interface TopFishProps {
  fish: BestFish[];
  isLoading?: boolean;
}

const medals = ["🥇", "🥈", "🥉", "4º", "5º"];

export function TopFish({ fish, isLoading }: TopFishProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Medal className="w-4 h-4 text-amber-500" />
          Mejores Piezas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : fish.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin capturas aún</p>
        ) : (
          <div className="space-y-2">
            {fish.map((f, i) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{medals[i] ?? `${i + 1}º`}</span>
                  <div>
                    <p className="text-sm font-medium">{f.nombreDuo}</p>
                    <p className="text-xs text-muted-foreground">Manga {f.manga}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="river" className="font-bold">
                    {f.longitudCm} cm
                  </Badge>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {f.puntos} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
