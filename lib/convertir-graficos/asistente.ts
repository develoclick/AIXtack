import type { ColumnaDetectada, Objetivo, TipoGrafico } from "./tipos";

/** El tipo de gráfico que recomienda esta página para cada objetivo. Es una regla propia del sitio, no la decide la IA. */
export function tipoSugerido(objetivo: Objetivo): TipoGrafico {
  switch (objetivo) {
    case "comparar":
      return "barras";
    case "evolucionar":
      return "lineas";
    case "componer":
      return "pastel";
    case "distribuir":
      return "histograma";
    case "relacionar":
      return "dispersion";
  }
}

/** Una frase que explica por qué ese tipo de gráfico responde a ese objetivo (se usa en el asistente y en la guía). */
export function razonDelTipo(tipo: TipoGrafico): string {
  switch (tipo) {
    case "barras":
      return "Las barras comparan valores entre categorías de un vistazo, sobre todo si las ordenas de mayor a menor.";
    case "lineas":
      return "Las líneas muestran la dirección de un cambio a lo largo del tiempo mejor que cualquier otro tipo.";
    case "areas":
      return "Las áreas funcionan como las líneas, pero dan más peso visual al volumen acumulado.";
    case "pastel":
      return "El pastel muestra qué parte del total representa cada categoría, pero solo funciona bien con pocas partes (5 o menos).";
    case "histograma":
      return "El histograma agrupa una variable numérica en franjas para mostrar cómo se reparten sus valores.";
    case "dispersion":
      return "La dispersión ubica cada fila como un punto (x, y) para ver si 2 variables numéricas se mueven juntas.";
    case "tabla":
      return "Cuando hay pocos datos o valores muy distintos entre sí, una tabla puede comunicar mejor que un gráfico.";
  }
}

export interface ProblemaSeleccion {
  campo: "x" | "y" | "color";
  mensaje: string;
}

const esNumerica = (c: ColumnaDetectada) => c.tipo === "numero";
const esFecha = (c: ColumnaDetectada) => c.tipo === "fecha";

/** Revisa si las columnas elegidas encajan con el tipo de gráfico (por ejemplo, evolución necesita una columna de fecha en X). No decide por la persona: solo avisa. */
export function validarSeleccion(tipo: TipoGrafico, x: ColumnaDetectada | null, y: ColumnaDetectada | null, agregacionEsConteo: boolean): ProblemaSeleccion[] {
  const problemas: ProblemaSeleccion[] = [];
  if (!x) {
    problemas.push({ campo: "x", mensaje: "Elige una columna para el eje X." });
    return problemas;
  }
  if (tipo === "lineas" || tipo === "areas") {
    if (!esFecha(x)) problemas.push({ campo: "x", mensaje: "Para ver una evolución, el eje X debería ser una columna de fecha." });
  }
  if (tipo === "histograma") {
    if (!esNumerica(x)) problemas.push({ campo: "x", mensaje: "Para ver una distribución, elige una columna numérica." });
    return problemas;
  }
  if (tipo === "dispersion") {
    if (!esNumerica(x)) problemas.push({ campo: "x", mensaje: "Para ver una relación, el eje X debe ser una columna numérica." });
    if (!y) problemas.push({ campo: "y", mensaje: "Elige una segunda columna numérica para el eje Y." });
    else if (!esNumerica(y)) problemas.push({ campo: "y", mensaje: "El eje Y debe ser una columna numérica." });
    return problemas;
  }
  if (!agregacionEsConteo && !y) problemas.push({ campo: "y", mensaje: "Elige una columna numérica para el eje Y, o cambia la agregación a «conteo»." });
  if (!agregacionEsConteo && y && !esNumerica(y)) problemas.push({ campo: "y", mensaje: "El eje Y debe ser una columna numérica (o usa «conteo»)." });
  return problemas;
}

/** ¿Un pastel con más de 5 categorías? La página lo detecta y sugiere barras en su lugar, sin decidirlo la IA. */
export function pastelExcedeCategorias(cantidadCategorias: number, maximo = 5): boolean {
  return cantidadCategorias > maximo;
}
