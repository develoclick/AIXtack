import { FileText, ImageIcon, MessageCircle, Printer, Smartphone, Sparkles, Store } from "lucide-react";
import type { ComponentType } from "react";
import { Inline } from "@/components/guide/rich-text";
import { ui } from "@/components/guide/ui";
import { mediaExists } from "@/lib/guides/media";
import type { Necesidad, ProblemaItem, ResultadoFinal } from "@/lib/herramientas/tipos";
import { CapturaFigura } from "./captura-figura";
import { estilos } from "./estilos";

const ICONOS: Record<string, ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  texto: FileText,
  afiche: ImageIcon,
  movil: Smartphone,
  mockup: Store,
  mensaje: MessageCircle,
  imprimir: Printer,
};

/**
 * «Lo que vas a tener»: una tarjeta por resultado. Con captura (y solo si el archivo existe) se enseña la captura; sin ella,
 * un icono y la descripción. Nunca un recuadro de «captura pendiente»: eso solo existe en `next dev`, en el ejemplo.
 */
export function TarjetasResultado({ resultados }: { resultados: ResultadoFinal[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resultados.map((r) => {
        const Icono = ICONOS[r.icono ?? ""] ?? Sparkles;
        const captura = r.captura && mediaExists(r.captura.src) ? r.captura : null;
        return (
          <li key={r.id} data-resultado={r.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4">
            {captura ? (
              <CapturaFigura captura={captura} />
            ) : (
              <span aria-hidden className="inline-flex size-10 items-center justify-center rounded-lg border border-brand/40 bg-brand-muted text-guide-ink">
                <Icono className="size-5" aria-hidden />
              </span>
            )}
            <div>
              <h3 className={ui.h4}>{r.titulo}</h3>
              <p className="mt-1.5 text-[0.97rem] leading-relaxed text-foreground/90">{r.descripcion}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** «El problema»: tres tarjetas con los errores típicos. */
export function TarjetasProblema({ items }: { items: ProblemaItem[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {items.map((p, i) => (
        <li key={p.titulo} className="rounded-xl border bg-background p-5">
          <span className="font-mono text-sm font-semibold text-guide-ink" aria-hidden>
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className={`${ui.h4} mt-1`}>{p.titulo}</h3>
          <p className="mt-2 text-[0.97rem] leading-relaxed text-foreground/90">
            <Inline text={p.texto} />
          </p>
        </li>
      ))}
    </ul>
  );
}

/** «Qué necesitas»: lista con lo obligatorio y lo opcional dicho con texto, y la alternativa cuando la hay. */
export function ListaNecesitas({ items }: { items: Necesidad[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((n) => (
        <li key={n.nombre} className="rounded-xl border bg-background p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={ui.h4}>{n.nombre}</h3>
            <span className={n.obligatorio ? estilos.tag : ui.tagNeutral}>{n.obligatorio ? "Obligatorio" : "Opcional"}</span>
          </div>
          <p className="mt-1.5 text-[0.97rem] leading-relaxed text-foreground/90">
            <span className="font-semibold text-guide-ink">Para qué: </span>
            {n.para}
          </p>
          {n.alternativa && (
            <p className="mt-1 text-[0.97rem] leading-relaxed text-foreground/90">
              <span className="font-semibold text-guide-ink">Alternativa: </span>
              {n.alternativa}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
