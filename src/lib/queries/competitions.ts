import { db } from "@/db";
import {
  competitions,
  comunidadesAutonomas,
  provincias,
} from "@/db/schema";
import { and, desc, eq, ilike, inArray, or, SQL } from "drizzle-orm";
import type {
  Competition,
  CreateCompetitionInput,
  EstadoCompeticion,
  NivelCompeticion,
  UpdateCompetitionInput,
} from "@/types";

function rowToCompetition(row: typeof competitions.$inferSelect): Competition {
  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    edicion: row.edicion,
    modalidad: row.modalidad,
    nivel: row.nivel,
    comunidadAutonomaId: row.comunidadAutonomaId,
    provinciaId: row.provinciaId,
    estado: row.estado,
    fechaInicio: row.fechaInicio,
    fechaFin: row.fechaFin,
    lugar: row.lugar,
    organizador: row.organizador,
    organizadorUserId: row.organizadorUserId,
    totalMangas: row.totalMangas,
    minimaLongitud: Number(row.minimaLongitud),
    rios: row.rios,
    tramos: row.tramos,
    descripcion: row.descripcion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getCompetitionById(
  id: string
): Promise<Competition | null> {
  const rows = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id))
    .limit(1);
  return rows[0] ? rowToCompetition(rows[0]) : null;
}

export async function getCompetitionBySlug(
  slug: string
): Promise<Competition | null> {
  const rows = await db
    .select()
    .from(competitions)
    .where(eq(competitions.slug, slug))
    .limit(1);
  return rows[0] ? rowToCompetition(rows[0]) : null;
}

export interface ListCompetitionsFilters {
  nivel?: NivelCompeticion;
  estado?: EstadoCompeticion;
  estadosIn?: EstadoCompeticion[];
  comunidadAutonomaId?: number;
  provinciaId?: number;
  search?: string;
}

export async function listCompetitions(
  filters: ListCompetitionsFilters = {}
): Promise<Competition[]> {
  const conditions: SQL[] = [];

  if (filters.nivel) conditions.push(eq(competitions.nivel, filters.nivel));
  if (filters.estado) conditions.push(eq(competitions.estado, filters.estado));
  if (filters.estadosIn?.length) {
    conditions.push(inArray(competitions.estado, filters.estadosIn));
  }
  if (filters.comunidadAutonomaId !== undefined) {
    conditions.push(
      eq(competitions.comunidadAutonomaId, filters.comunidadAutonomaId)
    );
  }
  if (filters.provinciaId !== undefined) {
    conditions.push(eq(competitions.provinciaId, filters.provinciaId));
  }
  if (filters.search) {
    const term = `%${filters.search}%`;
    const searchCondition = or(
      ilike(competitions.nombre, term),
      ilike(competitions.slug, term)
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const query = db
    .select()
    .from(competitions)
    .orderBy(desc(competitions.fechaInicio));

  const rows =
    conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

  return rows.map(rowToCompetition);
}

export async function createCompetition(
  input: CreateCompetitionInput
): Promise<Competition> {
  const [row] = await db
    .insert(competitions)
    .values({
      slug: input.slug,
      nombre: input.nombre,
      edicion: input.edicion,
      modalidad: input.modalidad,
      nivel: input.nivel,
      comunidadAutonomaId: input.comunidadAutonomaId,
      provinciaId: input.provinciaId,
      estado: input.estado,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
      lugar: input.lugar,
      organizador: input.organizador,
      organizadorUserId: input.organizadorUserId,
      totalMangas: input.totalMangas,
      minimaLongitud: String(input.minimaLongitud),
      rios: input.rios,
      tramos: input.tramos,
      descripcion: input.descripcion,
    })
    .returning();
  return rowToCompetition(row);
}

export async function updateCompetition(
  id: string,
  input: UpdateCompetitionInput
): Promise<Competition | null> {
  const patch: Partial<typeof competitions.$inferInsert> = { updatedAt: new Date() };
  if (input.nombre !== undefined) patch.nombre = input.nombre;
  if (input.edicion !== undefined) patch.edicion = input.edicion;
  if (input.modalidad !== undefined) patch.modalidad = input.modalidad;
  if (input.estado !== undefined) patch.estado = input.estado;
  if (input.fechaInicio !== undefined) patch.fechaInicio = input.fechaInicio;
  if (input.fechaFin !== undefined) patch.fechaFin = input.fechaFin;
  if (input.lugar !== undefined) patch.lugar = input.lugar;
  if (input.organizador !== undefined) patch.organizador = input.organizador;
  if (input.organizadorUserId !== undefined) patch.organizadorUserId = input.organizadorUserId;
  if (input.totalMangas !== undefined) patch.totalMangas = input.totalMangas;
  if (input.minimaLongitud !== undefined) patch.minimaLongitud = String(input.minimaLongitud);
  if (input.rios !== undefined) patch.rios = input.rios;
  if (input.tramos !== undefined) patch.tramos = input.tramos;
  if (input.descripcion !== undefined) patch.descripcion = input.descripcion;

  const [row] = await db
    .update(competitions)
    .set(patch)
    .where(eq(competitions.id, id))
    .returning();
  return row ? rowToCompetition(row) : null;
}

export async function deleteCompetition(id: string): Promise<boolean> {
  const result = await db
    .delete(competitions)
    .where(eq(competitions.id, id))
    .returning({ id: competitions.id });
  return result.length > 0;
}

// ─── Geografía ───────────────────────────────────────────────────────────────

export async function listComunidadesAutonomas() {
  return db
    .select()
    .from(comunidadesAutonomas)
    .orderBy(comunidadesAutonomas.nombre);
}

export async function listProvincias(comunidadAutonomaId?: number) {
  if (comunidadAutonomaId !== undefined) {
    return db
      .select()
      .from(provincias)
      .where(eq(provincias.comunidadAutonomaId, comunidadAutonomaId))
      .orderBy(provincias.nombre);
  }
  return db.select().from(provincias).orderBy(provincias.nombre);
}
