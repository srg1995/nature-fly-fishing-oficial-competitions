import { NextResponse } from "next/server";
import { getAuditLog } from "@/lib/db";
import { requireSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    requireRole(session, "admin", "organizador");

    const log = await getAuditLog(100);
    return NextResponse.json({ data: log });
  } catch (error) {
    if (error instanceof Error && error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Permisos insuficientes") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    }
    console.error("Error fetching audit log:", error);
    return NextResponse.json({ error: "Error al obtener el registro de auditoría" }, { status: 500 });
  }
}
