import { NextRequest, NextResponse } from "next/server";
import { getCatches, createCatch, createAuditEntry } from "@/lib/db";
import { createCatchSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pescadorId = searchParams.get("pescadorId") ?? undefined;
    const manga = searchParams.get("manga") ? Number(searchParams.get("manga")) : undefined;
    const valida =
      searchParams.get("valida") !== null
        ? searchParams.get("valida") === "true"
        : undefined;

    const catches = await getCatches({ pescadorId, manga, valida });
    return NextResponse.json({ data: catches });
  } catch (error) {
    console.error("Error fetching catches:", error);
    return NextResponse.json({ error: "Error al obtener capturas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body: unknown = await request.json();
    const parsed = createCatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const catchRecord = await createCatch({
      ...parsed.data,
      sessionId: parsed.data.sessionId ?? null,
      hora: parsed.data.hora ?? null,
      juezId: parsed.data.juezId ?? session?.sub ?? null,
      observaciones: parsed.data.observaciones ?? "",
    });

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "CREATE_CATCH",
      tabla: "catch_records",
      registroId: catchRecord.id,
      datosAnteriores: null,
      datosNuevos: catchRecord as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: catchRecord }, { status: 201 });
  } catch (error) {
    console.error("Error creating catch:", error);
    return NextResponse.json({ error: "Error al registrar captura" }, { status: 500 });
  }
}
