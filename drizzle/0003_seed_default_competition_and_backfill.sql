-- =============================================================================
-- 0003 — Seed the legacy competition and backfill competition_id.
-- Wrapped in a transaction + advisory lock to be safe against concurrent writes.
-- =============================================================================

BEGIN;

SELECT pg_advisory_xact_lock(4242424242);

-- ─── Ensure the legacy competition exists ────────────────────────────────────
INSERT INTO competitions (
  slug,
  nombre,
  edicion,
  modalidad,
  nivel,
  estado,
  fecha_inicio,
  fecha_fin,
  lugar,
  organizador,
  total_mangas,
  minima_longitud,
  rios,
  tramos,
  descripcion
) VALUES (
  'vi-campeonato-nacional-salmonidos-lance-mosca-duos-2025',
  'Campeonato Nacional de Salmónidos Lance Mosca Dúos',
  'VI',
  'lance_mosca_duos',
  'nacional',
  'finalizada',
  '2025-06-01',
  '2025-06-02',
  'Ríos de la cornisa cantábrica',
  'Federación Española de Pesca y Casting',
  8,
  19.0,
  ARRAY['Río Porma', 'Río Cares', 'Río Esla', 'Río Sil', 'Río Tera']::TEXT[],
  ARRAY['Tramo 1', 'Tramo 2', 'Tramo 3', 'Tramo 4']::TEXT[],
  'Competición nacional hospedada como primera competición de la plataforma.'
)
ON CONFLICT (slug) DO NOTHING;

-- ─── Backfill competition_id on domain tables ────────────────────────────────
DO $$
DECLARE
  legacy_id UUID;
BEGIN
  SELECT id INTO legacy_id
  FROM competitions
  WHERE slug = 'vi-campeonato-nacional-salmonidos-lance-mosca-duos-2025';

  IF legacy_id IS NULL THEN
    RAISE EXCEPTION 'Legacy competition not found after insert';
  END IF;

  UPDATE participantes   SET competition_id = legacy_id WHERE competition_id IS NULL;
  UPDATE catch_sessions  SET competition_id = legacy_id WHERE competition_id IS NULL;
  UPDATE catch_records   SET competition_id = legacy_id WHERE competition_id IS NULL;

  -- Sanity: no NULLs left in domain tables.
  IF EXISTS (SELECT 1 FROM participantes   WHERE competition_id IS NULL) THEN
    RAISE EXCEPTION 'participantes has rows with NULL competition_id';
  END IF;
  IF EXISTS (SELECT 1 FROM catch_sessions  WHERE competition_id IS NULL) THEN
    RAISE EXCEPTION 'catch_sessions has rows with NULL competition_id';
  END IF;
  IF EXISTS (SELECT 1 FROM catch_records   WHERE competition_id IS NULL) THEN
    RAISE EXCEPTION 'catch_records has rows with NULL competition_id';
  END IF;
END $$;

-- ─── Enforce NOT NULL on domain tables (not on audit_log) ────────────────────
ALTER TABLE participantes  ALTER COLUMN competition_id SET NOT NULL;
ALTER TABLE catch_sessions ALTER COLUMN competition_id SET NOT NULL;
ALTER TABLE catch_records  ALTER COLUMN competition_id SET NOT NULL;

COMMIT;
