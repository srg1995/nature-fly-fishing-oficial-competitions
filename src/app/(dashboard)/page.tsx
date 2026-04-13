"use client";

import { RefreshCw } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { TopFish } from "@/components/dashboard/TopFish";
import { LiveRanking } from "@/components/dashboard/LiveRanking";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/use-stats";

export default function DashboardPage() {
  const { data, isLoading, refetch, isFetching } = useStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">VI Campeonato Nacional</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Salmónidos Lance Mosca Dúos — Captura y Suelta Absoluta
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <StatsCards
        totalDuos={data?.totalDuos ?? 0}
        totalCapturas={data?.totalCapturas ?? 0}
        totalPuntos={data?.totalPuntos ?? 0}
        mangasActivas={data?.mangasActivas ?? 0}
        isLoading={isLoading}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveRanking duos={data?.topDuos ?? []} isLoading={isLoading} />
        <TopFish fish={data?.bestFish ?? []} isLoading={isLoading} />
      </div>

      {/* Recent catches */}
      <RecentCatches catches={data?.recentCatches ?? []} isLoading={isLoading} />
    </div>
  );
}
