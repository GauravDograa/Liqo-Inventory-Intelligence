import { NextFunction, Request, Response } from "express";
import { httpRequestDurationMs, httpRequestsTotal } from "../observability/metrics";
import { logger } from "../observability/logger";

function normalizeRoute(req: Request) {
  return req.route?.path
    ? `${req.baseUrl || ""}${req.route.path}`
    : req.originalUrl.split("?")[0];
}

export function requestObservability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const route = normalizeRoute(req);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationMs.observe(labels, durationMs);

    logger.info("HTTP request completed", {
      method: req.method,
      route,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
}
