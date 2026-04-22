import { NextResponse } from "next/server";
import { db } from "@/db";
import { competitions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { JwtPayload } from "./auth";
import type { Competition, UserRole } from "@/types";

/**
 * Authorization helpers for competition-scoped endpoints.
 *
 * NOTE: until the `user_competition_roles` pivot table lands, per-competition
 * membership is not enforced — any logged-in user with the required platform
 * role can access any competition by URL. This is a known temporary
 * over-permission; see TODO-SECURITY.md.
 */

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function toJsonResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}

export async function loadCompetition(competitionId: string): Promise<Competition> {
  const rows = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, competitionId))
    .limit(1);

  if (rows.length === 0) {
    throw new HttpError(404, "Competición no encontrada");
  }
  return rows[0] as unknown as Competition;
}

export function requireSuperAdmin(session: JwtPayload | null): JwtPayload {
  if (!session) throw new HttpError(401, "No autorizado");
  if (session.rol !== "super_admin") {
    throw new HttpError(403, "Requiere rol super_admin");
  }
  return session;
}

export function requireAnySession(session: JwtPayload | null): JwtPayload {
  if (!session) throw new HttpError(401, "No autorizado");
  return session;
}

export async function requireCompetitionRole(
  session: JwtPayload | null,
  competitionId: string,
  ...allowed: UserRole[]
): Promise<{ session: JwtPayload; competition: Competition }> {
  const safeSession = requireAnySession(session);
  const competition = await loadCompetition(competitionId);

  if (safeSession.rol === "super_admin") {
    return { session: safeSession, competition };
  }
  if (allowed.length > 0 && !allowed.includes(safeSession.rol)) {
    throw new HttpError(403, "Permisos insuficientes");
  }
  return { session: safeSession, competition };
}
