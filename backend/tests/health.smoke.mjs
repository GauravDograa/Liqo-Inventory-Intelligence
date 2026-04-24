import assert from "node:assert/strict";

async function main() {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    "postgresql://liqo:liqo@127.0.0.1:5432/liqo_test";
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || "liqo-local-dev-secret";
  process.env.DEFAULT_ORGANIZATION_ID =
    process.env.DEFAULT_ORGANIZATION_ID || "default-org-001";

  const { startServer, shutdownServer } = await import("../dist/server.js");
  const server = startServer(0);

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");

    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    const payload = await response.json();
    const metricsResponse = await fetch(`http://127.0.0.1:${address.port}/metrics`);
    const metricsText = await metricsResponse.text();

    assert.equal(response.status, 200);
    assert.deepEqual(payload, { status: "OK" });
    assert.equal(metricsResponse.status, 200);
    assert.match(metricsText, /liqo_http_requests_total/);

    console.log("Smoke test passed.");
  } finally {
    await shutdownServer(server);
  }
}

main().catch((error) => {
  console.error("Smoke test failed.");
  console.error(error);
  process.exit(1);
});
