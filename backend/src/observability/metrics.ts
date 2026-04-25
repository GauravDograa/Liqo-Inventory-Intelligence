import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({
  prefix: "liqo_",
  register,
});

export const httpRequestDurationMs = new client.Histogram({
  name: "liqo_http_request_duration_ms",
  help: "Duration of HTTP requests in milliseconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: "liqo_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

export function getMetricsRegistry() {
  return register;
}
