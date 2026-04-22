import { NextRequest, NextResponse } from "next/server";
import { listProvincias } from "@/lib/queries/competitions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const caId = searchParams.get("comunidadAutonomaId");
    const data = await listProvincias(caId ? Number(caId) : undefined);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener provincias" },
      { status: 500 }
    );
  }
}
