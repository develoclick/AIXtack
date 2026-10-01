"use client";

import { useId, useMemo, type ReactNode } from "react";
import { AlertTriangle, FileText, Info, Printer } from "lucide-react";
import { calcularParaTipo } from "@/lib/convertir-graficos/motor";
import { leerRespuestaConvertirGraficos, TITULOS_RESPUESTA, type LecturaConvertirGraficos } from "@/lib/convertir-graficos/lector";
import { revisarConvertirGraficos } from "@/lib/convertir-graficos/verificar";
import type { DatosConvertirGraficos, FichaDataset, FilaTabla } from "@/lib/convertir-graficos/tipos";
import { GraficoGenerico } from "./grafico-generico";

interface Props {
  respuesta: string;
  alCambiar: (texto: string) => void;
  datos: DatosConvertirGraficos;
  ficha: FichaDataset | null;
  filas: FilaTabla[];
  esDeEjemplo: boolean;
  alExportar: (tipo: "imprimir") => void;
  accionesDeEjemplo: ReactNode;
}

function Lista({ items, vacio }: { items: string[]; vacio: string }) {
  return items.length ? (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">{vacio}</p>
  );
}

export function ResultadoGraficos({ respuesta, alCambiar, datos, ficha, filas, esDeEjemplo, alExportar, accionesDeEjemplo }: Props) {
  const ayudaId = useId();
  const lectura: LecturaConvertirGraficos | null = useMemo(() => (respuesta.trim() ? leerRespuestaConvertirGraficos(respuesta) : null), [respuesta]);
  const valida = Boolean(lectura?.valido);
  const revision = useMemo(() => (lectura?.valido && ficha ? revisarConvertirGraficos(lectura, datos, ficha, filas) : null), [lectura, datos, ficha, filas]);
  const unidad = datos.unidad.trim();
  const formato = (n: number) => (unidad ? `${unidad} ${n.toLocaleString("es-PE")}` : n.toLocaleString("es-PE"));

  function imprimir() {
    document.body.classList.add("imprimiendo-graficos");
    const quitar = () => {
      document.body.classList.remove("imprimiendo-graficos");
      window.removeEventListener("afterprint", quitar);
    };
    window.addEventListener("afterprint", quitar);
    alExportar("imprimir");
    window.print();
  }

  return (
    <section id="paso-3" aria-labelledby="titulo-resultado-graficos" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="titulo-resultado-graficos" className="text-xl font-semibold leading-tight sm:text-2xl">
            3. Pega la respuesta de tu IA
          </h2>
          <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">Esta página dibuja cada gráfico que propone tu IA con los datos reales de tu tabla: la IA elige las columnas y el tipo, nunca los números.</p>
        </div>
        <div className="sm:w-64 sm:shrink-0">{accionesDeEjemplo}</div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0">
          <label htmlFor="respuesta-graficos" className="mb-1.5 block text-sm font-semibold">
            Respuesta de la IA
          </label>
          <textarea
            id="respuesta-graficos"
            className="campo min-h-72 font-mono text-[0.8125rem]"
            value={respuesta}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder="Pega aquí la respuesta completa de tu IA, con los títulos «## Gráficos sugeridos», «## Hallazgos visibles»…"
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
          {valida && lectura && ficha ? (
            <div className="aparecer space-y-6">
              <div className="flex flex-wrap gap-2" data-no-imprimir>
                <button type="button" className="btn btn-secundario" onClick={imprimir}>
                  <Printer aria-hidden className="size-4" /> Descargar informe en PDF
                </button>
              </div>

              {revision && (revision.cifras.montos.length > 0 || revision.cifras.porcentajes.length > 0 || revision.avisos.length > 0) && (
                <div className="flex gap-3 rounded-lg border border-warn/50 bg-warn-muted p-4 text-sm">
                  <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warn" />
                  <div className="min-w-0 space-y-2">
                    <p className="font-semibold">Revisa antes de confiar en el resultado</p>
                    {revision.cifras.montos.length > 0 && (
                      <p className="break-words">
                        Montos que no están en la ficha de tu tabla: <strong>{revision.cifras.montos.join(", ")}</strong>.
                      </p>
                    )}
                    {revision.cifras.porcentajes.length > 0 && (
                      <p className="break-words">
                        Porcentajes que no están en la ficha: <strong>{revision.cifras.porcentajes.join(", ")}</strong>.
                      </p>
                    )}
                    {revision.avisos.map((a) => (
                      <p key={a} className="break-words text-muted-foreground">
                        {a}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 text-base font-semibold">Gráficos sugeridos ({lectura.graficos.length})</h3>
                <div className="space-y-6">
                  {lectura.graficos.map((g, i) => {
                    const dg = calcularParaTipo(filas, g.tipo, g.x, g.y, g.color || null, g.agregacion);
                    return (
                      <div key={i} className="rounded-lg border bg-surface p-3">
                        {g.pregunta && <p className="mb-1 text-xs text-muted-foreground">{g.pregunta}</p>}
                        <GraficoGenerico titulo={g.titulo || `${g.tipo} de ${g.x}`} tipo={g.tipo} etiquetas={dg.etiquetas} series={dg.series} puntos={dg.puntos} formatoValor={formato} descargable vacio="No pude calcular este gráfico: revisa que la columna exista en tu tabla." />
                        {g.advertencia && g.advertencia.toLowerCase() !== "ninguna" && <p className="mt-2 text-xs text-warn">{g.advertencia}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {(["hallazgos", "transformaciones", "guia", "verificar", "siguiente"] as const).map((clave) => {
                const t = TITULOS_RESPUESTA.find((x) => x.clave === clave)!;
                return (
                  <div key={clave}>
                    <h3 className="mb-2 text-base font-semibold">{t.titulo}</h3>
                    <Lista items={lectura[clave]} vacio="La respuesta no trae esta sección." />
                  </div>
                );
              })}

              <p className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">Cada gráfico lo dibuja esta página con los datos reales de tu tabla: la IA solo propuso qué columnas y qué tipo usar.</p>
              {esDeEjemplo && <p className="text-xs text-muted-foreground">Respuesta de ejemplo: ilustrativa, no de una IA real. Los hallazgos son ficticios.</p>}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Aquí verás los gráficos que sugiere tu IA, dibujados con tus datos reales</p>
              <p className="max-w-xs text-sm text-muted-foreground">Pega la respuesta de tu IA a la izquierda y aparecen entre 3 y 6 gráficos, cada uno con su título y su advertencia.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
