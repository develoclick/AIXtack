import { comparable } from "@/lib/cv/normalizar";
import { formatoMonto, parsearNumero } from "@/lib/presupuesto/calculo";
import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import type { LecturaSalario } from "./lector";
import { textoDeFuenteSalario } from "./prompt";
import { TIPOS_RESPUESTA, type DatosSalario } from "./tipos";

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

/** Afirmaciones de «datos de mercado» que la IA no puede sostener (esta herramienta no tiene ni da cifras de mercado). */
const RE_MERCADO = /(promedio (?:del|de) mercado|el mercado (?:paga|ofrece)|salario de mercado|rango de mercado|suelen? (?:ganar|cobrar|pagar)|seg[uú]n (?:encuestas|estudios|estad[ií]sticas|portales)|en promedio (?:se |los |las )?(?:gana|pagan|cobran))/i;
/** Menciones a otra oferta o a presión ficticia sobre la empresa. */
const RE_OTRA_OFERTA = /(otra oferta|otras ofertas|me ofrecieron|oferta de (?:otra|la competencia)|tengo una oferta|otro empleador)/i;

function citas(texto: string): string[] {
  return [...texto.matchAll(/[«“"]([^»”"]{4,})[»”"]/g)].map((m) => m[1].trim());
}

/** Citas de la «evidencia» de los argumentos que NO están en lo que escribió la persona (competencias, cargo, nivel, formación). */
export function citasQueNoEstan(d: DatosSalario, l: LecturaSalario): { argumento: string; cita: string }[] {
  const base = " " + norm([d.competencias, d.cargo, d.nivel, d.formacion, d.actualBeneficios].join(" ")) + " ";
  return l.argumentos.flatMap((a) => citas(a.evidencia).filter((c) => !base.includes(norm(c))).map((cita) => ({ argumento: a.argumento, cita })));
}

/** Números de un monto en los dos formatos habituales: «4200», «4,200» y «4,200.00». */
function variantesDeMonto(n: number): string[] {
  const entero = Math.round(n) === n ? String(n) : String(n);
  return [entero, formatoMonto(n), formatoMonto(n).replace(/\.00$/, ""), entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",")];
}

/** ¿Alguna respuesta preparada revela el mínimo aceptable de la persona? (No debe: es su límite.) */
export function respuestasQueRevelanElMinimo(d: DatosSalario, l: LecturaSalario): number[] {
  const minimo = parsearNumero(d.minimo);
  if (minimo === null || minimo <= 0) return [];
  const v = variantesDeMonto(minimo);
  return l.respuestas.filter((r) => v.some((x) => new RegExp(`(^|[^\\d.,])${x.replace(/[.,]/g, "\\$&")}(?![\\d]|[.,]\\d)`).test(r.texto))).map((r) => r.numero);
}

export interface RevisionSalario {
  avisos: string[];
  cifras: CifrasNuevas;
  citasFalsas: { argumento: string; cita: string }[];
}

/** Verificaciones automáticas del paso 3 («Qué revisar antes de usarlo»). Señalan lo que hay que mirar; no demuestran nada. */
export function revisarRespuesta(l: LecturaSalario, d: DatosSalario): RevisionSalario {
  const cuerpo = [l.oferta, l.preguntas, l.cifras, l.argumentos.map((a) => `${a.argumento} ${a.relacion}`), l.respuestas.map((r) => `${r.situacion}\n${r.texto}\n${r.cuando}`), l.margen.map((x) => `${x.elemento} ${x.porQue}`), l.checklist, l.verificar, l.siguiente].flat().join("\n");
  const cifras = cifrasNuevas(cuerpo, textoDeFuenteSalario(d));
  const citasFalsas = citasQueNoEstan(d, l);
  const avisos: string[] = [];
  if (cifras.montos.length) avisos.push(`La respuesta menciona montos que no están en tus datos ni en los cálculos de la página: ${cifras.montos.join(", ")}. No los uses como referencia de mercado: esta herramienta no tiene cifras de mercado.`);
  if (cifras.porcentajes.length) avisos.push(`Menciona porcentajes que no están en tus datos: ${cifras.porcentajes.join(", ")}. Si es una recomendación, contrástala; si es un dato de mercado, no la uses.`);
  if (RE_MERCADO.test(cuerpo)) avisos.push("La respuesta afirma datos de mercado (promedios o lo que «suele» pagar el mercado). No tiene fuente: no los uses. Usa solo las referencias con fuente y fecha que tú aportaste.");
  if (!d.comparar && RE_OTRA_OFERTA.test(cuerpo)) avisos.push("La respuesta menciona otra oferta. Solo puedes decir que tienes otra oferta si es real y verificable; nunca la inventes.");
  if (citasFalsas.length) avisos.push(`Los argumentos citan datos que no encuentro en tus competencias: ${citasFalsas.slice(0, 3).map((c) => `«${c.cita}»`).join("; ")}. Úsalos solo si son ciertos y puedes demostrarlos.`);
  const revelan = respuestasQueRevelanElMinimo(d, l);
  if (revelan.length) avisos.push(`La(s) respuesta(s) ${revelan.join(", ")} menciona(n) tu mínimo aceptable. No lo reveles: es tu límite, no una cifra para compartir.`);
  if (l.respuestas.length) {
    const tipos = l.respuestas.map((r) => norm(r.tipo));
    const faltan = TIPOS_RESPUESTA.filter((t) => !tipos.some((x) => x.startsWith(norm(t).slice(0, 8))));
    if (faltan.length) avisos.push(`Faltan respuestas preparadas de este tipo: ${faltan.join(", ")}.`);
    const correo = l.respuestas.find((r) => norm(r.tipo).startsWith("correo"));
    if (correo && !/asunto\s*:/i.test(correo.texto)) avisos.push("El correo de contraoferta no empieza con «Asunto:».");
  }
  if (l.preguntas.length > 0 && l.preguntas.length < 6) avisos.push(`Pedimos al menos 6 preguntas al reclutador y encontré ${l.preguntas.length}.`);
  if (l.verificar.length) avisos.push(`La IA pide verificar ${l.verificar.length} dato(s): revisa la pestaña «Por verificar».`);
  return { avisos, cifras, citasFalsas };
}
