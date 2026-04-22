import { sql } from "@vercel/postgres";
import type {
  Participante,
  CatchRecord,
  CatchSession,
  User,
  PescadorStats,
  RecentCatch,
  BestFish,
  MangaStats,
  AuditEntry,
} from "@/types";
import { calcularPuntos, resolverEmpate } from "./puntuacion";

// ─── Participantes ─────────────────────────────────────────────────────────────

export async function getParticipantes(
  competitionId: string
): Promise<Participante[]> {
  const { rows } = await sql`
    SELECT
      id, nombre, plica, club, tramo, rio,
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM participantes
    WHERE competition_id = ${competitionId}
    ORDER BY nombre ASC
  `;
  return rows as Participante[];
}

export async function getParticipanteById(
  competitionId: string,
  id: string
): Promise<Participante | null> {
  const { rows } = await sql`
    SELECT
      id, nombre, plica, club, tramo, rio,
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM participantes
    WHERE id = ${id} AND competition_id = ${competitionId}
  `;
  return (rows[0] as Participante) ?? null;
}

export async function createParticipante(
  competitionId: string,
  data: Omit<Participante, "id" | "createdAt" | "updatedAt">
): Promise<Participante> {
  const { rows } = await sql`
    INSERT INTO participantes (competition_id, nombre, plica, club, tramo, rio)
    VALUES (${competitionId}, ${data.nombre}, ${data.plica}, ${data.club}, ${data.tramo}, ${data.rio})
    RETURNING
      id, nombre, plica, club, tramo, rio,
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as Participante;
}

export async function updateParticipante(
  competitionId: string,
  id: string,
  data: Partial<Omit<Participante, "id" | "createdAt" | "updatedAt">>
): Promise<Participante | null> {
  const { rows } = await sql`
    UPDATE participantes
    SET
      nombre = COALESCE(${data.nombre ?? null}, nombre),
      plica  = COALESCE(${data.plica ?? null}, plica),
      club   = COALESCE(${data.club ?? null}, club),
      tramo  = COALESCE(${data.tramo ?? null}, tramo),
      rio    = COALESCE(${data.rio ?? null}, rio),
      updated_at = NOW()
    WHERE id = ${id} AND competition_id = ${competitionId}
    RETURNING
      id, nombre, plica, club, tramo, rio,
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as Participante) ?? null;
}

export async function deleteParticipante(
  competitionId: string,
  id: string
): Promise<boolean> {
  const { rowCount } = await sql`
    DELETE FROM participantes WHERE id = ${id} AND competition_id = ${competitionId}
  `;
  return (rowCount ?? 0) > 0;
}

// ─── Catches ──────────────────────────────────────────────────────────────────

export async function getCatches(
  competitionId: string,
  filters?: {
    pescadorId?: string;
    manga?: number;
    valida?: boolean;
  }
): Promise<CatchRecord[]> {
  const pescadorId = filters?.pescadorId ?? null;
  const manga = filters?.manga ?? null;
  const valida = filters?.valida ?? null;

  const { rows } = await sql`
    SELECT
      id, pescador_id AS "pescadorId", session_id AS "sessionId",
      manga, tramo, rio,
      longitud_cm AS "longitudCm", puntos, valida,
      hora::text AS hora, observaciones,
      juez_id AS "juezId",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM catch_records
    WHERE
      competition_id = ${competitionId}
      AND (${pescadorId}::uuid IS NULL OR pescador_id = ${pescadorId}::uuid)
      AND (${manga}::int IS NULL OR manga = ${manga}::int)
      AND (${valida}::boolean IS NULL OR valida = ${valida}::boolean)
    ORDER BY created_at DESC
  `;
  return rows as CatchRecord[];
}

export async function getCatchById(
  competitionId: string,
  id: string
): Promise<CatchRecord | null> {
  const { rows } = await sql`
    SELECT
      id, pescador_id AS "pescadorId", session_id AS "sessionId",
      manga, tramo, rio,
      longitud_cm AS "longitudCm", puntos, valida,
      hora::text AS hora, observaciones,
      juez_id AS "juezId",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM catch_records
    WHERE id = ${id} AND competition_id = ${competitionId}
  `;
  return (rows[0] as CatchRecord) ?? null;
}

export async function createCatch(
  competitionId: string,
  data: Omit<CatchRecord, "id" | "puntos" | "createdAt" | "updatedAt">
): Promise<CatchRecord> {
  const puntos = calcularPuntos(data.longitudCm);
  const { rows } = await sql`
    INSERT INTO catch_records
      (competition_id, pescador_id, session_id, manga, tramo, rio, longitud_cm, puntos, valida, hora, observaciones, juez_id)
    VALUES
      (${competitionId}, ${data.pescadorId}, ${data.sessionId ?? null}, ${data.manga}, ${data.tramo},
       ${data.rio}, ${data.longitudCm}, ${puntos}, ${data.valida},
       ${data.hora ?? null}::time, ${data.observaciones}, ${data.juezId ?? null})
    RETURNING
      id, pescador_id AS "pescadorId", session_id AS "sessionId",
      manga, tramo, rio,
      longitud_cm AS "longitudCm", puntos, valida,
      hora::text AS hora, observaciones,
      juez_id AS "juezId",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as CatchRecord;
}

export async function updateCatch(
  competitionId: string,
  id: string,
  data: Partial<Omit<CatchRecord, "id" | "createdAt" | "updatedAt">>
): Promise<CatchRecord | null> {
  const puntos =
    data.longitudCm !== undefined ? calcularPuntos(data.longitudCm) : null;

  const { rows } = await sql`
    UPDATE catch_records
    SET
      manga       = COALESCE(${data.manga ?? null}, manga),
      tramo       = COALESCE(${data.tramo ?? null}, tramo),
      rio         = COALESCE(${data.rio ?? null}, rio),
      longitud_cm = COALESCE(${data.longitudCm ?? null}, longitud_cm),
      puntos      = COALESCE(${puntos}, puntos),
      valida      = COALESCE(${data.valida ?? null}, valida),
      hora        = COALESCE(${data.hora ?? null}::time, hora),
      observaciones = COALESCE(${data.observaciones ?? null}, observaciones),
      updated_at  = NOW()
    WHERE id = ${id} AND competition_id = ${competitionId}
    RETURNING
      id, pescador_id AS "pescadorId", session_id AS "sessionId",
      manga, tramo, rio,
      longitud_cm AS "longitudCm", puntos, valida,
      hora::text AS hora, observaciones,
      juez_id AS "juezId",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as CatchRecord) ?? null;
}

export async function deleteCatch(
  competitionId: string,
  id: string
): Promise<boolean> {
  const { rowCount } = await sql`
    DELETE FROM catch_records WHERE id = ${id} AND competition_id = ${competitionId}
  `;
  return (rowCount ?? 0) > 0;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function createSession(
  competitionId: string,
  data: Omit<CatchSession, "id" | "createdAt">
): Promise<CatchSession> {
  const { rows } = await sql`
    INSERT INTO catch_sessions (competition_id, pescador_id, manga, hora_inicio, hora_fin, juez)
    VALUES (${competitionId}, ${data.pescadorId}, ${data.manga}, ${data.horaInicio ?? null}::time, ${data.horaFin ?? null}::time, ${data.juez})
    RETURNING
      id, pescador_id AS "pescadorId", manga,
      hora_inicio::text AS "horaInicio", hora_fin::text AS "horaFin",
      juez, created_at AS "createdAt"
  `;
  return rows[0] as CatchSession;
}

// ─── Stats & Rankings ─────────────────────────────────────────────────────────

export async function getPescadorStats(
  competitionId: string
): Promise<PescadorStats[]> {
  const { rows } = await sql`
    SELECT
      p.id AS "pescadorId",
      p.nombre, p.plica, p.club, p.tramo, p.rio,
      COUNT(c.id)::int AS "totalCapturas",
      COUNT(c.id) FILTER (WHERE c.valida = true)::int AS "capturasValidas",
      COUNT(c.id) FILTER (WHERE c.valida = true AND c.longitud_cm < 19)::int AS "capturasMenores19",
      COALESCE(SUM(c.longitud_cm) FILTER (WHERE c.valida = true), 0)::float AS "totalCm",
      COALESCE(SUM(c.puntos) FILTER (WHERE c.valida = true), 0)::int AS "totalPuntos",
      COALESCE(MAX(c.longitud_cm) FILTER (WHERE c.valida = true), 0)::float AS "mejorPieza"
    FROM participantes p
    LEFT JOIN catch_records c
      ON c.pescador_id = p.id AND c.competition_id = p.competition_id
    WHERE p.competition_id = ${competitionId}
    GROUP BY p.id, p.nombre, p.plica, p.club, p.tramo, p.rio
    ORDER BY "totalPuntos" DESC, "capturasValidas" DESC, "mejorPieza" DESC
  `;

  return (rows as PescadorStats[]).map((row, index) => ({
    ...row,
    posicion: index + 1,
  }));
}

export async function getMangaStats(
  competitionId: string
): Promise<MangaStats[]> {
  const { rows } = await sql`
    SELECT
      manga,
      COUNT(id)::int AS "totalCapturas",
      COUNT(id) FILTER (WHERE valida = true)::int AS "capturasValidas",
      COALESCE(SUM(puntos) FILTER (WHERE valida = true), 0)::int AS "totalPuntos",
      COUNT(DISTINCT pescador_id)::int AS "pescadoresParticipantes"
    FROM catch_records
    WHERE competition_id = ${competitionId}
    GROUP BY manga
    ORDER BY manga ASC
  `;
  return rows as MangaStats[];
}

export async function getRecentCatches(
  competitionId: string,
  limit = 10
): Promise<RecentCatch[]> {
  const { rows } = await sql`
    SELECT
      c.id, c.pescador_id AS "pescadorId", c.session_id AS "sessionId",
      c.manga, c.tramo, c.rio,
      c.longitud_cm AS "longitudCm", c.puntos, c.valida,
      c.hora::text AS hora, c.observaciones,
      c.juez_id AS "juezId",
      c.created_at AS "createdAt", c.updated_at AS "updatedAt",
      p.nombre
    FROM catch_records c
    JOIN participantes p ON p.id = c.pescador_id
    WHERE c.competition_id = ${competitionId} AND c.valida = true
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;
  return rows as RecentCatch[];
}

export async function getBestFish(
  competitionId: string,
  limit = 5
): Promise<BestFish[]> {
  const { rows } = await sql`
    SELECT
      c.id, c.longitud_cm AS "longitudCm", c.puntos,
      p.nombre, c.manga,
      c.hora::text AS hora, c.created_at AS "createdAt"
    FROM catch_records c
    JOIN participantes p ON p.id = c.pescador_id
    WHERE c.competition_id = ${competitionId} AND c.valida = true AND c.longitud_cm >= 18
    ORDER BY c.longitud_cm DESC
    LIMIT ${limit}
  `;
  return rows as BestFish[];
}

export async function getDashboardStats(competitionId: string) {
  const [pescadoresResult, catchesResult, pointsResult, mangasResult] =
    await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM participantes WHERE competition_id = ${competitionId}`,
      sql`SELECT COUNT(*)::int AS count FROM catch_records WHERE competition_id = ${competitionId} AND valida = true`,
      sql`SELECT COALESCE(SUM(puntos), 0)::int AS total FROM catch_records WHERE competition_id = ${competitionId} AND valida = true`,
      sql`SELECT COUNT(DISTINCT manga)::int AS count FROM catch_records WHERE competition_id = ${competitionId}`,
    ]);

  return {
    totalPescadores: pescadoresResult.rows[0].count as number,
    totalCapturas: catchesResult.rows[0].count as number,
    totalPuntos: pointsResult.rows[0].total as number,
    mangasActivas: mangasResult.rows[0].count as number,
  };
}

// ─── Users (global) ───────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const { rows } = await sql`
    SELECT
      id, email, nombre, rol, password_hash AS "passwordHash",
      created_at AS "createdAt"
    FROM users
    WHERE email = ${email}
  `;
  return (rows[0] as (User & { passwordHash: string; createdAt: Date })) ?? null;
}

export async function getUsers(): Promise<User[]> {
  const { rows } = await sql`
    SELECT id, email, nombre, rol, created_at AS "createdAt"
    FROM users
    ORDER BY nombre ASC
  `;
  return rows as User[];
}

export async function createUser(data: {
  email: string;
  nombre: string;
  passwordHash: string;
  rol: string;
}): Promise<User> {
  const { rows } = await sql`
    INSERT INTO users (email, nombre, password_hash, rol)
    VALUES (${data.email}, ${data.nombre}, ${data.passwordHash}, ${data.rol})
    RETURNING id, email, nombre, rol, created_at AS "createdAt"
  `;
  return rows[0] as User;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM users WHERE id = ${id}`;
  return (rowCount ?? 0) > 0;
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export async function createAuditEntry(data: {
  competitionId: string | null;
  userId: string | null;
  accion: string;
  tabla: string | null;
  registroId: string | null;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown> | null;
}): Promise<void> {
  await sql`
    INSERT INTO audit_log
      (competition_id, user_id, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
    VALUES
      (${data.competitionId}, ${data.userId}, ${data.accion}, ${data.tabla},
       ${data.registroId}, ${JSON.stringify(data.datosAnteriores)},
       ${JSON.stringify(data.datosNuevos)})
  `;
}

export async function getAuditLog(
  competitionId: string | null,
  limit = 50
): Promise<AuditEntry[]> {
  const { rows } = await sql`
    SELECT
      a.id, a.user_id AS "userId", a.accion, a.tabla,
      a.registro_id AS "registroId",
      a.datos_anteriores AS "datosAnteriores",
      a.datos_nuevos AS "datosNuevos",
      a.created_at AS "createdAt",
      u.nombre AS "userName"
    FROM audit_log a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE (${competitionId}::uuid IS NULL OR a.competition_id = ${competitionId}::uuid)
    ORDER BY a.created_at DESC
    LIMIT ${limit}
  `;
  return rows as AuditEntry[];
}

// ─── Clasificación con desempate ──────────────────────────────────────────────

export async function getClasificacion(
  competitionId: string
): Promise<PescadorStats[]> {
  const stats = await getPescadorStats(competitionId);
  return stats.sort((a, b) => {
    if (b.totalPuntos !== a.totalPuntos) return b.totalPuntos - a.totalPuntos;
    return resolverEmpate(a, b);
  }).map((s, i) => ({ ...s, posicion: i + 1 }));
}
