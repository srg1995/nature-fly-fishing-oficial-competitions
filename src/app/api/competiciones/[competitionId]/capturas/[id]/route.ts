import { NextRequest, NextResponse } from "next/server";
import {
  getCatchById,
  updateCatch,
  deleteCatch,
  createAuditEntry,
} from "@/lib/db";
import { updateCatchSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { requireCompetitionRole, toJsonResponse } from "@/lib/auth-competition";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ competitionId: string; id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { competitionId, id } = await params;
  try {
    const session = await getSession();
    await requireCompetitionRole(
      session,
      competitionId,
      "admin",
      "organizador",
      "juez"
    );
    const record = await getCatchById(competitionId, id);
    if (!record) {
      return NextResponse.json(
        { error: "Captura no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    return toJsonResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { competitionId, id } = await params;
  try {
    const session = await getSession();
    const { session: safe } = await requireCompetitionRole(
      session,
      competitionId,
      "admin",
      "organizador",
      "juez"
    );
    const existing = await getCatchById(competitionId, id);
    if (!existing) {
      return NextResponse.json(
        { error: "Captura no encontrada" },
        { status: 404 }
      );
    }

    const body: unknown = await request.json();
    const parsed = updateCatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateCatch(competitionId, id, parsed.data);

    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "UPDATE_CATCH",
      tabla: "catch_records",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: updated as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return toJsonResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { competitionId, id } = await params;
  try {
    const session = await getSession();
    const { session: safe } = await requireCompetitionRole(
      session,
      competitionId,
      "admin",
      "organizador"
    );
    const existing = await getCatchById(competitionId, id);
    if (!existing) {
      return NextResponse.json(
        { error: "Captura no encontrada" },
        { status: 404 }
      );
    }

    await deleteCatch(competitionId, id);

    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "DELETE_CATCH",
      tabla: "catch_records",
      registroId: id,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: null,
    });

    return NextResponse.json({ message: "Captura eliminada correctamente" });
  } catch (error) {
    return toJsonResponse(error);
  }
}
