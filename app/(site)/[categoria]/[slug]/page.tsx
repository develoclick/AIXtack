import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { CUERPOS } from "@/components/articulos/cuerpos";
import { PlantillaArticulo } from "@/components/articulos/plantilla-articulo";
import { PaginaCv, PREGUNTAS_CV } from "@/components/prompts/cv/pagina-cv";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { articulos, getArticulo, rutaDeArticulo } from "@/content/articulos";
import { getCategoria } from "@/content/categorias";
import { getPrompt, prompts, rutaDePrompt } from "@/content/prompts";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ categoria: string; slug: string }>;
}

// Solo existen las herramientas y los artículos registrados; cualquier otra combinación devuelve 404 real.
export const dynamicParams = false;

export function generateStaticParams() {
  return [...prompts.map((p) => ({ categoria: p.categoria, slug: p.slug })), ...articulos.map((a) => ({ categoria: a.categoria, slug: a.slug }))];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, slug } = await params;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!.name;
  const p = getPrompt(categoria, slug);
  if (p) {
    return buildMetadata({ title: p.metaTitulo, absoluteTitle: true, description: p.descripcion, path: rutaDePrompt(p), type: "article", article: { publishedTime: p.publicado, modifiedTime: p.actualizado, authors: [autor] } });
  }
  const a = getArticulo(categoria, slug);
  if (a) {
    return buildMetadata({ title: a.metaTitulo, absoluteTitle: true, description: a.descripcion, path: rutaDeArticulo(a), type: "article", article: { publishedTime: a.publicado, modifiedTime: a.actualizado, authors: [autor] } });
  }
  return {};
}

export default async function Page({ params }: PageProps) {
  const { categoria, slug } = await params;
  const c = getCategoria(categoria);
  if (!c) notFound();
  const autor = getAuthor(AUTOR_POR_DEFECTO)!.name;
  const editorial = getAuthor(EDITORIAL)!.name;

  const p = getPrompt(categoria, slug);
  if (p) {
    const ruta = rutaDePrompt(p);
    return (
      <>
        <JsonLd
          data={[
            breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: c.nombre, path: `/${c.slug}` }, { name: p.tituloCorto, path: ruta }]),
            webApplicationJsonLd({ nombre: p.tituloCorto, descripcion: p.descripcion, path: ruta, autor }),
            howToJsonLd({
              nombre: "Cómo crear tu hoja de vida en formato Harvard para ATS",
              descripcion: p.descripcion,
              path: ruta,
              pasos: [
                { nombre: "Escribe tus datos", texto: "Completa el puesto, la oferta laboral, tus datos de contacto, tu experiencia, tu educación y tus habilidades, o usa un perfil de ejemplo.", ancla: "paso-1" },
                { nombre: "Copia el prompt y pégalo en tu IA", texto: "El prompt se arma solo con tus datos. Cópialo y pégalo en ChatGPT, Gemini, Claude u otro asistente.", ancla: "paso-2" },
                { nombre: "Pega la respuesta y descarga el Word", texto: "Pega la respuesta de la IA, revisa la vista previa y descarga tu hoja de vida en un archivo .docx de una columna.", ancla: "paso-3" },
              ],
            }),
            articleJsonLd({ titulo: p.titulo, descripcion: p.descripcion, path: ruta, publicado: p.publicado, actualizado: p.actualizado, autor, editorial }),
            faqJsonLd(PREGUNTAS_CV),
          ]}
        />
        {p.tipo === "cv-ats" && <PaginaCv prompt={p} />}
      </>
    );
  }

  const a = getArticulo(categoria, slug);
  const Cuerpo = a ? CUERPOS[a.slug] : undefined;
  if (!a || !Cuerpo) notFound();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: c.nombre, path: `/${c.slug}` }, { name: a.metaTitulo, path: rutaDeArticulo(a) }]),
          articleJsonLd({ titulo: a.titulo, descripcion: a.descripcion, path: rutaDeArticulo(a), publicado: a.publicado, actualizado: a.actualizado, autor, editorial }),
        ]}
      />
      <PlantillaArticulo meta={a}>
        <Cuerpo />
      </PlantillaArticulo>
    </>
  );
}
