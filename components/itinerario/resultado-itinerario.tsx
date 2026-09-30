"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowDown, ArrowUp, CalendarPlus, Check, ClipboardCopy, Download, ExternalLink, FileText, Info, Lightbulb, MapPinned, MessageCircle, Printer } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { descargar } from "@/components/plan/descargar";
import { Pestanas } from "@/components/entrevista/pestanas";
import { calendarizarItinerario, construirIcsItinerario, enlaceMapasDelDia, enlaceWhatsApp, textoDelDia } from "@/lib/itinerario/calendario";
import { diasDelViaje } from "@/lib/itinerario/calculo";
import { aCsvItinerario, aTablaItinerario } from "@/lib/itinerario/exportar";
import { leerRespuestaItinerario, type LecturaItinerario } from "@/lib/itinerario/lector";
import { TIPOS_BLOQUE, type DatosItinerario, type FilaItinerario } from "@/lib/itinerario/tipos";
import { revisarItinerario } from "@/lib/itinerario/verificar";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  /** Datos con los que se comprueba la respuesta (los del formulario, o los del ejemplo si se pegó una respuesta de ejemplo). */
  referencia: DatosItinerario;
  esDeEjemplo: boolean;
  alExportar: (tipo: "ics" | "csv" | "tabla" | "imprimir" | "maps" | "whatsapp") => void;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "resumen" | "dias" | "porque" | "presupuesto" | "verificar";

const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "dias", etiqueta: "Itinerario por día" },
  { id: "porque", etiqueta: "Por qué y planes B" },
  { id: "presupuesto", etiqueta: "Presupuesto" },
  { id: "verificar", etiqueta: "Por verificar" },
];

const COLOR_TIPO: Record<string, string> = {
  imprescindible: "bg-brand-muted text-brand",
  opcional: "bg-surface text-muted-foreground",
  comida: "bg-ok/15 text-ok",
  traslado: "bg-warn-muted text-warn",
  libre: "bg-surface text-muted-foreground",
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

function Tarjeta({ numero, etiqueta, detalle }: { numero: number | string; etiqueta: string; detalle?: string }) {
  return (
    <div className="tarjeta p-4">
      <p className="text-2xl font-bold tabular">{numero}</p>
      <p className="mt-1 text-sm font-medium">{etiqueta}</p>
      {detalle && <p className="mt-0.5 text-xs text-muted-foreground">{detalle}</p>}
    </div>
  );
}

export function ResultadoItinerario({ respuesta, alCambiar, referencia, esDeEjemplo, alExportar, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("resumen");
  const [copiado, setCopiado] = useState<string | null>(null);
  // El orden manual de cada día se descarta solo con comparar «origen» contra la respuesta actual (sin efecto: evita relecturas en cascada).
  const [overrides, setOverrides] = useState<{ origen: string; porDia: Record<number, number[]> }>({ origen: "", porDia: {} });
  const porDia = overrides.origen === respuesta ? overrides.porDia : {};
  const ayudaId = useId();

  const lectura: LecturaItinerario | null = useMemo(() => (respuesta.trim() ? leerRespuestaItinerario(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarItinerario(lectura, referencia) : null), [lectura, referencia]);
  const totalDias = diasDelViaje(referencia);
  const valida = Boolean(lectura?.valido);

  function mover(dia: number, indiceGlobal: number, paso: -1 | 1) {
    if (!lectura) return;
    const natural = lectura.itinerario.map((f, i) => (f.dia === dia ? i : -1)).filter((i) => i >= 0);
    const actual = porDia[dia] ?? natural;
    const j = actual.indexOf(indiceGlobal);
    const k = j + paso;
    if (j < 0 || k < 0 || k >= actual.length) return;
    const copia = [...actual];
    [copia[j], copia[k]] = [copia[k], copia[j]];
    setOverrides({ origen: respuesta, porDia: { ...porDia, [dia]: copia } });
  }

  function filasDelDia(dia: number): { fila: FilaItinerario; indice: number }[] {
    if (!lectura) return [];
    const natural = lectura.itinerario.map((f, i) => ({ f, i })).filter((x) => x.f.dia === dia);
    const ov = porDia[dia];
    if (!ov) return natural.map((x) => ({ fila: x.f, indice: x.i }));
    return ov.map((i) => ({ fila: lectura.itinerario[i], indice: i }));
  }

  async function copiar(clave: string, texto: string, aviso: string) {
    if (await copiarTexto(texto)) {
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2500);
      alAviso(aviso);
    }
  }

  function bajarIcs() {
    if (!lectura) return;
    const { eventos } = calendarizarItinerario(lectura.itinerario, referencia);
    if (eventos.length === 0) return;
    descargar(esDeEjemplo ? "itinerario-de-viaje-EJEMPLO.ics" : "itinerario-de-viaje.ics", construirIcsItinerario(eventos, new Date(), referencia.destino ? `Itinerario: ${referencia.destino}` : undefined), "text/calendar;charset=utf-8");
    alExportar("ics");
    alAviso(`Calendario descargado (${eventos.length} bloques). Impórtalo en Google Calendar, Outlook o Apple Calendar.`);
  }

  function bajarCsv() {
    if (!lectura) return;
    descargar(esDeEjemplo ? "itinerario-de-viaje-EJEMPLO.csv" : "itinerario-de-viaje.csv", aCsvItinerario(lectura.itinerario), "text/csv;charset=utf-8");
    alExportar("csv");
    alAviso("CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  function imprimir() {
    document.body.classList.add("imprimiendo-itinerario");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-itinerario");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-itinerario" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-itinerario" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Tu itinerario: línea de tiempo, mapas y calendario
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pega la respuesta completa de tu IA. La página arma la línea de tiempo de cada día, detecta horarios que se cruzan y días con más actividades de las que tu ritmo permite, y te deja exportar a tu calendario, a una hoja de cálculo o a papel.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-itinerario" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-itinerario"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nDebe tener los títulos «## Itinerario» (con la tabla), «## Por qué este orden», «## Planes B»…"}
            spellCheck={false}
            aria-describedby={ayudaId}
            aria-invalid={lectura ? !lectura.valido : undefined}
          />
          <p id={ayudaId} className="mt-2 flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <Lightbulb aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <strong className="font-semibold text-foreground">Tip:</strong> pega todo el bloque con el botón Copiar de tu IA. Si no aparecen los paneles, pide a la IA que use exactamente los títulos y la tabla CSV que indica el prompt.
            </span>
          </p>

          <div role="status" aria-live="polite" className="mt-3 space-y-3">
            {lectura && !lectura.valido && (
              <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                <div>
                  <p className="font-semibold">Todavía no puedo armar la línea de tiempo</p>
                  <p className="mt-1">{lectura.problema}</p>
                </div>
              </div>
            )}
            {lectura?.valido && lectura.advertencias.length > 0 && (
              <div className="flex gap-3 rounded-lg border bg-surface p-4 text-sm">
                <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">Avisos (no impiden usar el resultado)</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
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
                <button type="button" className="btn btn-secundario" onClick={bajarIcs} disabled={lectura.itinerario.length === 0}>
                  <CalendarPlus aria-hidden className="size-4" /> Calendario (.ics)
                </button>
                <button type="button" className="btn btn-secundario" onClick={bajarCsv} disabled={lectura.itinerario.length === 0}>
                  <Download aria-hidden className="size-4" /> CSV
                </button>
                <button
                  type="button"
                  className="btn btn-secundario"
                  disabled={lectura.itinerario.length === 0}
                  onClick={() => {
                    alExportar("tabla");
                    void copiar("tabla", aTablaItinerario(lectura.itinerario), "Tabla copiada. Pégala en una hoja de Excel o Google Sheets.");
                  }}
                >
                  {copiado === "tabla" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                  {copiado === "tabla" ? "Copiada" : "Copiar tabla"}
                </button>
                <button type="button" className="btn btn-secundario" onClick={imprimir} disabled={lectura.itinerario.length === 0}>
                  <Printer aria-hidden className="size-4" /> Imprimir o PDF
                </button>
              </div>

              <Pestanas etiqueta="Paneles del resultado" prefijo="itin" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "resumen" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <Tarjeta numero={lectura.itinerario.length} etiqueta="Bloques en el itinerario" detalle={totalDias ? `en ${totalDias} días` : undefined} />
                      <Tarjeta numero={revision.solapamientos.length + revision.sobrecargados.length} etiqueta="Horarios cruzados o días sobrecargados" detalle="deberían ser 0" />
                      <Tarjeta numero={revision.ajenos.length} etiqueta="Lugares que no aportaste" detalle="revísalos antes de ir" />
                      <Tarjeta numero={revision.sinVerificar} etiqueta="Bloques sin verificar" detalle="de un total de horarios" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revision.avisos} vacio="No detecté horarios cruzados, días sobrecargados ni lugares ajenos. Revisa igualmente cada bloque: la IA puede equivocarse." />
                      </div>
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
                      Este itinerario es una propuesta para organizarte, no una garantía de horarios ni de disponibilidad. Verifica cada horario, día de cierre y requisito de entrada en la fuente oficial de cada lugar antes de viajar.
                    </p>
                  </div>
                )}

                {pestana === "dias" && (
                  <div className="space-y-6" data-no-imprimir>
                    {lectura.itinerario.length === 0 ? (
                      <p className="text-sm text-muted-foreground">La respuesta no trae la tabla del itinerario en formato CSV.</p>
                    ) : (
                      Array.from({ length: totalDias ?? Math.max(...lectura.itinerario.map((f) => f.dia)) }, (_, i) => i + 1).map((dia) => {
                        const filas = filasDelDia(dia);
                        const solapadosDia = new Set(revision.solapamientos.filter((s) => s.dia === dia).flatMap((s) => [s.a, s.b]));
                        const sobrecargado = revision.sobrecargados.find((s) => s.dia === dia);
                        const enlaceMapa = enlaceMapasDelDia(filas.map((x) => x.fila));
                        const fecha = filas.find((x) => x.fila.fecha)?.fila.fecha ?? null;
                        return (
                          <div key={dia} data-dia={dia}>
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-base font-semibold">
                                Día {dia}
                                {fecha ? ` — ${fecha}` : ""}
                                {sobrecargado && <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">{sobrecargado.cantidad} de {sobrecargado.maximo} actividades como máximo</span>}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {enlaceMapa && (
                                  <a href={enlaceMapa} target="_blank" rel="noopener noreferrer" className="btn btn-secundario text-xs" onClick={() => alExportar("maps")}>
                                    <MapPinned aria-hidden className="size-3.5" /> Ver ruta en Maps <ExternalLink aria-hidden className="size-3" />
                                  </a>
                                )}
                                <a
                                  href={enlaceWhatsApp(textoDelDia(dia, fecha, filas.map((x) => x.fila)))}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secundario text-xs"
                                  onClick={() => alExportar("whatsapp")}
                                >
                                  <MessageCircle aria-hidden className="size-3.5" /> Compartir por WhatsApp
                                </a>
                              </div>
                            </div>
                            {filas.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Sin bloques.</p>
                            ) : (
                              <ol className="space-y-2" data-bloques-dia={dia}>
                                {filas.map(({ fila, indice }, pos) => (
                                  <li key={indice} className={`tarjeta flex items-start gap-3 p-3 text-sm ${solapadosDia.has(fila.actividad) ? "border-destructive/50" : ""}`} data-bloque>
                                    <span className="w-24 shrink-0 font-semibold tabular">
                                      {fila.horaInicio}
                                      {fila.horaFin ? `–${fila.horaFin}` : ""}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="flex flex-wrap items-center gap-2 font-medium">
                                        {fila.actividad || "(sin descripción)"}
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${COLOR_TIPO[fila.tipo ?? ""] ?? "bg-surface text-muted-foreground"}`}>{fila.tipo ? TIPOS_BLOQUE.find((t) => t.valor === fila.tipo)!.etiqueta : fila.tipoTexto || "sin tipo"}</span>
                                        {solapadosDia.has(fila.actividad) && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">se cruza con otro bloque</span>}
                                        {fila.verificado === false && <span className="rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">por verificar</span>}
                                      </p>
                                      {fila.lugar && (
                                        <p className="text-muted-foreground">
                                          <span className="font-semibold text-foreground">Lugar:</span> {fila.lugar}
                                        </p>
                                      )}
                                      {fila.zona && <p className="text-xs text-muted-foreground">Zona: {fila.zona}</p>}
                                      {fila.nota && <p className="text-xs text-muted-foreground">{fila.nota}</p>}
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-1">
                                      <button type="button" className="btn btn-texto" onClick={() => mover(dia, indice, -1)} disabled={pos === 0} aria-label={`Subir «${fila.actividad}» dentro del día ${dia}`}>
                                        <ArrowUp aria-hidden className="size-4" />
                                      </button>
                                      <button type="button" className="btn btn-texto" onClick={() => mover(dia, indice, 1)} disabled={pos === filas.length - 1} aria-label={`Bajar «${fila.actividad}» dentro del día ${dia}`}>
                                        <ArrowDown aria-hidden className="size-4" />
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        );
                      })
                    )}
                    <p className="text-xs text-muted-foreground">Usa las flechas para reordenar los bloques de un día. Reordenar no cambia sus horarios: ajústalos tú si hace falta.</p>
                  </div>
                )}

                {pestana === "porque" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Por qué este orden</h3>
                      {lectura.porque.length ? (
                        <ul className="space-y-2">
                          {lectura.porque.map((p, i) => (
                            <li key={i} className="tarjeta p-3 text-sm">
                              <p className="font-semibold">
                                {p.dia !== null ? `Día ${p.dia}` : "General"}
                                {p.zona ? ` (${p.zona})` : ""}
                              </p>
                              <p className="text-muted-foreground">{p.motivo}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">La respuesta no explica el orden.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Planes B</h3>
                      {lectura.planesB.length ? (
                        <ul className="space-y-2">
                          {lectura.planesB.map((p, i) => (
                            <li key={i} className="tarjeta p-3 text-sm">
                              <p className="font-semibold">{p.dia !== null ? `Día ${p.dia}` : "General"}</p>
                              {p.situacion && (
                                <p className="text-muted-foreground">
                                  <span className="font-semibold text-foreground">Si pasa esto:</span> {p.situacion}
                                </p>
                              )}
                              {p.alternativa && (
                                <p className="text-muted-foreground">
                                  <span className="font-semibold text-foreground">Alternativa:</span> {p.alternativa}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">La respuesta no trae planes B.</p>
                      )}
                    </div>
                  </div>
                )}

                {pestana === "presupuesto" && (
                  <div>
                    <h3 className="mb-2 text-base font-semibold">Presupuesto estimado</h3>
                    <Lista items={lectura.presupuesto} vacio="La respuesta no trae un comentario de presupuesto." />
                    <p className="mt-3 rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
                      Esta herramienta no consulta precios reales. Si quieres calcular cuánto costará el viaje completo, usa{" "}
                      <Link href="/viajes-y-entretenimiento/planificar-presupuesto-de-viaje" className="font-medium text-brand underline underline-offset-2">
                        Calcular el presupuesto de un viaje
                      </Link>
                      .
                    </p>
                  </div>
                )}

                {pestana === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: comprueba tú los horarios y los días de cierre de cada lugar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Verificaciones automáticas de la página</h3>
                      <Lista items={revision.avisos} vacio="No detecté horarios cruzados, días sobrecargados ni lugares ajenos." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Revisa cada horario marcado «por verificar» antes de imprimir tu itinerario." />
                    </div>
                    {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real.</p>}
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu itinerario</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta a la izquierda y aparece la línea de tiempo de cada día, con enlaces a Google Maps, para compartir por WhatsApp y para exportar a tu calendario.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
