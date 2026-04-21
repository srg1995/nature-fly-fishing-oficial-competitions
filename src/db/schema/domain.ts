import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  numeric,
  boolean,
  text,
  time,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { competitions } from "./competitions";
import { users } from "./users";

/**
 * Canonical domain schema.
 * Aligned with src/lib/db.ts (table `participantes`, column `pescador_id`).
 * The legacy scripts/schema.sql (`participant_duos`, `duo_id`) is deprecated.
 */

export const participantes = pgTable(
  "participantes",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    competitionId: uuid("competition_id").references(() => competitions.id, {
      onDelete: "cascade",
    }),
    nombre: varchar("nombre", { length: 255 }).notNull(),
    plica: varchar("plica", { length: 50 }).notNull().default(""),
    club: varchar("club", { length: 255 }).notNull().default(""),
    tramo: varchar("tramo", { length: 100 }).notNull().default(""),
    rio: varchar("rio", { length: 100 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionIdx: index("participantes_competition_id_idx").on(
      table.competitionId
    ),
    nombreIdx: index("participantes_nombre_idx").on(table.nombre),
    plicaIdx: index("participantes_plica_idx").on(table.plica),
  })
);

export const catchSessions = pgTable(
  "catch_sessions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    competitionId: uuid("competition_id").references(() => competitions.id, {
      onDelete: "cascade",
    }),
    pescadorId: uuid("pescador_id")
      .references(() => participantes.id, { onDelete: "cascade" })
      .notNull(),
    manga: integer("manga").notNull(),
    horaInicio: time("hora_inicio"),
    horaFin: time("hora_fin"),
    juez: varchar("juez", { length: 255 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionIdx: index("catch_sessions_competition_id_idx").on(
      table.competitionId
    ),
    pescadorIdx: index("catch_sessions_pescador_id_idx").on(table.pescadorId),
    competitionMangaIdx: index("catch_sessions_competition_manga_idx").on(
      table.competitionId,
      table.manga
    ),
  })
);

export const catchRecords = pgTable(
  "catch_records",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    competitionId: uuid("competition_id").references(() => competitions.id, {
      onDelete: "cascade",
    }),
    pescadorId: uuid("pescador_id")
      .references(() => participantes.id, { onDelete: "cascade" })
      .notNull(),
    sessionId: uuid("session_id").references(() => catchSessions.id, {
      onDelete: "set null",
    }),
    manga: integer("manga").notNull(),
    tramo: varchar("tramo", { length: 100 }).notNull().default(""),
    rio: varchar("rio", { length: 100 }).notNull().default(""),
    longitudCm: numeric("longitud_cm", { precision: 5, scale: 1 }).notNull(),
    puntos: integer("puntos").notNull(),
    valida: boolean("valida").notNull().default(true),
    hora: time("hora"),
    observaciones: text("observaciones").notNull().default(""),
    juezId: uuid("juez_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    competitionIdx: index("catch_records_competition_id_idx").on(
      table.competitionId
    ),
    pescadorIdx: index("catch_records_pescador_id_idx").on(table.pescadorId),
    mangaIdx: index("catch_records_competition_manga_idx").on(
      table.competitionId,
      table.manga
    ),
    validaIdx: index("catch_records_competition_valida_idx").on(
      table.competitionId,
      table.valida
    ),
  })
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    competitionId: uuid("competition_id").references(() => competitions.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    accion: varchar("accion", { length: 100 }).notNull(),
    tabla: varchar("tabla", { length: 100 }),
    registroId: uuid("registro_id"),
    datosAnteriores: jsonb("datos_anteriores"),
    datosNuevos: jsonb("datos_nuevos"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    createdAtIdx: index("audit_log_created_at_idx").on(
      sql`${table.createdAt} DESC`
    ),
    competitionCreatedAtIdx: index("audit_log_competition_created_at_idx").on(
      table.competitionId,
      sql`${table.createdAt} DESC`
    ),
  })
);
