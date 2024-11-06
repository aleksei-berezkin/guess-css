import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Because of Swipeable Views
  output: 'export',       // Static pages
};

export default nextConfig;
