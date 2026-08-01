import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "AIXtack";

export interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  keywords?: string[];
}

export interface BuildListingMetadataInput {
  title: string;
  description: string;
  path: string;
  page: number;
}

/**
 * Para listados paginados sin filtros adicionales: cada página se indexa
 * con su propia canonical (Google dejó de usar rel=next/prev en 2019),
 * añadiendo el número de página al título a partir de la página 2.
 */
export function buildListingMetadata(input: BuildListingMetadataInput): Metadata {
  const path = input.page > 1 ? `${input.path}?page=${input.page}` : input.path;
  return buildMetadata({
    title: input.page > 1 ? `${input.title} — Página ${input.page}` : input.title,
    description: input.description,
    path,
  });
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const url = new URL(input.path, siteUrl).toString();
  const image = input.image ?? `${siteUrl}/og-default.png`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords?.length ? input.keywords : undefined,
    alternates: { canonical: url },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName,
      images: [{ url: image }],
      locale: "es_ES",
      type: input.type ?? "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
