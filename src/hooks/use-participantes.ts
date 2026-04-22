"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Participante,
  CreateParticipanteInput,
  UpdateParticipanteInput,
} from "@/types";

const participantesKey = (competitionId: string) =>
  ["participantes", competitionId] as const;

async function fetchParticipantes(
  competitionId: string
): Promise<Participante[]> {
  const res = await fetch(`/api/competiciones/${competitionId}/participantes`);
  if (!res.ok) throw new Error("Error al cargar participantes");
  const json = (await res.json()) as { data: Participante[] };
  return json.data;
}

async function createParticipanteFn(
  competitionId: string,
  data: CreateParticipanteInput
): Promise<Participante> {
  const res = await fetch(`/api/competiciones/${competitionId}/participantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
  const json = (await res.json()) as { data: Participante };
  return json.data;
}

async function updateParticipanteFn(
  competitionId: string,
  id: string,
  data: UpdateParticipanteInput
): Promise<Participante> {
  const res = await fetch(
    `/api/competiciones/${competitionId}/participantes/${id}`,
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
  const json = (await res.json()) as { data: Participante };
  return json.data;
}

async function deleteParticipanteFn(
  competitionId: string,
  id: string
): Promise<void> {
  const res = await fetch(
    `/api/competiciones/${competitionId}/participantes/${id}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const err = (await res.json()) as { error: string };
    throw new Error(err.error);
  }
}

export function useParticipantes(competitionId: string) {
  return useQuery({
    queryKey: participantesKey(competitionId),
    queryFn: () => fetchParticipantes(competitionId),
  });
}

export function useCreateParticipante(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateParticipanteInput) =>
      createParticipanteFn(competitionId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: participantesKey(competitionId) }),
  });
}

export function useUpdateParticipante(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParticipanteInput }) =>
      updateParticipanteFn(competitionId, id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: participantesKey(competitionId) }),
  });
}

export function useDeleteParticipante(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteParticipanteFn(competitionId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: participantesKey(competitionId) }),
  });
}
