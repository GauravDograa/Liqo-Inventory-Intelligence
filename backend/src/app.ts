import express, { Application } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";

import { config } from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import rateLimiter from "./middleware/rateLimit.middleware";

const app: Application = express();

app.set("trust proxy", 1);

app.use(helmet());
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

app.use("/api/v2", routes);

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    service: config.env.serviceName,
    environment: config.env.nodeEnv,
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
