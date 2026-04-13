import { NextResponse } from "next/server";
import { getClasificacion, getMangaStats, getCatches, getDuos } from "@/lib/db";
import { generarExcelResultados, getExcelFilename } from "@/lib/excel";
import type { CatchRecord } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [clasificacion, mangaStats, catches, duos] = await Promise.all([
      getClasificacion(),
      getMangaStats(),
      getCatches(),
      getDuos(),
    ]);

    const duoMap = new Map(duos.map((d) => [d.id, d.nombreDuo]));

    const catchesWithDuo = catches.map((c: CatchRecord) => ({
      ...c,
      nombreDuo: duoMap.get(c.duoId) ?? "Desconocido",
    }));

    const blob = generarExcelResultados(clasificacion, mangaStats, catchesWithDuo);
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
