import type { TableData } from "@/lib/guides/model";
import { cn } from "@/lib/utils";
import { CopyTableButton } from "./copy-table-button";
import { Inline } from "./rich-text";
import { ui } from "./ui";

/**
 * Tabla de datos genérica: encabezados semánticos, primera columna como cabecera de fila y
 * desplazamiento horizontal accesible (foco + etiqueta) cuando la columna es estrecha. Con
 * `copyable` añade «Copiar como tabla» (pegable en una hoja de cálculo).
 */
export function DataTable({ table, className }: { table: TableData; className?: string }) {
  return (
    <div className={className}>
      {table.copyable && (
        <div className="mb-2.5 flex justify-end">
          <CopyTableButton table={table} />
        </div>
      )}
      <div role="region" aria-label={table.caption} tabIndex={0} className={cn("guide-focus overflow-x-auto rounded-xl border bg-background")}>
        <table className="w-full min-w-[34rem] border-collapse text-left text-[0.92rem]">
          <caption className="sr-only">{table.caption}</caption>
          <thead>
            <tr className="border-b bg-guide-surface">
              {table.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 align-bottom font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b last:border-b-0 odd:bg-transparent even:bg-guide-surface/60">
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row" className="px-4 py-3 text-left align-top font-semibold text-guide-ink">
                      <Inline text={cell} />
                    </th>
                  ) : (
                    <td key={cellIndex} className="px-4 py-3 align-top leading-snug text-foreground/85 tabular-nums">
                      <Inline text={cell} />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Tabla comparativa editorial. `purpose` (obligatorio en el modelo) explica qué decisión
 * o comprensión obtiene el lector: ninguna tabla se incluye «porque sí».
 */
export function ComparisonTable({ table, eyebrow = "Comparativa" }: { table: TableData; eyebrow?: string }) {
  return (
    <div className={ui.block}>
      <p className={ui.eyebrow}>{eyebrow}</p>
      <h3 className={cn(ui.h3, "mt-1")}>{table.caption}</h3>
      <p className="mt-2 max-w-[var(--guide-measure)] text-[0.95rem] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-guide-ink">Para qué sirve: </span>
        <Inline text={table.purpose} />
      </p>
      <DataTable table={table} className="mt-4" />
      {table.note && (
        <p className="mt-2.5 max-w-[var(--guide-measure)] text-sm leading-snug text-muted-foreground">
          <Inline text={table.note} />
        </p>
      )}
    </div>
  );
}

/** Comparativa de herramientas o enfoques: misma tabla, con su propio sobretítulo. */
export function ToolComparison({ table }: { table: TableData }) {
  return <ComparisonTable table={table} eyebrow="Comparar herramientas" />;
}
