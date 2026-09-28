import { calcularPuntaje } from "./calculo";
import type { Requisito } from "./tipos";

const ENCABEZADO = ["Requisito", "Categoría", "Tipo", "Estado", "Evidencia"];

/** Filas de la tabla como matriz de texto (la primera fila es el encabezado), con una fila final con el porcentaje orientativo. */
export function filasDeRequisitos(requisitos: Requisito[], pesoObligatorio: number): string[][] {
  const p = calcularPuntaje(requisitos, pesoObligatorio);
  return [
    ENCABEZADO,
    ...requisitos.map((r) => [r.requisito, r.categoria, r.tipo ?? "(sin reconocer)", r.estado ?? "(sin reconocer)", r.evidencia]),
    ["Porcentaje orientativo (no es una probabilidad)", "", "", "", p.porcentaje === null ? "sin datos" : `${p.porcentaje} % · ${p.formula}`],
  ];
}

const comillas = (t: string) => (/[",\n;\t]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);

/** CSV con coma y BOM UTF-8 (Excel y Google Sheets lo abren con tildes correctas). */
export function aCsv(requisitos: Requisito[], pesoObligatorio: number): string {
  return "﻿" + filasDeRequisitos(requisitos, pesoObligatorio).map((f) => f.map(comillas).join(",")).join("\r\n") + "\r\n";
}

/** Texto separado por tabuladores: se pega directo en una hoja de Excel o Google Sheets. */
export function aTabla(requisitos: Requisito[], pesoObligatorio: number): string {
  return filasDeRequisitos(requisitos, pesoObligatorio)
    .map((f) => f.map((t) => t.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n");
}
