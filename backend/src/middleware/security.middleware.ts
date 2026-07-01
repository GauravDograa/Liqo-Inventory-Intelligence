import compression from "compression";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import express, { Application } from "express";
import { config } from "../config";
import rateLimiter from "./rateLimit.middleware";

const vercelPreviewOriginPattern = /^https:\/\/liqo-inventory-intelligence[a-z0-9-]*\.vercel\.app$/i;

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (config.env.corsOrigins.includes(origin) || vercelPreviewOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
};

export const applySecurityMiddleware = (app: Application) => {
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(rateLimiter);
  app.use(cookieParser());
  app.use(cors(corsOptions));
};