"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ParticipantDuo, CreateDuoInput, UpdateDuoInput } from "@/types";

const DUOS_KEY = ["duos"] as const;

async function fetchDuos(): Promise<ParticipantDuo[]> {
  const res = await fetch("/api/duos");
  if (!res.ok) throw new Error("Error al cargar los dúos");
  const json = (await res.json()) as { data: ParticipantDuo[] };
  return json.data;
}

async function createDuoFn(data: CreateDuoInput): Promise<ParticipantDuo> {
  const res = await fetch("/api/duos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
  const json = (await res.json()) as { data: ParticipantDuo };
  return json.data;
}

async function updateDuoFn({ id, data }: { id: string; data: UpdateDuoInput }): Promise<ParticipantDuo> {
  const res = await fetch(`/api/duos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
  const json = (await res.json()) as { data: ParticipantDuo };
  return json.data;
}

async function deleteDuoFn(id: string): Promise<void> {
  const res = await fetch(`/api/duos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
}

export function useDuos() {
  return useQuery({ queryKey: DUOS_KEY, queryFn: fetchDuos });
}

export function useCreateDuo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDuoFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: DUOS_KEY }),
  });
}

export function useUpdateDuo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDuoFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: DUOS_KEY }),
  });
}

export function useDeleteDuo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDuoFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: DUOS_KEY }),
  });
}
