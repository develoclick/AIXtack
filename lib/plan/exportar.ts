import type { FilaPlan } from "./tipos";

const comillas = (t: string) => (/[",\n;\t]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
/** Antepone «'» a lo que una hoja de cálculo podría ejecutar como fórmula. */
const proteger = (t: string) => (/^[=+\-@]/.test(t) ? `'${t}` : t);

/** Filas del plan como matriz de texto; la primera fila es el encabezado. */
export function filasDelPlan(plan: FilaPlan[]): string[][] {
  return [["Semana", "Día", "Tarea", "Entregable", "Minutos"], ...plan.map((f) => [String(f.semana), f.dia, proteger(f.tarea), proteger(f.entregable), f.minutos === null ? "" : String(f.minutos)])];
}

/** CSV con coma y BOM UTF-8 (Excel y Google Sheets lo abren con tildes correctas). */
export function aCsvPlan(plan: FilaPlan[]): string {
  return "﻿" + filasDelPlan(plan).map((f) => f.map(comillas).join(",")).join("\r\n") + "\r\n";
}

/** Texto separado por tabuladores: se pega directo en una hoja de cálculo. */
export function aTablaPlan(plan: FilaPlan[]): string {
  return filasDelPlan(plan)
    .map((f) => f.map((t) => t.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n");
}
