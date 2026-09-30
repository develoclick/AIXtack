"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Check, CheckCircle2, ClipboardCopy, ExternalLink, FileText, Info, Printer, XCircle } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { Pestanas } from "@/components/entrevista/pestanas";
import { LaboratorioLogo } from "./laboratorio-logo";
import { leerRespuestaLogo, type LecturaLogo } from "@/lib/logo/lector";
import { revisarLogo } from "@/lib/logo/verificar";
import type { DatosLogo } from "@/lib/logo/tipos";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  referencia: DatosLogo;
  esDeEjemplo: boolean;
  alExportar: (tipo: "imprimir") => void;
  alAviso: (texto: string) => void;
  accionesDeEjemplo: ReactNode;
}

type IdPestana = "brief" | "especificaciones" | "prompts" | "laboratorio" | "revision";
const PESTANAS: { id: IdPestana; etiqueta: string }[] = [
  { id: "brief", etiqueta: "Brief y conceptos" },
  { id: "especificaciones", etiqueta: "Especificaciones" },
  { id: "prompts", etiqueta: "Prompts de imagen" },
  { id: "laboratorio", etiqueta: "Laboratorio" },
  { id: "revision", etiqueta: "Revisión" },
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

function BotonCopiar({ texto, etiqueta, onCopiado }: { texto: string; etiqueta: string; onCopiado: () => void }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-secundario text-xs"
      onClick={async () => {
        if (await copiarTexto(texto)) {
          setCopiado(true);
          onCopiado();
          setTimeout(() => setCopiado(false), 2000);
        }
      }}
    >
      {copiado ? <Check aria-hidden className="size-3.5" /> : <ClipboardCopy aria-hidden className="size-3.5" />}
      {copiado ? "Copiado" : etiqueta}
    </button>
  );
}

export function ResultadoLogo({ respuesta, alCambiar, referencia, esDeEjemplo, alExportar, alAviso, accionesDeEjemplo }: Props) {
  const [pestana, setPestana] = useState<IdPestana>("brief");
  const [conceptoElegido, setConceptoElegido] = useState<number | null>(null);
  const ayudaId = useId();

  const lectura: LecturaLogo | null = useMemo(() => (respuesta.trim() ? leerRespuestaLogo(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarLogo(lectura) : null), [lectura]);
  const valida = Boolean(lectura?.valido);

  function imprimir() {
    document.body.classList.add("imprimiendo-logo");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-logo");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-logo" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-logo" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega la respuesta de tu IA
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">El contraste de la paleta lo calcula la página, nunca la IA. Después de leer el brief, copia el prompt de la variante que quieras generar y súbela al laboratorio para probarla.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-logo" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-logo"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder="Pega aquí la respuesta completa de tu IA, con los títulos «## Brief», «## Conceptos»…"
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
                <button type="button" className="btn btn-secundario" onClick={imprimir}>
                  <Printer aria-hidden className="size-4" /> Imprimir o guardar manual en PDF
                </button>
              </div>

              <Pestanas etiqueta="Paneles del resultado" prefijo="logo" pestanas={PESTANAS} valor={pestana} alCambiar={setPestana}>
                {pestana === "brief" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Brief</h3>
                      <Lista items={lectura.brief} vacio="La respuesta no trae un brief." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Conceptos ({lectura.conceptos.length} de 3)</h3>
                      <div className="space-y-3">
                        {lectura.conceptos.map((c, i) => (
                          <label key={c.nombre} className={`block cursor-pointer rounded-lg border p-3 text-sm transition-colors ${conceptoElegido === i ? "border-brand-solid bg-brand-muted" : "bg-surface"}`}>
                            <div className="flex items-start gap-2">
                              <input type="radio" name="concepto-elegido" className="mt-1 size-4 accent-[var(--accent)]" checked={conceptoElegido === i} onChange={() => setConceptoElegido(i)} />
                              <div>
                                <p className="font-semibold">
                                  {c.nombre} <span className="font-normal text-muted-foreground">· {c.tipo || "sin tipo"}</span>
                                </p>
                                <p className="mt-1 text-muted-foreground">{c.idea}</p>
                                {c.composicion && <p className="mt-1 text-xs text-muted-foreground">Composición: {c.composicion}</p>}
                                {c.justificacion && <p className="mt-1 text-xs text-muted-foreground">Por qué encaja: {c.justificacion}</p>}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {lectura.conceptos.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Marca el concepto que prefieras: es solo para tu referencia, no cambia ningún cálculo.</p>}
                    </div>
                  </div>
                )}

                {pestana === "especificaciones" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Paleta ({lectura.paleta.length} colores)</h3>
                      {lectura.paleta.length === 0 ? (
                        <p className="text-sm text-muted-foreground">La respuesta no trae una tabla de colores legible.</p>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {revision.contrastes.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg border bg-surface p-3 text-sm">
                              <span aria-hidden className="size-10 shrink-0 rounded-md border" style={{ background: c.hexValido ?? "transparent" }} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold">{c.color.nombre}</p>
                                <p className="truncate text-xs text-muted-foreground tabular">
                                  {c.hexValido ?? c.color.hex} {c.color.uso && `· ${c.color.uso}`}
                                </p>
                              </div>
                              {c.hexValido ? (
                                c.cumpleAA ? (
                                  <span className="flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 text-xs font-bold text-ok">
                                    <CheckCircle2 aria-hidden className="size-3.5" /> AA
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 rounded-full bg-warn-muted px-2 py-0.5 text-xs font-bold text-warn">
                                    <XCircle aria-hidden className="size-3.5" /> bajo contraste
                                  </span>
                                )
                              ) : (
                                <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">HEX inválido</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">«AA» significa que este color, con texto negro o blanco encima (el que mejor contraste dé), llega al mínimo de 4,5:1 que pide el estándar WCAG. Lo calcula esta página, no la IA.</p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-base font-semibold">Tipografías ({lectura.tipografias.length})</h3>
                      {lectura.tipografias.length === 0 ? (
                        <p className="text-sm text-muted-foreground">La respuesta no trae una tabla de tipografías legible.</p>
                      ) : (
                        <div className="space-y-2">
                          {lectura.tipografias.map((t, i) => {
                            const sinVerificar = revision.tipografiasSinLicenciaVerificada.includes(t);
                            return (
                              <div key={i} className="rounded-lg border bg-surface p-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-semibold">
                                    {t.nombre} {t.alternativaGoogleFonts && <span className="font-normal text-muted-foreground">· alternativa: {t.alternativaGoogleFonts}</span>}
                                  </p>
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${sinVerificar ? "bg-warn-muted text-warn" : "bg-ok/15 text-ok"}`}>{sinVerificar ? "verificar licencia" : "licencia gratuita"}</span>
                                </div>
                                {t.uso && <p className="mt-1 text-xs text-muted-foreground">Uso: {t.uso}</p>}
                                {t.alternativaGoogleFonts && (
                                  <a href={`https://fonts.google.com/?query=${encodeURIComponent(t.alternativaGoogleFonts)}`} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand underline underline-offset-2">
                                    Ver «{t.alternativaGoogleFonts}» en Google Fonts <ExternalLink aria-hidden className="size-3" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 text-base font-semibold">Proporciones y tamaño mínimo</h3>
                      <Lista items={lectura.detallesEspecificaciones} vacio="La respuesta no trae estos detalles." />
                    </div>
                  </div>
                )}

                {pestana === "prompts" && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Copia el prompt de la variante que quieras generar y pégalo en tu generador de imágenes (uno a la vez).</p>
                    {lectura.prompts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">La respuesta no trae prompts de imagen legibles.</p>
                    ) : (
                      <div className="space-y-3">
                        {lectura.prompts.map((p) => (
                          <div key={p.variante} className="rounded-lg border bg-surface p-3 text-sm">
                            <p className="font-semibold">{p.variante}</p>
                            <div className="mt-2 flex items-start justify-between gap-2">
                              <p className="min-w-0 flex-1 break-words text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">EN:</span> {p.en}
                              </p>
                              <BotonCopiar texto={p.en} etiqueta="Copiar EN" onCopiado={() => alAviso(`Prompt en inglés de «${p.variante}» copiado.`)} />
                            </div>
                            <div className="mt-2 flex items-start justify-between gap-2">
                              <p className="min-w-0 flex-1 break-words text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">ES:</span> {p.es}
                              </p>
                              <BotonCopiar texto={p.es} etiqueta="Copiar ES" onCopiado={() => alAviso(`Prompt en español de «${p.variante}» copiado.`)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {pestana === "laboratorio" && <LaboratorioLogo nombreEmpresa={referencia.nombreEmpresa} />}

                {pestana === "revision" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué revisar antes de usarlo</h3>
                      <Lista items={revision.avisos} vacio="No detecté problemas de contraste ni de licencia en esta respuesta." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Variantes</h3>
                      <Lista items={lectura.variantes} vacio="La respuesta no describe las variantes." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Aplicaciones</h3>
                      <Lista items={lectura.aplicaciones} vacio="La respuesta no indica en qué usar cada variante." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Revisión y riesgos</h3>
                      <Lista items={lectura.revision} vacio="La respuesta no lista riesgos." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Qué debes verificar</h3>
                      <Lista items={lectura.verificar} vacio="La respuesta no lista datos por verificar." />
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold">Siguiente paso</h3>
                      <Lista items={lectura.siguiente} vacio="Genera el concepto elegido y pruébalo en el laboratorio." />
                    </div>
                    <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Esta propuesta fue generada con ayuda de IA y requiere revisión profesional antes de registrarla como marca o imprimirla en volumen. No es asesoría legal.</p>
                    {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Los conceptos y prompts son ficticios.</p>}
                  </div>
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu brief, tus conceptos y tus prompts</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA a la izquierda y aparecen el brief, la paleta con su contraste, los prompts de imagen y el laboratorio del logo.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
