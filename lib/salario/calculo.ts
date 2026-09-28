import { formatoMonto, formatoPorcentaje, parsearNumero } from "@/lib/presupuesto/calculo";
import type { DatosSalario, Oferta } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const m = (n: number) => formatoMonto(n);

export interface FilaFormula {
  clave: string;
  etiqueta: string;
  /** Fórmula con los números de esta oferta, para mostrarla. */
  formula: string;
  valor: number;
}

export interface Escenario {
  bruto: number;
  despuesDeCostos: number;
  /** Después de costos ÷ 12: sirve para comparar con un sueldo mensual, no es un pago real. */
  mensualEquivalente: number;
}

export interface CalculoOferta {
  /** Hay salario fijo y pagos válidos. */
  valido: boolean;
  fijoMensual: number | null;
  pagos: number | null;
  fijoAnual: number | null;
  variableMaximo: number;
  variableConservador: number;
  beneficios: number;
  beneficiosNoMonetarios: string[];
  diasPorSemana: number | null;
  semanas: number | null;
  costoPorDia: number;
  costo: number | null;
  conservador: Escenario | null;
  completo: Escenario | null;
  /** Fijo mensual × (1 − descuentos) con el porcentaje que estimó la persona; null si no lo escribió. */
  netoFijoEstimado: number | null;
  filas: FilaFormula[];
  problemas: string[];
}

export interface ContextoCalculo {
  modalidad: DatosSalario["modalidad"];
  transporteDia: string;
  comidaDia: string;
  semanas: string;
  descuentoPct: string;
}

const num = (s: string): number | null => parsearNumero(s);

/**
 * Valor anual de una oferta, componente por componente y con la fórmula a la vista:
 *   bruto = fijo mensual × pagos + variable (conservador o completo) + beneficios que tú valorizas
 *   después de costos = bruto − días presenciales por semana × semanas × (transporte + comida por día)
 * No calcula impuestos ni aportes: el neto depende del país y del régimen (solo se muestra un neto aproximado si la persona escribe su %).
 */
export function calcularOferta(o: Oferta, ctx: ContextoCalculo): CalculoOferta {
  const problemas: string[] = [];
  const fijoMensual = num(o.fijo);
  const pagos = num(o.pagos);
  const validoFijo = fijoMensual !== null && fijoMensual > 0;
  const validoPagos = pagos !== null && Number.isInteger(pagos) && pagos >= 1 && pagos <= 24;
  if (!validoFijo) problemas.push("Falta el salario fijo mensual bruto.");
  if (!validoPagos) problemas.push("Los pagos al año deben ser un número entero (12, 14, 15…).");
  const fijoAnual = validoFijo && validoPagos ? redondear(fijoMensual! * pagos!) : null;

  // Variable
  let variableMaximo = 0;
  let formulaVariable = "Sin variable";
  const vv = num(o.variableValor);
  if (o.variableTipo !== "ninguno") {
    if (vv === null || vv < 0) {
      problemas.push("Escribe el valor del variable (o elige «No hay variable»).");
    } else if (o.variableTipo === "monto") {
      variableMaximo = redondear(vv);
      formulaVariable = `Monto anual máximo = ${m(vv)}`;
    } else if (o.variableTipo === "porcentaje") {
      if (fijoAnual === null) formulaVariable = `${vv} % del fijo anual (falta el fijo)`;
      else {
        variableMaximo = redondear((fijoAnual * vv) / 100);
        formulaVariable = `${m(fijoAnual)} × ${vv} % = ${m(variableMaximo)}`;
      }
    } else if (fijoMensual !== null) {
      variableMaximo = redondear(fijoMensual * vv);
      formulaVariable = `${m(fijoMensual)} × ${vv} sueldo(s) = ${m(variableMaximo)}`;
    }
  }
  const seguro = num(o.variableSeguro);
  const pctSeguro = seguro === null ? 0 : Math.min(100, Math.max(0, seguro));
  const variableConservador = redondear((variableMaximo * pctSeguro) / 100);

  // Beneficios que la persona valoriza (solo los monetarios)
  const monetarios = o.beneficios.filter((b) => b.monetario && num(b.valor) !== null && (num(b.valor) ?? 0) > 0);
  const beneficios = redondear(monetarios.reduce((a, b) => a + (num(b.valor) ?? 0), 0));
  const beneficiosNoMonetarios = o.beneficios.filter((b) => !b.monetario && b.nombre.trim()).map((b) => b.nombre.trim());
  for (const b of o.beneficios) if (b.monetario && b.valor.trim() && num(b.valor) === null) problemas.push(`El valor del beneficio «${b.nombre || "sin nombre"}» no es un número.`);

  // Costo de trabajar presencial
  const diasEscritos = num(o.diasPresencial);
  const diasPorSemana = diasEscritos !== null ? diasEscritos : ctx.modalidad === "presencial" ? 5 : ctx.modalidad === "remoto" ? 0 : null;
  if (diasPorSemana === null) problemas.push("Escribe cuántos días por semana vas a la oficina para calcular el costo de trabajar.");
  if (diasPorSemana !== null && (diasPorSemana < 0 || diasPorSemana > 7)) problemas.push("Los días presenciales por semana deben estar entre 0 y 7.");
  const semanasN = num(ctx.semanas);
  const semanas = semanasN !== null && semanasN > 0 && semanasN <= 53 ? semanasN : null;
  if (semanas === null) problemas.push("Las semanas de trabajo al año deben estar entre 1 y 53.");
  const costoPorDia = redondear((num(ctx.transporteDia) ?? 0) + (num(ctx.comidaDia) ?? 0));
  const costo = diasPorSemana !== null && semanas !== null && diasPorSemana >= 0 && diasPorSemana <= 7 ? redondear(diasPorSemana * semanas * costoPorDia) : null;

  const escenario = (variable: number): Escenario | null => {
    if (fijoAnual === null || costo === null) return null;
    const bruto = redondear(fijoAnual + variable + beneficios);
    const despues = redondear(bruto - costo);
    return { bruto, despuesDeCostos: despues, mensualEquivalente: redondear(despues / 12) };
  };
  const conservador = escenario(variableConservador);
  const completo = escenario(variableMaximo);

  const desc = num(ctx.descuentoPct);
  const netoFijoEstimado = fijoMensual !== null && desc !== null && desc >= 0 && desc < 100 ? redondear(fijoMensual * (1 - desc / 100)) : null;

  const filas: FilaFormula[] = [];
  if (fijoAnual !== null) filas.push({ clave: "fijo", etiqueta: "Salario fijo anual", formula: `${m(fijoMensual!)} × ${pagos} pagos = ${m(fijoAnual)}`, valor: fijoAnual });
  filas.push({ clave: "variable-max", etiqueta: "Variable (máximo posible)", formula: formulaVariable, valor: variableMaximo });
  filas.push({ clave: "variable-seguro", etiqueta: "Variable (escenario conservador)", formula: `${m(variableMaximo)} × ${pctSeguro} % = ${m(variableConservador)}`, valor: variableConservador });
  filas.push({ clave: "beneficios", etiqueta: "Beneficios que tú valorizas", formula: monetarios.length ? `${monetarios.map((b) => m(num(b.valor) ?? 0)).join(" + ")} = ${m(beneficios)}` : "Ninguno valorizado: 0.00", valor: beneficios });
  if (conservador) filas.push({ clave: "bruto-conservador", etiqueta: "Valor anual bruto (conservador)", formula: `${m(fijoAnual!)} + ${m(variableConservador)} + ${m(beneficios)} = ${m(conservador.bruto)}`, valor: conservador.bruto });
  if (completo) filas.push({ clave: "bruto-completo", etiqueta: "Valor anual bruto (completo)", formula: `${m(fijoAnual!)} + ${m(variableMaximo)} + ${m(beneficios)} = ${m(completo.bruto)}`, valor: completo.bruto });
  if (costo !== null) filas.push({ clave: "costo", etiqueta: "Costo de trabajar presencial", formula: `${diasPorSemana} días × ${semanas} semanas × ${m(costoPorDia)} por día = ${m(costo)}`, valor: costo });
  if (conservador && costo !== null) filas.push({ clave: "despues-conservador", etiqueta: "Después de costos (conservador)", formula: `${m(conservador.bruto)} − ${m(costo)} = ${m(conservador.despuesDeCostos)}`, valor: conservador.despuesDeCostos });
  if (completo && costo !== null) filas.push({ clave: "despues-completo", etiqueta: "Después de costos (completo)", formula: `${m(completo.bruto)} − ${m(costo)} = ${m(completo.despuesDeCostos)}`, valor: completo.despuesDeCostos });

  return { valido: fijoAnual !== null, fijoMensual, pagos, fijoAnual, variableMaximo, variableConservador, beneficios, beneficiosNoMonetarios, diasPorSemana, semanas, costoPorDia, costo, conservador, completo, netoFijoEstimado, filas, problemas };
}

export const contextoDe = (d: DatosSalario): ContextoCalculo => ({ modalidad: d.modalidad, transporteDia: d.transporteDia, comidaDia: d.comidaDia, semanas: d.semanas, descuentoPct: d.descuentoPct });

export interface FilaComparacion {
  clave: string;
  etiqueta: string;
  a: number;
  b: number;
  /** b − a. */
  diferencia: number;
  /** Diferencia respecto de A, en %; null si A vale 0. */
  porcentaje: number | null;
  /** Qué oferta conviene en esta fila: la de mayor valor, salvo en el costo (gana el menor). */
  mejor: "a" | "b" | "igual";
}

/** Tabla de diferencias entre dos ofertas (solo con datos de ambas). */
export function compararOfertas(a: CalculoOferta, b: CalculoOferta): FilaComparacion[] {
  if (a.fijoAnual === null || b.fijoAnual === null || a.conservador === null || b.conservador === null || a.completo === null || b.completo === null || a.costo === null || b.costo === null) return [];
  const fila = (clave: string, etiqueta: string, va: number, vb: number, menorEsMejor = false): FilaComparacion => {
    const dif = redondear(vb - va);
    const mejor = dif === 0 ? "igual" : (dif > 0) !== menorEsMejor ? "b" : "a";
    return { clave, etiqueta, a: va, b: vb, diferencia: dif, porcentaje: va === 0 ? null : redondear((dif / va) * 100), mejor };
  };
  return [
    fila("fijo", "Salario fijo anual", a.fijoAnual, b.fijoAnual),
    fila("variable-seguro", "Variable (conservador)", a.variableConservador, b.variableConservador),
    fila("variable-max", "Variable (máximo)", a.variableMaximo, b.variableMaximo),
    fila("beneficios", "Beneficios valorizados", a.beneficios, b.beneficios),
    fila("costo", "Costo de trabajar presencial", a.costo, b.costo, true),
    fila("bruto-conservador", "Valor anual bruto (conservador)", a.conservador.bruto, b.conservador.bruto),
    fila("bruto-completo", "Valor anual bruto (completo)", a.completo.bruto, b.completo.bruto),
    fila("despues-conservador", "Después de costos (conservador)", a.conservador.despuesDeCostos, b.conservador.despuesDeCostos),
    fila("despues-completo", "Después de costos (completo)", a.completo.despuesDeCostos, b.completo.despuesDeCostos),
  ];
}

export type ClaveCifra = "minimo" | "objetivo" | "ancla";
export const CIFRAS: { clave: ClaveCifra; etiqueta: string; ayuda: string }[] = [
  { clave: "minimo", etiqueta: "Mínimo aceptable", ayuda: "Por debajo de esta cifra dices que no. Es tu límite (walk-away); no lo compartas." },
  { clave: "objetivo", etiqueta: "Objetivo", ayuda: "La cifra con la que estarías contento. Es lo que buscas cerrar." },
  { clave: "ancla", etiqueta: "Ancla", ayuda: "La cifra ambiciosa con la que empiezas, que puedas justificar." },
];

export interface CifraVsOferta {
  clave: ClaveCifra;
  valor: number;
  /** Cifra − fijo mensual de la oferta. */
  diferencia: number;
  porcentaje: number;
  /** Diferencia × pagos al año: lo que cambia por año si la consigues. */
  impactoAnual: number | null;
}

export interface EvaluacionCifras {
  /** Las tres cifras están escritas y cumplen ancla ≥ objetivo ≥ mínimo. */
  valida: boolean;
  problemas: string[];
  valores: Partial<Record<ClaveCifra, number>>;
  vsOferta: CifraVsOferta[];
  referencias: { total: number; completas: number; incompletas: number; minima: number | null; maxima: number | null; mediana: number | null };
  /** Dónde cae cada cifra respecto del rango de las referencias que aportó la persona (solo con referencias completas). */
  posiciones: { clave: ClaveCifra; texto: string }[];
}

/**
 * Evalúa las tres cifras (salario fijo mensual bruto): orden, distancia a la oferta y posición respecto de las referencias que la
 * PERSONA aportó (con fuente y fecha). No hay cifras de mercado propias: sin referencias no se compara con nada.
 */
export function evaluarCifras(d: DatosSalario, oferta: CalculoOferta): EvaluacionCifras {
  const valores: Partial<Record<ClaveCifra, number>> = {};
  const problemas: string[] = [];
  for (const c of CIFRAS) {
    const texto = d[c.clave];
    const n = num(texto);
    if (texto.trim() && (n === null || n <= 0)) problemas.push(`${c.etiqueta}: escribe un monto mayor que cero.`);
    else if (n !== null) valores[c.clave] = n;
  }
  const { minimo, objetivo, ancla } = valores;
  if (minimo !== undefined && objetivo !== undefined && objetivo < minimo) problemas.push("El objetivo no puede ser menor que el mínimo aceptable.");
  if (objetivo !== undefined && ancla !== undefined && ancla < objetivo) problemas.push("El ancla no puede ser menor que el objetivo.");
  if (minimo !== undefined && ancla !== undefined && ancla < minimo) problemas.push("El ancla no puede ser menor que el mínimo aceptable.");
  const valida = minimo !== undefined && objetivo !== undefined && ancla !== undefined && problemas.length === 0;

  const vsOferta: CifraVsOferta[] = [];
  if (oferta.fijoMensual !== null && oferta.fijoMensual > 0) {
    for (const c of CIFRAS) {
      const v = valores[c.clave];
      if (v === undefined) continue;
      const dif = redondear(v - oferta.fijoMensual);
      vsOferta.push({ clave: c.clave, valor: v, diferencia: dif, porcentaje: redondear((dif / oferta.fijoMensual) * 100), impactoAnual: oferta.pagos !== null ? redondear(dif * oferta.pagos) : null });
    }
  }

  const completas = d.referencias.filter((r) => (num(r.monto) ?? 0) > 0 && r.fuente.trim() && r.fecha.trim());
  const montos = completas.map((r) => num(r.monto)!).sort((x, y) => x - y);
  const mediana = montos.length === 0 ? null : montos.length % 2 ? montos[(montos.length - 1) / 2] : redondear((montos[montos.length / 2 - 1] + montos[montos.length / 2]) / 2);
  const minima = montos.length ? montos[0] : null;
  const maxima = montos.length ? montos[montos.length - 1] : null;
  const referencias = { total: d.referencias.length, completas: completas.length, incompletas: d.referencias.length - completas.length, minima, maxima, mediana };

  const posiciones: { clave: ClaveCifra; texto: string }[] = [];
  if (minima !== null && maxima !== null) {
    for (const c of CIFRAS) {
      const v = valores[c.clave];
      if (v === undefined) continue;
      const nombre = c.etiqueta;
      if (v < minima) posiciones.push({ clave: c.clave, texto: `${nombre} (${m(v)}) está ${formatoPorcentaje(redondear(((minima - v) / minima) * 100))} por debajo de tu referencia más baja (${m(minima)}).` });
      else if (v > maxima) posiciones.push({ clave: c.clave, texto: `${nombre} (${m(v)}) está ${formatoPorcentaje(redondear(((v - maxima) / maxima) * 100))} por encima de tu referencia más alta (${m(maxima)}): prepárate para justificarla.` });
      else posiciones.push({ clave: c.clave, texto: `${nombre} (${m(v)}) queda dentro del rango de tus referencias (${m(minima)} a ${m(maxima)}).` });
    }
  }
  return { valida, problemas, valores, vsOferta, referencias, posiciones };
}
