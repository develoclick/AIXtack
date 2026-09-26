"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check, ClipboardCopy, Download, FileText, Info, Lightbulb } from "lucide-react";
import { useDatosCv } from "./almacen";
import { copiarTexto } from "./copiar";
import { VistaCv } from "./vista-cv";
import { cvDesdeDatos } from "@/lib/cv/desde-datos";
import { leerRespuestaIa } from "@/lib/cv/parser";
import { promptDeCorreccionFormato } from "@/lib/cv/prompt";
import type { CvDocumento } from "@/lib/cv/tipos";

async function descargarWord(cv: CvDocumento, nombreArchivo?: string) {
  // La librería del Word (docx) se carga solo cuando la persona pulsa el botón.
  const [{ Packer }, { construirDocumentoDocx, nombreDeArchivo }] = await Promise.all([import("docx"), import("@/lib/cv/docx")]);
  const blob = await Packer.toBlob(await construirDocumentoDocx(cv));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo ?? nombreDeArchivo(cv.nombre);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  /** La respuesta pegada es una de las de ejemplo: el archivo se llama CV-ejemplo-harvard.docx. */
  esDeEjemplo: boolean;
  alDescargar: (esEjemplo: boolean) => void;
  /** Botón «Llenar con datos de ejemplo» del paso 3 (a la derecha del título). */
  accionesDeEjemplo: ReactNode;
}

export function ConvertirWord({ respuesta, alCambiar, esDeEjemplo, alDescargar, accionesDeEjemplo }: Props) {
  const datos = useDatosCv();
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [paginas, setPaginas] = useState(1);
  const hoja = useRef<HTMLDivElement>(null);
  const ayudaId = useId();

  const lectura = useMemo(() => (respuesta.trim() ? leerRespuestaIa(respuesta) : null), [respuesta]);
  const borrador = useMemo(() => cvDesdeDatos(datos), [datos]);
  const borradorUtil = borrador.nombre !== "" && borrador.secciones.length > 0;
  const puedeBajar = Boolean(lectura?.valido) && !trabajando;

  // ¿Cuántas hojas A4 ocupa el CV en la vista previa? (alto de la hoja ÷ alto de un A4 a ese ancho)
  useEffect(() => {
    const el = hoja.current?.querySelector<HTMLElement>("[data-vista-cv]");
    if (!el) return;
    const medir = () => setPaginas(Math.max(1, Math.ceil((el.offsetHeight / el.offsetWidth) / (297 / 210) - 0.02)));
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [lectura?.valido, respuesta]);

  async function bajar(cv: CvDocumento, esEjemplo: boolean) {
    setError(null);
    setTrabajando(true);
    try {
      await descargarWord(cv, esEjemplo ? "CV-ejemplo-harvard.docx" : undefined);
      alDescargar(esEjemplo);
    } catch {
      setError("No se pudo crear el archivo Word. Recarga la página e inténtalo de nuevo.");
    } finally {
      setTrabajando(false);
    }
  }

  const motivoDeshabilitado = !respuesta.trim()
    ? "Pega la respuesta de tu IA para activar la descarga."
    : lectura && !lectura.valido
      ? `Descarga desactivada: ${lectura.problema}`
      : "";

  return (
    <section id="paso-3" aria-labelledby="titulo-word" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-word" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Convierte la respuesta de la IA en tu Word
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Pega la respuesta completa de tu IA y descarga tu hoja de vida en formato Harvard: un archivo .docx de una sola columna, con texto real, sin tablas ni imágenes, para que los filtros ATS lo lean bien.
          </p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="respuesta-ia" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-ia"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nEmpieza con «NOMBRE: …» y sigue con las secciones (PERFIL PROFESIONAL, EXPERIENCIA PROFESIONAL…)."}
            spellCheck={false}
            aria-describedby={ayudaId}
            aria-invalid={lectura ? !lectura.valido : undefined}
          />
          <p id={ayudaId} className="mt-2 flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <Lightbulb aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <strong className="font-semibold text-foreground">Tip:</strong> usa el botón Copiar de tu IA en lugar de seleccionar el texto. Si lo seleccionas con el mouse, la página lo entiende igual, pero copiar con el botón es más seguro.
            </span>
          </p>

          {/* Mensajes de validación: se anuncian a los lectores de pantalla. */}
          <div role="status" aria-live="polite" className="mt-3 space-y-3">
            {lectura && !lectura.valido && (
              <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                <div>
                  <p className="font-semibold">Todavía no puedo armar tu CV</p>
                  <p className="mt-1">{lectura.problema}</p>
                  <p className="mt-2">Si tu IA respondió con otro formato, pídele que lo corrija con este mensaje:</p>
                  <button
                    type="button"
                    className="btn btn-secundario mt-2 text-sm"
                    onClick={async () => {
                      setCopiado(await copiarTexto(promptDeCorreccionFormato()));
                      setTimeout(() => setCopiado(false), 3000);
                    }}
                  >
                    {copiado ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
                    {copiado ? "Copiado" : "Copiar mensaje de corrección"}
                  </button>
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
            <button type="button" className="btn btn-primario" disabled={!puedeBajar} aria-describedby="motivo-descarga" onClick={() => lectura?.valido && bajar(lectura.documento, esDeEjemplo)}>
              <Download aria-hidden className="size-4" />
              {trabajando ? "Creando el archivo…" : "Descargar mi CV en Word (.docx)"}
            </button>
            <p id="motivo-descarga" className="text-xs text-muted-foreground" aria-live="polite">
              {motivoDeshabilitado}
            </p>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <button type="button" className="btn btn-texto self-start" disabled={!borradorUtil || trabajando} onClick={() => bajar(borrador, false)}>
              <FileText aria-hidden className="size-4" /> O descarga un borrador con mis datos tal cual, sin IA
            </button>
            {!borradorUtil && <p className="text-xs text-muted-foreground">El borrador sin IA se activa cuando escribes tu nombre y un dato de experiencia o educación en el paso 1.</p>}
          </div>
        </div>

        <div className="min-w-0" ref={hoja}>
          {lectura?.valido ? (
            <div className="aparecer">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">Vista previa (hoja A4)</p>
                <p className="text-xs text-muted-foreground tabular">{paginas === 1 ? "1 página" : `${paginas} páginas aprox.`}</p>
              </div>
              <VistaCv cv={lectura.documento} />
              {paginas > 1 && <p className="mt-2 text-xs text-muted-foreground">Tu CV ocupa más de una página. Para una hoja de vida de 1 página, pídele a la IA que la acorte (por ejemplo: «acórtala a una página priorizando lo más relevante para la oferta»).</p>}
              {lectura.notas.length > 0 && (
                <details className="tarjeta mt-4 p-4 text-sm">
                  <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold">
                    <Lightbulb aria-hidden className="size-4 text-brand" />
                    Recomendaciones de la IA ({lectura.notas.length}) <span className="font-normal text-muted-foreground">· no van en el Word</span>
                  </summary>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5">
                    {lectura.notas.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás tu hoja de vida</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA a la izquierda y la vista previa aparece al instante, sin recargar.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
