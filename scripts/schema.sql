-- ============================================================
-- ⚠️ DEPRECATED. Canonical schema is in /drizzle/*.sql (managed via Drizzle).
-- This file is kept for historical reference; do not run it against a new DB.
-- Use:  bun db:migrate
-- ============================================================
-- VI Campeonato Nacional de Salmónidos Lance Mosca Dúos
-- Database Schema — Vercel Postgres (legacy)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  nombre        VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(50)  NOT NULL DEFAULT 'juez'
                  CHECK (rol IN ('admin', 'organizador', 'juez')),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Participant Duos ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS participant_duos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_duo VARCHAR(255) NOT NULL,
  pescador1  VARCHAR(255) NOT NULL,
  pescador2  VARCHAR(255) NOT NULL,
  plica      VARCHAR(50)  NOT NULL DEFAULT '',
  tramo      VARCHAR(100) NOT NULL DEFAULT '',
  rio        VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_duos_nombre ON participant_duos (nombre_duo);
CREATE INDEX IF NOT EXISTS idx_duos_plica  ON participant_duos (plica);

-- ─── Catch Sessions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catch_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duo_id      UUID NOT NULL REFERENCES participant_duos(id) ON DELETE CASCADE,
  manga       INTEGER NOT NULL,
  hora_inicio TIME,
  hora_fin    TIME,
  juez        VARCHAR(255) NOT NULL DEFAULT '',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_duo_id ON catch_sessions (duo_id);

-- ─── Catch Records ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catch_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duo_id        UUID     NOT NULL REFERENCES participant_duos(id) ON DELETE CASCADE,
  session_id    UUID     REFERENCES catch_sessions(id) ON DELETE SET NULL,
  manga         INTEGER  NOT NULL,
  tramo         VARCHAR(100) NOT NULL DEFAULT '',
  rio           VARCHAR(100) NOT NULL DEFAULT '',
  longitud_cm   NUMERIC(5,1) NOT NULL CHECK (longitud_cm > 0),
  puntos        INTEGER      NOT NULL CHECK (puntos >= 0),
  valida        BOOLEAN      NOT NULL DEFAULT TRUE,
  hora          TIME,
  observaciones TEXT         NOT NULL DEFAULT '',
  juez_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catches_duo_id  ON catch_records (duo_id);
CREATE INDEX IF NOT EXISTS idx_catches_manga   ON catch_records (manga);
CREATE INDEX IF NOT EXISTS idx_catches_valida  ON catch_records (valida);

-- ─── Audit Log ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  accion           VARCHAR(100) NOT NULL,
  tabla            VARCHAR(100),
  registro_id      UUID,
  datos_anteriores JSONB,
  datos_nuevos     JSONB,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log (created_at DESC);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_duos_updated_at ON participant_duos;
CREATE TRIGGER trg_duos_updated_at
  BEFORE UPDATE ON participant_duos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_catches_updated_at ON catch_records;
CREATE TRIGGER trg_catches_updated_at
  BEFORE UPDATE ON catch_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
