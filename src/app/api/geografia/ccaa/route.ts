import { NextResponse } from "next/server";
import { listComunidadesAutonomas } from "@/lib/queries/competitions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listComunidadesAutonomas();
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener comunidades autónomas" },
      { status: 500 }
    );
  }
}
