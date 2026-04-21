import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  numeric,
  text,
  date,
  pgEnum,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { comunidadesAutonomas, provincias } from "./geography";
import { users } from "./users";

export const nivelCompeticionEnum = pgEnum("nivel_competicion", [
  "nacional",
  "autonomica",
  "provincial",
]);

export const estadoCompeticionEnum = pgEnum("estado_competicion", [
  "borrador",
  "publicada",
  "en_curso",
  "finalizada",
  "archivada",
]);

export const competitions = pgTable(
  "competitions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: varchar("slug", { length: 120 }).notNull(),
    nombre: varchar("nombre", { length: 255 }).notNull(),
    edicion: varchar("edicion", { length: 50 }).notNull().default(""),
    modalidad: varchar("modalidad", { length: 50 })
      .notNull()
      .default("lance_mosca_duos"),
    nivel: nivelCompeticionEnum("nivel").notNull(),
    comunidadAutonomaId: integer("comunidad_autonoma_id").references(
      () => comunidadesAutonomas.id,
      { onDelete: "restrict" }
    ),
    provinciaId: integer("provincia_id").references(() => provincias.id, {
      onDelete: "restrict",
    }),
    estado: estadoCompeticionEnum("estado").notNull().default("borrador"),
    fechaInicio: date("fecha_inicio").notNull(),
    fechaFin: date("fecha_fin").notNull(),
    lugar: varchar("lugar", { length: 255 }).notNull().default(""),
    organizador: varchar("organizador", { length: 255 }).notNull().default(""),
    organizadorUserId: uuid("organizador_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    totalMangas: integer("total_mangas").notNull().default(4),
    minimaLongitud: numeric("minima_longitud", { precision: 4, scale: 1 })
      .notNull()
      .default("19"),
    rios: text("rios")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    tramos: text("tramos")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    descripcion: text("descripcion").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("competitions_slug_key").on(table.slug),
    nivelIdx: index("competitions_nivel_idx").on(table.nivel),
    estadoIdx: index("competitions_estado_idx").on(table.estado),
    ccaaIdx: index("competitions_comunidad_autonoma_id_idx").on(
      table.comunidadAutonomaId
    ),
    provinciaIdx: index("competitions_provincia_id_idx").on(table.provinciaId),
    fechaInicioIdx: index("competitions_fecha_inicio_idx").on(
      sql`${table.fechaInicio} DESC`
    ),
    nivelTerritorioCheck: check(
      "competitions_nivel_territorio_check",
      sql`(
        (${table.nivel} = 'nacional' AND ${table.comunidadAutonomaId} IS NULL AND ${table.provinciaId} IS NULL)
        OR (${table.nivel} = 'autonomica' AND ${table.comunidadAutonomaId} IS NOT NULL AND ${table.provinciaId} IS NULL)
        OR (${table.nivel} = 'provincial' AND ${table.comunidadAutonomaId} IS NOT NULL AND ${table.provinciaId} IS NOT NULL)
      )`
    ),
    fechasCheck: check(
      "competitions_fechas_check",
      sql`${table.fechaFin} >= ${table.fechaInicio}`
    ),
  })
);
