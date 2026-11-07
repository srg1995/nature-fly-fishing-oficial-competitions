import { getCompetitionBySlug } from "$lib/queries/competitions";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const competition = await getCompetitionBySlug(params.slug);

  if (
    !competition ||
    competition.estado === "borrador" ||
    competition.estado === "archivada"
  ) {
    throw error(404, "Competición no encontrada");
  }

  return { competition };
};
