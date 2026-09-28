"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowRight, Check, ClipboardCopy, Download, FileText, Info, Lightbulb, RotateCcw } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { Pestanas } from "@/components/entrevista/pestanas";
import { ControlPesos } from "./control-pesos";
import { calcularPuntaje, decidir, type Decision } from "@/lib/analisis/calculo";
import { aCsv, aTabla } from "@/lib/analisis/exportar";
import { leerRespuestaAnalisis, type LecturaAnalisis } from "@/lib/analisis/lector";
import { destinoTieneDatos, llevarA, RUTAS_TRASPASO, type DestinoTraspaso } from "@/lib/analisis/traspaso";
import { ESTADOS, type DatosAnalisis, type EstadoRequisito, type Requisito, type TipoRequisito } from "@/lib/analisis/tipos";
import { revisarRespuesta } from "@/lib/analisis/verificar";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  /** Datos con los que se comprueba la respuesta (los del formulario, o los del ejemplo si se pegó una respuesta de ejemplo). */
  referencia: DatosAnalisis;
  esDeEjemplo: boolean;
  /** Solo con datos propios se pueden llevar el CV y las brechas a otras herramientas (con datos de ejemplo no). */
  puedeLlevar: boolean;
  alExportar: (tipo: "csv" | "tabla") => void;
  alLlevar: (destino: DestinoTraspaso) => void;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "resumen" | "tabla" | "palabras" | "fortalezas" | "plan" | "verificar";

const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "tabla", etiqueta: "Tabla de requisitos" },
  { id: "palabras", etiqueta: "Palabras clave" },
  { id: "fortalezas", etiqueta: "Fortalezas y brechas" },
  { id: "plan", etiqueta: "Plan de acción" },
  { id: "verificar", etiqueta: "Por verificar" },
];

const CLASE_ESTADO: Record<EstadoRequisito, string> = {
  CUMPLE: "bg-ok-muted text-ok",
  PARCIAL: "bg-warn-muted text-warn",
  "NO IDENTIFICADO": "bg-destructive/15 text-destructive",
  "NO EVALUABLE": "bg-surface text-muted-foreground",
};

const CLASE_SEMAFORO: Record<Decision["nivel"], string> = {
  postula: "border-ok/50 bg-ok-muted",
  ajustando: "border-warn/50 bg-warn-muted",
  "si-cumples": "border-destructive/40 bg-destructive/10",
};

const TIPOS: TipoRequisito[] = ["OBLIGATORIO", "DESEABLE", "NO ESPECIFICADO"];
const decimal = (n: number) => n.toFixed(2);

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

interface Cambios {
  origen: string;
  mapa: Record<string, { estado?: EstadoRequisito; tipo?: TipoRequisito }>;
}

const SIN_CAMBIOS: Cambios["mapa"] = {};

export function ResultadoAnalisis({ respuesta, alCambiar, referencia, esDeEjemplo, puedeLlevar, alExportar, alLlevar, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("resumen");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [cambios, setCambios] = useState<Cambios>({ origen: "", mapa: {} });
  const [ajuste, setAjuste] = useState<{ origen: number; valor: number } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [confirmar, setConfirmar] = useState<DestinoTraspaso | null>(null);
  const [errorLlevar, setErrorLlevar] = useState<string | null>(null);
  const ayudaId = useId();

  const lectura: LecturaAnalisis | null = useMemo(() => (respuesta.trim() ? leerRespuestaAnalisis(respuesta) : null), [respuesta]);
  const mapaCambios = useMemo(() => (cambios.origen === respuesta ? cambios.mapa : SIN_CAMBIOS), [cambios, respuesta]);
  const requisitos: Requisito[] = useMemo(() => (lectura?.requisitos ?? []).map((r) => ({ ...r, ...mapaCambios[r.id] })), [lectura, mapaCambios]);
  const peso = ajuste && ajuste.origen === referencia.pesoObligatorio ? ajuste.valor : referencia.pesoObligatorio;
  const puntaje = useMemo(() => calcularPuntaje(requisitos, peso), [requisitos, peso]);
  const decision = useMemo(() => decidir(requisitos), [requisitos]);
  const revision = useMemo(() => (lectura?.valido ? revisarRespuesta(lectura, referencia) : null), [lectura, referencia]);
  const categorias = [...new Set(requisitos.map((r) => r.categoria))];
  const filtrados = requisitos.filter((r) => (filtroEstado === "todos" || r.estado === filtroEstado) && (filtroCategoria === "todas" || r.categoria === filtroCategoria));
  const editados = Object.keys(mapaCambios).length;
  // El deslizador solo importa si hay al menos dos grupos con requisitos evaluables (no depende del peso elegido).
  const sinPeso = referencia.distingue === "no" || puntaje.grupos.filter((g) => g.evaluables.length > 0).length < 2;

  function cambiar(id: string, c: { estado?: EstadoRequisito; tipo?: TipoRequisito }) {
    setCambios({ origen: respuesta, mapa: { ...mapaCambios, [id]: { ...mapaCambios[id], ...c } } });
  }

  function restablecer(id?: string) {
    if (!id) return setCambios({ origen: respuesta, mapa: {} });
    const { [id]: _quitado, ...resto } = mapaCambios;
    void _quitado;
    setCambios({ origen: respuesta, mapa: resto });
  }

  function descargarCsv() {
    const blob = new Blob([aCsv(requisitos, peso)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = esDeEjemplo ? "analisis-requisitos-EJEMPLO.csv" : "analisis-requisitos.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    alExportar("csv");
    alAviso(esDeEjemplo ? "Descargado: analisis-requisitos-EJEMPLO.csv (datos de ejemplo)" : "CSV descargado. Ábrelo con Excel o Google Sheets.");
  }

  async function copiarTabla() {
    if (await copiarTexto(aTabla(requisitos, peso))) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
      alExportar("tabla");
      alAviso("Tabla copiada. Pégala en una hoja de Excel o Google Sheets.");
    }
  }

  function llevar(destino: DestinoTraspaso) {
    setErrorLlevar(null);
    if (!llevarA(destino, { cv: referencia.cv, oferta: referencia.oferta }, requisitos)) {
      setErrorLlevar("No pude guardar los datos en tu navegador. Copia tu CV y la oferta y pégalos en la otra herramienta.");
      return;
    }
    alLlevar(destino);
    window.location.assign(`${RUTAS_TRASPASO[destino]}#paso-1`);
  }

  function pedirLlevar(destino: DestinoTraspaso) {
    if (destinoTieneDatos(destino)) setConfirmar(destino);
    else llevar(destino);
  }

  const valida = Boolean(lectura?.valido);
  const plan = (area: string) => (lectura?.plan ?? []).filter((a) => a.area === area);

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-ana" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-ana" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Tu resultado: tabla, porcentaje y plan
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pega la respuesta completa de tu IA. La página lee la tabla de requisitos y recalcula el porcentaje en tu navegador, con la fórmula a la vista, para que no dependa de la aritmética de la IA.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-analisis" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-analisis"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nDebe tener los títulos «## Requisitos» (con la tabla en CSV), «## Palabras clave faltantes», «## Plan de acción»…"}
            spellCheck={false}
            aria-describedby={ayudaId}
            aria-invalid={lectura ? !lectura.valido : undefined}
          />
          <p id={ayudaId} className="mt-2 flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <Lightbulb aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <strong className="font-semibold text-foreground">Tip:</strong> usa el botón Copiar de tu IA pegando todo el bloque. Si no aparecen los paneles, pega la respuesta completa usando el botón Copiar de tu IA en lugar de seleccionar el texto.
            </span>
          </p>

          <div role="status" aria-live="polite" className="mt-3 space-y-3">
            {lectura && !lectura.valido && (
              <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                <div>
                  <p className="font-semibold">Todavía no puedo leer la tabla</p>
                  <p className="mt-1">{lectura.problema}</p>
                  <p className="mt-2">Pega la respuesta completa usando el botón Copiar de tu IA. Si respondió con otro formato, pídele que use exactamente los títulos y la cabecera que indica el prompt.</p>
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
              <Pestanas etiqueta="Paneles del resultado" prefijo="ana" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "resumen" && (
                  <div className="space-y-5">
                    <div className="tarjeta p-4" data-puntaje>
                      <p className="text-sm text-muted-foreground">Alineación orientativa entre tu CV y la oferta</p>
                      <p className="mt-1 text-5xl font-bold tabular" data-porcentaje>
                        {puntaje.porcentaje === null ? "—" : `${puntaje.porcentaje} %`}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        No es tu probabilidad de ser contratado ni garantiza pasar un ATS: mide cuánta evidencia hay <em>en tu CV</em> para los requisitos del anuncio.
                      </p>
                      <div className="mt-4 rounded-lg border bg-surface p-3 text-sm">
                        <p className="font-semibold">Cómo se calculó</p>
                        <p className="mt-1 text-muted-foreground">
                          Cada requisito vale <strong className="text-foreground">1</strong> si CUMPLE, <strong className="text-foreground">0.5</strong> si es PARCIAL y <strong className="text-foreground">0</strong> si no está identificado; NO EVALUABLE se excluye. Se promedia cada grupo y se combinan los promedios con su peso.
                        </p>
                        <p className="mt-2 break-words font-mono text-[0.8125rem] tabular" data-formula>
                          {puntaje.formula}
                        </p>
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full min-w-[22rem] text-left text-xs tabular">
                            <caption className="sr-only">Grupos del cálculo: peso, requisitos evaluables y promedio</caption>
                            <thead>
                              <tr>
                                <th scope="col" className="py-1.5 pr-3">Grupo</th>
                                <th scope="col" className="py-1.5 pr-3 text-right">Peso</th>
                                <th scope="col" className="py-1.5 pr-3 text-right">Evaluables</th>
                                <th scope="col" className="py-1.5 text-right">Promedio</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {puntaje.grupos.filter((g) => g.evaluables.length > 0).map((g) => (
                                <tr key={g.tipo}>
                                  <th scope="row" className="py-1.5 pr-3 font-normal">{g.tipo === "OBLIGATORIO" ? "Obligatorios" : g.tipo === "DESEABLE" ? "Deseables" : "No especificados"}</th>
                                  <td className="py-1.5 pr-3 text-right">{decimal(g.peso)}</td>
                                  <td className="py-1.5 pr-3 text-right">{g.evaluables.length}</td>
                                  <td className="py-1.5 text-right">{g.promedio === null ? "—" : decimal(g.promedio)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {puntaje.excluidos > 0 && <p className="mt-2 text-xs text-muted-foreground">{puntaje.excluidos} requisito(s) NO EVALUABLE(S) quedaron fuera del cálculo.</p>}
                      </div>
                      <div className="mt-4">
                        <ControlPesos valor={peso} alCambiar={(v) => setAjuste({ origen: referencia.pesoObligatorio, valor: v })} deshabilitado={sinPeso} />
                      </div>
                    </div>

                    {decision && (
                      <div className={`rounded-lg border p-4 ${CLASE_SEMAFORO[decision.nivel]}`} data-semaforo={decision.nivel}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Semáforo de decisión</p>
                        <p className="mt-1 text-xl font-bold">{decision.titulo}</p>
                        <p className="mt-2 text-sm leading-relaxed">{decision.explicacion}</p>
                        {decision.claves.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                            {decision.claves.map((r) => (
                              <li key={r.id}>{r.requisito}</li>
                            ))}
                          </ul>
                        )}
                        <details className="mt-3 text-sm">
                          <summary className="flex min-h-11 cursor-pointer items-center font-semibold">Ver la regla del semáforo</summary>
                          <p className="mt-1 leading-relaxed text-muted-foreground">{decision.regla}</p>
                        </details>
                      </div>
                    )}

                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-conteo>
                      {ESTADOS.map((e) => (
                        <li key={e.estado} className="tarjeta p-3">
                          <p className="text-2xl font-bold tabular">{puntaje.porEstado[e.estado]}</p>
                          <p className="text-xs font-medium">{e.etiqueta}</p>
                        </li>
                      ))}
                    </ul>

                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revision.avisos} vacio="No detecté citas falsas ni datos ajenos. Revisa igualmente cada estado: la IA puede equivocarse." />
                      </div>
                    </div>
                  </div>
                )}

                {pestana === "tabla" && (
                  <div>
                    <div className="mb-3 flex flex-wrap items-end gap-3">
                      <div>
                        <label htmlFor="filtro-estado" className="mb-1 block text-xs font-semibold">
                          Estado
                        </label>
                        <select id="filtro-estado" className="campo w-auto" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                          <option value="todos">Todos ({requisitos.length})</option>
                          {ESTADOS.map((e) => (
                            <option key={e.estado} value={e.estado}>
                              {e.etiqueta} ({puntaje.porEstado[e.estado]})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="filtro-categoria" className="mb-1 block text-xs font-semibold">
                          Categoría
                        </label>
                        <select id="filtro-categoria" className="campo w-auto" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                          <option value="todas">Todas</option>
                          {categorias.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      {editados > 0 && (
                        <button type="button" className="btn btn-texto" onClick={() => restablecer()}>
                          <RotateCcw aria-hidden className="size-4" /> Restablecer los {editados} cambio(s)
                        </button>
                      )}
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Si no estás de acuerdo con la IA, cambia el tipo o el estado de una fila y el porcentaje se recalcula. Mostrando <span className="tabular">{filtrados.length}</span> de <span className="tabular">{requisitos.length}</span> requisitos.
                    </p>
                    <div className="overflow-x-auto rounded-xl border" role="region" aria-label="Tabla de requisitos" tabIndex={0}>
                      <table className="w-full min-w-[40rem] text-left text-sm" data-tabla-requisitos>
                        <caption className="sr-only">Requisitos de la oferta con su categoría, tipo, estado y la evidencia del CV</caption>
                        <thead className="bg-surface">
                          <tr>
                            <th scope="col" className="p-3 font-semibold">Requisito</th>
                            <th scope="col" className="p-3 font-semibold">Categoría</th>
                            <th scope="col" className="p-3 font-semibold">Tipo</th>
                            <th scope="col" className="p-3 font-semibold">Estado</th>
                            <th scope="col" className="p-3 font-semibold">Evidencia en tu CV</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filtrados.map((r) => {
                            const cambiado = Boolean(mapaCambios[r.id]);
                            return (
                              <tr key={r.id} data-requisito className={cambiado ? "bg-brand-muted/50" : ""}>
                                <th scope="row" className="p-3 text-left align-top font-medium">
                                  {r.requisito}
                                  {cambiado && (
                                    <button type="button" className="ml-2 text-xs font-semibold text-brand underline underline-offset-2" onClick={() => restablecer(r.id)} aria-label={`Restablecer el cambio en «${r.requisito}»`}>
                                      editado · restablecer
                                    </button>
                                  )}
                                </th>
                                <td className="p-3 align-top text-muted-foreground">{r.categoria}</td>
                                <td className="p-3 align-top">
                                  <select className="campo min-w-36 text-xs" aria-label={`Tipo de «${r.requisito}»`} value={r.tipo ?? ""} onChange={(e) => cambiar(r.id, { tipo: e.target.value as TipoRequisito })}>
                                    {r.tipo === null && <option value="">(sin reconocer)</option>}
                                    {TIPOS.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="p-3 align-top">
                                  <select className={`campo min-w-40 text-xs font-semibold ${r.estado ? CLASE_ESTADO[r.estado] : ""}`} aria-label={`Estado de «${r.requisito}»`} value={r.estado ?? ""} onChange={(e) => cambiar(r.id, { estado: e.target.value as EstadoRequisito })}>
                                    {r.estado === null && <option value="">(sin reconocer)</option>}
                                    {ESTADOS.map((e) => (
                                      <option key={e.estado} value={e.estado}>
                                        {e.estado}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="p-3 align-top text-muted-foreground">{r.evidencia}</td>
                              </tr>
                            );
                          })}
                          {filtrados.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                Ningún requisito coincide con los filtros.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="btn btn-secundario" onClick={descargarCsv}>
                        <Download aria-hidden className="size-4" /> Descargar CSV (Excel)
                      </button>
                      <button type="button" className="btn btn-secundario" onClick={copiarTabla}>
                        {copiado ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                        {copiado ? "Tabla copiada" : "Copiar como tabla"}
                      </button>
                    </div>
                  </div>
                )}

                {pestana === "palabras" && (
                  <div>
                    <h3 className="mb-1 text-base font-semibold">Palabras clave de la oferta que no aparecen literalmente en tu CV</h3>
                    <p className="mb-3 text-xs text-muted-foreground">Coincidir con una palabra no es ser competente: úsala solo si describe algo que de verdad hiciste.</p>
                    {lectura.palabras.length ? (
                      <ul className="space-y-2" data-palabras>
                        {lectura.palabras.map((p) => (
                          <li key={p.palabra} className="tarjeta p-3 text-sm">
                            <p className="font-semibold">
                              {p.palabra}{" "}
                              <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${p.sinEquivalente ? "bg-destructive/15 text-destructive" : "bg-ok-muted text-ok"}`}>{p.sinEquivalente ? "sin equivalente en tu CV" : "hay un equivalente"}</span>
                            </p>
                            {!p.sinEquivalente && <p className="mt-1 text-muted-foreground">En tu CV: {p.equivalente}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no lista palabras clave faltantes.</p>
                    )}
                  </div>
                )}

                {pestana === "fortalezas" && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Fortalezas</h3>
                      <Lista items={lectura.fortalezas} vacio="La respuesta no lista fortalezas." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Brechas</h3>
                      <Lista items={lectura.brechas} vacio="La respuesta no lista brechas." />
                    </div>
                  </div>
                )}

                {pestana === "plan" && (
                  <div className="space-y-5">
                    {(["CV", "ENTREVISTA", "APRENDER", "OTRO"] as const).map((area) =>
                      plan(area).length ? (
                        <div key={area}>
                          <h3 className="mb-2 text-base font-semibold">{area === "CV" ? "Qué ajustar en tu CV (sin inventar)" : area === "ENTREVISTA" ? "Qué preparar para la entrevista" : area === "APRENDER" ? "Qué aprender o practicar" : "Otras acciones"}</h3>
                          <Lista items={plan(area).map((a) => a.texto)} vacio="" />
                        </div>
                      ) : null,
                    )}
                    {lectura.plan.length === 0 && <p className="text-sm text-muted-foreground">La respuesta no trae un plan de acción.</p>}
                    <div className="rounded-lg border bg-surface p-4">
                      <h3 className="text-base font-semibold">Llevar tus brechas a otra herramienta</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Abre la otra herramienta con tu CV y la oferta ya pegados. En «Preparar entrevista», tus brechas pasan a «Temas que te preocupan». Todo ocurre en tu navegador.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" className="btn btn-secundario" disabled={!puedeLlevar} onClick={() => pedirLlevar("optimizar")}>
                          Llevar a Optimizar CV <ArrowRight aria-hidden className="size-4" />
                        </button>
                        <button type="button" className="btn btn-secundario" disabled={!puedeLlevar} onClick={() => pedirLlevar("entrevista")}>
                          Llevar a Preparar entrevista <ArrowRight aria-hidden className="size-4" />
                        </button>
                      </div>
                      {!puedeLlevar && <p className="mt-2 text-xs text-muted-foreground">Con datos de ejemplo no se lleva nada a otras herramientas: usa tu propio CV y tu propia oferta.</p>}
                      {confirmar && (
                        <div role="group" aria-label="Confirmación" className="aparecer mt-3 rounded-lg border border-warn/50 bg-warn-muted p-3 text-sm">
                          <p className="font-medium">Esa herramienta ya tiene un CV o una oferta guardados. ¿Reemplazarlos con los de este análisis?</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button type="button" className="btn btn-primario" onClick={() => llevar(confirmar)} autoFocus>
                              Reemplazar y continuar
                            </button>
                            <button type="button" className="btn btn-secundario" onClick={() => setConfirmar(null)}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                      {errorLlevar && (
                        <p role="alert" className="mt-2 text-sm font-medium text-destructive">
                          {errorLlevar}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {pestana === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">A verificar</h3>
                      <Lista items={lectura.aVerificar} vacio="La respuesta no lista puntos a verificar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: comprueba tú cada estado con tu CV y con la oferta original." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Verificaciones automáticas de la página</h3>
                      <Lista items={revision.avisos} vacio="No detecté citas falsas ni datos ajenos en la respuesta." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Ajusta tu CV con lo que sea cierto y vuelve a comparar." />
                    </div>
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu comparación</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta a la izquierda y aparecen el porcentaje orientativo con su fórmula, el semáforo de decisión, la tabla filtrable de requisitos, las palabras clave y tu plan de acción.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
