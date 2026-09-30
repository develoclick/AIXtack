"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Download, FileJson, FileText, Info, Printer, Upload } from "lucide-react";
import { Pestanas } from "@/components/entrevista/pestanas";
import { descargarBlob } from "@/components/plan/descargar";
import { leerRespuestaPlanNegocio, type LecturaPlanNegocio, type TablaMarkdown } from "@/lib/plan-negocio/lector";
import { nombreDeArchivoPlan } from "@/lib/plan-negocio/docx";
import { exportarProyectoJson, importarProyectoJson, nombreDeArchivoProyecto } from "@/lib/plan-negocio/proyecto";
import { revisarPlanNegocio } from "@/lib/plan-negocio/verificar";
import { ETIQUETAS_CIFRA, FINALIDADES, GRUPOS_RESULTADO, TITULOS_RESPUESTA, type DatosPlanNegocio } from "@/lib/plan-negocio/tipos";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  referencia: DatosPlanNegocio;
  esDeEjemplo: boolean;
  alAviso: (texto: string) => void;
  alExportar: (tipo: "word" | "json" | "imprimir") => void;
  alImportar: (datos: DatosPlanNegocio) => void;
  accionesDeEjemplo: ReactNode;
}

const RE_ETIQUETA = /(\[(?:dato del usuario|c[aá]lculo|supuesto)\])/gi;

function claseDeEtiqueta(tag: string): string {
  const c = tag.toLowerCase();
  const e = c.startsWith("[dato") ? ETIQUETAS_CIFRA[0] : c.startsWith("[calculo") || c.startsWith("[cálculo") ? ETIQUETAS_CIFRA[1] : c.startsWith("[supuesto") ? ETIQUETAS_CIFRA[2] : null;
  return e ? `rounded px-1 py-0.5 text-xs font-bold ${e.clase}` : "";
}

/** Resalta [DATO DEL USUARIO] / [CÁLCULO] / [SUPUESTO] con el mismo color que usa el Word exportado. */
function TextoConEtiquetas({ texto }: { texto: string }) {
  const partes = texto.split(RE_ETIQUETA);
  return <>{partes.map((p, i) => (RE_ETIQUETA.test(p) ? <span key={i} className={claseDeEtiqueta(p)}>{p}</span> : <span key={i}>{p}</span>))}</>;
}

function Seccion({ titulo, texto }: { titulo: string; texto?: string }) {
  if (!texto) {
    return (
      <div>
        <h4 className="mb-1.5 text-sm font-semibold">{titulo}</h4>
        <p className="text-sm text-muted-foreground">La respuesta no trae esta sección.</p>
      </div>
    );
  }
  const lineas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-semibold">{titulo}</h4>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
        {lineas.map((l, i) => (
          <li key={i}>
            <TextoConEtiquetas texto={l.replace(/^[-*•]\s*/, "")} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TablaSeccion({ titulo, tabla }: { titulo: string; tabla: TablaMarkdown | null }) {
  if (!tabla || tabla.filas.length === 0) {
    return (
      <div>
        <h4 className="mb-1.5 text-sm font-semibold">{titulo}</h4>
        <p className="text-sm text-muted-foreground">La respuesta no trae esta tabla en formato markdown.</p>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <h4 className="mb-1.5 text-sm font-semibold">{titulo}</h4>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              {tabla.cabecera.map((c, i) => (
                <th key={i} className="whitespace-nowrap p-2.5 text-left font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabla.filas.map((f, i) => (
              <tr key={i} className="border-t">
                {f.map((c, j) => (
                  <td key={j} className="p-2.5">
                    <TextoConEtiquetas texto={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResultadoPlanNegocio({ respuesta, alCambiar, referencia, esDeEjemplo, alAviso, alExportar, alImportar, accionesDeEjemplo }: Props) {
  const [grupo, setGrupo] = useState(GRUPOS_RESULTADO[0].id);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ayudaId = useId();

  const lectura: LecturaPlanNegocio | null = useMemo(() => (respuesta.trim() ? leerRespuestaPlanNegocio(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarPlanNegocio(lectura, referencia) : null), [lectura, referencia]);
  const valida = Boolean(lectura?.valido);

  async function descargarWord() {
    setError(null);
    setTrabajando(true);
    try {
      const [{ Packer }, { construirDocumentoPlanDocx }] = await Promise.all([import("docx"), import("@/lib/plan-negocio/docx")]);
      const finalidad = FINALIDADES.find((f) => f.valor === referencia.finalidad)?.etiqueta ?? "";
      const blob = await Packer.toBlob(await construirDocumentoPlanDocx(referencia.nombreEmpresa, finalidad, lectura!.secciones));
      descargarBlob(nombreDeArchivoPlan(referencia.nombreEmpresa), blob);
      alExportar("word");
    } catch {
      setError("No se pudo crear el archivo Word. Recarga la página e inténtalo de nuevo.");
    } finally {
      setTrabajando(false);
    }
  }

  function exportarJson() {
    descargarBlob(nombreDeArchivoProyecto(referencia.nombreEmpresa), new Blob([exportarProyectoJson(referencia)], { type: "application/json" }));
    alExportar("json");
  }

  async function importarJson(archivo: File) {
    const texto = await archivo.text();
    const p = importarProyectoJson(texto);
    if (!p) {
      alAviso("Ese archivo no es un proyecto válido de esta herramienta.");
      return;
    }
    alImportar(p.datos);
    alAviso("Proyecto importado: tus datos del paso 1 se reemplazaron.");
  }

  function imprimir() {
    document.body.classList.add("imprimiendo-plan-negocio");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-plan-negocio");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  const motivoDeshabilitado = !respuesta.trim() ? "Pega la respuesta de tu IA para activar la descarga." : lectura && !lectura.valido ? `Descarga desactivada: ${lectura.problema}` : "";

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-plan-negocio" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-plan-negocio" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega la respuesta de tu IA
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">Pega la respuesta de la Fase B completa (con los 19 títulos). Cada cifra trae su origen: dato, cálculo o supuesto.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-plan-negocio" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-plan-negocio"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder="Pega aquí la respuesta completa de tu IA, con los títulos «## Resumen ejecutivo», «## Descripción del negocio»…"
            spellCheck={false}
            aria-describedby={ayudaId}
            aria-invalid={lectura ? !lectura.valido : undefined}
          />
          <p id={ayudaId} className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Si tu IA todavía te está haciendo preguntas (Fase A), respóndelas en el paso 2 primero.
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

          <div className="mt-4 flex flex-col gap-3">
            <button type="button" className="btn btn-primario" disabled={!valida || trabajando} aria-describedby="motivo-descarga-plan" onClick={descargarWord}>
              <Download aria-hidden className="size-4" />
              {trabajando ? "Creando el archivo…" : "Descargar el plan en Word (.docx)"}
            </button>
            <p id="motivo-descarga-plan" className="text-xs text-muted-foreground" aria-live="polite">
              {motivoDeshabilitado}
            </p>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secundario" onClick={exportarJson}>
                <FileJson aria-hidden className="size-4" /> Guardar copia del proyecto (.json)
              </button>
              <label className="btn btn-secundario cursor-pointer">
                <Upload aria-hidden className="size-4" /> Importar un proyecto (.json)
                <input
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void importarJson(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">La copia .json guarda tus datos del formulario (no la respuesta de la IA): sirve para continuar en otro navegador o dispositivo.</p>
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

              <Pestanas etiqueta="Paneles del resultado" prefijo="plan-negocio" pestanas={GRUPOS_RESULTADO.map((g) => ({ id: g.id, etiqueta: g.etiqueta }))} valor={grupo} alCambiar={setGrupo}>
                {GRUPOS_RESULTADO.map(
                  (g) =>
                    grupo === g.id && (
                      <div key={g.id} className="space-y-5">
                        {g.claves.map((clave) => {
                          const titulo = TITULOS_RESPUESTA.find((t) => t.clave === clave)!.titulo;
                          if (clave === "competencia") return <TablaSeccion key={clave} titulo={titulo} tabla={lectura.competencia} />;
                          if (clave === "proyeccion") return <TablaSeccion key={clave} titulo={titulo} tabla={lectura.proyeccion} />;
                          return <Seccion key={clave} titulo={titulo} texto={lectura.secciones[clave]} />;
                        })}
                        {g.id === "numeros" && (
                          <div className="rounded-lg border bg-surface p-3 text-xs text-muted-foreground">
                            Etiquetas encontradas: {lectura.conteoEtiquetas.dato} dato(s), {lectura.conteoEtiquetas.calculo} cálculo(s), {lectura.conteoEtiquetas.supuesto} supuesto(s).
                          </div>
                        )}
                        {g.id === "accion" && (
                          <div>
                            <h4 className="mb-1.5 text-sm font-semibold">Qué revisar antes de usarlo</h4>
                            {revision.avisos.length ? (
                              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-warn">
                                {revision.avisos.map((a) => (
                                  <li key={a}>{a}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">No detecté cifras sin respaldo en tus datos ni en los cálculos de la página.</p>
                            )}
                            <p className="mt-4 rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Este plan fue generado con ayuda de IA y no da asesoría legal, financiera ni contable. Revísalo tú, y si vas a pedir un préstamo o buscar un socio, que alguien más lo revise también.</p>
                            {esDeEjemplo && <p className="mt-2 text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Cifras y competidores son ficticios.</p>}
                          </div>
                        )}
                      </div>
                    ),
                )}
              </Pestanas>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu plan de negocio completo</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA a la izquierda y aparecen las 5 secciones del plan, con cada cifra identificada.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
