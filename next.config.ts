import { NextConfig } from "next";
import path from "path";
import fs from "fs";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Configure webpack to handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Copy WASM file to public directory during build
    if (!isServer) {
      const wasmPath = path.join(
        process.cwd(),
        "node_modules",
        "web-ifc",
        "web-ifc.wasm"
      );

      const publicWasmPath = path.join(
        process.cwd(),
        "public",
        "web-ifc.wasm"
      );

      if (fs.existsSync(wasmPath)) {
        fs.copyFileSync(wasmPath, publicWasmPath);
      }
    }

    return config;
  },
};

export default nextConfig;
