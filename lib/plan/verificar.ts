import { comparable } from "@/lib/cv/normalizar";
import { cifrasNuevas, type CifrasNuevas } from "@/lib/presupuesto/verificar";
import { calcularDistribucion, formatoDuracion, minutosDisponibles, sumasPorSemana, type DistribucionCalculada, type SumaSemana } from "./calculo";
import type { LecturaPlan } from "./lector";
import { nombreDeVacante, textoDeFuentePlan, vacantesLlenas } from "./prompt";
import { TIPOS_PLANTILLA, type DatosPlan } from "./tipos";

const norm = (t: string) => comparable(t).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

/** Afirmaciones sobre «el mercado laboral» que la IA no puede sostener (esta herramienta no tiene datos del mercado). */
const RE_MERCADO = /(el \d+(?:[.,]\d+)?\s*%\s*(?:de los|de las)\s*(?:empleos|puestos|vacantes|ofertas|contrataciones|reclutadores)|tasa de [eé]xito|tiempo promedio de b[uú]squeda|en promedio (?:se |los |las )?(?:tarda|demora|consigue)|seg[uú]n (?:encuestas|estudios|estad[ií]sticas)|la mayor[ií]a de (?:los )?(?:empleos|puestos) (?:se consiguen|no se publican))/i;
/** Promesas de resultado o de plazo. */
const RE_PROMESA = /(garantiz|te aseguro|aseguras? (?:un|el) (?:empleo|trabajo)|conseguir[aá]s (?:un |el )?(?:empleo|trabajo)|te contratar[aá]n|en \d+ (?:semanas|d[ií]as|meses) (?:consigues|conseguir[aá]s|tendr[aá]s))/i;
/** Un número de postulaciones presentado como regla que asegura o necesita resultados. */
const RE_REGLA_POSTULACIONES = /\b\d+\s*(?:a\s*\d+\s*)?postulaciones\s+(?:por|a la|cada)\s+semana\b[^.\n]{0,80}(?:garantiz|asegur|necesar|indispensable|ideal|recomendad|m[ií]nimo)|(?:ideal|recomendado|m[ií]nimo|necesitas|debes hacer)[^.\n]{0,40}\b\d+\s*postulaciones\s+(?:por|a la|cada)\s+semana/i;
/** Unidades que acompañan a un número de tiempo o de cantidad de tareas: no son «cifras de mercado». */
const RE_UNIDADES = /\b\d+(?:[.,]\d+)?\s*(?:min(?:utos?)?|horas?|h|d[ií]as?(?:\s+h[aá]biles)?|semanas?|meses|postulaciones|mensajes|vacantes|ofertas|entrevistas|contactos|personas|versiones|correos|avisos)\b/gi;

export interface RevisionPlan {
  avisos: string[];
  sumas: SumaSemana[];
  distribucion: DistribucionCalculada;
  cifras: CifrasNuevas;
  /** Vacantes priorizadas por la IA que no están entre las que aportó el usuario. */
  vacantesAjenas: string[];
  /** Minutos totales de las 4 semanas y semanas que no caben en el tiempo disponible. */
  semanasQueNoCaben: number[];
}

/** ¿La vacante que escribió la IA corresponde a una del usuario? (por empresa o por puesto, sin importar tildes ni mayúsculas.) */
export function coincideVacante(escrita: string, d: DatosPlan): boolean {
  const e = norm(escrita);
  return vacantesLlenas(d).some((v) => {
    const empresa = norm(v.empresa);
    const puesto = norm(v.puesto);
    return (empresa && e.includes(empresa)) || (puesto && e.includes(puesto)) || norm(nombreDeVacante(v)) === e;
  });
}

/** Verificaciones automáticas del paso 3 («Qué revisar antes de usarlo»). Señalan lo que hay que mirar; no demuestran nada. */
export function revisarPlan(l: LecturaPlan, d: DatosPlan): RevisionPlan {
  const disponibles = minutosDisponibles(d);
  const sumas = sumasPorSemana(l.plan, disponibles);
  const distribucion = calcularDistribucion(l.distribucion, disponibles);
  const semanasQueNoCaben = sumas.filter((s) => s.exceso > 0).map((s) => s.semana);

  // Las cifras del plan (minutos) y de la distribución (porcentajes) las verifica la página con sumas; aquí solo se revisa el resto.
  const crudo = [l.objetivo, l.alternativas, l.criterios, l.vacantes.map((v) => `${v.vacante} ${v.motivo} ${v.antes}`), l.evitar.map((e) => `${e.actividad} ${e.porQueParece} ${e.enSuLugar}`), l.plantillas.map((p) => [p.situacion, p.texto, p.cuando].join("\n")), l.metricas, l.verificar, l.siguiente].flat().join("\n");
  const cuerpo = crudo.replace(RE_UNIDADES, " ").replace(/\[(?:ESTIMACI[OÓ]N|SUPUESTO|HIP[OÓ]TESIS)\]/gi, " ");
  const cifras = cifrasNuevas(cuerpo, textoDeFuentePlan(d));
  const vacantesAjenas = l.vacantes.filter((v) => !coincideVacante(v.vacante, d)).map((v) => v.vacante);
  const textoLibre = [crudo, l.secciones.distribucion ?? ""].join("\n");

  const avisos: string[] = [];
  if (disponibles === null) avisos.push("No indicaste cuántas horas por semana tienes (o no es un número entre 1 y 60): no puedo comprobar si el plan cabe en tu tiempo.");
  for (const s of sumas) {
    if (l.plan.length > 0 && s.tareas === 0) avisos.push(`La semana ${s.semana} no tiene tareas en la tabla.`);
    else if (s.exceso > 0) avisos.push(`La semana ${s.semana} suma ${s.minutos} minutos (${formatoDuracion(s.minutos)}) y tu tiempo disponible es ${disponibles} (${formatoDuracion(disponibles!)}): se pasa por ${s.exceso} minutos. Pide a la IA que recorte tareas o ajústalas tú.`);
    if (s.sinMinutos > 0) avisos.push(`La semana ${s.semana} tiene ${s.sinMinutos} tarea(s) sin minutos válidos: no suman al total.`);
  }
  const sinEntregable = l.plan.filter((f) => !f.entregable.trim()).length;
  if (sinEntregable) avisos.push(`${sinEntregable} tarea(s) del plan no tienen entregable: sin un resultado concreto no sabrás si la hiciste.`);
  const diaMalo = l.plan.filter((f) => f.diaIdx < 0);
  if (diaMalo.length) avisos.push(`${diaMalo.length} tarea(s) tienen un día que no reconozco (${[...new Set(diaMalo.map((f) => `«${f.dia}»`))].slice(0, 3).join(", ")}): no irán al calendario.`);
  if (l.distribucion.length > 0 && !distribucion.suma100) avisos.push(`Los porcentajes de la distribución suman ${distribucion.sumaPorcentajes} % y deberían sumar 100 %.`);
  if (cifras.montos.length) avisos.push(`La respuesta menciona cantidades que no están en tus datos: ${cifras.montos.join(", ")}. Comprueba de dónde salen antes de usarlas.`);
  if (cifras.porcentajes.length) avisos.push(`Menciona porcentajes que no están en tus datos: ${cifras.porcentajes.join(", ")}. Si son datos del mercado laboral, no los uses: esta herramienta no tiene ni da cifras de mercado.`);
  if (RE_MERCADO.test(textoLibre)) avisos.push("La respuesta afirma datos del mercado laboral (porcentajes, promedios o «lo que suele pasar»). No tienen fuente: no los uses.");
  if (RE_PROMESA.test(textoLibre)) avisos.push("La respuesta promete o insinúa un resultado o un plazo para conseguir empleo. Nadie puede garantizarlo: trátalo como una ilusión, no como un dato.");
  if (RE_REGLA_POSTULACIONES.test(textoLibre)) avisos.push("La respuesta presenta un número de postulaciones por semana como regla. No hay una cifra que garantice resultados: usa tus horas y tu embudo para decidir.");
  if (vacantesLlenas(d).length > 0 && l.vacantes.length === 0 && l.secciones.criterios) avisos.push("Aportaste vacantes, pero la respuesta no las prioriza en el formato «Vacante: Empresa — Puesto | Prioridad: …».");
  if (vacantesAjenas.length) avisos.push(`La respuesta prioriza vacantes que no aportaste: ${vacantesAjenas.slice(0, 3).map((v) => `«${v}»`).join("; ")}. Podrían ser inventadas: no las uses.`);
  if (vacantesLlenas(d).length === 0 && l.vacantes.length > 0) avisos.push("No aportaste vacantes y la respuesta prioriza algunas: podrían ser inventadas.");
  if (l.objetivo && l.alternativas.length !== 2) avisos.push(`Pedimos el objetivo y 2 alternativas y encontré ${l.alternativas.length} alternativa(s).`);
  if (l.plantillas.length) {
    if (l.plantillas.length !== 3) avisos.push(`Pedimos 3 plantillas y encontré ${l.plantillas.length}.`);
    const tipos = l.plantillas.map((p) => norm(p.tipo));
    const faltan = TIPOS_PLANTILLA.filter((t) => !tipos.some((x) => x.startsWith(norm(t).slice(0, 7))));
    if (faltan.length) avisos.push(`Faltan plantillas de este tipo: ${faltan.join(", ")}.`);
    const sinMarcador = l.plantillas.filter((p) => p.texto && !/\[[^\]]+\]/.test(p.texto)).length;
    if (sinMarcador) avisos.push(`${sinMarcador} plantilla(s) no tienen marcadores entre corchetes ([Nombre], [Empresa]…): completa los datos reales antes de enviarlas.`);
  }
  if (l.verificar.length) avisos.push(`La IA pide verificar ${l.verificar.length} dato(s): revisa la pestaña «Por verificar».`);
  return { avisos, sumas, distribucion, cifras, vacantesAjenas, semanasQueNoCaben };
}
