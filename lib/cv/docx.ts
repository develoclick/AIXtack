import type { Document } from "docx";
import type { CvDocumento } from "./tipos";

/** A4 con márgenes de 2 cm; la línea «institución … ciudad» usa un tabulador derecho al borde del texto. */
const ANCHO_PAGINA = 11906;
const ALTO_PAGINA = 16838;
const MARGEN = 1134;
const ANCHO_TEXTO = ANCHO_PAGINA - MARGEN * 2;
const FUENTE = "Times New Roman";

/**
 * Formato pensado para que un ATS lo lea bien: una sola columna, texto real (sin tablas, cuadros de texto, imágenes ni
 * encabezados o pies de página), fuente estándar, títulos de sección en mayúsculas y viñetas de Word.
 */
export async function construirDocumentoDocx(cv: CvDocumento): Promise<Document> {
  const { AlignmentType, BorderStyle, Document, LevelFormat, Paragraph, TabStopType, TextRun } = await import("docx");

  const texto = (t: string, o: { bold?: boolean; italics?: boolean; size?: number } = {}) => new TextRun({ text: t, font: FUENTE, size: o.size ?? 22, bold: o.bold, italics: o.italics });
  const hijos: InstanceType<typeof Paragraph>[] = [];

  hijos.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [texto(cv.nombre, { bold: true, size: 32 })],
    }),
  );
  if (cv.contacto.length) {
    hijos.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [texto(cv.contacto.join("  |  "), { size: 20 })],
      }),
    );
  }

  const conTabulador = (izq: string, der: string, o: { bold?: boolean; italics?: boolean }, despues = 0, antes = 0) =>
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: ANCHO_TEXTO }],
      spacing: { before: antes, after: despues },
      keepNext: true,
      children: [texto(izq, o), ...(der ? [new TextRun({ text: "\t", font: FUENTE, size: 22 }), texto(der, o)] : [])],
    });

  const vineta = (t: string) =>
    new Paragraph({
      numbering: { reference: "vinetas", level: 0 },
      spacing: { after: 20 },
      children: [texto(t)],
    });

  for (const seccion of cv.secciones) {
    hijos.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        keepNext: true,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: "000000" } },
        children: [texto(seccion.titulo.toUpperCase(), { bold: true })],
      }),
    );
    for (const p of seccion.parrafos) hijos.push(new Paragraph({ spacing: { after: 60 }, children: [texto(p)] }));
    seccion.entradas.forEach((e, i) => {
      if (e.izq1 || e.der1) hijos.push(conTabulador(e.izq1, e.der1, { bold: true }, 0, i > 0 ? 100 : 0));
      if (e.izq2 || e.der2) hijos.push(conTabulador(e.izq2, e.der2, { italics: true }, 20));
      for (const p of e.puntos) hijos.push(vineta(p));
    });
    for (const p of seccion.puntos) hijos.push(vineta(p));
  }

  return new Document({
    creator: "",
    title: cv.nombre ? `Hoja de vida - ${cv.nombre}` : "Hoja de vida",
    styles: { default: { document: { run: { font: FUENTE, size: 22 } } } },
    numbering: {
      config: [
        {
          reference: "vinetas",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 260 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: { page: { size: { width: ANCHO_PAGINA, height: ALTO_PAGINA }, margin: { top: MARGEN, bottom: MARGEN, left: MARGEN, right: MARGEN } } },
        children: hijos,
      },
    ],
  });
}

/** Nombre de archivo seguro: «CV-Nombre-Apellido.docx». */
export function nombreDeArchivo(nombre: string): string {
  const base = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `CV-${base || "Hoja-de-vida"}.docx`;
}
