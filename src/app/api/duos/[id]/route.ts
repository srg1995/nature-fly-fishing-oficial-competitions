import { NextRequest, NextResponse } from "next/server";
import { getDuoById, updateDuo, deleteDuo, createAuditEntry } from "@/lib/db";
import { updateDuoSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const duo = await getDuoById(id);
    if (!duo) {
      return NextResponse.json({ error: "Dúo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ data: duo });
  } catch (error) {
    console.error("Error fetching duo:", error);
    return NextResponse.json({ error: "Error al obtener el dúo" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const session = await getSession();
    const existing = await getDuoById(id);
    if (!existing) {
      return NextResponse.json({ error: "Dúo no encontrado" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = updateDuoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateDuo(id, parsed.data);

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "UPDATE_DUO",
      tabla: "participant_duos",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: updated as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating duo:", error);
    return NextResponse.json({ error: "Error al actualizar el dúo" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const session = await getSession();
    const existing = await getDuoById(id);
    if (!existing) {
      return NextResponse.json({ error: "Dúo no encontrado" }, { status: 404 });
    }

    await deleteDuo(id);

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "DELETE_DUO",
      tabla: "participant_duos",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: null,
    });

    return NextResponse.json({ message: "Dúo eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting duo:", error);
    return NextResponse.json({ error: "Error al eliminar el dúo" }, { status: 500 });
  }
}
