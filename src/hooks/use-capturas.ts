"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CatchRecord, CreateCatchInput, UpdateCatchInput } from "@/types";

const capturasKey = (competitionId: string) =>
  ["capturas", competitionId] as const;

interface CapturasFilters {
  pescadorId?: string;
  manga?: number;
  valida?: boolean;
}

async function fetchCapturas(
  competitionId: string,
  filters?: CapturasFilters
): Promise<CatchRecord[]> {
  const params = new URLSearchParams();
  if (filters?.pescadorId) params.set("pescadorId", filters.pescadorId);
  if (filters?.manga !== undefined) params.set("manga", String(filters.manga));
  if (filters?.valida !== undefined) params.set("valida", String(filters.valida));

  const res = await fetch(
    `/api/competiciones/${competitionId}/capturas?${params.toString()}`
  );
  if (!res.ok) throw new Error("Error al cargar las capturas");
  const json = (await res.json()) as { data: CatchRecord[] };
  return json.data;
}

async function createCapturaFn(
  competitionId: string,
  data: CreateCatchInput
): Promise<CatchRecord> {
  const res = await fetch(`/api/competiciones/${competitionId}/capturas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
  const json = (await res.json()) as { data: CatchRecord };
  return json.data;
}

async function updateCapturaFn(
  competitionId: string,
  id: string,
  data: UpdateCatchInput
): Promise<CatchRecord> {
  const res = await fetch(
    `/api/competiciones/${competitionId}/capturas/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
  const json = (await res.json()) as { data: CatchRecord };
  return json.data;
}

async function deleteCapturaFn(
  competitionId: string,
  id: string
): Promise<void> {
  const res = await fetch(
    `/api/competiciones/${competitionId}/capturas/${id}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
}

export function useCapturas(
  competitionId: string,
  filters?: CapturasFilters
) {
  return useQuery({
    queryKey: [...capturasKey(competitionId), filters],
    queryFn: () => fetchCapturas(competitionId, filters),
  });
}

export function useCreateCaptura(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCatchInput) => createCapturaFn(competitionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: capturasKey(competitionId) });
      qc.invalidateQueries({ queryKey: ["stats", competitionId] });
      qc.invalidateQueries({ queryKey: ["clasificacion", competitionId] });
    },
  });
}

export function useUpdateCaptura(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCatchInput }) =>
      updateCapturaFn(competitionId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: capturasKey(competitionId) });
      qc.invalidateQueries({ queryKey: ["stats", competitionId] });
      qc.invalidateQueries({ queryKey: ["clasificacion", competitionId] });
    },
  });
}

export function useDeleteCaptura(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCapturaFn(competitionId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: capturasKey(competitionId) });
      qc.invalidateQueries({ queryKey: ["stats", competitionId] });
      qc.invalidateQueries({ queryKey: ["clasificacion", competitionId] });
    },
  });
}
