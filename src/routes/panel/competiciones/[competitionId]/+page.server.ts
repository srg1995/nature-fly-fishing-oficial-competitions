import { getBestFish, getDashboardStats, getPescadorStats, getRecentCatches } from "$lib/db";

export const load = async ({ params }) => {
  const [stats, topPescadores, recentCatches, bestFish] = await Promise.all([
    getDashboardStats(params.competitionId),
    getPescadorStats(params.competitionId),
    getRecentCatches(params.competitionId, 12),
    getBestFish(params.competitionId, 8),
  ]);

  return {
    stats,
    topPescadores: topPescadores.slice(0, 10),
    recentCatches,
    bestFish,
  };
};
