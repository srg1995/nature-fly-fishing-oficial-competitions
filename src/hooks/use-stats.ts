"use client";

import { useQuery } from "@tanstack/react-query";
import {
  MOCK_STATS_RESPONSE,
  MOCK_CLASIFICACION,
} from "@/lib/mock-data";
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

async function fetchStats(): Promise<StatsResponse> {
  // TODO: reemplazar por fetch("/api/stats") cuando la BD esté conectada
  await new Promise((resolve) => setTimeout(resolve, 400)); // simula latencia
  return MOCK_STATS_RESPONSE;
}

async function fetchClasificacion(): Promise<PescadorStats[]> {
  // TODO: reemplazar por fetch("/api/clasificacion") cuando la BD esté conectada
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_CLASIFICACION;
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 30_000,
  });
}

export function useClasificacion() {
  return useQuery({
    queryKey: ["clasificacion"],
    queryFn: fetchClasificacion,
    refetchInterval: 30_000,
  });
}
