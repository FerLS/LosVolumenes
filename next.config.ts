import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
// next.config.js
module.exports = {
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
