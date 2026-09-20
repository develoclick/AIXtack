import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Sin Disallow: las URLs retiradas responden 410 y Google solo puede confirmar que
// desaparecieron si puede rastrearlas, así que no se bloquean aquí.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
