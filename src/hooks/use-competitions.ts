"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Competition,
  EstadoCompeticion,
  NivelCompeticion,
} from "@/types";
import type {
  CreateCompetitionFormValues,
  UpdateCompetitionFormValues,
} from "@/lib/validations-competition";

export interface CompetitionsFilters {
  nivel?: NivelCompeticion;
  estado?: EstadoCompeticion;
  comunidadAutonomaId?: number;
  provinciaId?: number;
  search?: string;
}

async function fetchCompetitions(
  filters: CompetitionsFilters = {}
): Promise<Competition[]> {
  const params = new URLSearchParams();
  if (filters.nivel) params.set("nivel", filters.nivel);
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.comunidadAutonomaId !== undefined)
    params.set("comunidadAutonomaId", String(filters.comunidadAutonomaId));
  if (filters.provinciaId !== undefined)
    params.set("provinciaId", String(filters.provinciaId));
  if (filters.search) params.set("search", filters.search);

  const res = await fetch(`/api/competiciones?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar competiciones");
  const json = (await res.json()) as { data: Competition[] };
  return json.data;
}

async function createCompetitionFn(
  data: CreateCompetitionFormValues
): Promise<Competition> {
  const res = await fetch("/api/competiciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
  const json = (await res.json()) as { data: Competition };
  return json.data;
}

async function updateCompetitionFn(
  id: string,
  data: UpdateCompetitionFormValues
): Promise<Competition> {
  const res = await fetch(`/api/competiciones/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
  const json = (await res.json()) as { data: Competition };
  return json.data;
}

async function deleteCompetitionFn(id: string): Promise<void> {
  const res = await fetch(`/api/competiciones/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
}

export function useCompetitions(filters: CompetitionsFilters = {}) {
  return useQuery({
    queryKey: ["competitions", filters],
    queryFn: () => fetchCompetitions(filters),
  });
}

export function useCreateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCompetitionFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitions"] }),
  });
}

export function useUpdateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCompetitionFormValues;
    }) => updateCompetitionFn(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitions"] }),
  });
}

export function useDeleteCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCompetitionFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitions"] }),
  });
}
