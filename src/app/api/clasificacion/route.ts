import { NextResponse } from "next/server";
import { getClasificacion } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clasificacion = await getClasificacion();
    return NextResponse.json({ data: clasificacion });
  } catch (error) {
    console.error("Error fetching clasificacion:", error);
    return NextResponse.json({ error: "Error al obtener clasificación" }, { status: 500 });
  }
}
