/**
 * Setup script: creates tables and seeds an admin user.
 * Run with: node scripts/setup-db.mjs
 *
 * Requires POSTGRES_URL in .env.local
 */

import { sql } from "@vercel/postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("⏳ Setting up database...\n");

  // Run schema
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      const firstLine = stmt.split("\n")[0].substring(0, 60);
      console.log(`✅ ${firstLine}...`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
  }

  // Seed admin user
  console.log("\n⏳ Creating admin user...");
  try {
    const hash = await bcrypt.hash("admin1234", 12);
    await sql`
      INSERT INTO users (email, nombre, password_hash, rol)
      VALUES ('admin@campeonato.es', 'Administrador', ${hash}, 'admin')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log("✅ Admin user: admin@campeonato.es / admin1234");
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }

  // Seed demo data (optional)
  console.log("\n⏳ Seeding demo duos...");
  const demoDuos = [
    { nombre: "Los Rápidos del Sella", p1: "Carlos García", p2: "Miguel Pérez", plica: "A1", tramo: "Tramo 1", rio: "Sella" },
    { nombre: "Trucha Dorada", p1: "Antonio López", p2: "Francisco Martín", plica: "A2", tramo: "Tramo 2", rio: "Sella" },
    { nombre: "Aguas Bravas", p1: "José Rodríguez", p2: "Luis González", plica: "B1", tramo: "Tramo 3", rio: "Narcea" },
    { nombre: "La Mosca Seca", p1: "Pedro Sánchez", p2: "Javier Hernández", plica: "B2", tramo: "Tramo 1", rio: "Narcea" },
    { nombre: "Corriente Fría", p1: "Manuel Jiménez", p2: "Roberto Díaz", plica: "C1", tramo: "Tramo 4", rio: "Sella" },
  ];

  for (const d of demoDuos) {
    try {
      await sql`
        INSERT INTO participant_duos (nombre_duo, pescador1, pescador2, plica, tramo, rio)
        VALUES (${d.nombre}, ${d.p1}, ${d.p2}, ${d.plica}, ${d.tramo}, ${d.rio})
        ON CONFLICT DO NOTHING
      `;
      console.log(`✅ Duo: ${d.nombre}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
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
