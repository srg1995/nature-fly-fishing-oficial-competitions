import { NextRequest, NextResponse } from "next/server";
import { getParticipanteById, updateParticipante, deleteParticipante, createAuditEntry } from "@/lib/db";
import { updateParticipanteSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const participante = await getParticipanteById(id);
    if (!participante) {
      return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ data: participante });
  } catch (error) {
    console.error("Error fetching participante:", error);
    return NextResponse.json({ error: "Error al obtener el participante" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const session = await getSession();
    const existing = await getParticipanteById(id);
    if (!existing) {
      return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = updateParticipanteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateParticipante(id, parsed.data);

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "UPDATE_PARTICIPANTE",
      tabla: "participantes",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: updated as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating participante:", error);
    return NextResponse.json({ error: "Error al actualizar el participante" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const session = await getSession();
    const existing = await getParticipanteById(id);
    if (!existing) {
      return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
    }

    await deleteParticipante(id);

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "DELETE_PARTICIPANTE",
      tabla: "participantes",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: null,
    });

    return NextResponse.json({ message: "Participante eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting participante:", error);
    return NextResponse.json({ error: "Error al eliminar el participante" }, { status: 500 });
  }
}
