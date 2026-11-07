import { requireCompetitionRole, requireSuperAdmin, toJsonResponse } from "$lib/auth-competition";
import { createAuditEntry } from "$lib/db";
import {
  deleteCompetition,
  getCompetitionById,
  updateCompetition,
} from "$lib/queries/competitions";
import { updateCompetitionSchema } from "$lib/validations-competition";
import type { RequestHandler } from "./$types";

const notFound = () => Response.json({ error: "Competición no encontrada" }, { status: 404 });

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    await requireCompetitionRole(locals.session, params.competitionId, "admin", "organizador", "juez");
    const competition = await getCompetitionById(params.competitionId);
    if (!competition) return notFound();
    return Response.json({ data: competition });
  } catch (error) {
    return toJsonResponse(error);
  }
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const { competitionId } = params;
  try {
    const { session: safe } = await requireCompetitionRole(
      locals.session,
      competitionId,
      "admin",
      "organizador"
    );
    const existing = await getCompetitionById(competitionId);
    if (!existing) return notFound();

    const parsed = updateCompetitionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updated = await updateCompetition(competitionId, parsed.data);
    if (!updated) return notFound();

    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "UPDATE_COMPETITION",
      tabla: "competitions",
      registroId: competitionId,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: updated as unknown as Record<string, unknown>,
    });
    return Response.json({ data: updated });
  } catch (error) {
    return toJsonResponse(error);
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { competitionId } = params;
  try {
    const safe = requireSuperAdmin(locals.session);
    const existing = await getCompetitionById(competitionId);
    if (!existing) return notFound();
    if (!(await deleteCompetition(competitionId))) return notFound();

    await createAuditEntry({
      competitionId: null,
      userId: safe.sub,
      accion: "DELETE_COMPETITION",
      tabla: "competitions",
      registroId: competitionId,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: null,
    });
    return Response.json({ message: "Competición eliminada" });
  } catch (error) {
    return toJsonResponse(error);
  }
};
