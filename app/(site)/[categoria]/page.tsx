import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { SidebarCategorias } from "@/components/home/sidebar-categorias";
import { IconoDeCategoria } from "@/components/layout/icono-categoria";
import { TarjetaPrompt } from "@/components/prompts/tarjeta-prompt";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { articulosDeCategoria, rutaDeArticulo } from "@/content/articulos";
import { formatDate } from "@/lib/utils/format";
import { categoriasDisponibles, getCategoria } from "@/content/categorias";
import { promptsDeCategoria } from "@/content/prompts";
import { itemsBuscables } from "@/lib/buscable";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ categoria: string }>;
}

// Solo existen las categorías con `disponible: true`; cualquier otra ruta responde 404 real.
export const dynamicParams = false;

export function generateStaticParams() {
  return categoriasDisponibles.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const c = getCategoria(categoria);
  if (!c?.disponible) return {};
  return buildMetadata({ title: c.titulo, description: c.descripcion, path: `/${c.slug}` });
}

export default async function CategoriaPage({ params }: PageProps) {
  const { categoria } = await params;
  const c = getCategoria(categoria);
  if (!c?.disponible) notFound();
  const herramientas = promptsDeCategoria(c.slug);
  const lista = articulosDeCategoria(c.slug);
  const actualizado = [...herramientas.map((h) => h.actualizado), ...lista.map((a) => a.actualizado)].sort().at(-1)!;

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: c.nombre, path: `/${c.slug}` }]), ...(c.preguntas ? [faqJsonLd(c.preguntas)] : [])]} />

      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: c.nombre }]} />
          <div className="mt-6 flex items-start gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand sm:flex">
              <IconoDeCategoria icono={c.icono} className="size-7" />
            </span>
            <div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{c.titulo}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{c.descripcion}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1140px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8">
        <div className="hidden lg:block">
          <SidebarCategorias items={itemsBuscables()} actual={c.slug} />
        </div>

        <div className="min-w-0 space-y-14">
          {c.introduccion && (
            <section aria-labelledby="intro">
              <h2 id="intro" className="text-2xl font-bold">
                Cómo te ayuda esta categoría
              </h2>
              <div className="prose prose-neutral mt-4 max-w-none dark:prose-invert prose-a:text-brand prose-p:leading-relaxed">
                {c.introduccion.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="como-usar">
            <h2 id="como-usar" className="text-2xl font-bold">
              Cómo usar esta categoría en tres pasos
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed">
              <li>Empieza por la herramienta: llena tus datos (o mira un ejemplo) y copia el prompt que se arma solo.</li>
              <li>Pega el prompt en tu asistente de IA, trae la respuesta y descarga tu hoja de vida en Word.</li>
              <li>Lee los artículos para pulirla: palabras clave de la oferta, verbos de acción y, si aún no trabajas, cómo armarla sin experiencia.</li>
            </ol>
          </section>

          <section aria-labelledby="herramientas">
            <h2 id="herramientas" className="text-2xl font-bold">
              Herramientas
            </h2>
            <div className="mt-6 grid gap-4">
              {herramientas.map((p) => (
                <TarjetaPrompt key={p.slug} prompt={p} destacada />
              ))}
            </div>
          </section>

          <section aria-labelledby="articulos">
            <h2 id="articulos" className="text-2xl font-bold">
              Artículos
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {lista.map((a) => (
                <li key={a.slug}>
                  <Link href={rutaDeArticulo(a)} className="tarjeta tarjeta-enlace flex h-full flex-col p-5">
                    <h3 className="text-lg font-semibold leading-snug">{a.metaTitulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.resumen}</p>
                    <span className="mt-auto flex items-center gap-4 pt-4 text-xs font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 tabular">
                        <Clock aria-hidden className="size-4" /> {a.tiempoLectura} de lectura
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 font-semibold text-brand">
                        Leer <ArrowRight aria-hidden className="size-4" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          {c.preguntas && (
            <section aria-labelledby="preguntas">
              <h2 id="preguntas" className="text-2xl font-bold">
                Preguntas frecuentes
              </h2>
              <div className="tarjeta mt-6 divide-y">
                {c.preguntas.map((p) => (
                  <details key={p.q} className="group p-5">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                      {p.q}
                      <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{p.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs text-muted-foreground">
            Última actualización de esta categoría: <time dateTime={actualizado}>{formatDate(actualizado)}</time>. Responsable del sitio: <Link href="/sobre-nosotros" className="underline underline-offset-2">Sobre nosotros</Link>.
          </p>
        </div>
      </div>
    </>
  );
}