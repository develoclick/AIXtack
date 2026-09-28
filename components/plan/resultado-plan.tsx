"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CalendarPlus, Check, ClipboardCopy, Download, FileText, Info, Lightbulb } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { Pestanas } from "@/components/entrevista/pestanas";
import { descargar } from "./descargar";
import { calendarizar, construirIcs, esLunes } from "@/lib/plan/calendario";
import { formatoDuracion, minutosDisponibles } from "@/lib/plan/calculo";
import { aCsvPlan, aTablaPlan } from "@/lib/plan/exportar";
import { leerRespuestaPlan, type LecturaPlan } from "@/lib/plan/lector";
import type { DatosPlan } from "@/lib/plan/tipos";
import { revisarPlan } from "@/lib/plan/verificar";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  /** Datos con los que se comprueba la respuesta (los del formulario, o los del ejemplo si se pegó una respuesta de ejemplo). */
  referencia: DatosPlan;
  esDeEjemplo: boolean;
  alExportar: (tipo: "ics" | "csv" | "tabla") => void;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "resumen" | "plan" | "distribucion" | "vacantes" | "plantillas" | "metricas" | "verificar";

const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "plan", etiqueta: "Plan y calendario" },
  { id: "distribucion", etiqueta: "Distribución" },
  { id: "vacantes", etiqueta: "Vacantes y criterios" },
  { id: "plantillas", etiqueta: "Plantillas" },
  { id: "metricas", etiqueta: "Métricas" },
  { id: "verificar", etiqueta: "Por verificar" },
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

const PRIORIDAD: Record<string, string> = { alta: "bg-ok/15 text-ok", media: "bg-warn-muted text-warn", baja: "bg-surface text-muted-foreground" };

export function ResultadoPlan({ respuesta, alCambiar, referencia, esDeEjemplo, alExportar, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("resumen");
  const [copiado, setCopiado] = useState<string | null>(null);
  const [lunes, setLunes] = useState("");
  const [hora, setHora] = useState("18:00");
  const ayudaId = useId();

  const lectura: LecturaPlan | null = useMemo(() => (respuesta.trim() ? leerRespuestaPlan(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarPlan(lectura, referencia) : null), [lectura, referencia]);
  const disponibles = minutosDisponibles(referencia);
  const valida = Boolean(lectura?.valido);
  const lunesValido = esLunes(lunes);
  const calendario = useMemo(() => (lectura && lunesValido ? calendarizar(lectura.plan, lunes, hora) : null), [lectura, lunes, lunesValido, hora]);

  async function copiar(clave: string, texto: string, aviso: string) {
    if (await copiarTexto(texto)) {
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2500);
      alAviso(aviso);
    }
  }

  function bajarIcs() {
    if (!calendario || calendario.eventos.length === 0) return;
    descargar(esDeEjemplo ? "plan-busqueda-empleo-EJEMPLO.ics" : "plan-busqueda-empleo.ics", construirIcs(calendario.eventos, new Date()), "text/calendar;charset=utf-8");
    alExportar("ics");
    alAviso(`Calendario descargado (${calendario.eventos.length} tareas). Impórtalo en Google Calendar, Outlook o Apple Calendar.`);
  }

  function bajarCsv() {
    if (!lectura) return;
    descargar(esDeEjemplo ? "plan-busqueda-empleo-EJEMPLO.csv" : "plan-busqueda-empleo.csv", aCsvPlan(lectura.plan), "text/csv;charset=utf-8");
    alExportar("csv");
    alAviso("CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-plan" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-plan" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Tu plan: calendario, vacantes y plantillas
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pega la respuesta completa de tu IA. La página la separa en paneles, suma los minutos de cada semana contra tu tiempo disponible, te deja exportar el calendario y marca lo que no venga de tus datos.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-plan" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-plan"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nDebe tener los títulos «## Objetivo», «## Distribución semanal», «## Plan de 4 semanas», «## Plantillas»…"}
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
                  <p className="font-semibold">Todavía no puedo armar los paneles</p>
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
            {!respuesta.trim() && <p className="text-xs text-muted-foreground">Mientras esperas la respuesta, puedes ir al registro de postulaciones de más abajo: funciona sin la IA.</p>}
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          {valida && lectura && revision ? (
            <div className="aparecer">
              <Pestanas etiqueta="Paneles del resultado" prefijo="plan" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "resumen" && (
                  <div className="space-y-5">
                    {lectura.objetivo && (
                      <div className="rounded-lg border bg-surface p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tu objetivo</p>
                        <p className="mt-1 text-sm font-medium leading-relaxed" data-objetivo>
                          {lectura.objetivo}
                        </p>
                        {lectura.alternativas.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {lectura.alternativas.map((a) => (
                              <li key={a}>Alternativa: {a}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Tarjeta numero={lectura.plan.length} etiqueta="Tareas en el plan" detalle="en 4 semanas" />
                      <Tarjeta numero={revision.semanasQueNoCaben.length === 0 ? "Sí" : "No"} etiqueta="Cabe en tu tiempo" detalle={revision.semanasQueNoCaben.length ? `Se pasan las semanas ${revision.semanasQueNoCaben.join(", ")}` : disponibles ? `hasta ${disponibles} min por semana` : "sin horas indicadas"} />
                      <Tarjeta numero={lectura.plantillas.length} etiqueta="Plantillas" detalle="para copiar" />
                      <Tarjeta numero={revision.avisos.length} etiqueta="Cosas que revisar" detalle="lee la lista de abajo" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revision.avisos} vacio="Los minutos caben en tu tiempo y no detecté cifras del mercado, promesas ni vacantes ajenas. Revisa igualmente cada línea: la IA puede equivocarse." />
                      </div>
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Este plan es una propuesta para organizarte, no una garantía de resultados ni asesoría laboral. Ajusta lo que no te sirva y verifica los requisitos de cada aviso en el aviso original.</p>
                  </div>
                )}

                {pestana === "plan" && (
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-surface p-4">
                      <h3 className="flex items-center gap-2 text-base font-semibold">
                        <CalendarPlus aria-hidden className="size-4 text-brand" /> Llévalo a tu calendario
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">Elige el lunes en que empieza la semana 1 y la hora de inicio. Se genera un archivo .ics que abren Google Calendar, Outlook y Apple Calendar; las tareas de un mismo día se ponen una después de otra.</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor="plan-lunes" className="mb-1.5 block text-sm font-semibold">
                            Lunes de la semana 1
                          </label>
                          <input id="plan-lunes" type="date" className="campo" value={lunes} onChange={(e) => setLunes(e.target.value)} aria-invalid={lunes !== "" && !lunesValido} aria-describedby="plan-lunes-ayuda" />
                          <p id="plan-lunes-ayuda" className={`mt-1.5 text-xs ${lunes !== "" && !lunesValido ? "font-medium text-destructive" : "text-muted-foreground"}`} role={lunes !== "" && !lunesValido ? "alert" : undefined}>
                            {lunes !== "" && !lunesValido ? "Esa fecha no es lunes: elige un lunes." : "Debe ser un lunes."}
                          </p>
                        </div>
                        <div>
                          <label htmlFor="plan-hora" className="mb-1.5 block text-sm font-semibold">
                            Hora de inicio de cada día
                          </label>
                          <input id="plan-hora" type="time" className="campo" value={hora} onChange={(e) => setHora(e.target.value)} />
                          <p className="mt-1.5 text-xs text-muted-foreground">Hora local de tu calendario.</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" className="btn btn-primario" onClick={bajarIcs} disabled={!calendario || calendario.eventos.length === 0}>
                          <CalendarPlus aria-hidden className="size-4" /> Descargar calendario (.ics)
                        </button>
                        <button type="button" className="btn btn-secundario" onClick={bajarCsv} disabled={lectura.plan.length === 0}>
                          <Download aria-hidden className="size-4" /> Descargar CSV
                        </button>
                        <button
                          type="button"
                          className="btn btn-secundario"
                          disabled={lectura.plan.length === 0}
                          onClick={async () => {
                            if (await copiarTexto(aTablaPlan(lectura.plan))) {
                              setCopiado("tabla");
                              setTimeout(() => setCopiado(null), 2500);
                              alExportar("tabla");
                              alAviso("Tabla copiada. Pégala en una hoja de Excel o Google Sheets.");
                            }
                          }}
                        >
                          {copiado === "tabla" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                          {copiado === "tabla" ? "Copiada" : "Copiar como tabla"}
                        </button>
                      </div>
                      {calendario && calendario.omitidas.length > 0 && <p className="mt-2 text-xs text-warn">{calendario.omitidas.length} tarea(s) no van al calendario porque no tienen un día o unos minutos válidos.</p>}
                    </div>

                    {lectura.plan.length === 0 ? (
                      <p className="text-sm text-muted-foreground">La respuesta no trae la tabla del plan en formato CSV.</p>
                    ) : (
                      revision.sumas.map((s) => {
                        const filas = lectura.plan.filter((f) => f.semana === s.semana);
                        return (
                          <div key={s.semana} data-semana={s.semana}>
                            <h3 className="flex flex-wrap items-baseline justify-between gap-x-3 text-base font-semibold">
                              <span>Semana {s.semana}</span>
                              <span className={`text-sm font-normal tabular ${s.exceso > 0 ? "font-semibold text-destructive" : "text-muted-foreground"}`} data-suma-semana>
                                {s.minutos} min ({formatoDuracion(s.minutos)}){disponibles !== null ? ` de ${disponibles} disponibles` : ""}
                                {s.exceso > 0 ? ` · te pasas por ${s.exceso} min` : s.libres !== null && s.libres > 0 ? ` · ${s.libres} min libres` : ""}
                              </span>
                            </h3>
                            {filas.length === 0 ? (
                              <p className="mt-2 text-sm text-muted-foreground">Sin tareas.</p>
                            ) : (
                              <div className="mt-2 overflow-x-auto rounded-lg border" role="region" aria-label={`Tareas de la semana ${s.semana}`} tabIndex={0}>
                                <table className="w-full min-w-[34rem] text-left text-sm">
                                  <caption className="sr-only">Tareas de la semana {s.semana} con su entregable y sus minutos</caption>
                                  <thead className="bg-surface">
                                    <tr>
                                      <th scope="col" className="p-2.5 font-semibold">Día</th>
                                      <th scope="col" className="p-2.5 font-semibold">Tarea</th>
                                      <th scope="col" className="p-2.5 font-semibold">Entregable</th>
                                      <th scope="col" className="p-2.5 text-right font-semibold">Min</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {filas.map((f, i) => (
                                      <tr key={`${f.dia}-${i}`}>
                                        <th scope="row" className="p-2.5 text-left font-medium capitalize">{f.dia}</th>
                                        <td className="p-2.5">{f.tarea}</td>
                                        <td className="p-2.5 text-muted-foreground">{f.entregable}</td>
                                        <td className="p-2.5 text-right tabular">{f.minutos ?? "—"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {pestana === "distribucion" && (
                  <div>
                    <h3 className="mb-1 text-base font-semibold">Cómo se reparte tu semana</h3>
                    <p className="mb-3 text-sm text-muted-foreground">La IA propone porcentajes; los minutos los calcula esta página con la fórmula: minutos = {disponibles ?? "disponibles"} × % ÷ 100.</p>
                    {revision.distribucion.filas.length ? (
                      <>
                        <div className="overflow-x-auto rounded-lg border" role="region" aria-label="Distribución semanal" tabIndex={0}>
                          <table className="w-full min-w-[30rem] text-left text-sm" data-distribucion>
                            <caption className="sr-only">Actividades de la semana con su porcentaje, sus minutos y el motivo</caption>
                            <thead className="bg-surface">
                              <tr>
                                <th scope="col" className="p-2.5 font-semibold">Actividad</th>
                                <th scope="col" className="p-2.5 text-right font-semibold">%</th>
                                <th scope="col" className="p-2.5 text-right font-semibold">Minutos</th>
                                <th scope="col" className="p-2.5 font-semibold">Por qué</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {revision.distribucion.filas.map((f) => (
                                <tr key={f.actividad}>
                                  <th scope="row" className="p-2.5 text-left font-medium">{f.actividad}</th>
                                  <td className="p-2.5 text-right tabular">{f.porcentaje ?? "—"}</td>
                                  <td className="p-2.5 text-right tabular" title={f.formula}>{f.minutos ?? "—"}</td>
                                  <td className="p-2.5 text-muted-foreground">{f.porQue}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-surface font-semibold">
                              <tr>
                                <th scope="row" className="p-2.5 text-left">Suma</th>
                                <td className="p-2.5 text-right tabular" data-suma-porcentajes>{revision.distribucion.sumaPorcentajes}</td>
                                <td className="p-2.5 text-right tabular">{disponibles ?? "—"}</td>
                                <td className={`p-2.5 text-sm font-normal ${revision.distribucion.suma100 ? "text-ok" : "text-destructive"}`}>{revision.distribucion.suma100 ? "Suma 100 %." : "No suma 100 %."}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no trae la distribución semanal.</p>
                    )}
                  </div>
                )}

                {pestana === "vacantes" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Criterios para elegir a qué postular</h3>
                      <Lista items={lectura.criterios} vacio="La respuesta no trae criterios." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Prioridad de tus vacantes</h3>
                      {lectura.vacantes.length ? (
                        <ul className="space-y-3" data-vacantes-priorizadas>
                          {lectura.vacantes.map((v) => (
                            <li key={v.vacante} className="tarjeta p-3 text-sm">
                              <p className="flex flex-wrap items-center gap-2 font-semibold">
                                {v.vacante}
                                {v.prioridad && <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PRIORIDAD[v.prioridad]}`}>Prioridad {v.prioridad}</span>}
                                {revision.vacantesAjenas.includes(v.vacante) && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">no es una de tus vacantes</span>}
                              </p>
                              {v.motivo && <p className="mt-1 text-muted-foreground">{v.motivo}</p>}
                              {v.antes && (
                                <p className="text-muted-foreground">
                                  <span className="font-semibold text-foreground">Antes de postular:</span> {v.antes}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay vacantes priorizadas (no escribiste ninguna en el paso 1, o la IA no usó el formato pedido).</p>
                      )}
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Lo que no debo hacer</h3>
                      {lectura.evitar.length ? (
                        <ul className="space-y-2">
                          {lectura.evitar.map((e) => (
                            <li key={e.actividad} className="tarjeta p-3 text-sm">
                              <p className="font-semibold">{e.actividad}</p>
                              {e.porQueParece && <p className="text-muted-foreground">Parece productivo porque: {e.porQueParece}</p>}
                              {e.enSuLugar && <p className="text-muted-foreground">En su lugar: {e.enSuLugar}</p>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">La respuesta no trae esta sección.</p>
                      )}
                    </div>
                  </div>
                )}

                {pestana === "plantillas" && (
                  <div>
                    <p className="mb-3 text-xs text-muted-foreground">Son borradores con marcadores entre corchetes: complétalos con datos reales, cámbialos con tus palabras y no afirmes nada que no sea cierto.</p>
                    {lectura.plantillas.length ? (
                      <ul className="space-y-4" data-plantillas>
                        {lectura.plantillas.map((p) => (
                          <li key={p.numero} className="tarjeta space-y-2 p-4 text-sm" data-plantilla>
                            <p className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-bold text-brand">{p.tipo}</span>
                            </p>
                            {p.situacion && <p className="font-semibold">«{p.situacion}»</p>}
                            <div className="whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 leading-relaxed">{p.texto || "(la IA no escribió el texto)"}</div>
                            {p.cuando && (
                              <p className="text-muted-foreground">
                                <span className="font-semibold text-foreground">Cuándo usarla:</span> {p.cuando}
                              </p>
                            )}
                            <button type="button" className="btn btn-secundario" disabled={!p.texto} onClick={() => copiar(`p${p.numero}`, p.texto, "Plantilla copiada. Complétala antes de enviarla.")} aria-label={`Copiar la plantilla ${p.numero}: ${p.tipo}`}>
                              {copiado === `p${p.numero}` ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                              {copiado === `p${p.numero}` ? "Copiada" : "Copiar plantilla"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 text-[0.8125rem]">{lectura.secciones.plantillas ?? "La respuesta no trae plantillas."}</pre>
                    )}
                  </div>
                )}

                {pestana === "metricas" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Cómo leer tus métricas</h3>
                      <Lista items={lectura.metricas} vacio="La respuesta no trae esta sección." />
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-sm">
                      Estas son hipótesis generales. Tus números reales están en el{" "}
                      <a href="#registro" className="font-medium text-brand underline underline-offset-2">
                        registro de postulaciones
                      </a>
                      : cada postulación que anotes alimenta el embudo y la revisión quincenal.
                    </p>
                  </div>
                )}

                {pestana === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: comprueba tú los requisitos de cada aviso y las fechas límite." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Verificaciones automáticas de la página</h3>
                      <Lista items={revision.avisos} vacio="Los minutos caben en tu tiempo y no detecté cifras del mercado, promesas ni vacantes ajenas." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Empieza por la primera tarea de la semana 1 y registra cada postulación." />
                    </div>
                    {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real.</p>}
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu plan</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta a la izquierda y aparecen los paneles: el calendario de 4 semanas con la suma de minutos, la distribución, las vacantes priorizadas y las plantillas para copiar.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
