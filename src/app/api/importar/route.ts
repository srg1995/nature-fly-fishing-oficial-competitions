import { NextRequest, NextResponse } from "next/server";
import { createDuo } from "@/lib/db";
import { parseDuosFromExcel } from "@/lib/excel";
import { createDuoSchema } from "@/lib/validations";
import type { ImportResult } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const rows = parseDuosFromExcel(buffer);

    const result: ImportResult = { success: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const parsed = createDuoSchema.safeParse(row);

      if (!parsed.success) {
        result.errors.push({
          row: i + 2,
          message: Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
        });
        continue;
      }

      try {
        await createDuo(parsed.data);
        result.success++;
      } catch (err) {
        result.errors.push({
          row: i + 2,
          message: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error importing Excel:", error);
    return NextResponse.json({ error: "Error al importar el archivo" }, { status: 500 });
  }
}
