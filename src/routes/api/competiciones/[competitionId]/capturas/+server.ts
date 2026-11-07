import { requireCompetitionRole, toJsonResponse } from "$lib/auth-competition";
import { createAuditEntry, createCatch, getCatches } from "$lib/db";
import { createCatchSchema } from "$lib/validations";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, url, locals }) => {
  try {
    await requireCompetitionRole(locals.session, params.competitionId, "admin", "organizador", "juez");
    const sp = url.searchParams;
    const pescadorId = sp.get("pescadorId") ?? undefined;
    const manga = sp.get("manga") ? Number(sp.get("manga")) : undefined;
    const valida = sp.get("valida") !== null ? sp.get("valida") === "true" : undefined;
    const catches = await getCatches(params.competitionId, { pescadorId, manga, valida });
    return Response.json({ data: catches });
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
      "organizador",
      "juez"
    );
    const parsed = createCatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const catchRecord = await createCatch(competitionId, {
      ...parsed.data,
      sessionId: parsed.data.sessionId ?? null,
      hora: parsed.data.hora ?? null,
      juezId: parsed.data.juezId ?? safe.sub ?? null,
      observaciones: parsed.data.observaciones ?? "",
    });
    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "CREATE_CATCH",
      tabla: "catch_records",
      registroId: catchRecord.id,
      datosAnteriores: null,
      datosNuevos: catchRecord as unknown as Record<string, unknown>,
    });
    return Response.json({ data: catchRecord }, { status: 201 });
  } catch (error) {
    return toJsonResponse(error);
  }
};
