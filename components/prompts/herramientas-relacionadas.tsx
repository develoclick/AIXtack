import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHerramienta, relacionadasPublicadas, rutaHerramienta } from "@/content/catalogo";

/**
 * «Herramientas relacionadas» de una herramienta, leídas del catálogo. Solo aparecen las que ya están PUBLICADAS: una relacionada
 * pendiente no se muestra ni se enlaza. Si no hay ninguna publicada, no dibuja nada. Cada página de herramienta debe incluirlo.
 */
export function HerramientasRelacionadas({ categoria, slug }: { categoria: string; slug: string }) {
  const h = getHerramienta(categoria, slug);
  const lista = h ? relacionadasPublicadas(h) : [];
  if (lista.length === 0) return null;
  return (
    <section aria-labelledby="herramientas-relacionadas" className="mt-12">
      <h2 id="herramientas-relacionadas" className="text-xl font-semibold">
        Herramientas relacionadas
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {lista.map((r) => (
          <li key={r.slug}>
            <Link href={rutaHerramienta(r)} className="tarjeta tarjeta-enlace flex h-full flex-col p-4">
              <span className="font-semibold leading-snug">{r.pagina.tituloCorto}</span>
              <span className="mt-1 text-sm text-muted-foreground">{r.descripcionCorta}</span>
              <span className="mt-2 flex items-center gap-1 text-sm font-medium text-brand">
                Abrir <ArrowRight aria-hidden className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
