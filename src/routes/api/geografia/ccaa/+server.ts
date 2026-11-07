import { listComunidadesAutonomas } from "$lib/queries/competitions";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    return Response.json({ data: await listComunidadesAutonomas() });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Error al obtener comunidades autónomas" },
      { status: 500 }
    );
  }
};
