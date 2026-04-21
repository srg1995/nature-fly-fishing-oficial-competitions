import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const comunidadesAutonomas = pgTable(
  "comunidades_autonomas",
  {
    id: serial("id").primaryKey(),
    codigo: varchar("codigo", { length: 4 }).notNull(),
    nombre: varchar("nombre", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    codigoUnique: uniqueIndex("comunidades_autonomas_codigo_key").on(table.codigo),
    nombreUnique: uniqueIndex("comunidades_autonomas_nombre_key").on(table.nombre),
    slugUnique: uniqueIndex("comunidades_autonomas_slug_key").on(table.slug),
  })
);

export const provincias = pgTable(
  "provincias",
  {
    id: serial("id").primaryKey(),
    codigo: varchar("codigo", { length: 4 }).notNull(),
    nombre: varchar("nombre", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    comunidadAutonomaId: integer("comunidad_autonoma_id")
      .references(() => comunidadesAutonomas.id, { onDelete: "restrict" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    codigoUnique: uniqueIndex("provincias_codigo_key").on(table.codigo),
    nombreUnique: uniqueIndex("provincias_nombre_key").on(table.nombre),
    slugUnique: uniqueIndex("provincias_slug_key").on(table.slug),
    ccaaIdx: index("provincias_comunidad_autonoma_id_idx").on(
      table.comunidadAutonomaId
    ),
  })
);
