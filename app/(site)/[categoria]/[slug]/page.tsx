import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PaginaHerramienta } from "@/components/herramientas/pagina-herramienta";
import { JsonLd } from "@/components/seo/json-ld";
import { getAuthor } from "@/content/autores";
import { getCategory } from "@/content/categorias";
import { listarTodas, obtenerHerramienta, relacionadasDe, rutaHerramienta } from "@/lib/herramientas/registro";
import { herramientaArticleJsonLd, herramientaFaqJsonLd, ogImageUrl } from "@/lib/herramientas/seo";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ categoria: string; slug: string }>;
}

// El universo de herramientas se conoce en build time (un archivo de datos por página). Cualquier
// combinación área/slug que no exista devuelve 404 real. Las páginas `publicado: false` se sirven con
// noindex (para poder revisarlas) pero no aparecen en ningún listado ni en el sitemap; las internas
// de prueba (archivos «_…») solo existen con `next dev`.
export const dynamicParams = false;

export async function generateStaticParams() {
  const paginas = await listarTodas();
  return paginas.map((h) => ({ categoria: h.meta.area, slug: h.meta.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, slug } = await params;
  const h = await obtenerHerramienta(categoria, slug);
  if (!h) return {};

  return buildMetadata({
    title: h.meta.titulo,
    description: h.meta.descripcion,
    path: rutaHerramienta(h.meta),
    type: "article",
    image: ogImageUrl(h),
    noIndex: !h.publicado || h.interna,
    article: {
      publishedTime: h.meta.fechaPublicacion,
      modifiedTime: h.meta.actualizado,
      authors: [getAuthor(h.meta.autor ?? "develoclick")?.name ?? ""].filter(Boolean),
    },
  });
}

export default async function HerramientaPage({ params }: PageProps) {
  const { categoria, slug } = await params;
  const h = await obtenerHerramienta(categoria, slug);
  const area = getCategory(categoria);
  if (!h || !area) notFound();

  const relacionadas = await relacionadasDe(h);
  const faq = herramientaFaqJsonLd(h);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: area.name, path: `/${area.slug}` },
            { name: h.meta.titulo, path: rutaHerramienta(h.meta) },
          ]),
          herramientaArticleJsonLd(h),
          ...(faq ? [faq] : []),
        ]}
      />
      <PaginaHerramienta herramienta={h} relacionadas={relacionadas} />
    </>
  );
}
