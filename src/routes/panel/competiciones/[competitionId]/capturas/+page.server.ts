import { createCatch, getCatches, getParticipantes } from "$lib/db";
import { createCatchSchema } from "$lib/validations";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const [participantes, capturas] = await Promise.all([
    getParticipantes(params.competitionId),
    getCatches(params.competitionId),
  ]);
  return { participantes, capturas: capturas.slice(0, 50) };
};

export const actions = {
  create: async ({ request, params, locals }) => {
    if (!locals.session) throw redirect(302, "/login");
    if (!["admin", "organizador", "juez", "super_admin"].includes(locals.session.rol)) {
      return fail(403, { error: "Permisos insuficientes" });
    }

    const form = await request.formData();
    const parsed = createCatchSchema.safeParse({
      pescadorId: String(form.get("pescadorId") ?? ""),
      sessionId: null,
      manga: Number(form.get("manga") ?? 1),
      tramo: String(form.get("tramo") ?? ""),
      rio: String(form.get("rio") ?? ""),
      longitudCm: Number(form.get("longitudCm") ?? 0),
      valida: String(form.get("valida") ?? "true") === "true",
      hora: String(form.get("hora") ?? "") || null,
      observaciones: String(form.get("observaciones") ?? ""),
      juezId: locals.session.sub,
    });

    if (!parsed.success) {
      return fail(400, { error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
    }

    await createCatch(params.competitionId, {
      ...parsed.data,
      sessionId: parsed.data.sessionId ?? null,
      hora: parsed.data.hora ?? null,
      juezId: parsed.data.juezId ?? locals.session.sub,
      observaciones: parsed.data.observaciones ?? "",
    });
    return { ok: true };
  },
};
