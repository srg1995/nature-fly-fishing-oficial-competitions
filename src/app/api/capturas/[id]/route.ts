import { NextRequest, NextResponse } from "next/server";
import { getCatchById, updateCatch, deleteCatch, createAuditEntry } from "@/lib/db";
import { updateCatchSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const record = await getCatchById(id);
    if (!record) {
      return NextResponse.json({ error: "Captura no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Error fetching catch:", error);
    return NextResponse.json({ error: "Error al obtener la captura" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const session = await getSession();
    const existing = await getCatchById(id);
    if (!existing) {
      return NextResponse.json({ error: "Captura no encontrada" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = updateCatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateCatch(id, parsed.data);

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "UPDATE_CATCH",
      tabla: "catch_records",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: updated as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating catch:", error);
    return NextResponse.json({ error: "Error al actualizar la captura" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const session = await getSession();
    const existing = await getCatchById(id);
    if (!existing) {
      return NextResponse.json({ error: "Captura no encontrada" }, { status: 404 });
    }

    await deleteCatch(id);

    await createAuditEntry({
      userId: session?.sub ?? null,
      accion: "DELETE_CATCH",
      tabla: "catch_records",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: null,
    });

    return NextResponse.json({ message: "Captura eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting catch:", error);
    return NextResponse.json({ error: "Error al eliminar la captura" }, { status: 500 });
  }
}
