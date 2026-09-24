/**
 * El caso de ejemplo de cada página («Un ejemplo, paso a paso») se construye con LOS MISMOS datos que rellena
 * «Probar con un ejemplo»: así el texto de la página y el prompt que sale al pulsar el botón no pueden diferir.
 */
import { calcular } from "./calculadora";
import { ejecutarPreproceso } from "./preprocesos";
import type { Herramienta } from "./tipos";

export interface DatoEjemplo {
  etiqueta: string;
  valor: string;
}

export interface CalculoEjemplo {
  etiqueta: string;
  texto: string;
}

/** Valores exactos de «Probar con un ejemplo»: los campos del formulario y las entradas de la calculadora (sin los vacíos). */
export function datosDelEjemplo(h: Pick<Herramienta, "campos" | "calculadora">): DatoEjemplo[] {
  return [
    ...h.campos.filter((c) => c.ejemplo.trim() !== "").map((c) => ({ etiqueta: c.label, valor: c.ejemplo })),
    ...(h.calculadora?.entradas.filter((e) => String(e.ejemplo).trim() !== "").map((e) => ({ etiqueta: e.label, valor: String(e.ejemplo) })) ?? []),
  ];
}

/** Lo que la página calcula o cuenta con esos datos (la misma lógica que corre en el navegador). */
export function calculosDelEjemplo(h: Pick<Herramienta, "campos" | "calculadora" | "preproceso">): CalculoEjemplo[] {
  if (h.calculadora) {
    const estado = calcular(h.calculadora, Object.fromEntries(h.calculadora.entradas.map((e) => [e.id, e.ejemplo])));
    return estado.resultados.filter((r) => r.texto !== null).map((r) => ({ etiqueta: r.etiqueta, texto: r.texto as string }));
  }
  if (h.preproceso) {
    const estado = ejecutarPreproceso(h.preproceso, Object.fromEntries(h.campos.map((c) => [c.id, c.ejemplo])));
    if (estado.completo) return estado.resultados.filter((r) => r.texto !== null).map((r) => ({ etiqueta: r.etiqueta, texto: r.texto as string }));
  }
  return [];
}
