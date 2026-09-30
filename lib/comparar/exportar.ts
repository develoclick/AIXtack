import { formatoMonto, parsearNumero } from "@/lib/presupuesto/calculo";
import { filasResumen, puntuacionDe } from "./calculo";
import type { DatosComparar } from "./tipos";

const comillas = (t: string) => (/[",\n;\t]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
/** Antepone «'» a lo que una hoja de cálculo podría ejecutar como fórmula. */
const proteger = (t: string) => (/^[=+\-@]/.test(t) ? `'${t}` : t);

export function filasParaExportar(d: DatosComparar): string[][] {
  const cabecera = ["Opción", "Precio", "Moneda", ...d.criterios.map((c) => c.nombre), "Costo total ajustado", "Puntuación ponderada"];
  return [
    cabecera,
    ...filasResumen(d).map(({ opcion, costo, puntuacion }) => {
      const precio = parsearNumero(opcion.precio);
      return [proteger(opcion.nombre), precio !== null ? String(precio) : "", opcion.moneda, ...d.criterios.map((c) => String(puntuacionDe(d.puntuaciones, opcion.id, c.id))), costo.total !== null ? String(costo.total) : "", String(puntuacion)];
    }),
  ];
}

/** CSV con coma y BOM UTF-8 (Excel y Google Sheets lo abren con tildes correctas): una fila por opción, con su puntuación en cada criterio, el costo total ajustado y la puntuación ponderada. */
export function aCsvComparar(d: DatosComparar): string {
  return "﻿" + filasParaExportar(d).map((f) => f.map(comillas).join(",")).join("\r\n") + "\r\n";
}

/** Texto de la matriz para pegar en una hoja de cálculo (separado por tabuladores). */
export function aTablaComparar(d: DatosComparar): string {
  const cabecera = ["Opción", "Costo total ajustado", ...d.criterios.map((c) => c.nombre), "Puntuación"];
  const filas = filasResumen(d).map(({ opcion, costo, puntuacion }) => [opcion.nombre || "(sin nombre)", costo.total !== null ? `${opcion.moneda} ${formatoMonto(costo.total)}` : "—", ...d.criterios.map((c) => String(puntuacionDe(d.puntuaciones, opcion.id, c.id))), `${puntuacion}/100`]);
  return [cabecera, ...filas].map((f) => f.map((t) => t.replace(/[\t\r\n]+/g, " ")).join("\t")).join("\n");
}
