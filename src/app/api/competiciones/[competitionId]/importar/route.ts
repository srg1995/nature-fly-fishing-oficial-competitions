import { NextRequest, NextResponse } from "next/server";
import { createParticipante } from "@/lib/db";
import { parseParticipantesFromExcel } from "@/lib/excel";
import { createParticipanteSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { requireCompetitionRole, toJsonResponse } from "@/lib/auth-competition";
import type { ImportResult } from "@/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ competitionId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { competitionId } = await params;
  try {
    const session = await getSession();
    await requireCompetitionRole(
      session,
      competitionId,
      "admin",
      "organizador"
    );

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const rows = parseParticipantesFromExcel(buffer);

    const result: ImportResult = { success: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const parsed = createParticipanteSchema.safeParse(row);

      if (!parsed.success) {
        result.errors.push({
          row: i + 2,
          message: Object.values(parsed.error.flatten().fieldErrors)
            .flat()
            .join(", "),
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

    return NextResponse.json({ data: result });
  } catch (error) {
    return toJsonResponse(error);
  }
}
