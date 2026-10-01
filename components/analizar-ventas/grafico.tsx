"use client";

import { useEffect, useRef } from "react";
import type { Chart as ChartJs } from "chart.js";

interface Props {
  titulo: string;
  tipo: "linea" | "barra";
  etiquetas: string[];
  valores: number[];
  formatoValor?: (n: number) => string;
  colorHex?: string;
  vacio?: string;
}

/**
 * Gráfico de línea o barras con Chart.js (se carga solo al mostrarse, nunca en la carga inicial de la página). Como un
 * gráfico en canvas no es accesible por sí solo, siempre va acompañado de su resumen en `aria-label` y de una tabla de
 * datos plegable con los mismos números.
 */
export function Grafico({ titulo, tipo, etiquetas, valores, formatoValor = (n) => String(n), colorHex = "#10b981", vacio = "Sin datos suficientes para este gráfico." }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanciaRef = useRef<ChartJs | null>(null);

  useEffect(() => {
    if (!canvasRef.current || etiquetas.length === 0) return;
    let cancelado = false;
    (async () => {
      const { Chart, registerables } = await import("chart.js");
      if (cancelado || !canvasRef.current) return;
      Chart.register(...registerables);
      instanciaRef.current?.destroy();
      instanciaRef.current = new Chart(canvasRef.current, {
        type: tipo === "linea" ? "line" : "bar",
        data: {
          labels: etiquetas,
          datasets: [{ data: valores, borderColor: colorHex, backgroundColor: tipo === "linea" ? `${colorHex}33` : colorHex, fill: tipo === "linea", tension: 0.25, borderRadius: tipo === "barra" ? 4 : 0 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatoValor(Number(ctx.raw)) } } },
          scales: { y: { ticks: { callback: (v) => formatoValor(Number(v)) } } },
        },
      });
    })();
    return () => {
      cancelado = true;
      instanciaRef.current?.destroy();
      instanciaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titulo, tipo, colorHex, etiquetas.join("|"), valores.join("|")]);

  if (etiquetas.length === 0) return <p className="text-sm text-muted-foreground">{vacio}</p>;

  const resumenAria = `${titulo}: ${etiquetas.map((e, i) => `${e}, ${formatoValor(valores[i])}`).join("; ")}`;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{titulo}</p>
      <div role="img" aria-label={resumenAria} style={{ height: 220 }}>
        <canvas ref={canvasRef} />
      </div>
      <details className="mt-2 text-xs">
        <summary className="flex min-h-11 cursor-pointer items-center text-muted-foreground">Ver los datos (tabla)</summary>
        <table className="mt-1 w-full text-left">
          <tbody>
            {etiquetas.map((e, i) => (
              <tr key={e} className="border-t">
                <td className="py-1 pr-3 text-muted-foreground">{e}</td>
                <td className="py-1 font-medium tabular">{formatoValor(valores[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
