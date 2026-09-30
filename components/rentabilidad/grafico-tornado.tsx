"use client";

import { formatoMonto } from "@/lib/presupuesto/calculo";
import type { Sensibilidad } from "@/lib/rentabilidad/calculo";

/** Tornado de sensibilidad ±10 %: 2 barras por variable, una a cada lado de la utilidad actual, ordenadas de mayor a menor impacto. */
export function GraficoTornado({ filas, base }: { filas: Sensibilidad[]; base: number }) {
  const maximo = Math.max(1, ...filas.map((f) => Math.max(Math.abs(f.menos10 - base), Math.abs(f.mas10 - base))));
  const resumen = filas.map((f) => `${f.etiqueta}: de S/ ${formatoMonto(f.menos10)} a S/ ${formatoMonto(f.mas10)}`).join(", ");

  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">
        Utilidad actual: <strong className="font-semibold text-foreground tabular">S/ {formatoMonto(base)}</strong>. Cada barra mueve <strong className="font-semibold text-foreground">una sola variable</strong> ±10 %; las demás se quedan igual.
      </p>
      <div role="img" aria-label={`Sensibilidad de la utilidad operativa a ±10 % en cada variable: ${resumen}`} className="space-y-2.5">
        {filas.map((f) => {
          const izq = ((base - f.menos10) / maximo) * 50;
          const der = ((f.mas10 - base) / maximo) * 50;
          return (
            <div key={f.clave} className="grid grid-cols-[minmax(7rem,9rem)_auto_minmax(0,1fr)_auto] items-center gap-2 text-xs sm:text-sm">
              <span className="block min-w-0 truncate font-medium" title={f.etiqueta}>{f.etiqueta}</span>
              <span className="whitespace-nowrap text-right font-bold tabular">S/ {formatoMonto(f.menos10)}</span>
              <div className="relative flex h-6 items-center rounded bg-surface">
                <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/30" aria-hidden />
                <div className="flex w-1/2 justify-end">
                  <div className="h-6 min-w-[2px] rounded-l bg-destructive/80" style={{ width: `${Math.max(izq, 0)}%` }} />
                </div>
                <div className="flex w-1/2 justify-start">
                  <div className="h-6 min-w-[2px] rounded-r bg-ok" style={{ width: `${Math.max(der, 0)}%` }} />
                </div>
              </div>
              <span className="whitespace-nowrap text-left font-bold tabular">S/ {formatoMonto(f.mas10)}</span>
            </div>
          );
        })}
      </div>
      <details className="mt-3 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium text-muted-foreground hover:text-foreground">Ver los datos del gráfico (±5 % y ±10 %)</summary>
        <div className="mt-2 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {["Variable", "−10 %", "−5 %", "+5 %", "+10 %"].map((h) => (
                  <th key={h} className="whitespace-nowrap p-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.clave} className="border-t">
                  <td className="p-2">{f.etiqueta}</td>
                  <td className="p-2 tabular">S/ {formatoMonto(f.menos10)}</td>
                  <td className="p-2 tabular">S/ {formatoMonto(f.menos5)}</td>
                  <td className="p-2 tabular">S/ {formatoMonto(f.mas5)}</td>
                  <td className="p-2 tabular">S/ {formatoMonto(f.mas10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
