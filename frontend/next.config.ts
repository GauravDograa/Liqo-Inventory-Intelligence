import type { NextConfig } from "next";

const backendApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://liqo-inventory-intelligence.onrender.com/api/v2";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v2/:path*",
        destination: `${backendApiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
