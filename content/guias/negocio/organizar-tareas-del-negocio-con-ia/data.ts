import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * negocio/organizar-tareas-del-negocio-con-ia
 *
 * Tipo: estrategia y planificación + números y datos (`handlesNumbers`): las cuentas (días hasta la fecha, urgencia,
 * prioridad, minutos planificados y exceso) las hace la hoja y se verificaron con código. Todo el caso (Lavandería
 * Brisa, sus tres personas, los 25 pendientes, fechas, minutos y disponibilidad) es FICTICIO. Los ejemplos de la IA
 * están redactados aplicando literalmente cada prompt: no proceden de una conversación real ni de una prueba del
 * autor (esas viven en `evidence.pruebas`, que solo rellena el autor). El pedido ingenuo es ILUSTRATIVO. El plan de
 * la semana se calcula aquí con las mismas reglas que lleva el prompt (primer día en que cabe), y una verificación
 * independiente lo recalcula.
 *
 * Fuente única de verdad: los pendientes (TAREAS), las categorías, las definiciones de impacto, la matriz de
 * prioridad, la disponibilidad por persona y día, las cuentas de la hoja y la rúbrica se definen UNA vez y los leen
 * las tablas, los prompts, los ejemplos y los criterios.
 */
const slot = guideSlots("negocio", "organizar-tareas-del-negocio-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const NEGOCIO = "Lavandería Brisa (ficticia), un negocio familiar con tres personas";
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"] as const;
const FECHA_DIA = ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25"];
const DIA_TXT = (i: number) => `${DIAS[i]} ${FECHA_DIA[i].slice(8)}`;
const MES: Record<string, [string, string]> = { "09": ["sep", "septiembre"], "10": ["oct", "octubre"] };
const corto = (iso: string) => `${Number(iso.slice(8))} ${MES[iso.slice(5, 7)][0]}`;
const largo = (iso: string) => `${Number(iso.slice(8))} de ${MES[iso.slice(5, 7)][1]}`;
const dif = (iso: string) => Math.round((Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8)) - Date.UTC(2026, 8, 21)) / 86400000);

const CATEGORIAS = ["Dinero", "Clientes", "Equipos", "Insumos", "Personal", "Mejoras"];
const PERSONAS = ["Ana", "Luis", "Marta"] as const;
type Persona = (typeof PERSONAS)[number];
const PERSONAS_TXT =
  "Ana (dueña): decide, paga, hace trámites y responde las reseñas. Luis (su hermano): compras, reparaciones y arreglos. Marta (empleada): atención al cliente, limpieza, orden y redes.";
/** Minutos por día para pendientes, después del trabajo normal. */
const DISP: Record<Persona, number[]> = { Ana: [45, 45, 45, 45, 45], Luis: [0, 60, 0, 60, 0], Marta: [30, 30, 30, 30, 30] };
const suma = (a: number[]) => a.reduce((n, x) => n + x, 0);
const CAP_TOTAL = suma(PERSONAS.map((p) => suma(DISP[p])));

/* impacto, urgencia y prioridad */
type Impacto = "Alto" | "Medio" | "Bajo";
const IMPACTOS: Record<Impacto, string> = {
  Alto: "Si no se hace, pierdes dinero o un cliente, o incumples algo (un pago, un trámite, una promesa).",
  Medio: "Si no se hace, hay una molestia o un retraso, pero todavía no se pierde nada.",
  Bajo: "Es una mejora que puede esperar sin consecuencias.",
};
const LISTA_IMPACTO = (Object.keys(IMPACTOS) as Impacto[]).map((k) => `- ${k}: ${IMPACTOS[k]}`).join("\n");
const URG_ALTA = 7;
const URG_MEDIA = 30;
type Urgencia = "Alta" | "Media" | "Baja";
const urgencia = (dias: number | null): Urgencia => (dias === null ? "Baja" : dias <= URG_ALTA ? "Alta" : dias <= URG_MEDIA ? "Media" : "Baja");
const ESTA = "Esta semana", RUTINA = "Rutina", PROG = "Programar con fecha", SOBRA = "Si sobra", APLAZAR = "Aplazar";
const MATRIZ: Record<Impacto, [string, string, string]> = {
  Alto: [ESTA, PROG, PROG],
  Medio: [ESTA, PROG, SOBRA],
  Bajo: [SOBRA, APLAZAR, APLAZAR],
};
const URGENCIAS: Urgencia[] = ["Alta", "Media", "Baja"];
const prioridadDe = (imp: Impacto, urg: Urgencia) => MATRIZ[imp][URGENCIAS.indexOf(urg)];

/* los 25 pendientes (lo que Ana escribió) y lo que la IA propone */
type Tarea = {
  id: string;
  t: string; // la tarea, en una acción
  aclara?: string; // lo que Ana añadió al escribirla
  nota?: string; // cómo escribió la fecha
  fecha?: string;
  min?: number;
  cat: string;
  imp: Impacto;
  porque: string;
  dep?: string;
  resp: Persona;
  rep?: "Semanal" | "Mensual";
};
const TAREAS: Tarea[] = [
  { id: "T01", t: "Pagar la factura del detergente", nota: "vence el", fecha: "2026-09-24", min: 15, cat: "Dinero", imp: "Alto", porque: "vence el 24", resp: "Ana" },
  { id: "T02", t: "Llamar al técnico por la secadora 2", aclara: "que hace ruido", min: 10, cat: "Equipos", imp: "Medio", porque: "puede fallar; sin fecha", resp: "Luis" },
  { id: "T03", t: "Contestar los 6 mensajes de WhatsApp sin responder", nota: "para el", fecha: "2026-09-21", min: 30, cat: "Clientes", imp: "Alto", porque: "clientes sin respuesta", resp: "Marta" },
  { id: "T04", t: "Decidir cuánto subir los precios", aclara: "que no cambian hace un año", nota: "antes del", fecha: "2026-09-30", min: 45, cat: "Dinero", imp: "Alto", porque: "un año sin subir precios", resp: "Ana" },
  { id: "T05", t: "Imprimir la lista de precios nueva", nota: "para el", fecha: "2026-10-05", min: 20, cat: "Clientes", imp: "Medio", porque: "tiene fecha; nada se pierde por un día", dep: "T04", resp: "Marta" },
  { id: "T06", t: "Buscar a alguien que ayude los sábados", nota: "para el", fecha: "2026-10-15", cat: "Personal", imp: "Medio", porque: "tiene fecha; hoy no se pierde nada", resp: "Ana" },
  { id: "T07", t: "Cambiar el letrero de la fachada", aclara: "que se ve viejo", cat: "Mejoras", imp: "Bajo", porque: "mejora estética; nada se pierde si espera", resp: "Luis" },
  { id: "T08", t: "Limpiar los filtros de las secadoras", aclara: "cada semana", min: 20, cat: "Equipos", imp: "Medio", porque: "mantenimiento de las secadoras", resp: "Marta", rep: "Semanal" },
  { id: "T09", t: "Revisar el stock de detergente y suavizante", aclara: "cada semana", min: 15, cat: "Insumos", imp: "Medio", porque: "evita quedarse sin insumos", resp: "Marta", rep: "Semanal" },
  { id: "T10", t: "Pagar el alquiler del local", aclara: "cada mes", nota: "el próximo", fecha: "2026-10-05", min: 10, cat: "Dinero", imp: "Alto", porque: "pago del alquiler", resp: "Ana", rep: "Mensual" },
  { id: "T11", t: "Comparar precios de una secadora nueva", min: 60, cat: "Equipos", imp: "Bajo", porque: "sin fecha ni consecuencia", resp: "Luis" },
  { id: "T12", t: "Responder la reseña de 2 estrellas en Google", nota: "antes del", fecha: "2026-09-25", min: 20, cat: "Clientes", imp: "Medio", porque: "reseña visible con plazo", resp: "Ana" },
  { id: "T13", t: "Ordenar el cuarto de atrás", min: 90, cat: "Mejoras", imp: "Bajo", porque: "orden interno", resp: "Marta" },
  { id: "T14", t: "Actualizar la lista de clientes frecuentes", min: 45, cat: "Clientes", imp: "Bajo", porque: "mejora interna", resp: "Marta" },
  { id: "T15", t: "Renovar el permiso del local", nota: "vence el", fecha: "2026-10-30", min: 60, cat: "Dinero", imp: "Alto", porque: "el permiso vence", resp: "Ana" },
  { id: "T16", t: "Comprar bolsas y ganchos", nota: "antes del", fecha: "2026-09-26", min: 30, cat: "Insumos", imp: "Medio", porque: "faltan insumos si no llegan", resp: "Luis" },
  { id: "T17", t: "Preparar el cartel de horarios del feriado", nota: "para el", fecha: "2026-10-01", min: 20, cat: "Clientes", imp: "Medio", porque: "aviso a clientes con fecha", resp: "Marta" },
  { id: "T18", t: "Hablar con el contador sobre el IVA", nota: "antes del", fecha: "2026-09-28", min: 30, cat: "Dinero", imp: "Alto", porque: "trámite con fecha", resp: "Ana" },
  { id: "T19", t: "Arreglar la puerta del baño de clientes", aclara: "que no cierra bien", cat: "Equipos", imp: "Medio", porque: "los clientes usan el baño", resp: "Luis" },
  { id: "T20", t: "Crear una cuenta de Instagram del negocio", min: 40, cat: "Clientes", imp: "Bajo", porque: "mejora sin fecha", resp: "Marta" },
  { id: "T21", t: "Revisar las mangueras de las lavadoras", nota: "antes del", fecha: "2026-10-10", min: 30, cat: "Equipos", imp: "Medio", porque: "prevención con fecha", resp: "Luis" },
  { id: "T22", t: "Escribir cómo se lava lo delicado", min: 60, cat: "Personal", imp: "Medio", porque: "evita errores con lo delicado", resp: "Marta" },
  { id: "T23", t: "Hacer una copia de llaves para Marta", nota: "para el", fecha: "2026-10-01", min: 20, cat: "Personal", imp: "Bajo", porque: "tiene fecha; sin consecuencias", resp: "Luis" },
  { id: "T24", t: "Elegir el color para pintar el mostrador", min: 15, cat: "Mejoras", imp: "Bajo", porque: "decisión pequeña", resp: "Ana" },
  { id: "T25", t: "Comprar la pintura del mostrador", aclara: "cuando decida el color", min: 30, cat: "Mejoras", imp: "Bajo", porque: "espera al color", dep: "T24", resp: "Luis" },
];
const raw = (x: Tarea) => `${x.id} ${x.t}${x.aclara ? `, ${x.aclara}` : ""}${x.fecha ? `, ${x.nota} ${largo(x.fecha)}` : ""}${x.min ? ` (${x.min} min)` : ""}`;
const dias = (x: Tarea) => (x.fecha ? dif(x.fecha) : null);
const prioridad = (x: Tarea) => (x.rep === "Semanal" ? RUTINA : prioridadDe(x.imp, urgencia(dias(x))));
const conMin = (x: Tarea) => x.min !== undefined;
const TOTAL_MIN = suma(TAREAS.filter(conMin).map((x) => x.min!));
const SIN_MIN = TAREAS.filter((x) => !conMin(x)).map((x) => x.id);
const ids = (l: Tarea[]) => l.map((x) => x.id).join(", ");

/* la primera tabla de la IA: dos cosas que revisar (T07 con impacto de más, T05 sin su dependencia) */
const PRIMERA = TAREAS.map((x) => ({
  ...x,
  ...(x.id === "T07" ? { imp: "Alto" as Impacto, porque: "mejora la imagen del local" } : {}),
  ...(x.id === "T05" ? { dep: undefined } : {}),
}));
const COL_TABLA = ["ID", "Tarea", "Categoría", "Impacto y por qué", "Fecha límite", "Minutos", "Depende de", "Responsable", "Repite"];
const filaTabla = (x: Tarea) => [
  x.id, x.t, x.cat, `${x.imp}: ${x.porque}`, x.fecha ? corto(x.fecha) : "[FALTA]", x.min !== undefined ? String(x.min) : "[FALTA]", x.dep ?? "—", x.resp, x.rep ?? "—",
];
const CELDA = (x: Tarea, col: number) => `${x.id} · ${COL_TABLA[col]}: ${filaTabla(x)[col]}`;
const t05 = TAREAS[4], t07 = TAREAS[6];
const p05 = PRIMERA[4], p07 = PRIMERA[6];
const CAMBIOS = [
  [CELDA(p07, 3), CELDA(t07, 3), "Mi texto no dice qué se pierde: por la definición es Bajo."],
  [CELDA(p05, 6), CELDA(t05, 6), "La lista de precios nueva se imprime cuando T04 decide el aumento."],
];
const PROBLEMAS_TXT = `1) ${p07.id} tiene impacto Alto, pero mi texto no dice que se pierda nada. 2) ${t05.id} depende de ${t05.dep}: no se imprime la lista antes de decidir los precios.`;

/* prioridad calculada por la hoja */
const GRUPOS = [ESTA, RUTINA, PROG, SOBRA, APLAZAR];
const grupo = (g: string) => TAREAS.filter((x) => prioridad(x) === g);
const minutos = (l: Tarea[]) => suma(l.filter(conMin).map((x) => x.min!));
const FILAS_PRIORIDAD = [
  ...GRUPOS.map((g) => [g, ids(grupo(g)), String(minutos(grupo(g)))]),
  ["Total", `${TAREAS.length} tareas`, String(TOTAL_MIN)],
];

/* plan de la semana: primer día en que cabe, con las reglas del prompt */
const ORDEN_PLAN = [ESTA, RUTINA, PROG, SOBRA];
type Fila = { dia: number; p: Persona; x: Tarea };
const candidatas = TAREAS.filter((x) => ORDEN_PLAN.includes(prioridad(x)) && conMin(x)).sort(
  (a, b) => ORDEN_PLAN.indexOf(prioridad(a)) - ORDEN_PLAN.indexOf(prioridad(b)) || (a.fecha ?? "9999").localeCompare(b.fecha ?? "9999") || a.id.localeCompare(b.id),
);
const usado: Record<Persona, number[]> = { Ana: [0, 0, 0, 0, 0], Luis: [0, 0, 0, 0, 0], Marta: [0, 0, 0, 0, 0] };
const colocado: Record<string, number> = {};
const PLAN: Fila[] = [];
const NO_CABE: [string, string][] = [];
for (const x of candidatas) {
  const limite = x.fecha && dif(x.fecha) <= 4 ? dif(x.fecha) : 4;
  const desde = x.dep && colocado[x.dep] !== undefined ? colocado[x.dep] + 1 : 0;
  let d = -1;
  for (let i = desde; i <= limite; i++) {
    if (DISP[x.resp][i] - usado[x.resp][i] >= x.min!) {
      d = i;
      break;
    }
  }
  if (d < 0) {
    const tope = Math.max(...DISP[x.resp]);
    NO_CABE.push([x.id, x.min! > tope ? `Dura ${x.min} minutos y ${x.resp} tiene como máximo ${tope} en un día.` : "No hay hueco antes de su fecha."]);
  } else {
    usado[x.resp][d] += x.min!;
    colocado[x.id] = d;
    PLAN.push({ dia: d, p: x.resp, x });
  }
}
PLAN.sort((a, b) => a.dia - b.dia || PERSONAS.indexOf(a.p) - PERSONAS.indexOf(b.p));
const MIN_PLAN = suma(PLAN.map((f) => f.x.min!));
const FILAS_PLAN = PLAN.map((f) => [DIA_TXT(f.dia), f.p, f.x.id, f.x.t, String(f.x.min)]);
const FILAS_CONTROL = PERSONAS.map((p) => [
  p, String(suma(usado[p])), String(suma(DISP[p])),
  DISP[p].map((d, i) => (d > 0 && usado[p][i] === d ? DIAS[i] : "")).filter(Boolean).join(" y ") || "—",
  String(suma(usado[p].map((u, i) => Math.max(0, u - DISP[p][i])))),
]);

/* la hoja: cuentas y fórmulas */
const CUENTAS: [celda: string, que: string, texto: string][] = [
  ["Tareas!J2:J26", "Días hasta la fecha", "la fecha límite menos la fecha de referencia de Reglas!B1; vacío si no hay fecha"],
  ["Tareas!K2:K26", "Urgencia", `Alta si faltan ${URG_ALTA} días o menos, Media si faltan de ${URG_ALTA + 1} a ${URG_MEDIA}, Baja si faltan más de ${URG_MEDIA} o no hay fecha`],
  ["Tareas!L2:L26", "Prioridad", "«Rutina» si la tarea se repite cada semana; si no, la que dice la tabla de Reglas!A4:B12 para su impacto y su urgencia"],
  ["Tareas!F27", "Minutos con dato", `la suma de los minutos de las ${TAREAS.length} tareas`],
  ["Tareas!F28", "Tareas sin minutos", "cuántas celdas de minutos están vacías"],
  ["Capacidad!G2:G4", "Total disponible de cada persona", "la suma de sus cinco días"],
  ["Capacidad!B7:F9", "Minutos planificados de una persona en un día", "la suma de los minutos de la hoja Plan con esa persona y ese día"],
  ["Capacidad!B11:F13", "Exceso", "los minutos planificados menos los disponibles, y 0 si no hay exceso"],
];
const LISTA_CUENTAS = CUENTAS.map(([c, q, t], i) => `${i + 1}. ${q} (${c}): ${t}.`).join("\n");
const ARGS_SUMIFS = ["Plan!$E:$E", "Plan!$B:$B", "$A7", "Plan!$A:$A", "B$6"];
const FORMULAS: { es: string; en: string; prueba: string }[] = [
  { es: '=SI(E2="";"";E2-Reglas!$B$1)', en: '=IF(E2="","",E2-Reglas!$B$1)', prueba: "Fecha 24 y referencia 21: 3. Sin fecha: vacío" },
  {
    es: `=SI(J2="";"Baja";SI(J2<=${URG_ALTA};"Alta";SI(J2<=${URG_MEDIA};"Media";"Baja")))`,
    en: `=IF(J2="","Baja",IF(J2<=${URG_ALTA},"Alta",IF(J2<=${URG_MEDIA},"Media","Baja")))`,
    prueba: `3 días: Alta. 9 días: Media. 39 días o vacío: Baja`,
  },
  {
    es: '=SI(I2="Semanal";"Rutina";BUSCARV(D2&"|"&K2;Reglas!$A$4:$B$12;2;FALSO))',
    en: '=IF(I2="Semanal","Rutina",VLOOKUP(D2&"|"&K2,Reglas!$A$4:$B$12,2,FALSE))',
    prueba: "Alto y Alta: Esta semana. Medio y Baja: Si sobra. Semanal: Rutina",
  },
  { es: "=SUMA(F2:F26)", en: "=SUM(F2:F26)", prueba: "15, 10 y una celda vacía: 25" },
  { es: "=CONTAR.BLANCO(F2:F26)", en: "=COUNTBLANK(F2:F26)", prueba: "Tres celdas vacías: 3" },
  { es: "=SUMA(B2:F2)", en: "=SUM(B2:F2)", prueba: "45 cinco veces: 225" },
  {
    es: `=SUMAR.SI.CONJUNTO(${ARGS_SUMIFS.join(";")})`,
    en: `=SUMIFS(${ARGS_SUMIFS.join(",")})`,
    prueba: "Ana el lunes con tareas de 15, 20 y 10: 45",
  },
  { es: "=MAX(0;B7-B2)", en: "=MAX(0,B7-B2)", prueba: "60 planificados y 45 disponibles: 15. 40 y 45: 0" },
];

/* rúbrica */
const CRITERIOS = [
  { id: "origen", label: "Cada fila es una tarea tuya", detail: "Conserva tus ids, una acción por fila y ninguna tarea nueva." },
  { id: "datos", label: "No inventa fechas ni minutos", detail: "Copia lo que escribiste; lo que falta queda como [FALTA]." },
  { id: "impacto", label: "El impacto sale de tu texto", detail: "Cada impacto se justifica con lo que se pierde, según tus definiciones." },
  { id: "dependencias", label: "Encuentra lo que depende de otra tarea", detail: "Marca lo que no se puede hacer antes que otra tarea." },
  { id: "responsables", label: "Asigna solo lo que cada persona puede hacer", detail: "Usa solo tu lista de personas." },
  { id: "limites", label: "No decide por ti", detail: "No calcula prioridades ni arma el plan: eso se hace en tu hoja." },
] as const;
const RESULTADOS = [
  { min: 0, label: "No usar todavía", advice: "Fallan varios criterios: corrige con el prompt de ajuste o revisa tu lista." },
  { min: 7, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado antes de pasarla a la hoja." },
  { min: 11, label: "Lista para la hoja", advice: "Cumple casi todo: pásala a la hoja para calcular la prioridad." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { origen: 2, datos: 2, impacto: 1, dependencias: 1, responsables: 2, limites: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

/* pedido ingenuo (ilustrativo) */
const LUIS_MAR = ["T02", "T16", "T21", "T11"].map((i) => TAREAS.find((x) => x.id === i)!);
const MIN_LUIS_MAR = suma(LUIS_MAR.map((x) => x.min!));

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "organizar-tareas-del-negocio-con-ia",
    category: "negocio",
    title: "Organizar las tareas de tu negocio con IA",
    description: "Convierte una lista de pendientes desordenada en prioridades, categorías, responsables, fechas y tareas recurrentes, ajustadas al tiempo que tienes.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["estrategia-planificacion", "numeros-datos"],
    estandarGuia: 3,
    handlesNumbers: true,
    activoOriginal:
      "Matriz de prioridad (impacto por urgencia), plantilla de hoja con fórmulas en español e inglés, plan de la semana con comprobación de minutos y rúbrica de seis criterios con dos bloqueos",
    problem: "Tienes una lista de pendientes desordenada y no sabes qué hacer primero ni cuánto cabe en tu semana.",
    whyThisPage:
      "Da criterios explícitos de priorización y enseña a darle contexto real (horas, personas) para que el plan sea realizable; sirve de base al sistema diario de trabajo.",
    relatedGuides: ["calendario-de-contenido-con-ia", "responder-consultas-de-clientes-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Convierte tus pendientes en una tabla, calcula la prioridad con una regla tuya y arma una semana que cabe en las horas que tienes.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Unas dos horas la primera vez; con la hoja armada, unos 20 minutos cada lunes",
    needs: ["Un asistente de IA de chat", "Una hoja de cálculo", "Tu lista de pendientes, aunque esté desordenada", "Los minutos de cada persona por día"],
    result: "Una tabla de pendientes ordenada, su prioridad calculada y un plan de la semana comprobado",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el camino: una lista desordenada, una tabla con prioridad calculada y una semana que cabe.",
      description:
        "Tres bloques de izquierda a derecha: notas sueltas de pendientes, una tabla con columnas de impacto, fecha y responsable y un calendario de cinco días con tareas repartidas entre tres personas. Datos ficticios de un negocio inventado. Sin logos ni nombres reales.",
      alt: "Notas de pendientes, una tabla con prioridad y un plan semanal repartido entre tres personas.",
      caption: "De una lista desordenada a una semana que cabe.",
    }),
    lista: slot("lista-de-pendientes.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Muestra la lista de pendientes tal como sale, numerada, con fechas y minutos solo donde se saben.",
      description:
        "La lista de 25 pendientes numerados de T01 a T25 escritos a mano, con la fecha y los minutos donde existen y tres líneas sin minutos resaltadas. A un lado, los minutos disponibles de tres personas por día. Caso ficticio.",
      alt: "Lista numerada de pendientes con fechas y minutos, junto a la disponibilidad de tres personas.",
      caption: "La lista, tal como sale.",
      zoom: true,
    }),
    hoja: slot("hoja-con-prioridad.webp", {
      section: "hoja",
      ratio: "16/9",
      purpose: "Enseña la hoja de Tareas con las tres columnas calculadas y la tabla de Reglas.",
      description:
        "Captura de la hoja Tareas con las columnas de la A a la L, resaltando Días hasta la fecha, Urgencia y Prioridad, y al lado la hoja Reglas con la fecha de referencia y la tabla de nueve pares. Datos ficticios, sin información personal.",
      alt: "Hoja de cálculo con tareas y tres columnas calculadas: días, urgencia y prioridad.",
      caption: "La hoja calcula la prioridad.",
      zoom: true,
    }),
    primerResultado: slot("primera-tabla.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver la primera tabla y localizar las dos celdas que hay que revisar.",
      description:
        "La tabla de 25 filas con dos celdas resaltadas: el impacto Alto del letrero (T07) y la dependencia vacía de la lista de precios (T05). Al lado, tres celdas con [FALTA]. Caso ficticio.",
      alt: "Tabla de pendientes con dos celdas resaltadas para revisar y tres marcadas como [FALTA].",
      caption: "La primera tabla, con dos cosas que revisar.",
      zoom: true,
    }),
    contraste: slot("contraste-con-la-lista.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar la tabla con tu lista original y con las definiciones de impacto.",
      description:
        "La lista original a la izquierda y la tabla a la derecha, con líneas que unen cada fila con su texto; en rojo T07 frente a la definición de impacto Alto. Debajo, la rúbrica puntuada (10 de 12). Caso ficticio.",
      alt: "Lista original y tabla de la IA conectadas fila a fila, con la rúbrica puntuada.",
      caption: "Cada fila, contra tu texto.",
      zoom: true,
    }),
    plan: slot("plan-de-la-semana.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Muestra el plan de la semana y la comprobación de minutos por persona y día.",
      description:
        "Un calendario de lunes a viernes con las tareas repartidas entre tres personas y, debajo, la hoja Capacidad con los minutos planificados, los disponibles y el exceso en cero. Resaltar los días al límite. Caso ficticio.",
      alt: "Plan semanal de tres personas con la comprobación de minutos planificados y disponibles.",
      caption: "El plan, comprobado con sumas.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "hoja",
      ratio: "16/9",
      promptId: "formulas",
      purpose: "Prueba real del prompt de fórmulas: la tabla de fórmulas y su comprobación con números de práctica.",
      description:
        "Captura de la tabla de fórmulas y de «Cómo pegarla». Usa la descripción de hojas y columnas del caso, sin ninguna tarea. Comprueba aparte cada fórmula con los números de práctica. Ocultar datos personales y de cuenta.",
      alt: "Captura de fórmulas de una hoja de tareas devueltas por un asistente.",
      caption: "Prueba del prompt de fórmulas.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "ordenar",
      purpose: "Prueba real del prompt de ordenar: la tabla de tareas y «FALTA».",
      description:
        "Captura de la tabla y de «FALTA». Usa la lista, las personas y las categorías del caso (o las tuyas, sin datos de clientes). Comprueba aparte que ninguna fecha ni minutos sean inventados. Ocultar datos personales y de cuenta.",
      alt: "Captura de una lista de pendientes convertida en tabla por un asistente.",
      caption: "Prueba del prompt de ordenar.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una tabla de pendientes con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "semana",
      purpose: "Prueba real del prompt de semana: el plan, lo que no cabe y lo que falta.",
      description:
        "Captura de la tabla del plan, de «No cabe esta semana» y de «Falta un dato». Usa la tabla con prioridad y la disponibilidad del caso. Comprueba aparte, con SUMAR.SI.CONJUNTO, que nadie supera su disponibilidad. Ocultar datos personales y de cuenta.",
      alt: "Captura de un plan semanal devuelto por un asistente, con lo que no cabe.",
      caption: "Prueba del prompt de semana.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Casi todos los negocios pequeños viven con una lista de pendientes que crece: notas sueltas, mensajes y cosas que solo tú recuerdas. Sin un criterio, se hace primero lo que hace más ruido, y lo que de verdad pesa (un pago, un permiso, una respuesta a un cliente) espera.\n\nLa IA parece resolverlo: pegas la lista y devuelve un orden con buena pinta. El riesgo es doble: ordena con criterios que tú no elegiste, y arma una semana que puede no caber en tus horas, porque puede equivocarse al sumar y no sabe cuánto tiempo te queda.\n\n**La IA ordena y propone; la hoja calcula la prioridad y las horas, y tú decides qué entra en tu semana.**",
    symptoms: [
      "Tienes pendientes en notas, mensajes y en la cabeza, y no sabes cuántos son.",
      "Haces lo que llega primero y lo importante espera.",
      "Una IA te dio un plan que no cabía en tu semana.",
      "Lo que se repite se te olvida, y nadie más sabe qué toca.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con tus pendientes ordenados por reglas que tú fijaste y con una semana que cabe en las horas que tienes.",
    deliverables: [
      { label: "Una tabla completa", detail: "Con impacto, fecha, minutos, dependencias y responsable de cada pendiente." },
      { label: "Una prioridad calculada", detail: "Con una regla escrita, no con una sensación." },
      { label: "Un plan de la semana", detail: "Por persona y día, con minutos comprobados." },
      { label: "Una rúbrica de seis criterios", detail: "Para revisar cualquier tabla de una IA." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes más pendientes de los que caben en tu semana.",
      "Trabajas solo o con pocas personas, por ejemplo familia y un empleado.",
      "Sabes sumar en una hoja de cálculo, o estás dispuesto a aprender.",
    ],
    notForWho: [
      "Buscas una aplicación que te avise y te recuerde: esto es un método, no una herramienta.",
      "Tu equipo es grande y tiene procesos formales de proyectos.",
      "Esperas que la IA decida qué es importante para tu negocio: eso lo decides tú.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: NEGOCIO,
    situation:
      "Ana lleva una lavandería con su hermano Luis, que ayuda dos días, y con Marta, que trabaja jornada completa. Tiene 25 pendientes en notas y mensajes, y casi ninguna hora libre. Todo es inventado.",
    goal: "Saber qué hacer esta semana y qué dejar para después, sin pasarse de las horas que tiene cada persona.",
    data: [
      { label: "Pendientes", value: `${TAREAS.length}, escritos tal como salieron` },
      { label: "Capacidad de la semana", value: `${CAP_TOTAL} minutos entre las tres personas` },
      { label: "Lo que no sabe", value: `Cuánto tardan ${SIN_MIN.length} de ellos` },
    ],
    problem: "Los pendientes suman más minutos de los que caben, y sin un criterio todo parece urgente.",
    application: "Ordena la lista, calcula la prioridad con una regla y pide un plan que respete las horas de cada uno.",
    result: `Una semana con ${PLAN.length} tareas y ${MIN_PLAN} de ${CAP_TOTAL} minutos; el resto, con su motivo.`,
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan el camino hasta una semana realizable.",
    blocks: [
      {
        title: "Una tarea es una acción con un final claro",
        detail: "Se puede tachar. Un objetivo grande se parte en tareas que alguien pueda terminar.",
        example: "«Mejorar la atención» no se tacha; «contestar los 6 mensajes de hoy» sí.",
      },
      {
        title: "La prioridad sale de una regla",
        detail: "Se cruzan qué se pierde si no se hace (impacto) y cuánto falta para su fecha (urgencia). La fecha la pones tú; la IA solo propone el impacto y cita tu texto.",
      },
      {
        title: "Cabe lo que cabe",
        detail: "Cada persona tiene minutos limitados. Lo que no cabe se parte o se aplaza; no se comprime.",
      },
      {
        title: "Lo que se repite se reserva primero",
        detail: "Lo que vuelve cada semana o cada mes se anota una vez y su tiempo se aparta primero.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Organízame estos pendientes por prioridad y hazme el plan de la semana.",
    whyInsufficient:
      "La IA no sabe qué pierdes si algo no se hace, cuántas horas tiene cada persona ni qué fechas son firmes. Ordena con sus criterios y arma el plan con seguridad, aunque puede equivocarse al sumar.",
    issues: [
      "No dice con qué criterio ordena: la prioridad es suya, no tuya.",
      "No conoce las horas de cada persona.",
      "Mezcla ordenar y planificar en un solo paso: nada queda por comprobar.",
      "No marca lo que falta: rellena fechas y minutos con lo razonable.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Antes de abrir la IA, reúne tres cosas en un solo lugar.",
    items: [
      { label: "Tus pendientes, tal como salen", detail: "Notas, mensajes y lo que recuerdas, en una lista numerada (T01, T02…); fecha y minutos solo si los sabes.", required: true },
      { label: "La capacidad de la semana", detail: "Minutos por día de cada persona para pendientes, tras su trabajo normal.", required: true },
      { label: "Qué puede hacer cada persona", detail: "Para proponer responsables solo entre quienes pueden hacer cada cosa.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribe la IA y lo que dicen tus datos",
      purpose: "Ver cómo un pedido sin reglas produce un plan imposible de comprobar.",
      columns: ["Frase de la IA", "Lo que dicen tus datos"],
      rows: [
        ["«Todo cabe esta semana.»", `Los pendientes con minutos suman ${TOTAL_MIN} y tu capacidad es de ${CAP_TOTAL}.`],
        [`«El martes, Luis hace ${LUIS_MAR.map((x) => x.id).join(", ")}.»`, `Esas cuatro suman ${MIN_LUIS_MAR} minutos y Luis tiene ${DISP.Luis[1]} el martes.`],
        ["«Prioridad 1: cambiar el letrero de la fachada.»", "Tu texto no dice que se pierda nada, y no tiene fecha."],
        [`«Imprimir la lista de precios (${t05.id}) el lunes y decidir los precios (${t05.dep}) el viernes.»`, `No se imprime una lista antes de decidir los precios: ${t05.id} depende de ${t05.dep}.`],
      ],
      note: "Ejemplo ilustrativo.",
    },
    lista: {
      caption: "Los pendientes de Ana, tal como los escribió",
      purpose: "Ver una lista sin ordenar, con fechas y minutos solo donde se saben.",
      columns: ["ID", "Pendiente"],
      rows: TAREAS.map((x) => [x.id, raw(x).slice(x.id.length + 1)]),
      note: "Caso ficticio. Sin ordenar: es lo que se le da a la IA.",
    },
    disponibilidad: {
      caption: "Capacidad de la semana: minutos por día para pendientes",
      purpose: "Tener el límite de cada persona antes de planificar.",
      columns: ["Persona", ...DIAS, "Total"],
      rows: [
        ["Ana (dueña)", ...DISP.Ana.map(String), String(suma(DISP.Ana))],
        ["Luis (hermano)", ...DISP.Luis.map(String), String(suma(DISP.Luis))],
        ["Marta (empleada)", ...DISP.Marta.map(String), String(suma(DISP.Marta))],
      ],
      copyable: true,
      note: `Minutos inventados para el caso. Suman ${CAP_TOTAL}.`,
    },
    matriz: {
      caption: "Matriz de prioridad: impacto por urgencia",
      purpose: "Decidir la prioridad de cada tarea con la misma regla.",
      columns: ["Impacto", "Qué significa", "Urgencia Alta", "Urgencia Media", "Urgencia Baja"],
      rows: (Object.keys(IMPACTOS) as Impacto[]).map((k) => [k, IMPACTOS[k], ...MATRIZ[k]]),
      copyable: true,
      note: `Urgencia Alta: la fecha límite está a ${URG_ALTA} días o menos. Media: de ${URG_ALTA + 1} a ${URG_MEDIA}. Baja: más de ${URG_MEDIA} o sin fecha. Lo que se repite cada semana es «${RUTINA}» y no pasa por la matriz.`,
    },
    plantilla: {
      caption: "Plantilla de la hoja",
      purpose: "Saber qué va en cada hoja y en cada celda.",
      columns: ["Hoja y celdas", "Contenido"],
      rows: [
        ["Reglas!B1", "La fecha de referencia: el lunes de la semana"],
        ["Reglas!A4:B12", "Nueve pares de impacto y urgencia, como «Alto|Alta», y su prioridad"],
        ["Tareas!A1:L1", `Encabezados: ${COL_TABLA.join(", ")}, Días hasta la fecha, Urgencia y Prioridad`],
        ["Tareas!A2:I26", "Una fila por pendiente, con lo que devolvió la IA; J a L se calculan"],
        ["Tareas!F27:F28", "Total de minutos con dato y tareas sin minutos"],
        ["Capacidad!A1:G4", "Minutos disponibles por persona y día, y su total"],
        ["Capacidad!A6:F13", "Minutos planificados (filas 7 a 9) y exceso (11 a 13)"],
        ["Plan!A1:E1", "Encabezados: Día, Persona, ID, Tarea, Minutos"],
      ],
      copyable: true,
    },
    hoja: {
      caption: "Las fórmulas de la hoja, en español y en inglés",
      purpose: "Saber qué escribir en cada celda y cómo probarla con números de práctica.",
      columns: ["Celda", "Qué calcula", "Fórmula en español", "Fórmula en inglés", "Comprobación con números de práctica"],
      rows: FORMULAS.map((f, i) => [CUENTAS[i][0].split(":")[0], CUENTAS[i][1], f.es, f.en, f.prueba]),
      copyable: true,
      note: "Ejemplo generado. Según tu región, los argumentos se separan con punto y coma o con coma.",
    },
    prioridad: {
      caption: "Prioridad calculada por la hoja",
      purpose: "Ver las 25 tareas tras aplicar la regla y el tiempo de cada grupo.",
      columns: ["Prioridad", "Tareas", "Minutos con dato"],
      rows: FILAS_PRIORIDAD,
      note: `Calculado en la hoja sobre la tabla corregida. Las tareas sin minutos (${SIN_MIN.join(", ")}) no suman.`,
    },
    plan: {
      caption: "Plan de la semana",
      purpose: "Ver una semana repartida que respeta la capacidad de cada día.",
      columns: ["Día", "Persona", "ID", "Tarea", "Minutos"],
      rows: FILAS_PLAN,
      note: "Ejemplo generado.",
    },
    control: {
      caption: "Comprobación en la hoja: minutos planificados y disponibles",
      purpose: "Comprobar con una suma que nadie supera su tiempo.",
      columns: ["Persona", "Planificado", "Disponible", "Días al límite", "Exceso"],
      rows: FILAS_CONTROL,
      note: "«Días al límite»: días en que se usan todos los minutos.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cuatro de los siete pasos llevan un prompt. Los otros tres los haces tú.",
    steps: [
      { title: "Junta tus pendientes y tu capacidad", description: "Escribe todo tal como sale, numéralo y anota los minutos que cada persona tiene por día.", output: "Una lista y una tabla de capacidad." },
      { title: "Arma la hoja", description: "Copia la plantilla y pide las fórmulas describiendo solo tus columnas, sin pegar tus tareas.", output: "Una hoja con fórmulas probadas." },
      { title: "Pide la tabla ordenada", description: "Entrega la lista y pide categoría, impacto con su porqué, fechas, minutos, dependencias y responsable, sin inventar nada.", output: "Una tabla de pendientes." },
      { title: "Contrasta y corrige", description: "Compara cada fila con tu texto, puntúa con la rúbrica y pide cambiar solo lo señalado.", output: "Una tabla corregida." },
      { title: "Calcula la prioridad", description: "Pega la tabla en la hoja: la urgencia y la prioridad salen de las fórmulas, no de la IA.", output: "Cada tarea con su prioridad." },
      { title: "Pide el plan de la semana", description: "Entrega la tabla con prioridad y tu capacidad, y pide un reparto que respete cada día.", output: "Un plan por persona y día." },
      { title: "Comprueba las sumas y decide", description: "Suma los minutos de cada persona por día en la hoja y decide qué entra en tu semana.", output: "Una semana comprobada." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    formulas: {
      title: "Prompt de fórmulas: armar tu hoja sin compartir tus tareas",
      objective: "Obtener las fórmulas de tu hoja a partir de la descripción de tus columnas, sin pegar ninguna tarea.",
      whenToUse: "Cuando armas la hoja tú mismo o adaptas la plantilla a tus columnas.",
      variables: [
        { name: "PROGRAMA", description: "La hoja de cálculo que usas.", example: "Google Sheets" },
        {
          name: "COLUMNAS_Y_CELDAS",
          description: "Cada hoja, columna o bloque y lo que contiene.",
          example:
            "Tareas: A a I con los datos de cada tarea (fecha límite en E, minutos en F, repite en I), J a L calculadas, filas 2 a 26 · Reglas: fecha en B1, tabla en A4:B12 · Capacidad: personas en A2:A4, días en B1:F1 y B6:F6 · Plan: A día, B persona, C id, D tarea, E minutos",
        },
      ],
      prompt: `Actúa como asistente de hojas de cálculo para una persona que apenas empieza y que escribirá cada fórmula por su cuenta. Tu objetivo es proponerle las fórmulas de una hoja de tareas y de su comprobación de minutos, usando solo la descripción de sus hojas y columnas, sin ver ninguna tarea.

### CONTEXTO
Programa: {{PROGRAMA}}

### DATOS
Cómo están armadas mis hojas (hoja, columna o bloque y lo que contiene):
{{COLUMNAS_Y_CELDAS}}

### CUENTAS QUE NECESITO
${LISTA_CUENTAS}

### REGLAS
1. Trabaja solo con las hojas y columnas que describí. Si para una cuenta falta una, escribe [FALTA: la columna] y no la crees.
2. No me pidas mis tareas. Para probar cada fórmula usa números de práctica que pueda resolver mentalmente.
3. Da cada fórmula con las funciones en español y en inglés, y recuérdame que el separador de argumentos depende de la región.
4. Fija con signos de dólar las celdas y los rangos que no deben moverse al copiar, y dime cuáles.
5. Separa lo que sale de mi descripción de lo que supones tú, y marca cada suposición «SUPUESTO».

### FORMATO DE SALIDA
Una tabla de columnas fijas: Celda | Qué calcula | Fórmula en español | Fórmula en inglés | Comprobación con números de práctica. Debajo, «Cómo pegarla», con el lugar de cada fórmula. La tabla fija la forma; el contenido sale de mis columnas.

### ANTES DE RESPONDER
Verifica que: cada fórmula responde a la cuenta escrita; la comprobación con números de práctica es correcta (haz la cuenta dos veces); no usaste columnas que no describí; los rangos fijos están marcados; una fecha vacía no produce un número; toda suposición está señalada. Corrige lo que falle.`,
      explanation: [
        { part: "sin ver ninguna tarea.", why: "Le describes la estructura y no tus tareas: armas el cálculo sin compartir datos de tu negocio." },
        { part: "usa números de práctica que pueda resolver mentalmente.", why: "Puedes comprobar cada fórmula con cuentas propias antes de usar tus datos." },
        { part: "Fija con signos de dólar las celdas y los rangos que no deben moverse al copiar", why: "Evita que la fórmula se corra al copiarla hacia abajo y lea celdas que no son." },
      ],
      evaluate: "Escribe cada fórmula con los números de práctica: el resultado debe coincidir con tu cuenta a mano.",
      improve: "Si tu programa no reconoce una función, pega su mensaje de error y pide la alternativa.",
    },

    ordenar: {
      title: "Prompt de ordenar: de la lista escrita a una tabla completa",
      objective: "Obtener una tabla con categoría, impacto justificado, fechas, minutos, dependencias, responsable y repetición, sin inventar datos.",
      whenToUse: "Cuando tienes tu lista numerada y la capacidad de cada persona.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: NEGOCIO },
        { name: "PERSONAS", description: "Quién trabaja contigo y qué puede hacer cada uno.", example: PERSONAS_TXT },
        { name: "CATEGORIAS", description: "Las categorías permitidas.", example: CATEGORIAS.join(", ") },
        { name: "PENDIENTES", description: "Tu lista, con un id en cada línea.", example: `${raw(TAREAS[0])}\n…` },
      ],
      prompt: `Actúa como asistente que ordena una lista de pendientes de un negocio pequeño. Tu destinatario es la persona dueña, que fijará las prioridades y el plan. Tu objetivo es convertir mi lista escrita a mano en una tabla completa, sin decidir por mí.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Personas y lo que puede hacer cada una: {{PERSONAS}}
Categorías permitidas: {{CATEGORIAS}}

### DATOS (única fuente)
Mis pendientes, cada uno con su id:
{{PENDIENTES}}

### IMPACTO (según lo que se pierde)
${LISTA_IMPACTO}

### REGLAS
1. Conserva mis ids. Cada fila es una sola acción con un final claro. Si un pendiente mezcla varias, dilo en «FALTA» y no lo partas. No agregues tareas que no escribí.
2. Usa solo las categorías permitidas.
3. Impacto: elige Alto, Medio o Bajo según las definiciones y explica el porqué con mis palabras. Si el texto no dice qué se pierde, no subas el impacto.
4. Fecha límite y minutos: copia solo lo que escribí. Si falta, escribe [FALTA]. No inventes ni estimes.
5. «Depende de»: pon el id de otra tarea solo si mi texto lo dice o lo hace evidente; si no, escribe «—».
6. Responsable: propón solo a alguien de mi lista de personas, según lo que puede hacer. Si nadie encaja, escribe [FALTA].
7. «Repite»: escribe Semanal o Mensual solo si lo escribí; si no, «—».
8. No calcules urgencia ni prioridad, no ordenes las filas y no armes ningún plan: eso lo calculo yo en mi hoja.

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: ${COL_TABLA.join(" | ")}; (2) «FALTA». La tabla fija la forma; el contenido sale de mi lista.

### ANTES DE RESPONDER
Verifica que: hay una fila por cada id y ningún id nuevo; ninguna fecha ni minutos salen de ti; cada impacto cita mis palabras; cada responsable está en mi lista de personas; no calculaste prioridad ni armaste un plan; todo lo que falta está en «FALTA». Corrige lo que no cumpla.`,
      explanation: [
        { part: "Cada fila es una sola acción con un final claro.", why: "Una tarea que se puede terminar se puede planificar y tachar; una vaga no." },
        { part: "Si el texto no dice qué se pierde, no subas el impacto.", why: "Frena la tendencia a marcar todo como importante: el peso lo dan tus definiciones." },
        { part: "No calcules urgencia ni prioridad, no ordenes las filas y no armes ningún plan", why: "Esas cuentas las hace tu hoja con una regla fija; la IA solo prepara los datos." },
      ],
      evaluate: "Compara cada fila con tu línea original: mismas fechas, mismos minutos y ningún id nuevo.",
      improve: "Si aparece un dato que no escribiste, pídele que lo cambie por [FALTA] y rehaga solo esa fila.",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las celdas señaladas, apoyándose en tu texto y tus definiciones, y dejar el resto intacto.",
      whenToUse: "Después de contrastar, cuando la tabla tiene un problema.",
      variables: [
        { name: "PROBLEMAS_DETECTADOS", description: "Lo que hay que corregir y por qué.", example: PROBLEMAS_TXT },
        { name: "NO_TOCAR", description: "Lo que no puede cambiar.", example: "Las demás filas y los ids" },
      ],
      prompt: `Actúa como editor de tablas de pendientes para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, usando mi texto y mis definiciones, y dejar intacto lo demás.

### CONTEXTO
Usa mi lista original, mis personas, mis definiciones de impacto y la tabla de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Problemas que detecté:
{{PROBLEMAS_DETECTADOS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo lo señalado y lo que ese cambio obligue a ajustar. Si obliga a cambiar otra fila, inclúyela en «Cambios».
2. Cada cambio se apoya en mi texto o en las definiciones. No inventes fechas, minutos ni tareas.
3. Si lo que señalé no existe en la tabla, o mi texto no lo respalda, dímelo antes de cambiar nada.
4. En «Motivo» cita mi texto o la definición que justifica el cambio.
5. No calcules prioridad ni armes un plan. Si falta un dato, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla de columnas fijas: Antes | Después | Motivo; (2) «Sin cambios»: lo que no toqué; (3) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada cambio cita mi texto o una definición; las filas que no se pueden tocar están idénticas; no hay fechas, minutos ni tareas nuevos. Corrige lo que no cumpla.`,
      explanation: [
        { part: "Cambia solo lo señalado", why: "Evita que rehaga las filas que ya estaban bien y cambie algo sin que lo notes." },
        { part: "En «Motivo» cita mi texto o la definición que justifica el cambio.", why: "Cada corrección queda con su respaldo y puedes comprobarla." },
        { part: "Si lo que señalé no existe en la tabla, o mi texto no lo respalda, dímelo antes de cambiar nada.", why: "Evita corregir a ciegas algo que tú pudiste señalar mal." },
      ],
      evaluate: "Compara con la tabla anterior: solo deben cambiar las celdas señaladas.",
      improve: "Si toca una fila que no señalaste, pide repetir solo lo señalado.",
    },

    semana: {
      title: "Prompt de semana: un plan que respeta el tiempo de cada uno",
      objective: "Obtener un reparto por persona y día que respete la disponibilidad, las fechas y las dependencias, y decir lo que no cabe.",
      whenToUse: "Cuando tu hoja ya calculó la prioridad y tienes la capacidad de cada persona.",
      variables: [
        { name: "TAREAS", description: "Tu tabla con la prioridad calculada por la hoja, pegada como texto.", example: "T01 · Pagar la factura del detergente · Esta semana · 24 sep · 15 min · Ana…" },
        { name: "DISPONIBILIDAD", description: "Los minutos de cada persona en cada día.", example: "Ana 45 por día · Luis 60 el martes y el jueves · Marta 30 por día" },
        { name: "SEMANA", description: "Los días que planificas.", example: DIAS.map((_, i) => DIA_TXT(i)).join(", ") },
      ],
      prompt: `Actúa como asistente que reparte tareas en una semana para un negocio pequeño. Tu destinatario es la persona dueña, que comprobará las sumas en su hoja. Tu objetivo es un plan que respete el tiempo de cada persona, sin cambiar prioridades, fechas ni minutos.

### CONTEXTO
Semana a planificar: {{SEMANA}}
Minutos disponibles de cada persona en cada día: {{DISPONIBILIDAD}}

### DATOS (única fuente)
Mis tareas, con la prioridad que calculó mi hoja (pégala tal cual):
{{TAREAS}}

### REGLAS
1. Usa solo las tareas de mi tabla, con sus ids. No planifiques las de prioridad Aplazar.
2. Cada tarea la hace su responsable, en un solo día y sin partirla.
3. Ordena el trabajo así: primero Esta semana, luego Rutina, luego Programar con fecha y al final Si sobra. Dentro de cada grupo, primero la fecha límite más cercana. Pon cada tarea en el primer día en que cabe.
4. La suma de minutos de una persona en un día no puede pasar de su disponibilidad. No escribas totales: los calculo yo.
5. Ninguna tarea va después de su fecha límite, y una tarea que depende de otra va en un día posterior al de esa.
6. Las tareas sin minutos no se planifican: van a «Falta un dato».
7. Lo que no cabe va a «No cabe esta semana», con el motivo, en lugar de comprimirlo.
8. No cambies prioridades, fechas ni minutos, y no recomiendes qué tareas eliminar. Si falta información, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: Día | Persona | ID | Tarea | Minutos; (2) «No cabe esta semana»: ID y motivo; (3) «Falta un dato»: ID y qué dato; (4) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: cada tarea planificada aparece una vez y ninguna es de prioridad Aplazar; nadie pasa de su disponibilidad en un día; ninguna tarea va después de su fecha límite; toda tarea con dependencia va en un día posterior; no escribiste totales; lo que quedó fuera está en «No cabe esta semana» o en «Falta un dato». Corrige lo que no cumpla.`,
      explanation: [
        { part: "Pon cada tarea en el primer día en que cabe.", why: "Da un criterio simple que puedes comprobar: si un día anterior tenía hueco, el plan no lo cumple." },
        { part: "No escribas totales: los calculo yo.", why: "Una suma escrita por la IA puede estar mal; tu hoja la calcula y la compara con tu disponibilidad." },
        { part: "Lo que no cabe va a «No cabe esta semana», con el motivo, en lugar de comprimirlo.", why: "Muestra lo que quedó fuera y por qué, en lugar de apretar las tareas hasta que parezcan caber." },
      ],
      evaluate: "Suma los minutos de cada persona y día en tu hoja: ninguno debe pasar de su disponibilidad.",
      improve: "Si una tarea supera lo que una persona tiene en un día, pide dos tareas más pequeñas con final claro.",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de ordenar al caso. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Primera tabla de pendientes, tal como llega",
          purpose: "Tener la tabla en el formato del prompt para contrastarla con la lista original.",
          columns: COL_TABLA,
          rows: PRIMERA.map(filaTabla),
        },
      },
      { type: "text", text: `**FALTA:** los minutos de ${SIN_MIN.join(", ")}.` },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "tabla",
    title: "Puntúa la tabla ordenada de la IA",
    intro:
      `Puntúa la tabla en los seis criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `La tabla parece completa: 25 filas, con sus ids y sus columnas. Se contrasta con tu lista y con las definiciones y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      { criterionId: "origen", verdict: vered("origen"), comment: `Las ${TAREAS.length} filas conservan sus ids y ninguna tarea es nueva.` },
      { criterionId: "datos", verdict: vered("datos"), comment: "Las fechas y los minutos son los que escribiste; donde faltaban, dice [FALTA]." },
      { criterionId: "impacto", verdict: vered("impacto"), comment: `${p07.id} (el letrero) sale con impacto Alto porque «${p07.porque}»; tu texto no dice que se pierda nada.` },
      { criterionId: "dependencias", verdict: vered("dependencias"), comment: `Encuentra que ${TAREAS[24].id} depende de ${TAREAS[24].dep}, pero no que ${t05.id} (imprimir la lista) depende de ${t05.dep} (decidir los precios).` },
      { criterionId: "responsables", verdict: vered("responsables"), comment: "Cada responsable es alguien de tu lista y hace lo que le corresponde." },
      { criterionId: "limites", verdict: vered("limites"), comment: "No calcula prioridad ni arma el plan, como pide el prompt." },
    ],
    conclusion: "Es una buena base: no inventa nada. Los dos fallos cambian tu semana: un impacto de más sube una tarea y una dependencia omitida invierte dos.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir dos celdas, no pedir otra tabla.",
    promptId: "ajuste",
    why: "El contraste señaló dos cosas. El prompt limita el cambio a lo señalado, exige citar tu texto o una definición y separa lo cambiado de lo que sigue igual.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de ajuste con los datos del ejemplo. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Cambios del ajuste",
          purpose: "Comprobar qué celdas cambiaron y por qué.",
          columns: ["Antes", "Después", "Motivo"],
          rows: CAMBIOS,
        },
      },
      { type: "text", text: `**Sin cambios:** las otras ${TAREAS.length - CAMBIOS.length} filas y los ids. **FALTA:** los minutos de ${SIN_MIN.join(", ")}, que solo tú puedes dar.` },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Poner todo en «urgente»",
      whyItHurts: "Sin regla, todo parece urgente y se hace lo que hace más ruido.",
      instead: "Que la fecha decida la urgencia y la matriz, la prioridad.",
    },
    {
      title: "Dejar que la IA decida qué importa",
      whyItHurts: "Ordena con criterios que tú no elegiste y no sabe qué pierde tu negocio.",
      instead: "Que proponga el impacto citando tu texto; la prioridad la calcula tu hoja.",
    },
    {
      title: "Aceptar un plan sin sumar",
      whyItHurts: "Puede equivocarse al sumar: un plan que parece caber puede pasarse de las horas.",
      instead: "Suma los minutos de cada persona por día con una fórmula y compáralos con su capacidad.",
    },
    {
      title: "Inventar los minutos que faltan",
      whyItHurts: "Una estimación al azar descuadra el plan sin que se note.",
      instead: "Deja la celda vacía y mide cuánto tarda; entra después.",
    },
    {
      title: "Dejar tareas que no caben en un día",
      whyItHurts: "Una tarea de 60 minutos no cabe en un día de 45 y queda fuera cada semana.",
      instead: "Pártela en dos acciones con final claro, por ejemplo reunir documentos y presentarlos.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de confiar en tu semana, marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Cada fila de la tabla es una tarea que escribí, con su id." },
      { label: "Las fechas y los minutos son los míos; lo que faltaba sigue vacío." },
      { label: "Cada impacto Alto tiene detrás algo que se pierde o se incumple, escrito en mi texto." },
      { label: "Las dependencias están completas: ninguna tarea va antes de la que necesita." },
      { label: "La prioridad la calculó mi hoja con mi regla, no la IA." },
      { label: "Sumé los minutos de cada persona por día con una fórmula y ninguno supera su disponibilidad." },
      { label: "Decidí yo qué entra en mi semana y qué se aplaza." },
    ],
    principle: "La hoja calcula, la IA ordena y tú decides. Lo que entra en tu semana no lo decide un asistente.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la primera semana hecha, el trabajo es mantenerla.",
    steps: [
      { title: "Usa la hoja cada lunes", detail: "Cambia la fecha, la capacidad y las tareas nuevas; las fórmulas no se tocan." },
      { title: "Anota cuánto tardó cada tarea", detail: "Así los minutos dejan de ser una suposición." },
      { title: "Copia lo que se repite", detail: "Las tareas semanales y mensuales pasan de una semana a otra con su tiempo." },
      { title: "Cierra el viernes", detail: "Marca lo hecho y pasa lo que no cupo a la próxima semana." },
      { title: "Revisa tu regla cada mes", detail: "Si demasiadas tareas quedan en «Aplazar», mira si tu definición de impacto es estricta." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena la semana, pero tiene límites claros.",
    items: [
      { title: "El impacto es una propuesta", detail: "La IA no conoce tu negocio y puede subir o bajar el impacto de una tarea: por eso lo contrastas." },
      { title: "La regla no mide todo", detail: "Dos datos no recogen el dinero disponible ni lo que depende de otras personas." },
      { title: "Los minutos son estimaciones", detail: "Un plan exacto con estimaciones flojas sigue siendo flojo." },
      { title: "No es una aplicación", detail: "La hoja no avisa ni recuerda: la actualizas tú cada lunes." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Una lista desordenada se vuelve una semana realizable con cuatro decisiones: qué es cada tarea, cuánto pesa según una regla, cuánto tiempo hay y qué cabe. La IA acelera el orden y el reparto; la hoja comprueba que las cuentas cuadren.",
    takeaways: [
      "Escribe cada pendiente como una acción con un final claro.",
      "Fija una regla de prioridad y deja que la calcule la hoja.",
      "No inventes fechas ni minutos: lo que falta se completa después.",
      "Suma los minutos por persona y día antes de dar el plan por bueno.",
    ],
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "hoja-de-calculo", "rubrica", "dependencia", "capacidad", "tarea-recurrente"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Cuántos pendientes conviene tener en la lista?",
      answer: "Todos los que existan: la lista sirve si está completa. La regla deja los menos importantes en «Aplazar» sin perderlos de vista.",
    },
    {
      question: "¿Qué hago si no sé cuánto tarda una tarea?",
      answer: "Déjala sin minutos y anota cuánto tardó la primera vez. Hasta entonces no entra en el plan, que es mejor que una cifra inventada.",
    },
    {
      question: "¿Sirve si trabajo solo?",
      answer: "Sí. Usa una sola persona en la capacidad: cambia sobre todo el plan de la semana, porque los minutos de cada día son solo tuyos.",
    },
    {
      question: "¿Puedo pegar mi lista real en la IA?",
      answer: "Puedes, pero quita antes los datos personales de clientes, como nombres o teléfonos, y los datos de pago. Las tareas se entienden sin ellos.",
    },
  ],
});
