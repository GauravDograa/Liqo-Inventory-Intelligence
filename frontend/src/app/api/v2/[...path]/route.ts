import { NextRequest } from "next/server";

const defaultBackendApiBaseUrl = "https://liqo-inventory-intelligence.onrender.com/api/v2";

const resolveBackendApiBaseUrl = () => {
  const configuredUrl = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configuredUrl) return defaultBackendApiBaseUrl;

  if (configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")) {
    return configuredUrl;
  }

  return `https://${configuredUrl}`;
};

const hopByHopHeaders = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

const copyResponseHeaders = (source: Headers) => {
  const headers = new Headers();

  source.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (!hopByHopHeaders.has(normalizedKey) && normalizedKey !== "set-cookie") {
      headers.set(key, value);
    }
  });

  headers.set("Cache-Control", "no-store");
  return headers;
};

const getSetCookies = (headers: Headers) => {
  const withGetter = headers as Headers & { getSetCookie?: () => string[] };
  const cookies = withGetter.getSetCookie?.();
  if (cookies?.length) return cookies;

  const cookie = headers.get("set-cookie");
  return cookie ? [cookie] : [];
};

const proxy = async (request: NextRequest, context: RouteContext) => {
  const { path = [] } = await context.params;
  const targetUrl = new URL(`${resolveBackendApiBaseUrl().replace(/\/$/, "")}/${path.join("/")}`);
  targetUrl.search = request.nextUrl.search;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("host");
  requestHeaders.delete("content-length");

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers: requestHeaders,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = copyResponseHeaders(backendResponse.headers);
  for (const cookie of getSetCookies(backendResponse.headers)) {
    responseHeaders.append("Set-Cookie", cookie);
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
};

export const dynamic = "force-dynamic";

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

