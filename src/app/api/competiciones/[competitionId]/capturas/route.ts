import { NextRequest, NextResponse } from "next/server";
import { getCatches, createCatch, createAuditEntry } from "@/lib/db";
import { createCatchSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { requireCompetitionRole, toJsonResponse } from "@/lib/auth-competition";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ competitionId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { searchParams } = request.nextUrl;
    const pescadorId = searchParams.get("pescadorId") ?? undefined;
    const manga = searchParams.get("manga")
      ? Number(searchParams.get("manga"))
      : undefined;
    const valida =
      searchParams.get("valida") !== null
        ? searchParams.get("valida") === "true"
        : undefined;

    const catches = await getCatches(competitionId, { pescadorId, manga, valida });
    return NextResponse.json({ data: catches });
  } catch (error) {
    return toJsonResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { competitionId } = await params;
  try {
    const session = await getSession();
    const { session: safe } = await requireCompetitionRole(
      session,
      competitionId,
      "admin",
      "organizador",
      "juez"
    );

    const body: unknown = await request.json();
    const parsed = createCatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
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

    return NextResponse.json({ data: catchRecord }, { status: 201 });
  } catch (error) {
    return toJsonResponse(error);
  }
}
