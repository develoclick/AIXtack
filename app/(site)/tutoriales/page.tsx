import { PostTypeListing } from "@/components/content/post-type-listing";
import { buildListingMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  return buildListingMetadata({
    title: "Tutoriales de Inteligencia Artificial",
    description: "Aprende a usar las mejores herramientas de IA paso a paso, con tutoriales prácticos en español.",
    path: "/tutoriales",
    page: Number(pageParam ?? "1") || 1,
  });
}

export default async function TutorialesPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;

  return (
    <PostTypeListing
      type="TUTORIAL"
      basePath="/tutoriales"
      eyebrow="Aprende"
      title="Tutoriales de IA"
      description="Guías paso a paso para sacarle el máximo partido a la inteligencia artificial."
      page={page}
      topBannerSlotId="1000000012"
      multiplexSlotId="1000000013"
      image={{
        src: "https://images.unsplash.com/photo-1759984782106-4b56d0aa05b8?w=1200&q=80&fm=jpg&fit=crop&auto=format",
        alt: "Tutoriales paso a paso de IA",
        credit: {
          photographerName: "Ling App",
          photographerUrl: "https://unsplash.com/es/@lingapp",
          photoPageUrl: "https://unsplash.com/es/fotos/mujer-joven-con-auriculares-estudiando-en-el-escritorio-Imz-pn2LMbg",
        },
      }}
    />
  );
}
