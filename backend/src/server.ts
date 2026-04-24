import dotenv from "dotenv";
import { Server } from "http";

dotenv.config();

import app from "./app";
import { logger } from "./observability/logger";
import { prisma } from "./prisma/client";

const PORT = process.env.PORT || 5000;

export function startServer(port: number | string = PORT) {
  return app.listen(port, () => {
    logger.info("Server started", { port });
  });
}

export async function shutdownServer(server: Server) {
  await prisma.$disconnect();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

if (require.main === module) {
  const server = startServer();

  process.on("SIGTERM", async () => {
    logger.info("Shutting down gracefully...");
    await shutdownServer(server);
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.info("Shutting down (SIGINT)...");
    await shutdownServer(server);
    process.exit(0);
  });
}
