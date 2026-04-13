import { NextRequest, NextResponse } from "next/server";
import { getDuos, createDuo, createAuditEntry } from "@/lib/db";
import { createDuoSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const duos = await getDuos();
    return NextResponse.json({ data: duos });
  } catch (error) {
    console.error("Error fetching duos:", error);
    return NextResponse.json({ error: "Error al obtener los dúos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body: unknown = await request.json();
    const parsed = createDuoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const duo = await createDuo(parsed.data);

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "CREATE_DUO",
      tabla: "participant_duos",
      registroId: duo.id,
      datosAnteriores: null,
      datosNuevos: duo as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: duo }, { status: 201 });
  } catch (error) {
    console.error("Error creating duo:", error);
    return NextResponse.json({ error: "Error al crear el dúo" }, { status: 500 });
  }
}
