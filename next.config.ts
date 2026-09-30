import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NODE_ENV === "development" ? ".next-fast" : "dist",
  env: {
    API_URL: process.env.API_URL
  },
  // LAN IP del PC para probar desde una máquina remota en dev
  allowedDevOrigins: ["localhost", "192.168.1.104"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
  // Without this the worker gets pinned in the HTTP cache and clients never
  // pick up a new version.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "dayjs",
      "@base-ui/react",
      "cmdk",
    ],
  },
};

export default nextConfig;
