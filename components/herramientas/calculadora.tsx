"use client";

import type { EstadoCalculadora } from "@/lib/herramientas/calculadora";
import type { Calculadora as CalculadoraDatos } from "@/lib/herramientas/tipos";
import { CampoFormulario, claseCampo } from "./campo-formulario";

/**
 * Calculadora genérica: las entradas y las fórmulas vienen del archivo de datos. Cada entrada se valida
 * (número, rango) y el resultado sin datos se muestra como «—», nunca inventado. Los cálculos los hace la
 * página; el prompt los recibe ya hechos.
 */
export function Calculadora({
  calculadora,
  entradas,
  onCambio,
  estado,
  moneda,
}: {
  calculadora: CalculadoraDatos;
  entradas: Record<string, string>;
  onCambio: (id: string, valor: string) => void;
  estado: EstadoCalculadora;
  moneda: string;
}) {
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        {calculadora.entradas.map((entrada) => (
          <CampoFormulario key={entrada.id} etiqueta={`${entrada.label}${entrada.unidad === "moneda" ? ` (${moneda})` : entrada.unidad === "porcentaje" ? " (%)" : ""}`} ayuda={entrada.ayuda} error={estado.errores[entrada.id]} requerido={entrada.requerido !== false}>
            {({ id, describedBy, invalid }) => (
              <input id={id} type="text" inputMode="decimal" autoComplete="off" value={entradas[entrada.id] ?? ""} onChange={(e) => onCambio(entrada.id, e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className={claseCampo} />
            )}
          </CampoFormulario>
        ))}
      </div>

      <section aria-labelledby="resultados-calculo" className="mt-6 rounded-xl border bg-guide-surface p-4 sm:p-5">
        <h3 id="resultados-calculo" className="text-base font-semibold text-guide-ink">
          Resultado (lo calcula esta página, no la IA)
        </h3>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2" aria-live="polite">
          {estado.resultados.map((r) => (
            <div key={r.id} className="min-w-0 border-b border-foreground/10 pb-2">
              <dt className="text-sm text-muted-foreground">{r.etiqueta}</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-guide-ink">{r.texto ?? (
                  <>
                    —<span className="sr-only"> sin calcular</span>
                  </>
                )}</dd>
            </div>
          ))}
        </dl>
        {!estado.completo && <p className="mt-3 text-sm text-muted-foreground">Completa los datos que marcan un error y verás todos los resultados. Si copias el prompt así, esas cifras viajan como [FALTA].</p>}
      </section>
    </div>
  );
}
