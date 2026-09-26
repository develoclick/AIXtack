"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ClipboardCopy, Download, FileText } from "lucide-react";
import { useDatosCv } from "./almacen";
import { copiarTexto } from "./copiar";
import { VistaCv } from "./vista-cv";
import { cvDesdeDatos } from "@/lib/cv/desde-datos";
import { leerRespuestaIa } from "@/lib/cv/parser";
import { promptDeCorreccionFormato } from "@/lib/cv/prompt";
import type { CvDocumento } from "@/lib/cv/tipos";

async function descargarWord(cv: CvDocumento) {
  // La librería del Word (docx) se carga solo cuando la persona pulsa el botón.
  const [{ Packer }, { construirDocumentoDocx, nombreDeArchivo }] = await Promise.all([import("docx"), import("@/lib/cv/docx")]);
  const blob = await Packer.toBlob(await construirDocumentoDocx(cv));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreDeArchivo(cv.nombre);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function ConvertirWord() {
  const datos = useDatosCv();
  const [respuesta, setRespuesta] = useState("");
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const lectura = useMemo(() => (respuesta.trim() ? leerRespuestaIa(respuesta) : null), [respuesta]);
  const borrador = useMemo(() => cvDesdeDatos(datos), [datos]);
  const borradorUtil = borrador.nombre !== "" && borrador.secciones.length > 0;

  async function bajar(cv: CvDocumento) {
    setError(null);
    setTrabajando(true);
    try {
      await descargarWord(cv);
    } catch {
      setError("No se pudo crear el archivo Word. Recarga la página e inténtalo de nuevo.");
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <section id="word" aria-labelledby="titulo-word" className="scroll-mt-24 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          3
        </span>
        <div>
          <h2 id="titulo-word" className="text-xl font-semibold leading-tight">
            Convierte la respuesta de la IA en tu archivo Word
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Copia la respuesta completa de tu IA, pégala aquí y descarga tu hoja de vida en formato Harvard, en un archivo .docx con una sola columna y texto real, sin tablas ni imágenes, para que los filtros ATS lo lean bien.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="respuesta-ia" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-ia"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder={"Pega aquí la respuesta completa de la IA.\nDebe empezar con «NOMBRE: …» y tener secciones «## …»."}
            spellCheck={false}
          />
          {lectura && !lectura.valido && (
            <div role="alert" className="mt-3 flex gap-3 rounded-xl border border-warn/40 bg-warn-muted p-4 text-sm">
              <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
              <div>
                <p className="font-semibold">La respuesta no tiene el formato esperado</p>
                <p className="mt-1">{lectura.problema}</p>
                <p className="mt-2">Pídele a tu IA que la corrija con este mensaje:</p>
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

          <div className="mt-4 flex flex-col gap-3">
            <button type="button" className="btn btn-primario" disabled={!lectura?.valido || trabajando} onClick={() => lectura?.valido && bajar(lectura.documento)}>
              <Download aria-hidden className="size-4" />
              {trabajando ? "Creando el archivo…" : "Descargar mi CV en Word (.docx)"}
            </button>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <button type="button" className="btn btn-texto self-start" disabled={!borradorUtil || trabajando} onClick={() => bajar(borrador)}>
              <FileText aria-hidden className="size-4" /> O descarga un borrador con mis datos tal cual, sin IA
            </button>
            {!borradorUtil && <p className="text-xs text-muted-foreground">Para el borrador sin IA escribe al menos tu nombre y un dato de experiencia o educación.</p>}
          </div>
        </div>

        <div aria-live="polite">
          {lectura?.valido ? (
            <>
              <p className="mb-2 text-sm font-semibold">Vista previa de tu hoja de vida</p>
              <VistaCv cv={lectura.documento} />
              {lectura.notas.length > 0 && (
                <div className="mt-4 rounded-xl border bg-brand-muted p-4 text-sm">
                  <p className="font-semibold">Notas de la IA para ti (no van en el Word)</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {lectura.notas.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full min-h-56 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Aquí verás la vista previa de tu hoja de vida cuando pegues la respuesta de la IA.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
