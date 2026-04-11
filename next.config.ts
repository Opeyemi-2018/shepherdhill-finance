import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shepherdhill.edubiller.com",
      },
      {
        protocol: "http",
        hostname: "shepherdhill.edubiller.com",
      },
    ],
  },
};

export default nextConfig;
