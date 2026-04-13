"use client";

import { useQuery } from "@tanstack/react-query";
import type { DuoStats, MangaStats, RecentCatch, BestFish } from "@/types";

interface StatsResponse {
  totalDuos: number;
  totalCapturas: number;
  totalPuntos: number;
  mangasActivas: number;
  topDuos: DuoStats[];
  mangaStats: MangaStats[];
  recentCatches: RecentCatch[];
  bestFish: BestFish[];
}

async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Error al cargar las estadísticas");
  const json = (await res.json()) as { data: StatsResponse };
  return json.data;
}

async function fetchClasificacion(): Promise<DuoStats[]> {
  const res = await fetch("/api/clasificacion");
  if (!res.ok) throw new Error("Error al cargar la clasificación");
  const json = (await res.json()) as { data: DuoStats[] };
  return json.data;
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });
}

export function useClasificacion() {
  return useQuery({
    queryKey: ["clasificacion"],
    queryFn: fetchClasificacion,
    refetchInterval: 30_000,
  });
}
