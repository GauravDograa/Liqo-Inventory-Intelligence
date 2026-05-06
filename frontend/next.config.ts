import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir:
    process.env.NEXT_DIST_DIR ||
    (process.env.NODE_ENV === "production" ? ".next-build" : ".next-dev"),
};

export default nextConfig;
