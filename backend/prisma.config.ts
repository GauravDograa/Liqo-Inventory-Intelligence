import { defineConfig } from "prisma/config";
import "dotenv/config";

// Render runs Prisma migrations during web startup. Neon can briefly hold the
// migration advisory lock during rapid redeploys, so avoid failing the deploy
// before the server has a chance to start.
process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK ??= "1";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --transpile-only prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});