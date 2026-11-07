import { requireCompetitionRole, toJsonResponse } from "$lib/auth-competition";
import { createAuditEntry, deleteCatch, getCatchById, updateCatch } from "$lib/db";
import { updateCatchSchema } from "$lib/validations";
import type { RequestHandler } from "./$types";

const notFound = () => Response.json({ error: "Captura no encontrada" }, { status: 404 });

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    await requireCompetitionRole(locals.session, params.competitionId, "admin", "organizador", "juez");
    const record = await getCatchById(params.competitionId, params.id);
    return record ? Response.json({ data: record }) : notFound();
  } catch (error) {
    return toJsonResponse(error);
  }
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const { competitionId, id } = params;
  try {
    const { session: safe } = await requireCompetitionRole(
      locals.session,
      competitionId,
      "admin",
      "organizador",
      "juez"
    );
    const existing = await getCatchById(competitionId, id);
    if (!existing) return notFound();

    const parsed = updateCatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const updated = await updateCatch(competitionId, id, parsed.data);
    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "UPDATE_CATCH",
      tabla: "catch_records",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: updated as unknown as Record<string, unknown>,
    });
    return Response.json({ data: updated });
  } catch (error) {
    return toJsonResponse(error);
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { competitionId, id } = params;
  try {
    const { session: safe } = await requireCompetitionRole(
      locals.session,
      competitionId,
      "admin",
      "organizador"
    );
    const existing = await getCatchById(competitionId, id);
    if (!existing) return notFound();

    await deleteCatch(competitionId, id);
    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "DELETE_CATCH",
      tabla: "catch_records",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: null,
    });
    return Response.json({ message: "Captura eliminada correctamente" });
  } catch (error) {
    return toJsonResponse(error);
  }
};
