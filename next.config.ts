import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
    authInterrupts: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/webhooks/clerk",
        destination: "/api/webhooks/clerk/route",
        locale: false,
      },
    ];
  },
};

export default nextConfig;
