import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BibliotecaHerramientas } from "@/components/herramientas/biblioteca-herramientas";
import { TarjetaHerramienta } from "@/components/herramientas/tarjeta-herramienta";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { AuroraRibbon } from "@/components/visual/aurora-ribbon";
import { categories } from "@/content/categorias";
import { listarPublicadas, listarVisibles } from "@/lib/herramientas/registro";
import { herramientasCollectionJsonLd } from "@/lib/herramientas/seo";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

const TITULO = "Herramientas de IA para tu negocio";
const DESCRIPCION =
  "Elige la tarea, llena unos datos y copia el prompt: generadores, calculadoras y kits para anuncios, precios, clientes, ventas y organización de tu negocio.";

export async function generateMetadata() {
  // Sin ninguna herramienta publicada la biblioteca no tiene contenido que indexar.
  const publicadas = await listarPublicadas();
  return buildMetadata({ title: TITULO, description: DESCRIPCION, path: "/herramientas", noIndex: publicadas.length === 0 });
}

export default async function HerramientasPage() {
  const visibles = await listarVisibles();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Herramientas", path: "/herramientas" },
          ]),
          herramientasCollectionJsonLd({ name: TITULO, description: DESCRIPCION, path: "/herramientas", herramientas: visibles.filter((h) => h.publicado) }),
        ]}
      />

      <header className="relative isolate overflow-hidden border-b">
        <div aria-hidden className="bg-lines absolute inset-x-0 top-0 -z-10 h-full opacity-60" />
        <AuroraRibbon className="-right-[12%] top-[10%] -z-10 hidden h-[24rem] w-[58%] lg:block" />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
          <Breadcrumbs items={[{ name: "Herramientas", path: "/herramientas" }]} />
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-guide-ink">Biblioteca</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-guide-ink sm:text-5xl">{TITULO}</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Cada herramienta resuelve una tarea de un negocio pequeño: eliges la tarea, llenas unos datos, copias el prompt y lo pegas en el asistente de IA que uses. Los cálculos los hace la página; la IA redacta, ordena e interpreta, y tú revisas el resultado antes de usarlo.
            </p>
            <p className="mt-4 text-[0.97rem] text-muted-foreground">
              Si completas los datos de tu negocio una sola vez, se reutilizan en todas:{" "}
              <Link href="/mi-negocio" className="guide-focus font-semibold text-guide-ink underline underline-offset-2">
                Mi negocio
              </Link>
              . Y aquí explicamos <Link href="/como-probamos" className="guide-focus font-semibold text-guide-ink underline underline-offset-2">cómo probamos cada prompt</Link>.
            </p>
          </div>
        </div>
      </header>

      <div className="herramienta-scope mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {visibles.length > 0 ? (
          <BibliotecaHerramientas
            areas={categories.map((c) => ({ id: c.slug, nombre: c.name }))}
            items={visibles.map((h) => ({ clave: `${h.meta.area}/${h.meta.slug}`, area: h.meta.area, tipo: h.meta.tipo, tarjeta: <TarjetaHerramienta herramienta={h} /> }))}
          />
        ) : (
          <div className="rounded-2xl border bg-guide-surface p-8">
            <h2 className="text-xl font-semibold text-guide-ink">Estamos preparando las primeras herramientas</h2>
            <p className="mt-3 max-w-2xl text-[0.97rem] leading-relaxed text-foreground/90">
              Cada herramienta se publica solo cuando su prompt se ha probado de verdad en una IA y tiene su captura. Mientras tanto, puedes conocer las áreas del sitio.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="guide-focus inline-flex min-h-11 items-center gap-1.5 rounded-full border border-foreground/50 bg-background px-4 text-sm font-semibold text-foreground hover:bg-background/70">
                    {c.name} <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
