import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ui } from "@/components/guide/ui";
import { getCategory } from "@/content/categorias";
import { rutaHerramienta, type HerramientaCargada } from "@/lib/herramientas/registro";

const TIPO: Record<string, string> = { generador: "Generador", calculadora: "Calculadora", analizador: "Analizador", kit: "Kit" };

/** Bloque 12: 2–3 herramientas relacionadas. Las filtra `relacionadasDe` (una página publicada solo recibe publicadas). */
export function Relacionadas({ herramientas }: { herramientas: HerramientaCargada[] }) {
  if (herramientas.length === 0) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {herramientas.map((h) => (
        <li key={`${h.meta.area}/${h.meta.slug}`}>
          <Link href={rutaHerramienta(h.meta)} className="guide-focus group flex h-full min-h-11 flex-col rounded-xl border bg-background p-4 transition-colors hover:border-brand/50 hover:bg-guide-surface sm:p-5">
            <span className="flex flex-wrap items-center gap-2">
              <span className={ui.tagNeutral}>{TIPO[h.meta.tipo]}</span>
              <span className="text-sm text-muted-foreground">{getCategory(h.meta.area)?.name}</span>
              {!h.publicado && <span className={ui.tag}>Borrador · en revisión</span>}
            </span>
            <span className="mt-3 text-[1.02rem] font-semibold leading-snug text-guide-ink">{h.meta.titulo}</span>
            <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{h.meta.descripcion}</span>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-guide-ink">
              Abrir la herramienta <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
