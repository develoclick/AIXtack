import { calcular, ESCENARIOS, formatoPorcentaje, parsearNumero } from "./calculo";
import { categoriaPorId, TIPOS, UNIDADES, type DatosPresupuesto } from "./tipos";

const ENCABEZADO = ["Categoría", "Concepto", "Monto", "Moneda", "Unidad", "Tipo", "Multiplicador", "Total (moneda del presupuesto)", "Mínimo", "Máximo", "Fuente", "Fecha de consulta"];

/** Un número con punto decimal y sin separador de miles: es lo que abre bien Excel y Google Sheets. */
const plano = (n: number | null) => (n === null ? "" : String(Math.round(n * 100) / 100));

/** Filas de la tabla de gastos como matriz de texto (la primera fila es el encabezado). */
export function filasDeTabla(d: DatosPresupuesto): string[][] {
  const c = calcular(d);
  const moneda = d.moneda.trim() || "S/";
  const filas = d.lineas.map((l, i) => {
    const cl = c.lineas[i];
    return [
      categoriaPorId(l.categoria).nombre,
      l.concepto.trim(),
      plano(parsearNumero(l.monto)),
      l.enAlterna ? d.monedaAlterna.trim() : moneda,
      UNIDADES.find((u) => u.valor === l.unidad)!.corta,
      TIPOS.find((t) => t.valor === l.tipo)!.etiqueta,
      plano(cl.multiplicador),
      plano(cl.total),
      plano(parsearNumero(l.minimo)),
      plano(parsearNumero(l.maximo)),
      l.fuente.trim(),
      l.fecha.trim(),
    ];
  });
  const i = c.escenarios.intermedio;
  const vacia = (etiqueta: string, valor: string) => [etiqueta, "", "", "", "", "", "", valor, "", "", "", ""];
  return [
    ENCABEZADO,
    ...filas,
    vacia("Subtotal (intermedio)", plano(i.subtotal)),
    vacia(`Imprevistos (${formatoPorcentaje(c.pctImprevistos)})`, plano(i.imprevistos)),
    vacia("Total con imprevistos", plano(i.total)),
    vacia("Costo por persona", plano(i.porPersona)),
    ...ESCENARIOS.map((e) => vacia(`Escenario ${e.etiqueta.toLowerCase()}`, plano(c.escenarios[e.clave].total))),
  ];
}

const comillas = (t: string) => (/[",\n;\t]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);

/** CSV con separador de coma y BOM UTF-8 (Excel y Google Sheets lo abren con tildes correctas). */
export function aCsv(d: DatosPresupuesto): string {
  return "﻿" + filasDeTabla(d).map((f) => f.map(comillas).join(",")).join("\r\n") + "\r\n";
}

/** Texto separado por tabuladores: se pega directo en una celda de Excel o de Google Sheets («Copiar como tabla»). */
export function aTabla(d: DatosPresupuesto): string {
  return filasDeTabla(d)
    .map((f) => f.map((t) => t.replace(/[\t\r\n]+/g, " ")).join("\t"))
    .join("\n");
}
