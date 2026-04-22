import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardStats,
  getPescadorStats,
  getMangaStats,
  getRecentCatches,
  getBestFish,
} from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireCompetitionRole, toJsonResponse } from "@/lib/auth-competition";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ competitionId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { competitionId } = await params;
  try {
    const session = await getSession();
    await requireCompetitionRole(
      session,
      competitionId,
      "admin",
      "organizador",
      "juez"
    );

    const [basicStats, topPescadores, mangaStats, recentCatches, bestFish] =
      await Promise.all([
        getDashboardStats(competitionId),
        getPescadorStats(competitionId),
        getMangaStats(competitionId),
        getRecentCatches(competitionId, 10),
        getBestFish(competitionId, 5),
      ]);

    return NextResponse.json({
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
}
