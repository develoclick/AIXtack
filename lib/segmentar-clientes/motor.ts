import { parsearNumero } from "@/lib/presupuesto/calculo";
import type { HojaCruda } from "./parser";
import { CLAVES_SEGMENTO_RFM, SIN_SEGMENTO, type ClaveSegmentoRFM, type MapeoColumnas, type NombresSegmentoRFM, type ReglaSegmento } from "./tipos";

const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Como parsearNumero, pero admite negativos (una nota de crédito, por ejemplo). */
export function parsearNumeroTolerante(entrada: string): number | null {
  const t = (entrada ?? "").trim();
  const negativo = t.startsWith("-");
  const n = parsearNumero(negativo ? t.slice(1) : t);
  return n === null ? null : negativo ? -n : n;
}

/** «DD/MM/AAAA» o «AAAA-MM-DD» → «AAAA-MM-DD» (o null si no se puede leer). Perú usa día/mes/año. */
export function normalizarFecha(crudo: string): string | null {
  const v = (crudo ?? "").trim();
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

/** Días entre 2 fechas AAAA-MM-DD (puede ser negativo si la última compra es posterior a la fecha de referencia). */
export function diasEntre(desde: string, hasta: string): number | null {
  const a = normalizarFecha(desde);
  const b = normalizarFecha(hasta);
  if (!a || !b) return null;
  return diasDesde(b) - diasDesde(a);
}

export interface ClienteAgregado {
  id: string;
  ultimaCompra: string | null;
  pedidos: number;
  gastoTotal: number;
  ubicacion: string;
  canal: string;
  categoria: string;
}

const celda = (fila: string[], indice: number | null) => (indice === null ? "" : (fila[indice] ?? "").trim());

function moda(valores: string[]): string {
  const conteo = new Map<string, number>();
  for (const v of valores) if (v) conteo.set(v, (conteo.get(v) ?? 0) + 1);
  let mejor = "";
  let max = 0;
  for (const [v, n] of conteo) {
    if (n > max) {
      mejor = v;
      max = n;
    }
  }
  return mejor;
}

/** Agrega transacciones (una fila por compra) en una fila por cliente: última compra, nº de pedidos y gasto total. Nunca lo hace la IA. */
export function agregarTransacciones(hoja: HojaCruda, mapeo: MapeoColumnas): ClienteAgregado[] {
  const datos = hoja.filas.slice(1);
  const grupos = new Map<string, { fechas: string[]; importes: number[]; ubicaciones: string[]; canales: string[]; categorias: string[] }>();
  for (const fila of datos) {
    const id = celda(fila, mapeo.clienteId);
    if (!id) continue;
    const g = grupos.get(id) ?? { fechas: [], importes: [], ubicaciones: [], canales: [], categorias: [] };
    const fecha = normalizarFecha(celda(fila, mapeo.fecha));
    if (fecha) g.fechas.push(fecha);
    const importe = parsearNumeroTolerante(celda(fila, mapeo.importe));
    if (importe !== null) g.importes.push(importe);
    if (mapeo.ubicacion !== null) g.ubicaciones.push(celda(fila, mapeo.ubicacion));
    if (mapeo.canal !== null) g.canales.push(celda(fila, mapeo.canal));
    if (mapeo.categoria !== null) g.categorias.push(celda(fila, mapeo.categoria));
    grupos.set(id, g);
  }
  return [...grupos.entries()].map(([id, g]) => ({
    id,
    ultimaCompra: g.fechas.length ? g.fechas.reduce((a, b) => (b > a ? b : a)) : null,
    pedidos: g.fechas.length || g.importes.length,
    gastoTotal: redondear(g.importes.reduce((s, v) => s + v, 0)),
    ubicacion: moda(g.ubicaciones),
    canal: moda(g.canales),
    categoria: moda(g.categorias),
  }));
}

/** Lee un archivo donde cada fila YA es un cliente (no hay que agregar transacciones): usa las columnas mapeadas tal cual. */
export function clientesDesdeFilasResumidas(hoja: HojaCruda, mapeo: MapeoColumnas): ClienteAgregado[] {
  const datos = hoja.filas.slice(1);
  const vistos = new Set<string>();
  const salida: ClienteAgregado[] = [];
  for (const fila of datos) {
    const id = celda(fila, mapeo.clienteId);
    if (!id || vistos.has(id)) continue;
    vistos.add(id);
    const pedidos = mapeo.pedidos !== null ? (parsearNumeroTolerante(celda(fila, mapeo.pedidos)) ?? 0) : 1;
    salida.push({
      id,
      ultimaCompra: normalizarFecha(celda(fila, mapeo.fecha)),
      pedidos: Math.max(0, Math.round(pedidos)),
      gastoTotal: redondear(parsearNumeroTolerante(celda(fila, mapeo.importe)) ?? 0),
      ubicacion: celda(fila, mapeo.ubicacion),
      canal: celda(fila, mapeo.canal),
      categoria: celda(fila, mapeo.categoria),
    });
  }
  return salida;
}

export interface CalidadDatosClientes {
  totalClientes: number;
  sinUltimaCompra: number;
  sinGasto: number;
  gastoNegativo: number;
  sinPedidos: number;
}

export function calidadDeDatosClientes(clientes: ClienteAgregado[]): CalidadDatosClientes {
  return {
    totalClientes: clientes.length,
    sinUltimaCompra: clientes.filter((c) => !c.ultimaCompra).length,
    sinGasto: clientes.filter((c) => c.gastoTotal === 0).length,
    gastoNegativo: clientes.filter((c) => c.gastoTotal < 0).length,
    sinPedidos: clientes.filter((c) => c.pedidos === 0).length,
  };
}

export type ClienteConRecencia = ClienteAgregado & { recenciaDias: number | null };

/** Días desde la última compra hasta la fecha de referencia (más chico = más reciente). null si no hay fecha de última compra. */
export function conRecencia(clientes: ClienteAgregado[], fechaReferencia: string): ClienteConRecencia[] {
  return clientes.map((c) => ({ ...c, recenciaDias: c.ultimaCompra ? diasEntre(c.ultimaCompra, fechaReferencia) : null }));
}

/**
 * Quintiles 1–5 por posición (igual nº de clientes por franja, en lo posible): `orden: "asc"` → el valor más alto cae en la
 * franja 5 (frecuencia, gasto); `orden: "desc"` → el valor más BAJO cae en la franja 5 (recencia: menos días = más reciente
 * = mejor puntaje). Los valores `null` (sin dato) quedan en la franja 1. Calculado en el navegador, nunca por la IA.
 */
export function cuantiles(valores: (number | null)[], orden: "asc" | "desc"): number[] {
  const n = valores.length;
  const indices = valores.map((_, i) => i).filter((i) => valores[i] !== null);
  const ordenados = [...indices].sort((a, b) => (orden === "asc" ? valores[a]! - valores[b]! : valores[b]! - valores[a]!));
  const puntaje = new Array<number>(n).fill(1);
  ordenados.forEach((idxOriginal, rango) => {
    puntaje[idxOriginal] = Math.min(5, Math.floor((rango / ordenados.length) * 5) + 1);
  });
  return puntaje;
}

/**
 * Nombra el segmento RFM por una regla simple sobre R (recencia) y F (frecuencia), pensada para explicarse en una tabla
 * corta: compara solo R y F (el gasto, M, queda como dato del segmento, no como parte del nombre) — es una regla propia de
 * este sitio, no un estándar de la industria.
 */
export function claveSegmentoRFM(r: number, f: number): ClaveSegmentoRFM {
  if (r >= 4 && f >= 4) return "campeones";
  if (r >= 3 && f >= 3) return "leales";
  if (r <= 2 && f >= 4) return "en_riesgo";
  if (r <= 2 && f <= 2) return "perdidos";
  if (r >= 4 && f <= 2) return "nuevos";
  return "regulares";
}

export interface ClienteRFM extends ClienteConRecencia {
  r: number;
  f: number;
  m: number;
  segmentoClave: ClaveSegmentoRFM;
}

/** Calcula R, F, M y el segmento de cada cliente. Único punto donde se decide el puntaje: la IA nunca lo recalcula. */
export function calcularRFM(clientes: ClienteAgregado[], fechaReferencia: string): ClienteRFM[] {
  const base = conRecencia(clientes, fechaReferencia);
  const r = cuantiles(base.map((c) => c.recenciaDias), "desc");
  const f = cuantiles(base.map((c) => c.pedidos), "asc");
  const m = cuantiles(base.map((c) => c.gastoTotal), "asc");
  return base.map((c, i) => ({ ...c, r: r[i], f: f[i], m: m[i], segmentoClave: claveSegmentoRFM(r[i], f[i]) }));
}

/** Cuenta de clientes por celda de la matriz R×F (1–5 × 1–5), para el mapa de calor. */
export interface CeldaMatrizRF {
  r: number;
  f: number;
  cantidad: number;
}

export function matrizRF(clientes: ClienteRFM[]): CeldaMatrizRF[] {
  const celdas: CeldaMatrizRF[] = [];
  for (let r = 1; r <= 5; r++) for (let f = 1; f <= 5; f++) celdas.push({ r, f, cantidad: clientes.filter((c) => c.r === r && c.f === f).length });
  return celdas;
}

export interface SegmentoResumen {
  nombre: string;
  cantidad: number;
  pctBase: number;
  pctIngresos: number;
  recenciaMediaDias: number | null;
  frecuenciaMedia: number;
  gastoMedio: number;
}

function promedio(valores: number[]): number {
  return valores.length ? redondear(valores.reduce((s, v) => s + v, 0) / valores.length) : 0;
}

/** Arma la tabla de segmentos (tamaño, % de la base, % de los ingresos, medias) a partir de cualquier lista ya segmentada: la única fuente de cifras que recibe el prompt. */
export function resumenSegmentos(clientes: (ClienteConRecencia & { segmentoNombre: string })[], ordenNombres?: string[]): SegmentoResumen[] {
  const totalClientes = clientes.length;
  const totalIngresos = clientes.reduce((s, c) => s + c.gastoTotal, 0);
  const nombres = ordenNombres ?? [...new Set(clientes.map((c) => c.segmentoNombre))];
  const resumen = nombres
    .map((nombre): SegmentoResumen | null => {
      const grupo = clientes.filter((c) => c.segmentoNombre === nombre);
      if (grupo.length === 0) return null;
      const dias = grupo.filter((c) => c.recenciaDias !== null).map((c) => c.recenciaDias!);
      return {
        nombre,
        cantidad: grupo.length,
        pctBase: totalClientes > 0 ? redondear((grupo.length / totalClientes) * 100) : 0,
        pctIngresos: totalIngresos > 0 ? redondear((grupo.reduce((s, c) => s + c.gastoTotal, 0) / totalIngresos) * 100) : 0,
        recenciaMediaDias: dias.length ? Math.round(promedio(dias)) : null,
        frecuenciaMedia: promedio(grupo.map((c) => c.pedidos)),
        gastoMedio: promedio(grupo.map((c) => c.gastoTotal)),
      };
    })
    .filter((s): s is SegmentoResumen => s !== null);
  return resumen.sort((a, b) => b.cantidad - a.cantidad);
}

export function segmentosRFMParaResumen(clientes: ClienteRFM[], nombres: NombresSegmentoRFM): (ClienteConRecencia & { segmentoNombre: string })[] {
  return clientes.map((c) => ({ ...c, segmentoNombre: nombres[c.segmentoClave] }));
}

/** ¿Una regla personalizada coincide con este cliente? Un campo vacío ("no usar") no restringe. */
function reglaCoincide(c: ClienteConRecencia, r: ReglaSegmento): boolean {
  const gastoMin = parsearNumeroTolerante(r.gastoMin);
  const gastoMax = parsearNumeroTolerante(r.gastoMax);
  const pedidosMin = parsearNumeroTolerante(r.pedidosMin);
  const pedidosMax = parsearNumeroTolerante(r.pedidosMax);
  const recMin = parsearNumeroTolerante(r.recenciaMinDias);
  const recMax = parsearNumeroTolerante(r.recenciaMaxDias);
  if (gastoMin !== null && c.gastoTotal < gastoMin) return false;
  if (gastoMax !== null && c.gastoTotal > gastoMax) return false;
  if (pedidosMin !== null && c.pedidos < pedidosMin) return false;
  if (pedidosMax !== null && c.pedidos > pedidosMax) return false;
  if (recMin !== null && (c.recenciaDias === null || c.recenciaDias < recMin)) return false;
  if (recMax !== null && (c.recenciaDias === null || c.recenciaDias > recMax)) return false;
  return true;
}

/** Evalúa las reglas EN ORDEN: la primera que coincide gana. Lo que no coincide con ninguna cae en «Sin segmento», nunca se descarta. */
export function segmentarPorReglas(clientes: ClienteAgregado[], reglas: ReglaSegmento[], fechaReferencia: string): (ClienteConRecencia & { segmentoNombre: string })[] {
  const base = conRecencia(clientes, fechaReferencia);
  const activas = reglas.filter((r) => r.nombre.trim());
  return base.map((c) => {
    const regla = activas.find((r) => reglaCoincide(c, r));
    return { ...c, segmentoNombre: regla ? regla.nombre.trim() : SIN_SEGMENTO };
  });
}

/** Segmentos con menos clientes que el mínimo definido: la página solo los señala, nunca los fusiona sola. */
export function segmentosChicos(resumen: SegmentoResumen[], minimo: number): string[] {
  return resumen.filter((s) => s.cantidad < minimo).map((s) => s.nombre);
}

/** Texto de la tabla de segmentos tal como va al prompt: la única fuente de cifras que recibe la IA sobre los segmentos. */
export function textoDeSegmentos(resumen: SegmentoResumen[], moneda: string): string {
  const linea = (s: SegmentoResumen) => `- ${s.nombre}: ${s.cantidad} clientes (${s.pctBase}% de la base), ${s.pctIngresos}% de los ingresos, recencia media ${s.recenciaMediaDias ?? "(sin dato)"} días, ${s.frecuenciaMedia} pedidos en promedio, gasto medio ${moneda} ${s.gastoMedio}`;
  return resumen.map(linea).join("\n");
}

const csvCelda = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Exporta la lista de clientes con su segmento (CSV), lista para una campaña. Nunca se envía a la IA: solo sale del navegador al descargarla. */
export function csvClientesPorSegmento(clientes: (ClienteConRecencia & { segmentoNombre: string })[]): string {
  const encabezado = "id_cliente,segmento,recencia_dias,pedidos,gasto_total,ubicacion,canal,categoria";
  const filas = clientes.map((c) => [c.id, c.segmentoNombre, c.recenciaDias ?? "", c.pedidos, c.gastoTotal, c.ubicacion, c.canal, c.categoria].map(csvCelda).join(","));
  return [encabezado, ...filas].join("\n");
}

/** Mínimo para copiar el prompt: ID de cliente mapeado, fecha de referencia válida y al menos 1 cliente con datos suficientes. */
export function datosMinimos(mapeo: MapeoColumnas, origenDatos: "transacciones" | "clientes", fechaReferencia: string, totalClientes: number): boolean {
  const mapeoListo = mapeo.clienteId !== null && mapeo.fecha !== null && mapeo.importe !== null && (origenDatos === "transacciones" || mapeo.pedidos !== null);
  return mapeoListo && normalizarFecha(fechaReferencia) !== null && totalClientes > 0;
}

export { CLAVES_SEGMENTO_RFM };
