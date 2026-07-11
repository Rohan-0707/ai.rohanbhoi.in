import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ["ai.rohanbhoi.in"],
};

export default nextConfig;
