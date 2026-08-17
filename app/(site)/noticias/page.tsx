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
      image={{
        src: "https://images.unsplash.com/photo-1579532536935-619928decd08?w=1200&q=80&fm=jpg&fit=crop&auto=format",
        alt: "Noticias de inteligencia artificial",
        credit: {
          photographerName: "Roman Kraft",
          photographerUrl: "https://unsplash.com/es/@iamromankraft",
          photoPageUrl: "https://unsplash.com/es/fotos/una-pila-de-periodicos-sentados-encima-de-una-mesa-de-madera-hWJsOnaWTqs",
        },
      }}
    />
  );
}
