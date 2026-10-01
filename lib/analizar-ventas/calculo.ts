import { parsearNumero } from "@/lib/presupuesto/calculo";
import type { HojaCruda } from "./parser";
import type { FilaVenta, MapeoColumnas } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Como parsearNumero, pero admite negativos: una fila de ventas puede ser una devolución (importe negativo), y la página necesita detectarla, no descartarla. */
export function parsearNumeroVentas(entrada: string): number | null {
  const t = (entrada ?? "").trim();
  const negativo = t.startsWith("-");
  const n = parsearNumero(negativo ? t.slice(1) : t);
  return n === null ? null : negativo ? -n : n;
}

/** «DD/MM/AAAA» o «AAAA-MM-DD» → «AAAA-MM-DD» (o null si no se puede leer). Perú usa día/mes/año. */
export function normalizarFecha(crudo: string): string | null {
  const v = crudo.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v);
  if (iso) {
    const [, a, m, d] = iso;
    return `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(v);
  if (dmy) {
    const [, d, m, aCrudo] = dmy;
    const a = aCrudo.length === 2 ? `20${aCrudo}` : aCrudo;
    const t = Date.UTC(Number(a), Number(m) - 1, Number(d));
    if (Number.isNaN(t) || new Date(t).getUTCMonth() !== Number(m) - 1) return null;
    return `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function diasDesde(fechaIso: string): number {
  const [a, m, d] = fechaIso.split("-").map(Number);
  return Date.UTC(a, m - 1, d) / 86_400_000;
}

/** Días entre 2 fechas AAAA-MM-DD, ambas incluidas. */
export function diasDelPeriodo(desde: string, hasta: string): number | null {
  const a = normalizarFecha(desde);
  const b = normalizarFecha(hasta);
  if (!a || !b) return null;
  const n = diasDesde(b) - diasDesde(a) + 1;
  return n >= 1 ? n : null;
}

const celda = (fila: string[], indice: number | null) => (indice === null ? "" : (fila[indice] ?? "").trim());
const num = (fila: string[], indice: number | null) => (indice === null ? null : parsearNumeroVentas(fila[indice] ?? ""));

/** Convierte las filas crudas de una hoja en filas de venta, según el mapeo de columnas (nunca inventa un campo no mapeado). */
export function filasVentaDesdeMapeo(hoja: HojaCruda, mapeo: MapeoColumnas): FilaVenta[] {
  const datos = hoja.filas.slice(1);
  return datos.map((fila): FilaVenta => {
    const cantidad = num(fila, mapeo.cantidad);
    const precio = num(fila, mapeo.precio);
    const importeDirecto = num(fila, mapeo.importe);
    const importe = importeDirecto !== null ? importeDirecto : cantidad !== null && precio !== null ? redondear(cantidad * precio) : null;
    return {
      fecha: normalizarFecha(celda(fila, mapeo.fecha)),
      producto: celda(fila, mapeo.producto),
      categoria: celda(fila, mapeo.categoria),
      cantidad,
      precio,
      importe,
      vendedor: celda(fila, mapeo.vendedor),
      cliente: celda(fila, mapeo.cliente),
      sucursal: celda(fila, mapeo.sucursal),
      canal: celda(fila, mapeo.canal),
    };
  });
}

export interface CalidadDatos {
  total: number;
  sinFecha: number;
  sinImporte: number;
  negativos: number;
  fueraDeRango: number;
  duplicados: number;
  importeInconsistente: number;
}

const ANIO_MIN = 2000;

/** Revisión de calidad: cuenta problemas, nunca elimina filas (los cálculos siguientes usan todas las filas, tal como llegaron). */
export function calidadDeDatos(filas: FilaVenta[], mapeo: MapeoColumnas): CalidadDatos {
  const vistas = new Set<string>();
  let duplicados = 0;
  let fueraDeRango = 0;
  let importeInconsistente = 0;
  for (const f of filas) {
    const clave = JSON.stringify(f);
    if (vistas.has(clave)) duplicados++;
    else vistas.add(clave);
    if (f.fecha) {
      const anio = Number(f.fecha.slice(0, 4));
      const anioActual = new Date().getUTCFullYear();
      if (anio < ANIO_MIN || anio > anioActual + 1) fueraDeRango++;
    }
    if (mapeo.importe !== null && mapeo.cantidad !== null && mapeo.precio !== null && f.importe !== null && f.cantidad !== null && f.precio !== null) {
      const esperado = redondear(f.cantidad * f.precio);
      if (Math.abs(esperado - f.importe) > Math.max(0.02, Math.abs(esperado) * 0.01)) importeInconsistente++;
    }
  }
  return {
    total: filas.length,
    sinFecha: filas.filter((f) => !f.fecha).length,
    sinImporte: filas.filter((f) => f.importe === null).length,
    negativos: filas.filter((f) => f.importe !== null && f.importe < 0).length,
    fueraDeRango,
    duplicados,
    importeInconsistente,
  };
}

export interface Metricas {
  ventas: number;
  operaciones: number;
  unidades: number;
  ticketPromedio: number;
  precioMedioUnidad: number | null;
}

/** Ventas, operaciones, unidades, ticket promedio (ventas / operaciones) y precio medio por unidad. Nunca los calcula la IA. */
export function calcularMetricas(filas: FilaVenta[]): Metricas {
  const conImporte = filas.filter((f) => f.importe !== null);
  const ventas = redondear(conImporte.reduce((s, f) => s + (f.importe ?? 0), 0));
  const operaciones = conImporte.length;
  const unidades = redondear(filas.reduce((s, f) => s + (f.cantidad ?? 0), 0));
  return {
    ventas,
    operaciones,
    unidades,
    ticketPromedio: operaciones > 0 ? redondear(ventas / operaciones) : 0,
    precioMedioUnidad: unidades > 0 ? redondear(ventas / unidades) : null,
  };
}

export function filtrarPorPeriodo(filas: FilaVenta[], desde: string, hasta: string): FilaVenta[] {
  const a = normalizarFecha(desde);
  const b = normalizarFecha(hasta);
  if (!a || !b) return [];
  return filas.filter((f) => f.fecha !== null && f.fecha >= a && f.fecha <= b);
}

export interface FilaEvolucion {
  mes: string;
  ventas: number;
  operaciones: number;
}

/** Evolución mensual (agrupa por AAAA-MM), ordenada cronológicamente. Solo usa filas con fecha reconocida. */
export function evolucionMensual(filas: FilaVenta[]): FilaEvolucion[] {
  const mapa = new Map<string, { ventas: number; operaciones: number }>();
  for (const f of filas) {
    if (!f.fecha || f.importe === null) continue;
    const mes = f.fecha.slice(0, 7);
    const acc = mapa.get(mes) ?? { ventas: 0, operaciones: 0 };
    acc.ventas += f.importe;
    acc.operaciones += 1;
    mapa.set(mes, acc);
  }
  return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([mes, v]) => ({ mes, ventas: redondear(v.ventas), operaciones: v.operaciones }));
}

export type CampoAgregable = "producto" | "categoria" | "vendedor" | "cliente" | "sucursal" | "canal";

function agruparVentasPor(filas: FilaVenta[], campo: CampoAgregable): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const f of filas) {
    const clave = f[campo].trim();
    if (!clave || f.importe === null) continue;
    mapa.set(clave, (mapa.get(clave) ?? 0) + f.importe);
  }
  return mapa;
}

export interface Participacion {
  clave: string;
  ventas: number;
  pct: number;
}

/** Participación de cada valor de un campo (producto, categoría, canal…) sobre el total de ventas, de mayor a menor. */
export function participacionPor(filas: FilaVenta[], campo: CampoAgregable): Participacion[] {
  const agregados = agruparVentasPor(filas, campo);
  const total = [...agregados.values()].reduce((s, v) => s + v, 0);
  return [...agregados.entries()]
    .map(([clave, ventas]) => ({ clave, ventas: redondear(ventas), pct: total > 0 ? redondear((ventas / total) * 100) : 0 }))
    .sort((a, b) => b.ventas - a.ventas);
}

export function topN(filas: FilaVenta[], campo: CampoAgregable, n: number): Participacion[] {
  return participacionPor(filas, campo).slice(0, n);
}

export interface Concentracion {
  campo: CampoAgregable;
  entidades: number;
  entidadesTop: number;
  pctVentasTop: number;
}

/** ¿Qué % de las ventas explica el 20 % de entidades (productos o clientes) con más ventas? */
export function concentracion(filas: FilaVenta[], campo: CampoAgregable): Concentracion | null {
  const agregados = agruparVentasPor(filas, campo);
  if (agregados.size === 0) return null;
  const ordenado = [...agregados.values()].sort((a, b) => b - a);
  const total = ordenado.reduce((s, v) => s + v, 0);
  const entidadesTop = Math.max(1, Math.round(ordenado.length * 0.2));
  const ventasTop = ordenado.slice(0, entidadesTop).reduce((s, v) => s + v, 0);
  return { campo, entidades: ordenado.length, entidadesTop, pctVentasTop: total > 0 ? redondear((ventasTop / total) * 100) : 0 };
}

export interface ComparacionPeriodos {
  ventasA: number;
  ventasB: number;
  variacionPct: number | null;
  operacionesA: number;
  operacionesB: number;
  ticketA: number;
  ticketB: number;
  /** Cuánto de la variación en ventas se explica por el cambio en el número de operaciones (al ticket promedio del período A). */
  efectoOperaciones: number;
  /** Cuánto se explica por el cambio en el ticket promedio (sobre las operaciones del período B). efectoOperaciones + efectoTicket = ventasB - ventasA, exacto. */
  efectoTicket: number;
  diasA: number | null;
  diasB: number | null;
  comparable: boolean;
}

/**
 * Descompone la variación de ventas entre 2 períodos en 2 efectos que suman exactamente la diferencia (ventasB - ventasA):
 * el efecto de vender más o menos veces (operaciones) y el efecto de que cada venta promedio sea mayor o menor (ticket).
 * Nunca lo calcula la IA.
 */
export function compararPeriodos(filas: FilaVenta[], periodoA: { desde: string; hasta: string }, periodoB: { desde: string; hasta: string }): ComparacionPeriodos {
  const mA = calcularMetricas(filtrarPorPeriodo(filas, periodoA.desde, periodoA.hasta));
  const mB = calcularMetricas(filtrarPorPeriodo(filas, periodoB.desde, periodoB.hasta));
  const diasA = diasDelPeriodo(periodoA.desde, periodoA.hasta);
  const diasB = diasDelPeriodo(periodoB.desde, periodoB.hasta);
  return {
    ventasA: mA.ventas,
    ventasB: mB.ventas,
    variacionPct: mA.ventas > 0 ? redondear(((mB.ventas - mA.ventas) / mA.ventas) * 100) : null,
    operacionesA: mA.operaciones,
    operacionesB: mB.operaciones,
    ticketA: mA.ticketPromedio,
    ticketB: mB.ticketPromedio,
    efectoOperaciones: redondear((mB.operaciones - mA.operaciones) * mA.ticketPromedio),
    efectoTicket: redondear((mB.ticketPromedio - mA.ticketPromedio) * mB.operaciones),
    diasA,
    diasB,
    comparable: diasA !== null && diasB !== null && diasA === diasB,
  };
}

/** Mínimo para copiar el prompt: al menos fecha e importe mapeados, y al menos 1 fila de datos. */
export function mapeoMinimo(mapeo: MapeoColumnas, totalFilas: number): boolean {
  return mapeo.fecha !== null && mapeo.importe !== null && totalFilas > 0;
}

export interface Periodo {
  desde: string;
  hasta: string;
}

export interface ResumenAnalisis {
  calidad: CalidadDatos;
  metricas: Metricas;
  evolucion: FilaEvolucion[];
  topProductos: Participacion[];
  participacionCategoria: Participacion[];
  participacionCanal: Participacion[];
  participacionSucursal: Participacion[];
  concentracionProducto: Concentracion | null;
  concentracionCliente: Concentracion | null;
  comparacion: ComparacionPeriodos | null;
}

const periodoValido = (p: Periodo | null): p is Periodo => Boolean(p?.desde.trim() && p?.hasta.trim());

/**
 * Junta todos los cálculos (calidad, métricas, evolución, participación, concentración y comparación de períodos) en un solo
 * resumen: la única fuente de cifras para el prompt, el dashboard y el informe. La evolución mensual siempre usa TODO el
 * archivo (no solo el período elegido), porque una tendencia necesita varios meses para verse; el resto de las cifras sí
 * se limita al período que la persona eligió analizar.
 */
export function armarResumenAnalisis(filas: FilaVenta[], mapeo: MapeoColumnas, periodo: Periodo | null, comparacion: Periodo | null): ResumenAnalisis {
  const filasPeriodo = periodoValido(periodo) ? filtrarPorPeriodo(filas, periodo.desde, periodo.hasta) : filas;
  return {
    calidad: calidadDeDatos(filasPeriodo, mapeo),
    metricas: calcularMetricas(filasPeriodo),
    evolucion: evolucionMensual(filas),
    topProductos: mapeo.producto !== null ? topN(filasPeriodo, "producto", 10) : [],
    participacionCategoria: mapeo.categoria !== null ? participacionPor(filasPeriodo, "categoria") : [],
    participacionCanal: mapeo.canal !== null ? participacionPor(filasPeriodo, "canal") : [],
    participacionSucursal: mapeo.sucursal !== null ? participacionPor(filasPeriodo, "sucursal") : [],
    concentracionProducto: mapeo.producto !== null ? concentracion(filasPeriodo, "producto") : null,
    concentracionCliente: mapeo.cliente !== null ? concentracion(filasPeriodo, "cliente") : null,
    comparacion: periodoValido(periodo) && periodoValido(comparacion) ? compararPeriodos(filas, comparacion, periodo) : null,
  };
}
