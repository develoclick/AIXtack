import { parsearNumero } from "@/lib/presupuesto/calculo";
import type { DatosPlanNegocio, ItemMonto } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Suma los montos válidos de una lista de ítems; ignora los que no tienen concepto o monto. */
export function sumaItems(items: ItemMonto[]): number {
  return redondear(items.reduce((a, it) => a + (it.concepto.trim() && parsearNumero(it.monto) !== null ? parsearNumero(it.monto)! : 0), 0));
}

export function inversionTotal(d: DatosPlanNegocio): number {
  return sumaItems(d.inversionInicial);
}

export function gastosFijosTotal(d: DatosPlanNegocio): number {
  return sumaItems(d.gastosMensuales);
}

/** Margen de contribución por unidad: precio − costo variable. null si falta alguno de los dos datos. */
export function margenContribucion(d: Pick<DatosPlanNegocio, "precioVenta" | "costoVariable">): number | null {
  const precio = parsearNumero(d.precioVenta);
  const costo = parsearNumero(d.costoVariable);
  if (precio === null || costo === null) return null;
  return redondear(precio - costo);
}

export interface PuntoEquilibrio {
  unidades: number;
  monto: number;
  formula: string;
}

/** Punto de equilibrio: gastos fijos ÷ margen de contribución. null si el margen es ≤ 0 (nunca se cubren los fijos). */
export function puntoEquilibrio(d: DatosPlanNegocio): PuntoEquilibrio | null {
  const margen = margenContribucion(d);
  const fijos = gastosFijosTotal(d);
  if (margen === null || margen <= 0 || fijos <= 0) return null;
  const unidades = redondear(fijos / margen);
  const precio = parsearNumero(d.precioVenta) ?? 0;
  return { unidades, monto: redondear(unidades * precio), formula: `${fijos} ÷ ${margen} = ${unidades} unidades/mes` };
}

export type ClaveEscenario = "pesimista" | "medio" | "optimista";
export const ESCENARIOS: { clave: ClaveEscenario; etiqueta: string }[] = [
  { clave: "pesimista", etiqueta: "Pesimista" },
  { clave: "medio", etiqueta: "Medio" },
  { clave: "optimista", etiqueta: "Optimista" },
];

export interface Escenario {
  clave: ClaveEscenario;
  unidades: number;
  ingresos: number;
  costoVariableTotal: number;
  utilidad: number;
}

/** Unidades vendidas al mes, por escenario: el medio es tu supuesto; pesimista y optimista lo mueven ± tu % de variación. */
export function unidadesPorEscenario(d: DatosPlanNegocio): Record<ClaveEscenario, number> | null {
  const medio = parsearNumero(d.demandaMensualEstimada);
  const variacion = parsearNumero(d.variacionEscenarios);
  if (medio === null || medio <= 0) return null;
  const pct = variacion === null || variacion < 0 ? 30 : variacion;
  return { pesimista: redondear(medio * (1 - pct / 100)), medio, optimista: redondear(medio * (1 + pct / 100)) };
}

/** Ingresos, costo variable total y utilidad mensual de los 3 escenarios. null si faltan precio, costo variable o demanda. */
export function escenarios(d: DatosPlanNegocio): Escenario[] | null {
  const unidades = unidadesPorEscenario(d);
  const precio = parsearNumero(d.precioVenta);
  const costoVar = parsearNumero(d.costoVariable);
  const fijos = gastosFijosTotal(d);
  if (unidades === null || precio === null || costoVar === null) return null;
  return ESCENARIOS.map(({ clave }) => {
    const u = unidades[clave];
    const ingresos = redondear(u * precio);
    const costoVariableTotal = redondear(u * costoVar);
    return { clave, unidades: u, ingresos, costoVariableTotal, utilidad: redondear(ingresos - costoVariableTotal - fijos) };
  });
}

export interface EstadoSeccion {
  id: string;
  etiqueta: string;
  completa: boolean;
}

/** Semáforo de preparación: qué secciones del formulario tienen datos suficientes y cuáles quedarán como supuestos de la IA. */
export function semaforo(d: DatosPlanNegocio): EstadoSeccion[] {
  return [
    { id: "idea", etiqueta: "Idea y problema", completa: Boolean(d.nombreEmpresa.trim() && d.producto.trim() && d.problema.trim()) },
    { id: "cliente", etiqueta: "Cliente y mercado", completa: Boolean(d.clienteObjetivo.trim() && d.ubicacion.trim()) },
    { id: "modelo", etiqueta: "Modelo de ingresos", completa: Boolean(d.modeloIngresos.trim()) },
    { id: "operacion", etiqueta: "Operación y equipo", completa: Boolean(d.recursosDisponibles.trim() || d.equipo.length > 0) },
    { id: "numeros", etiqueta: "Números (inversión, costos, precio)", completa: inversionTotal(d) > 0 && gastosFijosTotal(d) > 0 && margenContribucion(d) !== null },
  ];
}

/** Mínimo para que el prompt tenga sentido: nombre, producto, problema y cliente objetivo. */
export function datosMinimosPlanNegocio(d: DatosPlanNegocio): boolean {
  return Boolean(d.nombreEmpresa.trim() && d.producto.trim() && d.problema.trim() && d.clienteObjetivo.trim());
}
