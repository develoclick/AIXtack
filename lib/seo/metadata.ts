import type { Metadata } from "next";
import { OG_POR_DEFECTO, siteName, siteUrl } from "@/lib/site";

export interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  /** Usa el título tal cual, sin el sufijo " · Guía Prompts IA" (solo la home). */
  absoluteTitle?: boolean;
  /** Solo para type "article": fechas reales y autoría. */
  article?: { publishedTime?: string; modifiedTime: string; authors: string[] };
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const url = new URL(input.path, siteUrl).toString();
  const image = input.image ?? `${siteUrl}${OG_POR_DEFECTO}`;
  const type = input.type ?? "website";

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName,
      images: [{ url: image }],
      locale: "es_PE",
      ...(type === "article" && input.article
        ? {
            type: "article" as const,
            publishedTime: input.article.publishedTime,
            modifiedTime: input.article.modifiedTime,
            authors: input.article.authors,
          }
        : { type: "website" as const }),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
