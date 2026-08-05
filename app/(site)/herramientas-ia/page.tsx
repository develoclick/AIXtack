import { SectionHeading } from "@/components/shared/section-heading";
import { ToolGrid } from "@/components/tools/tool-grid";
import { ToolFilters } from "@/components/tools/tool-filters";
import { Pagination } from "@/components/shared/pagination";
import { TopBannerAd } from "@/components/ads/top-banner-ad";
import { SidebarAd } from "@/components/ads/sidebar-ad";
import { MultiplexAd } from "@/components/ads/multiplex-ad";
import { listPublishedTools, type ListToolsOptions } from "@/lib/content/tools";
import { listCategories } from "@/lib/content/categories";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ q?: string; categoria?: string; orden?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const query = new URLSearchParams();
  if (params.categoria) query.set("categoria", params.categoria);
  if (page > 1) query.set("page", String(page));
  const path = query.toString() ? `/herramientas-ia?${query.toString()}` : "/herramientas-ia";

  return buildMetadata({
    title: page > 1 ? `Herramientas de Inteligencia Artificial — Página ${page}` : "Herramientas de Inteligencia Artificial",
    description:
      "Directorio de herramientas de IA en español: generación de imágenes, escritura, productividad, código, audio y mucho más.",
    path,
    // Las páginas de resultados de búsqueda libre son contenido transitorio
    // y no aportan valor propio para indexar de forma independiente.
    noIndex: Boolean(params.q),
  });
}

export default async function ToolsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const options: ListToolsOptions = {
    page,
    pageSize: 12,
    query: params.q,
    categorySlug: params.categoria,
    sort: (params.orden as ListToolsOptions["sort"]) ?? "rating",
  };

  const [{ items, totalPages }, categories] = await Promise.all([
    listPublishedTools(options),
    listCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Inicio", path: "/" },
              { name: "Herramientas IA", path: "/herramientas-ia" },
            ])
          ),
        }}
      />

      <SectionHeading
        eyebrow="Directorio"
        title="Herramientas de IA"
        description="Explora, compara y encuentra la herramienta de inteligencia artificial ideal para tu caso de uso."
      />
{/*
      <div className="mt-8">
        <TopBannerAd slotId="1000000020" />
      </div>
*/}
      <div className="mt-8 lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-8">
        <div>
          <ToolFilters categories={categories} />

          <div className="mt-8">
            <ToolGrid tools={items} />
          </div>

          {page === 1 && items.length > 0 && (
            <div className="mt-10">
              <MultiplexAd slotId="1000000021" />
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <SidebarAd slotId="1000000022" />
        </aside>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/herramientas-ia"
        searchParams={{ q: params.q, categoria: params.categoria, orden: params.orden }}
      />
    </div>
  );
}
