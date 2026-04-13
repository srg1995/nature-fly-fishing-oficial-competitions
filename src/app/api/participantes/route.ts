import { NextRequest, NextResponse } from "next/server";
import { getParticipantes, createParticipante, createAuditEntry } from "@/lib/db";
import { createParticipanteSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const participantes = await getParticipantes();
    return NextResponse.json({ data: participantes });
  } catch (error) {
    console.error("Error fetching participantes:", error);
    return NextResponse.json({ error: "Error al obtener los participantes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body: unknown = await request.json();
    const parsed = createParticipanteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const participante = await createParticipante(parsed.data);

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "CREATE_PARTICIPANTE",
      tabla: "participantes",
      registroId: participante.id,
      datosAnteriores: null,
      datosNuevos: participante as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: participante }, { status: 201 });
  } catch (error) {
    console.error("Error creating participante:", error);
    return NextResponse.json({ error: "Error al crear el participante" }, { status: 500 });
  }
}
