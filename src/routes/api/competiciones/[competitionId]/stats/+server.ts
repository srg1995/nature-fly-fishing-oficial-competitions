import { requireCompetitionRole, toJsonResponse } from "$lib/auth-competition";
import {
  getBestFish,
  getDashboardStats,
  getMangaStats,
  getPescadorStats,
  getRecentCatches,
} from "$lib/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  const { competitionId } = params;
  try {
    await requireCompetitionRole(locals.session, competitionId, "admin", "organizador", "juez");
    const [basicStats, topPescadores, mangaStats, recentCatches, bestFish] = await Promise.all([
      getDashboardStats(competitionId),
      getPescadorStats(competitionId),
      getMangaStats(competitionId),
      getRecentCatches(competitionId, 10),
      getBestFish(competitionId, 5),
    ]);
    return Response.json({
      data: {
        ...basicStats,
        topPescadores: topPescadores.slice(0, 5),
        mangaStats,
        recentCatches,
        bestFish,
      },
    });
  } catch (error) {
    return toJsonResponse(error);
  }
};
