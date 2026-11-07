import { listCompetitions } from "$lib/queries/competitions";

export const load = async () => {
  const competitions = await listCompetitions();
  return { competitions };
};
