import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Clock, ListTree } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo, type ArticuloMeta } from "@/content/articulos";
import { getCategoria } from "@/content/categorias";
import { prompts, rutaDePrompt } from "@/content/prompts";
import { formatDate } from "@/lib/utils/format";

export const PROSE =
  "prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-8 prose-a:text-brand prose-a:underline-offset-2 prose-strong:text-foreground prose-p:leading-relaxed prose-li:leading-relaxed";

/** Plantilla común de los artículos: cabecera con autor y fechas, tabla de contenidos, texto, tarjeta de la herramienta y lecturas relacionadas. */
export function PlantillaArticulo({ meta, children }: { meta: ArticuloMeta; children: ReactNode }) {
  const categoria = getCategoria(meta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const herramienta = prompts.find((p) => p.categoria === meta.categoria)!;
  const otros = articulos.filter((a) => a.slug !== meta.slug && a.categoria === meta.categoria);

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Artículo" }]} />
          <h1 className="mt-6 text-3xl font-bold leading-[1.12] sm:text-4xl">{meta.titulo}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Por{" "}
            <Link href="/sobre-nosotros" className="font-semibold text-foreground underline-offset-2 hover:underline">
              {autor.name}
            </Link>{" "}
            · Publicado el <time dateTime={meta.publicado}>{formatDate(meta.publicado)}</time> · Actualizado el <time dateTime={meta.actualizado}>{formatDate(meta.actualizado)}</time> ·{" "}
            <span className="inline-flex items-center gap-1 tabular">
              <Clock aria-hidden className="size-3.5" /> {meta.tiempoLectura} de lectura
            </span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="En esta página" className="tarjeta p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ListTree aria-hidden className="size-4 text-brand" /> En esta página
          </p>
          <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
            {meta.secciones.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex min-h-11 items-center text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className={`${PROSE} guia-diferida mt-8`}>{children}</article>

        <aside aria-labelledby="cta-herramienta" className="tarjeta mt-12 bg-surface p-6 sm:p-8">
          <h2 id="cta-herramienta" className="text-xl font-semibold">
            Pon esto en práctica con la herramienta
          </h2>
          <p className="mt-2 text-muted-foreground">{meta.cta}</p>
          <Link href={rutaDePrompt(herramienta)} className="btn btn-primario mt-4">
            Crear mi CV con la herramienta <ArrowRight aria-hidden className="size-4" />
          </Link>
        </aside>

        {otros.length > 0 && (
          <section aria-labelledby="sigue-leyendo" className="mt-12">
            <h2 id="sigue-leyendo" className="text-xl font-semibold">
              Sigue leyendo
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {otros.map((a) => (
                <li key={a.slug}>
                  <Link href={rutaDeArticulo(a)} className="tarjeta tarjeta-enlace flex h-full flex-col p-4">
                    <span className="font-semibold leading-snug">{a.metaTitulo}</span>
                    <span className="mt-1 text-sm text-muted-foreground">{a.resumen}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
