import { listCompetitions } from "$lib/queries/competitions";
import { json } from "@sveltejs/kit";
import type { EstadoCompeticion, NivelCompeticion } from "@/types";

const nivelValues: NivelCompeticion[] = [
  "nacional",
  "autonomica",
  "provincial",
  "open",
];

function isNivel(value: string): value is NivelCompeticion {
  return (nivelValues as string[]).includes(value);
}

function parseNumberOrUndefined(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET({ url }: { url: URL }) {
  try {
    const nivel = url.searchParams.get("nivel");
    const caId = parseNumberOrUndefined(
      url.searchParams.get("comunidadAutonomaId")
    );
    const pId = parseNumberOrUndefined(url.searchParams.get("provinciaId"));

    const publicEstados: EstadoCompeticion[] = [
      "publicada",
      "en_curso",
      "finalizada",
    ];

    const competitions = await listCompetitions({
      estadosIn: publicEstados,
      nivel: nivel && isNivel(nivel) ? nivel : undefined,
      comunidadAutonomaId: caId,
      provinciaId: pId,
    });

    return json({ data: competitions });
  } catch (error) {
    console.error(error);
    return json({ error: "Error al obtener competiciones" }, { status: 500 });
  }
}
