import Link from "next/link";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import type { Herramienta } from "@/lib/herramientas/tipos";
import { formatDate } from "@/lib/utils/format";

/**
 * Bloque 13. «Probado por … en … el …» aparece SOLO si existe esa prueba (`probadoEn` y `probadoFecha`);
 * la fecha de actualización es siempre la real de los datos. Bajo «Probado por…» va la biografía corta del autor, con enlace a «Sobre nosotros».
 */
export function FirmaVerificacion({ meta }: { meta: Herramienta["meta"] }) {
  const autor = getAuthor(meta.autor ?? AUTOR_POR_DEFECTO);
  const probada = Boolean(meta.probadoEn && meta.probadoFecha);

  return (
    <div className="rounded-xl border bg-guide-surface px-5 py-4 text-[0.97rem] leading-relaxed text-foreground/90">
      {probada && (
        <p>
          Probado por <strong>{autor?.name}</strong> en {meta.probadoEn} el <time dateTime={meta.probadoFecha!}>{formatDate(meta.probadoFecha)}</time>.
        </p>
      )}
      {autor?.bioCorta && (
        <p className={probada ? "mt-1" : ""}>
          {autor.bioCorta}{" "}
          <Link href="/sobre-nosotros" className="whitespace-nowrap text-brand underline underline-offset-2">
            Más sobre el autor
          </Link>
        </p>
      )}
      <p className={probada || autor?.bioCorta ? "mt-1" : ""}>
        Actualizado el <time dateTime={meta.actualizado}>{formatDate(meta.actualizado)}</time>.
      </p>
    </div>
  );
}
