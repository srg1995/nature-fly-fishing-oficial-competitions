-- =============================================================================
-- 0005 — Nuevo nivel de competición "open": libre, sin ubicación asociada.
-- =============================================================================

ALTER TYPE nivel_competicion ADD VALUE IF NOT EXISTS 'open';

-- Se compara con nivel::text porque un valor de enum recién añadido no puede
-- usarse dentro de la misma transacción en la que se crea.
ALTER TABLE competitions
  DROP CONSTRAINT IF EXISTS competitions_nivel_territorio_check;

ALTER TABLE competitions
  ADD CONSTRAINT competitions_nivel_territorio_check CHECK (
    (nivel::text = 'nacional'   AND comunidad_autonoma_id IS NULL     AND provincia_id IS NULL)
    OR (nivel::text = 'open'       AND comunidad_autonoma_id IS NULL     AND provincia_id IS NULL)
    OR (nivel::text = 'autonomica' AND comunidad_autonoma_id IS NOT NULL AND provincia_id IS NULL)
    OR (nivel::text = 'provincial' AND comunidad_autonoma_id IS NOT NULL AND provincia_id IS NOT NULL)
  );
