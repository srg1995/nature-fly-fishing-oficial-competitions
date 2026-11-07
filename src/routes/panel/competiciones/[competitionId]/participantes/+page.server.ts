import { createAuditEntry, createParticipante, deleteParticipante, getParticipanteById, getParticipantes } from "$lib/db";
import { parseParticipantesFromExcel } from "$lib/excel";
import { createParticipanteSchema } from "$lib/validations";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const participantes = await getParticipantes(params.competitionId);
  return { participantes, rol: locals.session?.rol ?? null };
};

export const actions = {
  create: async ({ request, params, locals }) => {
    if (!locals.session) throw redirect(302, "/login");
    if (!["admin", "organizador", "super_admin"].includes(locals.session.rol)) {
      return fail(403, { error: "Permisos insuficientes" });
    }

    const form = await request.formData();
    const parsed = createParticipanteSchema.safeParse({
      nombre: String(form.get("nombre") ?? ""),
      plica: String(form.get("plica") ?? ""),
      club: String(form.get("club") ?? ""),
      turno: String(form.get("turno") ?? "A"),
      tramo: String(form.get("tramo") ?? ""),
      rio: String(form.get("rio") ?? ""),
    });

    if (!parsed.success) {
      return fail(400, { error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
    }

    await createParticipante(params.competitionId, parsed.data);
    return { ok: true };
  },

  delete: async ({ request, params, locals }) => {
    if (!locals.session) throw redirect(302, "/login");
    if (!["admin", "organizador", "super_admin"].includes(locals.session.rol)) {
      return fail(403, { error: "Permisos insuficientes" });
    }
    const id = String((await request.formData()).get("id") ?? "");
    const existing = await getParticipanteById(params.competitionId, id);
    if (!existing) return fail(404, { error: "Participante no encontrado" });

    await deleteParticipante(params.competitionId, id);
    await createAuditEntry({
      competitionId: params.competitionId,
      userId: locals.session.sub,
      accion: "DELETE_PARTICIPANTE",
      tabla: "participantes",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: null,
    });
    return { ok: true };
  },

  import: async ({ request, params, locals }) => {
    if (!locals.session) throw redirect(302, "/login");
    if (!["admin", "organizador", "super_admin"].includes(locals.session.rol)) {
      return fail(403, { error: "Permisos insuficientes" });
    }
    const file = (await request.formData()).get("file");
    if (!(file instanceof File) || file.size === 0) {
      return fail(400, { error: "Selecciona un archivo Excel" });
    }

    const rows = parseParticipantesFromExcel(await file.arrayBuffer());
    let imported = 0;
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const parsed = createParticipanteSchema.safeParse(rows[i]);
      if (!parsed.success) {
        errors.push(`Fila ${i + 2}: ${parsed.error.issues[0]?.message ?? "Datos inválidos"}`);
        continue;
      }
      try {
        await createParticipante(params.competitionId, parsed.data);
        imported++;
      } catch (err) {
        errors.push(`Fila ${i + 2}: ${err instanceof Error ? err.message : "Error desconocido"}`);
      }
    }
    return { ok: true, imported, importErrors: errors };
  },
};
