import { PostTypeListing } from "@/components/content/post-type-listing";
import { buildListingMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  return buildListingMetadata({
    title: "Comparativas de Herramientas de IA",
    description: "Comparativas cara a cara entre las herramientas de inteligencia artificial más populares.",
    path: "/comparativas",
    page: Number(pageParam ?? "1") || 1,
  });
}

export default async function ComparativasPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;

  return (
    <PostTypeListing
      type="COMPARISON"
      basePath="/comparativas"
      eyebrow="Cara a cara"
      title="Comparativas de IA"
      description="Ayudamos a elegir: comparativas objetivas entre las principales herramientas de inteligencia artificial."
      page={page}
      topBannerSlotId="1000000010"
      multiplexSlotId="1000000011"
      image={{
        src: "https://images.unsplash.com/photo-1668976056517-2a3c241de1c6?w=1200&q=80&fm=jpg&fit=crop&auto=format",
        alt: "Comparativas de herramientas de IA",
        credit: {
          photographerName: "Javier Allegue Barros",
          photographerUrl: "https://unsplash.com/es/@soymeraki",
          photoPageUrl: "https://unsplash.com/es/fotos/un-poste-de-senalizacion-con-diferentes-senales-de-trafico-75EcEMrXgtg",
        },
      }}
    />
  );
}
