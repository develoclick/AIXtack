import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { SidebarCategorias } from "@/components/home/sidebar-categorias";
import { IconoDeCategoria } from "@/components/layout/icono-categoria";
import { TarjetaPrompt } from "@/components/prompts/tarjeta-prompt";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { categoriasDisponibles, getCategoria } from "@/content/categorias";
import { promptsDeCategoria, rutaDePrompt } from "@/content/prompts";
import { itemsBuscables } from "@/lib/buscable";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
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
  const lista = promptsDeCategoria(c.slug);

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: c.nombre, path: `/${c.slug}` }])]} />

      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: c.nombre }]} />
          <div className="mt-6 flex items-start gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-muted text-brand sm:flex">
              <IconoDeCategoria icono={c.icono} className="size-7" />
            </span>
            <div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-[var(--tracking-display)] sm:text-4xl lg:text-5xl">{c.titulo}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{c.descripcion}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8">
        <div className="hidden lg:block">
          <SidebarCategorias items={itemsBuscables()} actual={c.slug} />
        </div>

        <div className="min-w-0 space-y-14">
          <section aria-labelledby="disponibles">
            <h2 id="disponibles" className="text-2xl font-bold tracking-tight">
              Prompts disponibles
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {lista.map((p) => (
                <TarjetaPrompt key={p.slug} prompt={p} />
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Estamos construyendo esta categoría de uno en uno: cada prompt se publica cuando está completo, con su formulario, su explicación y su revisión. Los siguientes aparecerán aquí.
            </p>
          </section>

          <section aria-labelledby="temas">
            <h2 id="temas" className="text-2xl font-bold tracking-tight">
              Temas de esta categoría
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {c.subcategorias.map((s) => {
                const propios = lista.filter((p) => p.subcategoria === s.slug);
                return (
                  <li key={s.slug} className="rounded-xl border bg-card p-4">
                    <h3 className="font-semibold">{s.nombre}</h3>
                    {propios.length ? (
                      <ul className="mt-2">
                        {propios.map((p) => (
                          <li key={p.slug}>
                            <Link href={rutaDePrompt(p)} className="flex min-h-11 items-center text-sm font-medium text-brand underline-offset-2 hover:underline">
                              {p.tituloCorto}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Próximamente</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
