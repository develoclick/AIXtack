"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Check, ClipboardCopy, Download, FileText, Info, Printer, Star } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { descargarBlob } from "@/components/plan/descargar";
import { RegistroValidacion } from "./registro-validacion";
import { almacenNichos } from "./almacen";
import { favoritosListos, rankearNichos } from "@/lib/nichos/calculo";
import { csvDeMatriz } from "@/lib/nichos/exportar";
import { leerRespuestaNichos1, leerRespuestaValidacion, type LecturaValidacion } from "@/lib/nichos/lector";
import { construirPromptNichos2 } from "@/lib/nichos/prompt";
import { revisarNichos1, revisarValidacion } from "@/lib/nichos/verificar";
import { CRITERIOS, MAX_FAVORITOS, type Pesos } from "@/lib/nichos/tipos";

interface Props {
  respuestaValidacion: string;
  alCambiarValidacion: (texto: string) => void;
  esDeEjemploNichos: boolean;
  esDeEjemploValidacion: boolean;
  alAviso: (texto: string) => void;
  alExportar: (tipo: "csv" | "imprimir" | "copiar-prompt-2") => void;
  accionesDeEjemploNichos: ReactNode;
  accionesDeEjemploValidacion: ReactNode;
}

const RE_HIPOTESIS = /(\[hip[oó]tesis\])/gi;

function TextoConEtiqueta({ texto }: { texto: string }) {
  const partes = texto.split(RE_HIPOTESIS);
  return <>{partes.map((p, i) => (RE_HIPOTESIS.test(p) ? <span key={i} className="rounded bg-warn-muted px-1 py-0.5 text-xs font-bold text-warn">{p}</span> : <span key={i}>{p}</span>))}</>;
}

function SeccionValidacion({ titulo, texto }: { titulo: string; texto?: string }) {
  if (!texto) {
    return (
      <div>
        <h4 className="mb-1.5 text-sm font-semibold">{titulo}</h4>
        <p className="text-sm text-muted-foreground">La respuesta no trae esta sección.</p>
      </div>
    );
  }
  const lineas = texto.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-semibold">{titulo}</h4>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
        {lineas.map((l, i) => (
          <li key={i}>
            <TextoConEtiqueta texto={l.replace(/^[-*•]\s*/, "")} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditorPesos({ pesos, alCambiar }: { pesos: Pesos; alCambiar: (p: Pesos) => void }) {
  const suma = pesos.entrada + pesos.inversion + pesos.recurrencia + pesos.diferenciacion + pesos.encaje;
  return (
    <details className="rounded-lg border bg-surface p-3 text-sm">
      <summary className="flex min-h-11 cursor-pointer items-center font-semibold">Ajustar los pesos de la matriz ({suma} en total)</summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {CRITERIOS.map((c) => (
          <label key={c.clave} className="block">
            <span className="mb-1 block text-xs font-semibold">{c.etiqueta}</span>
            <input type="number" min={0} max={100} inputMode="numeric" className="campo tabular" value={pesos[c.clave]} onChange={(e) => alCambiar({ ...pesos, [c.clave]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">No hace falta que sumen 100: la página los usa como proporción entre sí. Si tu situación cambia, ajústalos y el ranking se recalcula solo.</p>
    </details>
  );
}

export function ResultadoNichos({ respuestaValidacion, alCambiarValidacion, esDeEjemploNichos, esDeEjemploValidacion, alAviso, alExportar, accionesDeEjemploNichos, accionesDeEjemploValidacion }: Props) {
  const d = almacenNichos.useDatos();
  const ayudaId = useId();
  const ayudaId2 = useId();
  const [copiadoP2, setCopiadoP2] = useState(false);

  const lectura1 = useMemo(() => leerRespuestaNichos1(d.respuestaNichos), [d.respuestaNichos]);
  const ranking = useMemo(() => rankearNichos(lectura1.nichos, d.pesos), [lectura1.nichos, d.pesos]);
  const avisos1 = useMemo(() => revisarNichos1(lectura1.nichos), [lectura1.nichos]);
  const listos = favoritosListos(d, lectura1.nichos);

  const lectura2: LecturaValidacion | null = useMemo(() => (respuestaValidacion.trim() ? leerRespuestaValidacion(respuestaValidacion) : null), [respuestaValidacion]);
  const revision2 = useMemo(() => (lectura2?.valido ? revisarValidacion(lectura2) : []), [lectura2]);

  function alternarFavorito(nombre: string) {
    const yaEsta = d.favoritos.includes(nombre);
    if (yaEsta) {
      almacenNichos.guardar({ ...d, favoritos: d.favoritos.filter((x) => x !== nombre) });
      return;
    }
    if (d.favoritos.length >= MAX_FAVORITOS) {
      alAviso(`Ya elegiste ${MAX_FAVORITOS} favoritos: quita uno antes de agregar otro.`);
      return;
    }
    almacenNichos.guardar({ ...d, favoritos: [...d.favoritos, nombre] });
  }

  function exportarCsv() {
    descargarBlob("matriz-de-nichos.csv", new Blob([csvDeMatriz(ranking)], { type: "text/csv;charset=utf-8" }));
    alExportar("csv");
  }

  async function copiarPrompt2() {
    const favoritos = d.favoritos.map((nombre) => lectura1.nichos.find((n) => n.nombre === nombre)!);
    const ok = await copiarTexto(construirPromptNichos2(d, favoritos));
    setCopiadoP2(ok);
    if (ok) alExportar("copiar-prompt-2");
    setTimeout(() => setCopiadoP2(false), 2500);
  }

  function imprimir() {
    document.body.classList.add("imprimiendo-nichos");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-nichos");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-nichos" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-nichos" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega la respuesta y compara tus nichos
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">La IA propone los nichos; esta página los ordena con tus propios pesos. La comparación nunca la hace la IA.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemploNichos}</div>
      </div>

      <div className="mt-6 min-w-0">
        <label htmlFor="respuesta-nichos" className="mb-1.5 block text-sm font-semibold">
          Respuesta del Prompt 1
        </label>
        <textarea
          id="respuesta-nichos"
          className="campo min-h-56 font-mono text-[0.8125rem]"
          value={d.respuestaNichos}
          onChange={(e) => almacenNichos.guardar({ ...d, respuestaNichos: e.target.value })}
          placeholder="Pega aquí la respuesta completa de tu IA, con el título «## Nichos» y su tabla en un bloque ```csv…"
          spellCheck={false}
          aria-describedby={ayudaId}
          aria-invalid={d.respuestaNichos.trim() ? !lectura1.valido : undefined}
        />
        <p id={ayudaId} className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Usa el botón «Copiar» de tu asistente de IA y pega aquí la respuesta completa, sin editarla.
        </p>

        <div role="status" aria-live="polite" className="mt-3 space-y-3">
          {d.respuestaNichos.trim() && !lectura1.valido && (
            <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
              <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
              <div>
                <p className="font-semibold">Todavía no puedo leer esta respuesta</p>
                <p className="mt-1 break-words">{lectura1.problema}</p>
              </div>
            </div>
          )}
          {lectura1.valido && lectura1.advertencias.length > 0 && (
            <div className="flex gap-3 rounded-lg border bg-surface p-4 text-sm">
              <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <p className="font-semibold">Avisos (no impiden usar el resultado)</p>
                <ul className="mt-1 list-disc space-y-1 break-words pl-5 text-muted-foreground">
                  {[...lectura1.advertencias, ...avisos1].map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {lectura1.valido && (
        <div className="aparecer mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Matriz de evaluación ({ranking.length} nichos)</h3>
            <div className="flex flex-wrap gap-2" data-no-imprimir>
              <button type="button" className="btn btn-secundario" onClick={exportarCsv}>
                <Download aria-hidden className="size-4" /> Descargar la matriz (.csv)
              </button>
              <button type="button" className="btn btn-secundario" onClick={imprimir}>
                <Printer aria-hidden className="size-4" /> Imprimir o guardar manual en PDF
              </button>
            </div>
          </div>

          <EditorPesos pesos={d.pesos} alCambiar={(p) => almacenNichos.guardar({ ...d, pesos: p })} />

          <p className="text-sm text-muted-foreground">
            Marca hasta {MAX_FAVORITOS} nichos como favoritos ({d.favoritos.length}/{MAX_FAVORITOS}) para pasar al Prompt 2.
          </p>

          <ul className="space-y-2">
            {ranking.map((n) => {
              const esFavorito = d.favoritos.includes(n.nombre);
              return (
                <li key={n.id} className={`tarjeta p-3 ${esFavorito ? "border-brand-solid bg-brand-muted" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        #{n.posicion} · {n.nombre}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Puntuación ponderada: {n.puntuacion} / 5</p>
                    </div>
                    <button
                      type="button"
                      className={`btn ${esFavorito ? "btn-primario" : "btn-secundario"} shrink-0`}
                      onClick={() => alternarFavorito(n.nombre)}
                      aria-pressed={esFavorito}
                      disabled={!esFavorito && d.favoritos.length >= MAX_FAVORITOS}
                    >
                      <Star aria-hidden className="size-4" /> {esFavorito ? "Favorito" : "Elegir"}
                    </button>
                  </div>
                  <details className="mt-2 text-sm">
                    <summary className="flex min-h-11 cursor-pointer items-center text-muted-foreground hover:text-foreground">Ver ficha completa</summary>
                    <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                      {([["Cliente objetivo", n.cliente], ["Problema", n.problema], ["Oferta", n.oferta], ["Competencia probable", n.competencia], ["Canales", n.canales], ["Monetización", n.monetizacion], ["Recursos necesarios", n.recursos], ["Justificación de las puntuaciones", n.justificacion]] as [string, string][]).map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-xs font-semibold text-muted-foreground">{k}</dt>
                          <dd>{v || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-2 text-xs text-muted-foreground tabular">Entrada {n.entrada} · Inversión {n.inversion} · Recurrencia {n.recurrencia} · Diferenciación {n.diferenciacion} · Encaje {n.encaje}</p>
                  </details>
                </li>
              );
            })}
          </ul>

          {listos && (
            <div className="rounded-lg border border-brand-solid bg-brand-muted p-4 text-sm">
              <p className="font-semibold">Ya elegiste tus 2 favoritos.</p>
              <p className="mt-1 text-muted-foreground">Copia el Prompt 2 (arriba, en el paso 2) o desde aquí mismo:</p>
              <button type="button" onClick={copiarPrompt2} className="btn btn-primario mt-2">
                {copiadoP2 ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                {copiadoP2 ? "¡Prompt 2 copiado!" : "Copiar Prompt 2 (validación)"}
              </button>
            </div>
          )}
        </div>
      )}

      {listos && (
        <div className="mt-8 min-w-0 border-t pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">4. Pega la respuesta del Prompt 2</h3>
              <p className="mt-1 text-sm text-muted-foreground">Hipótesis críticas y plan de validación de 14 días para tus 2 nichos elegidos.</p>
            </div>
            <div className="sm:w-64 sm:shrink-0">{accionesDeEjemploValidacion}</div>
          </div>
          <label htmlFor="respuesta-validacion" className="mb-1.5 mt-4 block text-sm font-semibold">
            Respuesta del Prompt 2
          </label>
          <textarea
            id="respuesta-validacion"
            className="campo min-h-56 font-mono text-[0.8125rem]"
            value={respuestaValidacion}
            onChange={(e) => alCambiarValidacion(e.target.value)}
            placeholder="Pega aquí la respuesta completa de tu IA, con los títulos «## Hipótesis críticas», «## Plan de validación: Nicho 1»…"
            spellCheck={false}
            aria-describedby={ayudaId2}
            aria-invalid={lectura2 ? !lectura2.valido : undefined}
          />
          <p id={ayudaId2} className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Si tu IA todavía no te dio el Prompt 2, cópialo arriba primero.
          </p>

          <div role="status" aria-live="polite" className="mt-3 space-y-3">
            {lectura2 && !lectura2.valido && (
              <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                <div>
                  <p className="font-semibold">Todavía no puedo leer esta respuesta</p>
                  <p className="mt-1 break-words">{lectura2.problema}</p>
                </div>
              </div>
            )}
            {lectura2?.valido && lectura2.advertencias.length > 0 && (
              <div className="flex gap-3 rounded-lg border bg-surface p-4 text-sm">
                <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">Avisos (no impiden usar el resultado)</p>
                  <ul className="mt-1 list-disc space-y-1 break-words pl-5 text-muted-foreground">
                    {lectura2.advertencias.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {lectura2?.valido && (
            <div className="aparecer mt-4 space-y-5">
              <SeccionValidacion titulo="Hipótesis críticas" texto={lectura2.secciones.hipotesis} />
              <SeccionValidacion titulo="Plan de validación: Nicho 1" texto={lectura2.secciones.plan1} />
              <SeccionValidacion titulo="Plan de validación: Nicho 2" texto={lectura2.secciones.plan2} />
              <SeccionValidacion titulo="Guion de entrevistas" texto={lectura2.secciones.guion} />
              <SeccionValidacion titulo="Qué debes verificar" texto={lectura2.secciones.verificar} />
              <SeccionValidacion titulo="Siguiente paso" texto={lectura2.secciones.siguiente} />
              <div>
                <h4 className="mb-1.5 text-sm font-semibold">Qué revisar antes de usarlo</h4>
                {revision2.length ? (
                  <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-warn">
                    {revision2.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Las hipótesis sobre tus clientes están etiquetadas como corresponde.</p>
                )}
                <p className="mt-4 rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Esto no es asesoría legal, financiera ni de inversión. Genera oportunidades como hipótesis, no como certezas: valídalas antes de invertir tiempo o dinero.</p>
                {esDeEjemploValidacion && <p className="mt-2 text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Nichos y plan son ficticios.</p>}
              </div>
            </div>
          )}

          <div className="mt-8">
            <RegistroValidacion favoritos={d.favoritos.map((nombre) => lectura1.nichos.find((n) => n.nombre === nombre)!).filter(Boolean)} />
          </div>
        </div>
      )}

      {!lectura1.valido && !d.respuestaNichos.trim() && (
        <div className="mt-6 flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
          <FileText aria-hidden className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Aquí verás tu matriz de nichos</p>
          <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA arriba y aparece la matriz de comparación, ya calculada por esta página.</p>
        </div>
      )}

      {esDeEjemploNichos && lectura1.valido && <p className="mt-4 text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Nichos y competencia son ficticios.</p>}
    </section>
  );
}
