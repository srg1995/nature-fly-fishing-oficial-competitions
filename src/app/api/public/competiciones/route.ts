import { NextRequest, NextResponse } from "next/server";
import { listCompetitions } from "@/lib/queries/competitions";
import type { EstadoCompeticion, NivelCompeticion } from "@/types";

export const dynamic = "force-dynamic";

const nivelValues: NivelCompeticion[] = [
  "nacional",
  "autonomica",
  "provincial",
];

function isNivel(value: string): value is NivelCompeticion {
  return (nivelValues as string[]).includes(value);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const nivel = searchParams.get("nivel");
    const caId = searchParams.get("comunidadAutonomaId");
    const pId = searchParams.get("provinciaId");

    const publicEstados: EstadoCompeticion[] = [
      "publicada",
      "en_curso",
      "finalizada",
    ];

    const competitions = await listCompetitions({
      estadosIn: publicEstados,
      nivel: nivel && isNivel(nivel) ? nivel : undefined,
      comunidadAutonomaId: caId ? Number(caId) : undefined,
      provinciaId: pId ? Number(pId) : undefined,
    });

    return NextResponse.json({ data: competitions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener competiciones" },
      { status: 500 }
    );
  }
}
