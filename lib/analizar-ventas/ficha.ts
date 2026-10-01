import { parsearNumeroVentas } from "./calculo";
import type { HojaCruda } from "./parser";
import { CAMPOS_MAPEO, type CampoMapeo, type ColumnaDetectada, type FichaDataset, type MapeoColumnas, mapeoVacio } from "./tipos";

const RE_FECHA = /^\d{4}-\d{1,2}-\d{1,2}(?:[ T]\d{1,2}:\d{2})?$|^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/;
/** Todo el valor es un número (con miles y decimales opcionales), sin letras ni texto alrededor: «A4» o «650W» NO cuentan. */
const RE_NUMERO_PURO = /^-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?$|^-?\d+(?:[.,]\d+)?$/;

function detectarTipo(valor: string): "fecha" | "numero" | "texto" | "vacio" {
  const v = valor.trim();
  if (!v) return "vacio";
  if (RE_FECHA.test(v)) return "fecha";
  if (RE_NUMERO_PURO.test(v) && parsearNumeroVentas(v) !== null) return "numero";
  return "texto";
}

function fechaComparable(v: string): number | null {
  const t = Date.parse(v.includes("/") ? v.split("/").reverse().join("-") : v);
  return Number.isNaN(t) ? null : t;
}

/** Ficha de una columna: tipo mayoritario, % vacíos, valores únicos, mínimo/máximo y una muestra, calculados en el navegador. */
function fichaDeColumna(nombre: string, indice: number, valores: string[]): ColumnaDetectada {
  const conteoTipos: Record<string, number> = { fecha: 0, numero: 0, texto: 0 };
  const unicos = new Set<string>();
  const muestra: string[] = [];
  let vacios = 0;
  let minNum: number | null = null;
  let maxNum: number | null = null;
  let minFecha: number | null = null;
  let maxFecha: number | null = null;

  for (const crudo of valores) {
    const tipo = detectarTipo(crudo);
    if (tipo === "vacio") {
      vacios++;
      continue;
    }
    conteoTipos[tipo]++;
    if (unicos.size < 10_000) unicos.add(crudo);
    if (muestra.length < 5 && !muestra.includes(crudo)) muestra.push(crudo);
    if (tipo === "numero") {
      const n = parsearNumeroVentas(crudo)!;
      minNum = minNum === null ? n : Math.min(minNum, n);
      maxNum = maxNum === null ? n : Math.max(maxNum, n);
    } else if (tipo === "fecha") {
      const f = fechaComparable(crudo);
      if (f !== null) {
        minFecha = minFecha === null ? f : Math.min(minFecha, f);
        maxFecha = maxFecha === null ? f : Math.max(maxFecha, f);
      }
    }
  }

  const mayoritario = Object.entries(conteoTipos).sort((a, b) => b[1] - a[1])[0];
  const tipo = mayoritario[1] > 0 ? (mayoritario[0] as "fecha" | "numero" | "texto") : "vacio";

  const minimo = tipo === "numero" && minNum !== null ? String(minNum) : tipo === "fecha" && minFecha !== null ? new Date(minFecha).toISOString().slice(0, 10) : "";
  const maximo = tipo === "numero" && maxNum !== null ? String(maxNum) : tipo === "fecha" && maxFecha !== null ? new Date(maxFecha).toISOString().slice(0, 10) : "";

  return { nombre, indice, tipo, pctVacios: valores.length ? Math.round((vacios / valores.length) * 100) : 0, valoresUnicos: unicos.size, minimo, maximo, muestra };
}

/** Ficha del dataset completo: hojas, columna por columna, sin guardar ninguna fila cruda (solo este resumen va al prompt). */
export function fichaDeHoja(archivo: string, hojas: HojaCruda[], hojaActiva: string): FichaDataset {
  const hoja = hojas.find((h) => h.nombre === hojaActiva) ?? hojas[0];
  const [encabezado, ...datos] = hoja?.filas ?? [[]];
  const nombresColumnas = (encabezado ?? []).map((c, i) => c.trim() || `Columna ${i + 1}`);
  const columnas = nombresColumnas.map((nombre, i) => fichaDeColumna(nombre, i, datos.map((f) => f[i] ?? "")));
  return { archivo, hojas: hojas.map((h) => h.nombre), hojaActiva: hoja?.nombre ?? hojaActiva, totalFilas: datos.length, truncado: hoja?.truncado ?? false, columnas };
}

const ALIAS_CAMPO: Record<CampoMapeo, string[]> = {
  fecha: ["fecha", "fecha de venta", "date", "dia", "día"],
  producto: ["producto", "articulo", "artículo", "item", "ítem", "descripcion", "descripción"],
  categoria: ["categoria", "categoría", "rubro", "familia", "linea", "línea"],
  cantidad: ["cantidad", "unidades", "qty", "cant"],
  precio: ["precio", "precio unitario", "precio de venta", "pu"],
  importe: ["importe", "total", "monto", "venta", "ventas", "subtotal", "total venta"],
  vendedor: ["vendedor", "vendedora", "asesor", "asesora", "ejecutivo"],
  cliente: ["cliente", "customer", "razon social", "razón social"],
  sucursal: ["sucursal", "tienda", "local", "punto de venta", "almacen", "almacén"],
  canal: ["canal", "medio", "channel"],
};

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/** Sugiere un mapeo automático por el nombre de cada columna (la persona siempre puede corregirlo). */
export function sugerirMapeo(ficha: FichaDataset): MapeoColumnas {
  const mapeo = mapeoVacio();
  for (const { clave } of CAMPOS_MAPEO) {
    const alias = ALIAS_CAMPO[clave].map(normalizar);
    const columna = ficha.columnas.find((c) => alias.includes(normalizar(c.nombre)));
    if (columna) mapeo[clave] = columna.indice;
  }
  return mapeo;
}
