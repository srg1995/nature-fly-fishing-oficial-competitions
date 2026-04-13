import { sql } from "@vercel/postgres";
import type {
  ParticipantDuo,
  CatchRecord,
  CatchSession,
  User,
  DuoStats,
  RecentCatch,
  BestFish,
  MangaStats,
  AuditEntry,
} from "@/types";
import { calcularPuntos, resolverEmpate } from "./puntuacion";

// ─── Duos ─────────────────────────────────────────────────────────────────────

export async function getDuos(): Promise<ParticipantDuo[]> {
  const { rows } = await sql`
    SELECT
      id, nombre_duo AS "nombreDuo", pescador1, pescador2,
      plica, tramo, rio, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM participant_duos
    ORDER BY nombre_duo ASC
  `;
  return rows as ParticipantDuo[];
}

export async function getDuoById(id: string): Promise<ParticipantDuo | null> {
  const { rows } = await sql`
    SELECT
      id, nombre_duo AS "nombreDuo", pescador1, pescador2,
      plica, tramo, rio, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM participant_duos
    WHERE id = ${id}
  `;
  return (rows[0] as ParticipantDuo) ?? null;
}

export async function createDuo(
  data: Omit<ParticipantDuo, "id" | "createdAt" | "updatedAt">
): Promise<ParticipantDuo> {
  const { rows } = await sql`
    INSERT INTO participant_duos (nombre_duo, pescador1, pescador2, plica, tramo, rio)
    VALUES (${data.nombreDuo}, ${data.pescador1}, ${data.pescador2}, ${data.plica}, ${data.tramo}, ${data.rio})
    RETURNING
      id, nombre_duo AS "nombreDuo", pescador1, pescador2,
      plica, tramo, rio, created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as ParticipantDuo;
}

export async function updateDuo(
  id: string,
  data: Partial<Omit<ParticipantDuo, "id" | "createdAt" | "updatedAt">>
): Promise<ParticipantDuo | null> {
  const { rows } = await sql`
    UPDATE participant_duos
    SET
      nombre_duo = COALESCE(${data.nombreDuo ?? null}, nombre_duo),
      pescador1  = COALESCE(${data.pescador1 ?? null}, pescador1),
      pescador2  = COALESCE(${data.pescador2 ?? null}, pescador2),
      plica      = COALESCE(${data.plica ?? null}, plica),
      tramo      = COALESCE(${data.tramo ?? null}, tramo),
      rio        = COALESCE(${data.rio ?? null}, rio),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, nombre_duo AS "nombreDuo", pescador1, pescador2,
      plica, tramo, rio, created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as ParticipantDuo) ?? null;
}

export async function deleteDuo(id: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM participant_duos WHERE id = ${id}`;
  return (rowCount ?? 0) > 0;
}

// ─── Catches ──────────────────────────────────────────────────────────────────

export async function getCatches(filters?: {
  duoId?: string;
  manga?: number;
  valida?: boolean;
}): Promise<CatchRecord[]> {
  const duoId = filters?.duoId ?? null;
  const manga = filters?.manga ?? null;
  const valida = filters?.valida ?? null;

  const { rows } = await sql`
    SELECT
      id, duo_id AS "duoId", session_id AS "sessionId",
      manga, tramo, rio,
      longitud_cm AS "longitudCm", puntos, valida,
      hora::text AS hora, observaciones,
      juez_id AS "juezId",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM catch_records
    WHERE
      (${duoId}::uuid IS NULL OR duo_id = ${duoId}::uuid)
      AND (${manga}::int IS NULL OR manga = ${manga}::int)
      AND (${valida}::boolean IS NULL OR valida = ${valida}::boolean)
    ORDER BY created_at DESC
  `;
  return rows as CatchRecord[];
}

export async function getCatchById(id: string): Promise<CatchRecord | null> {
  const { rows } = await sql`
    SELECT
      id, duo_id AS "duoId", session_id AS "sessionId",
      manga, tramo, rio,
      longitud_cm AS "longitudCm", puntos, valida,
      hora::text AS hora, observaciones,
      juez_id AS "juezId",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM catch_records
    WHERE id = ${id}
  `;
  return (rows[0] as CatchRecord) ?? null;
}

export async function createCatch(
  data: Omit<CatchRecord, "id" | "puntos" | "createdAt" | "updatedAt">
): Promise<CatchRecord> {
  const puntos = calcularPuntos(data.longitudCm);
  const { rows } = await sql`
    INSERT INTO catch_records
      (duo_id, session_id, manga, tramo, rio, longitud_cm, puntos, valida, hora, observaciones, juez_id)
    VALUES
      (${data.duoId}, ${data.sessionId ?? null}, ${data.manga}, ${data.tramo},
       ${data.rio}, ${data.longitudCm}, ${puntos}, ${data.valida},
       ${data.hora ?? null}::time, ${data.observaciones}, ${data.juezId ?? null})
    RETURNING
      id, duo_id AS "duoId", session_id AS "sessionId",
      manga, tramo, rio,
      longitud_cm AS "longitudCm", puntos, valida,
      hora::text AS hora, observaciones,
      juez_id AS "juezId",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as CatchRecord;
}

export async function updateCatch(
  id: string,
  data: Partial<Omit<CatchRecord, "id" | "createdAt" | "updatedAt">>
): Promise<CatchRecord | null> {
  // Recalculate points if length changed
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
    WHERE id = ${id}
    RETURNING
      id, duo_id AS "duoId", session_id AS "sessionId",
      manga, tramo, rio,
      longitud_cm AS "longitudCm", puntos, valida,
      hora::text AS hora, observaciones,
      juez_id AS "juezId",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as CatchRecord) ?? null;
}

export async function deleteCatch(id: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM catch_records WHERE id = ${id}`;
  return (rowCount ?? 0) > 0;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function createSession(
  data: Omit<CatchSession, "id" | "createdAt">
): Promise<CatchSession> {
  const { rows } = await sql`
    INSERT INTO catch_sessions (duo_id, manga, hora_inicio, hora_fin, juez)
    VALUES (${data.duoId}, ${data.manga}, ${data.horaInicio ?? null}::time, ${data.horaFin ?? null}::time, ${data.juez})
    RETURNING
      id, duo_id AS "duoId", manga,
      hora_inicio::text AS "horaInicio", hora_fin::text AS "horaFin",
      juez, created_at AS "createdAt"
  `;
  return rows[0] as CatchSession;
}

// ─── Stats & Rankings ─────────────────────────────────────────────────────────

export async function getDuoStats(): Promise<DuoStats[]> {
  const { rows } = await sql`
    SELECT
      d.id AS "duoId",
      d.nombre_duo AS "nombreDuo",
      d.pescador1, d.pescador2,
      d.plica, d.tramo, d.rio,
      COUNT(c.id)::int AS "totalCapturas",
      COUNT(c.id) FILTER (WHERE c.valida = true)::int AS "capturasValidas",
      COUNT(c.id) FILTER (WHERE c.valida = true AND c.longitud_cm < 18)::int AS "capturasMenores18",
      COALESCE(SUM(c.longitud_cm) FILTER (WHERE c.valida = true), 0)::float AS "totalCm",
      COALESCE(SUM(c.puntos) FILTER (WHERE c.valida = true), 0)::int AS "totalPuntos",
      COALESCE(MAX(c.longitud_cm) FILTER (WHERE c.valida = true), 0)::float AS "mejorPieza"
    FROM participant_duos d
    LEFT JOIN catch_records c ON c.duo_id = d.id
    GROUP BY d.id, d.nombre_duo, d.pescador1, d.pescador2, d.plica, d.tramo, d.rio
    ORDER BY "totalPuntos" DESC, "capturasValidas" DESC, "mejorPieza" DESC
  `;

  return (rows as DuoStats[]).map((row, index) => ({
    ...row,
    posicion: index + 1,
  }));
}

export async function getMangaStats(): Promise<MangaStats[]> {
  const { rows } = await sql`
    SELECT
      manga,
      COUNT(id)::int AS "totalCapturas",
      COUNT(id) FILTER (WHERE valida = true)::int AS "capturasValidas",
      COALESCE(SUM(puntos) FILTER (WHERE valida = true), 0)::int AS "totalPuntos",
      COUNT(DISTINCT duo_id)::int AS "duosParticipantes"
    FROM catch_records
    GROUP BY manga
    ORDER BY manga ASC
  `;
  return rows as MangaStats[];
}

export async function getRecentCatches(limit = 10): Promise<RecentCatch[]> {
  const { rows } = await sql`
    SELECT
      c.id, c.duo_id AS "duoId", c.session_id AS "sessionId",
      c.manga, c.tramo, c.rio,
      c.longitud_cm AS "longitudCm", c.puntos, c.valida,
      c.hora::text AS hora, c.observaciones,
      c.juez_id AS "juezId",
      c.created_at AS "createdAt", c.updated_at AS "updatedAt",
      d.nombre_duo AS "nombreDuo", d.pescador1, d.pescador2
    FROM catch_records c
    JOIN participant_duos d ON d.id = c.duo_id
    WHERE c.valida = true
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;
  return rows as RecentCatch[];
}

export async function getBestFish(limit = 5): Promise<BestFish[]> {
  const { rows } = await sql`
    SELECT
      c.id, c.longitud_cm AS "longitudCm", c.puntos,
      d.nombre_duo AS "nombreDuo", c.manga,
      c.hora::text AS hora, c.created_at AS "createdAt"
    FROM catch_records c
    JOIN participant_duos d ON d.id = c.duo_id
    WHERE c.valida = true AND c.longitud_cm >= 18
    ORDER BY c.longitud_cm DESC
    LIMIT ${limit}
  `;
  return rows as BestFish[];
}

export async function getDashboardStats() {
  const [duosResult, catchesResult, pointsResult, mangasResult] =
    await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM participant_duos`,
      sql`SELECT COUNT(*)::int AS count FROM catch_records WHERE valida = true`,
      sql`SELECT COALESCE(SUM(puntos), 0)::int AS total FROM catch_records WHERE valida = true`,
      sql`SELECT COUNT(DISTINCT manga)::int AS count FROM catch_records`,
    ]);

  return {
    totalDuos: duosResult.rows[0].count as number,
    totalCapturas: catchesResult.rows[0].count as number,
    totalPuntos: pointsResult.rows[0].total as number,
    mangasActivas: mangasResult.rows[0].count as number,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

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
  userId: string | null;
  accion: string;
  tabla: string | null;
  registroId: string | null;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown> | null;
}): Promise<void> {
  await sql`
    INSERT INTO audit_log
      (user_id, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
    VALUES
      (${data.userId}, ${data.accion}, ${data.tabla},
       ${data.registroId}, ${JSON.stringify(data.datosAnteriores)},
       ${JSON.stringify(data.datosNuevos)})
  `;
}

export async function getAuditLog(limit = 50): Promise<AuditEntry[]> {
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
    ORDER BY a.created_at DESC
    LIMIT ${limit}
  `;
  return rows as AuditEntry[];
}

// ─── Clasificación con desempate ──────────────────────────────────────────────

export async function getClasificacion(): Promise<DuoStats[]> {
  const stats = await getDuoStats();
  return stats.sort((a, b) => {
    if (b.totalPuntos !== a.totalPuntos) return b.totalPuntos - a.totalPuntos;
    return resolverEmpate(a, b);
  }).map((s, i) => ({ ...s, posicion: i + 1 }));
}
