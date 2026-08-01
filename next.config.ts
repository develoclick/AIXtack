import type { NextConfig } from "next";
import redirectsData from "./content/redirects.json";

interface RedirectEntry {
  fromPath: string;
  toPath: string;
  statusCode?: number;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  async redirects() {
    // Redirecciones para URLs legadas o slugs renombrados: se editan
    // directamente en content/redirects.json (sin base de datos ni panel
    // de administración) y se aplican en cada build.
    return (redirectsData as RedirectEntry[]).map((redirect) => ({
      source: redirect.fromPath,
      destination: redirect.toPath,
      permanent: (redirect.statusCode ?? 301) === 301,
    }));
  },
};

export default nextConfig;
