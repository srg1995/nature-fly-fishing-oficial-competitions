import { NextRequest, NextResponse } from "next/server";
import { getParticipantes, createParticipante, createAuditEntry } from "@/lib/db";
import { createParticipanteSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import {
  requireCompetitionRole,
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
    await requireCompetitionRole(session, competitionId, "admin", "organizador", "juez");
    const data = await getParticipantes(competitionId);
    return NextResponse.json({ data });
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
      "organizador"
    );
    const body: unknown = await request.json();
    const parsed = createParticipanteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const participante = await createParticipante(competitionId, parsed.data);

    await createAuditEntry({
      competitionId,
      userId: safe.sub,
      accion: "CREATE_PARTICIPANTE",
      tabla: "participantes",
      registroId: participante.id,
      datosAnteriores: null,
      datosNuevos: participante as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: participante }, { status: 201 });
  } catch (error) {
    return toJsonResponse(error);
  }
}
