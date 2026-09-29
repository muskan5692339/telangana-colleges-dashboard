import path from "node:path";
import type { NextConfig } from "next";

const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  serverExternalPackages: ["xlsx"],
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      { source: "/r", destination: "/student-view", permanent: false },
      { source: "/r/:cohort", destination: "/student-view/:cohort", permanent: false },
      { source: "/r/:cohort/:college", destination: "/student-view/:cohort/:college", permanent: false },
    ];
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "[::1]",
    "*.trycloudflare.com",
    "*.vercel.app",
    "*.cursor.sh",
    "*.cursor.com",
    "*.cursorusercontent.com",
  ],
};

export default nextConfig;
