import { comprobarPaleta, type ContrasteColor } from "./paleta";
import type { LecturaLogo } from "./lector";
import type { Tipografia } from "./tipos";

export interface RevisionLogo {
  contrastes: ContrasteColor[];
  paletaConProblemas: ContrasteColor[];
  tipografiasSinLicenciaVerificada: Tipografia[];
  avisos: string[];
}

/**
 * Revisión automática de la respuesta: el contraste de la paleta lo calcula la página, nunca la IA (aunque el prompt se lo
 * pida), y avisa si alguna tipografía todavía necesita verificar su licencia de uso comercial.
 */
export function revisarLogo(l: LecturaLogo): RevisionLogo {
  const contrastes = comprobarPaleta(l.paleta);
  const paletaConProblemas = contrastes.filter((c) => !c.hexValido || !c.cumpleAA);
  const tipografiasSinLicenciaVerificada = l.tipografias.filter((t) => /verificar/i.test(t.licencia) || !t.licencia.trim());

  const avisos: string[] = [];
  if (paletaConProblemas.length) avisos.push(`${paletaConProblemas.length} color(es) de la paleta no llegan al contraste AA (4,5:1) ni sobre blanco ni sobre negro: revisa si necesitas escribir texto encima de ese color.`);
  if (tipografiasSinLicenciaVerificada.length) avisos.push(`${tipografiasSinLicenciaVerificada.length} tipografía(s) todavía necesitan que verifiques su licencia de uso comercial en Google Fonts.`);
  if (l.conceptos.length !== 3) avisos.push(`La respuesta trae ${l.conceptos.length} concepto(s) en vez de 3: pídele a la IA que complete los que falten.`);
  if (l.prompts.length < 8) avisos.push(`Solo hay prompts de imagen para ${l.prompts.length} de las 8 variantes: pídele a la IA las que falten antes de generar tu logo.`);

  return { contrastes, paletaConProblemas, tipografiasSinLicenciaVerificada, avisos };
}
