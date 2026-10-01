import { formatoMonto } from "@/lib/presupuesto/calculo";
import type { ResumenAnalisis } from "./calculo";

const campo = (t: string) => (/[",;\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
const fila = (...c: (string | number)[]) => c.map((x) => campo(String(x))).join(",");

/** Exporta el resumen calculado (métricas, evolución, top productos, participación y comparación) a .csv. */
export function csvDeAnalisisVentas(r: ResumenAnalisis, moneda: string): string {
  const bloques: string[] = [];

  bloques.push(
    ["Métrica,Valor", fila("Ventas totales", `${moneda} ${formatoMonto(r.metricas.ventas)}`), fila("Operaciones", r.metricas.operaciones), fila("Unidades", r.metricas.unidades), fila("Ticket promedio", `${moneda} ${formatoMonto(r.metricas.ticketPromedio)}`), fila("Precio medio por unidad", r.metricas.precioMedioUnidad !== null ? `${moneda} ${formatoMonto(r.metricas.precioMedioUnidad)}` : "")].join("\n"),
  );

  if (r.evolucion.length) bloques.push(["", "Evolución mensual", "Mes,Ventas,Operaciones", ...r.evolucion.map((e) => fila(e.mes, formatoMonto(e.ventas), e.operaciones))].join("\n"));
  if (r.topProductos.length) bloques.push(["", "Top productos", "Producto,Ventas,Participación %", ...r.topProductos.map((p) => fila(p.clave, formatoMonto(p.ventas), p.pct))].join("\n"));
  if (r.participacionCategoria.length) bloques.push(["", "Participación por categoría", "Categoría,Ventas,Participación %", ...r.participacionCategoria.map((p) => fila(p.clave, formatoMonto(p.ventas), p.pct))].join("\n"));
  if (r.participacionCanal.length) bloques.push(["", "Participación por canal", "Canal,Ventas,Participación %", ...r.participacionCanal.map((p) => fila(p.clave, formatoMonto(p.ventas), p.pct))].join("\n"));
  if (r.participacionSucursal.length) bloques.push(["", "Participación por sucursal", "Sucursal,Ventas,Participación %", ...r.participacionSucursal.map((p) => fila(p.clave, formatoMonto(p.ventas), p.pct))].join("\n"));

  if (r.comparacion) {
    const c = r.comparacion;
    bloques.push(
      ["", "Comparación de períodos", "Dato,Período de comparación,Período principal", fila("Ventas", `${moneda} ${formatoMonto(c.ventasA)}`, `${moneda} ${formatoMonto(c.ventasB)}`), fila("Operaciones", c.operacionesA, c.operacionesB), fila("Ticket promedio", `${moneda} ${formatoMonto(c.ticketA)}`, `${moneda} ${formatoMonto(c.ticketB)}`), fila("Días", c.diasA ?? "", c.diasB ?? ""), fila("Efecto operaciones", `${moneda} ${formatoMonto(c.efectoOperaciones)}`, ""), fila("Efecto ticket promedio", `${moneda} ${formatoMonto(c.efectoTicket)}`, "")].join("\n"),
    );
  }

  return bloques.join("\n\n");
}
