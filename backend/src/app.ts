import express, { Application } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import rateLimiter from "./middleware/rateLimit.middleware";

const app: Application = express();

// Trust proxy (needed for Render / production environments)
app.set("trust proxy", 1);

// Security middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(rateLimiter);

// ✅ CORS CONFIGURATION
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigin = process.env.FRONTEND_URL;

      // Allow server-to-server or Postman
      if (!origin) return callback(null, true);

      if (origin === allowedOrigin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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