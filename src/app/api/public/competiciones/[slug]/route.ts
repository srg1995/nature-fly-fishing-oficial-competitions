import { NextRequest, NextResponse } from "next/server";
import { getCompetitionBySlug } from "@/lib/queries/competitions";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  try {
    const competition = await getCompetitionBySlug(slug);
    if (
      !competition ||
      competition.estado === "borrador" ||
      competition.estado === "archivada"
    ) {
      return NextResponse.json(
        { error: "Competición no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: competition });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener competición" },
      { status: 500 }
    );
  }
}
