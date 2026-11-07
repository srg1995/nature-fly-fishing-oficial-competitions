import { requireCompetitionRole, toJsonResponse } from "$lib/auth-competition";
import { getAuditLog } from "$lib/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    await requireCompetitionRole(locals.session, params.competitionId, "admin", "organizador");
    return Response.json({ data: await getAuditLog(params.competitionId, 100) });
  } catch (error) {
    return toJsonResponse(error);
  }
};
