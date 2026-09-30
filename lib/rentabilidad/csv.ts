import { formatoMonto } from "@/lib/presupuesto/calculo";
import { calcularProductos, calcularResultado } from "./calculo";
import { nuevoId, productoVacio, type DatosRentabilidad, type Producto } from "./tipos";

/** Divide una línea CSV en celdas, tolerando comillas y coma o punto y coma como separador (Excel en español suele usar «;»). */
function celdasDeLinea(linea: string, separador: string): string[] {
  const celdas: string[] = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (entreComillas) {
      if (c === '"' && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else if (c === '"') entreComillas = false;
      else actual += c;
    } else if (c === '"') entreComillas = true;
    else if (c === separador) {
      celdas.push(actual);
      actual = "";
    } else actual += c;
  }
  celdas.push(actual);
  return celdas.map((c) => c.trim());
}

const NORMALIZAR_ENCABEZADO = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const ALIAS: Record<string, string[]> = {
  nombre: ["nombre", "producto", "producto o servicio", "articulo", "artículo"],
  precio: ["precio", "precio de venta", "precio unitario"],
  costo: ["costo", "costo directo", "costo unitario", "costo directo unitario"],
  unidades: ["unidades", "cantidad", "unidades vendidas"],
};

export interface LecturaCsvProductos {
  productos: Producto[];
  /** Filas que no se pudieron leer (número de fila, motivo). */
  errores: string[];
}

/** Lee un .csv de productos (nombre, precio, costo, unidades), tolerante al orden de columnas y al separador. */
export function productosDesdeCsv(texto: string): LecturaCsvProductos {
  const lineas = texto
    .split(/\r\n?|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lineas.length < 2) return { productos: [], errores: ["El archivo no tiene filas de datos (solo encabezado, o está vacío)."] };

  const separador = (lineas[0].match(/;/g)?.length ?? 0) > (lineas[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const encabezado = celdasDeLinea(lineas[0], separador).map(NORMALIZAR_ENCABEZADO);
  const indice = (clave: keyof typeof ALIAS) => encabezado.findIndex((h) => ALIAS[clave].includes(h));
  const iNombre = indice("nombre");
  const iPrecio = indice("precio");
  const iCosto = indice("costo");
  const iUnidades = indice("unidades");

  if (iNombre === -1 || iPrecio === -1 || iCosto === -1 || iUnidades === -1) {
    return { productos: [], errores: ["No reconozco las columnas. La primera fila debe traer, en cualquier orden: nombre, precio, costo, unidades."] };
  }

  const productos: Producto[] = [];
  const errores: string[] = [];
  for (let i = 1; i < lineas.length; i++) {
    const c = celdasDeLinea(lineas[i], separador);
    const nombre = (c[iNombre] ?? "").trim();
    if (!nombre) {
      errores.push(`Fila ${i + 1}: sin nombre, se omite.`);
      continue;
    }
    productos.push({ id: nuevoId("p"), nombre, precio: (c[iPrecio] ?? "").trim(), costo: (c[iCosto] ?? "").trim(), unidades: (c[iUnidades] ?? "").trim() });
  }
  return { productos: productos.length ? productos : [productoVacio(nuevoId("p"))], errores };
}

const campo = (t: string) => (/[",;\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);

/** Exporta los productos actuales a .csv (para editarlos en Excel/Sheets y volver a importarlos). */
export function csvDeProductos(productos: Producto[]): string {
  const filas = productos.filter((p) => p.nombre.trim()).map((p) => [p.nombre, p.precio, p.costo, p.unidades].map(campo).join(","));
  return ["nombre,precio,costo,unidades", ...filas].join("\n");
}

/** Exporta el informe completo (por producto y el resultado del período) a .csv. */
export function csvDeInforme(d: DatosRentabilidad): string {
  const productos = calcularProductos(d);
  const r = calcularResultado(d);
  const filasProductos = ["Producto,Precio,Costo directo,Unidades,Ingresos,Contribución total,Margen %", ...productos.map((p) => [p.nombre, formatoMonto(p.precio), formatoMonto(p.costo), String(p.unidades), formatoMonto(p.ingresos), formatoMonto(p.contribucionTotal), String(p.margenPct)].map(campo).join(","))];
  const filasResultado = r
    ? [
        "",
        "Resultado del período,Monto",
        `Ingresos totales,${formatoMonto(r.ingresosTotal)}`,
        `Costo directo total,${formatoMonto(r.costoDirectoTotal)}`,
        `Utilidad bruta,${formatoMonto(r.utilidadBruta)}`,
        `Costos variables adicionales,${formatoMonto(r.variablesAdicionales)}`,
        `Costos fijos,${formatoMonto(r.fijos)}`,
        `Utilidad operativa,${formatoMonto(r.utilidadOperativa)}`,
        `Margen operativo %,${r.margenOperativoPct}`,
        r.puntoEquilibrioMonto !== null ? `Punto de equilibrio,${formatoMonto(r.puntoEquilibrioMonto)}` : "",
      ].filter(Boolean)
    : [];
  return [...filasProductos, ...filasResultado].join("\n");
}

export function fallosParaTexto(errores: string[]): string | null {
  return errores.length ? errores.join(" ") : null;
}
