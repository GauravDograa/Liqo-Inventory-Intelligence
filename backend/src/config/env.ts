import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "test" | "production";

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: (process.env.NODE_ENV || "development") as NodeEnv,
  port: toNumber(process.env.PORT, 5000),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigins: toList(process.env.CORS_ORIGINS, [
    "http://localhost:3000",
    "https://liqo-inventory-intelligence-ep1q.vercel.app",
  ]),
  logLevel: process.env.LOG_LEVEL || "info",
  serviceName: process.env.SERVICE_NAME || "liqo-retail-erp-api",
};

export type EnvConfig = typeof env;
