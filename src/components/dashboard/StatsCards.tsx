"use client";

import { Users, Fish, Trophy, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  totalPescadores: number;
  totalCapturas: number;
  totalPuntos: number;
  mangasActivas: number;
  isLoading?: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  isLoading?: boolean;
}

function StatCard({ label, value, icon: Icon, color, bg, isLoading }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-1">
                {typeof value === "number" ? value.toLocaleString("es-ES") : value}
              </p>
            )}
          </div>
          <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl", bg)}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({
  totalPescadores, totalCapturas, totalPuntos, mangasActivas, isLoading,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Pescadores",
      value: totalPescadores,
      icon: Users,
      color: "text-river-600 dark:text-river-400",
      bg: "bg-river-100 dark:bg-river-900/30",
    },
    {
      label: "Capturas Registradas",
      value: totalCapturas,
      icon: Fish,
      color: "text-forest-600 dark:text-forest-400",
      bg: "bg-forest-100 dark:bg-forest-900/30",
    },
    {
      label: "Puntos Acumulados",
      value: totalPuntos,
      icon: Trophy,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Mangas Activas",
      value: mangasActivas,
      icon: Waves,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} isLoading={isLoading} />
      ))}
    </div>
  );
}
