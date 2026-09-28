import type { Historia } from "./tipos";
import { TIPOS_ENTREVISTA, type DatosEntrevista } from "./tipos";
import { historiaCompleta, HISTORIAS_MINIMO, nombreCompetencia } from "./historias";
import type { LecturaEntrevista } from "./lector";

export interface ItemChecklist {
  id: string;
  texto: string;
}

export interface GrupoChecklist {
  titulo: string;
  items: ItemChecklist[];
}

const ORDEN_PRIORIDAD = { ALTA: 0, MEDIA: 1, BAJA: 2 } as const;

/** Temas ordenados por prioridad (ALTA primero); los que no traen prioridad van al final. */
export function temasOrdenados(l: LecturaEntrevista | null) {
  return (l?.temas ?? []).slice().sort((a, b) => (a.prioridad ? ORDEN_PRIORIDAD[a.prioridad] : 3) - (b.prioridad ? ORDEN_PRIORIDAD[b.prioridad] : 3));
}

/**
 * Checklist del día previo. Los ítems fijos son recomendaciones generales de preparación; los dinámicos salen de tus datos y de la
 * respuesta de la IA (temas de prioridad alta, riesgos del CV, tipo de entrevista). No afirman nada sobre la empresa.
 */
export function construirChecklist(d: DatosEntrevista, l: LecturaEntrevista | null, historias: Historia[]): GrupoChecklist[] {
  const tipo = TIPOS_ENTREVISTA.find((t) => t.valor === d.tipo)!;
  const completas = historias.filter(historiaCompleta).length;
  const altos = temasOrdenados(l).filter((t) => t.prioridad === "ALTA").slice(0, 3);
  const riesgos = (l?.riesgos ?? []).slice(0, 3);

  const logistica: ItemChecklist[] = [
    { id: "confirmar", texto: "Confirmé el día, la hora, el lugar o el enlace, y el nombre de quién me entrevista." },
    { id: "ruta", texto: "Planifiqué la ruta y el tiempo de viaje, o probé mi conexión, para estar listo unos minutos antes." },
    { id: "documentos", texto: "Tengo a mano mi CV (impreso o en el celular), un documento de identidad y una libreta para anotar." },
  ];
  if (d.tipo === "tecnica") logistica.push({ id: "entorno", texto: "Dejé listo mi entorno de trabajo (editor, repositorio o proyecto de ejemplo) por si me piden compartir pantalla." });
  if (d.tipo === "caso") logistica.push({ id: "hoja-caso", texto: "Tengo papel y lápiz (o una hoja en blanco) para estructurar el caso antes de responder." });
  logistica.push({ id: "virtual", texto: "Si es virtual: probé cámara, micrófono y luz, y elegí un lugar sin ruido." });

  const contenido: ItemChecklist[] = [
    { id: "releer", texto: "Releí mi CV y la oferta: puedo explicar cada línea del CV con un ejemplo real." },
    { id: "historias", texto: `Repasé mis historias STAR (${completas} completas${completas < HISTORIAS_MINIMO ? `; la meta son ${HISTORIAS_MINIMO} a 7` : ""}) sin memorizarlas palabra por palabra.` },
    { id: "presentacion", texto: "Practiqué mi presentación en voz alta, con el cronómetro." },
    ...altos.map((t, i) => ({ id: `tema-${i}`, texto: `Repasé el tema de prioridad alta: ${t.tema}.` })),
    ...riesgos.map((r, i) => ({ id: `riesgo-${i}`, texto: `Preparé una respuesta honesta para: ${r.fragmento ? `«${r.fragmento}»` : r.texto.slice(0, 80)}.` })),
    { id: "preguntas", texto: "Elegí las preguntas que voy a hacerle al entrevistador." },
    { id: "empresa", texto: d.empresa.trim() ? `Repasé lo que sé de ${d.empresa.trim().split(/[.\n]/)[0].slice(0, 60)} y lo verifiqué en fuentes oficiales.` : "Repasé la web oficial y los canales públicos de la empresa." },
  ];

  const descanso: ItemChecklist[] = [
    { id: "ropa", texto: `Dejé lista mi ropa y todo lo que necesito llevar${d.duracion.trim() ? ` para ${d.duracion.trim()} de entrevista` : ""}.` },
    { id: "dormir", texto: "Me acuesto a una hora razonable: prefiero descansar a seguir estudiando." },
    { id: "guiones", texto: "No voy a memorizar guiones: solo repaso ideas, datos reales y cifras que puedo demostrar." },
  ];

  return [
    { titulo: `Logística (entrevista ${tipo.etiqueta.toLowerCase()})`, items: logistica },
    { titulo: "Contenido", items: contenido },
    { titulo: "Descanso y actitud", items: descanso },
  ];
}

export interface SeccionHoja {
  titulo: string;
  items: string[];
}

export interface HojaDeEstudio {
  titulo: string;
  secciones: SeccionHoja[];
}

/** Hoja de estudio: reúne en un solo documento lo más útil de la respuesta de la IA y de tus historias. */
export function hojaDeEstudio(d: DatosEntrevista, l: LecturaEntrevista | null, historias: Historia[]): HojaDeEstudio {
  const tipo = TIPOS_ENTREVISTA.find((t) => t.valor === d.tipo)!;
  const secciones: SeccionHoja[] = [];
  secciones.push({
    titulo: "Datos de la entrevista",
    items: [`Tipo: ${tipo.etiqueta}`, `Empresa: ${d.empresa.trim() ? d.empresa.trim().split("\n")[0] : "(no indicado)"}`, `Duración estimada: ${d.duracion.trim() || "(no indicado)"}`, `Temas que me preocupan: ${d.temas.trim() || "(no indicado)"}`],
  });
  const temas = temasOrdenados(l);
  if (temas.length) secciones.push({ titulo: "Temas a estudiar (por prioridad)", items: temas.map((t) => `${t.prioridad ? `[${t.prioridad}] ` : ""}${t.tema}${t.porQue ? ` — ${t.porQue}` : ""}`) });
  if (l?.riesgos.length) secciones.push({ titulo: "Riesgos de mi CV y cómo abordarlos", items: l.riesgos.map((r) => `[${r.tipo}] ${r.texto}`) });
  if (l?.preguntas.length) secciones.push({ titulo: "Preguntas para practicar", items: l.preguntas.map((p) => `${p.numero}. [${p.categoria}] ${p.texto}${p.estructura ? ` — Estructura: ${p.estructura}` : ""}`) });
  if (l?.informe?.plan.length) secciones.push({ titulo: "Plan de práctica (de la simulación)", items: l.informe.plan });
  if (l?.informe?.debiles.length) secciones.push({ titulo: "Puntos débiles a trabajar", items: l.informe.debiles });
  if (l?.entrevistador.length) secciones.push({ titulo: "Preguntas para el entrevistador", items: l.entrevistador });
  const completas = historias.filter(historiaCompleta);
  if (completas.length) secciones.push({ titulo: "Mis historias STAR", items: completas.map((h) => `${h.titulo} (${h.competencias.map(nombreCompetencia).join(", ") || "sin competencias"})`) });
  if (l?.verificar.length) secciones.push({ titulo: "Qué debo verificar", items: l.verificar });
  return { titulo: `Hoja de estudio: ${d.empresa.trim() ? d.empresa.trim().split("\n")[0].slice(0, 60) : "entrevista de trabajo"}`, secciones };
}

export function hojaATexto(h: HojaDeEstudio): string {
  return [h.titulo, ...h.secciones.map((s) => `\n${s.titulo.toUpperCase()}\n${s.items.map((i) => `- ${i}`).join("\n")}`)].join("\n");
}
