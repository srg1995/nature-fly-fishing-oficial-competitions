import { listCompetitions } from "$lib/queries/competitions";

export const load = async () => {
  const competitions = await listCompetitions({
    estadosIn: ["publicada", "en_curso", "finalizada"],
  });

  return { competitions };
};
