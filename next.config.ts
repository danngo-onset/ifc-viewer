import { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    tsconfigPath: "./tsconfig.vercel.json"
  }
};

export default nextConfig;
