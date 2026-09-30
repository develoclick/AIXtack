"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Download, FileText, Info, Printer } from "lucide-react";
import { descargarBlob } from "@/components/plan/descargar";
import { GraficoTornado } from "./grafico-tornado";
import { csvDeInforme } from "@/lib/rentabilidad/csv";
import { calcularResultado, calcularSensibilidad } from "@/lib/rentabilidad/calculo";
import { leerRespuestaRentabilidad, type LecturaRentabilidad } from "@/lib/rentabilidad/lector";
import { revisarRentabilidad } from "@/lib/rentabilidad/verificar";
import { TITULOS_RESPUESTA, type DatosRentabilidad } from "@/lib/rentabilidad/tipos";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  referencia: DatosRentabilidad;
  esDeEjemplo: boolean;
  alExportar: (tipo: "csv" | "imprimir") => void;
  accionesDeEjemplo: ReactNode;
}

const RE_HIPOTESIS = /(\[hip[oó]tesis\])/gi;

function TextoConEtiqueta({ texto }: { texto: string }) {
  const partes = texto.split(RE_HIPOTESIS);
  return <>{partes.map((p, i) => (RE_HIPOTESIS.test(p) ? <span key={i} className="rounded bg-warn-muted px-1 py-0.5 text-xs font-bold text-warn">{p}</span> : <span key={i}>{p}</span>))}</>;
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
            <TextoConEtiqueta texto={l.replace(/^[-*•]\s*/, "")} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResultadoRentabilidad({ respuesta, alCambiar, referencia, esDeEjemplo, alExportar, accionesDeEjemplo }: Props) {
  const ayudaId = useId();
  const [error, setError] = useState<string | null>(null);

  const lectura: LecturaRentabilidad | null = useMemo(() => (respuesta.trim() ? leerRespuestaRentabilidad(respuesta) : null), [respuesta]);
  const revision = useMemo(() => (lectura?.valido ? revisarRentabilidad(lectura, referencia) : null), [lectura, referencia]);
  const resultado = useMemo(() => calcularResultado(referencia), [referencia]);
  const sensibilidad = useMemo(() => calcularSensibilidad(referencia), [referencia]);
  const valida = Boolean(lectura?.valido);

  function exportarCsv() {
    try {
      descargarBlob("informe-de-rentabilidad.csv", new Blob([csvDeInforme(referencia)], { type: "text/csv;charset=utf-8" }));
      alExportar("csv");
    } catch {
      setError("No se pudo crear el archivo .csv. Recarga la página e inténtalo de nuevo.");
    }
  }

  function imprimir() {
    document.body.classList.add("imprimiendo-rentabilidad");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-rentabilidad");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-rentabilidad" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-rentabilidad" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega la respuesta de tu IA
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">La IA interpreta tu cálculo; no lo recalcula. Cada afirmación sobre el comportamiento de tus clientes trae la etiqueta «[HIPÓTESIS]».</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-rentabilidad" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-rentabilidad"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder="Pega aquí la respuesta completa de tu IA, con los títulos «## Resumen», «## Rentabilidad por producto»…"
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

          <div className="mt-4 flex flex-col gap-3">
            <button type="button" className="btn btn-primario" disabled={!resultado} onClick={exportarCsv}>
              <Download aria-hidden className="size-4" /> Descargar el informe (.csv)
            </button>
            <button type="button" className="btn btn-secundario" disabled={!valida} onClick={imprimir}>
              <Printer aria-hidden className="size-4" /> Imprimir o guardar manual en PDF
            </button>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground">El .csv trae el detalle por producto y el resultado del período: se puede abrir en Excel o Google Sheets.</p>
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          {resultado && sensibilidad && (
            <div className="mb-6">
              <h3 className="mb-2 text-base font-semibold">Sensibilidad (±10 %)</h3>
              <GraficoTornado filas={sensibilidad} base={resultado.utilidadOperativa} />
            </div>
          )}

          {valida && lectura && revision ? (
            <div className="aparecer space-y-5">
              {TITULOS_RESPUESTA.map((t) => (
                <Seccion key={t.clave} titulo={t.titulo} texto={lectura.secciones[t.clave]} />
              ))}
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
                <p className="mt-4 rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Este análisis fue generado con ayuda de IA y no es una auditoría contable ni asesoría financiera o tributaria. Revísalo tú antes de tomar decisiones de precio o de inversión.</p>
                {esDeEjemplo && <p className="mt-2 text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Negocio y cifras son ficticios.</p>}
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás la interpretación de tu IA</p>
              <p className="max-w-xs text-sm text-muted-foreground">{resultado ? "Pega la respuesta de tu IA a la izquierda y aparecen las 7 secciones del análisis." : "Agrega al menos un producto en el paso 1 y pega la respuesta de tu IA a la izquierda."}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
