import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getPescadorStats,
  getMangaStats,
  getRecentCatches,
  getBestFish,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [basicStats, topPescadores, mangaStats, recentCatches, bestFish] =
      await Promise.all([
        getDashboardStats(),
        getPescadorStats(),
        getMangaStats(),
        getRecentCatches(10),
        getBestFish(5),
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
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
