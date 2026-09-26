import type { CSSProperties } from "react";
import type { CvDocumento } from "@/lib/cv/tipos";

/**
 * Vista previa de la hoja de vida: una hoja A4 (210 × 297 mm) escalada al ancho disponible. Los tamaños salen del ancho de la
 * hoja (unidades cqw), así la proporción entre márgenes, letra y líneas es la del Word real: márgenes de 2 cm y letra de 11 pt.
 * Si el CV ocupa más de una página, la hoja crece (nunca se recorta).
 */
const HOJA: CSSProperties = { containerType: "inline-size", boxShadow: "var(--shadow-lift)" };
const CUERPO: CSSProperties = { padding: "9.5cqw", fontSize: "max(1.85cqw, 9px)" };

export function VistaCv({ cv, etiqueta }: { cv: CvDocumento; etiqueta?: string }) {
  return (
    <div
      className="hoja-cv hoja-a4 mx-auto w-full max-w-[46rem] rounded-sm border border-neutral-300"
      style={HOJA}
      data-vista-cv
      role="region"
      aria-label={etiqueta ?? `Vista previa de la hoja de vida de ${cv.nombre}`}
    >
      <div style={CUERPO}>
        <p className="text-center font-bold leading-tight" style={{ fontSize: "1.45em" }}>
          {cv.nombre}
        </p>
        {cv.contacto.length > 0 && (
          <p className="text-center" style={{ fontSize: "0.91em", marginTop: "0.25em" }}>
            {cv.contacto.join("  |  ")}
          </p>
        )}

        {cv.secciones.map((s) => (
          <div key={s.titulo} style={{ marginTop: "0.9em" }}>
            <p className="border-b border-black font-bold" style={{ paddingBottom: "0.1em" }}>
              {s.titulo.toUpperCase()}
            </p>
            {s.parrafos.map((p) => (
              <p key={p} style={{ marginTop: "0.35em" }}>
                {p}
              </p>
            ))}
            {s.entradas.map((e, i) => (
              <div key={`${e.izq1}-${i}`} style={{ marginTop: i === 0 ? "0.35em" : "0.6em" }}>
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
                  <ul className="list-disc" style={{ paddingLeft: "1.6em", marginTop: "0.1em" }}>
                    {e.puntos.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {s.puntos.length > 0 && (
              <ul className="list-disc" style={{ paddingLeft: "1.6em", marginTop: "0.25em" }}>
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
