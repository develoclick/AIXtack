import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { activeRedirects } from "./lib/guides/redirects";

const nextConfig: NextConfig = {
  async redirects() {
    // 301 decididas URL por URL en content/redirects.ts. Las que apuntan a una guía solo
    // se activan cuando esa guía está publicada; mientras tanto la URL antigua responde 410.
    return activeRedirects();
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
