import { formatoPorcentaje, type Calculo } from "@/lib/presupuesto/calculo";

const SEGMENTOS = [
  { clave: "conocido", etiqueta: "Conocido (con precio real)", color: "var(--ok)" },
  { clave: "estimado", etiqueta: "Estimado", color: "var(--warn)" },
  { clave: "opcional", etiqueta: "Opcional", color: "var(--foreground-2)" },
  { clave: "imprevistos", etiqueta: "Imprevistos", color: "var(--danger)" },
] as const;

/**
 * Barra «conocido vs estimado»: qué parte del total (con imprevistos) está respaldada por precios reales. Cada tramo lleva su
 * porcentaje escrito en la leyenda para que no dependa solo del color. Componente sin estado: sirve en la herramienta y en la guía.
 */
export function BarraReparto({ porcentajes }: { porcentajes: Calculo["porcentajes"] }) {
  const resumen = SEGMENTOS.map((s) => `${s.etiqueta} ${formatoPorcentaje(porcentajes[s.clave])}`).join(", ");
  return (
    <div>
      <div role="img" aria-label={`Reparto del total: ${resumen}`} className="flex h-3 overflow-hidden rounded-full bg-surface">
        {SEGMENTOS.map((s) =>
          porcentajes[s.clave] > 0 ? <div key={s.clave} style={{ width: `${porcentajes[s.clave]}%`, background: s.color }} className="h-full border-r border-background last:border-r-0" /> : null,
        )}
      </div>
      <ul className="mt-3 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
        {SEGMENTOS.map((s) => (
          <li key={s.clave} className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.etiqueta}</span>
            <span className="ml-auto font-semibold tabular">{formatoPorcentaje(porcentajes[s.clave])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
