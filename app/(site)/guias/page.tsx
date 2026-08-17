import { PostTypeListing } from "@/components/content/post-type-listing";
import { buildListingMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  return buildListingMetadata({
    title: "Guías de Inteligencia Artificial",
    description: "Guías completas para entender y aplicar la inteligencia artificial en tu día a día o negocio.",
    path: "/guias",
    page: Number(pageParam ?? "1") || 1,
  });
}

export default async function GuiasPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;

  return (
    <PostTypeListing
      type="GUIDE"
      basePath="/guias"
      eyebrow="En profundidad"
      title="Guías de IA"
      description="Contenido completo y detallado sobre los grandes temas de la inteligencia artificial."
      page={page}
      topBannerSlotId="1000000014"
      multiplexSlotId="1000000015"
      image={{
        src: "https://images.unsplash.com/photo-1517770413964-df8ca61194a6?w=1200&q=80&fm=jpg&fit=crop&auto=format",
        alt: "Guías completas de inteligencia artificial",
        credit: {
          photographerName: "Clay Banks",
          photographerUrl: "https://unsplash.com/es/@claybanks",
          photoPageUrl: "https://unsplash.com/es/fotos/fotografia-bokeh-de-open-book-0FRJ2SCuY4k",
        },
      }}
    />
  );
}
