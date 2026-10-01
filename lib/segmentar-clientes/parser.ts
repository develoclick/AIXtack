import { MAX_FILAS } from "./tipos";

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

function filasDesdeCsv(texto: string): { filas: string[][]; truncado: boolean } {
  const lineas = texto.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim().length > 0);
  if (lineas.length === 0) return { filas: [], truncado: false };
  const separador = (lineas[0].match(/;/g)?.length ?? 0) > (lineas[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  return { filas: lineas.slice(0, MAX_FILAS + 1).map((l) => celdasDeLinea(l, separador)), truncado: lineas.length > MAX_FILAS + 1 };
}

export interface HojaCruda {
  nombre: string;
  filas: string[][];
  /** true si el archivo traía más de MAX_FILAS filas de datos y se recortó. */
  truncado: boolean;
}

export interface ArchivoLeido {
  hojas: HojaCruda[];
}

const EXTENSIONES_EXCEL = ["xlsx", "xls"];

/** Lee un .csv o .xlsx/.xls del navegador de la persona (nunca sale de ahí: no se sube a ningún servidor). */
export async function leerArchivoClientes(archivo: File): Promise<ArchivoLeido> {
  const ext = archivo.name.toLowerCase().split(".").pop() ?? "";
  if (ext === "csv" || ext === "txt") {
    const texto = await archivo.text();
    const { filas, truncado } = filasDesdeCsv(texto);
    return { hojas: [{ nombre: archivo.name, filas, truncado }] };
  }
  if (EXTENSIONES_EXCEL.includes(ext)) {
    const XLSX = await import("xlsx");
    const buffer = await archivo.arrayBuffer();
    const libro = XLSX.read(buffer, { type: "array", cellDates: true });
    const hojas = libro.SheetNames.map((nombre) => {
      const todas = XLSX.utils.sheet_to_json(libro.Sheets[nombre], { header: 1, raw: false, defval: "" }) as unknown[][];
      const filas = todas.slice(0, MAX_FILAS + 1).map((fila) => fila.map((celda) => (celda === null || celda === undefined ? "" : String(celda).trim())));
      return { nombre, filas, truncado: todas.length > MAX_FILAS + 1 };
    });
    return { hojas: hojas.filter((h) => h.filas.length > 0) };
  }
  throw new Error("Formato no admitido: usa un archivo .xlsx, .xls o .csv.");
}
