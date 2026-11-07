import { listProvincias } from "$lib/queries/competitions";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const caId = url.searchParams.get("comunidadAutonomaId");
    return Response.json({ data: await listProvincias(caId ? Number(caId) : undefined) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error al obtener provincias" }, { status: 500 });
  }
};
