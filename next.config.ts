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
      {
        source: "/api/products",
        destination: "/api/products/route",
        locale: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zmxxl9742a.ufs.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
