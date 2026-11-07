import { requireCompetitionRole, toJsonResponse } from "$lib/auth-competition";
import { createParticipante } from "$lib/db";
import { parseParticipantesFromExcel } from "$lib/excel";
import { createParticipanteSchema } from "$lib/validations";
import type { ImportResult } from "@/types";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { competitionId } = params;
  try {
    await requireCompetitionRole(locals.session, competitionId, "admin", "organizador");

    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    const rows = parseParticipantesFromExcel(await file.arrayBuffer());
    const result: ImportResult = { success: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const parsed = createParticipanteSchema.safeParse(rows[i]);
      if (!parsed.success) {
        result.errors.push({
          row: i + 2,
          message: Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
        });
        continue;
      }
      try {
        await createParticipante(competitionId, parsed.data);
        result.success++;
      } catch (err) {
        result.errors.push({
          row: i + 2,
          message: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }
    return Response.json({ data: result });
  } catch (error) {
    return toJsonResponse(error);
  }
};
