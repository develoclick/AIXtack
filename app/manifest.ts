import type { MetadataRoute } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Guía Prompts IA";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — Herramientas, prompts y noticias de IA en español`,
    short_name: siteName,
    description:
      "Directorio de herramientas de inteligencia artificial, biblioteca de prompts y contenido en español.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "es",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
