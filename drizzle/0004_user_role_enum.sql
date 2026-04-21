-- =============================================================================
-- 0004 — Convert users.rol from VARCHAR(50) CHECK to user_role enum,
-- and promote the default admin to super_admin.
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'organizador', 'juez');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop any existing CHECK constraint on users.rol (name may vary).
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'users'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%rol%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Convert column type (data is a subset of the enum).
ALTER TABLE users
  ALTER COLUMN rol DROP DEFAULT;

ALTER TABLE users
  ALTER COLUMN rol TYPE user_role USING rol::user_role;

ALTER TABLE users
  ALTER COLUMN rol SET DEFAULT 'juez';

-- Promote the bootstrap admin to super_admin (idempotent).
UPDATE users SET rol = 'super_admin'
WHERE email = 'admin@campeonato.es' AND rol <> 'super_admin';
