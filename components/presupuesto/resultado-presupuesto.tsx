"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AlertTriangle, Check, ClipboardCopy, FileText, Info, Lightbulb, Plus } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { calcular, formatoPorcentaje } from "@/lib/presupuesto/calculo";
import { leerRespuestaPresupuesto, type LecturaPresupuesto } from "@/lib/presupuesto/lector";
import { textoDeFuente } from "@/lib/presupuesto/prompt";
import { categoriaPorId, nuevoIdLinea, type DatosPresupuesto, type Linea } from "@/lib/presupuesto/tipos";
import { cifrasNuevas, faltantesConPrecio, lineaDeFalta, yaEstaEnLaTabla } from "@/lib/presupuesto/verificar";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  /** Datos con los que se comprueba la respuesta (los del formulario, o los del ejemplo si se pegó una respuesta de ejemplo). */
  referencia: DatosPresupuesto;
  esDeEjemplo: boolean;
  /** false cuando la respuesta analizada no corresponde al formulario actual: no se pueden añadir líneas a la tabla de la persona. */
  puedeAgregar: boolean;
  alAgregar: (lineas: Linea[], mensaje: string) => void;
  accionesDeEjemplo: ReactNode;
}

const PESTAÑAS = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "coherencia", etiqueta: "Coherencia" },
  { id: "faltan", etiqueta: "Gastos que faltan" },
  { id: "ahorro", etiqueta: "Necesidades y ahorro" },
  { id: "margen", etiqueta: "Margen" },
  { id: "antes", etiqueta: "Antes de reservar" },
  { id: "verificar", etiqueta: "Por verificar" },
] as const;
type IdPestaña = (typeof PESTAÑAS)[number]["id"];

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

export function ResultadoPresupuesto({ respuesta, alCambiar, referencia, esDeEjemplo, puedeAgregar, alAgregar, accionesDeEjemplo }: Props) {
  const [pestaña, setPestaña] = useState<IdPestaña>("resumen");
  const [copiado, setCopiado] = useState<string | null>(null);
  const ayudaId = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const lectura: LecturaPresupuesto | null = useMemo(() => (respuesta.trim() ? leerRespuestaPresupuesto(respuesta) : null), [respuesta]);
  const calculo = useMemo(() => calcular(referencia), [referencia]);
  const analisis = useMemo(() => {
    if (!lectura?.valido) return null;
    return { cifras: cifrasNuevas(respuesta, textoDeFuente(referencia)), conPrecio: faltantesConPrecio(lectura.faltan) };
  }, [lectura, respuesta, referencia]);

  const pendientesDeAñadir = lectura?.valido ? lectura.faltan.filter((f) => !yaEstaEnLaTabla(f, referencia)) : [];
  const revisar: string[] = [];
  if (lectura?.valido && analisis) {
    if (analisis.cifras.montos.length) revisar.push(`La respuesta menciona montos que no están en tus datos ni en los cálculos de la página: ${analisis.cifras.montos.join(", ")}. La IA no debía inventar precios: no los uses sin comprobarlos.`);
    if (analisis.cifras.porcentajes.length) revisar.push(`Menciona porcentajes que no están en tus datos: ${analisis.cifras.porcentajes.join(", ")}. Si es una recomendación, contrástala; si es una tasa o un precio, no la uses.`);
    if (analisis.conPrecio.length) revisar.push(`En «Gastos que faltan», estos ítems traen una cifra (se pidió no poner precios): ${analisis.conPrecio.join("; ")}.`);
    if (pendientesDeAñadir.length) revisar.push(`Hay ${pendientesDeAñadir.length} gasto(s) sugerido(s) que todavía no están en tu tabla: revísalos en «Gastos que faltan».`);
    if (calculo.escenarios.intermedio.subtotal > 0 && calculo.pctImprevistos < calculo.margenReferencia.minimo) revisar.push(`Tu margen de imprevistos (${calculo.pctImprevistos} %) está por debajo de la referencia práctica de esta página para tu proporción de gastos estimados (${calculo.margenReferencia.texto}).`);
    if (lectura.verificar.length) revisar.push(`La IA pide verificar ${lectura.verificar.length} dato(s): revisa la pestaña «Por verificar» antes de reservar.`);
  }

  async function copiar(clave: string, texto: string) {
    if (await copiarTexto(texto)) {
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2500);
    }
  }

  function teclas(e: KeyboardEvent<HTMLDivElement>) {
    const i = PESTAÑAS.findIndex((p) => p.id === pestaña);
    const paso = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "Home" ? -i : e.key === "End" ? PESTAÑAS.length - 1 - i : 0;
    if (!paso) return;
    e.preventDefault();
    const sig = PESTAÑAS[(i + paso + PESTAÑAS.length) % PESTAÑAS.length].id;
    setPestaña(sig);
    refs.current[sig]?.focus();
  }

  const nuevaLinea = (f: LecturaPresupuesto["faltan"][number]) => lineaDeFalta(f, nuevoIdLinea());
  const moneda = referencia.moneda.trim() || "S/";
  const veredicto = lectura?.margen.veredicto;

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-pres" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-pres" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Tu resultado: revisa, añade lo que falta y decide
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pega la respuesta completa de tu IA. La página la separa en paneles, te deja añadir a tu tabla los gastos que faltan y marca cualquier monto que no venga de tus datos.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-presupuesto" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-presupuesto"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nDebe tener los títulos «## Revisión de coherencia», «## Gastos que faltan», «## Necesidades vs extras»…"}
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
            {!respuesta.trim() && <p className="text-xs text-muted-foreground">Este paso es opcional: los cálculos, los escenarios y la exportación de arriba ya funcionan sin la IA.</p>}
          </div>

          {lectura?.valido && (
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" className="btn btn-secundario" disabled={!puedeAgregar || pendientesDeAñadir.length === 0} onClick={() => alAgregar(pendientesDeAñadir.map(nuevaLinea), `Agregué ${pendientesDeAñadir.length} gastos a tu tabla. Escribe sus montos en el paso 1.`)}>
                <Plus aria-hidden className="size-4" /> Añadir a mi tabla los {pendientesDeAñadir.length} gastos que faltan
              </button>
              {!puedeAgregar && <p className="text-xs text-muted-foreground">Esta respuesta de ejemplo no corresponde a lo que hay en tu formulario: carga ese mismo ejemplo en el paso 1 para añadir las líneas.</p>}
              <button type="button" className="btn btn-secundario" disabled={!lectura.antes.length} onClick={() => copiar("antes", lectura.antes.map((t, i) => `${i + 1}. ${t}`).join("\n"))}>
                {copiado === "antes" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                {copiado === "antes" ? "Lista copiada" : "Copiar lista «Antes de reservar»"}
              </button>
            </div>
          )}
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          {lectura?.valido && analisis ? (
            <div className="aparecer">
              <div role="tablist" aria-label="Paneles del resultado" onKeyDown={teclas} className="-mx-1 flex gap-1 overflow-x-auto border-b px-1 pb-px">
                {PESTAÑAS.map((p) => (
                  <button
                    key={p.id}
                    ref={(el) => {
                      refs.current[p.id] = el;
                    }}
                    role="tab"
                    id={`tab-pres-${p.id}`}
                    type="button"
                    aria-selected={pestaña === p.id}
                    aria-controls={`panel-pres-${p.id}`}
                    tabIndex={pestaña === p.id ? 0 : -1}
                    onClick={() => setPestaña(p.id)}
                    className={`min-h-11 shrink-0 whitespace-nowrap rounded-t-md border-b-2 px-3 text-sm font-semibold transition-colors ${pestaña === p.id ? "border-brand-solid text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    {p.etiqueta}
                  </button>
                ))}
              </div>

              <div role="tabpanel" id={`panel-pres-${pestaña}`} aria-labelledby={`tab-pres-${pestaña}`} tabIndex={0} className="mt-4 min-w-0">
                {pestaña === "resumen" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <Tarjeta numero={lectura.faltan.length} etiqueta="Gastos que faltan" detalle={`${pendientesDeAñadir.length} aún no están en tu tabla`} />
                      <Tarjeta numero={lectura.ahorro.length} etiqueta="Ideas de ahorro" detalle="cada una con su categoría" />
                      <Tarjeta numero={lectura.antes.length} etiqueta="Tareas antes de reservar" />
                      <Tarjeta numero={analisis.cifras.montos.length + analisis.conPrecio.length} etiqueta="Montos que no vienen de tus datos" detalle="deberían ser 0" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revisar} vacio="No detecté montos inventados. Revisa igualmente cada dato: la IA puede equivocarse." />
                      </div>
                    </div>
                  </div>
                )}

                {pestaña === "coherencia" && (
                  <div>
                    <h3 className="mb-2 text-base font-semibold">Revisión de coherencia</h3>
                    <Lista items={lectura.revision} vacio="La respuesta no trae una revisión de coherencia." />
                  </div>
                )}

                {pestaña === "faltan" && (
                  <div>
                    <h3 className="mb-1 text-base font-semibold">Gastos que faltan en tu tabla</h3>
                    <p className="mb-3 text-xs text-muted-foreground">Sin precio: la IA indica dónde consultarlo. «Añadir a mi tabla» crea la línea vacía para que escribas el monto.</p>
                    {lectura.faltan.length ? (
                      <ul className="space-y-3" data-faltan>
                        {lectura.faltan.map((f, i) => {
                          const yaEsta = yaEstaEnLaTabla(f, referencia);
                          return (
                            <li key={f.concepto + i} className="tarjeta p-3 text-sm">
                              <p className="font-semibold">
                                {f.concepto || f.categoriaTexto}
                                <span className="ml-2 rounded-full bg-brand-muted px-2 py-0.5 text-xs font-bold text-brand">{f.categoria ? categoriaPorId(f.categoria).nombre : f.categoriaTexto || "Sin categoría"}</span>
                                {analisis.conPrecio.includes(f.concepto) && <span className="ml-2 rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">trae una cifra</span>}
                              </p>
                              {f.porQue && <p className="mt-1 text-muted-foreground">{f.porQue}</p>}
                              {f.dondeConsultar && (
                                <p className="mt-1 text-muted-foreground">
                                  <strong className="font-semibold text-foreground">Dónde consultarlo:</strong> {f.dondeConsultar}
                                </p>
                              )}
                              <button type="button" className="btn btn-secundario mt-2" disabled={yaEsta || !puedeAgregar} onClick={() => alAgregar([nuevaLinea(f)], `Agregué «${f.concepto}» a tu tabla. Escribe su monto en el paso 1.`)} aria-label={`Añadir a mi tabla: ${f.concepto}`}>
                                {yaEsta ? (
                                  <>
                                    <Check aria-hidden className="size-4" /> Ya está en tu tabla
                                  </>
                                ) : (
                                  <>
                                    <Plus aria-hidden className="size-4" /> Añadir a mi tabla
                                  </>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no lista gastos que falten.</p>
                    )}
                  </div>
                )}

                {pestaña === "ahorro" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Necesidades vs extras</h3>
                      {lectura.necesidades.length ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(["necesidad", "extra"] as const).map((clase) => (
                            <div key={clase} className="rounded-lg border bg-surface p-3">
                              <p className="text-sm font-semibold">{clase === "necesidad" ? "Necesidades" : "Extras"}</p>
                              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
                                {lectura.necesidades.filter((n) => n.clase === clase).map((n) => (
                                  <li key={n.texto}>{n.texto}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {lectura.necesidades.some((n) => n.clase === "sin-clasificar") && (
                            <div className="rounded-lg border bg-surface p-3 sm:col-span-2">
                              <p className="text-sm font-semibold">Sin clasificar</p>
                              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
                                {lectura.necesidades.filter((n) => n.clase === "sin-clasificar").map((n) => (
                                  <li key={n.texto}>{n.texto}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">La respuesta no separa necesidades de extras.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Ideas de ahorro</h3>
                      {lectura.ahorro.length ? (
                        <ol className="space-y-3">
                          {lectura.ahorro.map((a) => (
                            <li key={a.idea} className="tarjeta p-3 text-sm">
                              <p className="font-semibold">{a.idea}</p>
                              {a.categoria && (
                                <p className="mt-1 text-muted-foreground">
                                  <span className="font-semibold text-foreground">Categoría que afecta:</span> {a.categoria}
                                </p>
                              )}
                              {a.cambio && (
                                <p className="text-muted-foreground">
                                  <span className="font-semibold text-foreground">Qué cambia:</span> {a.cambio}
                                </p>
                              )}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-muted-foreground">La respuesta no trae ideas de ahorro.</p>
                      )}
                    </div>
                  </div>
                )}

                {pestaña === "margen" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold">Margen de imprevistos</h3>
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Veredicto de la IA:</span>
                      {veredicto ? (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${veredicto === "Razonable" ? "bg-ok-muted text-ok" : "bg-warn-muted text-warn"}`}>{veredicto}</span>
                      ) : (
                        <span className="text-muted-foreground">no indicó</span>
                      )}
                    </p>
                    {lectura.margen.texto && <p className="text-sm leading-relaxed">{lectura.margen.texto}</p>}
                    <div className="rounded-lg border bg-surface p-3 text-sm">
                      <p className="font-semibold">Comparación de esta página (con tus números)</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                        <li>Tu margen: {calculo.pctImprevistos} % ({calculo.escenarios.intermedio.imprevistos > 0 ? `${moneda} ${new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(calculo.escenarios.intermedio.imprevistos)}` : "sin monto"}).</li>
                        <li>Parte estimada del total: {formatoPorcentaje(calculo.porcentajes.estimado)}; conocida: {formatoPorcentaje(calculo.porcentajes.conocido)}.</li>
                        <li>Referencia práctica para esa proporción: {calculo.margenReferencia.texto}. Es una regla práctica de esta página, no un estándar.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {pestaña === "antes" && (
                  <div>
                    <h3 className="mb-2 text-base font-semibold">Antes de reservar</h3>
                    {lectura.antes.length ? (
                      <ol className="space-y-2">
                        {lectura.antes.map((t, i) => (
                          <li key={t} className="tarjeta flex gap-3 p-3 text-sm">
                            <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-bold text-brand tabular">
                              {i + 1}
                            </span>
                            {t}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no trae una lista de tareas.</p>
                    )}
                  </div>
                )}

                {pestaña === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar: comprueba tú los precios, las tasas y los requisitos en fuentes oficiales." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Verificaciones automáticas de la página</h3>
                      <Lista items={revisar} vacio="No detecté montos inventados en la respuesta." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Añade a tu tabla lo que falta y confirma los precios estimados antes de reservar." />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás la revisión de la IA</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta a la izquierda y aparecen los paneles: coherencia, gastos que faltan (con «Añadir a mi tabla»), ahorro, margen y tareas antes de reservar.</p>
              {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo cargada.</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
