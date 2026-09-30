import { TIPOS_BLOQUE } from "./tipos";
import type { FilaItinerario } from "./tipos";

const comillas = (t: string) => (/[",\n;\t]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
/** Antepone «'» a lo que una hoja de cálculo podría ejecutar como fórmula. */
const proteger = (t: string) => (/^[=+\-@]/.test(t) ? `'${t}` : t);
const etiquetaTipo = (f: FilaItinerario) => (f.tipo ? TIPOS_BLOQUE.find((t) => t.valor === f.tipo)!.etiqueta : f.tipoTexto);

/** Filas del itinerario como matriz de texto; la primera fila es el encabezado. */
export function filasDelItinerario(filas: FilaItinerario[]): string[][] {
  return [
    ["Día", "Fecha", "Zona", "Inicio", "Fin", "Actividad", "Tipo", "Lugar", "Nota", "Verificado"],
    ...filas.map((f) => [String(f.dia), f.fecha, proteger(f.zona), f.horaInicio, f.horaFin, proteger(f.actividad), etiquetaTipo(f), proteger(f.lugar), proteger(f.nota), f.verificado === null ? "" : f.verificado ? "Sí" : "No"]),
  ];
}

/** CSV con coma y BOM UTF-8 (Excel y Google Sheets lo abren con tildes correctas). */
export function aCsvItinerario(filas: FilaItinerario[]): string {
  return "﻿" + filasDelItinerario(filas).map((f) => f.map(comillas).join(",")).join("\r\n") + "\r\n";
}

/** Texto separado por tabuladores: se pega directo en una hoja de cálculo. */
export function aTablaItinerario(filas: FilaItinerario[]): string {
  return filasDelItinerario(filas)
    .map((f) => f.map((t) => t.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n");
}
