import { requireAnySession, requireSuperAdmin, toJsonResponse } from "$lib/auth-competition";
import { createAuditEntry } from "$lib/db";
import {
  createCompetition,
  getCompetitionBySlug,
  listCompetitions,
  type ListCompetitionsFilters,
} from "$lib/queries/competitions";
import { createCompetitionSchema } from "$lib/validations-competition";
import type { EstadoCompeticion, NivelCompeticion } from "@/types";
import type { RequestHandler } from "./$types";

const nivelValues: NivelCompeticion[] = ["nacional", "autonomica", "provincial"];
const estadoValues: EstadoCompeticion[] = [
  "borrador",
  "publicada",
  "en_curso",
  "finalizada",
  "archivada",
];

const isNivel = (v: string): v is NivelCompeticion => (nivelValues as string[]).includes(v);
const isEstado = (v: string): v is EstadoCompeticion => (estadoValues as string[]).includes(v);

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    requireAnySession(locals.session);
    const sp = url.searchParams;
    const filters: ListCompetitionsFilters = {};
    const nivel = sp.get("nivel");
    const estado = sp.get("estado");
    const caId = sp.get("comunidadAutonomaId");
    const pId = sp.get("provinciaId");
    const search = sp.get("search");
    if (nivel && isNivel(nivel)) filters.nivel = nivel;
    if (estado && isEstado(estado)) filters.estado = estado;
    if (caId) filters.comunidadAutonomaId = Number(caId);
    if (pId) filters.provinciaId = Number(pId);
    if (search) filters.search = search;

    return Response.json({ data: await listCompetitions(filters) });
  } catch (error) {
    return toJsonResponse(error);
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const safe = requireSuperAdmin(locals.session);
    const parsed = createCompetitionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    if (await getCompetitionBySlug(parsed.data.slug)) {
      return Response.json(
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
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    return toJsonResponse(error);
  }
};
