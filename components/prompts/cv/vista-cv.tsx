import type { CvDocumento } from "@/lib/cv/tipos";

/** Vista previa de la hoja de vida en formato Harvard (hoja blanca, una columna): lo que verá quien abra el Word. */
export function VistaCv({ cv, etiqueta }: { cv: CvDocumento; etiqueta?: string }) {
  return (
    <div className="hoja-cv mx-auto w-full max-w-[46rem] rounded-md border border-neutral-300 px-5 py-6 shadow-sm sm:px-9 sm:py-8" data-vista-cv role="region" aria-label={etiqueta ?? `Vista previa de la hoja de vida de ${cv.nombre}`}>
      <div>
        <p className="text-center text-xl font-bold leading-tight">{cv.nombre}</p>
        {cv.contacto.length > 0 && <p className="mt-1 text-center text-[0.72rem]">{cv.contacto.join("  |  ")}</p>}

        {cv.secciones.map((s) => (
          <div key={s.titulo} className="mt-3">
            <p className="border-b border-black pb-0.5 text-[0.8rem] font-bold tracking-wide">{s.titulo.toUpperCase()}</p>
            {s.parrafos.map((p) => (
              <p key={p} className="mt-1.5">
                {p}
              </p>
            ))}
            {s.entradas.map((e, i) => (
              <div key={`${e.izq1}-${i}`} className="mt-2">
                {(e.izq1 || e.der1) && (
                  <p className="flex justify-between gap-3 font-bold">
                    <span>{e.izq1}</span>
                    <span className="shrink-0 text-right">{e.der1}</span>
                  </p>
                )}
                {(e.izq2 || e.der2) && (
                  <p className="flex justify-between gap-3 italic">
                    <span>{e.izq2}</span>
                    <span className="shrink-0 text-right">{e.der2}</span>
                  </p>
                )}
                {e.puntos.length > 0 && (
                  <ul className="mt-0.5 list-disc pl-5">
                    {e.puntos.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {s.puntos.length > 0 && (
              <ul className="mt-1 list-disc pl-5">
                {s.puntos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
