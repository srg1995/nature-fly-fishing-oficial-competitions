import { requireCompetitionRole, toJsonResponse } from "$lib/auth-competition";
import { createAuditEntry, createParticipante, getParticipantes } from "$lib/db";
import { createParticipanteSchema } from "$lib/validations";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    await requireCompetitionRole(locals.session, params.competitionId, "admin", "organizador", "juez");
    return Response.json({ data: await getParticipantes(params.competitionId) });
  } catch (error) {
    return toJsonResponse(error);
  }
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { competitionId } = params;
  try {
    const { session: safe } = await requireCompetitionRole(
      locals.session,
      competitionId,
      "admin",
      "organizador"
    );
    const parsed = createParticipanteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const participante = await createParticipante(competitionId, parsed.data);
    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "CREATE_PARTICIPANTE",
      tabla: "participantes",
      registroId: participante.id,
      datosAnteriores: null,
      datosNuevos: participante as unknown as Record<string, unknown>,
    });
    return Response.json({ data: participante }, { status: 201 });
  } catch (error) {
    return toJsonResponse(error);
  }
};
