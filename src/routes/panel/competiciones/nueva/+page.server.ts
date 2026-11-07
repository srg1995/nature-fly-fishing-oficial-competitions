import { createCompetition } from "$lib/queries/competitions";
import { createCompetitionSchema, generateSlug } from "$lib/validations-competition";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  if (!locals.session) throw redirect(302, "/login");
  if (locals.session.rol !== "super_admin") throw redirect(302, "/panel");
  return {};
};

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.session || locals.session.rol !== "super_admin") {
      throw redirect(302, "/panel");
    }

    const form = await request.formData();
    const nombre = String(form.get("nombre") ?? "").trim();
    const edicion = String(form.get("edicion") ?? "").trim();
    const nivel = String(form.get("nivel") ?? "nacional");
    const fechaInicio = String(form.get("fechaInicio") ?? "");
    const fechaFin = String(form.get("fechaFin") ?? "");
    const lugar = String(form.get("lugar") ?? "").trim();
    const organizador = String(form.get("organizador") ?? "").trim();
    const estado = String(form.get("estado") ?? "borrador");
    const totalMangas = Number(form.get("totalMangas") ?? 4);
    const minimaLongitud = Number(form.get("minimaLongitud") ?? 19);
    const descripcion = String(form.get("descripcion") ?? "").trim();
    const rios = String(form.get("rios") ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const tramos = String(form.get("tramos") ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const comunidadAutonomaIdRaw = form.get("comunidadAutonomaId");
    const provinciaIdRaw = form.get("provinciaId");

    const comunidadAutonomaId =
      comunidadAutonomaIdRaw && String(comunidadAutonomaIdRaw).trim() !== ""
        ? Number(comunidadAutonomaIdRaw)
        : null;
    const provinciaId =
      provinciaIdRaw && String(provinciaIdRaw).trim() !== ""
        ? Number(provinciaIdRaw)
        : null;

    const parsed = createCompetitionSchema.safeParse({
      nombre,
      edicion,
      modalidad: "lance_mosca_duos",
      slug: generateSlug(nombre, edicion),
      nivel,
      comunidadAutonomaId,
      provinciaId,
      estado,
      fechaInicio,
      fechaFin,
      lugar,
      organizador,
      organizadorUserId: null,
      totalMangas,
      minimaLongitud,
      rios,
      tramos,
      descripcion,
    });

    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? "Datos inválidos",
      });
    }

    const created = await createCompetition(parsed.data);
    throw redirect(302, `/panel/competiciones/${created.id}`);
  },
};
