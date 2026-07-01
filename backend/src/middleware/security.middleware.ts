import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import express, { Application } from "express";
import { config } from "../config";
import rateLimiter from "./rateLimit.middleware";

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
  app.use(
    cors({
      origin: config.env.corsOrigins,
      credentials: true,
    })
  );
};
