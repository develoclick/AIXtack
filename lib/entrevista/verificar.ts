import { comparable } from "@/lib/cv/normalizar";
import { detectarInventados, type Inventados } from "@/lib/optimizar/verificar";
import type { LecturaEntrevista, PreguntaLeida } from "./lector";
import { PREGUNTAS_BANCO_MINIMO, PREGUNTAS_SIMULACION } from "./prompt";
import { CATEGORIAS_PREGUNTA } from "./tipos";

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

/** Siglas y palabras del propio método que no cuentan como «datos nuevos». */
const PERMITIDOS = ["STAR", "CV", "RR", "HH", "RRHH", "ATS", "TERMINAR", "Situación", "Tarea", "Acción", "Resultado", "Recursos Humanos", "Panel"];

/** Texto de la respuesta que habla del candidato, del puesto o de la empresa (sin los títulos ni los nombres de campo). */
export function textoAnalizado(l: LecturaEntrevista): string {
  const partes: string[] = [];
  partes.push(...l.mapa.map((f) => f.texto), ...l.riesgos.map((r) => r.texto));
  for (const p of l.preguntas) partes.push(p.texto, p.evalua, p.experiencia, p.estructura, p.repregunta);
  partes.push(...l.temas.map((t) => `${t.tema} ${t.porQue}`));
  partes.push(...l.entrevistador);
  if (l.informe) partes.push(l.informe.resumen, ...l.informe.evaluaciones.map((e) => e.comentario), ...l.informe.fortalezas, ...l.informe.debiles, ...l.informe.plan);
  partes.push(...l.verificar, ...l.siguiente);
  // Las etiquetas [ESTIMACIÓN]… y los números de pregunta («preguntas 5 y 6») no son datos del candidato.
  return partes
    .filter(Boolean)
    .join("\n")
    .replace(/\[(?:ESTIMACIÓN|SUPUESTO|HIPÓTESIS)\]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\bpreguntas?\s+\d+(?:\s*(?:,|y|e)\s*\d+)*/gi, "preguntas");
}

/** Números y nombres que la respuesta menciona y que NO están en lo que la persona aportó (CV, oferta, empresa, temas). */
export function datosFueraDeLaFuente(fuente: string, l: LecturaEntrevista): Inventados {
  return detectarInventados(fuente, textoAnalizado(l), PERMITIDOS);
}

function citas(texto: string): string[] {
  return [...texto.matchAll(/[«“"]([^»”"]{6,})[»”"]/g)].map((m) => m[1].trim());
}

/**
 * Citas entre « » que no existen donde deberían: en «Experiencia real del CV» se exige que estén en el CV; en «Riesgos del CV»
 * pueden estar en el CV o en la oferta (un requisito que el CV no evidencia se cita de la oferta).
 */
export function citasQueNoEstan(cv: string, oferta: string, l: LecturaEntrevista): { donde: string; cita: string }[] {
  const enCv = " " + norm(cv) + " ";
  const enCvOOferta = enCv + norm(oferta) + " ";
  const salida: { donde: string; cita: string }[] = [];
  for (const r of l.riesgos) for (const c of [...(r.fragmento ? [r.fragmento] : []), ...citas(r.texto)]) if (c.length >= 4 && !enCvOOferta.includes(norm(c))) salida.push({ donde: "Riesgos del CV", cita: c });
  for (const p of l.preguntas) for (const c of citas(p.experiencia)) if (!enCv.includes(norm(c))) salida.push({ donde: `Pregunta ${p.numero}`, cita: c });
  return salida.filter((x, i) => salida.findIndex((y) => y.cita === x.cita && y.donde === x.donde) === i);
}

/** Preguntas cuya «estructura sugerida» parece una respuesta redactada por completo (larga y sin huecos «[completar…]»). */
export function guionesCompletos(preguntas: PreguntaLeida[]): number[] {
  return preguntas.filter((p) => p.estructura.split(/\s+/).filter(Boolean).length >= 55 && !/\[completar/i.test(p.estructura)).map((p) => p.numero);
}

export function categoriasFaltantes(preguntas: PreguntaLeida[]): string[] {
  const hay = new Set(preguntas.map((p) => norm(p.categoria)));
  return CATEGORIAS_PREGUNTA.filter((c) => ![...hay].some((h) => h.startsWith(norm(c)) || norm(c).startsWith(h)));
}

export function preguntasIncompletas(preguntas: PreguntaLeida[]): number[] {
  return preguntas.filter((p) => !p.evalua || !p.estructura || !p.repregunta || !p.experiencia).map((p) => p.numero);
}

export function preguntasSinEvidencia(preguntas: PreguntaLeida[]): number[] {
  return preguntas.filter((p) => /sin evidencia/i.test(p.experiencia)).map((p) => p.numero);
}

export interface RevisionEntrevista {
  avisos: string[];
  datosNuevos: Inventados;
  citas: { donde: string; cita: string }[];
}

/** Verificaciones automáticas del paso 3 («Qué revisar antes de usarlo»). No demuestran nada, señalan lo que hay que mirar. */
export function revisarRespuesta(l: LecturaEntrevista, cv: string, oferta: string, fuente: string): RevisionEntrevista {
  const datosNuevos = datosFueraDeLaFuente(fuente, l);
  const citasMalas = citasQueNoEstan(cv, oferta, l);
  const avisos: string[] = [];
  if (datosNuevos.numeros.length) avisos.push(`La respuesta menciona números que no están en tu CV, la oferta ni tus datos: ${datosNuevos.numeros.join(", ")}. Si hablan de ti, no son tuyos: no los uses.`);
  if (datosNuevos.nombres.length) avisos.push(`Menciona nombres, siglas o herramientas que no están en tus datos: ${datosNuevos.nombres.join(", ")}. Comprueba que existen en la oferta o en tu experiencia antes de contarlos.`);
  if (citasMalas.length) avisos.push(`Cita fragmentos que no encuentro donde deberían: ${citasMalas.map((c) => `«${c.cita}» (${c.donde})`).join("; ")}. La IA pudo haberlos inventado.`);
  if (l.preguntas.length) {
    if (l.preguntas.length < PREGUNTAS_BANCO_MINIMO) avisos.push(`Pedimos al menos ${PREGUNTAS_BANCO_MINIMO} preguntas y encontré ${l.preguntas.length}.`);
    const falta = categoriasFaltantes(l.preguntas);
    if (falta.length) avisos.push(`Faltan preguntas de estas categorías: ${falta.join(", ")}.`);
    const incompletas = preguntasIncompletas(l.preguntas);
    if (incompletas.length) avisos.push(`Las preguntas ${incompletas.join(", ")} no traen las cuatro partes (qué evalúa, experiencia del CV, estructura y repregunta).`);
    const guiones = guionesCompletos(l.preguntas);
    if (guiones.length) avisos.push(`La estructura de las preguntas ${guiones.join(", ")} parece una respuesta ya redactada. No la memorices: usa solo el esqueleto y completa los huecos con tus datos.`);
    const sin = preguntasSinEvidencia(l.preguntas);
    if (sin.length) avisos.push(`Las preguntas ${sin.join(", ")} no tienen experiencia en tu CV que las respalde: prepara una respuesta honesta, sin afirmar lo que no hiciste.`);
  }
  if (l.temas.length && l.temas.every((t) => t.prioridad === null)) avisos.push("Los temas a estudiar no traen prioridad (ALTA, MEDIA o BAJA).");
  if (l.entrevistador.length && l.entrevistador.length !== 5) avisos.push(`Pedimos 5 preguntas para el entrevistador y encontré ${l.entrevistador.length}.`);
  if (l.informe && l.informe.evaluaciones.length && l.informe.evaluaciones.length !== PREGUNTAS_SIMULACION) avisos.push(`El informe evalúa ${l.informe.evaluaciones.length} preguntas y la simulación pedía ${PREGUNTAS_SIMULACION}.`);
  if (l.informe && l.informe.evaluaciones.some((e) => e.criterios.some((c) => /duraci/i.test(c.nombre)))) avisos.push("La «duración» que estima la IA se basa en la extensión del texto, no en un cronómetro: usa el cronómetro de esta página para medir tus respuestas.");
  if (l.verificar.length) avisos.push(`La IA pide verificar ${l.verificar.length} dato(s): revisa la pestaña «Por verificar».`);
  return { avisos, datosNuevos, citas: citasMalas };
}
