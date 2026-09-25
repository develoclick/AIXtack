import { ImageIcon } from "lucide-react";
import { ZoomableImage } from "@/components/guide/zoomable-image";
import { ui } from "@/components/guide/ui";
import type { ImagenResuelta } from "@/lib/herramientas/imagenes";
import { estadoDeEspacio } from "@/lib/herramientas/vista-previa";
import { cn } from "@/lib/utils";

/** «16:10» → «16 / 10» (CSS aspect-ratio). Valores raros vuelven a 16 / 10. */
export function proporcionCss(p?: string): string {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(p ?? "");
  return m && Number(m[1]) > 0 && Number(m[2]) > 0 ? `${m[1]} / ${m[2]}` : "16 / 10";
}

/**
 * Un espacio de imagen: la imagen (con lupa, etiqueta visible, leyenda y nota) si el archivo existe; un recuadro punteado con la
 * proporción esperada si falta y la página es un borrador con la vista previa activa; nada en los demás casos. Una página
 * publicada a la que le falta una imagen obligatoria rompe el build con un error claro (el validador también lo comprueba).
 */
export function EspacioDeImagen({
  resuelta,
  publicado,
  vistaPrevia,
  sizes = "(min-width: 1024px) 54rem, 100vw",
  variante = "ejemplo",
}: {
  resuelta: ImagenResuelta;
  publicado: boolean;
  /** Solo para los tests: fuerza la vista previa (por defecto sale de `next dev` o MOSTRAR_BORRADORES). */
  vistaPrevia?: boolean;
  sizes?: string;
  variante?: "ejemplo" | "tarjeta";
}) {
  const { espacio, archivo } = resuelta;
  const existe = Boolean(archivo && !archivo.error);
  const estado = estadoDeEspacio({ existe, publicado, obligatoria: espacio.obligatoria, vistaPrevia, ruta: `${espacio.archivo}.webp` });
  const margen = variante === "tarjeta" ? "" : "mt-6";

  if (estado.estado === "error") throw new Error(estado.mensaje);
  if (estado.estado === "nada") return null;

  if (estado.estado === "recuadro") {
    return (
      <div
        data-espacio-imagen={espacio.id}
        data-estado="vacio"
        style={{ aspectRatio: proporcionCss(espacio.proporcion) }}
        className={cn(margen, "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-foreground/40 bg-muted/60 p-4 text-center text-sm text-foreground/80")}
      >
        <ImageIcon className="size-7 text-foreground/70" aria-hidden />
        <p className="font-semibold text-foreground">{espacio.titulo ?? espacio.alt}</p>
        <p>
          {espacio.etiqueta} · {espacio.obligatoria ? "obligatoria" : "opcional"}
        </p>
        <p className="font-mono text-[0.8rem] text-foreground">{espacio.archivo}.webp</p>
        <p className="text-xs text-muted-foreground">Vista previa: guarda la imagen con ese nombre en su carpeta y aparece sola.</p>
      </div>
    );
  }

  const a = archivo!;
  return (
    <figure data-imagen={espacio.id} className={margen}>
      <p className="mb-2">
        <span className={cn(espacio.etiqueta === "Prueba real" ? `${ui.tag} border-ok/40 bg-ok-muted text-ok` : ui.tagNeutral)}>{espacio.etiqueta}</span>
      </p>
      <ZoomableImage src={a.src} alt={espacio.alt} etiqueta={espacio.etiqueta} leyenda={espacio.leyenda} ancho={a.ancho} alto={a.alto} sizes={sizes} />
      {espacio.leyenda && <figcaption className="mt-2 text-sm leading-snug text-muted-foreground">{espacio.leyenda}</figcaption>}
      {espacio.nota && (
        <p data-nota-imagen className="mt-2 rounded-lg border-l-[3px] border-brand bg-guide-surface px-3 py-2 text-sm leading-relaxed text-foreground/90">
          {espacio.nota}
        </p>
      )}
    </figure>
  );
}
