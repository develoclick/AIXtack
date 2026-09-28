import { calcularOferta, compararOfertas, contextoDe, evaluarCifras, CIFRAS } from "./calculo";
import type { DatosSalario } from "./tipos";

const plano = (n: number | null) => (n === null ? "" : String(Math.round(n * 100) / 100));

/** Filas del cálculo (oferta A, oferta B y comparación) como matriz de texto; la primera fila es el encabezado. */
export function filasDelCalculo(d: DatosSalario): string[][] {
  const ctx = contextoDe(d);
  const a = calcularOferta(d.ofertaA, ctx);
  const b = d.comparar ? calcularOferta(d.ofertaB, ctx) : null;
  const filas: string[][] = [["Oferta", "Componente", "Fórmula", `Valor (${d.moneda.trim() || "S/"})`]];
  for (const f of a.filas) filas.push([d.ofertaA.nombre.trim() || "Oferta A", f.etiqueta, f.formula, plano(f.valor)]);
  if (b) for (const f of b.filas) filas.push([d.ofertaB.nombre.trim() || "Oferta B", f.etiqueta, f.formula, plano(f.valor)]);
  if (b) for (const f of compararOfertas(a, b)) filas.push(["Comparación (B − A)", f.etiqueta, `A ${plano(f.a)}; B ${plano(f.b)}`, plano(f.diferencia)]);
  const ev = evaluarCifras(d, a);
  for (const c of CIFRAS) if (ev.valores[c.clave] !== undefined) filas.push(["Mis cifras", c.etiqueta, "salario fijo mensual bruto", plano(ev.valores[c.clave] ?? null)]);
  return filas;
}

const comillas = (t: string) => (/[",\n;\t]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);

/** CSV con coma y BOM UTF-8 (Excel y Google Sheets lo abren con tildes correctas). */
export function aCsv(d: DatosSalario): string {
  return "﻿" + filasDelCalculo(d).map((f) => f.map(comillas).join(",")).join("\r\n") + "\r\n";
}

/** Texto separado por tabuladores: se pega directo en una hoja de cálculo. */
export function aTabla(d: DatosSalario): string {
  return filasDelCalculo(d)
    .map((f) => f.map((t) => t.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n");
}
