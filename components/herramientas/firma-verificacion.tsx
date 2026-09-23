import { getAuthor } from "@/content/autores";
import type { Herramienta } from "@/lib/herramientas/tipos";
import { formatDate } from "@/lib/utils/format";

/**
 * Bloque 13. «Probado por … en … el …» aparece SOLO si existe esa prueba (`probadoEn` y `probadoFecha`);
 * la fecha de actualización es siempre la real de los datos.
 */
export function FirmaVerificacion({ meta }: { meta: Herramienta["meta"] }) {
  const autor = getAuthor(meta.autor ?? "develoclick");
  const probada = Boolean(meta.probadoEn && meta.probadoFecha);

  return (
    <div className="rounded-xl border bg-guide-surface px-5 py-4 text-[0.97rem] leading-relaxed text-foreground/90">
      {probada && (
        <p>
          Probado por <strong>{autor?.name ?? "el equipo del sitio"}</strong> en {meta.probadoEn} el <time dateTime={meta.probadoFecha!}>{formatDate(meta.probadoFecha)}</time>.
        </p>
      )}
      <p className={probada ? "mt-1" : ""}>
        Actualizado el <time dateTime={meta.actualizado}>{formatDate(meta.actualizado)}</time>.
      </p>
    </div>
  );
}
