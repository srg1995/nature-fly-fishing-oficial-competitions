/**
 * Drizzle migration runner.
 * Usage:
 *   bun scripts/migrate.mjs              # apply all pending migrations
 *   bun scripts/migrate.mjs --dry-run    # log planned files, run nothing
 *
 * Requires POSTGRES_URL_NON_POOLING (preferred) or POSTGRES_URL in .env.local.
 * Some DDL (enum alters, certain ALTER TABLE) fails through Vercel's pooled
 * connection; use the non-pooling URL for migrations.
 */

import { config } from "dotenv";
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

config({ path: ".env.local" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const migrationsDir = join(projectRoot, "drizzle");

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? "";

if (!connectionString) {
  console.error(
    "❌ Missing POSTGRES_URL_NON_POOLING (preferred) or POSTGRES_URL in .env.local"
  );
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");

function listMigrationFiles() {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

async function ensureMigrationsTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations_custom (
      tag        TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function getAppliedTags(sql) {
  const rows = await sql`SELECT tag FROM __drizzle_migrations_custom`;
  return new Set(rows.map((r) => r.tag));
}

async function main() {
  const sql = postgres(connectionString, { max: 1 });

  try {
    await ensureMigrationsTable(sql);
    const applied = await getAppliedTags(sql);
    const files = listMigrationFiles();

    if (dryRun) {
      console.log("🔎 Dry run — planned migrations:");
      for (const file of files) {
        const tag = file.replace(/\.sql$/, "");
        const status = applied.has(tag) ? "SKIP (applied)" : "APPLY";
        console.log(`  [${status}] ${file}`);
      }
      return;
    }

    for (const file of files) {
      const tag = file.replace(/\.sql$/, "");
      if (applied.has(tag)) {
        console.log(`⏭  ${tag} (already applied)`);
        continue;
      }
      const path = join(migrationsDir, file);
      const contents = readFileSync(path, "utf8");
      console.log(`⏳ Applying ${tag}...`);
      // Each file is its own execution; 0003 manages its own transaction.
      await sql.unsafe(contents);
      await sql`INSERT INTO __drizzle_migrations_custom (tag) VALUES (${tag})`;
      console.log(`✅ ${tag}`);
    }

    console.log("\n🎉 Migrations complete.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
