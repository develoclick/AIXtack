import type { Document } from "docx";

export interface SeccionDocumento {
  titulo: string;
  /** Párrafos de texto (por ejemplo, «Situación: …»). */
  parrafos?: string[];
  /** Viñetas. */
  items?: string[];
}

/** Documento simple de Word (título, secciones, párrafos y viñetas) para exportar historias STAR y la hoja de estudio. */
export async function construirDocumentoSecciones(titulo: string, secciones: SeccionDocumento[], nota?: string): Promise<Document> {
  const { AlignmentType, Document, HeadingLevel, LevelFormat, Paragraph, TextRun } = await import("docx");
  const FUENTE = "Calibri";
  const t = (texto: string, o: { bold?: boolean; italics?: boolean; size?: number } = {}) => new TextRun({ text: texto, font: FUENTE, size: o.size ?? 22, bold: o.bold, italics: o.italics });
  const hijos: InstanceType<typeof Paragraph>[] = [new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 160 }, children: [t(titulo, { bold: true, size: 36 })] })];
  if (nota) hijos.push(new Paragraph({ spacing: { after: 160 }, children: [t(nota, { italics: true, size: 20 })] }));
  for (const s of secciones) {
    hijos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 80 }, keepNext: true, children: [t(s.titulo, { bold: true, size: 26 })] }));
    for (const p of s.parrafos ?? []) hijos.push(new Paragraph({ spacing: { after: 80 }, children: [t(p)] }));
    for (const i of s.items ?? []) hijos.push(new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 40 }, children: [t(i)] }));
  }
  return new Document({
    creator: "guiapromptsia.com",
    title: titulo,
    styles: { default: { document: { run: { font: FUENTE, size: 22 } } } },
    numbering: { config: [{ reference: "vinetas", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, children: hijos }],
  });
}

/** Historias STAR como secciones de un documento. */
export function seccionesDeHistorias(historias: { titulo: string; competencias: string[]; situacion: string; tarea: string; accion: string; resultado: string }[]): SeccionDocumento[] {
  return historias.map((h, i) => ({
    titulo: `${i + 1}. ${h.titulo || "(sin título)"}`,
    parrafos: [`Competencias: ${h.competencias.join(", ") || "(ninguna)"}`, `Situación: ${h.situacion}`, `Tarea: ${h.tarea}`, `Acción: ${h.accion}`, `Resultado: ${h.resultado}`],
  }));
}

/** Descarga un documento de Word (la librería se carga solo al pulsar el botón). */
export async function descargarDocumento(doc: Document, nombreArchivo: string) {
  const { Packer } = await import("docx");
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
