import { NextRequest, NextResponse } from "next/server";
import {
  createCompetition,
  getCompetitionBySlug,
  listCompetitions,
  type ListCompetitionsFilters,
} from "@/lib/queries/competitions";
import { createCompetitionSchema } from "@/lib/validations-competition";
import { createAuditEntry } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  requireAnySession,
  requireSuperAdmin,
  toJsonResponse,
} from "@/lib/auth-competition";
import type { EstadoCompeticion, NivelCompeticion } from "@/types";

export const dynamic = "force-dynamic";

const nivelValues: NivelCompeticion[] = [
  "nacional",
  "autonomica",
  "provincial",
];
const estadoValues: EstadoCompeticion[] = [
  "borrador",
  "publicada",
  "en_curso",
  "finalizada",
  "archivada",
];

function isNivel(value: string): value is NivelCompeticion {
  return (nivelValues as string[]).includes(value);
}

function isEstado(value: string): value is EstadoCompeticion {
  return (estadoValues as string[]).includes(value);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    requireAnySession(session);

    const { searchParams } = request.nextUrl;
    const filters: ListCompetitionsFilters = {};
    const nivel = searchParams.get("nivel");
    const estado = searchParams.get("estado");
    const caId = searchParams.get("comunidadAutonomaId");
    const pId = searchParams.get("provinciaId");
    const search = searchParams.get("search");

    if (nivel && isNivel(nivel)) filters.nivel = nivel;
    if (estado && isEstado(estado)) filters.estado = estado;
    if (caId) filters.comunidadAutonomaId = Number(caId);
    if (pId) filters.provinciaId = Number(pId);
    if (search) filters.search = search;

    const data = await listCompetitions(filters);
    return NextResponse.json({ data });
  } catch (error) {
    return toJsonResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const safe = requireSuperAdmin(session);

    const body: unknown = await request.json();
    const parsed = createCompetitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await getCompetitionBySlug(parsed.data.slug);
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una competición con ese slug" },
        { status: 409 }
      );
    }

    const created = await createCompetition(parsed.data);

    await createAuditEntry({
      competitionId: created.id,
      userId: safe.sub,
      accion: "CREATE_COMPETITION",
      tabla: "competitions",
      registroId: created.id,
      datosAnteriores: null,
      datosNuevos: created as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return toJsonResponse(error);
  }
}
