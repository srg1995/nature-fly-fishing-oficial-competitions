import { requireCompetitionRole, toJsonResponse } from "$lib/auth-competition";
import { getClasificacion } from "$lib/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    await requireCompetitionRole(locals.session, params.competitionId, "admin", "organizador", "juez");
    return Response.json({ data: await getClasificacion(params.competitionId) });
  } catch (error) {
    return toJsonResponse(error);
  }
};
