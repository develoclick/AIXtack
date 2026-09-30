import { nuevoId, productoVacio, type FilaCatalogo, type Producto } from "./tipos";

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
  precio: ["precio", "precio de venta"],
  precioPromo: ["precio_promo", "precio promocional", "precio oferta", "promo"],
  categoria: ["categoria", "categoría", "rubro"],
  sku: ["sku", "codigo", "código"],
  descripcion: ["descripcion", "descripción", "notas"],
};

export interface LecturaCsvProductos {
  productos: Producto[];
  errores: string[];
}

/** Lee un .csv de productos (nombre, precio, precio_promo, categoría, sku, descripción), tolerante al orden de columnas y al separador. */
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

  if (iNombre === -1 || iPrecio === -1) {
    return { productos: [], errores: ["No reconozco las columnas. La primera fila debe traer, en cualquier orden: nombre y precio (precio_promo, categoria, sku y descripcion son opcionales)."] };
  }
  const iPrecioPromo = indice("precioPromo");
  const iCategoria = indice("categoria");
  const iSku = indice("sku");
  const iDescripcion = indice("descripcion");

  const productos: Producto[] = [];
  const errores: string[] = [];
  for (let i = 1; i < lineas.length; i++) {
    const c = celdasDeLinea(lineas[i], separador);
    const nombre = (c[iNombre] ?? "").trim();
    if (!nombre) {
      errores.push(`Fila ${i + 1}: sin nombre, se omite.`);
      continue;
    }
    productos.push({
      id: nuevoId("p"),
      nombre,
      precio: (c[iPrecio] ?? "").trim(),
      precioPromo: iPrecioPromo !== -1 ? (c[iPrecioPromo] ?? "").trim() : "",
      categoria: iCategoria !== -1 ? (c[iCategoria] ?? "").trim() : "",
      sku: iSku !== -1 ? (c[iSku] ?? "").trim() : "",
      descripcion: iDescripcion !== -1 ? (c[iDescripcion] ?? "").trim() : "",
    });
  }
  return { productos: productos.length ? productos : [productoVacio(nuevoId("p"))], errores };
}

const campo = (t: string) => (/[",;\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);

/** Exporta los productos actuales a .csv (para editarlos en Excel/Sheets y volver a importarlos). */
export function csvDeProductos(productos: Producto[]): string {
  const filas = productos.filter((p) => p.nombre.trim()).map((p) => [p.nombre, p.precio, p.precioPromo, p.categoria, p.sku, p.descripcion].map(campo).join(","));
  return ["nombre,precio,precio_promo,categoria,sku,descripcion", ...filas].join("\n");
}

/** Plantilla vacía descargable, con una fila de ejemplo marcada como tal, para que la persona la llene en Excel o Sheets. */
export function plantillaCsvVacia(): string {
  return ["nombre,precio,precio_promo,categoria,sku,descripcion", '"Ejemplo: Casaca impermeable talla M",129.90,99.90,Casacas,CAS-001,"Tela impermeable con forro polar, bolsillos con cierre"'].join("\n");
}

/** Exporta el catálogo ya generado (agrupado por categoría en el orden de la IA) a .csv. */
export function csvDeCatalogo(filas: FilaCatalogo[]): string {
  const filasTxt = filas.map((f) => [f.categoria, f.nombre, f.descripcion, f.especificaciones, f.variantes, f.precio, f.precioPromo, f.etiqueta, f.cta].map(campo).join(","));
  return ["categoria,nombre,descripcion,especificaciones,variantes,precio,precio_promo,etiqueta,cta", ...filasTxt].join("\n");
}
