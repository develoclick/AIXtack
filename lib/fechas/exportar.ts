import { diaDeLaSemana, etiquetaDia } from "./calculo";
import type { FilaOrdenable } from "./analisis";
import type { Combinacion } from "./tipos";

const comillas = (t: string) => (/[",\n;\t]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
/** Antepone «'» a lo que una hoja de cálculo podría ejecutar como fórmula. */
const proteger = (t: string) => (/^[=+\-@]/.test(t) ? `'${t}` : t);

const CABECERA = ["Ida", "Día", "Vuelta", "Noches", "Precio total", "Moneda", "Precio por persona", "Aerolínea", "Escalas", "Equipaje", "Fuente", "Consultado el", "Verificada"];

export function filasParaExportar(filas: FilaOrdenable[]): string[][] {
  return [
    CABECERA,
    ...filas.map((f) => {
      const dia = diaDeLaSemana(f.ida);
      return [f.ida, dia !== null ? etiquetaDia(dia) : "", f.vuelta, String(f.noches ?? ""), f.precioTotal === null ? "" : String(f.precioTotal), proteger(f.moneda), f.precioPorPersona === null ? "" : String(f.precioPorPersona), proteger(f.aerolinea), proteger(f.escalas), proteger(f.equipaje), proteger(f.fuente), f.consultadoEn, f.verificada ? "Sí" : "No"];
    }),
  ];
}

/** CSV con coma y BOM UTF-8 (Excel y Google Sheets lo abren con tildes correctas). */
export function aCsvFechas(filas: FilaOrdenable[]): string {
  return "﻿" + filasParaExportar(filas).map((f) => f.map(comillas).join(",")).join("\r\n") + "\r\n";
}

/** Texto separado por tabuladores: se pega directo en una hoja de cálculo. */
export function aTablaFechas(filas: FilaOrdenable[]): string {
  return filasParaExportar(filas)
    .map((f) => f.map((t) => t.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n");
}

/** Lista de combinaciones aún sin precio, como texto para copiar y pegar en el siguiente prompt o búsqueda. */
export function textoCombinacionesFaltantes(combinaciones: Combinacion[]): string {
  return combinaciones.map((c) => `${c.ida} → ${c.vuelta} (${c.noches} noches)`).join("\n");
}
