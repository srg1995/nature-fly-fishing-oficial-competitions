import { getClasificacion } from "$lib/db";

export const load = async ({ params }) => {
  const clasificacion = await getClasificacion(params.competitionId);
  return { clasificacion };
};
