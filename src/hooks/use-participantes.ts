"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MOCK_PARTICIPANTES } from "@/lib/mock-data";
import type { Participante, CreateParticipanteInput, UpdateParticipanteInput } from "@/types";

const PARTICIPANTES_KEY = ["participantes"] as const;

// Estado mutable del mock (simula una tabla en memoria)
let mockStore: Participante[] = [...MOCK_PARTICIPANTES];

async function fetchParticipantes(): Promise<Participante[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockStore];
}

async function createParticipanteFn(data: CreateParticipanteInput): Promise<Participante> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const nuevo: Participante = {
    id: `p-${String(mockStore.length + 1).padStart(3, "0")}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockStore = [...mockStore, nuevo];
  return nuevo;
}

async function updateParticipanteFn({
  id,
  data,
}: {
  id: string;
  data: UpdateParticipanteInput;
}): Promise<Participante> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const idx = mockStore.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Participante no encontrado");
  const actualizado: Participante = {
    ...mockStore[idx],
    ...data,
    updatedAt: new Date(),
  };
  mockStore = mockStore.map((p) => (p.id === id ? actualizado : p));
  return actualizado;
}

async function deleteParticipanteFn(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  mockStore = mockStore.filter((p) => p.id !== id);
}

export function useParticipantes() {
  return useQuery({ queryKey: PARTICIPANTES_KEY, queryFn: fetchParticipantes });
}

export function useCreateParticipante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createParticipanteFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTICIPANTES_KEY }),
  });
}

export function useUpdateParticipante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateParticipanteFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTICIPANTES_KEY }),
  });
}

export function useDeleteParticipante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteParticipanteFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTICIPANTES_KEY }),
  });
}
