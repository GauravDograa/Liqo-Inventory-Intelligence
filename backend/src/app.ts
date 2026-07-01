import express, { Application } from "express";

import { config } from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { applySecurityMiddleware } from "./middleware/security.middleware";
import { requestLogger } from "./middleware/request-logger.middleware";
import { enforceApiVersion } from "./middleware/api-version.middleware";

const app: Application = express();

applySecurityMiddleware(app);
app.use(enforceApiVersion);
app.use(requestLogger);

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
