import { comparable } from "@/lib/cv/normalizar";
import { detectarInventados, terminosDeOferta, type Inventados } from "@/lib/optimizar/verificar";
import type { LecturaAnalisis } from "./lector";
import { parsearAnios } from "./anios";
import type { DatosAnalisis, Requisito } from "./tipos";

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();
const SIN_EVIDENCIA = /^\(?\s*sin evidencia/i;

/** Citas «…» de un texto. */
function citas(texto: string): string[] {
  return [...texto.matchAll(/[«“"]([^»”"]{4,})[»”"]/g)].map((m) => m[1].trim());
}

/** Citas de la columna «evidencia» que NO existen en el CV: la IA pudo inventarlas. */
export function citasQueNoEstan(cv: string, requisitos: Requisito[]): { requisito: string; cita: string }[] {
  const enCv = " " + norm(cv) + " ";
  return requisitos.flatMap((r) => citas(r.evidencia).filter((c) => !enCv.includes(norm(c))).map((cita) => ({ requisito: r.requisito, cita })));
}

/** Requisitos «CUMPLE» o «PARCIAL» sin ninguna cita de evidencia. */
export function sinEvidencia(requisitos: Requisito[]): Requisito[] {
  return requisitos.filter((r) => (r.estado === "CUMPLE" || r.estado === "PARCIAL") && (citas(r.evidencia).length === 0 || SIN_EVIDENCIA.test(r.evidencia.trim())));
}

/** Requisitos «NO IDENTIFICADO» cuyos términos principales SÍ aparecen en el CV: quizá la IA no lo encontró. */
export function quizaEstanEnElCv(cv: string, requisitos: Requisito[]): Requisito[] {
  const enCv = new Set(norm(cv).split(" "));
  return requisitos.filter((r) => {
    if (r.estado !== "NO IDENTIFICADO") return false;
    const terminos = terminosDeOferta(r.requisito).filter((t) => t.length >= 3);
    return terminos.length > 0 && terminos.every((t) => enCv.has(t));
  });
}

/** Requisitos que la IA escribió y que no se parecen a nada de la oferta (menos de la mitad de sus términos aparece en ella). */
export function requisitosAjenos(oferta: string, requisitos: Requisito[]): Requisito[] {
  const enOferta = new Set(norm(oferta).split(" "));
  return requisitos.filter((r) => {
    const t = terminosDeOferta(r.requisito).filter((x) => x.length >= 3);
    return t.length > 0 && t.filter((x) => enOferta.has(x)).length / t.length < 0.5;
  });
}

/** Años que pide un requisito («3 años», «1 año», «dos años»); null si no pide años. */
export function aniosRequeridos(requisito: string): number | null {
  const m = requisito.match(/(\d+(?:[.,]\d+)?)\s*(?:\+\s*)?(?:años?|anos?)\b/i) ?? requisito.match(/\b(un|dos|tres|cuatro|cinco|seis|siete|ocho|diez)\s+años?\b/i);
  if (!m) return null;
  const palabras: Record<string, number> = { un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, diez: 10 };
  return palabras[m[1].toLowerCase()] ?? Number(m[1].replace(",", "."));
}

/** Compara lo que marcó la IA en los requisitos de años con los años que declaró la persona. */
export function avisosDeAnios(anios: string, requisitos: Requisito[]): string[] {
  const declarados = parsearAnios(anios);
  if (declarados === null) return [];
  const avisos: string[] = [];
  for (const r of requisitos) {
    const pide = aniosRequeridos(r.requisito);
    if (pide === null) continue;
    if (r.estado === "CUMPLE" && declarados < pide) avisos.push(`«${r.requisito}» está como CUMPLE, pero declaraste ${anios.trim()} años de experiencia en total. Revisa la evidencia.`);
    if ((r.estado === "NO IDENTIFICADO" || r.estado === "PARCIAL") && declarados >= pide) avisos.push(`«${r.requisito}» está como ${r.estado === "PARCIAL" ? "PARCIAL" : "NO IDENTIFICADO"}, pero declaraste ${anios.trim()} años en total: si es experiencia del área, escribe las fechas de cada puesto en tu CV para que se vea.`);
  }
  return avisos;
}

/** Texto de la respuesta que habla del candidato (sin la tabla de requisitos ni los nombres de campo): base del detector de datos ajenos. */
function textoAnalizado(l: LecturaAnalisis): string {
  return [...l.fortalezas, ...l.brechas, ...l.aVerificar, ...l.plan.map((p) => p.texto), ...l.verificar, ...l.siguiente, ...l.palabras.map((p) => p.palabra), ...l.requisitos.map((r) => r.evidencia)]
    .filter(Boolean)
    .join("\n")
    .replace(/\[(?:ESTIMACIÓN|SUPUESTO|HIPÓTESIS)\]/g, "")
    .replace(/[ \t]{2,}/g, " ");
}

const PERMITIDOS = ["CV", "ATS", "CSV", "OBLIGATORIO", "DESEABLE", "CUMPLE", "PARCIAL", "IDENTIFICADO", "EVALUABLE", "ESPECIFICADO"];

/** Números y nombres que la respuesta menciona y que NO están en el CV, en la oferta ni en lo que escribió la persona. */
export function datosFueraDeLaFuente(fuente: string, l: LecturaAnalisis): Inventados {
  return detectarInventados(fuente, textoAnalizado(l), PERMITIDOS);
}

export interface RevisionAnalisis {
  avisos: string[];
  datosNuevos: Inventados;
  citasFalsas: { requisito: string; cita: string }[];
}

/** Verificaciones automáticas del paso 3 («Qué revisar antes de usarlo»). Señalan lo que hay que mirar; no demuestran nada. */
export function revisarRespuesta(l: LecturaAnalisis, datos: DatosAnalisis): RevisionAnalisis {
  const datosNuevos = datosFueraDeLaFuente(`${datos.cv}\n${datos.oferta}\n${datos.anios}`, l);
  const citasFalsas = citasQueNoEstan(datos.cv, l.requisitos);
  const avisos: string[] = [];
  if (citasFalsas.length) avisos.push(`La evidencia cita fragmentos que no encuentro en tu CV: ${citasFalsas.slice(0, 4).map((c) => `«${c.cita}» (${c.requisito})`).join("; ")}${citasFalsas.length > 4 ? "…" : ""}. La IA pudo haberlos inventado.`);
  const sin = sinEvidencia(l.requisitos);
  if (sin.length) avisos.push(`${sin.length} requisito(s) figuran como CUMPLE o PARCIAL sin una cita del CV: ${sin.slice(0, 3).map((r) => `«${r.requisito}»`).join(", ")}${sin.length > 3 ? "…" : ""}.`);
  const quiza = quizaEstanEnElCv(datos.cv, l.requisitos);
  if (quiza.length) avisos.push(`Estos requisitos figuran como NO IDENTIFICADO, pero sus términos sí aparecen en tu CV: ${quiza.slice(0, 3).map((r) => `«${r.requisito}»`).join(", ")}. Quizá estén mal evaluados: cámbiales el estado en la tabla.`);
  const ajenos = requisitosAjenos(datos.oferta, l.requisitos);
  if (ajenos.length) avisos.push(`Estos requisitos no se parecen a nada de tu oferta (¿los inventó la IA?): ${ajenos.slice(0, 3).map((r) => `«${r.requisito}»`).join(", ")}.`);
  avisos.push(...avisosDeAnios(datos.anios, l.requisitos));
  if (datosNuevos.numeros.length) avisos.push(`La respuesta menciona números que no están en tu CV ni en la oferta: ${datosNuevos.numeros.join(", ")}. No los uses sin comprobarlos.`);
  if (datosNuevos.nombres.length) avisos.push(`Menciona nombres, siglas o herramientas que no están en tu CV ni en la oferta: ${datosNuevos.nombres.join(", ")}.`);
  const vistos = new Set<string>();
  const repetidos = l.requisitos.filter((r) => (vistos.has(norm(r.requisito)) ? true : (vistos.add(norm(r.requisito)), false)));
  if (repetidos.length) avisos.push(`Hay requisitos repetidos: ${repetidos.slice(0, 3).map((r) => `«${r.requisito}»`).join(", ")}.`);
  const tipos = new Set(l.requisitos.map((r) => r.tipo));
  if (datos.distingue === "si" && l.requisitos.length > 0 && [...tipos].every((t) => t === "NO ESPECIFICADO")) avisos.push("Dijiste que la oferta distingue obligatorios de deseables, pero todos los requisitos vinieron como NO ESPECIFICADO. Revisa los tipos en la tabla.");
  if (datos.distingue === "no" && (tipos.has("OBLIGATORIO") || tipos.has("DESEABLE"))) avisos.push("Dijiste que la oferta no distingue obligatorios de deseables, pero la IA marcó algunos como obligatorios o deseables. Revisa los tipos en la tabla.");
  if (l.requisitos.length > 0 && l.requisitos.length < 4) avisos.push(`Solo se leyeron ${l.requisitos.length} requisitos: una oferta suele tener más. Pídele a la IA que extraiga TODOS.`);
  if (l.verificar.length + l.aVerificar.length) avisos.push(`La IA pide verificar ${l.verificar.length + l.aVerificar.length} dato(s): revisa la pestaña «Por verificar».`);
  return { avisos, datosNuevos, citasFalsas };
}
