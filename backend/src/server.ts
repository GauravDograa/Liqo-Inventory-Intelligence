import dotenv from "dotenv";
dotenv.config(); // ✅ Load env FIRST

import app from "./app";
import { prisma } from "./prisma/client";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on("SIGINT", async () => {
  console.log("Shutting down (SIGINT)...");
  await prisma.$disconnect();
  process.exit(0);
});