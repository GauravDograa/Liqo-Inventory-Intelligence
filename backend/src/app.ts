import express, { Application } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

import routes from "./routes";
import {errorHandler} from "./middleware/error.middleware";
import rateLimiter from "./middleware/rateLimit.middleware";

const app: Application = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(rateLimiter);


app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use("/api/v2", routes);

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

app.use(errorHandler);

export default app;