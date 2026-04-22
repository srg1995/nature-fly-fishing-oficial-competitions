import { NextRequest, NextResponse } from "next/server";
import {
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
} from "@/lib/queries/competitions";
import { updateCompetitionSchema } from "@/lib/validations-competition";
import { createAuditEntry } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  requireCompetitionRole,
  requireSuperAdmin,
  toJsonResponse,
} from "@/lib/auth-competition";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ competitionId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
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
    const competition = await getCompetitionById(competitionId);
    if (!competition) {
      return NextResponse.json(
        { error: "Competición no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: competition });
  } catch (error) {
    return toJsonResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { competitionId } = await params;
  try {
    const session = await getSession();
    const { session: safe } = await requireCompetitionRole(
      session,
      competitionId,
      "admin",
      "organizador"
    );

    const existing = await getCompetitionById(competitionId);
    if (!existing) {
      return NextResponse.json(
        { error: "Competición no encontrada" },
        { status: 404 }
      );
    }

    const body: unknown = await request.json();
    const parsed = updateCompetitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateCompetition(competitionId, parsed.data);
    if (!updated) {
      return NextResponse.json(
        { error: "Competición no encontrada" },
        { status: 404 }
      );
    }

    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "UPDATE_COMPETITION",
      tabla: "competitions",
      registroId: competitionId,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: updated as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return toJsonResponse(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { competitionId } = await params;
  try {
    const session = await getSession();
    const safe = requireSuperAdmin(session);

    const existing = await getCompetitionById(competitionId);
    if (!existing) {
      return NextResponse.json(
        { error: "Competición no encontrada" },
        { status: 404 }
      );
    }

    const ok = await deleteCompetition(competitionId);
    if (!ok) {
      return NextResponse.json(
        { error: "Competición no encontrada" },
        { status: 404 }
      );
    }

    await createAuditEntry({
      competitionId: null,
      userId: safe.sub,
      accion: "DELETE_COMPETITION",
      tabla: "competitions",
      registroId: competitionId,
      datosAnteriores: existing as unknown as Record<string, unknown>,
      datosNuevos: null,
    });

    return NextResponse.json({ message: "Competición eliminada" });
  } catch (error) {
    return toJsonResponse(error);
  }
}
