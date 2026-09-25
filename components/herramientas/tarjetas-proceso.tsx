import { FileText, ImageIcon, MessageCircle, Printer, Smartphone, Sparkles, Store } from "lucide-react";
import type { ComponentType } from "react";
import { Inline } from "@/components/guide/rich-text";
import { ui } from "@/components/guide/ui";
import type { ImagenResuelta } from "@/lib/herramientas/imagenes";
import { imagenesEn } from "@/lib/herramientas/ubicaciones";
import { estadoDeEspacio } from "@/lib/herramientas/vista-previa";
import type { Necesidad, ProblemaItem, ResultadoFinal } from "@/lib/herramientas/tipos";
import { EspacioDeImagen } from "./espacio-imagen";
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
 * «Lo que vas a tener»: una tarjeta por resultado. Si hay una imagen para esa tarjeta (un espacio con `ubicacion: "resultado-{id}"`
 * y su archivo), se enseña con su lupa; sin ella, un icono y la descripción. Un recuadro de «imagen pendiente» solo sale en un
 * borrador con la vista previa activa (ver EspacioDeImagen).
 */
export function TarjetasResultado({ resultados, imagenes = [], publicado = false, vistaPrevia }: { resultados: ResultadoFinal[]; imagenes?: ImagenResuelta[]; publicado?: boolean; vistaPrevia?: boolean }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resultados.map((r) => {
        const Icono = ICONOS[r.icono ?? ""] ?? Sparkles;
        const suyas = imagenesEn(imagenes, `resultado-${r.id}`).filter((i) => estadoDeEspacio({ existe: Boolean(i.archivo && !i.archivo.error), publicado, obligatoria: i.espacio.obligatoria, vistaPrevia, ruta: i.espacio.archivo }).estado !== "nada");
        return (
          <li key={r.id} data-resultado={r.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4">
            {suyas.length > 0 ? (
              suyas.map((i) => <EspacioDeImagen key={i.espacio.id} resuelta={i} publicado={publicado} vistaPrevia={vistaPrevia} variante="tarjeta" sizes="(min-width: 1024px) 20rem, (min-width: 640px) 50vw, 100vw" />)
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
