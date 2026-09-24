import { ZoomableImage } from "@/components/guide/zoomable-image";
import { ui } from "@/components/guide/ui";
import { mediaExists } from "@/lib/guides/media";
import type { CapturaEjemplo } from "@/lib/herramientas/tipos";
import { cn } from "@/lib/utils";

/**
 * Una imagen con su etiqueta honesta («Prueba real», «Ilustración», «Simulación», «Resultado final diseñado con el texto de
 * la IA» o «Foto generada con IA») y su leyenda. Si el archivo no existe no muestra nada: la página nunca enseña
 * marcadores ni notas de producción.
 */
export function CapturaFigura({ captura }: { captura: CapturaEjemplo }) {
  if (!mediaExists(captura.src)) return null;
  return (
    <figure className="mt-6">
      <p className="mb-2">
        <span className={cn(captura.etiqueta === "Prueba real" ? `${ui.tag} border-ok/40 bg-ok-muted text-ok` : ui.tagNeutral)}>{captura.etiqueta}</span>
      </p>
      <ZoomableImage src={captura.src} alt={captura.alt} caption={captura.leyenda} ratio="" sizes="(min-width: 1024px) 54rem, 100vw" loading="lazy" width={captura.ancho} height={captura.alto} />
      {captura.leyenda && <figcaption className="mt-2 text-sm leading-snug text-muted-foreground">{captura.leyenda}</figcaption>}
    </figure>
  );
}
