import express, { Application } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import rateLimiter from "./middleware/rateLimit.middleware";
import cookieParser from "cookie-parser";
const app: Application = express();

// Trust proxy (needed for Render / production environments)
app.set("trust proxy", 1);

// Security middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(rateLimiter);
app.use(cookieParser());
// ✅ CORS CONFIGURATION
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://liqo-inventory-intelligence-ep1q.vercel.app", // 👈 replace if different
    ],
    credentials: true,
  })
);
// Routes
app.use("/api/v2", routes);

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

// Global error handler
app.use(errorHandler);

export default app;