import { SectionHeading } from "@/components/shared/section-heading";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { Pagination } from "@/components/shared/pagination";
import { TopBannerAd } from "@/components/ads/top-banner-ad";
import { SidebarAd } from "@/components/ads/sidebar-ad";
import { MultiplexAd } from "@/components/ads/multiplex-ad";
import { listPublishedPrompts } from "@/lib/content/prompts";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const path = page > 1 ? `/prompts?page=${page}` : "/prompts";

  return buildMetadata({
    title: page > 1 ? `Biblioteca de Prompts de IA — Página ${page}` : "Biblioteca de Prompts de IA",
    description:
      "Prompts listos para copiar y usar en ChatGPT, Claude, Gemini y otros modelos de IA. Organizados por caso de uso.",
    path,
  });
}

export default async function PromptsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const { items, totalPages } = await listPublishedPrompts({ page, pageSize: 12 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Inicio", path: "/" },
              { name: "Prompts", path: "/prompts" },
            ])
          ),
        }}
      />

      <SectionHeading
        eyebrow="Biblioteca"
        title="Prompts de IA"
        description="Prompts probados y listos para copiar, con el modelo de IA recomendado para cada uno."
      />

      <div className="mt-8">
        <TopBannerAd slotId="1000000030" />
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-8">
        <div>
          <PromptGrid prompts={items} />

          {page === 1 && items.length > 0 && (
            <div className="mt-10">
              <MultiplexAd slotId="1000000031" />
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <SidebarAd slotId="1000000032" />
        </aside>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/prompts" />
    </div>
  );
}
