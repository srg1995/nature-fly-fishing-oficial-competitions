import { requireCompetitionRole, toJsonResponse } from "$lib/auth-competition";
import { getCatches, getClasificacion, getMangaStats, getParticipantes } from "$lib/db";
import { generarExcelResultados, getExcelFilename } from "$lib/excel";
import type { CatchRecord } from "@/types";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  const { competitionId } = params;
  try {
    await requireCompetitionRole(locals.session, competitionId, "admin", "organizador", "juez");
    const [clasificacion, mangaStats, catches, participantes] = await Promise.all([
      getClasificacion(competitionId),
      getMangaStats(competitionId),
      getCatches(competitionId),
      getParticipantes(competitionId),
    ]);
    const nombres = new Map(participantes.map((p) => [p.id, p.nombre]));
    const catchesWithNombre = catches.map((c: CatchRecord) => ({
      ...c,
      nombre: nombres.get(c.pescadorId) ?? "Desconocido",
    }));

    const blob = generarExcelResultados(clasificacion, mangaStats, catchesWithNombre);
    return new Response(await blob.arrayBuffer(), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${getExcelFilename()}"`,
      },
    });
  } catch (error) {
    return toJsonResponse(error);
  }
};
