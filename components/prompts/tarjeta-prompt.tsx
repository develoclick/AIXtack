import Link from "next/link";
import { ArrowRight, Clock, FileDown } from "lucide-react";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import type { HerramientaPublicada } from "@/content/catalogo";

/** Tarjeta de una herramienta PUBLICADA (hub de la categoría, portada). Todo el texto sale del catálogo. */
export function TarjetaPrompt({ herramienta, destacada = false }: { herramienta: HerramientaPublicada; destacada?: boolean }) {
  const categoria = getCategoria(herramienta.categoria);
  const p = herramienta.pagina;
  return (
    <Link href={rutaHerramienta(herramienta)} className={`tarjeta tarjeta-enlace group flex h-full flex-col p-5 ${destacada ? "sm:p-7" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">{categoria?.nombre}</p>
      <h3 className={`mt-2 font-semibold leading-snug tracking-tight ${destacada ? "text-2xl" : "text-lg"}`}>{p.tituloCorto}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.resumen ?? herramienta.descripcionCorta}</p>
      {p.queObtienes && (
        <p className="mt-2 text-sm leading-relaxed">
          <span className="font-semibold">Qué obtienes:</span> <span className="text-muted-foreground">{p.queObtienes}</span>
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden className="size-4" />
          {p.tiempo}
        </span>
        {(p.etiquetas ?? []).map((e) => (
          <span key={e} className="inline-flex items-center gap-1.5">
            <FileDown aria-hidden className="size-4" />
            {e}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-foreground">
          {p.etiquetaBoton ?? "Usar herramienta"} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
