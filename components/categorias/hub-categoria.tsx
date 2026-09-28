import Link from "next/link";
import { ArrowRight, Clock, Info } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { SidebarCategorias } from "@/components/home/sidebar-categorias";
import { IconoDeCategoria } from "@/components/layout/icono-categoria";
import { TarjetaPrompt } from "@/components/prompts/tarjeta-prompt";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { catalogo as catalogoReal, type Catalogo, type Categoria } from "@/content/catalogo";
import type { ItemBuscable } from "@/components/home/buscador";
import { breadcrumbJsonLd, collectionPageJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { formatDate } from "@/lib/utils/format";

/**
 * Hub de una categoría, dibujado SOLO con datos del catálogo. Recibe el catálogo como parámetro (por defecto el real) para poder
 * probar la activación automática con datos simulados. Solo muestra herramientas y artículos PUBLICADOS y nunca enlaza a una
 * página pendiente. La página que lo usa debe responder 404 si la categoría no está activa.
 */
export function HubCategoria({ categoria: c, items, catalogo = catalogoReal }: { categoria: Categoria; items: ItemBuscable[]; catalogo?: Catalogo }) {
  const herramientas = catalogo.herramientasPublicadas(c.slug);
  const pendientes = catalogo.herramientasPendientes(c.slug);
  const articulos = catalogo.articulosPublicados(c.slug);
  const otras = catalogo.categoriasActivas().filter((x) => x.slug !== c.slug);
  const actualizado = [...herramientas.map((h) => h.fechaActualizacion), ...articulos.map((a) => a.fechaActualizacion)].sort().at(-1)!;
  const k = c.contenido;
  const filas = (k.situaciones ?? []).flatMap((s) => {
    const h = herramientas.find((x) => x.slug === s.herramienta);
    return h ? [{ s, h }] : [];
  });
  const mostrarProximas = Boolean(k.mostrarProximamente) && pendientes.length > 0 && herramientas.length <= pendientes.length;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: c.nombre, path: catalogo.rutaCategoria(c) }]),
          collectionPageJsonLd({ nombre: c.h1, descripcion: c.seo.description, path: catalogo.rutaCategoria(c), items: herramientas.map((h) => ({ nombre: h.pagina.tituloCorto, path: catalogo.rutaHerramienta(h) })) }),
          ...(c.faqs.length ? [faqJsonLd(c.faqs)] : []),
        ]}
      />

      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: c.nombre }]} />
          <div className="mt-6 flex items-start gap-4">
            <span className="hidden size-14 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand sm:flex">
              <IconoDeCategoria icono={c.icono} className="size-7" />
            </span>
            <div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{c.h1}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{c.seo.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1140px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8">
        <div className="hidden lg:block">
          <SidebarCategorias items={items} actual={c.slug} />
        </div>

        <div className="min-w-0 space-y-14">
          <section aria-labelledby="intro">
            <h2 id="intro" className="text-2xl font-bold">
              {k.tituloIntro ?? "Cómo te ayuda esta categoría"}
            </h2>
            <div className="prose prose-neutral mt-4 max-w-none dark:prose-invert prose-a:text-brand prose-p:leading-relaxed">
              {c.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          {k.anuncios && <Anuncio posicion="intro" />}

          {k.comoUsar && (
            <section aria-labelledby="como-usar">
              <h2 id="como-usar" className="text-2xl font-bold">
                {k.comoUsar.titulo}
              </h2>
              <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed">
                {k.comoUsar.pasos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </section>
          )}

          <section aria-labelledby="herramientas">
            <h2 id="herramientas" className="text-2xl font-bold">
              Herramientas
            </h2>
            <div className={`mt-6 grid gap-4 ${herramientas.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {herramientas.map((h) => (
                <TarjetaPrompt key={h.slug} herramienta={h} destacada={herramientas.length === 1} />
              ))}
            </div>
          </section>

          {filas.length >= 2 && (
            <section aria-labelledby="que-herramienta">
              <h2 id="que-herramienta" className="text-2xl font-bold">
                ¿Qué herramienta necesito?
              </h2>
              <Tabla
                resumen={`Situaciones frecuentes de ${c.nombre} y la herramienta que conviene usar`}
                columnas={["Tu situación", "Herramienta"]}
                filas={filas.map(({ s, h }) => [s.situacion, h.pagina.tituloCorto])}
                hrefs={filas.map(({ h }) => catalogo.rutaHerramienta(h))}
              />
            </section>
          )}

          {mostrarProximas && (
            <section aria-labelledby="proximamente">
              <h2 id="proximamente" className="text-2xl font-bold">
                Próximamente
              </h2>
              <ul className="mt-4 list-disc space-y-1 pl-6 text-muted-foreground">
                {pendientes.slice(0, 5).map((h) => (
                  <li key={h.slug}>{h.titulo}</li>
                ))}
              </ul>
            </section>
          )}

          {k.guia && (
            <section aria-labelledby="guia">
              <h2 id="guia" className="text-2xl font-bold">
                {k.guia.titulo}
              </h2>
              <div className="prose prose-neutral mt-4 max-w-none dark:prose-invert prose-h3:mt-8 prose-p:leading-relaxed">
                {k.guia.secciones.map((s) => (
                  <div key={s.id}>
                    <h3 id={s.id} className="scroll-mt-24">
                      {s.titulo}
                    </h3>
                    {s.parrafos.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {articulos.length > 0 && (
            <section aria-labelledby="articulos">
              <h2 id="articulos" className="text-2xl font-bold">
                Artículos
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {articulos.map((a) => (
                  <li key={a.slug}>
                    <Link href={catalogo.rutaArticulo(a)} className="tarjeta tarjeta-enlace flex h-full flex-col p-5">
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
          )}

          {k.anuncios && <Anuncio posicion="final" />}

          {c.faqs.length > 0 && (
            <section aria-labelledby="preguntas">
              <h2 id="preguntas" className="text-2xl font-bold">
                Preguntas frecuentes
              </h2>
              <div className="tarjeta mt-6 divide-y">
                {c.faqs.map((p) => (
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

          {otras.length > 0 && (
            <section aria-labelledby="otras">
              <h2 id="otras" className="text-2xl font-bold">
                Otras categorías
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {otras.map((o) => (
                  <li key={o.slug}>
                    <Link href={catalogo.rutaCategoria(o)} className="tarjeta tarjeta-enlace flex h-full items-start gap-3 p-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                        <IconoDeCategoria icono={o.icono} className="size-5" />
                      </span>
                      <span>
                        <span className="block font-semibold">{o.nombre}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{o.seo.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {k.aviso && (
            <p role="note" className="tarjeta flex gap-3 bg-surface p-4 text-sm">
              <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
              <span>{k.aviso}</span>
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Última actualización de esta categoría: <time dateTime={actualizado}>{formatDate(actualizado)}</time>. Responsable del sitio:{" "}
            <Link href="/sobre-nosotros" className="underline underline-offset-2">
              Sobre nosotros
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
