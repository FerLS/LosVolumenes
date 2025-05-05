import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["raw.githubusercontent.com"],
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
