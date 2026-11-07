import { getCompetitionById } from "$lib/queries/competitions";
import { error, redirect } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  if (!locals.session) throw redirect(302, "/login");

  const competition = await getCompetitionById(params.competitionId);
  if (!competition) throw error(404, "Competición no encontrada");

  return { competition, session: locals.session };
};
