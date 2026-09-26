import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { PaginaCv, PREGUNTAS_CV } from "@/components/prompts/cv/pagina-cv";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria } from "@/content/categorias";
import { getPrompt, prompts, rutaDePrompt } from "@/content/prompts";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ categoria: string; slug: string }>;
}

// Solo existen las rutas registradas en content/prompts; cualquier otra combinación devuelve 404 real.
export const dynamicParams = false;

export function generateStaticParams() {
  return prompts.map((p) => ({ categoria: p.categoria, slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, slug } = await params;
  const p = getPrompt(categoria, slug);
  if (!p) return {};
  return buildMetadata({
    title: p.titulo,
    description: p.descripcion,
    path: rutaDePrompt(p),
    type: "article",
    article: { publishedTime: p.publicado, modifiedTime: p.actualizado, authors: [getAuthor(AUTOR_POR_DEFECTO)!.name] },
  });
}

export default async function PromptPage({ params }: PageProps) {
  const { categoria, slug } = await params;
  const p = getPrompt(categoria, slug);
  const c = getCategoria(categoria);
  if (!p || !c) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: c.nombre, path: `/${c.slug}` },
            { name: p.tituloCorto, path: rutaDePrompt(p) },
          ]),
          articleJsonLd({
            titulo: p.titulo,
            descripcion: p.descripcion,
            path: rutaDePrompt(p),
            publicado: p.publicado,
            actualizado: p.actualizado,
            autor: getAuthor(AUTOR_POR_DEFECTO)!.name,
            editorial: getAuthor(EDITORIAL)!.name,
          }),
          faqJsonLd(PREGUNTAS_CV),
        ]}
      />
      {p.tipo === "cv-ats" && <PaginaCv prompt={p} />}
    </>
  );
}
