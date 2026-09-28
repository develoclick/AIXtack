"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Check, ClipboardCopy, FileText, Info, Lightbulb } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { Pestanas } from "@/components/entrevista/pestanas";
import { leerRespuestaSalario, type LecturaSalario } from "@/lib/salario/lector";
import type { DatosSalario } from "@/lib/salario/tipos";
import { respuestasQueRevelanElMinimo, revisarRespuesta } from "@/lib/salario/verificar";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  /** Datos con los que se comprueba la respuesta (los del formulario, o los del ejemplo si se pegó una respuesta de ejemplo). */
  referencia: DatosSalario;
  esDeEjemplo: boolean;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "resumen" | "oferta" | "cifras" | "respuestas" | "margen" | "checklist" | "verificar";

const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "oferta", etiqueta: "Oferta y preguntas" },
  { id: "cifras", etiqueta: "Cifras y argumentos" },
  { id: "respuestas", etiqueta: "Respuestas preparadas" },
  { id: "margen", etiqueta: "Si no hay margen" },
  { id: "checklist", etiqueta: "Checklist" },
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

export function ResultadoSalario({ respuesta, alCambiar, referencia, esDeEjemplo, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("resumen");
  const [copiado, setCopiado] = useState<string | null>(null);
  const [marcados, setMarcados] = useState<{ origen: string; ids: number[] }>({ origen: "", ids: [] });
  const ayudaId = useId();

  const lectura: LecturaSalario | null = useMemo(() => (respuesta.trim() ? leerRespuestaSalario(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarRespuesta(lectura, referencia) : null), [lectura, referencia]);
  const revelan = useMemo(() => (lectura?.valido ? respuestasQueRevelanElMinimo(referencia, lectura) : []), [lectura, referencia]);
  const citasMalas = new Set(revision?.citasFalsas.map((c) => c.cita) ?? []);
  const hechos = marcados.origen === respuesta ? marcados.ids : [];

  async function copiar(clave: string, texto: string, aviso: string) {
    if (await copiarTexto(texto)) {
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2500);
      alAviso(aviso);
    }
  }

  const alternar = (i: number) => setMarcados({ origen: respuesta, ids: hechos.includes(i) ? hechos.filter((x) => x !== i) : [...hechos, i] });
  const valida = Boolean(lectura?.valido);

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-sal" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-sal" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Tu resultado: argumentos, respuestas y guion
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pega la respuesta completa de tu IA. La página la separa en paneles, convierte las respuestas preparadas en tarjetas que puedes copiar y marca cualquier cifra que no venga de tus datos.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-salario" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-salario"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nDebe tener los títulos «## Revisión de la oferta», «## Preguntas al reclutador», «## Argumentos», «## Respuestas preparadas»…"}
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
            {!respuesta.trim() && <p className="text-xs text-muted-foreground">Este paso es opcional: el valor anual, el comparador y la guía de tus tres cifras de arriba ya funcionan sin la IA.</p>}
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          {valida && lectura && revision ? (
            <div className="aparecer">
              <Pestanas etiqueta="Paneles del resultado" prefijo="sal" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "resumen" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <Tarjeta numero={lectura.preguntas.length} etiqueta="Preguntas al reclutador" />
                      <Tarjeta numero={lectura.argumentos.length} etiqueta="Argumentos" detalle="con su evidencia" />
                      <Tarjeta numero={lectura.respuestas.length} etiqueta="Respuestas preparadas" detalle="listas para copiar" />
                      <Tarjeta numero={revision.cifras.montos.length + (revelan.length ? 1 : 0)} etiqueta="Cifras o riesgos a revisar" detalle="deberían ser 0" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revision.avisos} vacio="No detecté cifras de mercado ni datos ajenos. Revisa igualmente cada línea: la IA puede equivocarse." />
                      </div>
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
                      Esto es una ayuda para preparar tu conversación, no asesoría laboral, legal ni tributaria. Verifica los impuestos, los aportes y las condiciones de tu contrato en fuentes oficiales y, si tienes dudas, con un profesional.
                    </p>
                  </div>
                )}

                {pestana === "oferta" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Revisión de la oferta</h3>
                      <Lista items={lectura.oferta} vacio="La respuesta no trae una revisión de la oferta." />
                    </div>
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold">Preguntas al reclutador</h3>
                        <button type="button" className="btn btn-secundario" disabled={!lectura.preguntas.length} onClick={() => copiar("preguntas", lectura.preguntas.map((p, i) => `${i + 1}. ${p}`).join("\n"), "Preguntas copiadas.")}>
                          {copiado === "preguntas" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                          {copiado === "preguntas" ? "Copiadas" : "Copiar preguntas"}
                        </button>
                      </div>
                      <Lista items={lectura.preguntas} vacio="La respuesta no trae preguntas para el reclutador." />
                    </div>
                  </div>
                )}

                {pestana === "cifras" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Coherencia de mis cifras</h3>
                      <Lista items={lectura.cifras} vacio="La respuesta no trae una evaluación de tus cifras." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Argumentos</h3>
                      {lectura.argumentos.length ? (
                        <ol className="space-y-3" data-argumentos>
                          {lectura.argumentos.map((a, i) => (
                            <li key={a.argumento + i} className="tarjeta p-3 text-sm">
                              <p className="font-semibold">
                                {i + 1}. {a.argumento}
                              </p>
                              {a.evidencia && (
                                <p className="mt-1 text-muted-foreground">
                                  <span className="font-semibold text-foreground">Evidencia:</span> {a.evidencia}
                                  {[...citasMalas].some((c) => a.evidencia.includes(c)) && <span className="ml-2 rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">cita no encontrada en tus datos</span>}
                                </p>
                              )}
                              {a.relacion && (
                                <p className="text-muted-foreground">
                                  <span className="font-semibold text-foreground">Relación con el puesto:</span> {a.relacion}
                                </p>
                              )}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-muted-foreground">La respuesta no trae argumentos.</p>
                      )}
                    </div>
                  </div>
                )}

                {pestana === "respuestas" && (
                  <div>
                    <p className="mb-3 text-xs text-muted-foreground">Son borradores: léelos, cámbialos con tus palabras y verifica que todo sea verdad antes de usarlos. No las memorices.</p>
                    {lectura.respuestas.length ? (
                      <ul className="space-y-4" data-respuestas>
                        {lectura.respuestas.map((r) => (
                          <li key={r.numero} className="tarjeta space-y-2 p-4 text-sm" data-respuesta>
                            <p className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-bold text-brand">{r.tipo}</span>
                              {revelan.includes(r.numero) && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">menciona tu mínimo</span>}
                            </p>
                            {r.situacion && <p className="font-semibold">«{r.situacion}»</p>}
                            <div className="whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 leading-relaxed" data-texto-respuesta>
                              {r.texto || "(la IA no escribió el texto)"}
                            </div>
                            {r.cuando && (
                              <p className="text-muted-foreground">
                                <span className="font-semibold text-foreground">Cuándo usarla:</span> {r.cuando}
                              </p>
                            )}
                            <button type="button" className="btn btn-secundario" disabled={!r.texto} onClick={() => copiar(`r${r.numero}`, r.texto, "Respuesta copiada. Revísala antes de usarla.")} aria-label={`Copiar la respuesta ${r.numero}: ${r.tipo}`}>
                              {copiado === `r${r.numero}` ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                              {copiado === `r${r.numero}` ? "Copiada" : "Copiar respuesta"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 text-[0.8125rem]">{lectura.secciones.respuestas ?? "La respuesta no trae respuestas preparadas."}</pre>
                    )}
                  </div>
                )}

                {pestana === "margen" && (
                  <div>
                    <h3 className="mb-2 text-base font-semibold">Si no hay margen en el fijo</h3>
                    {lectura.margen.length ? (
                      <ul className="space-y-2">
                        {lectura.margen.map((m) => (
                          <li key={m.elemento} className="tarjeta p-3 text-sm">
                            <p className="font-semibold">{m.elemento}</p>
                            {m.porQue && <p className="text-muted-foreground">{m.porQue}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no trae alternativas.</p>
                    )}
                  </div>
                )}

                {pestana === "checklist" && (
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold">Checklist antes de aceptar</h3>
                      <button type="button" className="btn btn-secundario" disabled={!lectura.checklist.length} onClick={() => copiar("checklist", lectura.checklist.map((c) => `☐ ${c}`).join("\n"), "Checklist copiada.")}>
                        {copiado === "checklist" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                        {copiado === "checklist" ? "Copiada" : "Copiar checklist"}
                      </button>
                    </div>
                    {lectura.checklist.length ? (
                      <>
                        <p className="mb-2 text-sm font-semibold tabular" data-progreso-checklist>
                          {hechos.length} de {lectura.checklist.length} listos
                        </p>
                        <ul className="space-y-1">
                          {lectura.checklist.map((c, i) => (
                            <li key={c}>
                              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md py-2 text-sm leading-snug hover:bg-surface">
                                <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" checked={hechos.includes(i)} onChange={() => alternar(i)} />
                                <span className={hechos.includes(i) ? "text-muted-foreground line-through" : ""}>{c}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no trae una checklist.</p>
                    )}
                  </div>
                )}

                {pestana === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: comprueba tú los impuestos, el contrato y las condiciones en fuentes oficiales." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Verificaciones automáticas de la página</h3>
                      <Lista items={revision.avisos} vacio="No detecté cifras de mercado ni datos ajenos en la respuesta." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Envía tus preguntas al reclutador antes de dar una cifra." />
                    </div>
                    {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real.</p>}
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu preparación</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta a la izquierda y aparecen los paneles: revisión de la oferta, preguntas, tus argumentos, las respuestas preparadas para copiar y la checklist.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
