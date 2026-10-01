import type { CeldaMatrizRF } from "@/lib/segmentar-clientes/motor";

/**
 * Mapa de calor R×F (sin librerías, como el donut de presupuesto de viaje): 25 celdas, 1 por combinación de recencia
 * (filas, de arriba=5 a abajo=1) y frecuencia (columnas, de 1 a 5), con la cantidad de clientes y una opacidad proporcional
 * al máximo de la matriz, para ver de un vistazo dónde se concentra la base.
 */
export function MatrizRF({ celdas }: { celdas: CeldaMatrizRF[] }) {
  const maximo = Math.max(1, ...celdas.map((c) => c.cantidad));
  const celda = (r: number, f: number) => celdas.find((c) => c.r === r && c.f === f)!;

  return (
    <div role="img" aria-label={`Matriz de recencia y frecuencia: ${celdas.map((c) => `R${c.r} F${c.f}: ${c.cantidad} clientes`).join("; ")}`}>
      <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1 text-[0.6875rem]">
        <div />
        {[1, 2, 3, 4, 5].map((f) => (
          <div key={f} className="text-center font-semibold text-muted-foreground">
            F{f}
          </div>
        ))}
        {[5, 4, 3, 2, 1].map((r) => (
          <div key={r} className="contents">
            <div className="flex items-center justify-end pr-1 font-semibold text-muted-foreground">R{r}</div>
            {[1, 2, 3, 4, 5].map((f) => {
              const c = celda(r, f);
              const opacidad = c.cantidad === 0 ? 0.06 : 0.18 + 0.72 * (c.cantidad / maximo);
              return (
                <div key={f} className="flex aspect-square items-center justify-center rounded" style={{ backgroundColor: `color-mix(in srgb, var(--accent) ${Math.round(opacidad * 100)}%, transparent)` }} title={`Recencia ${r}, frecuencia ${f}: ${c.cantidad} cliente(s)`}>
                  <span className="tabular font-semibold">{c.cantidad}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <details className="mt-2 text-xs">
        <summary className="flex min-h-11 cursor-pointer items-center text-muted-foreground">Ver los datos (tabla)</summary>
        <table className="mt-1 w-full text-left">
          <thead>
            <tr>
              <th className="pb-1 pr-3 font-semibold text-muted-foreground">Recencia (R)</th>
              <th className="pb-1 pr-3 font-semibold text-muted-foreground">Frecuencia (F)</th>
              <th className="pb-1 pr-3 font-semibold text-muted-foreground">Clientes</th>
            </tr>
          </thead>
          <tbody>
            {celdas.map((c) => (
              <tr key={`${c.r}-${c.f}`} className="border-t">
                <td className="py-1 pr-3 text-muted-foreground">{c.r}</td>
                <td className="py-1 pr-3 text-muted-foreground">{c.f}</td>
                <td className="py-1 pr-3 font-medium tabular">{c.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
