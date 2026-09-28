"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Check, ClipboardCopy, Download, FileText, Info, Lightbulb, Printer, Timer } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { imprimirBloque } from "./checklist-dia-previo";
import { Pestanas } from "./pestanas";
import type { PreguntaPractica } from "./practica-cronometrada";
import { hojaATexto, hojaDeEstudio, temasOrdenados } from "@/lib/entrevista/estudio";
import { leerRespuestaEntrevista, type LecturaEntrevista } from "@/lib/entrevista/lector";
import { textoDeFuenteEntrevista } from "@/lib/entrevista/prompt";
import { CATEGORIAS_PREGUNTA, type DatosEntrevista, type Historia } from "@/lib/entrevista/tipos";
import { guionesCompletos, preguntasSinEvidencia, revisarRespuesta } from "@/lib/entrevista/verificar";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  /** Datos con los que se comprueba la respuesta (los del formulario, o los del ejemplo si se pegó una respuesta de ejemplo). */
  referencia: DatosEntrevista;
  historias: Historia[];
  esDeEjemplo: boolean;
  alPracticar: (p: PreguntaPractica) => void;
  alDescargarHoja: (esEjemplo: boolean) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "resumen" | "mapa" | "banco" | "temas" | "informe" | "hoja" | "verificar";

function Tarjeta({ numero, etiqueta, detalle }: { numero: number | string; etiqueta: string; detalle?: string }) {
  return (
    <div className="tarjeta p-4">
      <p className="text-2xl font-bold tabular">{numero}</p>
      <p className="mt-1 text-sm font-medium">{etiqueta}</p>
      {detalle && <p className="mt-0.5 text-xs text-muted-foreground">{detalle}</p>}
    </div>
  );
}

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

const CLASE_NIVEL: Record<string, string> = { alta: "bg-ok-muted text-ok", adecuada: "bg-ok-muted text-ok", media: "bg-warn-muted text-warn", baja: "bg-destructive/15 text-destructive", corta: "bg-warn-muted text-warn", larga: "bg-warn-muted text-warn" };
const claseNivel = (v: string) => CLASE_NIVEL[v.toLowerCase().replace(/\s*\[.*$/, "").trim()] ?? "bg-surface text-foreground";

export function ResultadoEntrevista({ respuesta, alCambiar, referencia, historias, esDeEjemplo, alPracticar, alDescargarHoja, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("resumen");
  const [categoria, setCategoria] = useState("todas");
  const [copiado, setCopiado] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ayudaId = useId();

  const lectura: LecturaEntrevista | null = useMemo(() => (respuesta.trim() ? leerRespuestaEntrevista(respuesta) : null), [respuesta]);
  const valida = Boolean(lectura?.valido);
  const revision = useMemo(() => (lectura?.valido ? revisarRespuesta(lectura, referencia.cv, referencia.oferta, textoDeFuenteEntrevista(referencia)) : null), [lectura, referencia]);
  const hoja = useMemo(() => hojaDeEstudio(referencia, lectura?.valido ? lectura : null, historias), [referencia, lectura, historias]);
  const marcados = useMemo(() => (lectura?.valido ? { guiones: guionesCompletos(lectura.preguntas), sinEvidencia: preguntasSinEvidencia(lectura.preguntas) } : { guiones: [], sinEvidencia: [] }), [lectura]);
  const citasMalas = new Set(revision?.citas.map((c) => c.cita) ?? []);

  const pestanas: { id: IdPestana; etiqueta: string }[] = [{ id: "resumen", etiqueta: "Resumen" }];
  if (lectura && (lectura.mapa.length || lectura.riesgos.length)) pestanas.push({ id: "mapa", etiqueta: "Mapa y riesgos" });
  if (lectura?.preguntas.length || lectura?.secciones.banco) pestanas.push({ id: "banco", etiqueta: "Banco de preguntas" });
  if (lectura && (lectura.temas.length || lectura.entrevistador.length)) pestanas.push({ id: "temas", etiqueta: "Temas y preguntas" });
  if (lectura?.informe) pestanas.push({ id: "informe", etiqueta: "Informe de simulación" });
  pestanas.push({ id: "hoja", etiqueta: "Hoja de estudio" }, { id: "verificar", etiqueta: "Por verificar" });
  const activa: IdPestana = pestanas.some((p) => p.id === pestana) ? pestana : "resumen";

  async function copiarHoja() {
    if (await copiarTexto(hojaATexto(hoja))) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }

  async function bajarHoja() {
    setError(null);
    setExportando(true);
    try {
      const { construirDocumentoSecciones, descargarDocumento } = await import("@/lib/entrevista/docx");
      const doc = await construirDocumentoSecciones(hoja.titulo, hoja.secciones.map((s) => ({ titulo: s.titulo, items: s.items })), esDeEjemplo ? "EJEMPLO ILUSTRATIVO: datos ficticios. Las preguntas son probables, no reales." : "Las preguntas son probables, no las reales de la empresa. No memorices guiones.");
      await descargarDocumento(doc, esDeEjemplo ? "hoja-de-estudio-ejemplo.docx" : "hoja-de-estudio.docx");
      alDescargarHoja(esDeEjemplo);
    } catch {
      setError("No se pudo crear el archivo Word. Recarga la página e inténtalo de nuevo.");
    } finally {
      setExportando(false);
    }
  }

  const preguntasFiltradas = lectura?.preguntas.filter((p) => categoria === "todas" || p.categoria.toLowerCase().startsWith(categoria.toLowerCase())) ?? [];

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-ent" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-ent" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Tu resultado: estudia, practica y prepárate
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pega la respuesta completa de tu IA (el banco de preguntas o el informe de la simulación). La página la separa en paneles, crea tu hoja de estudio y marca lo que no viene de tus datos.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-entrevista" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-entrevista"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nDebe tener los títulos «## Mapa del puesto», «## Riesgos del CV», «## Banco de preguntas»… o «## Informe de simulación»."}
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
                  <p className="font-semibold">Todavía no puedo armar los paneles</p>
                  <p className="mt-1">{lectura.problema}</p>
                  <p className="mt-2">Pega la respuesta completa usando el botón Copiar de tu IA. Si respondió con otro formato, pídele que use exactamente los títulos que indica el prompt.</p>
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
            {!respuesta.trim() && <p className="text-xs text-muted-foreground">Las herramientas de práctica de abajo (cronómetro, grabadora, historias STAR y checklist) funcionan sin la IA.</p>}
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          {valida && lectura && revision ? (
            <div className="aparecer">
              <Pestanas etiqueta="Paneles del resultado" prefijo="ent" pestanas={pestanas} valor={activa} alCambiar={setPestana}>
                {activa === "resumen" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      {lectura.informe ? (
                        <>
                          <Tarjeta numero={lectura.informe.evaluaciones.length} etiqueta="Preguntas evaluadas" />
                          <Tarjeta numero={lectura.informe.debiles.length} etiqueta="Puntos débiles" detalle="a trabajar" />
                          <Tarjeta numero={lectura.informe.plan.length} etiqueta="Ejercicios del plan" />
                        </>
                      ) : (
                        <>
                          <Tarjeta numero={lectura.preguntas.length} etiqueta="Preguntas probables" detalle="no son las reales de la empresa" />
                          <Tarjeta numero={lectura.riesgos.length} etiqueta="Riesgos de tu CV" />
                          <Tarjeta numero={lectura.temas.filter((t) => t.prioridad === "ALTA").length} etiqueta="Temas de prioridad alta" />
                        </>
                      )}
                      <Tarjeta numero={revision.datosNuevos.numeros.length + revision.datosNuevos.nombres.length + revision.citas.length} etiqueta="Datos que no vienen de los tuyos" detalle="deberían ser 0" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revision.avisos} vacio="No detecté datos inventados. Revisa igualmente cada línea: la IA puede equivocarse." />
                      </div>
                    </div>
                  </div>
                )}

                {activa === "mapa" && (
                  <div className="space-y-6">
                    {lectura.mapa.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-base font-semibold">Mapa del puesto</h3>
                        <dl className="space-y-2">
                          {lectura.mapa.map((f, i) => (
                            <div key={f.etiqueta + i} className="tarjeta p-3 text-sm">
                              {f.etiqueta && <dt className="font-semibold">{f.etiqueta}</dt>}
                              <dd className="text-muted-foreground">{f.texto}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                    {lectura.riesgos.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-base font-semibold">Riesgos del CV</h3>
                        <ul className="space-y-3">
                          {lectura.riesgos.map((r) => (
                            <li key={r.tipo + r.texto} className="tarjeta p-3 text-sm">
                              <span className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-bold text-brand">{r.tipo}</span>
                              {r.fragmento && citasMalas.has(r.fragmento) && <span className="ml-2 rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">cita no encontrada</span>}
                              <p className="mt-2 leading-relaxed">{r.texto}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activa === "banco" && (
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <label htmlFor="filtro-categoria" className="text-sm font-semibold">
                        Categoría
                      </label>
                      <select id="filtro-categoria" className="campo w-auto" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option value="todas">Todas ({lectura.preguntas.length})</option>
                        {CATEGORIAS_PREGUNTA.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    {lectura.preguntas.length === 0 ? (
                      <pre className="whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 text-[0.8125rem]">{lectura.secciones.banco}</pre>
                    ) : (
                      <ul className="space-y-3" data-banco>
                        {preguntasFiltradas.map((p) => (
                          <li key={p.numero} className="tarjeta space-y-2 p-4 text-sm" data-pregunta>
                            <p className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-bold text-brand">{p.categoria}</span>
                              <span className="text-xs text-muted-foreground tabular">Pregunta {p.numero}</span>
                              {marcados.sinEvidencia.includes(p.numero) && <span className="rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">sin evidencia en tu CV</span>}
                              {marcados.guiones.includes(p.numero) && <span className="rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">parece un guion</span>}
                            </p>
                            <p className="text-base font-semibold leading-snug">{p.texto}</p>
                            <dl className="space-y-1.5 text-muted-foreground">
                              {p.evalua && (
                                <div>
                                  <dt className="inline font-semibold text-foreground">Qué evalúa: </dt>
                                  <dd className="inline">{p.evalua}</dd>
                                </div>
                              )}
                              {p.experiencia && (
                                <div>
                                  <dt className="inline font-semibold text-foreground">Experiencia real del CV: </dt>
                                  <dd className="inline">{p.experiencia}</dd>
                                </div>
                              )}
                              {p.estructura && (
                                <div>
                                  <dt className="inline font-semibold text-foreground">Estructura sugerida: </dt>
                                  <dd className="inline">{p.estructura}</dd>
                                </div>
                              )}
                              {p.repregunta && (
                                <div>
                                  <dt className="inline font-semibold text-foreground">Repregunta probable: </dt>
                                  <dd className="inline">{p.repregunta}</dd>
                                </div>
                              )}
                            </dl>
                            <button type="button" className="btn btn-secundario" onClick={() => alPracticar({ categoria: p.categoria, texto: p.texto, estructura: p.estructura, experiencia: p.experiencia, repregunta: p.repregunta })} aria-label={`Practicar esta: pregunta ${p.numero}`}>
                              <Timer aria-hidden className="size-4" /> Practicar esta
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activa === "temas" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Temas a estudiar</h3>
                      {lectura.temas.length ? (
                        <ul className="space-y-2">
                          {temasOrdenados(lectura).map((t) => (
                            <li key={t.tema} className="tarjeta flex gap-3 p-3 text-sm">
                              <span className={`h-fit shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${t.prioridad === "ALTA" ? "bg-destructive/15 text-destructive" : t.prioridad === "MEDIA" ? "bg-warn-muted text-warn" : "bg-brand-muted text-brand"}`}>{t.prioridad ?? "—"}</span>
                              <span>
                                <span className="font-semibold">{t.tema}</span>
                                {t.porQue && <span className="text-muted-foreground"> — {t.porQue}</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">La respuesta no trae temas a estudiar.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Preguntas para el entrevistador</h3>
                      <Lista items={lectura.entrevistador} vacio="La respuesta no trae preguntas para el entrevistador." />
                    </div>
                  </div>
                )}

                {activa === "informe" && lectura.informe && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Informe de simulación</h3>
                      {lectura.informe.resumen && <p className="text-sm leading-relaxed">{lectura.informe.resumen}</p>}
                    </div>
                    {lectura.informe.evaluaciones.length > 0 ? (
                      <ul className="space-y-3">
                        {lectura.informe.evaluaciones.map((e) => (
                          <li key={e.pregunta} className="tarjeta space-y-2 p-3 text-sm" data-evaluacion>
                            <p className="font-semibold">
                              {e.pregunta}
                              {e.categoria && <span className="ml-2 font-normal text-muted-foreground">· {e.categoria}</span>}
                            </p>
                            <ul className="flex flex-wrap gap-1.5">
                              {e.criterios.map((c) => (
                                <li key={c.nombre} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${claseNivel(c.valor)}`}>
                                  {c.nombre}: {c.valor}
                                </li>
                              ))}
                            </ul>
                            {e.comentario && <p className="text-muted-foreground">{e.comentario}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 text-[0.8125rem]">{lectura.secciones.informe}</pre>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-base font-semibold">Fortalezas</h3>
                        <Lista items={lectura.informe.fortalezas} vacio="El informe no lista fortalezas." />
                      </div>
                      <div>
                        <h3 className="mb-2 text-base font-semibold">Puntos débiles</h3>
                        <Lista items={lectura.informe.debiles} vacio="El informe no lista puntos débiles." />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Plan de práctica</h3>
                      <Lista items={lectura.informe.plan} vacio="El informe no trae un plan de práctica." />
                      <a href="#practica" className="btn btn-secundario mt-3">
                        <Timer aria-hidden className="size-4" /> Ir a practicar con el cronómetro
                      </a>
                    </div>
                  </div>
                )}

                {activa === "hoja" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold">{hoja.titulo}</h3>
                    <p className="text-sm text-muted-foreground">Se arma con tus datos, la respuesta de la IA y tus historias STAR. Descárgala, cópiala o imprímela para estudiar.</p>
                    <div className="space-y-4" data-hoja>
                      {hoja.secciones.map((s) => (
                        <div key={s.titulo}>
                          <p className="text-sm font-semibold">{s.titulo}</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {s.items.map((i) => (
                              <li key={i}>{i}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn btn-primario" onClick={bajarHoja} disabled={exportando}>
                        <Download aria-hidden className="size-4" /> {exportando ? "Creando el archivo…" : "Descargar hoja de estudio (.docx)"}
                      </button>
                      <button type="button" className="btn btn-secundario" onClick={copiarHoja}>
                        {copiado ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                        {copiado ? "Hoja copiada" : "Copiar como texto"}
                      </button>
                      <button type="button" className="btn btn-secundario" onClick={() => imprimirBloque("imprimiendo-entrevista-hoja")}>
                        <Printer aria-hidden className="size-4" /> Imprimir hoja
                      </button>
                    </div>
                    {error && (
                      <p role="alert" className="text-sm font-medium text-destructive">
                        {error}
                      </p>
                    )}
                  </div>
                )}

                {activa === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: comprueba tú lo que sea de la empresa o del puesto en fuentes oficiales." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Verificaciones automáticas de la página</h3>
                      <Lista items={revision.avisos} vacio="No detecté datos inventados en la respuesta." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Completa los huecos con datos reales y practica con el cronómetro." />
                    </div>
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu entrenamiento</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta a la izquierda y aparecen los paneles: mapa del puesto, riesgos del CV, banco de preguntas con «Practicar esta», temas a estudiar y tu hoja de estudio.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
