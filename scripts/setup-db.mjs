/**
 * ⚠️ DEPRECATED — prefer `bun db:migrate` (Drizzle migrations in /drizzle).
 * This shim delegates to the new migration runner and then seeds the bootstrap
 * admin user. Kept for backwards compatibility with existing deploy scripts.
 *
 * Requires POSTGRES_URL (or POSTGRES_URL_NON_POOLING) in .env.local.
 */

import { sql } from "@vercel/postgres";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

async function main() {
  console.log("⏳ Running Drizzle migrations...\n");

  const result = spawnSync("bun", ["scripts/migrate.mjs"], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error("❌ Migration step failed");
    process.exit(result.status ?? 1);
  }

  console.log("\n⏳ Seeding bootstrap admin user...");
  try {
    const hash = await bcrypt.hash("admin1234", 12);
    await sql`
      INSERT INTO users (email, nombre, password_hash, rol)
      VALUES ('admin@campeonato.es', 'Administrador', ${hash}, 'super_admin')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log("✅ Admin user: admin@campeonato.es / admin1234 (super_admin)");
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }

  console.log("\n🎉 Database setup complete!\n");
  console.log("Access the app at: http://localhost:3000");
  console.log("Login: admin@campeonato.es / admin1234\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
