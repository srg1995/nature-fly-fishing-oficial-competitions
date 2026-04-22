"use client";

import { useQuery } from "@tanstack/react-query";
import type { ComunidadAutonoma, Provincia } from "@/types";

async function fetchCCAA(): Promise<ComunidadAutonoma[]> {
  const res = await fetch("/api/geografia/ccaa");
  if (!res.ok) throw new Error("Error al cargar comunidades autónomas");
  const json = (await res.json()) as { data: ComunidadAutonoma[] };
  return json.data;
}

async function fetchProvincias(
  comunidadAutonomaId?: number
): Promise<Provincia[]> {
  const params = comunidadAutonomaId
    ? `?comunidadAutonomaId=${comunidadAutonomaId}`
    : "";
  const res = await fetch(`/api/geografia/provincias${params}`);
  if (!res.ok) throw new Error("Error al cargar provincias");
  const json = (await res.json()) as { data: Provincia[] };
  return json.data;
}

export function useComunidadesAutonomas() {
  return useQuery({
    queryKey: ["ccaa"],
    queryFn: fetchCCAA,
    staleTime: 1000 * 60 * 60,
  });
}

export function useProvincias(comunidadAutonomaId?: number) {
  return useQuery({
    queryKey: ["provincias", comunidadAutonomaId ?? null],
    queryFn: () => fetchProvincias(comunidadAutonomaId),
    enabled: comunidadAutonomaId !== undefined,
    staleTime: 1000 * 60 * 60,
  });
}
