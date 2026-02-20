import { join } from "node:path";
import { defineConfig } from "drizzle-kit";

const dbPath = process.env.DATABASE_PATH ?? join(process.cwd(), "data", "main.db");

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/schema.ts",
  dbCredentials: { url: dbPath }
});
