import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? "";

if (!connectionString) {
  throw new Error(
    "Missing POSTGRES_URL_NON_POOLING (preferred) or POSTGRES_URL in .env.local"
  );
}

export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  schemaFilter: ["public"],
  strict: true,
  verbose: true,
} satisfies Config;
