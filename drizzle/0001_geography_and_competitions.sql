-- =============================================================================
-- 0001 — Geography, competitions, and tenantizing domain tables (additive).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Base domain tables (create if missing — aligns schema with src/lib/db.ts) ─
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  nombre        VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(50)  NOT NULL DEFAULT 'juez',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participantes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     VARCHAR(255) NOT NULL,
  plica      VARCHAR(50)  NOT NULL DEFAULT '',
  club       VARCHAR(255) NOT NULL DEFAULT '',
  tramo      VARCHAR(100) NOT NULL DEFAULT '',
  rio        VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS participantes_nombre_idx ON participantes (nombre);
CREATE INDEX IF NOT EXISTS participantes_plica_idx  ON participantes (plica);

CREATE TABLE IF NOT EXISTS catch_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pescador_id  UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  manga        INTEGER NOT NULL,
  hora_inicio  TIME,
  hora_fin     TIME,
  juez         VARCHAR(255) NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS catch_sessions_pescador_id_idx ON catch_sessions (pescador_id);

CREATE TABLE IF NOT EXISTS catch_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pescador_id   UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  session_id    UUID REFERENCES catch_sessions(id) ON DELETE SET NULL,
  manga         INTEGER NOT NULL,
  tramo         VARCHAR(100) NOT NULL DEFAULT '',
  rio           VARCHAR(100) NOT NULL DEFAULT '',
  longitud_cm   NUMERIC(5,1) NOT NULL CHECK (longitud_cm > 0),
  puntos        INTEGER NOT NULL CHECK (puntos >= 0),
  valida        BOOLEAN NOT NULL DEFAULT TRUE,
  hora          TIME,
  observaciones TEXT NOT NULL DEFAULT '',
  juez_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS catch_records_pescador_id_idx ON catch_records (pescador_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  accion           VARCHAR(100) NOT NULL,
  tabla            VARCHAR(100),
  registro_id      UUID,
  datos_anteriores JSONB,
  datos_nuevos     JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log (created_at DESC);

-- Auto-update updated_at trigger (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_participantes_updated_at ON participantes;
CREATE TRIGGER trg_participantes_updated_at
  BEFORE UPDATE ON participantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_catch_records_updated_at ON catch_records;
CREATE TRIGGER trg_catch_records_updated_at
  BEFORE UPDATE ON catch_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Enums ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE nivel_competicion AS ENUM ('nacional', 'autonomica', 'provincial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_competicion AS ENUM ('borrador', 'publicada', 'en_curso', 'finalizada', 'archivada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Comunidades autónomas ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comunidades_autonomas (
  id         SERIAL PRIMARY KEY,
  codigo     VARCHAR(4) NOT NULL,
  nombre     VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS comunidades_autonomas_codigo_key ON comunidades_autonomas (codigo);
CREATE UNIQUE INDEX IF NOT EXISTS comunidades_autonomas_nombre_key ON comunidades_autonomas (nombre);
CREATE UNIQUE INDEX IF NOT EXISTS comunidades_autonomas_slug_key   ON comunidades_autonomas (slug);

-- ─── Provincias ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS provincias (
  id                    SERIAL PRIMARY KEY,
  codigo                VARCHAR(4) NOT NULL,
  nombre                VARCHAR(100) NOT NULL,
  slug                  VARCHAR(100) NOT NULL,
  comunidad_autonoma_id INTEGER NOT NULL REFERENCES comunidades_autonomas(id) ON DELETE RESTRICT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS provincias_codigo_key ON provincias (codigo);
CREATE UNIQUE INDEX IF NOT EXISTS provincias_nombre_key ON provincias (nombre);
CREATE UNIQUE INDEX IF NOT EXISTS provincias_slug_key   ON provincias (slug);
CREATE INDEX        IF NOT EXISTS provincias_comunidad_autonoma_id_idx ON provincias (comunidad_autonoma_id);

-- ─── Competitions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  VARCHAR(120) NOT NULL,
  nombre                VARCHAR(255) NOT NULL,
  edicion               VARCHAR(50)  NOT NULL DEFAULT '',
  modalidad             VARCHAR(50)  NOT NULL DEFAULT 'lance_mosca_duos',
  nivel                 nivel_competicion NOT NULL,
  comunidad_autonoma_id INTEGER REFERENCES comunidades_autonomas(id) ON DELETE RESTRICT,
  provincia_id          INTEGER REFERENCES provincias(id) ON DELETE RESTRICT,
  estado                estado_competicion NOT NULL DEFAULT 'borrador',
  fecha_inicio          DATE NOT NULL,
  fecha_fin             DATE NOT NULL,
  lugar                 VARCHAR(255) NOT NULL DEFAULT '',
  organizador           VARCHAR(255) NOT NULL DEFAULT '',
  organizador_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  total_mangas          INTEGER NOT NULL DEFAULT 4,
  minima_longitud       NUMERIC(4,1) NOT NULL DEFAULT 19,
  rios                  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  tramos                TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  descripcion           TEXT NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT competitions_nivel_territorio_check CHECK (
    (nivel = 'nacional'   AND comunidad_autonoma_id IS NULL     AND provincia_id IS NULL)
    OR (nivel = 'autonomica' AND comunidad_autonoma_id IS NOT NULL AND provincia_id IS NULL)
    OR (nivel = 'provincial' AND comunidad_autonoma_id IS NOT NULL AND provincia_id IS NOT NULL)
  ),
  CONSTRAINT competitions_fechas_check CHECK (fecha_fin >= fecha_inicio)
);
CREATE UNIQUE INDEX IF NOT EXISTS competitions_slug_key             ON competitions (slug);
CREATE INDEX        IF NOT EXISTS competitions_nivel_idx            ON competitions (nivel);
CREATE INDEX        IF NOT EXISTS competitions_estado_idx           ON competitions (estado);
CREATE INDEX        IF NOT EXISTS competitions_comunidad_autonoma_id_idx ON competitions (comunidad_autonoma_id);
CREATE INDEX        IF NOT EXISTS competitions_provincia_id_idx     ON competitions (provincia_id);
CREATE INDEX        IF NOT EXISTS competitions_fecha_inicio_idx     ON competitions (fecha_inicio DESC);

DROP TRIGGER IF EXISTS trg_competitions_updated_at ON competitions;
CREATE TRIGGER trg_competitions_updated_at
  BEFORE UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Tenantize existing tables (competition_id NULLABLE at this stage) ───────
ALTER TABLE participantes
  ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS participantes_competition_id_idx ON participantes (competition_id);

ALTER TABLE catch_sessions
  ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS catch_sessions_competition_id_idx       ON catch_sessions (competition_id);
CREATE INDEX IF NOT EXISTS catch_sessions_competition_manga_idx    ON catch_sessions (competition_id, manga);

ALTER TABLE catch_records
  ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS catch_records_competition_id_idx        ON catch_records (competition_id);
CREATE INDEX IF NOT EXISTS catch_records_competition_manga_idx     ON catch_records (competition_id, manga);
CREATE INDEX IF NOT EXISTS catch_records_competition_valida_idx    ON catch_records (competition_id, valida);

ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS audit_log_competition_created_at_idx    ON audit_log (competition_id, created_at DESC);
