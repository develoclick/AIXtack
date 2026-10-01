"use client";

import { useId, useMemo, type ReactNode } from "react";
import { AlertTriangle, Download, FileText, Info, Printer } from "lucide-react";
import { descargar } from "@/components/plan/descargar";
import { csvDeAnalisisVentas } from "@/lib/analizar-ventas/csv";
import { leerRespuestaAnalisisVentas, TITULOS_RESPUESTA, type LecturaAnalisisVentas } from "@/lib/analizar-ventas/lector";
import { revisarAnalisisVentas } from "@/lib/analizar-ventas/verificar";
import type { ResumenAnalisis } from "@/lib/analizar-ventas/calculo";
import type { DatosAnalisisVentas, FichaDataset } from "@/lib/analizar-ventas/tipos";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  datos: DatosAnalisisVentas;
  ficha: FichaDataset | null;
  resumen: ResumenAnalisis | null;
  esDeEjemplo: boolean;
  alExportar: (tipo: "imprimir" | "csv") => void;
  accionesDeEjemplo: ReactNode;
}

function Lista({ items, vacio }: { items: string[]; vacio: string }) {
  return items.length ? (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">{vacio}</p>
  );
}

export function ResultadoAnalisisVentas({ respuesta, alCambiar, datos, ficha, resumen, esDeEjemplo, alExportar, accionesDeEjemplo }: Props) {
  const ayudaId = useId();
  const lectura: LecturaAnalisisVentas | null = useMemo(() => (respuesta.trim() ? leerRespuestaAnalisisVentas(respuesta) : null), [respuesta]);
  const valida = Boolean(lectura?.valido);
  const revision = useMemo(() => (lectura?.valido && ficha && resumen ? revisarAnalisisVentas(lectura, datos, ficha, resumen) : null), [lectura, datos, ficha, resumen]);

  function imprimir() {
    document.body.classList.add("imprimiendo-ventas");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-ventas");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  function descargarCsv() {
    if (!resumen) return;
    descargar(`${datos.nombreArchivo.replace(/\.[^.]+$/, "") || "analisis-ventas"}.csv`, csvDeAnalisisVentas(resumen, datos.moneda || "S/"), "text/csv;charset=utf-8");
    alExportar("csv");
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-ventas" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-ventas" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega la respuesta de tu IA
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">Esta página revisa que ninguna cifra de la respuesta se aparte de la ficha o de las métricas que ya calculó, y que cada causa propuesta esté marcada como hipótesis.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-ventas" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-ventas"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder="Pega aquí la respuesta completa de tu IA, con los títulos «## Calidad de datos», «## Métricas principales»…"
            spellCheck={false}
            aria-describedby={ayudaId}
            aria-invalid={lectura ? !lectura.valido : undefined}
          />
          <p id={ayudaId} className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Usa el botón «Copiar» de tu asistente de IA y pega aquí la respuesta completa, sin editarla.
          </p>

          <div role="status" aria-live="polite" className="mt-3 space-y-3">
            {lectura && !lectura.valido && (
              <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                <div>
                  <p className="font-semibold">Todavía no puedo leer esta respuesta</p>
                  <p className="mt-1 break-words">{lectura.problema}</p>
                </div>
              </div>
            )}
            {lectura?.valido && lectura.advertencias.length > 0 && (
              <div className="flex gap-3 rounded-lg border bg-surface p-4 text-sm">
                <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">Avisos (no impiden usar el resultado)</p>
                  <ul className="mt-1 list-disc space-y-1 break-words pl-5 text-muted-foreground">
                    {lectura.advertencias.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          {valida && lectura && resumen ? (
            <div className="aparecer space-y-6">
              <div className="flex flex-wrap gap-2" data-no-imprimir>
                <button type="button" className="btn btn-secundario" onClick={imprimir}>
                  <Printer aria-hidden className="size-4" /> Descargar informe en PDF
                </button>
                <button type="button" className="btn btn-secundario" onClick={descargarCsv}>
                  <Download aria-hidden className="size-4" /> Descargar métricas .csv
                </button>
              </div>

              {revision && (revision.cifras.montos.length > 0 || revision.cifras.porcentajes.length > 0 || revision.avisos.length > 0) && (
                <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                  <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                  <div className="min-w-0 space-y-2">
                    <p className="font-semibold">Revisa antes de confiar en el resultado</p>
                    {revision.cifras.montos.length > 0 && (
                      <p className="break-words">
                        Montos que no están en tu archivo ni en las métricas calculadas: <strong>{revision.cifras.montos.join(", ")}</strong>.
                      </p>
                    )}
                    {revision.cifras.porcentajes.length > 0 && (
                      <p className="break-words">
                        Porcentajes que no están en tu archivo ni en las métricas: <strong>{revision.cifras.porcentajes.join(", ")}</strong>.
                      </p>
                    )}
                    {revision.avisos.map((a) => (
                      <p key={a} className="break-words text-muted-foreground">
                        {a}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {TITULOS_RESPUESTA.map((t) =>
                t.clave === "metricas" ? (
                  <div key={t.clave}>
                    <h3 className="mb-2 text-base font-semibold">{t.titulo}</h3>
                    {lectura.metricas.length ? (
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-left text-sm">
                          <tbody className="divide-y">
                            {lectura.metricas.map((m) => (
                              <tr key={m.metrica}>
                                <td className="p-2 text-muted-foreground">{m.metrica}</td>
                                <td className="p-2 text-right font-semibold tabular">{m.valor}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no trae esta sección.</p>
                    )}
                  </div>
                ) : (
                  <div key={t.clave}>
                    <h3 className="mb-2 text-base font-semibold">{t.titulo}</h3>
                    <Lista items={lectura[t.clave]} vacio="La respuesta no trae esta sección." />
                  </div>
                ),
              )}

              <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Las métricas, la evolución, la participación, la concentración y la comparación de períodos las calcula esta página, nunca la IA: revísalas en el dashboard del paso 1.</p>
              {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Los hallazgos y las hipótesis son ficticios.</p>}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás la calidad de datos, los hallazgos y las hipótesis a investigar</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA a la izquierda y aparecen los 8 paneles de tu análisis.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
