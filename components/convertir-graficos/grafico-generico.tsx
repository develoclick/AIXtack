"use client";

import { useEffect, useRef } from "react";
import type { Chart as ChartJs, ChartConfiguration, ChartType } from "chart.js";
import type { Punto } from "@/lib/convertir-graficos/motor";
import type { TipoGrafico } from "@/lib/convertir-graficos/tipos";

const PALETA = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4", "#f97316"];

interface Props {
  titulo: string;
  tipo: TipoGrafico;
  etiquetas: string[];
  series: { nombre: string; valores: number[] }[];
  puntos?: Punto[];
  formatoValor?: (n: number) => string;
  vacio?: string;
  /** Muestra un botón «Descargar PNG» que exporta el canvas tal cual, con `chart.toBase64Image()` (sin subir nada a ningún servidor). */
  descargable?: boolean;
}

/**
 * Dibuja cualquiera de los 7 tipos de gráfico con Chart.js (se carga solo al mostrarse). Las barras, líneas y el histograma
 * nunca truncan el eje Y (siempre empieza en 0): esta página nunca dibuja un gráfico engañoso, aunque la IA lo sugiera. Como
 * un gráfico en canvas no es accesible por sí solo, siempre va acompañado de su resumen en `aria-label` y, salvo en
 * dispersión, de una tabla de datos plegable con los mismos números.
 */
export function GraficoGenerico({ titulo, tipo, etiquetas, series, puntos, formatoValor = (n) => String(n), vacio = "Sin datos suficientes para este gráfico.", descargable = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanciaRef = useRef<ChartJs | null>(null);
  const sinDatos = tipo === "dispersion" ? !puntos || puntos.length === 0 : etiquetas.length === 0;

  useEffect(() => {
    if (!canvasRef.current || sinDatos || tipo === "tabla") return;
    let cancelado = false;
    (async () => {
      const { Chart, registerables } = await import("chart.js");
      if (cancelado || !canvasRef.current) return;
      Chart.register(...registerables);
      instanciaRef.current?.destroy();

      const tipoChart: ChartType = tipo === "barras" || tipo === "histograma" ? "bar" : tipo === "lineas" || tipo === "areas" ? "line" : tipo === "dispersion" ? "scatter" : "pie";

      const data =
        tipo === "dispersion"
          ? { datasets: [{ label: titulo, data: puntos, backgroundColor: PALETA[0] }] }
          : {
              labels: etiquetas,
              datasets: series.map((s, i) => ({
                label: s.nombre || titulo,
                data: s.valores,
                backgroundColor: tipo === "pastel" ? etiquetas.map((_, j) => PALETA[j % PALETA.length]) : tipo === "areas" ? `${PALETA[i % PALETA.length]}33` : PALETA[i % PALETA.length],
                borderColor: PALETA[i % PALETA.length],
                fill: tipo === "areas",
                tension: tipo === "lineas" || tipo === "areas" ? 0.25 : 0,
                borderRadius: tipo === "barras" || tipo === "histograma" ? 4 : 0,
              })),
            };

      // Chart.js tipa sus datasets según un único tipo de gráfico a la vez; aquí el tipo varía en tiempo de ejecución
      // según `tipo`, así que el config se arma con datos ya validados y se pasa como el tipo genérico de Chart.js,
      // sin que TS intente unificar los 4 tipos de gráfico que puede pedir esta página.
      const config: ChartConfiguration = {
        type: tipoChart,
        data: data as ChartConfiguration["data"],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: tipo === "pastel" || series.length > 1 },
            tooltip: { callbacks: { label: (ctx) => (tipo === "dispersion" ? `(${ctx.parsed.x}, ${ctx.parsed.y})` : formatoValor(Number(ctx.raw))) } },
          },
          scales: tipo === "pastel" ? undefined : tipo === "dispersion" ? { x: { type: "linear", position: "bottom" } } : { y: { beginAtZero: true, ticks: { callback: (v) => formatoValor(Number(v)) } } },
        },
      };
      instanciaRef.current = new Chart(canvasRef.current, config);
    })();
    return () => {
      cancelado = true;
      instanciaRef.current?.destroy();
      instanciaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titulo, tipo, etiquetas.join("|"), JSON.stringify(series), JSON.stringify(puntos)]);

  if (sinDatos) return <p className="text-sm text-muted-foreground">{vacio}</p>;

  const resumenAria = tipo === "dispersion" ? `${titulo}: ${puntos!.length} puntos` : `${titulo}: ${etiquetas.map((e, i) => `${e}, ${series.map((s) => formatoValor(s.valores[i])).join(" / ")}`).join("; ")}`;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{titulo}</p>
      {tipo === "tabla" ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="p-2 font-semibold">Categoría</th>
                {series.map((s) => (
                  <th key={s.nombre || "valor"} className="p-2 font-semibold">
                    {s.nombre || "Valor"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {etiquetas.map((e, i) => (
                <tr key={e}>
                  <td className="p-2">{e}</td>
                  {series.map((s) => (
                    <td key={s.nombre || "valor"} className="p-2 tabular">
                      {formatoValor(s.valores[i])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div role="img" aria-label={resumenAria} style={{ height: 260 }}>
            <canvas ref={canvasRef} />
          </div>
          {descargable && (
            <button
              type="button"
              className="btn btn-secundario mt-2 text-xs"
              onClick={() => {
                if (!instanciaRef.current) return;
                const el = document.createElement("a");
                el.href = instanciaRef.current.toBase64Image();
                el.download = `${titulo.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "grafico"}.png`;
                el.click();
              }}
            >
              Descargar PNG
            </button>
          )}
          {tipo !== "dispersion" && (
            <details className="mt-2 text-xs">
              <summary className="flex min-h-11 cursor-pointer items-center text-muted-foreground">Ver los datos (tabla)</summary>
              <table className="mt-1 w-full text-left">
                <thead>
                  <tr>
                    <th className="pb-1 pr-3 font-semibold text-muted-foreground">Categoría</th>
                    {series.map((s) => (
                      <th key={s.nombre || "valor"} className="pb-1 pr-3 font-semibold text-muted-foreground">
                        {s.nombre || "Valor"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {etiquetas.map((e, i) => (
                    <tr key={e} className="border-t">
                      <td className="py-1 pr-3 text-muted-foreground">{e}</td>
                      {series.map((s) => (
                        <td key={s.nombre || "valor"} className="py-1 pr-3 font-medium tabular">
                          {formatoValor(s.valores[i])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </>
      )}
    </div>
  );
}
