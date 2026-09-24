/**
 * Pre-procesos de los Analizadores: la página CUENTA y SUMA antes de que la IA analice (principio 9: los cálculos los
 * hace la página, nunca la IA). Cada pre-proceso lee un texto pegado por la persona y devuelve resultados ya hechos que
 * viajan al prompt con la orden de no recalcularlos.
 *
 *  - «conteo-temas»: cuenta cuántas reseñas mencionan cada tema, según un libro de códigos que escribe la persona
 *    («Tema: palabra1, palabra2»). Lo que no encaja en ningún tema queda como «sin tema»: no se clasifica por adivinanza.
 *  - «resumen-ventas»: lee una tabla de ventas (fecha, producto, cantidad, monto) y calcula totales, días con ventas,
 *    promedio por día y el total de cada producto, con un total de control.
 *  - «conteo-palabras»: cuenta las palabras del texto que irá en la pieza (por ejemplo, los cuatro niveles de un afiche) con
 *    `contarPalabras()` y las compara con el máximo de la herramienta. La IA no vuelve a contarlas.
 */
import { formatear } from "./calculadora";
import { leerNumero } from "./calculadora";
import { contarPalabras } from "../texto/contar-palabras";
import type { CasoPreproceso, Preproceso } from "./tipos";

export interface ResultadoPreproceso {
  id: string;
  etiqueta: string;
  valor: number | null;
  texto: string | null;
  /** `false` = se muestra en la página pero no viaja al prompt como «cálculo ya hecho» (por ejemplo, va por una variable de la tarea). Por defecto `true`. */
  enPrompt?: boolean;
}

export interface EstadoPreproceso {
  /** Problemas de lectura (líneas que no se entienden, falta de datos), en lenguaje llano. */
  errores: string[];
  resultados: ResultadoPreproceso[];
  completo: boolean;
}

/** Minúsculas y sin tildes, para comparar palabras sin que importe cómo se escribieron. */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const lineas = (texto: string) =>
  texto
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const porcentaje = (parte: number, total: number) => (total === 0 ? 0 : parte / total);

/* ───────────────────────────── conteo por temas ───────────────────────────── */

export function conteoTemas(textoResenas: string, textoTemas: string): EstadoPreproceso {
  const errores: string[] = [];
  const resenas = lineas(textoResenas).map((r) => ({ original: r, norm: normalizar(r) }));
  if (resenas.length === 0) errores.push("Pega al menos una reseña, una por línea.");

  const temas: { nombre: string; claves: string[] }[] = [];
  lineas(textoTemas).forEach((linea, i) => {
    const corte = linea.indexOf(":");
    const nombre = corte > 0 ? linea.slice(0, corte).trim() : "";
    const claves = corte > 0 ? linea.slice(corte + 1).split(/[,;]/).map((c) => normalizar(c.trim())).filter(Boolean) : [];
    if (!nombre || claves.length === 0) errores.push(`La línea ${i + 1} de los temas no tiene el formato «Tema: palabra, palabra» (${linea.slice(0, 40)}).`);
    else temas.push({ nombre, claves });
  });
  if (temas.length === 0 && !errores.some((e) => e.includes("temas"))) errores.push("Escribe al menos un tema con sus palabras clave, por ejemplo «Servicio: lento, demora».");

  const total = resenas.length;
  const resultados: ResultadoPreproceso[] = [{ id: "resenas", etiqueta: "Reseñas analizadas", valor: total, texto: String(total) }];

  const conTema = new Set<number>();
  for (const tema of temas) {
    const indices = resenas.flatMap((r, i) => (tema.claves.some((c) => r.norm.includes(c)) ? [i] : []));
    indices.forEach((i) => conTema.add(i));
    const p = porcentaje(indices.length, total);
    resultados.push({ id: `tema:${tema.nombre}`, etiqueta: `Reseñas que mencionan «${tema.nombre}»`, valor: indices.length, texto: `${indices.length} de ${total} (${formatear(p, "porcentaje", 1)})` });
  }
  const sinTema = total - conTema.size;
  resultados.push({ id: "sinTema", etiqueta: "Reseñas sin ninguno de los temas", valor: sinTema, texto: `${sinTema} de ${total}` });

  return { errores, resultados, completo: errores.length === 0 && total > 0 && temas.length > 0 };
}

/* ───────────────────────────── resumen de ventas ───────────────────────────── */

interface FilaVenta {
  fecha: string;
  producto: string;
  cantidad: number;
  monto: number;
}

function partir(linea: string): string[] {
  const sep = linea.includes("\t") ? "\t" : linea.includes(";") ? ";" : linea.includes("|") ? "|" : ",";
  return linea.split(sep).map((c) => c.trim());
}

export function resumenVentas(textoTabla: string, moneda?: string): EstadoPreproceso {
  const errores: string[] = [];
  const filas: FilaVenta[] = [];
  const todas = lineas(textoTabla);
  todas.forEach((linea, i) => {
    const c = partir(linea);
    const cantidad = leerNumero(c[2]);
    const monto = leerNumero(c[3]);
    if (i === 0 && c.length >= 4 && (cantidad === null || monto === null)) return; // encabezado
    if (c.length < 4 || !c[0] || !c[1] || cantidad === null || monto === null || cantidad < 0 || monto < 0) {
      if (errores.length < 5) errores.push(`La línea ${i + 1} no se entiende (${linea.slice(0, 50)}): usa fecha, producto, cantidad y monto.`);
      return;
    }
    filas.push({ fecha: c[0], producto: c[1], cantidad, monto });
  });
  if (todas.length === 0) errores.push("Pega la tabla de ventas: una venta por línea con fecha, producto, cantidad y monto.");

  const dinero = (n: number) => formatear(n, "moneda", 2, moneda);
  const total = filas.reduce((s, f) => s + f.monto, 0);
  const unidades = filas.reduce((s, f) => s + f.cantidad, 0);
  const dias = new Set(filas.map((f) => f.fecha)).size;

  const porProducto = new Map<string, { monto: number; unidades: number }>();
  for (const f of filas) {
    const a = porProducto.get(f.producto) ?? { monto: 0, unidades: 0 };
    a.monto += f.monto;
    a.unidades += f.cantidad;
    porProducto.set(f.producto, a);
  }
  const ordenados = [...porProducto.entries()].sort((a, b) => b[1].monto - a[1].monto || a[0].localeCompare(b[0]));
  const control = ordenados.reduce((s, [, v]) => s + v.monto, 0);

  // Por mes, solo si TODAS las fechas se entienden (AAAA-MM-DD o DD/MM/AAAA): así una fecha rara no reparte mal las ventas.
  const meses = new Map<string, { monto: number; dias: Set<string> }>();
  let fechasOk = filas.length > 0;
  for (const f of filas) {
    const iso = /^(\d{4})-(\d{2})-\d{2}$/.exec(f.fecha);
    const latino = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(f.fecha);
    const mes = iso ? `${iso[1]}-${iso[2]}` : latino ? `${latino[3]}-${latino[2].padStart(2, "0")}` : null;
    if (!mes) {
      fechasOk = false;
      break;
    }
    const a = meses.get(mes) ?? { monto: 0, dias: new Set<string>() };
    a.monto += f.monto;
    a.dias.add(f.fecha);
    meses.set(mes, a);
  }
  const porMes: ResultadoPreproceso[] = fechasOk
    ? [...meses.entries()]
        .sort((x, y) => x[0].localeCompare(y[0]))
        .map(([mes, v]) => ({
          id: `mes:${mes}`,
          etiqueta: `Mes ${mes}`,
          valor: v.monto,
          texto: `${dinero(v.monto)} · ${v.dias.size} días con ventas · ${dinero(v.monto / v.dias.size)} por día con ventas`,
        }))
    : [];

  const resultados: ResultadoPreproceso[] = [
    { id: "filas", etiqueta: "Ventas leídas", valor: filas.length, texto: String(filas.length) },
    { id: "dias", etiqueta: "Días distintos con ventas", valor: dias, texto: String(dias) },
    { id: "total", etiqueta: "Total vendido", valor: filas.length ? total : null, texto: filas.length ? dinero(total) : null },
    { id: "unidades", etiqueta: "Unidades vendidas", valor: filas.length ? unidades : null, texto: filas.length ? formatear(unidades, "numero", 2) : null },
    { id: "promedioDia", etiqueta: "Promedio por día con ventas", valor: dias ? total / dias : null, texto: dias ? dinero(total / dias) : null },
    ...porMes,
    ...ordenados.map(([nombre, v]) => ({
      id: `producto:${nombre}`,
      etiqueta: `Producto «${nombre}»`,
      valor: v.monto,
      texto: `${dinero(v.monto)} (${formatear(porcentaje(v.monto, total), "porcentaje", 1)} del total) · ${formatear(v.unidades, "numero", 2)} unidades`,
    })),
    { id: "control", etiqueta: "Control: la suma por producto es igual al total", valor: filas.length ? (Math.abs(control - total) < 1e-9 ? 1 : 0) : null, texto: filas.length ? (Math.abs(control - total) < 1e-9 ? "Sí" : "No") : null },
  ];
  return { errores, resultados, completo: errores.length === 0 && filas.length > 0 };
}

/* ───────────────────────────── conteo de palabras ───────────────────────────── */

const palabrasTexto = (n: number) => `${n} ${n === 1 ? "palabra" : "palabras"}`;

/**
 * Cuenta las palabras de cada nivel (la unión, con `union`, de los campos que tengan texto) y el total, y lo compara con el
 * máximo. Nunca hay errores de lectura: sin texto, el total es 0. Ningún resultado viaja como «cálculo hecho»; el total llega
 * al prompt por la variable de la tarea (ver `Preproceso.variables`).
 */
export function conteoPalabras(config: NonNullable<Preproceso["palabras"]>, valores: Record<string, string>): EstadoPreproceso {
  const niveles = config.niveles.map((nivel) => {
    const texto = nivel.campos.map((id) => (valores[id] ?? "").trim()).filter(Boolean).join(nivel.union);
    return { id: nivel.id, etiqueta: nivel.etiqueta, palabras: contarPalabras(texto) };
  });
  const total = niveles.reduce((suma, n) => suma + n.palabras, 0);
  const dentro = total <= config.maximo;
  const resultados: ResultadoPreproceso[] = [
    ...niveles.map((n) => ({ id: `nivel:${n.id}`, etiqueta: n.etiqueta, valor: n.palabras, texto: palabrasTexto(n.palabras), enPrompt: false })),
    { id: "total", etiqueta: "Total de palabras de tus datos", valor: total, texto: palabrasTexto(total), enPrompt: false },
    { id: "maximo", etiqueta: "Máximo", valor: config.maximo, texto: palabrasTexto(config.maximo), enPrompt: false },
    { id: "dentro", etiqueta: "¿Dentro del máximo?", valor: dentro ? 1 : 0, texto: dentro ? "Sí" : `No: ${total - config.maximo} de más`, enPrompt: false },
  ];
  return { errores: [], resultados, completo: total > 0 };
}

/* ───────────────────────────── despacho y verificación ───────────────────────────── */

export function ejecutarPreproceso(config: Preproceso, valores: Record<string, string>, moneda?: string): EstadoPreproceso {
  if (config.tipo === "conteo-palabras") return conteoPalabras(config.palabras!, valores);
  if (config.tipo === "conteo-temas") return conteoTemas(valores[config.campos.texto ?? ""] ?? "", valores[config.campos.temas ?? ""] ?? "");
  return resumenVentas(valores[config.campos.texto ?? ""] ?? "", moneda);
}

export interface FalloDePreproceso {
  caso: string;
  resultado: string;
  esperado: number | string;
  obtenido: number | string | null;
}

/** Ejecuta los `casosDePrueba` del pre-proceso y devuelve lo que no coincide (vacío = todo bien). */
export function verificarCasosPreproceso(config: Preproceso): FalloDePreproceso[] {
  const fallos: FalloDePreproceso[] = [];
  for (const caso of config.casosDePrueba as CasoPreproceso[]) {
    const estado = ejecutarPreproceso(config, caso.valores);
    for (const [id, esperado] of Object.entries(caso.esperado)) {
      const r = estado.resultados.find((x) => x.id === id);
      const ok = r !== undefined && (typeof esperado === "number" ? r.valor !== null && Math.abs(r.valor - esperado) < 0.0005 : r.texto === esperado);
      if (!ok) fallos.push({ caso: caso.nombre, resultado: id, esperado, obtenido: r ? (typeof esperado === "number" ? r.valor : r.texto) : null });
    }
  }
  return fallos;
}
