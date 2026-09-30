import { formatoMonto } from "@/lib/presupuesto/calculo";
import type { FilaResumen } from "./calculo";

const comillas = (t: string) => (/[",\n;\t]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
/** Antepone «'» a lo que una hoja de cálculo podría ejecutar como fórmula. */
const proteger = (t: string) => (/^[=+\-@]/.test(t) ? `'${t}` : t);

const CABECERA = ["Destino", "Fechas", "Noches", "Pasaje por persona", "Alojamiento por noche", "Costo total (recalculado)", "Por persona", "Restante", "Noches máximas viables", "Tipo de dato"];

export function filasParaExportar(filas: FilaResumen[]): string[][] {
  return [
    CABECERA,
    ...filas.map(({ fila, recalculo, nochesMaximas }) => [
      proteger(fila.destino),
      fila.fechas,
      fila.noches === null ? "" : String(fila.noches),
      fila.pasajePorPersona === null ? "" : String(fila.pasajePorPersona),
      fila.alojamientoPorNoche === null ? "" : String(fila.alojamientoPorNoche),
      recalculo.total === null ? "" : String(recalculo.total),
      recalculo.porPersona === null ? "" : String(recalculo.porPersona),
      recalculo.restante === null ? "" : String(recalculo.restante),
      nochesMaximas === null ? "" : String(nochesMaximas),
      fila.tipoDato ?? "",
    ]),
  ];
}

/** CSV con coma y BOM UTF-8 (Excel y Google Sheets lo abren con tildes correctas). */
export function aCsvDestinos(filas: FilaResumen[]): string {
  return "﻿" + filasParaExportar(filas).map((f) => f.map(comillas).join(",")).join("\r\n") + "\r\n";
}

/** Texto de la tabla para pegar en una hoja de cálculo (separado por tabuladores). */
export function aTablaDestinos(filas: FilaResumen[]): string {
  return filasParaExportar(filas)
    .map((f) => f.map((t) => t.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n");
}

export function formatoRestante(n: number, moneda: string): string {
  return `${moneda} ${formatoMonto(Math.abs(n))}${n < 0 ? " sobre el máximo" : ""}`;
}
