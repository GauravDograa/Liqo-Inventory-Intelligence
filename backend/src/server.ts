import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { config } from "./config";
import { logger } from "./infrastructure/logger";
import { prisma } from "./prisma/client";

const PORT = config.env.port;

const server = app.listen(PORT, () => {
  logger.info("Server started", {
    port: PORT,
    environment: config.env.nodeEnv,
  });
});

const shutdown = async (signal: "SIGTERM" | "SIGINT") => {
  logger.info("Shutting down gracefully", { signal });
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
