"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CatchRecord, CreateCatchInput, UpdateCatchInput } from "@/types";

const CAPTURAS_KEY = ["capturas"] as const;

async function fetchCapturas(filters?: {
  pescadorId?: string;
  manga?: number;
  valida?: boolean;
}): Promise<CatchRecord[]> {
  const params = new URLSearchParams();
  if (filters?.pescadorId) params.set("pescadorId", filters.pescadorId);
  if (filters?.manga !== undefined) params.set("manga", String(filters.manga));
  if (filters?.valida !== undefined) params.set("valida", String(filters.valida));

  const res = await fetch(`/api/capturas?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar las capturas");
  const json = (await res.json()) as { data: CatchRecord[] };
  return json.data;
}

async function createCapturaFn(data: CreateCatchInput): Promise<CatchRecord> {
  const res = await fetch("/api/capturas", {
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

async function updateCapturaFn({ id, data }: { id: string; data: UpdateCatchInput }): Promise<CatchRecord> {
  const res = await fetch(`/api/capturas/${id}`, {
    method: "PATCH",
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

async function deleteCapturaFn(id: string): Promise<void> {
  const res = await fetch(`/api/capturas/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
}

export function useCapturas(filters?: { pescadorId?: string; manga?: number; valida?: boolean }) {
  return useQuery({
    queryKey: [...CAPTURAS_KEY, filters],
    queryFn: () => fetchCapturas(filters),
  });
}

export function useCreateCaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCapturaFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAPTURAS_KEY });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["clasificacion"] });
    },
  });
}

export function useUpdateCaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCapturaFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAPTURAS_KEY });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["clasificacion"] });
    },
  });
}

export function useDeleteCaptura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCapturaFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAPTURAS_KEY });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["clasificacion"] });
    },
  });
}
