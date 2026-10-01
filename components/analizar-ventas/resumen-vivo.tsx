"use client";

import { formatoMonto } from "@/lib/presupuesto/calculo";
import type { ResumenAnalisis } from "@/lib/analizar-ventas/calculo";
import { Grafico } from "./grafico";

/** «Vista previa» del paso 1 (columna fija a la derecha en escritorio): el dashboard inmediato, calculado en tu navegador en cuanto subes y mapeas tu archivo. */
export function ResumenVivo({ resumen, moneda }: { resumen: ResumenAnalisis | null; moneda: string }) {
  const m = moneda.trim() || "S/";
  const monto = (n: number) => `${m} ${formatoMonto(n)}`;

  return (
    <section aria-labelledby="titulo-resumen-ventas" className="tarjeta p-5 sm:p-6">
      <h2 id="titulo-resumen-ventas" className="text-lg font-semibold leading-tight">
        Tu dashboard <span className="font-normal text-muted-foreground">(se arma solo)</span>
      </h2>

      {!resumen ? (
        <p className="mt-3 text-sm text-muted-foreground">Sube tu archivo y mapea al menos la fecha y el importe: aquí aparecen tus ventas, tu evolución y tus productos principales.</p>
      ) : (
        <div className="aparecer mt-4 space-y-6" data-resumen>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Ventas", monto(resumen.metricas.ventas)],
              ["Operaciones", String(resumen.metricas.operaciones)],
              ["Unidades", String(resumen.metricas.unidades)],
              ["Ticket promedio", monto(resumen.metricas.ticketPromedio)],
              ["Precio medio/unidad", resumen.metricas.precioMedioUnidad !== null ? monto(resumen.metricas.precioMedioUnidad) : "—"],
            ].map(([etiqueta, valor]) => (
              <div key={etiqueta} className="rounded-lg border bg-surface p-3">
                <p className="text-xs text-muted-foreground">{etiqueta}</p>
                <p className="mt-0.5 text-lg font-bold tabular">{valor}</p>
              </div>
            ))}
          </div>

          {resumen.calidad.total > 0 && (resumen.calidad.negativos > 0 || resumen.calidad.duplicados > 0 || resumen.calidad.importeInconsistente > 0 || resumen.calidad.fueraDeRango > 0) && (
            <div className="rounded-lg border border-warn/40 bg-warn-muted p-3 text-xs leading-relaxed">
              <p className="font-semibold">Calidad de datos: revisa antes de confiar en las cifras</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {resumen.calidad.negativos > 0 && <li>{resumen.calidad.negativos} fila(s) con importe negativo (posibles devoluciones).</li>}
                {resumen.calidad.duplicados > 0 && <li>{resumen.calidad.duplicados} fila(s) duplicada(s).</li>}
                {resumen.calidad.importeInconsistente > 0 && <li>{resumen.calidad.importeInconsistente} fila(s) con importe ≠ cantidad × precio.</li>}
                {resumen.calidad.fueraDeRango > 0 && <li>{resumen.calidad.fueraDeRango} fila(s) con fecha fuera de rango.</li>}
              </ul>
            </div>
          )}

          <Grafico titulo="Evolución mensual" tipo="linea" etiquetas={resumen.evolucion.map((e) => e.mes)} valores={resumen.evolucion.map((e) => e.ventas)} formatoValor={monto} colorHex="#10b981" vacio="Mapea la fecha para ver la evolución mensual." />

          {resumen.topProductos.length > 0 && <Grafico titulo="Top productos por ventas" tipo="barra" etiquetas={resumen.topProductos.slice(0, 8).map((p) => p.clave)} valores={resumen.topProductos.slice(0, 8).map((p) => p.ventas)} formatoValor={monto} colorHex="#6366f1" />}

          {resumen.participacionCanal.length > 0 && <Grafico titulo="Participación por canal" tipo="barra" etiquetas={resumen.participacionCanal.map((p) => p.clave)} valores={resumen.participacionCanal.map((p) => p.ventas)} formatoValor={monto} colorHex="#f59e0b" />}

          {resumen.participacionSucursal.length > 0 && <Grafico titulo="Participación por sucursal" tipo="barra" etiquetas={resumen.participacionSucursal.map((p) => p.clave)} valores={resumen.participacionSucursal.map((p) => p.ventas)} formatoValor={monto} colorHex="#ec4899" />}

          {resumen.comparacion && (
            <div className="rounded-lg border bg-surface p-3 text-sm">
              <p className="text-xs font-semibold text-muted-foreground">Comparación de períodos</p>
              <p className="mt-1 text-lg font-bold tabular">{resumen.comparacion.variacionPct === null ? "No se puede calcular" : `${resumen.comparacion.variacionPct > 0 ? "+" : ""}${resumen.comparacion.variacionPct} %`}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {monto(resumen.comparacion.ventasA)} → {monto(resumen.comparacion.ventasB)}
              </p>
              {!resumen.comparacion.comparable && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-warn">
                  Los períodos no tienen la misma cantidad de días ({resumen.comparacion.diasA ?? "?"} vs {resumen.comparacion.diasB ?? "?"}): la comparación no es del todo justa.
                </p>
              )}
            </div>
          )}

          {(resumen.concentracionProducto ?? resumen.concentracionCliente) && (
            <div className="rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
              {resumen.concentracionProducto && (
                <p>
                  El {resumen.concentracionProducto.entidadesTop} de {resumen.concentracionProducto.entidades} producto(s) con más ventas explica el <strong className="text-foreground">{resumen.concentracionProducto.pctVentasTop} %</strong> de las ventas.
                </p>
              )}
              {resumen.concentracionCliente && (
                <p className="mt-1">
                  El {resumen.concentracionCliente.entidadesTop} de {resumen.concentracionCliente.entidades} cliente(s) con más compras explica el <strong className="text-foreground">{resumen.concentracionCliente.pctVentasTop} %</strong> de las ventas.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
