import { NextRequest, NextResponse } from "next/server";
import { getAuditLog } from "@/lib/db";
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
      "organizador"
    );
    const log = await getAuditLog(competitionId, 100);
    return NextResponse.json({ data: log });
  } catch (error) {
    return toJsonResponse(error);
  }
}
