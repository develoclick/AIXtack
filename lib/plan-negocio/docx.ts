import type { Document } from "docx";
import { leerTablaMarkdown } from "./lector";
import { TITULOS_RESPUESTA, type ClaveRespuesta } from "./tipos";

const ANCHO_PAGINA = 11906;
const ALTO_PAGINA = 16838;
const MARGEN = 1134;
const FUENTE = "Calibri";

const COLOR_DATO = "0B7A4B";
const COLOR_CALCULO = "1D4ED8";
const COLOR_SUPUESTO = "8A5A00";
const RE_ETIQUETA = /(\[(?:dato del usuario|c[aá]lculo|supuesto)\])/gi;

/** Estas 2 secciones se muestran como tablas (competencia y proyección de ingresos), el resto como párrafos con viñetas o texto corrido. */
const CLAVES_TABLA: ClaveRespuesta[] = ["competencia", "proyeccion"];

export async function construirDocumentoPlanDocx(nombreEmpresa: string, finalidad: string, secciones: Partial<Record<ClaveRespuesta, string>>): Promise<Document> {
  const { AlignmentType, BorderStyle, Document, LevelFormat, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } = await import("docx");

  const runsDeTexto = (t: string, o: { bold?: boolean; size?: number } = {}) =>
    t.split(RE_ETIQUETA).map((parte) => {
      const c = parte.toLowerCase();
      const color = c.startsWith("[dato") ? COLOR_DATO : c.startsWith("[calculo") || c.startsWith("[cálculo") ? COLOR_CALCULO : c.startsWith("[supuesto") ? COLOR_SUPUESTO : undefined;
      return new TextRun({ text: parte, font: FUENTE, size: o.size ?? 22, bold: o.bold || Boolean(color), color });
    });

  const hijos: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

  hijos.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800, after: 100 }, children: [new TextRun({ text: "Plan de negocio", font: FUENTE, size: 44, bold: true })] }));
  hijos.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: nombreEmpresa || "Sin nombre todavía", font: FUENTE, size: 30 })] }));
  hijos.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [new TextRun({ text: `Preparado para: ${finalidad}`, font: FUENTE, size: 22, italics: true })] }));
  hijos.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Índice", font: FUENTE, size: 26, bold: true })] }));
  for (const t of TITULOS_RESPUESTA) if (t.clave !== "verificar" && t.clave !== "siguiente" && secciones[t.clave]) hijos.push(new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: t.titulo, font: FUENTE, size: 22 })] }));
  hijos.push(new Paragraph({ pageBreakBefore: true, children: [] }));

  const celda = (texto: string, cabecera = false) => new TableCell({ width: { size: 100, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: texto, font: FUENTE, size: 20, bold: cabecera })] })] });

  for (const t of TITULOS_RESPUESTA) {
    const texto = secciones[t.clave];
    if (!texto) continue;
    hijos.push(new Paragraph({ spacing: { before: 260, after: 100 }, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: "000000" } }, children: [new TextRun({ text: t.titulo.toUpperCase(), font: FUENTE, size: 24, bold: true })] }));

    if (CLAVES_TABLA.includes(t.clave)) {
      const tabla = leerTablaMarkdown(texto);
      if (tabla && tabla.cabecera.length) {
        hijos.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [new TableRow({ children: tabla.cabecera.map((c) => celda(c, true)) }), ...tabla.filas.map((f) => new TableRow({ children: f.map((c) => celda(c)) }))],
          }),
        );
        continue;
      }
    }

    for (const linea of texto.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const vin = linea.match(/^[-*•]\s+(.*)$/);
      if (vin) hijos.push(new Paragraph({ numbering: { reference: "vinetas-plan", level: 0 }, spacing: { after: 40 }, children: runsDeTexto(vin[1]) }));
      else hijos.push(new Paragraph({ spacing: { after: 60 }, children: runsDeTexto(linea) }));
    }
  }

  return new Document({
    creator: "",
    title: nombreEmpresa ? `Plan de negocio - ${nombreEmpresa}` : "Plan de negocio",
    styles: { default: { document: { run: { font: FUENTE, size: 22 } } } },
    numbering: { config: [{ reference: "vinetas-plan", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
    sections: [{ properties: { page: { size: { width: ANCHO_PAGINA, height: ALTO_PAGINA }, margin: { top: MARGEN, bottom: MARGEN, left: MARGEN, right: MARGEN } } }, children: hijos }],
  });
}

/** Nombre de archivo seguro: «Plan-de-negocio-Nombre.docx». */
export function nombreDeArchivoPlan(nombreEmpresa: string): string {
  const base = nombreEmpresa
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `Plan-de-negocio-${base || "sin-nombre"}.docx`;
}
