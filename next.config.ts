import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // The dev badge lands on top of the sidebar account menu.
  devIndicators: false,
};

export default nextConfig;
