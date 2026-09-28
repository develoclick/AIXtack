import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HubCategoria } from "@/components/categorias/hub-categoria";
import { categoriasActivas, getCategoriaActiva } from "@/content/catalogo";
import { itemsBuscables } from "@/lib/buscable";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{ categoria: string }>;
}

// Solo existen las categorías ACTIVAS (con al menos una herramienta publicada en el catálogo); cualquier otra ruta responde 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return categoriasActivas().map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const c = getCategoriaActiva(categoria);
  if (!c) return {};
  return buildMetadata({
    title: c.seo.title,
    absoluteTitle: true,
    description: c.seo.description,
    path: `/${c.slug}`,
    image: `${siteUrl}${c.ogImage ?? `/og/${c.slug}`}`,
  });
}

export default async function CategoriaPage({ params }: PageProps) {
  const { categoria } = await params;
  const c = getCategoriaActiva(categoria);
  if (!c) notFound();
  return <HubCategoria categoria={c} items={itemsBuscables()} />;
}
