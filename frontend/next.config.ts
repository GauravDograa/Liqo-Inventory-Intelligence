import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir:
    process.env.NEXT_DIST_DIR ||
    (process.env.NODE_ENV === "production" ? ".next-build" : ".next-dev"),
};

export default nextConfig;
