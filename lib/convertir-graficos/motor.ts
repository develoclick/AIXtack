import { parsearNumero } from "@/lib/presupuesto/calculo";
import type { Agregacion, FilaTabla, TipoGrafico } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Como parsearNumero, pero admite negativos: una columna cualquiera puede traer valores negativos legítimos. */
export function parsearNumeroTolerante(entrada: string): number | null {
  const t = (entrada ?? "").trim();
  const negativo = t.startsWith("-");
  const n = parsearNumero(negativo ? t.slice(1) : t);
  return n === null ? null : negativo ? -n : n;
}

export interface SerieCalculada {
  etiquetas: string[];
  series: { nombre: string; valores: number[] }[];
}

/**
 * Agrupa las filas por la columna X (y por la columna de color, si se da) y agrega la columna Y con la operación elegida.
 * Nunca lo calcula la IA: la IA solo sugiere qué columnas usar, esta función hace la cuenta.
 */
export function agregarPorCategoria(filas: FilaTabla[], x: string, y: string, agregacion: Agregacion, color: string | null): SerieCalculada {
  const gruposX: string[] = [];
  const nombresSerieSet = new Set<string>();
  const acumulado = new Map<string, Map<string, { suma: number; cuenta: number }>>();

  for (const fila of filas) {
    const claveX = (fila[x] ?? "").trim();
    if (!claveX) continue;
    if (!gruposX.includes(claveX)) gruposX.push(claveX);
    const nombreSerie = color ? (fila[color] ?? "").trim() || "(sin dato)" : "";
    nombresSerieSet.add(nombreSerie);
    const valorY = agregacion === "conteo" ? 1 : parsearNumeroTolerante(fila[y] ?? "");
    if (agregacion !== "conteo" && valorY === null) continue;
    if (!acumulado.has(nombreSerie)) acumulado.set(nombreSerie, new Map());
    const porX = acumulado.get(nombreSerie)!;
    const actual = porX.get(claveX) ?? { suma: 0, cuenta: 0 };
    actual.suma += valorY ?? 1;
    actual.cuenta += 1;
    porX.set(claveX, actual);
  }

  const nombresSerie = [...nombresSerieSet];
  const series = nombresSerie.map((nombre) => ({
    nombre,
    valores: gruposX.map((cx) => {
      const c = acumulado.get(nombre)?.get(cx);
      if (!c) return 0;
      return agregacion === "promedio" ? redondear(c.suma / c.cuenta) : redondear(c.suma);
    }),
  }));

  return { etiquetas: gruposX, series };
}

/** Ordena de mayor a menor según la primera serie (para comparar categorías con barras). */
export function ordenarDescendente(s: SerieCalculada): SerieCalculada {
  if (s.series.length === 0 || s.etiquetas.length === 0) return s;
  const indices = s.etiquetas.map((_, i) => i).sort((a, b) => s.series[0].valores[b] - s.series[0].valores[a]);
  return { etiquetas: indices.map((i) => s.etiquetas[i]), series: s.series.map((ser) => ({ ...ser, valores: indices.map((i) => ser.valores[i]) })) };
}

/** Ordena cronológicamente (o alfabéticamente si no son fechas) para ver una evolución en el orden correcto. */
export function ordenarPorEtiqueta(s: SerieCalculada): SerieCalculada {
  const indices = s.etiquetas.map((_, i) => i).sort((a, b) => s.etiquetas[a].localeCompare(s.etiquetas[b]));
  return { etiquetas: indices.map((i) => s.etiquetas[i]), series: s.series.map((ser) => ({ ...ser, valores: indices.map((i) => ser.valores[i]) })) };
}

export interface Histograma {
  etiquetas: string[];
  valores: number[];
}

/** Agrupa una columna numérica en franjas (regla simple de 10 franjas de igual ancho) para ver su distribución. */
export function calcularHistograma(filas: FilaTabla[], columna: string, bins = 10): Histograma {
  const valores = filas.map((f) => parsearNumeroTolerante(f[columna] ?? "")).filter((v): v is number => v !== null);
  if (valores.length === 0) return { etiquetas: [], valores: [] };
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  if (minimo === maximo) return { etiquetas: [String(minimo)], valores: [valores.length] };
  const ancho = (maximo - minimo) / bins;
  const cuentas = new Array(bins).fill(0) as number[];
  for (const v of valores) {
    const idx = Math.min(bins - 1, Math.floor((v - minimo) / ancho));
    cuentas[idx]++;
  }
  const etiquetas = Array.from({ length: bins }, (_, i) => `${redondear(minimo + i * ancho)}–${redondear(minimo + (i + 1) * ancho)}`);
  return { etiquetas, valores: cuentas };
}

export interface Punto {
  x: number;
  y: number;
}

/** Pares (x, y) de 2 columnas numéricas, sin agregar: cada fila válida es un punto. */
export function calcularDispersion(filas: FilaTabla[], xCol: string, yCol: string): Punto[] {
  return filas
    .map((f) => ({ x: parsearNumeroTolerante(f[xCol] ?? ""), y: parsearNumeroTolerante(f[yCol] ?? "") }))
    .filter((p): p is Punto => p.x !== null && p.y !== null);
}

/** Coeficiente de correlación de Pearson (-1 a 1): qué tan juntas se mueven 2 variables numéricas. Nunca implica causalidad. */
export function correlacionPearson(puntos: Punto[]): number | null {
  const n = puntos.length;
  if (n < 2) return null;
  const mediaX = puntos.reduce((s, p) => s + p.x, 0) / n;
  const mediaY = puntos.reduce((s, p) => s + p.y, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (const p of puntos) {
    const dx = p.x - mediaX;
    const dy = p.y - mediaY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return null;
  return redondear(num / Math.sqrt(denX * denY));
}

export interface DatosGrafico {
  etiquetas: string[];
  series: { nombre: string; valores: number[] }[];
  puntos?: Punto[];
}

/** Calcula los datos de cualquier tipo de gráfico (barras, líneas, áreas, pastel, histograma o dispersión) con una sola función, para no repetir esta lógica en cada componente. */
export function calcularParaTipo(filas: FilaTabla[], tipo: TipoGrafico, x: string, y: string, color: string | null, agregacion: Agregacion): DatosGrafico {
  if (tipo === "dispersion") return { etiquetas: [], series: [], puntos: calcularDispersion(filas, x, y) };
  if (tipo === "histograma") {
    const h = calcularHistograma(filas, x);
    return { etiquetas: h.etiquetas, series: [{ nombre: "", valores: h.valores }] };
  }
  let s = agregarPorCategoria(filas, x, y, agregacion, color);
  if (tipo === "barras" || tipo === "pastel") s = ordenarDescendente(s);
  else if (tipo === "lineas" || tipo === "areas") s = ordenarPorEtiqueta(s);
  return { etiquetas: s.etiquetas, series: s.series };
}
