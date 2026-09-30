"use client";

import { formatoMonto } from "@/lib/presupuesto/calculo";
import type { CalculoProducto } from "@/lib/rentabilidad/calculo";

/** Colores por producto. Cada barra también aparece en la tabla de datos, así que el color no es lo único que informa. */
const COLORES = ["#0f766e", "#2563eb", "#7c3aed", "#c026d3", "#db2777", "#ea580c", "#ca8a04", "#65a30d", "#16a34a", "#0891b2", "#4f46e5", "#9333ea", "#64748b", "#b45309"];

/** Barras horizontales de contribución total por producto, sin librerías: cada barra escalada al producto con mayor contribución. */
export function GraficoContribucion({ productos }: { productos: CalculoProducto[] }) {
  const maximo = Math.max(1, ...productos.map((p) => Math.abs(p.contribucionTotal)));
  const resumen = productos.map((p) => `${p.nombre}: S/ ${formatoMonto(p.contribucionTotal)} (${p.margenPct} % de margen)`).join(", ");

  return (
    <div>
      <div role="img" aria-label={`Contribución total por producto: ${resumen}`} className="space-y-2.5">
        {productos.map((p, i) => (
          <div key={p.id} className="grid grid-cols-[minmax(6rem,10rem)_minmax(0,1fr)_auto] items-center gap-2 text-xs sm:text-sm">
            <span className="block min-w-0 truncate font-medium" title={p.nombre}>
              {p.nombre}
            </span>
            <div className="h-6 overflow-hidden rounded bg-surface">
              <div className="h-full min-w-[2px] rounded" style={{ width: `${(Math.abs(p.contribucionTotal) / maximo) * 100}%`, background: COLORES[i % COLORES.length] }} />
            </div>
            <span className="whitespace-nowrap text-right text-[0.7rem] font-bold tabular">S/ {formatoMonto(p.contribucionTotal)}</span>
          </div>
        ))}
      </div>
      <details className="mt-3 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium text-muted-foreground hover:text-foreground">Ver los datos del gráfico (tabla)</summary>
        <div className="mt-2 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {["Producto", "Ingresos", "Contribución total", "Margen"].map((h) => (
                  <th key={h} className="whitespace-nowrap p-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2 tabular">S/ {formatoMonto(p.ingresos)}</td>
                  <td className="p-2 tabular">S/ {formatoMonto(p.contribucionTotal)}</td>
                  <td className="p-2 tabular">{p.margenPct} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
