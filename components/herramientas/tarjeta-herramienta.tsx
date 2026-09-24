import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { ui } from "@/components/guide/ui";
import { getCategory } from "@/content/categorias";
import { rutaHerramienta, type HerramientaCargada } from "@/lib/herramientas/registro";

export const ETIQUETA_TIPO: Record<string, string> = { generador: "Generador", calculadora: "Calculadora", analizador: "Analizador", kit: "Kit" };

/**
 * Tarjeta de una herramienta para la biblioteca, las áreas y el inicio. Solo recibe herramientas que
 * `listarVisibles()` deja pasar: en producción, únicamente las publicadas (salvo la vista previa de revisión,
 * MOSTRAR_BORRADORES=true). El aviso de borrador solo aparece en `next dev` o en esa vista previa.
 */
export function TarjetaHerramienta({ herramienta: h, mostrarArea = true }: { herramienta: HerramientaCargada; mostrarArea?: boolean }) {
  return (
    <Link
      href={rutaHerramienta(h.meta)}
      className="guide-focus group flex h-full min-h-11 flex-col rounded-2xl border bg-background p-5 transition-colors hover:border-brand/50 hover:bg-guide-surface sm:p-6"
    >
      <span className="flex flex-wrap items-center gap-2">
        <span className={ui.tagNeutral}>{ETIQUETA_TIPO[h.meta.tipo]}</span>
        {mostrarArea && <span className="text-sm text-muted-foreground">{getCategory(h.meta.area)?.name}</span>}
        {!h.publicado && <span className={ui.tag}>Borrador · en revisión</span>}
      </span>
      <span className="mt-3 text-balance text-[1.12rem] font-semibold leading-snug tracking-tight text-guide-ink">{h.meta.titulo}</span>
      <span className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted-foreground">{h.meta.descripcion}</span>
      <span className="mt-4 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          {h.meta.tiempo}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-guide-ink">
          Abrir <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
