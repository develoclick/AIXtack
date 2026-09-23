import type { NextConfig } from "next";
import { nextRedirects } from "./content/redirects";

const nextConfig: NextConfig = {
  async redirects() {
    // 301 decididas URL por URL en content/redirects.ts (rutas explícitas, sin comodines).
    return nextRedirects();
  },
};

export default nextConfig;
