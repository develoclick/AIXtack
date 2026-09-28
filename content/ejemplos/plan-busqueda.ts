import { datosVaciosPlan, type DatosPlan, type Vacante } from "@/lib/plan/tipos";
import type { Canal, Estado, Hasta, Postulacion } from "@/lib/plan/registro";

export interface EjemploPlan {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosPlan;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa datos de la fuente. */
  respuesta: string;
  /** Postulaciones ficticias para el registro (se cargan solo en memoria; nunca se guardan como datos de la persona). */
  postulaciones: Postulacion[];
}

/**
 * Tres ejemplos. TODO es ficticio: personas, empresas, avisos, fechas y resultados están inventados solo para ilustrar la herramienta.
 * No son datos del mercado laboral ni de ninguna empresa real. Los minutos de cada plan y las cifras del registro se recalculan con el
 * mismo código de la herramienta (ver plan.test.ts).
 */
const BASE = datosVaciosPlan();
const vac = (id: string, v: Partial<Vacante>): Vacante => ({ id, empresa: "", puesto: "", ubicacion: "", resumen: "", limite: "", cumple: "", ...v });

/** Fila del plan: [semana, día, tarea, entregable, minutos]. */
type FilaEj = [number, string, string, string, number];
const campo = (t: string) => (/[",]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
const csv = (filas: FilaEj[]) => ["semana,dia,tarea,entregable,minutos", ...filas.map(([s, d, t, e, m]) => `${s},${d},${campo(t)},${campo(e)},${m}`)].join("\n");

interface Partes {
  objetivo: string;
  alternativas: [string, string];
  distribucion: [string, number, string][];
  plan: FilaEj[];
  criterios: string[];
  vacantes: string[];
  evitar: string[];
  plantillas: string;
  metricas: string[];
  verificar: string[];
  siguiente: string[];
}

const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");

function armar(p: Partes): string {
  return `## Objetivo
- Objetivo: ${p.objetivo}
- Alternativa 1: ${p.alternativas[0]}
- Alternativa 2: ${p.alternativas[1]}

## Distribución semanal
${p.distribucion.map(([a, n, por]) => `- ${a} | ${n} % | ${por}`).join("\n")}

## Plan de 4 semanas
${csv(p.plan)}

## Criterios y priorización de vacantes
${lista(p.criterios.map((c) => `Criterio: ${c}`))}
${lista(p.vacantes)}

## Lo que no debo hacer
${lista(p.evitar)}

## Plantillas
${p.plantillas}

## Cómo leer mis métricas
${lista(p.metricas)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

/** Las tres plantillas, con marcadores entre corchetes para todo lo que la IA no puede saber. */
function plantillas(puesto: string, lugar: string): string {
  return `Plantilla 1 [Networking]: «Escribirle a alguien que trabaja en una empresa que te interesa»
- Texto: Hola [Nombre], soy [Tu nombre]. Vi que trabajas en [Empresa] y estoy buscando una oportunidad como ${puesto} en ${lugar}. ¿Podrías contarme en un par de mensajes cómo es el trabajo allí? Sé que tu tiempo es valioso; cualquier orientación me ayuda. Gracias.
- Cuándo usarla: Con una persona que conoces o que comparte contigo un dato real (misma institución, mismo curso). No la envíes como si hubiera un referido si no lo hay.

Plantilla 2 [Seguimiento]: «Preguntar por el estado de una postulación sin respuesta»
- Texto: Asunto: Seguimiento de mi postulación a [Puesto]
Hola [Nombre]:
Postulé el [fecha] al puesto de [Puesto] en [Empresa] y quería confirmar que mi postulación llegó bien. Sigo interesado en la vacante porque [motivo breve y verdadero]. Quedo atento a cualquier información.
Saludos,
[Tu nombre]
- Cuándo usarla: Entre 7 y 10 días hábiles después de postular, si no hubo respuesta y tienes un contacto. Una sola vez, breve.

Plantilla 3 [Agradecimiento]: «Agradecer después de una entrevista»
- Texto: Asunto: Gracias por la entrevista para [Puesto]
Hola [Nombre]:
Gracias por conversar conmigo hoy sobre el puesto de [Puesto]. Me interesó especialmente [tema tratado en la entrevista]. Quedo atento a los siguientes pasos.
Saludos,
[Tu nombre]
- Cuándo usarla: El mismo día o al siguiente de una entrevista, con un detalle real de lo conversado.`;
}

/* ─────────────── Rosa: técnica en administración, Arequipa, híbrido ─────────────── */

const DATOS_ROSA: DatosPlan = {
  ...BASE,
  puesto: "Asistente administrativa",
  nivel: "junior",
  ubicacion: "Arequipa, Perú",
  modalidad: "hibrido",
  contrato: "tiempo-completo",
  sectores: "Comercio, salud, servicios",
  competencias: "Excel intermedio, atención al cliente, facturación y archivo, redacción de correos",
  salario: "",
  horas: "10",
  meta: "cambio",
  cv: "Técnica en administración de empresas. Dos años como auxiliar de caja en una tienda familiar: atención a clientes, cuadre de caja diario y registro de ventas en Excel. Curso de facturación electrónica.",
  vacantes: [
    vac("v1", { empresa: "Comercial Aurora (ficticia)", puesto: "Asistente administrativa", ubicacion: "Arequipa", resumen: "Atención de llamadas, archivo y facturación. Excel intermedio. Horario híbrido.", cumple: "si" }),
    vac("v2", { empresa: "Distribuidora Sur Andino (ficticia)", puesto: "Asistente administrativa", ubicacion: "Arequipa", resumen: "Control de inventario en SAP (obligatorio), Excel avanzado y cobranzas.", cumple: "no" }),
    vac("v3", { empresa: "Clínica Vida Nueva (ficticia)", puesto: "Auxiliar administrativa", ubicacion: "Arequipa", resumen: "Admisión de pacientes, atención al público y registro de citas. Presencial.", cumple: "parcial" }),
  ],
};

const RESPUESTA_ROSA = armar({
  objetivo: "Conseguir un puesto de asistente administrativa en Arequipa, en modalidad híbrida y a tiempo completo, dentro de los rubros de comercio, salud o servicios.",
  alternativas: ["Un puesto de auxiliar administrativa presencial en una clínica o un centro de salud de Arequipa.", "Un puesto de atención al cliente con tareas administrativas, para sumar experiencia en oficina."],
  distribucion: [
    ["Búsqueda y selección de vacantes", 10, "Elegir con criterios evita postular a avisos que no puedes cumplir."],
    ["Adaptación del CV", 15, "Cada aviso pide palabras distintas; conviene ajustar el CV a cada uno."],
    ["Postulación", 15, "Enviar y registrar cada postulación para poder medirlas después."],
    ["Seguimiento", 5, "Un mensaje breve a quienes no respondieron."],
    ["Networking", 10, "Conversar con personas del rubro amplía las opciones más allá de los portales."],
    ["Preparación de entrevistas", 10, "Practicar en voz alta tus respuestas antes de que te llamen."],
    ["Cierre de brechas", 5, "Aprender lo mínimo de lo que piden y aún no dominas."],
    ["Reserva", 30, "Tiempo libre para imprevistos y para responder a quien te escriba."],
  ],
  plan: [
    [1, "lunes", "Seleccionar 6 ofertas con la matriz y descartar las que piden SAP obligatorio", "Lista de 6 ofertas evaluadas con las descartadas marcadas", 60],
    [1, "martes", "Adaptar el CV a 3 ofertas (versiones A y B)", "3 CV adaptados con su versión anotada", 90],
    [1, "miércoles", "Postular a las 3 ofertas elegidas y registrarlas", "3 postulaciones en el registro", 45],
    [1, "jueves", "Escribir a 3 exalumnos con el mensaje de networking", "3 mensajes enviados", 60],
    [1, "viernes", "Practicar 3 respuestas de entrevista en voz alta", "3 respuestas practicadas", 45],
    [1, "viernes", "Revisar los seguimientos pendientes del registro", "Lista de seguimientos para la semana siguiente", 30],
    [2, "lunes", "Seleccionar 5 ofertas nuevas con la matriz", "Lista de 5 ofertas evaluadas", 45],
    [2, "martes", "Adaptar el CV a 3 ofertas y anotar la versión usada", "3 CV adaptados con su versión anotada", 90],
    [2, "miércoles", "Postular a las 3 ofertas elegidas y registrarlas", "3 postulaciones en el registro", 45],
    [2, "jueves", "Escribir a 3 contactos nuevos con el mensaje de networking", "3 mensajes enviados", 60],
    [2, "viernes", "Hacer seguimiento a las postulaciones sin respuesta", "Mensajes de seguimiento enviados", 45],
    [2, "sábado", "Ensayar la presentación personal de 1 minuto", "Presentación grabada y escuchada", 45],
    [3, "lunes", "Seleccionar 5 ofertas nuevas con la matriz", "Lista de 5 ofertas evaluadas", 45],
    [3, "martes", "Adaptar el CV a 3 ofertas y anotar la versión usada", "3 CV adaptados con su versión anotada", 90],
    [3, "miércoles", "Postular a las 3 ofertas elegidas y registrarlas", "3 postulaciones en el registro", 45],
    [3, "jueves", "Ver un tutorial gratuito sobre lo básico de un sistema de inventario (ERP)", "Notas de lo aprendido en una página", 60],
    [3, "viernes", "Revisar el embudo del registro y comparar las versiones del CV", "Nota con lo que el embudo muestra", 30],
    [3, "sábado", "Hacer seguimiento a las postulaciones sin respuesta", "Mensajes de seguimiento enviados", 45],
    [4, "lunes", "Seleccionar 4 ofertas nuevas con la matriz", "Lista de 4 ofertas evaluadas", 45],
    [4, "martes", "Adaptar el CV a 3 ofertas usando la versión que mejor respondió", "3 CV adaptados", 90],
    [4, "miércoles", "Postular a las ofertas elegidas y registrarlas", "Postulaciones en el registro", 45],
    [4, "jueves", "Escribir a 3 contactos y agradecer a quienes respondieron", "3 mensajes enviados", 60],
    [4, "viernes", "Copiar el prompt de revisión quincenal con las métricas del registro", "Ajustes para las 2 semanas siguientes anotados", 30],
    [4, "viernes", "Hacer un simulacro de entrevista con una persona de confianza", "Retroalimentación anotada", 60],
  ],
  criterios: ["Cumples los requisitos obligatorios del aviso (sí, casi todos o no).", "El puesto coincide con tu objetivo y con la modalidad que buscas.", "Puedes adaptar tu CV con datos verdaderos en menos de una sesión.", "La fecha límite te deja tiempo para postular con calidad."],
  vacantes: [
    "Vacante: Comercial Aurora (ficticia) — Asistente administrativa | Prioridad: Alta | Motivo: cumples los requisitos que indicaste y la modalidad coincide | Antes de postular: incluir en el CV tu experiencia con facturación y Excel",
    "Vacante: Clínica Vida Nueva (ficticia) — Auxiliar administrativa | Prioridad: Media | Motivo: cumples solo algunos requisitos y el aviso es presencial [SUPUESTO: aceptarías presencial] | Antes de postular: confirmar qué piden exactamente en atención al público",
    "Vacante: Distribuidora Sur Andino (ficticia) — Asistente administrativa | Prioridad: Baja | Motivo: pide SAP como requisito obligatorio y indicaste que no cumples varios | Antes de postular: verificar si el aviso admite aprender SAP en el puesto",
  ],
  evitar: [
    "Postular a todo lo que aparece | parece productivo porque suma envíos | elegir con la matriz y adaptar el CV a cada aviso",
    "Reescribir el CV desde cero cada semana | se siente como avanzar | mantener una versión base y ajustar solo lo que pide cada aviso",
    "Esperar sin mirar el registro | da tranquilidad no revisar nada | dedicar un momento cada semana al seguimiento",
  ],
  plantillas: plantillas("asistente administrativa", "Arequipa"),
  metricas: [
    "Si envías varias postulaciones y casi nadie responde, entonces el problema suele estar antes de la entrevista, en el CV o en la selección de vacantes (hipótesis).",
    "Si responden pero no pasan a entrevista, entonces conviene revisar lo que dices en el primer contacto (hipótesis).",
    "Si una versión del CV recibe más respuestas, entonces úsala como base, pero espera a tener más postulaciones antes de decidirlo (hipótesis).",
  ],
  verificar: ["Los requisitos reales y la fecha límite de cada aviso, en el aviso original.", "Que las versiones del CV solo contengan experiencia verdadera.", "Las condiciones del contrato y del horario antes de aceptar cualquier puesto."],
  siguiente: ["Empieza el lunes con la selección de vacantes y registra cada postulación el mismo día.", "A las 2 semanas, copia el prompt de revisión quincenal con tus métricas."],
});

/** Postulación de ejemplo: [id, empresa, puesto, fecha, canal, cv, estado, extra]. */
const post = (id: string, empresa: string, puesto: string, fecha: string, canal: Canal, cv: string, estado: Estado, extra: Partial<Postulacion> = {}): Postulacion => ({
  id,
  empresa: `${empresa} (ficticia)`,
  puesto,
  fecha,
  canal,
  cv,
  estado,
  hasta: "" as Hasta,
  seguimiento: "",
  resultado: "",
  notas: "",
  ...extra,
});

/** Rosa: 14 postulaciones en 3 semanas, 1 con respuesta (7,1 %), que llegó con la versión B del CV. */
const POST_ROSA: Postulacion[] = [
  post("rosa-1", "Comercial Aurora", "Asistente administrativa", "2026-09-09", "portal", "A", "sin-respuesta"),
  post("rosa-2", "Clínica Vida Nueva", "Auxiliar administrativa", "2026-09-09", "portal", "A", "sin-respuesta"),
  post("rosa-3", "Inversiones Colca", "Asistente de oficina", "2026-09-09", "web-empresa", "B", "entrevista-rrhh", { resultado: "Entrevista con RR. HH. agendada", notas: "La versión B destacaba facturación y Excel" }),
  post("rosa-4", "Agroexportadora Misti", "Asistente administrativa", "2026-09-16", "portal", "A", "sin-respuesta"),
  post("rosa-5", "Transportes Volcán", "Auxiliar administrativa", "2026-09-16", "portal", "A", "sin-respuesta"),
  post("rosa-6", "Ferretería Central", "Asistente de ventas", "2026-09-16", "referido", "B", "sin-respuesta"),
  post("rosa-7", "Estudio Contable Arequipa Norte", "Auxiliar contable", "2026-09-17", "portal", "A", "sin-respuesta"),
  post("rosa-8", "Hotel Plaza Blanca", "Recepcionista administrativa", "2026-09-17", "web-empresa", "B", "sin-respuesta"),
  post("rosa-9", "Laboratorio Andino", "Asistente administrativa", "2026-09-18", "portal", "A", "sin-respuesta"),
  post("rosa-10", "Minimarket El Ahorro", "Asistente administrativa", "2026-09-22", "portal", "B", "enviada", { seguimiento: "2026-10-02" }),
  post("rosa-11", "Servicios Logísticos Ubay", "Asistente de almacén", "2026-09-22", "portal", "A", "enviada"),
  post("rosa-12", "Constructora Ejemplo", "Asistente administrativa", "2026-09-23", "referido", "B", "enviada"),
  post("rosa-13", "Colegio San Isidro del Sur", "Auxiliar de secretaría", "2026-09-24", "web-empresa", "A", "enviada"),
  post("rosa-14", "Distribuidora Sur Andino", "Asistente administrativa", "2026-09-25", "portal", "B", "enviada"),
];

/* ─────────────── Diego: analista de datos junior, remoto, Lima ─────────────── */

const DATOS_DIEGO: DatosPlan = {
  ...BASE,
  puesto: "Analista de datos junior",
  nivel: "junior",
  ubicacion: "Lima, Perú",
  modalidad: "remoto",
  contrato: "tiempo-completo",
  sectores: "Comercio electrónico, finanzas",
  competencias: "SQL básico, Excel avanzado, Power BI, un proyecto de análisis de ventas con datos ficticios publicado en GitHub",
  salario: "S/ 3,000 mensuales brutos (expectativa personal, sin fuente)",
  horas: "8",
  meta: "cambio",
  cv: "Egresado de Ingeniería de Sistemas. Seis meses de prácticas en un área de reportes. Un proyecto personal de análisis de ventas con datos ficticios.",
  vacantes: [
    vac("v1", { empresa: "Tienda Digital Sol (ficticia)", puesto: "Analista de datos junior", ubicacion: "Remoto", resumen: "SQL, Power BI y Excel. Un año de experiencia deseable. Remoto.", cumple: "si" }),
    vac("v2", { empresa: "Fintech Cóndor (ficticia)", puesto: "Analista de BI", ubicacion: "Lima (híbrido)", resumen: "Python y modelado de datos. Dos años de experiencia obligatorios.", cumple: "no" }),
  ],
};

const RESPUESTA_DIEGO = armar({
  objetivo: "Conseguir un puesto remoto de analista de datos junior a tiempo completo, en comercio electrónico o finanzas.",
  alternativas: ["Un puesto de analista de reportes o de inteligencia comercial, remoto o híbrido en Lima.", "Unas prácticas o un contrato por proyectos como analista, para sumar experiencia comprobable."],
  distribucion: [
    ["Búsqueda y selección de vacantes", 15, "Con pocas horas, elegir bien evita postular a avisos fuera de tu alcance."],
    ["Adaptación del CV", 15, "Cada aviso pide herramientas distintas; conviene destacar las que sí usas."],
    ["Postulación", 10, "Enviar y registrar cada postulación."],
    ["Seguimiento", 5, "Mensajes breves a quienes no respondieron."],
    ["Networking", 10, "Conversar con analistas de datos abre opciones fuera de los portales."],
    ["Preparación de entrevistas", 10, "Practicar cómo explicar tu proyecto de análisis."],
    ["Cierre de brechas", 15, "Reforzar lo que piden los avisos y aún no dominas."],
    ["Reserva", 20, "Tiempo libre para imprevistos."],
  ],
  plan: [
    [1, "lunes", "Seleccionar 4 ofertas con la matriz de criterios", "Lista de 4 ofertas evaluadas", 60],
    [1, "martes", "Adaptar el CV a 2 ofertas destacando tu proyecto de análisis", "2 CV adaptados con su versión anotada", 75],
    [1, "miércoles", "Postular a las 2 ofertas elegidas y registrarlas", "2 postulaciones en el registro", 30],
    [1, "jueves", "Escribir a 2 analistas de datos con el mensaje de networking", "2 mensajes enviados", 45],
    [1, "sábado", "Practicar cómo explicar tu proyecto en 2 minutos", "Explicación grabada y escuchada", 45],
    [2, "lunes", "Seleccionar 4 ofertas nuevas con la matriz de criterios", "Lista de 4 ofertas evaluadas", 45],
    [2, "martes", "Adaptar el CV a 2 ofertas y anotar la versión usada", "2 CV adaptados", 75],
    [2, "miércoles", "Postular a las 2 ofertas elegidas y registrarlas", "2 postulaciones en el registro", 30],
    [2, "jueves", "Practicar consultas de SQL que aparecen en los avisos", "5 consultas resueltas y guardadas", 60],
    [2, "sábado", "Hacer seguimiento a las postulaciones sin respuesta", "Mensajes de seguimiento enviados", 30],
    [3, "lunes", "Seleccionar 4 ofertas nuevas con la matriz de criterios", "Lista de 4 ofertas evaluadas", 45],
    [3, "martes", "Adaptar el CV a 2 ofertas y anotar la versión usada", "2 CV adaptados", 75],
    [3, "miércoles", "Postular a las 2 ofertas elegidas y registrarlas", "2 postulaciones en el registro", 30],
    [3, "jueves", "Mejorar el proyecto de análisis con un tablero nuevo", "Tablero publicado en tu repositorio", 90],
    [3, "sábado", "Escribir a 2 contactos nuevos con el mensaje de networking", "2 mensajes enviados", 45],
    [4, "lunes", "Seleccionar 4 ofertas nuevas con la matriz de criterios", "Lista de 4 ofertas evaluadas", 45],
    [4, "martes", "Adaptar el CV a 2 ofertas con la versión que mejor respondió", "2 CV adaptados", 75],
    [4, "miércoles", "Postular a las ofertas elegidas y registrarlas", "Postulaciones en el registro", 30],
    [4, "jueves", "Copiar el prompt de revisión quincenal con las métricas del registro", "Ajustes para las 2 semanas siguientes anotados", 30],
    [4, "sábado", "Hacer un simulacro de entrevista con una persona de confianza", "Retroalimentación anotada", 60],
  ],
  criterios: ["Cumples los requisitos obligatorios del aviso (sí, casi todos o no).", "El puesto coincide con la modalidad remota que buscas.", "Las herramientas que piden son las que ya usas o puedes reforzar en pocas semanas.", "La fecha límite te deja tiempo para postular con calidad."],
  vacantes: [
    "Vacante: Tienda Digital Sol (ficticia) — Analista de datos junior | Prioridad: Alta | Motivo: cumples los requisitos que indicaste y es remoto | Antes de postular: destacar tu proyecto de análisis y tus herramientas",
    "Vacante: Fintech Cóndor (ficticia) — Analista de BI | Prioridad: Baja | Motivo: indicaste que no cumples varios requisitos obligatorios | Antes de postular: verificar si aceptan menos experiencia y qué piden exactamente",
  ],
  evitar: [
    "Acumular cursos sin publicar nada | parece progreso porque suma certificados | convertir lo aprendido en un proyecto que puedas mostrar",
    "Postular a puestos que piden más experiencia que la tuya | suma envíos | priorizar avisos donde cumplas lo obligatorio",
    "Adaptar el CV sin anotar la versión | ahorra tiempo | anotar la versión en el registro para medir qué responde mejor",
  ],
  plantillas: plantillas("analista de datos junior", "Lima"),
  metricas: [
    "Si tienes menos de 10 postulaciones, entonces mira las cantidades y no los porcentajes (hipótesis).",
    "Si nadie responde tras varias semanas, entonces revisa el CV frente a los avisos y la selección de vacantes (hipótesis).",
    "Si te responden pero no avanzas, entonces practica cómo explicas tu proyecto (hipótesis).",
  ],
  verificar: ["Los requisitos reales y la fecha límite de cada aviso, en el aviso original.", "Que el proyecto y las herramientas del CV sean verdaderos y puedas explicarlos.", "Las condiciones del contrato y del trabajo remoto antes de aceptar."],
  siguiente: ["Empieza el lunes con la selección de vacantes.", "Registra cada postulación el mismo día."],
});

/** Diego: 8 postulaciones (menos de 10: el registro habla en cantidades). */
const POST_DIEGO: Postulacion[] = [
  post("diego-1", "Tienda Digital Sol", "Analista de datos junior", "2026-09-14", "linkedin", "A", "sin-respuesta"),
  post("diego-2", "Retail Nube", "Analista de reportes", "2026-09-14", "linkedin", "A", "sin-respuesta"),
  post("diego-3", "Banco Ejemplo Norte", "Analista comercial", "2026-09-15", "portal", "A", "sin-respuesta"),
  post("diego-4", "Logística Rápida", "Analista de datos", "2026-09-16", "linkedin", "A", "en-revision", { resultado: "Confirmaron que revisan su perfil" }),
  post("diego-5", "Seguros Horizonte", "Analista junior de BI", "2026-09-21", "linkedin", "B", "entrevista-rrhh", { resultado: "Llamada agendada para la semana siguiente" }),
  post("diego-6", "Marketplace Andino", "Analista de datos junior", "2026-09-21", "portal", "B", "sin-respuesta"),
  post("diego-7", "Consultora Datos del Sur", "Practicante de análisis", "2026-09-23", "linkedin", "B", "enviada"),
  post("diego-8", "Educación en Línea Sol", "Analista de datos", "2026-09-24", "portal", "B", "enviada"),
];

/* ─────────────── Marcela: reinserción, atención al cliente, Trujillo ─────────────── */

const DATOS_MARCELA: DatosPlan = {
  ...BASE,
  puesto: "Asistente de atención al cliente",
  nivel: "semi-senior",
  ubicacion: "Trujillo, Perú",
  modalidad: "presencial",
  contrato: "tiempo-completo",
  sectores: "Retail, banca, servicios",
  competencias: "Atención presencial y telefónica, manejo de reclamos, caja, registro en sistemas, trato con público",
  salario: "",
  horas: "15",
  meta: "reinsercion",
  cv: "Ocho años de experiencia en atención al cliente en tiendas y en una agencia bancaria. Pausa laboral de tres años por cuidado familiar. Curso reciente de atención al cliente digital.",
  vacantes: [],
};

const RESPUESTA_MARCELA = armar({
  objetivo: "Volver a trabajar como asistente de atención al cliente, en modalidad presencial y a tiempo completo en Trujillo, en retail, banca o servicios.",
  alternativas: ["Un puesto de asesora de ventas o de caja en una tienda de Trujillo.", "Un puesto de atención al cliente a medio tiempo, para retomar el ritmo laboral."],
  distribucion: [
    ["Búsqueda y selección de vacantes", 10, "Elegir avisos donde tu experiencia previa sea lo central."],
    ["Adaptación del CV", 15, "Explicar la pausa laboral con naturalidad y destacar tus años de experiencia."],
    ["Postulación", 20, "Con más horas disponibles, puedes postular con calidad a más avisos."],
    ["Seguimiento", 10, "Mensajes breves a quienes no respondieron."],
    ["Networking", 15, "Contactar a excompañeros y jefes anteriores puede abrir puertas."],
    ["Preparación de entrevistas", 15, "Preparar cómo hablar de la pausa laboral y de tus logros."],
    ["Cierre de brechas", 5, "Actualizar lo que hayan cambiado los sistemas de atención."],
    ["Reserva", 10, "Tiempo libre para imprevistos."],
  ],
  plan: [
    [1, "lunes", "Buscar y seleccionar 6 avisos con la matriz de criterios", "Lista de 6 avisos evaluados", 90],
    [1, "martes", "Actualizar tu CV y redactar cómo explicas la pausa laboral", "CV base y frase sobre la pausa", 120],
    [1, "miércoles", "Adaptar el CV a 3 avisos y postular", "3 postulaciones en el registro", 120],
    [1, "jueves", "Escribir a 3 excompañeros con el mensaje de networking", "3 mensajes enviados", 60],
    [1, "viernes", "Practicar en voz alta la respuesta sobre la pausa laboral", "Respuesta practicada", 60],
    [2, "lunes", "Buscar y seleccionar 6 avisos con la matriz de criterios", "Lista de 6 avisos evaluados", 90],
    [2, "martes", "Adaptar el CV a 3 avisos y anotar la versión usada", "3 CV adaptados", 90],
    [2, "miércoles", "Postular a los 3 avisos elegidos y registrarlos", "3 postulaciones en el registro", 60],
    [2, "jueves", "Escribir a 3 contactos nuevos con el mensaje de networking", "3 mensajes enviados", 60],
    [2, "viernes", "Hacer seguimiento a las postulaciones sin respuesta", "Mensajes de seguimiento enviados", 60],
    [2, "sábado", "Hacer un simulacro de entrevista con una persona de confianza", "Retroalimentación anotada", 90],
    [3, "lunes", "Buscar y seleccionar 6 avisos con la matriz de criterios", "Lista de 6 avisos evaluados", 90],
    [3, "martes", "Adaptar el CV a 3 avisos usando la versión que mejor respondió", "3 CV adaptados", 90],
    [3, "miércoles", "Postular a los 3 avisos elegidos y registrarlos", "3 postulaciones en el registro", 60],
    [3, "jueves", "Repasar cómo describir tu experiencia con sistemas de atención", "Notas con 3 ejemplos concretos", 60],
    [3, "viernes", "Revisar el embudo del registro y decidir qué cambiar", "Nota con lo que el embudo muestra", 45],
    [4, "lunes", "Buscar y seleccionar 5 avisos con la matriz de criterios", "Lista de 5 avisos evaluados", 90],
    [4, "martes", "Adaptar el CV a 3 avisos y postular", "3 postulaciones en el registro", 120],
    [4, "miércoles", "Escribir mensajes de agradecimiento tras las entrevistas que hayas tenido", "Mensajes enviados", 45],
    [4, "jueves", "Copiar el prompt de revisión quincenal con las métricas del registro", "Ajustes para las 2 semanas siguientes anotados", 45],
    [4, "viernes", "Hacer un simulacro de entrevista final con una persona de confianza", "Retroalimentación anotada", 90],
  ],
  criterios: ["El aviso valora experiencia previa en atención al cliente, que es tu punto fuerte.", "El puesto es presencial y está en una zona a la que puedes llegar.", "El horario es compatible con tu disponibilidad.", "Puedes explicar tu pausa laboral con una frase honesta y breve."],
  vacantes: ["(Sin vacantes registradas: cuando tengas avisos concretos, agrégalos en el paso 1 para priorizarlos con estos criterios.)"],
  evitar: [
    "Ocultar la pausa laboral | parece protegerte | explicarla en una frase breve y verdadera y pasar a tus logros",
    "Postular a todo lo que aparece | suma envíos | elegir con los criterios y adaptar el CV a cada aviso",
    "Esperar a sentirte lista para empezar | da seguridad | empezar con tareas pequeñas y registrar cada avance",
  ],
  plantillas: plantillas("asistente de atención al cliente", "Trujillo"),
  metricas: [
    "Si envías postulaciones y casi nadie responde, entonces revisa el CV y la selección de avisos (hipótesis).",
    "Si te entrevistan pero no llega la oferta, entonces practica cómo hablas de tu pausa laboral y de tus logros (hipótesis).",
    "Si un canal responde más que otro, entonces dedícale más tiempo, con cautela si tienes pocas postulaciones (hipótesis).",
  ],
  verificar: ["Los requisitos reales y las condiciones de cada aviso, en el aviso original.", "Que lo que dices sobre tu experiencia y tu pausa laboral sea verdadero.", "El horario y las condiciones del contrato antes de aceptar."],
  siguiente: ["Empieza el lunes con la búsqueda de avisos.", "Registra cada postulación el mismo día."],
});

/** Marcela: 20 postulaciones, 7 con respuesta, 4 llegaron a entrevista y ninguna llegó a oferta. */
const POST_MARCELA: Postulacion[] = [
  post("marcela-1", "Tienda Central Norte", "Asistente de atención al cliente", "2026-09-07", "portal", "General", "sin-respuesta"),
  post("marcela-2", "Banco Ejemplo Libertad", "Asesora de servicios", "2026-09-07", "portal", "General", "rechazo", { hasta: "entrevista-rrhh", resultado: "Rechazo tras la entrevista con RR. HH." }),
  post("marcela-3", "Supermercados Costa", "Cajera", "2026-09-08", "referido", "General", "entrevista-final", { resultado: "Entrevista final agendada" }),
  post("marcela-4", "Farmacias Salud Norte", "Asistente de atención", "2026-09-08", "portal", "General", "sin-respuesta"),
  post("marcela-5", "Grupo Comercial Trujillo", "Asistente de tienda", "2026-09-09", "web-empresa", "General", "sin-respuesta"),
  post("marcela-6", "Seguros Andinos del Norte", "Asesora de atención", "2026-09-10", "portal", "General", "rechazo", { resultado: "Respuesta automática de rechazo" }),
  post("marcela-7", "Servicios Móviles Sol", "Asistente de atención", "2026-09-10", "portal", "General", "sin-respuesta"),
  post("marcela-8", "Clínica Norte Vida", "Admisión", "2026-09-11", "linkedin", "General", "sin-respuesta"),
  post("marcela-9", "Importadora Trujillo", "Asistente comercial", "2026-09-11", "linkedin", "General", "sin-respuesta"),
  post("marcela-10", "Banco Ejemplo Costa", "Ejecutiva de atención", "2026-09-14", "portal", "General", "sin-respuesta"),
  post("marcela-11", "Tienda Hogar Norte", "Asesora de ventas", "2026-09-15", "referido", "Atención al cliente", "rechazo", { hasta: "entrevista-rrhh", resultado: "Rechazo tras la entrevista con RR. HH." }),
  post("marcela-12", "Cadena Restaurantes Sol", "Atención al cliente", "2026-09-15", "portal", "Atención al cliente", "rechazo", { resultado: "Respuesta de rechazo por correo" }),
  post("marcela-13", "Universidad Privada Ejemplo", "Asistente de admisión", "2026-09-16", "web-empresa", "Atención al cliente", "entrevista-rrhh", { resultado: "Entrevista con RR. HH. agendada" }),
  post("marcela-14", "Constructora Costa Norte", "Recepcionista", "2026-09-17", "linkedin", "Atención al cliente", "en-revision"),
  post("marcela-15", "Financiera Ejemplo", "Asesora de atención", "2026-09-18", "linkedin", "Atención al cliente", "sin-respuesta"),
  post("marcela-16", "Distribuidora Norte", "Asistente de atención", "2026-09-21", "portal", "Atención al cliente", "sin-respuesta"),
  post("marcela-17", "Centro Comercial Ejemplo", "Asistente de atención", "2026-09-22", "portal", "Atención al cliente", "enviada"),
  post("marcela-18", "Aseguradora del Norte", "Asesora de atención", "2026-09-23", "web-empresa", "Atención al cliente", "enviada"),
  post("marcela-19", "Tienda Deportiva Sol", "Asesora de ventas", "2026-09-24", "linkedin", "Atención al cliente", "enviada"),
  post("marcela-20", "Banco Ejemplo Sol", "Asesora de servicios", "2026-09-25", "portal", "Atención al cliente", "enviada"),
];

export const EJEMPLOS_PLAN: EjemploPlan[] = [
  { id: "asistente-administrativa", etiqueta: "Asistente administrativa (Arequipa)", descripcion: "Cambio de puesto, 10 horas por semana, con 3 vacantes y 14 postulaciones.", datos: DATOS_ROSA, respuesta: RESPUESTA_ROSA, postulaciones: POST_ROSA },
  { id: "analista-de-datos", etiqueta: "Analista de datos junior (remoto)", descripcion: "Búsqueda remota, 8 horas por semana, con 2 vacantes y 8 postulaciones.", datos: DATOS_DIEGO, respuesta: RESPUESTA_DIEGO, postulaciones: POST_DIEGO },
  { id: "atencion-al-cliente", etiqueta: "Atención al cliente (reinserción)", descripcion: "Vuelta al trabajo, 15 horas por semana, sin vacantes aún y 20 postulaciones.", datos: DATOS_MARCELA, respuesta: RESPUESTA_MARCELA, postulaciones: POST_MARCELA },
];
