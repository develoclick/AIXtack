/** Tabla de datos para las guías: cabeceras con scope, desplazamiento horizontal solo dentro de la tabla y primera columna destacada. */
export function Tabla({ columnas, filas, resumen, primeraColumnaEnNegrita = false }: { columnas: string[]; filas: string[][]; resumen: string; primeraColumnaEnNegrita?: boolean }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border" role="region" aria-label={resumen} tabIndex={0}>
      <table className="w-full min-w-[34rem] text-left text-sm">
        <caption className="sr-only">{resumen}</caption>
        <thead className="bg-surface">
          <tr>
            {columnas.map((c) => (
              <th key={c} scope="col" className="p-3 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {filas.map((fila) => (
            <tr key={fila[0]}>
              {fila.map((celda, i) =>
                i === 0 ? (
                  <th key={celda} scope="row" className={`p-3 text-left align-top ${primeraColumnaEnNegrita ? "font-semibold" : "font-medium"}`}>
                    {celda}
                  </th>
                ) : (
                  <td key={celda} className="p-3 align-top text-muted-foreground">
                    {celda}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
