import { PostTypeListing } from "@/components/content/post-type-listing";
import { buildListingMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  return buildListingMetadata({
    title: "Noticias de Inteligencia Artificial",
    description: "Las últimas noticias del sector de la IA, explicadas en español.",
    path: "/noticias",
    page: Number(pageParam ?? "1") || 1,
  });
}

export default async function NoticiasPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;

  return (
    <PostTypeListing
      type="NEWS"
      basePath="/noticias"
      eyebrow="Actualidad"
      title="Noticias de IA"
      description="Mantente al día con lo último en inteligencia artificial."
      page={page}
      topBannerSlotId="1000000016"
      multiplexSlotId="1000000017"
    />
  );
}
