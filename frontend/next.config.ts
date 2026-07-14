import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from localhost (backend media server)
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
