"use client";

import { crearAlmacenLocal } from "@/lib/almacen-local";
import { CATEGORIAS_GASTO, datosVaciosPresupuesto, TIPOS, UNIDADES, type DatosPresupuesto, type Linea } from "@/lib/presupuesto/tipos";

const BASE = datosVaciosPresupuesto();
const texto = (v: unknown, defecto = "") => (typeof v === "string" ? v : defecto);

function normalizarLinea(l: Partial<Linea>, i: number): Linea {
  const categoria = CATEGORIAS_GASTO.some((c) => c.id === l.categoria) ? l.categoria! : "otros";
  return {
    id: texto(l.id, `guardada-${i}`),
    categoria,
    concepto: texto(l.concepto),
    monto: texto(l.monto),
    unidad: UNIDADES.some((u) => u.valor === l.unidad) ? l.unidad! : "viaje",
    tipo: TIPOS.some((t) => t.valor === l.tipo) ? l.tipo! : "estimado",
    enAlterna: l.enAlterna === true,
    minimo: texto(l.minimo),
    maximo: texto(l.maximo),
    fuente: texto(l.fuente),
    fecha: texto(l.fecha),
  };
}

/** Presupuesto de viaje: se guarda solo en el navegador de la persona; los ejemplos nunca se guardan. */
export const almacenPresupuesto = crearAlmacenLocal<DatosPresupuesto>(
  "gpia-presupuesto-datos-v1",
  datosVaciosPresupuesto,
  (g) => {
    const base = datosVaciosPresupuesto();
    return {
      ...base,
      ...g,
      lineas: Array.isArray(g.lineas) ? g.lineas.map((l, i) => normalizarLinea(l ?? {}, i)) : base.lineas,
      descartados: Array.isArray(g.descartados) ? g.descartados.filter((x): x is string => typeof x === "string") : [],
    };
  },
  (d) => [d.destino, d.salida, d.regreso, d.noches, d.adultos, d.monedaAlterna, d.tipoCambio].some((t) => t.trim() !== "") || d.lineas.some((l) => l.concepto.trim() !== "" || l.monto.trim() !== "" || l.fuente.trim() !== "") || d.lineas.length !== BASE.lineas.length,
);
