"use client";

import { RefreshCw } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { TopFish } from "@/components/dashboard/TopFish";
import { LiveRanking } from "@/components/dashboard/LiveRanking";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/use-stats";
import { useCurrentCompetition } from "@/hooks/use-current-competition";

export default function DashboardPage() {
  const competition = useCurrentCompetition();
  const { data, isLoading, refetch, isFetching } = useStats(competition.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{competition.nombre}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {competition.edicion ? `${competition.edicion} · ` : ""}
            {competition.lugar ?? ""}
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

      <StatsCards
        totalPescadores={data?.totalPescadores ?? 0}
        totalCapturas={data?.totalCapturas ?? 0}
        totalPuntos={data?.totalPuntos ?? 0}
        mangasActivas={data?.mangasActivas ?? 0}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveRanking pescadores={data?.topPescadores ?? []} isLoading={isLoading} />
        <TopFish fish={data?.bestFish ?? []} isLoading={isLoading} />
      </div>

      <RecentCatches catches={data?.recentCatches ?? []} isLoading={isLoading} />
    </div>
  );
}
