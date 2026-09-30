"use client";

import { formatoMonto } from "@/lib/presupuesto/calculo";
import type { Resultado } from "@/lib/rentabilidad/calculo";

interface Paso {
  etiqueta: string;
  valor: number;
  /** «resta»: se descuenta del paso anterior (barra en tono de aviso). «resultado»: total acumulado (barra sólida). */
  tipo: "inicio" | "resta" | "resultado";
}

/** Cascada de ingresos → utilidad operativa, sin librerías: una fila por paso, barra proporcional al monto. */
export function GraficoCascada({ r }: { r: Resultado }) {
  const pasos: Paso[] = [
    { etiqueta: "Ingresos", valor: r.ingresosTotal, tipo: "inicio" },
    { etiqueta: "− Costo directo", valor: -r.costoDirectoTotal, tipo: "resta" },
    { etiqueta: "= Utilidad bruta", valor: r.utilidadBruta, tipo: "resultado" },
    { etiqueta: "− Costos variables adicionales", valor: -r.variablesAdicionales, tipo: "resta" },
    { etiqueta: "− Costos fijos", valor: -r.fijos, tipo: "resta" },
    { etiqueta: "= Utilidad operativa", valor: r.utilidadOperativa, tipo: "resultado" },
  ];
  const maximo = Math.max(1, ...pasos.map((p) => Math.abs(p.valor)));
  const resumen = pasos.map((p) => `${p.etiqueta}: S/ ${formatoMonto(p.valor)}`).join(", ");

  return (
    <div>
      <div role="img" aria-label={`Cascada de ingresos a utilidad operativa: ${resumen}`} className="space-y-2">
        {pasos.map((p) => (
          <div key={p.etiqueta} className="grid grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)_auto] items-center gap-2 text-xs sm:text-sm">
            <span className={`block min-w-0 truncate ${p.tipo === "resultado" ? "font-bold" : "font-medium"}`} title={p.etiqueta}>{p.etiqueta}</span>
            <div className="h-6 overflow-hidden rounded bg-surface">
              <div className={`h-full min-w-[2px] rounded ${p.tipo === "resta" ? "bg-warn" : p.valor < 0 ? "bg-destructive" : "bg-ok"}`} style={{ width: `${(Math.abs(p.valor) / maximo) * 100}%` }} />
            </div>
            <span className="whitespace-nowrap text-right text-[0.7rem] font-bold tabular">S/ {formatoMonto(p.valor)}</span>
          </div>
        ))}
      </div>
      <details className="mt-3 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium text-muted-foreground hover:text-foreground">Ver la fórmula de cada paso</summary>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Utilidad bruta</strong> = ingresos (S/ {formatoMonto(r.ingresosTotal)}) − costo directo (S/ {formatoMonto(r.costoDirectoTotal)}) = S/ {formatoMonto(r.utilidadBruta)}.
          </li>
          <li>
            <strong className="text-foreground">Utilidad operativa</strong> = utilidad bruta (S/ {formatoMonto(r.utilidadBruta)}) − variables adicionales (S/ {formatoMonto(r.variablesAdicionales)}) − fijos (S/ {formatoMonto(r.fijos)}) = S/ {formatoMonto(r.utilidadOperativa)}.
          </li>
        </ul>
      </details>
    </div>
  );
}
