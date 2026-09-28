"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AlertTriangle, ArrowRightLeft, Check, ClipboardCopy, Download, FileText, Info, Lightbulb } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { descargarWord } from "@/components/prompts/cv/convertir-word";
import { VistaCv } from "@/components/prompts/cv/vista-cv";
import { leerRespuestaOptimizar, type LecturaOptimizar } from "@/lib/optimizar/lector";
import { citasQueNoEstan, compararTextos, contarCambios, detectarInventados, paginasAproximadas, type TrozoDiff } from "@/lib/optimizar/verificar";
import type { DatosOptimizar } from "@/lib/optimizar/tipos";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  /** Datos con los que se compara (los del formulario, o los del ejemplo si se pegó una respuesta de ejemplo). */
  referencia: DatosOptimizar;
  esDeEjemplo: boolean;
  alDescargar: (esEjemplo: boolean) => void;
  alConvertir: (cvTexto: string) => void;
  accionesDeEjemplo: ReactNode;
}

const PESTAÑAS = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "comparar", etiqueta: "Antes y después" },
  { id: "cv", etiqueta: "CV optimizado" },
  { id: "diagnostico", etiqueta: "Diagnóstico" },
  { id: "cambios", etiqueta: "Cambios" },
  { id: "brechas", etiqueta: "Brechas y preguntas" },
  { id: "verificar", etiqueta: "Por verificar" },
] as const;
type IdPestaña = (typeof PESTAÑAS)[number]["id"];

function Trozos({ trozos, marcados = [] }: { trozos: TrozoDiff[]; marcados?: string[] }) {
  const patron = useMemo(() => (marcados.length ? new RegExp(`(${marcados.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g") : null), [marcados]);
  return (
    <>
      {trozos.map((t, i) => {
        const clase = t.tipo === "quitado" ? "rounded-sm bg-destructive/15 text-destructive line-through decoration-1" : t.tipo === "agregado" ? "rounded-sm bg-ok-muted text-foreground" : "";
        const partes = patron && t.tipo !== "quitado" ? t.texto.split(patron) : [t.texto];
        return (
          <span key={i} className={clase}>
            {partes.map((p, j) => (marcados.includes(p) ? <mark key={j} className="rounded-sm bg-warn-muted px-0.5 font-semibold text-warn underline decoration-wavy">{p}</mark> : p))}
          </span>
        );
      })}
    </>
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

export function ResultadoOptimizar({ respuesta, alCambiar, referencia, esDeEjemplo, alDescargar, alConvertir, accionesDeEjemplo }: Props) {
  const [pestaña, setPestaña] = useState<IdPestaña>("resumen");
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const ayudaId = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const lectura: LecturaOptimizar | null = useMemo(() => (respuesta.trim() ? leerRespuestaOptimizar(respuesta) : null), [respuesta]);
  const analisis = useMemo(() => {
    if (!lectura?.valido || !lectura.secciones.cv) return null;
    const cvOriginal = referencia.cv;
    const fuente = `${referencia.cv}\n${referencia.datosNuevos}`;
    const inventados = detectarInventados(fuente, lectura.secciones.cv);
    const dif = compararTextos(cvOriginal, lectura.secciones.cv);
    return {
      inventados,
      dif,
      contadores: contarCambios(cvOriginal, lectura.secciones.cv, referencia.oferta, lectura.cambios),
      citas: citasQueNoEstan(cvOriginal, lectura.diagnostico),
      paginas: paginasAproximadas(lectura.secciones.cv),
      pendientes: /\[(COMPLETAR|SUPUESTO)[^\]]*\]/i.test(lectura.secciones.cv),
    };
  }, [lectura, referencia]);

  const marcados = analisis ? [...analisis.inventados.numeros, ...analisis.inventados.nombres] : [];
  const revisar: string[] = [];
  if (lectura?.valido && analisis) {
    if (analisis.inventados.numeros.length) revisar.push(`Hay números en el CV optimizado que no están en tu CV original: ${analisis.inventados.numeros.join(", ")}. Confírmalos o quítalos.`);
    if (analisis.inventados.nombres.length) revisar.push(`Hay nombres propios, siglas o herramientas que no están en tu CV original: ${analisis.inventados.nombres.join(", ")}. Si no las usaste, quítalas.`);
    if (analisis.citas.length) revisar.push(`El diagnóstico cita fragmentos que no encuentro en tu CV: «${analisis.citas.join("», «")}». La IA pudo haberlos inventado.`);
    if (analisis.paginas > referencia.paginas) revisar.push(`El CV optimizado ocupa unas ${analisis.paginas} páginas y pediste ${referencia.paginas}. Pídele a la IA que lo acorte.`);
    if (analisis.pendientes) revisar.push("Quedan marcas [COMPLETAR] o [SUPUESTO] en el CV optimizado: resuélvelas antes de enviarlo.");
    if (lectura.preguntas.length) revisar.push(`Responde las ${lectura.preguntas.length} pregunta(s) de tipo B antes de usar el CV: solo agrega lo que sí hacías.`);
    if (lectura.brechas.length) revisar.push(`Hay ${lectura.brechas.length} brecha(s) real(es) frente a la oferta: no las escondas; menciónalas con honestidad o desarrolla la habilidad.`);
  }

  async function copiar(clave: string, texto: string) {
    if (await copiarTexto(texto)) {
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2500);
    }
  }

  async function bajar() {
    if (!lectura?.cv?.valido) return;
    setError(null);
    setTrabajando(true);
    try {
      await descargarWord(lectura.cv.documento, esDeEjemplo ? "CV-optimizado-ejemplo.docx" : undefined);
      alDescargar(esDeEjemplo);
    } catch {
      setError("No se pudo crear el archivo Word. Recarga la página e inténtalo de nuevo.");
    } finally {
      setTrabajando(false);
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

  const puedeBajar = Boolean(lectura?.valido && lectura.cv?.valido) && !trabajando;
  const motivo = !respuesta.trim() ? "Pega la respuesta de tu IA para activar la descarga y la comparación." : lectura && !lectura.valido ? `Descarga desactivada: ${lectura.problema}` : "";
  const registroTexto = lectura?.cambios.map((c) => `Antes: ${c.antes} → Después: ${c.despues} → Motivo: ${c.motivo}`).join("\n") ?? "";

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Tu resultado: compara, revisa y descarga
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pega la respuesta completa de tu IA. La página la separa en paneles, marca lo que cambió y detecta números y nombres que no estaban en tu CV.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-optimizar" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-optimizar"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nDebe tener los títulos «## Diagnóstico», «## CV optimizado», «## Registro de cambios»…"}
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
                  <p className="font-semibold">Todavía no puedo armar la comparación</p>
                  <p className="mt-1">{lectura.problema}</p>
                  <p className="mt-2">Pega la respuesta completa usando el botón Copiar de tu IA. Si respondió con otro formato, pídele que use exactamente los títulos que indica el prompt.</p>
                </div>
              </div>
            )}
            {lectura?.valido && lectura.advertencias.length > 0 && (
              <div className="flex gap-3 rounded-lg border bg-surface p-4 text-sm">
                <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">Avisos (no impiden descargar)</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                    {lectura.advertencias.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button type="button" className="btn btn-primario" disabled={!puedeBajar} aria-describedby="motivo-descarga-opt" onClick={bajar}>
              <Download aria-hidden className="size-4" />
              {trabajando ? "Creando el archivo…" : "Descargar CV optimizado en Word (.docx)"}
            </button>
            <p id="motivo-descarga-opt" className="text-xs text-muted-foreground" aria-live="polite">
              {motivo}
            </p>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secundario" disabled={!lectura?.valido || !lectura.cambios.length} onClick={() => copiar("registro", registroTexto)}>
                {copiado === "registro" ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                {copiado === "registro" ? "Registro copiado" : "Copiar registro de cambios"}
              </button>
              <button type="button" className="btn btn-secundario" disabled={!puedeBajar} onClick={() => lectura?.secciones.cv && alConvertir(lectura.secciones.cv)}>
                <ArrowRightLeft aria-hidden className="size-4" /> Convertir en CV Harvard
              </button>
            </div>
            <p className="text-xs text-muted-foreground">«Convertir en CV Harvard» lleva el resultado al generador de CV para verlo y descargarlo con el formato Harvard.</p>
          </div>
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
                    id={`tab-${p.id}`}
                    type="button"
                    aria-selected={pestaña === p.id}
                    aria-controls={`panel-${p.id}`}
                    tabIndex={pestaña === p.id ? 0 : -1}
                    onClick={() => setPestaña(p.id)}
                    className={`min-h-11 shrink-0 whitespace-nowrap rounded-t-md border-b-2 px-3 text-sm font-semibold transition-colors ${pestaña === p.id ? "border-brand-solid text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    {p.etiqueta}
                  </button>
                ))}
              </div>

              <div role="tabpanel" id={`panel-${pestaña}`} aria-labelledby={`tab-${pestaña}`} tabIndex={0} className="mt-4 min-w-0">
                {pestaña === "resumen" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <Tarjeta numero={analisis.contadores.palabrasEliminadas} etiqueta="Palabras eliminadas" detalle="del texto de tu CV" />
                      <Tarjeta numero={analisis.contadores.bulletsReescritos} etiqueta="Viñetas reescritas" detalle="que no estaban tal cual en tu CV" />
                      <Tarjeta numero={analisis.contadores.terminosNuevos.length} etiqueta="Términos de la oferta añadidos" detalle={`${analisis.contadores.terminosConRespaldo.length} con respaldo en el registro de cambios`} />
                      <Tarjeta numero={analisis.inventados.numeros.length + analisis.inventados.nombres.length} etiqueta="Datos que no estaban en tu CV" detalle="números, nombres o siglas por verificar" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <div className="mt-2">
                        <Lista items={revisar} vacio="No detecté nada raro, pero revisa cada línea: la IA puede equivocarse." />
                      </div>
                    </div>
                    {analisis.contadores.terminosNuevos.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Términos de la oferta añadidos:</strong> {analisis.contadores.terminosNuevos.join(", ")}.
                      </p>
                    )}
                  </div>
                )}

                {pestaña === "comparar" && (
                  <div>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Diferencia por palabras entre tu CV original y el CV optimizado: <span className="rounded-sm bg-destructive/15 px-1 text-destructive line-through">quitado</span>{" "}
                      <span className="rounded-sm bg-ok-muted px-1">agregado</span> <mark className="rounded-sm bg-warn-muted px-1 text-warn">dato que no estaba en tu CV</mark>
                    </p>
                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="min-w-0">
                        <h3 className="mb-1.5 text-sm font-semibold">Antes (tu CV)</h3>
                        <div data-diff="antes" className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 text-[0.8125rem] leading-relaxed">
                          <Trozos trozos={analisis.dif.izquierda} />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="mb-1.5 text-sm font-semibold">Después (CV optimizado)</h3>
                        <div data-diff="despues" className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-surface p-3 text-[0.8125rem] leading-relaxed">
                          <Trozos trozos={analisis.dif.derecha} marcados={marcados} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {pestaña === "cv" && lectura.cv && (
                  <div>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold">Vista previa (hoja A4)</p>
                      <p className="text-xs text-muted-foreground tabular">{analisis.paginas === 1 ? "1 página" : `${analisis.paginas} páginas aprox.`}</p>
                    </div>
                    <VistaCv cv={lectura.cv.documento} />
                  </div>
                )}

                {pestaña === "diagnostico" && (
                  <div>
                    <h3 className="mb-2 text-base font-semibold">Diagnóstico de tu CV</h3>
                    {lectura.diagnostico.length ? (
                      <ul className="space-y-3">
                        {lectura.diagnostico.map((p) => (
                          <li key={p.tipo + p.texto} className="tarjeta p-3 text-sm">
                            <span className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-bold text-brand">{p.tipo}</span>
                            {p.fragmento && analisis.citas.includes(p.fragmento) && <span className="ml-2 rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">cita no encontrada en tu CV</span>}
                            <p className="mt-2 leading-relaxed">{p.texto}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no trae diagnóstico.</p>
                    )}
                  </div>
                )}

                {pestaña === "cambios" && (
                  <div>
                    <h3 className="mb-2 text-base font-semibold">Registro de cambios (Antes → Después → Motivo)</h3>
                    {lectura.cambios.length ? (
                      <ul className="space-y-3">
                        {lectura.cambios.map((c) => (
                          <li key={c.antes + c.despues} className="tarjeta space-y-1.5 p-3 text-sm">
                            <p>
                              <span className="font-semibold text-destructive">Antes:</span> {c.antes}
                            </p>
                            <p>
                              <span className="font-semibold text-ok">Después:</span> {c.despues}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Motivo:</span> {c.motivo}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">La respuesta no trae un registro de cambios en el formato «Antes → Después → Motivo».</p>
                    )}
                    <div className="mt-5">
                      <h3 className="mb-2 text-base font-semibold">Eliminado o reorganizado</h3>
                      <Lista items={lectura.eliminado} vacio="No se indicó nada eliminado o reorganizado." />
                    </div>
                  </div>
                )}

                {pestaña === "brechas" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Brechas reales (tipo C)</h3>
                      <p className="mb-2 text-xs text-muted-foreground">Requisitos de la oferta que no aparecen en tu CV. No se agregaron.</p>
                      <Lista items={lectura.brechas} vacio="No se detectaron brechas." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Preguntas para confirmar (tipo B)</h3>
                      <p className="mb-2 text-xs text-muted-foreground">Cosas implícitas en tu CV: solo agrégalas si son ciertas.</p>
                      <Lista items={lectura.preguntas} vacio="No hay preguntas pendientes." />
                    </div>
                  </div>
                )}

                {pestaña === "verificar" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Afirmaciones que debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista afirmaciones por verificar: revisa cada cifra, fecha y nombre." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Verificaciones automáticas de la página</h3>
                      <Lista items={revisar} vacio="No detecté números ni nombres nuevos, ni citas inexistentes." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Revisa el CV optimizado línea por línea antes de enviarlo." />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás el resultado</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA a la izquierda y aparecen los paneles: resumen, comparación antes y después, CV optimizado, cambios y lo que debes verificar.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
