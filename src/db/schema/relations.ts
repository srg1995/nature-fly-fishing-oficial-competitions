import { relations } from "drizzle-orm";
import { comunidadesAutonomas, provincias } from "./geography";
import { competitions } from "./competitions";
import { users } from "./users";
import {
  participantes,
  catchSessions,
  catchRecords,
  auditLog,
} from "./domain";

export const comunidadesAutonomasRelations = relations(
  comunidadesAutonomas,
  ({ many }) => ({
    provincias: many(provincias),
    competitions: many(competitions),
  })
);

export const provinciasRelations = relations(provincias, ({ one, many }) => ({
  comunidadAutonoma: one(comunidadesAutonomas, {
    fields: [provincias.comunidadAutonomaId],
    references: [comunidadesAutonomas.id],
  }),
  competitions: many(competitions),
}));

export const competitionsRelations = relations(competitions, ({ one, many }) => ({
  comunidadAutonoma: one(comunidadesAutonomas, {
    fields: [competitions.comunidadAutonomaId],
    references: [comunidadesAutonomas.id],
  }),
  provincia: one(provincias, {
    fields: [competitions.provinciaId],
    references: [provincias.id],
  }),
  organizadorUser: one(users, {
    fields: [competitions.organizadorUserId],
    references: [users.id],
  }),
  participantes: many(participantes),
  catchSessions: many(catchSessions),
  catchRecords: many(catchRecords),
  auditEntries: many(auditLog),
}));

export const participantesRelations = relations(
  participantes,
  ({ one, many }) => ({
    competition: one(competitions, {
      fields: [participantes.competitionId],
      references: [competitions.id],
    }),
    catchRecords: many(catchRecords),
    catchSessions: many(catchSessions),
  })
);

export const catchSessionsRelations = relations(catchSessions, ({ one, many }) => ({
  competition: one(competitions, {
    fields: [catchSessions.competitionId],
    references: [competitions.id],
  }),
  pescador: one(participantes, {
    fields: [catchSessions.pescadorId],
    references: [participantes.id],
  }),
  catches: many(catchRecords),
}));

export const catchRecordsRelations = relations(catchRecords, ({ one }) => ({
  competition: one(competitions, {
    fields: [catchRecords.competitionId],
    references: [competitions.id],
  }),
  pescador: one(participantes, {
    fields: [catchRecords.pescadorId],
    references: [participantes.id],
  }),
  session: one(catchSessions, {
    fields: [catchRecords.sessionId],
    references: [catchSessions.id],
  }),
  juez: one(users, {
    fields: [catchRecords.juezId],
    references: [users.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  competition: one(competitions, {
    fields: [auditLog.competitionId],
    references: [competitions.id],
  }),
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));
