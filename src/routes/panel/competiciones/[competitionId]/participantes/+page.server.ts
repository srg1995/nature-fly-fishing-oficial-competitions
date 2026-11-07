import { createParticipante, getParticipantes } from "$lib/db";
import { createParticipanteSchema } from "$lib/validations";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const participantes = await getParticipantes(params.competitionId);
  return { participantes };
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
};
