"use client";

import { useQuery } from "@tanstack/react-query";
import type { PescadorStats, MangaStats, RecentCatch, BestFish } from "@/types";

export interface StatsResponse {
  totalPescadores: number;
  totalCapturas: number;
  totalPuntos: number;
  mangasActivas: number;
  topPescadores: PescadorStats[];
  mangaStats: MangaStats[];
  recentCatches: RecentCatch[];
  bestFish: BestFish[];
}

async function fetchStats(competitionId: string): Promise<StatsResponse> {
  const res = await fetch(`/api/competiciones/${competitionId}/stats`);
  if (!res.ok) throw new Error("Error al cargar estadísticas");
  const json = (await res.json()) as { data: StatsResponse };
  return json.data;
}

async function fetchClasificacion(
  competitionId: string
): Promise<PescadorStats[]> {
  const res = await fetch(`/api/competiciones/${competitionId}/clasificacion`);
  if (!res.ok) throw new Error("Error al cargar clasificación");
  const json = (await res.json()) as { data: PescadorStats[] };
  return json.data;
}

export function useStats(competitionId: string) {
  return useQuery({
    queryKey: ["stats", competitionId],
    queryFn: () => fetchStats(competitionId),
    refetchInterval: 30_000,
  });
}

export function useClasificacion(competitionId: string) {
  return useQuery({
    queryKey: ["clasificacion", competitionId],
    queryFn: () => fetchClasificacion(competitionId),
    refetchInterval: 30_000,
  });
}
