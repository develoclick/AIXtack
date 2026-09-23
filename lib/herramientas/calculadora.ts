/**
 * Motor de las calculadoras: convierte lo que escribe la persona en números, valida cada entrada,
 * evalúa las fórmulas del archivo de datos y da a cada resultado su texto. Los cálculos los hace la
 * página, nunca la IA: el prompt recibe estos resultados ya hechos.
 */
import { evaluar } from "./expresiones";
import type { Calculadora, EntradaCalculadora, FormatoNumero, SalidaCalculadora } from "./tipos";

export interface ResultadoCalculo {
  id: string;
  etiqueta: string;
  /** Valor numérico (fracción para los porcentajes); `null` si faltan datos o no se puede calcular. */
  valor: number | null;
  /** Texto para mostrar y para el prompt; `null` cuando no hay valor. */
  texto: string | null;
  enPrompt: boolean;
  opcional: boolean;
}

export interface EstadoCalculadora {
  /** Un mensaje por entrada con problema (vacía y requerida, no numérica, fuera de rango). */
  errores: Record<string, string>;
  resultados: ResultadoCalculo[];
  /** `true` si todas las entradas requeridas son válidas y todas las salidas tienen valor. */
  completo: boolean;
}

/** «12,5» y «12.5» valen lo mismo; «1.234,5» y «1,234.5» también. Devuelve `null` si no es un número. */
export function leerNumero(texto: string | number | undefined): number | null {
  if (typeof texto === "number") return Number.isFinite(texto) ? texto : null;
  if (texto === undefined) return null;
  let s = texto.trim().replace(/\s/g, "");
  if (s === "") return null;
  const coma = s.lastIndexOf(",");
  const punto = s.lastIndexOf(".");
  if (coma >= 0 && punto >= 0) s = coma > punto ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (coma >= 0) s = s.replace(",", ".");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function fijo(n: number, decimales: number): string {
  const f = 10 ** decimales;
  const r = Math.round((Math.abs(n) + Number.EPSILON) * f) / f;
  const texto = r.toFixed(decimales);
  return n < 0 && r !== 0 ? `-${texto}` : texto;
}

export function simboloMoneda(moneda: string | undefined): string {
  const m = (moneda ?? "").trim();
  return m === "" ? "$" : m;
}

/** Da formato a un valor. Los números llevan punto decimal y ningún separador de miles. */
export function formatear(valor: number, formato: FormatoNumero, decimales: number | undefined, moneda?: string): string {
  switch (formato) {
    case "moneda": {
      const simbolo = simboloMoneda(moneda);
      const cifra = fijo(valor, decimales ?? 2);
      const signo = cifra.startsWith("-") ? "-" : "";
      const abs = signo ? cifra.slice(1) : cifra;
      return /[A-Za-z/]/.test(simbolo) ? `${signo}${simbolo} ${abs}` : `${signo}${simbolo}${abs}`;
    }
    case "porcentaje":
      return `${fijo(valor * 100, decimales ?? 1)} %`;
    case "entero":
      return fijo(valor, 0);
    case "si-no":
      return valor !== 0 ? "Sí" : "No";
    case "numero":
      return fijo(valor, decimales ?? 2);
  }
}

function valorEntrada(entrada: EntradaCalculadora, texto: string | number | undefined): { valor: number | null; error?: string } {
  const vacia = texto === undefined || String(texto).trim() === "";
  if (vacia) {
    if (entrada.requerido !== false) return { valor: null, error: "Escribe un número." };
    // El valor por defecto se escribe como la persona lo escribiría (20 = 20 %), igual que un dato tecleado.
    const defecto = entrada.porDefecto ?? 0;
    return { valor: entrada.unidad === "porcentaje" ? defecto / 100 : defecto };
  }
  const n = leerNumero(texto);
  if (n === null) return { valor: null, error: "Escribe solo números (por ejemplo 12.5)." };
  if (entrada.unidad === "entero" && !Number.isInteger(n)) return { valor: null, error: "Escribe un número entero." };
  const min = entrada.min ?? 0;
  if (n < min) return { valor: null, error: `Debe ser ${min} o más.` };
  if (entrada.max !== undefined && n > entrada.max) return { valor: null, error: `Debe ser ${entrada.max} o menos.` };
  return { valor: entrada.unidad === "porcentaje" ? n / 100 : n };
}

export function calcular(calculadora: Calculadora, entradas: Record<string, string | number | undefined>, moneda?: string): EstadoCalculadora {
  const errores: Record<string, string> = {};
  const vars: Record<string, number | null> = {};
  for (const entrada of calculadora.entradas) {
    const { valor, error } = valorEntrada(entrada, entradas[entrada.id]);
    vars[entrada.id] = valor;
    if (error) errores[entrada.id] = error;
  }

  const resultados: ResultadoCalculo[] = [];
  for (const salida of calculadora.salidas as SalidaCalculadora[]) {
    // Una entrada con error vale null y el null se propaga: el resultado queda sin cifra, nunca inventado.
    const valor = evaluar(salida.formula, vars);
    vars[salida.id] = valor;
    resultados.push({
      id: salida.id,
      etiqueta: salida.etiqueta,
      valor,
      texto: valor === null ? null : formatear(valor, salida.formato, salida.decimales, moneda),
      enPrompt: salida.enPrompt !== false,
      opcional: salida.opcional === true,
    });
  }
  return { errores, resultados, completo: Object.keys(errores).length === 0 && resultados.every((r) => r.valor !== null || r.opcional) };
}

export interface FalloDeCaso {
  caso: string;
  salida: string;
  esperado: number | string;
  obtenido: number | string | null;
}

/** Ejecuta los `casosDePrueba` de una calculadora y devuelve lo que no coincide (vacío = todo bien). */
export function verificarCasos(calculadora: Calculadora): FalloDeCaso[] {
  const fallos: FalloDeCaso[] = [];
  for (const caso of calculadora.casosDePrueba) {
    const estado = calcular(calculadora, caso.entradas);
    const tolerancia = caso.tolerancia ?? 0.0005;
    for (const [id, esperado] of Object.entries(caso.esperado)) {
      const r = estado.resultados.find((x) => x.id === id);
      if (!r) {
        fallos.push({ caso: caso.nombre, salida: id, esperado, obtenido: null });
        continue;
      }
      const ok = typeof esperado === "number" ? r.valor !== null && Math.abs(r.valor - esperado) <= tolerancia : r.texto === esperado;
      if (!ok) fallos.push({ caso: caso.nombre, salida: id, esperado, obtenido: typeof esperado === "number" ? r.valor : r.texto });
    }
  }
  return fallos;
}

export type { EntradaCalculadora };
