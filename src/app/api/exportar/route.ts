import { NextResponse } from "next/server";
import { getClasificacion, getMangaStats, getCatches, getParticipantes } from "@/lib/db";
import { generarExcelResultados, getExcelFilename } from "@/lib/excel";
import type { CatchRecord } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [clasificacion, mangaStats, catches, participantes] = await Promise.all([
      getClasificacion(),
      getMangaStats(),
      getCatches(),
      getParticipantes(),
    ]);

    const participanteMap = new Map(participantes.map((p) => [p.id, p.nombre]));

    const catchesWithNombre = catches.map((c: CatchRecord) => ({
      ...c,
      nombre: participanteMap.get(c.pescadorId) ?? "Desconocido",
    }));

    const blob = generarExcelResultados(clasificacion, mangaStats, catchesWithNombre);
    const buffer = await blob.arrayBuffer();
    const filename = getExcelFilename();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json({ error: "Error al generar el Excel" }, { status: 500 });
  }
}
