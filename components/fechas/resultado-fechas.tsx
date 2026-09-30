"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpDown, Check, ClipboardCopy, Download, FileText, Info, Lightbulb, Printer } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { descargar } from "@/components/plan/descargar";
import { Pestanas } from "@/components/entrevista/pestanas";
import { etiquetaDia, mapaDeCalor, masBarata, medianaPrecios, ordenarFilas, prepararFilas, type CriterioOrden } from "@/lib/fechas/analisis";
import { generarCombinaciones, parsearDuraciones } from "@/lib/fechas/calculo";
import { aCsvFechas, aTablaFechas, textoCombinacionesFaltantes } from "@/lib/fechas/exportar";
import { leerRespuestaFechas, type LecturaFechas } from "@/lib/fechas/lector";
import type { DatosFechas } from "@/lib/fechas/tipos";
import { revisarFechas } from "@/lib/fechas/verificar";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  referencia: DatosFechas;
  esDeEjemplo: boolean;
  alExportar: (tipo: "csv" | "tabla" | "imprimir" | "pendientes") => void;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "resumen" | "tabla" | "calor" | "patrones" | "pendientes" | "verificar";

const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "tabla", etiqueta: "Tabla de precios" },
  { id: "calor", etiqueta: "Mapa de calor" },
  { id: "patrones", etiqueta: "Patrones y costos" },
  { id: "pendientes", etiqueta: "Pendientes" },
  { id: "verificar", etiqueta: "Por verificar" },
];

const CRITERIOS: { valor: CriterioOrden; etiqueta: string }[] = [
  { valor: "precio", etiqueta: "Precio total" },
  { valor: "porPersona", etiqueta: "Precio por persona" },
  { valor: "noches", etiqueta: "Duración" },
  { valor: "escalas", etiqueta: "Escalas" },
  { valor: "horario", etiqueta: "Horario de ida" },
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

function Tarjeta({ numero, etiqueta, detalle }: { numero: number | string; etiqueta: string; detalle?: string }) {
  return (
    <div className="tarjeta p-4">
      <p className="text-2xl font-bold tabular">{numero}</p>
      <p className="mt-1 text-sm font-medium">{etiqueta}</p>
      {detalle && <p className="mt-0.5 text-xs text-muted-foreground">{detalle}</p>}
    </div>
  );
}

export function ResultadoFechas({ respuesta, alCambiar, referencia, esDeEjemplo, alExportar, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("resumen");
  const [criterio, setCriterio] = useState<CriterioOrden>("precio");
  const [conAjuste, setConAjuste] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const ayudaId = useId();

  const lectura: LecturaFechas | null = useMemo(() => (respuesta.trim() ? leerRespuestaFechas(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarFechas(lectura, referencia) : null), [lectura, referencia]);
  const generadas = useMemo(() => generarCombinaciones(referencia), [referencia]);
  const duraciones = useMemo(() => parsearDuraciones(referencia.duraciones), [referencia.duraciones]);
  const hayAjusteDisponible = referencia.costoEquipajeBodega.trim() !== "" || referencia.costoTraslados.trim() !== "";
  const preparadas = useMemo(() => (lectura ? prepararFilas(lectura.filas, generadas, referencia, conAjuste) : []), [lectura, generadas, referencia, conAjuste]);
  const ordenadas = useMemo(() => ordenarFilas(preparadas, criterio), [preparadas, criterio]);
  const barata = useMemo(() => masBarata(preparadas), [preparadas]);
  const mediana = useMemo(() => medianaPrecios(preparadas), [preparadas]);
  const celdas = useMemo(() => mapaDeCalor(preparadas, duraciones), [preparadas, duraciones]);
  const maxCelda = Math.max(1, ...celdas.map((c) => c.minimo ?? 0));
  const minCelda = celdas.some((c) => c.minimo !== null) ? Math.min(...celdas.filter((c) => c.minimo !== null).map((c) => c.minimo!)) : null;
  const valida = Boolean(lectura?.valido);

  function bajarCsv() {
    if (!lectura) return;
    descargar(esDeEjemplo ? "fechas-mas-baratas-EJEMPLO.csv" : "fechas-mas-baratas.csv", aCsvFechas(ordenadas), "text/csv;charset=utf-8");
    alExportar("csv");
    alAviso("CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  function imprimir() {
    document.body.classList.add("imprimiendo-fechas");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-fechas");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-fechas" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-fechas" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega o escribe los precios
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">Pega la respuesta de tu IA, o escribe tú los precios con la cabecera «ida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en». La página ordena, compara y arma el mapa de calor.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-fechas" className="mb-1.5 block text-sm font-semibold">
            Precios (respuesta de la IA o tabla escrita a mano)
          </label>
          <textarea
            id="respuesta-fechas"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de tu IA, o escribe la tabla a mano empezando por:\nida,vuelta,noches,precio_total,moneda,precio_por_persona,aerolinea,horario_ida,horario_vuelta,escalas,equipaje,condiciones,fuente,consultado_en"}
            spellCheck={false}
            aria-describedby={ayudaId}
            aria-invalid={lectura ? !lectura.valido : undefined}
          />
          <p id={ayudaId} className="mt-2 flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <Lightbulb aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <strong className="font-semibold text-foreground">Tip:</strong> no hace falta consultar las {generadas.length} combinaciones. Con 10 o 15 repartidas en tu período ya puedes ver un patrón.
            </span>
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
                      if (await copiarTexto(aTablaFechas(ordenadas))) {
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

              <Pestanas etiqueta="Paneles del resultado" prefijo="fec" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "resumen" && (
                  <div className="space-y-5">
                    {lectura.accesoTiempoReal === "no" && (
                      <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
                        <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
                        <p>
                          <strong className="font-semibold">La IA declaró que no tiene acceso a datos en tiempo real.</strong> No uses ningún precio de esta respuesta: repítela con un asistente con búsqueda web, o usa el método guiado.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Tarjeta numero={lectura.filas.length} etiqueta="Combinaciones con precio" detalle={`de ${generadas.length} generadas`} />
                      <Tarjeta numero={revision.faltantes.length} etiqueta="Aún sin precio" />
                      <Tarjeta numero={revision.sinVerificar} etiqueta="Filas no verificadas" detalle="sin fuente o fecha" />
                      <Tarjeta numero={revision.ajenas.length} etiqueta="Fechas que no pediste" />
                    </div>
                    {barata && (
                      <div className="rounded-lg border border-ok/50 bg-ok/10 p-4 text-sm">
                        <p className="font-semibold">
                          Más barata encontrada en esta búsqueda: {barata.ida} → {barata.vuelta} ({barata.noches} noches), {barata.moneda} {barata.precioComparado}
                        </p>
                        <p className="mt-1 text-muted-foreground">No necesariamente el mínimo del mercado: es la más barata entre las combinaciones que se consultaron.</p>
                        {mediana !== null && (
                          <p className="mt-1 text-muted-foreground tabular">
                            Mediana de los precios consultados: {barata.moneda} {mediana}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revision.avisos} vacio="No detecté fechas ajenas ni cifras que no vengan de tus datos." />
                      </div>
                    </div>
                  </div>
                )}

                {pestana === "tabla" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="criterio-orden">
                        <ArrowUpDown aria-hidden className="size-4" /> Ordenar por
                      </label>
                      <select id="criterio-orden" className="campo w-auto" value={criterio} onChange={(e) => setCriterio(e.target.value as CriterioOrden)}>
                        {CRITERIOS.map((c) => (
                          <option key={c.valor} value={c.valor}>
                            {c.etiqueta}
                          </option>
                        ))}
                      </select>
                      {hayAjusteDisponible && (
                        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border bg-surface px-3 text-sm">
                          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={conAjuste} onChange={(e) => setConAjuste(e.target.checked)} />
                          Incluir equipaje y traslados en el precio
                        </label>
                      )}
                    </div>
                    {ordenadas.length === 0 ? (
                      <p className="text-sm text-muted-foreground">La respuesta no trae ninguna combinación con precio.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border" role="region" aria-label="Tabla de precios por combinación" tabIndex={0}>
                        <table className="w-full min-w-[46rem] text-left text-sm" data-tabla-precios>
                          <caption className="sr-only">Combinaciones de ida y vuelta consultadas, con su precio y condiciones</caption>
                          <thead className="bg-surface">
                            <tr>
                              {["Ida", "Vuelta", "Noches", `Precio${conAjuste ? " ajustado" : ""}`, "Por persona", "Aerolínea", "Escalas", "Equipaje", "Diferencia"].map((h) => (
                                <th key={h} scope="col" className="p-2.5 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {ordenadas.map((f, i) => (
                              <tr key={`${f.ida}-${f.vuelta}-${f.noches}-${i}`} data-fila-precio className={f === barata ? "bg-ok/10" : !f.coincide ? "bg-destructive/5" : ""}>
                                <th scope="row" className="p-2.5 text-left font-medium tabular">
                                  {f.ida}
                                </th>
                                <td className="p-2.5 tabular">{f.vuelta}</td>
                                <td className="p-2.5 tabular">{f.noches ?? "—"}</td>
                                <td className="p-2.5 tabular">
                                  {f.precioComparado === null ? "—" : `${f.moneda} ${f.precioComparado}`}
                                  {f === barata && <span className="ml-1.5 rounded-full bg-ok/20 px-1.5 py-0.5 text-xs font-bold text-ok">más barata</span>}
                                  {!f.verificada && <span className="ml-1.5 rounded-full bg-warn-muted px-1.5 py-0.5 text-xs font-bold text-warn">no verificada</span>}
                                  {!f.coincide && <span className="ml-1.5 rounded-full bg-destructive/15 px-1.5 py-0.5 text-xs font-bold text-destructive">fecha no pedida</span>}
                                </td>
                                <td className="p-2.5 tabular">{f.precioPorPersona === null ? "—" : `${f.moneda} ${f.precioPorPersona}`}</td>
                                <td className="p-2.5">{f.aerolinea || "—"}</td>
                                <td className="p-2.5">{f.escalas || "—"}</td>
                                <td className="p-2.5">{f.equipaje || "—"}</td>
                                <td className="p-2.5 tabular">{f.diferenciaVsMinima === null ? "—" : f.diferenciaVsMinima === 0 ? "—" : `+${f.diferenciaVsMinima} %`}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {pestana === "calor" && (
                  <div>
                    <h3 className="mb-1 text-base font-semibold">Mapa de calor: día de ida × duración</h3>
                    <p className="mb-3 text-sm text-muted-foreground">Precio mínimo consultado en cada celda (solo con las combinaciones que tienen precio). Las celdas vacías no tienen ninguna combinación consultada todavía.</p>
                    {celdas.every((c) => c.minimo === null) ? (
                      <p className="text-sm text-muted-foreground">Todavía no hay precios suficientes para el mapa de calor.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border" role="region" aria-label="Mapa de calor de precios" tabIndex={0}>
                        <table className="w-full min-w-[32rem] text-center text-sm" data-mapa-calor>
                          <caption className="sr-only">Precio mínimo consultado por día de la semana de ida y por duración; los valores exactos están en la tabla de datos que sigue</caption>
                          <thead className="bg-surface">
                            <tr>
                              <th scope="col" className="p-2 text-left font-semibold">
                                Día de ida
                              </th>
                              {duraciones.map((n) => (
                                <th key={n} scope="col" className="p-2 font-semibold tabular">
                                  {n} noches
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {Array.from({ length: 7 }, (_, dia) => (
                              <tr key={dia}>
                                <th scope="row" className="p-2 text-left font-medium capitalize">
                                  {etiquetaDia(dia)}
                                </th>
                                {duraciones.map((n) => {
                                  const celda = celdas.find((c) => c.dia === dia && c.noches === n)!;
                                  const intensidad = celda.minimo !== null && minCelda !== null && maxCelda > minCelda ? (celda.minimo - minCelda) / (maxCelda - minCelda) : celda.minimo !== null ? 0 : null;
                                  return (
                                    <td key={n} className="p-2 tabular" style={intensidad !== null ? { background: `color-mix(in srgb, var(--ok) ${Math.round((1 - intensidad) * 45)}%, transparent)` } : undefined}>
                                      {celda.minimo ?? "—"}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {pestana === "patrones" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Patrones observados</h3>
                      <Lista items={lectura.patrones} vacio="La respuesta no describe patrones. Recuerda: son observaciones de tu búsqueda, no reglas del mercado." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Costos no incluidos</h3>
                      <Lista items={lectura.costos} vacio="La respuesta no lista costos no incluidos." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Antes de comprar</h3>
                      <Lista items={lectura.antes} vacio="La respuesta no trae pasos antes de comprar." />
                    </div>
                  </div>
                )}

                {pestana === "pendientes" && (
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold">Combinaciones aún sin precio</h3>
                      <button
                        type="button"
                        className="btn btn-secundario"
                        disabled={revision.faltantes.length === 0}
                        onClick={async () => {
                          if (await copiarTexto(textoCombinacionesFaltantes(revision.faltantes))) {
                            setCopiado("pendientes");
                            setTimeout(() => setCopiado(null), 2500);
                            alExportar("pendientes");
                            alAviso("Lista de pendientes copiada.");
                          }
                        }}
                      >
                        {copiado === "pendientes" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                        {copiado === "pendientes" ? "Copiada" : "Copiar lista"}
                      </button>
                    </div>
                    {revision.faltantes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Ya tienes precio para todas las combinaciones generadas.</p>
                    ) : (
                      <>
                        <p className="mb-2 text-sm text-muted-foreground">{revision.faltantes.length} de {generadas.length} combinaciones sin consultar. Se listan las primeras 20:</p>
                        <ul className="max-h-64 space-y-1 overflow-y-auto text-sm tabular">
                          {revision.faltantes.slice(0, 20).map((c) => (
                            <li key={c.id} className="rounded-md border bg-surface px-2.5 py-1.5">
                              {c.ida} → {c.vuelta} ({c.noches} noches)
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                {pestana === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: confirma cada precio con la aerolínea o el buscador antes de pagar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Consulta las combinaciones pendientes y compara antes de decidir." />
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
                      Esta página no compra ni reserva nada. Es una ayuda para comparar precios que tú obtuviste; no es asesoría financiera. Para tu presupuesto completo de viaje, usa{" "}
                      <Link href="/viajes-y-entretenimiento/planificar-presupuesto-de-viaje" className="font-medium text-brand underline underline-offset-2">
                        Calcular el presupuesto de un viaje
                      </Link>
                      .
                    </p>
                    {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Los precios son ficticios.</p>}
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tus combinaciones comparadas</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega o escribe los precios a la izquierda y aparece la tabla ordenable, el mapa de calor y la lista de combinaciones pendientes.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
