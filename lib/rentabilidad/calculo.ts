import { formatoMonto, parsearNumero } from "@/lib/presupuesto/calculo";
import type { DatosRentabilidad, ItemMonto, Producto } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Suma los montos válidos de una lista de ítems; ignora los que no tienen concepto o monto. */
export function sumaItems(items: ItemMonto[]): number {
  return redondear(items.reduce((a, it) => a + (it.concepto.trim() && parsearNumero(it.monto) !== null ? parsearNumero(it.monto)! : 0), 0));
}

export function costosFijosTotal(d: DatosRentabilidad): number {
  return sumaItems(d.costosFijos);
}

export interface CalculoProducto {
  id: string;
  nombre: string;
  precio: number;
  costo: number;
  unidades: number;
  ingresos: number;
  costoDirecto: number;
  /** Contribución por unidad: precio − costo directo. */
  contribucionUnitaria: number;
  /** Margen sobre el precio de venta (no markup): contribución unitaria ÷ precio. */
  margenPct: number;
  contribucionTotal: number;
  formula: string;
}

const productoValido = (p: Producto) => p.nombre.trim() && parsearNumero(p.precio) !== null && parsearNumero(p.costo) !== null && parsearNumero(p.unidades) !== null;

/** Cálculo por producto: nunca lo hace la IA. null si falta el nombre, el precio, el costo o las unidades. */
export function calcularProductos(d: DatosRentabilidad): CalculoProducto[] {
  return d.productos.filter(productoValido).map((p) => {
    const precio = parsearNumero(p.precio)!;
    const costo = parsearNumero(p.costo)!;
    const unidades = parsearNumero(p.unidades)!;
    const ingresos = redondear(precio * unidades);
    const costoDirecto = redondear(costo * unidades);
    const contribucionUnitaria = redondear(precio - costo);
    const margenPct = precio > 0 ? redondear((contribucionUnitaria / precio) * 100) : 0;
    return {
      id: p.id,
      nombre: p.nombre.trim(),
      precio,
      costo,
      unidades,
      ingresos,
      costoDirecto,
      contribucionUnitaria,
      margenPct,
      contribucionTotal: redondear(contribucionUnitaria * unidades),
      formula: `(${formatoMonto(precio)} − ${formatoMonto(costo)}) × ${unidades} = ${formatoMonto(redondear(contribucionUnitaria * unidades))}`,
    };
  });
}

/** El monto o % de costos variables adicionales (comisiones, envíos, pasarela), sobre los ingresos calculados por la página. */
export function costosVariablesAdicionales(d: DatosRentabilidad, ingresosTotal: number): number {
  const valor = parsearNumero(d.costosVariablesValor);
  if (valor === null || valor <= 0) return 0;
  return d.costosVariablesTipo === "porcentaje" ? redondear(ingresosTotal * (valor / 100)) : redondear(valor);
}

export interface Resultado {
  ingresosTotal: number;
  costoDirectoTotal: number;
  unidadesTotal: number;
  /** Ingresos − costo directo de los productos vendidos. */
  utilidadBruta: number;
  margenBrutoPct: number;
  variablesAdicionales: number;
  fijos: number;
  /** Utilidad bruta − variables adicionales − fijos: el resultado final del período. */
  utilidadOperativa: number;
  margenOperativoPct: number;
  /** Margen de contribución ponderado: (ingresos − costo directo − variables adicionales) ÷ ingresos. Base del punto de equilibrio. */
  margenContribucionPct: number;
  /** null si el margen de contribución no es positivo (nunca se cubren los fijos). */
  puntoEquilibrioMonto: number | null;
  puntoEquilibrioUnidades: number | null;
  /** Ventas necesarias para llegar al objetivo de utilidad (si la persona lo indicó). */
  ventasParaObjetivo: number | null;
}

/** El cálculo oficial del período: nunca lo recalcula la IA, solo lo cita. null si no hay ningún producto con datos completos. */
export function calcularResultado(d: DatosRentabilidad): Resultado | null {
  const productos = calcularProductos(d);
  if (productos.length === 0) return null;
  const ingresosTotal = redondear(productos.reduce((a, p) => a + p.ingresos, 0));
  const costoDirectoTotal = redondear(productos.reduce((a, p) => a + p.costoDirecto, 0));
  const unidadesTotal = redondear(productos.reduce((a, p) => a + p.unidades, 0));
  const utilidadBruta = redondear(ingresosTotal - costoDirectoTotal);
  const variablesAdicionales = costosVariablesAdicionales(d, ingresosTotal);
  const fijos = costosFijosTotal(d);
  const utilidadOperativa = redondear(utilidadBruta - variablesAdicionales - fijos);
  const margenContribucionPct = ingresosTotal > 0 ? redondear(((ingresosTotal - costoDirectoTotal - variablesAdicionales) / ingresosTotal) * 100) : 0;
  const precioPromedio = unidadesTotal > 0 ? ingresosTotal / unidadesTotal : 0;

  const objetivo = parsearNumero(d.objetivoUtilidad);
  let puntoEquilibrioMonto: number | null = null;
  let puntoEquilibrioUnidades: number | null = null;
  let ventasParaObjetivo: number | null = null;
  if (margenContribucionPct > 0 && fijos > 0) {
    puntoEquilibrioMonto = redondear(fijos / (margenContribucionPct / 100));
    puntoEquilibrioUnidades = precioPromedio > 0 ? Math.ceil(puntoEquilibrioMonto / precioPromedio) : null;
  }
  if (margenContribucionPct > 0 && objetivo !== null && objetivo > 0) {
    ventasParaObjetivo = redondear((fijos + objetivo) / (margenContribucionPct / 100));
  }

  return {
    ingresosTotal,
    costoDirectoTotal,
    unidadesTotal,
    utilidadBruta,
    margenBrutoPct: ingresosTotal > 0 ? redondear((utilidadBruta / ingresosTotal) * 100) : 0,
    variablesAdicionales,
    fijos,
    utilidadOperativa,
    margenOperativoPct: ingresosTotal > 0 ? redondear((utilidadOperativa / ingresosTotal) * 100) : 0,
    margenContribucionPct,
    puntoEquilibrioMonto,
    puntoEquilibrioUnidades,
    ventasParaObjetivo,
  };
}

export type Variable = "precio" | "volumen" | "costoVariable" | "fijos";
export const VARIABLES: { clave: Variable; etiqueta: string }[] = [
  { clave: "precio", etiqueta: "Precio de venta" },
  { clave: "volumen", etiqueta: "Volumen vendido" },
  { clave: "costoVariable", etiqueta: "Costo variable" },
  { clave: "fijos", etiqueta: "Costos fijos" },
];

/** Utilidad operativa si UNA variable cambia en `pct` % (positivo o negativo) y las demás se mantienen igual. */
function utilidadConCambio(d: DatosRentabilidad, variable: Variable, pct: number): number | null {
  const factor = 1 + pct / 100;
  const productos = calcularProductos(d);
  if (productos.length === 0) return null;
  let ingresosTotal = 0;
  let costoDirectoTotal = 0;
  for (const p of productos) {
    const precio = variable === "precio" ? p.precio * factor : p.precio;
    const unidades = variable === "volumen" ? p.unidades * factor : p.unidades;
    const costo = variable === "costoVariable" ? p.costo * factor : p.costo;
    ingresosTotal += precio * unidades;
    costoDirectoTotal += costo * unidades;
  }
  ingresosTotal = redondear(ingresosTotal);
  costoDirectoTotal = redondear(costoDirectoTotal);
  const variablesAdicionales = variable === "costoVariable" ? costosVariablesAdicionales(d, ingresosTotal) * factor : costosVariablesAdicionales(d, ingresosTotal);
  const fijos = variable === "fijos" ? costosFijosTotal(d) * factor : costosFijosTotal(d);
  return redondear(ingresosTotal - costoDirectoTotal - variablesAdicionales - fijos);
}

export interface Sensibilidad {
  clave: Variable;
  etiqueta: string;
  /** Utilidad con el cambio negativo y positivo, en los 2 tamaños de variación. */
  menos10: number;
  menos5: number;
  mas5: number;
  mas10: number;
  /** |mas10 − menos10|: para ordenar el tornado de mayor a menor impacto. */
  impacto: number;
}

/** Tabla de sensibilidad (tornado): impacto en la utilidad operativa de mover cada variable ±5 % y ±10 %, una a la vez. */
export function calcularSensibilidad(d: DatosRentabilidad): Sensibilidad[] | null {
  const base = calcularResultado(d);
  if (!base) return null;
  const filas = VARIABLES.map(({ clave, etiqueta }) => {
    const menos10 = utilidadConCambio(d, clave, -10) ?? base.utilidadOperativa;
    const menos5 = utilidadConCambio(d, clave, -5) ?? base.utilidadOperativa;
    const mas5 = utilidadConCambio(d, clave, 5) ?? base.utilidadOperativa;
    const mas10 = utilidadConCambio(d, clave, 10) ?? base.utilidadOperativa;
    return { clave, etiqueta, menos10, menos5, mas5, mas10, impacto: redondear(Math.abs(mas10 - menos10)) };
  });
  return filas.sort((a, b) => b.impacto - a.impacto);
}

export interface EstadoSeccion {
  id: string;
  etiqueta: string;
  completa: boolean;
}

/** Semáforo de preparación: qué secciones del formulario tienen datos suficientes. */
export function semaforo(d: DatosRentabilidad): EstadoSeccion[] {
  return [
    { id: "productos", etiqueta: "Al menos un producto con precio, costo y unidades", completa: calcularProductos(d).length > 0 },
    { id: "fijos", etiqueta: "Costos fijos del período", completa: costosFijosTotal(d) > 0 },
    { id: "variables", etiqueta: "Costos variables por venta (o marcados como ninguno)", completa: d.costosVariablesValor.trim() !== "" },
    { id: "sueldo", etiqueta: "Indicaste si tu sueldo está incluido", completa: d.incluyeSueldo || d.costosFijos.some((f) => f.concepto.trim() !== "") },
  ];
}

/** Mínimo para que el prompt tenga sentido: al menos un producto válido. */
export function datosMinimosRentabilidad(d: DatosRentabilidad): boolean {
  return calcularProductos(d).length > 0;
}
