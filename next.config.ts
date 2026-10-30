import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  // Build cache escapes the repo when set (e.g. NEXT_DIST_DIR=/tmp/portico-next):
  // something in this environment periodically wipes generated dirs like
  // .next and node_modules, which crashes `next dev` mid-compile with ENOENT
  // on _buildManifest tmp files.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The dev badge lands on top of the sidebar account menu.
  devIndicators: false,
};

export default nextConfig;
