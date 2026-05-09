import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

const connectionString = env.databaseUrl;

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  transactionOptions: {
    maxWait: 20_000,
    timeout: 120_000,
  },
});
