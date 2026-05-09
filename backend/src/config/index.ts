import { env } from "./env";

export const config = {
  env,
  isProduction: env.nodeEnv === "production",
  isDevelopment: env.nodeEnv === "development",
  isTest: env.nodeEnv === "test",
};

export type AppConfig = typeof config;
