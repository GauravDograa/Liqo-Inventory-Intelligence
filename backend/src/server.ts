import dotenv from "dotenv";
import { Server } from "http";

dotenv.config();

import app from "./app";
import { prisma } from "./prisma/client";

const PORT = process.env.PORT || 5000;

export function startServer(port: number | string = PORT) {
  return app.listen(port, () => {
    console.log(`Server running on port ${port}`);
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
    console.log("Shutting down gracefully...");
    await shutdownServer(server);
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down (SIGINT)...");
    await shutdownServer(server);
    process.exit(0);
  });
}
