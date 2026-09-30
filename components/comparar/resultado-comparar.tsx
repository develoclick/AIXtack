"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Check, ClipboardCopy, Download, FileText, Info, Printer, Trophy } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { descargar } from "@/components/plan/descargar";
import { Pestanas } from "@/components/entrevista/pestanas";
import { filasResumen, ganadorDePerfil, masBarata, mejorPuntuada, PERFILES_PESO } from "@/lib/comparar/calculo";
import { aCsvComparar, aTablaComparar } from "@/lib/comparar/exportar";
import { leerRespuestaComparar, type LecturaComparar } from "@/lib/comparar/lector";
import type { DatosComparar } from "@/lib/comparar/tipos";
import { revisarComparar } from "@/lib/comparar/verificar";
import { formatoMonto } from "@/lib/presupuesto/calculo";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  referencia: DatosComparar;
  esDeEjemplo: boolean;
  alExportar: (tipo: "csv" | "tabla" | "imprimir") => void;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "resumen" | "tabla" | "costos" | "ventajas" | "verificar";

const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "tabla", etiqueta: "Tabla comparativa" },
  { id: "costos", etiqueta: "Costos y diferencias" },
  { id: "ventajas", etiqueta: "Ventajas y prioridades" },
  { id: "verificar", etiqueta: "Preguntas y verificación" },
];

function Lista({ items, vacio }: { items: string[]; vacio: string }) {
  return items.length ? (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">{vacio}</p>
  );
}

export function ResultadoComparar({ respuesta, alCambiar, referencia, esDeEjemplo, alExportar, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("resumen");
  const [copiado, setCopiado] = useState<string | null>(null);
  const ayudaId = useId();

  const lectura: LecturaComparar | null = useMemo(() => (respuesta.trim() ? leerRespuestaComparar(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarComparar(lectura, referencia) : null), [lectura, referencia]);
  const filas = useMemo(() => filasResumen(referencia), [referencia]);
  const barata = masBarata(filas);
  const mejor = mejorPuntuada(filas);
  const valida = Boolean(lectura?.valido);

  function bajarCsv() {
    descargar(esDeEjemplo ? "comparar-opciones-EJEMPLO.csv" : "comparar-opciones.csv", aCsvComparar(referencia), "text/csv;charset=utf-8");
    alExportar("csv");
    alAviso("CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  function imprimir() {
    document.body.classList.add("imprimiendo-comparar");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-comparar");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-comparar" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-comparar" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega la respuesta de tu IA
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">La matriz y el costo total ajustado ya los calculó la página en el paso 1. Aquí solo agregas las valoraciones, los costos a verificar y las preguntas que te dio la IA.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-comparar" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-comparar"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder="Pega aquí la respuesta completa de tu IA, con los títulos «## Tabla comparativa», «## Costos a verificar»…"
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
          {valida && lectura && revision ? (
            <div className="aparecer">
              <div className="mb-4 flex flex-wrap gap-2" data-no-imprimir>
                <button type="button" className="btn btn-secundario" onClick={bajarCsv}>
                  <Download aria-hidden className="size-4" /> CSV
                </button>
                <button
                  type="button"
                  className="btn btn-secundario"
                  onClick={() => {
                    alExportar("tabla");
                    void (async () => {
                      if (await copiarTexto(aTablaComparar(referencia))) {
                        setCopiado("tabla");
                        setTimeout(() => setCopiado(null), 2500);
                        alAviso("Tabla copiada. Pégala en una hoja de Excel o Google Sheets.");
                      }
                    })();
                  }}
                >
                  {copiado === "tabla" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                  {copiado === "tabla" ? "Copiada" : "Copiar tabla"}
                </button>
                <button type="button" className="btn btn-secundario" onClick={imprimir}>
                  <Printer aria-hidden className="size-4" /> Imprimir o PDF
                </button>
              </div>

              <Pestanas etiqueta="Paneles del resultado" prefijo="cmp" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "resumen" && (
                  <div className="space-y-5">
                    {mejor && mejor.opcion.nombre.trim() && (
                      <div className="rounded-lg border border-brand-solid/40 bg-brand-muted p-4 text-sm">
                        <p className="flex items-center gap-1.5 font-semibold text-brand">
                          <Trophy aria-hidden className="size-4" /> Mejor puntuada: {mejor.opcion.nombre}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {mejor.puntuacion}/100 puntos, con tus criterios y pesos actuales. {barata && barata.opcion.id !== mejor.opcion.id && `El costo total ajustado más bajo es de ${barata.opcion.nombre}.`}
                        </p>
                      </div>
                    )}
                    <div className="overflow-x-auto rounded-lg border" role="region" aria-label="Resumen de opciones" tabIndex={0}>
                      <table className="w-full min-w-[28rem] text-left text-sm" data-tabla-resumen>
                        <thead className="bg-surface">
                          <tr>
                            {["Opción", "Costo total ajustado", "Puntuación"].map((h) => (
                              <th key={h} scope="col" className="p-2.5 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filas.map((f) => (
                            <tr key={f.opcion.id} className={f.opcion.id === mejor?.opcion.id ? "bg-brand-muted/60" : ""}>
                              <th scope="row" className="p-2.5 text-left font-medium">
                                {f.opcion.nombre || "(sin nombre)"}
                              </th>
                              <td className="p-2.5 tabular">{f.costo.total !== null ? `${f.opcion.moneda} ${formatoMonto(f.costo.total)}` : "—"}</td>
                              <td className="p-2.5 tabular">{f.puntuacion}/100</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Si cambian tus prioridades</h3>
                      <ul className="space-y-1 text-sm">
                        {PERFILES_PESO.map((p) => {
                          const g = ganadorDePerfil(referencia, p.valor);
                          return (
                            <li key={p.valor} className="flex items-center justify-between gap-2 rounded-md border bg-surface px-3 py-2">
                              <span className="text-muted-foreground">{p.etiqueta}</span>
                              <span className="font-medium">{g && g.opcion.nombre.trim() ? g.opcion.nombre : "—"}</span>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-2 text-xs text-muted-foreground">Cálculo de la página, con las mismas puntuaciones que le pusiste a cada opción. Compáralo con la sección «Si cambian mis prioridades» de la respuesta, en la pestaña «Ventajas y prioridades».</p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <Lista items={revision.avisos} vacio="No detecté montos que no vengan de tus opciones ni de los cálculos de la página." />
                    </div>
                  </div>
                )}

                {pestana === "tabla" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Las celdas marcadas «[VALORACIÓN]» son opiniones de la IA, no datos que le diste.</p>
                    {lectura.tabla.filas.length === 0 ? (
                      <p className="text-sm text-muted-foreground">La respuesta no trae filas que pueda separar en columnas.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border" role="region" aria-label="Tabla comparativa de la IA" tabIndex={0}>
                        <table className="w-full min-w-[36rem] text-left text-sm" data-tabla-comparativa>
                          {lectura.tabla.cabecera.length > 0 && (
                            <thead className="bg-surface">
                              <tr>
                                {lectura.tabla.cabecera.map((c, i) => (
                                  <th key={i} scope="col" className="p-2.5 font-semibold">
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody className="divide-y">
                            {lectura.tabla.filas.map((f, i) => (
                              <tr key={i}>
                                {f.celdas.map((c, j) => (
                                  <td key={j} className="p-2.5 break-words align-top">
                                    {c.replace(/\[valoraci[oó]n\]/i, "").trim().length > 0 && /\[valoraci[oó]n\]/i.test(c) ? <span className="rounded bg-brand-muted px-1.5 py-0.5 text-xs font-semibold text-brand">valoración</span> : null} {c.replace(/\[valoraci[oó]n\]\s*/i, "")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {pestana === "costos" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Costos a verificar</h3>
                      <Lista items={lectura.costos} vacio="La respuesta no lista costos a verificar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Diferencias que importan</h3>
                      <Lista items={lectura.diferencias} vacio="La respuesta no describe diferencias con consecuencias prácticas." />
                    </div>
                  </div>
                )}

                {pestana === "ventajas" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Ventajas y desventajas</h3>
                      <Lista items={lectura.ventajas} vacio="La respuesta no lista ventajas ni desventajas." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Si cambian mis prioridades (según la IA)</h3>
                      <Lista items={lectura.prioridades} vacio="La respuesta no describe cómo cambia la decisión según tus prioridades." />
                    </div>
                  </div>
                )}

                {pestana === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Preguntas antes de reservar</h3>
                      <Lista items={lectura.preguntas} vacio="La respuesta no lista preguntas antes de reservar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: confirma cada precio y condición con el proveedor antes de reservar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Resuelve tus preguntas pendientes y reserva la opción elegida." />
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Esta página no reserva ni compra nada. Es una ayuda para comparar opciones que tú aportaste; no es asesoría financiera.</p>
                    {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Los datos son ficticios.</p>}
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu comparación completa</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA a la izquierda y aparecen la tabla, los costos a verificar y las preguntas antes de reservar.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
