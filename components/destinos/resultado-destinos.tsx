"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowUpDown, Check, ClipboardCopy, Download, FileText, Info, Printer } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { descargar } from "@/components/plan/descargar";
import { Pestanas } from "@/components/entrevista/pestanas";
import { filasResumen, nochesSimuladas, type FilaResumen } from "@/lib/destinos/calculo";
import { aCsvDestinos, aTablaDestinos } from "@/lib/destinos/exportar";
import { leerRespuestaDestinos, type LecturaDestinos } from "@/lib/destinos/lector";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import type { DatosDestinos } from "@/lib/destinos/tipos";
import { revisarDestinos } from "@/lib/destinos/verificar";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  referencia: DatosDestinos;
  esDeEjemplo: boolean;
  alExportar: (tipo: "csv" | "tabla" | "imprimir") => void;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "resumen" | "tabla" | "gastos" | "verificar";
const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "tabla", etiqueta: "Tabla de destinos" },
  { id: "gastos", etiqueta: "Gastos y ahorro" },
  { id: "verificar", etiqueta: "Por verificar" },
];

type CriterioOrden = "restante" | "total" | "nochesMax";
const CRITERIOS: { valor: CriterioOrden; etiqueta: string }[] = [
  { valor: "restante", etiqueta: "Dinero restante" },
  { valor: "total", etiqueta: "Costo total" },
  { valor: "nochesMax", etiqueta: "Noches máximas viables" },
];

function ordenar(filas: FilaResumen[], criterio: CriterioOrden): FilaResumen[] {
  const valor = (f: FilaResumen) => (criterio === "restante" ? f.recalculo.restante : criterio === "total" ? f.recalculo.total : f.nochesMaximas);
  return [...filas].sort((a, b) => {
    const va = valor(a);
    const vb = valor(b);
    if (va === null) return 1;
    if (vb === null) return -1;
    return criterio === "total" ? va - vb : vb - va;
  });
}

const ETIQUETA_TIPO: Record<string, { texto: string; clase: string }> = {
  real: { texto: "real", clase: "bg-ok/15 text-ok" },
  estimacion: { texto: "estimación", clase: "bg-warn-muted text-warn" },
  sin_dato: { texto: "sin dato", clase: "bg-surface text-muted-foreground" },
};

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

export function ResultadoDestinos({ respuesta, alCambiar, referencia, esDeEjemplo, alExportar, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("resumen");
  const [criterio, setCriterio] = useState<CriterioOrden>("restante");
  const [copiado, setCopiado] = useState<string | null>(null);
  const ayudaId = useId();

  const lectura: LecturaDestinos | null = useMemo(() => (respuesta.trim() ? leerRespuestaDestinos(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarDestinos(lectura, referencia) : null), [lectura, referencia]);
  const resumen = useMemo(() => (lectura ? filasResumen(lectura.filas, referencia) : []), [lectura, referencia]);
  const ordenadas = useMemo(() => ordenar(resumen, criterio), [resumen, criterio]);
  const viables = resumen.filter((f) => f.recalculo.viable);
  const noches = nochesSimuladas(referencia);
  const valida = Boolean(lectura?.valido);

  function bajarCsv() {
    descargar(esDeEjemplo ? "destinos-EJEMPLO.csv" : "destinos.csv", aCsvDestinos(ordenadas), "text/csv;charset=utf-8");
    alExportar("csv");
    alAviso("CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  function imprimir() {
    document.body.classList.add("imprimiendo-destinos");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-destinos");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-destinos" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-destinos" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega o escribe los destinos
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">Pega la respuesta de tu IA, o escribe tú los destinos con la cabecera «destino,fechas,noches,pasaje_pp,alojamiento_noche,total,fuente_pasaje,fuente_alojamiento,consultado_en,tipo_dato». La página recalcula el total: nunca confía en la aritmética de la IA.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-destinos" className="mb-1.5 block text-sm font-semibold">
            Destinos (respuesta de la IA o tabla escrita a mano)
          </label>
          <textarea
            id="respuesta-destinos"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de tu IA, o escribe la tabla a mano empezando por:\ndestino,fechas,noches,pasaje_pp,alojamiento_noche,total,fuente_pasaje,fuente_alojamiento,consultado_en,tipo_dato"}
            spellCheck={false}
            aria-describedby={ayudaId}
            aria-invalid={lectura ? !lectura.valido : undefined}
          />
          <p id={ayudaId} className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Con 3 o 4 destinos ya puedes comparar. Hasta 8 por respuesta.
          </p>

          <div role="status" aria-live="polite" className="mt-3 space-y-3">
            {lectura && !lectura.valido && (
              <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                <div>
                  <p className="font-semibold">Todavía no puedo armar la tabla</p>
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
                <button type="button" className="btn btn-secundario" onClick={bajarCsv} disabled={ordenadas.length === 0}>
                  <Download aria-hidden className="size-4" /> CSV
                </button>
                <button
                  type="button"
                  className="btn btn-secundario"
                  disabled={ordenadas.length === 0}
                  onClick={() => {
                    alExportar("tabla");
                    void (async () => {
                      if (await copiarTexto(aTablaDestinos(ordenadas))) {
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
                <button type="button" className="btn btn-secundario" onClick={imprimir} disabled={ordenadas.length === 0}>
                  <Printer aria-hidden className="size-4" /> Imprimir o PDF
                </button>
              </div>

              <Pestanas etiqueta="Paneles del resultado" prefijo="des" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "resumen" && (
                  <div className="space-y-5">
                    {lectura.accesoPrecios === "no" && (
                      <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
                        <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
                        <p>
                          <strong className="font-semibold">La IA declaró que no tiene precios actualizados.</strong> Trata cada precio como una referencia, no como real: repite la búsqueda con un asistente con acceso web, o usa el método guiado.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="tarjeta p-4">
                        <p className="text-2xl font-bold tabular">{resumen.length}</p>
                        <p className="mt-1 text-sm font-medium">Destinos leídos</p>
                      </div>
                      <div className="tarjeta p-4">
                        <p className="text-2xl font-bold tabular">{viables.length}</p>
                        <p className="mt-1 text-sm font-medium">
                          Viables con {noches} {noches === 1 ? "noche" : "noches"}
                        </p>
                      </div>
                    </div>
                    {viables.length === 0 && resumen.length > 0 && (
                      <div className="rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                        <p className="font-semibold">Ningún destino entra en tu presupuesto con estas noches.</p>
                        <p className="mt-1 text-muted-foreground">Prueba con menos noches en el simulador del paso 1, un alojamiento más económico o un gasto diario menor.</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revision.avisos} vacio="No detecté cifras que no vengan de tus datos ni totales que no cuadren." />
                      </div>
                    </div>
                  </div>
                )}

                {pestana === "tabla" && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="criterio-orden-destinos">
                      <ArrowUpDown aria-hidden className="size-4" /> Ordenar por
                    </label>
                    <select id="criterio-orden-destinos" className="campo w-auto" value={criterio} onChange={(e) => setCriterio(e.target.value as CriterioOrden)}>
                      {CRITERIOS.map((c) => (
                        <option key={c.valor} value={c.valor}>
                          {c.etiqueta}
                        </option>
                      ))}
                    </select>
                    {ordenadas.length === 0 ? (
                      <p className="text-sm text-muted-foreground">La respuesta no trae ningún destino que pueda leer.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border" role="region" aria-label="Tabla de destinos" tabIndex={0}>
                        <table className="w-full min-w-[46rem] text-left text-sm" data-tabla-destinos>
                          <thead className="bg-surface">
                            <tr>
                              {["Destino", "Pasaje pp", "Alojamiento/noche", `Costo total (${noches} noches)`, "Restante", "Noches máx. viables", "Dato"].map((h) => (
                                <th key={h} scope="col" className="p-2.5 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {ordenadas.map((f, i) => {
                              const et = f.fila.tipoDato ? ETIQUETA_TIPO[f.fila.tipoDato] : { texto: "sin marcar", clase: "bg-surface text-muted-foreground" };
                              return (
                                <tr key={`${f.fila.destino}-${i}`} data-fila-destino className={f.recalculo.viable ? "bg-ok/10" : "bg-destructive/5"}>
                                  <th scope="row" className="p-2.5 text-left font-medium">
                                    {f.fila.destino}
                                    {f.recalculo.difiereDeLoDeclarado && <span className="ml-1.5 rounded-full bg-warn-muted px-1.5 py-0.5 text-xs font-bold text-warn">total corregido</span>}
                                  </th>
                                  <td className="p-2.5 tabular">{f.fila.pasajePorPersona === null ? "—" : `${referencia.moneda} ${formatoMonto(f.fila.pasajePorPersona)}`}</td>
                                  <td className="p-2.5 tabular">{f.fila.alojamientoPorNoche === null ? "—" : `${referencia.moneda} ${formatoMonto(f.fila.alojamientoPorNoche)}`}</td>
                                  <td className="p-2.5 tabular">
                                    {f.recalculo.total === null ? "—" : `${referencia.moneda} ${formatoMonto(f.recalculo.total)}`}
                                    {f.recalculo.viable ? <span className="ml-1.5 rounded-full bg-ok/20 px-1.5 py-0.5 text-xs font-bold text-ok">viable</span> : <span className="ml-1.5 rounded-full bg-destructive/15 px-1.5 py-0.5 text-xs font-bold text-destructive">no entra</span>}
                                  </td>
                                  <td className="p-2.5 tabular">{f.recalculo.restante === null ? "—" : `${referencia.moneda} ${formatoMonto(f.recalculo.restante)}`}</td>
                                  <td className="p-2.5 tabular">{f.nochesMaximas ?? "—"}</td>
                                  <td className="p-2.5">
                                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${et.clase}`}>{et.texto}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {pestana === "gastos" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Gastos que podrían encarecer</h3>
                      <Lista items={lectura.gastos} vacio="La respuesta no lista gastos que podrían encarecer el viaje." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Recomendaciones para ahorrar</h3>
                      <Lista items={lectura.recomendaciones} vacio="La respuesta no trae recomendaciones para ahorrar." />
                    </div>
                  </div>
                )}

                {pestana === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: confirma cada precio con la aerolínea o el alojamiento antes de reservar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Elige un destino viable y verifica su precio antes de reservar." />
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Esta página no compra ni reserva nada. Es una ayuda para comparar destinos con el presupuesto que tú definiste; no es asesoría financiera.</p>
                    {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Los precios son ficticios.</p>}
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tus destinos comparados</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega o escribe los destinos a la izquierda y aparece la tabla con el costo real, el restante y qué destinos entran en tu presupuesto.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
