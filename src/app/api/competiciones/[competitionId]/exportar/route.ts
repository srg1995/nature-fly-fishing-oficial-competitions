import { NextRequest, NextResponse } from "next/server";
import {
  getClasificacion,
  getMangaStats,
  getCatches,
  getParticipantes,
} from "@/lib/db";
import { generarExcelResultados, getExcelFilename } from "@/lib/excel";
import { getSession } from "@/lib/auth";
import { requireCompetitionRole, toJsonResponse } from "@/lib/auth-competition";
import type { CatchRecord } from "@/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ competitionId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { competitionId } = await params;
  try {
    const session = await getSession();
    await requireCompetitionRole(
      session,
      competitionId,
      "admin",
      "organizador",
      "juez"
    );

    const [clasificacion, mangaStats, catches, participantes] =
      await Promise.all([
        getClasificacion(competitionId),
        getMangaStats(competitionId),
        getCatches(competitionId),
        getParticipantes(competitionId),
      ]);

    const participanteMap = new Map(participantes.map((p) => [p.id, p.nombre]));

    const catchesWithNombre = catches.map((c: CatchRecord) => ({
      ...c,
      nombre: participanteMap.get(c.pescadorId) ?? "Desconocido",
    }));

    const blob = generarExcelResultados(
      clasificacion,
      mangaStats,
      catchesWithNombre
    );
    const buffer = await blob.arrayBuffer();
    const filename = getExcelFilename();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return toJsonResponse(error);
  }
}
