import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * marketing/calendario-de-contenido-con-ia
 *
 * Tipo: estrategia y planificación, con cálculo de capacidad (`handlesNumbers`). Todo el caso (el restaurante
 * Mesa Larga, sus tiempos, su banco de ideas y sus fechas) es FICTICIO. Cada cifra se calcula en este archivo
 * a partir de las constantes y se verificó con código aparte (ver README.md). Las respuestas de la IA son
 * EJEMPLOS GENERADOS: están redactadas aplicando literalmente cada prompt a los datos del caso; no proceden de
 * una conversación real ni de una prueba del autor (la suma equivocada del primer resultado es un error
 * ilustrativo, escrito a propósito). Las pruebas reales viven en `evidence.pruebas`, que solo rellena el autor.
 * La guía no cita fechas comerciales ni feriados: los aporta y comprueba quien la usa.
 *
 * Fuente única de verdad: formatos y tiempos (FORMATOS), tiempo y reserva (HORAS, RESERVA, USABLES), banco de
 * ideas (BANCO), calendarios (PRIMERO, FINAL), criterios (CRITERIOS), umbrales (RESULTADOS) y las cuentas
 * (CUENTAS) se definen UNA vez y los leen la hoja, las tablas, la rúbrica y los prompts.
 */
const slot = guideSlots("marketing", "calendario-de-contenido-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const FORMATOS = {
  imagen: { nombre: "Imagen con texto", prod: 25, pub: 5 },
  serie: { nombre: "Serie de imágenes", prod: 50, pub: 5 },
  mensaje: { nombre: "Mensaje breve", prod: 10, pub: 5 },
} as const;
type FormatoId = keyof typeof FORMATOS;
const min = (f: FormatoId) => FORMATOS[f].prod + FORMATOS[f].pub;

const HORAS = 3;
const RESERVA = 0.2;
const USABLES = Math.round(HORAS * 60 * (1 - RESERVA));
const MINUTOS_RECICLAR = 15;

const BANCO: { cod: string; idea: string; formato: FormatoId; rec: string }[] = [
  { cod: "A", idea: "Plato de la semana", formato: "imagen", rec: "cada semana" },
  { cod: "B", idea: "Menú del mediodía", formato: "imagen", rec: "cada semana" },
  { cod: "C", idea: "Cómo reservar para grupos", formato: "mensaje", rec: "una vez" },
  { cod: "D", idea: "Historia de la receta de la abuela", formato: "serie", rec: "una vez" },
  { cod: "E", idea: "Tres preguntas de reservas, respondidas", formato: "serie", rec: "una vez" },
  { cod: "F", idea: "Aniversario del restaurante", formato: "imagen", rec: "una vez" },
  { cod: "G", idea: "Recordatorio: reserva tu mesa entre semana", formato: "mensaje", rec: "una vez" },
  { cod: "H", idea: "El equipo de cocina, presentado", formato: "serie", rec: "una vez" },
];
const pieza = (cod: string) => BANCO.find((x) => x.cod === cod)!;

type Plan = [semana: number, dia: string, cod: string][];
const PRIMERO: Plan = [
  [1, "Martes", "B"], [1, "Jueves", "A"], [1, "Viernes", "C"], [1, "Sábado", "D"],
  [2, "Martes", "B"], [2, "Jueves", "A"], [2, "Viernes", "G"], [2, "Sábado", "E"],
  [3, "Martes", "B"], [3, "Jueves", "A"], [3, "Viernes", "H"], [3, "Sábado", "F"],
  [4, "Martes", "B"], [4, "Jueves", "A"],
];
const FINAL: Plan = [...PRIMERO.filter(([s, , c]) => !(s === 3 && c === "H")), [4, "Viernes", "H"] as Plan[number]];

const filas = (plan: Plan) =>
  plan.map(([s, d, c]) => [String(s), d, `${c} · ${pieza(c).idea}`, FORMATOS[pieza(c).formato].nombre, String(min(pieza(c).formato))]);
const suma = (plan: Plan, semana: number) => {
  const del = plan.filter(([s]) => s === semana).map(([, , c]) => FORMATOS[pieza(c).formato]);
  const prod = del.reduce((n, f) => n + f.prod, 0);
  const pub = del.reduce((n, f) => n + f.pub, 0);
  return { prod, pub, total: prod + pub };
};
const totales = (plan: Plan, error?: { semana: number; total: number }) =>
  [1, 2, 3, 4]
    .map((s) => {
      const r = suma(plan, s);
      const total = error && error.semana === s ? error.total : r.total;
      return `Semana ${s}: producción ${r.prod} + publicación ${r.pub} = ${total} (cabe)`;
    })
    .join(" · ");

const CUENTAS = [
  "Minutos por pieza: minutos de producción + minutos de publicación.",
  "Minutos de la semana de un formato: minutos por pieza × piezas de la semana.",
  "Total de la semana: la suma de los minutos de todos los formatos.",
  "Minutos usables: horas semanales × 60 × (1 − reserva).",
  "¿Cabe?: el total de la semana no supera los minutos usables.",
];

const CRITERIOS = [
  { id: "capacidad", corto: "Capacidad", label: "Cabe en mi tiempo", detail: "La suma de cada semana, recalculada por pieza, no supera mis minutos usables." },
  { id: "origen", corto: "Origen", label: "Sale de mi banco", detail: "Cada pieza es una idea de mi banco, con su formato; no hay ideas nuevas." },
  { id: "fechas", corto: "Fechas", label: "Respeta mis días y mis fechas", detail: "Ninguna pieza cae en un día en que no publico y mis fechas propias están donde deben." },
  { id: "variedad", corto: "Variedad", label: "No repite el mismo tipo de pieza", detail: "Cada semana mezcla formatos y no concentra lo mismo." },
  { id: "lote", corto: "Lote", label: "Se produce en un bloque", detail: "La producción de cada semana se agrupa en una sola sesión." },
] as const;

const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Falla en varios criterios: revisa tus datos de partida antes de volver a pedirlo." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige el criterio con menos puntos, empezando por lo que no cabe." },
  { min: 9, label: "Lista para verificar", advice: "Cumple casi todo: pasa a comprobar fechas y datos." },
] as const;

const MAXIMO = CRITERIOS.length * 2;
const TIEMPOS = (Object.values(FORMATOS) as { nombre: string; prod: number; pub: number }[])
  .map((f) => `${f.nombre}: ${f.prod} de producción + ${f.pub} de publicación = ${f.prod + f.pub}`)
  .join(" · ");
const OBJETIVO = "Que reserven mesa entre semana";
const DIAS = "Se produce el lunes; se publica martes, jueves, viernes y sábado; nunca domingo";
const FECHAS = "Aniversario del restaurante: sábado de la semana 3";

const LISTA_CUENTAS = CUENTAS.map((c, i) => `${i + 1}. ${c}`).join("\n");
const LISTA_CRITERIOS = CRITERIOS.map((c, i) => `${i + 1}. ${c.label}: ${c.detail}`).join("\n");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "calendario-de-contenido-con-ia",
    category: "marketing",
    title: "Crear un calendario de contenido con IA que cabe en tu tiempo",
    description:
      "Convierte tu banco de ideas en un calendario de cuatro semanas que cabe en tu tiempo real, con producción por lotes, reciclaje y fechas que verificas tú.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["estrategia-planificacion", "numeros-datos"],
    estandarGuia: 3,
    handlesNumbers: true,
    activoOriginal: "Calculadora de capacidad semanal para hoja de cálculo (se copia como tabla, con fórmulas en español e inglés), rúbrica de cinco criterios y calendario de cuatro semanas (tabla copiable)",
    problem: "Tienes ideas de contenido pero no un plan de cuándo y cómo publicarlas con el tiempo que realmente tienes.",
    whyThisPage:
      "Cubre el paso de la lista de ideas a un calendario que se pueda cumplir: capacidad real, fechas, reutilización de piezas y producción por lotes.",
    relatedGuides: ["ideas-de-contenido-para-tu-negocio-con-ia", "crear-publicaciones-para-redes-sociales-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Un calendario que no cabe en tu semana se abandona. Mide cuánto tiempo tienes, deja que la IA reparta tus ideas dentro de ese límite y comprueba las sumas y las fechas antes de comprometerte.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de dos horas la primera vez; después, una hora al mes",
    needs: ["Un asistente de IA de chat", "Un banco de ideas con su formato", "Una hoja de cálculo"],
    result: "Un calendario de cuatro semanas que cabe en tu tiempo, con su plan de reciclaje",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el resultado: un calendario de cuatro semanas con los minutos de cada pieza y el total que cabe en el tiempo disponible.",
      description:
        "Una hoja de cálculo con el calendario de cuatro semanas del caso ficticio, con una columna de minutos por pieza y, debajo de cada semana, el total frente a los minutos usables. Resaltar con un color los totales que caben. Sin datos personales.",
      alt: "Hoja de cálculo con un calendario de cuatro semanas, los minutos de cada pieza y el total de cada semana frente al tiempo disponible.",
      caption: "Un calendario que cabe en tu semana.",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña cómo se ven los datos de partida ya reunidos: el banco de ideas, los tiempos por formato y las fechas propias.",
      description:
        "Una hoja con tres bloques: el banco de ideas (código, idea, formato, recurrencia), los tiempos por formato (producción y publicación) y las fechas propias con los días sin publicar. Caso ficticio, sin datos personales.",
      alt: "Hoja con un banco de ideas, los tiempos por formato y las fechas propias de un restaurante ficticio.",
      caption: "Los datos que la IA no puede saber.",
      zoom: true,
    }),
    hoja: slot("calculadora-de-capacidad.webp", {
      section: "hoja",
      ratio: "4/3",
      purpose: "Muestra la calculadora pegada y funcionando, con la fórmula del total semanal visible, para ver que se usa sin salir de la hoja.",
      description:
        "La calculadora pegada en la celda A1: tres formatos, sus piezas de la semana, el total de 130 minutos, los 144 usables y un «Sí» en la última fila. Resaltar la barra de fórmulas con la fórmula de minutos usables. Caso ficticio.",
      alt: "Hoja de cálculo con la calculadora de capacidad pegada, con 130 minutos planificados, 144 usables y un «Sí» en la fila de cabe.",
      caption: "La calculadora con la semana 1 del caso.",
      zoom: true,
    }),
    primerResultado: slot("calendario-inicial.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver cómo llega el primer calendario y localizar la semana cuya suma declarada no coincide.",
      description:
        "El primer calendario devuelto por el asistente, con la tabla de las cuatro semanas y la lista de totales. Marcar con un recuadro la línea de totales de la semana 3 y, al lado, los 145 minutos reales. Caso ficticio, sin datos de cuenta.",
      alt: "Calendario de cuatro semanas devuelto por un asistente con la línea de totales de la semana 3 marcada.",
      caption: "El primer calendario, con una suma que no cuadra.",
      zoom: true,
    }),
    detecta: slot("la-hoja-detecta-la-diferencia.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a comprobar una semana con la propia hoja y a ver por qué no cabe.",
      description:
        "La calculadora con las piezas de la semana 3 (tres imágenes con texto, una serie y ningún mensaje breve), que da 145 minutos y un «No» en la fila «¿Cabe?». Al lado, la línea de totales de la IA. Resaltar la diferencia. Caso ficticio.",
      alt: "Calculadora con 145 minutos y un «No» junto a la línea de totales del asistente que declara 130.",
      caption: "La hoja dice 145; la IA dijo 130.",
      zoom: true,
    }),
    final: slot("calendario-final.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra el entregable final: el calendario corregido, con la pieza movida y los totales por semana dentro del límite.",
      description:
        "La tabla del calendario final de cuatro semanas con la fila de la pieza movida resaltada y, debajo, los totales por semana (130, 130, 90 y 115) frente a los 144 minutos usables. Caso ficticio.",
      alt: "Calendario final de cuatro semanas con una pieza movida resaltada y los totales por semana dentro del límite.",
      caption: "El calendario final: ninguna semana pasa del límite.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "hoja",
      ratio: "16/9",
      promptId: "formulas",
      purpose: "Prueba real del prompt de fórmulas: la tabla de fórmulas y su comprobación con números de práctica.",
      description:
        "Captura de la tabla de fórmulas y de «Cómo pegarla». Usa solo la descripción de tus columnas, sin cifras reales. Ocultar datos personales y de cuenta.",
      alt: "Captura de las fórmulas de una hoja de cálculo devueltas por un asistente.",
      caption: "Prueba del prompt de fórmulas.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "calendario",
      purpose: "Prueba real del prompt de calendario: la tabla, los totales por semana y el bloque de producción.",
      description:
        "Captura de la tabla, los totales, los bloques de producción y la lista «FALTA». Usa el banco del caso o el tuyo. Ocultar datos personales y de cuenta.",
      alt: "Captura de un calendario de contenido devuelto por un asistente.",
      caption: "Prueba del prompt de calendario.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "revision",
      purpose: "Prueba real del prompt de revisión: las sumas recalculadas y la rúbrica puntuada.",
      description:
        "Captura de la tabla de totales recalculados, la de la rúbrica con sus fragmentos y «Para comprobar tú». Anota aparte si sus sumas coinciden con tu hoja. Ocultar datos personales y de cuenta.",
      alt: "Captura de la revisión de un calendario con sumas recalculadas y rúbrica.",
      caption: "Prueba del prompt de revisión.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios, el calendario final y los totales.",
      description:
        "Captura de la tabla de cambios, del calendario final y de los totales. Ocultar datos personales y de cuenta.",
      alt: "Captura del ajuste de un calendario con sus cambios y totales.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "reciclaje",
      purpose: "Prueba real del prompt de reciclaje: las piezas recicladas, las que no se reciclan y el total de la semana destino.",
      description:
        "Captura de la tabla de reciclaje, de «No se recicla» y del total de la semana destino. Ocultar datos personales y de cuenta.",
      alt: "Captura del plan de reciclaje de piezas de contenido devuelto por un asistente.",
      caption: "Prueba del prompt de reciclaje.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Tener ideas no es tener un plan. Lo habitual es planear lo que a uno le gustaría publicar y no lo que puede producir: la primera semana se cumple, en la segunda faltan horas y en la tercera el calendario se abandona.\n\nSi le pides a un asistente de IA «un calendario de un mes», lo llenará de piezas sin saber cuánto tarda cada una, cuántas horas tienes ni qué días no publicas. Además puede sumar mal y colocar con seguridad una fecha o un feriado que no existe donde vives.\n\nUn calendario útil parte de tu tiempo real. **La capacidad y las sumas se calculan en tu hoja; la IA reparte las ideas dentro de ese límite.**",
    symptoms: [
      "Planeas más piezas de las que puedes producir y te atrasas.",
      "Produces cada pieza el mismo día que la publicas, siempre con prisa.",
      "Publicas una vez y nunca vuelves a usar una pieza que costó horas.",
      "No sabes cuánto tarda en realidad cada formato.",
      "Una fecha comercial o un feriado te toma por sorpresa.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con un calendario de cuatro semanas que cabe en tu tiempo y con un procedimiento para rehacerlo cada mes.",
    deliverables: [
      { label: "Una calculadora de capacidad", detail: "Una hoja que dice si una semana cabe, con fórmulas que copias." },
      { label: "Un calendario de cuatro semanas", detail: "Con sus minutos, su bloque de producción y sus fechas propias." },
      { label: "Un plan de reciclaje", detail: "Qué piezas volver a usar, cuándo y con qué cambios." },
      { label: "Una rúbrica para revisarlo", detail: "Cinco criterios para puntuar cualquier calendario." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Ya tienes un banco de ideas y necesitas repartirlo en semanas sin quedarte sin tiempo.",
      "Puedes dedicar una cantidad fija de horas por semana y quieres aprovecharla.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "No tienes ideas todavía: antes necesitas un banco, y hay una guía que enseña a armarlo.",
      "Buscas que la IA programe y publique por ti: aquí solo se planifica.",
      "Esperas un horario «perfecto» para publicar: nadie puede asegurarlo y esta guía no lo promete.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Restaurante Mesa Larga (ficticio) — restaurante familiar",
    situation:
      "Mesa Larga es un restaurante familiar. La dueña dedica tres horas por semana a las redes y quiere llenar el comedor entre semana. Tiene un banco de ocho ideas, pero nunca ha sabido cuántas caben en una semana.",
    goal: "Un calendario de cuatro semanas para que reserven mesa entre semana, sin pasarse de su tiempo.",
    data: [
      { label: "Tiempo semanal", value: `${HORAS} horas, con una reserva del ${RESERVA * 100} % para imprevistos: ${USABLES} minutos usables` },
      { label: "Tiempos por formato (medidos por la dueña)", value: TIEMPOS },
      { label: "Días", value: DIAS },
      { label: "Fechas propias", value: FECHAS },
      { label: "Objetivo", value: OBJETIVO },
    ],
    problem: "Sus calendarios anteriores no cabían en su tiempo, y una IA le devolvió uno con las sumas mal hechas.",
    application: "Mide sus tiempos, arma la calculadora, pide el calendario, recalcula, corrige lo que no cabe y planifica qué reciclar.",
    result: "Un calendario donde cada semana cabe en sus minutos usables y una pieza reciclada.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan la planificación. Las cifras del caso son ficticias; los tiempos y la reserva de tu calendario son los tuyos.",
    blocks: [
      {
        title: "Capacidad",
        detail:
          "Es el tiempo que de verdad puedes dedicar por semana, descontada una reserva para imprevistos. Un calendario que ocupa todo tu tiempo se rompe con el primer imprevisto: la reserva del 20 % es una recomendación práctica, no una norma.",
        example: `Con ${HORAS} horas y una reserva del ${RESERVA * 100} %, hay ${USABLES} minutos usables.`,
      },
      {
        title: "Tiempo por pieza",
        detail: "Cada formato cuesta un tiempo de producción y otro de publicación. Mídelos en tus últimas semanas: son tuyos y la IA no puede conocerlos.",
      },
      {
        title: "Producción por lotes",
        detail: "Producir todas las piezas de la semana en una sola sesión suele costar menos que producirlas una a una, y deja libres los otros días.",
      },
      {
        title: "Reciclaje",
        detail: "Volver a usar una pieza ya publicada, con otro formato u otro ángulo y los mismos datos. Tiene su propio tiempo y una espera mínima, para que no parezca repetida.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Hazme un calendario de contenido para un mes para mi restaurante.",
    whyInsufficient:
      "Con esa frase la IA no sabe cuánto tarda cada pieza, cuántas horas tienes ni qué días no publicas, así que llena cada día con lo que le parece razonable y añade fechas comerciales de memoria (ejemplo ilustrativo). El resultado parece prolijo y no se puede cumplir.",
    issues: [
      "No hay capacidad: nadie comprobó que las piezas quepan en tu semana.",
      "No hay ideas tuyas: rellena con temas genéricos.",
      "No hay fechas verificadas: puede colocar un feriado equivocado.",
      "No se puede comprobar: las sumas, si las hay, no se ven.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Reúne cuatro datos antes de abrir la IA. Ninguno lo puede inventar ella.",
    items: [
      { label: "Tu banco de ideas", detail: "Cada idea con un código, su formato y si se repite cada semana o se usa una vez.", required: true },
      { label: "Tu tiempo semanal y tu reserva", detail: "Cuántas horas puedes dedicar de verdad y cuánto reservas para imprevistos.", required: true },
      { label: "Los minutos por formato", detail: "Cuánto tardas en producir y en publicar cada formato, medidos en tus últimas semanas.", required: true },
      { label: "Tus días y tus fechas", detail: "Qué días produces, cuáles publicas y cuáles no, y las fechas propias que deben respetarse.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    hoja: {
      caption: "Fórmulas de la calculadora, en español e inglés",
      purpose: "Ver qué fórmula va en cada celda y cómo comprobarla con números de práctica antes de usar tus tiempos.",
      columns: ["Columna", "Qué calcula", "Fórmula en español", "Fórmula en inglés", "Comprobación con números de práctica"],
      rows: [
        ["D · Minutos por pieza", "Producción más publicación", "=B2+C2", "=B2+C2", "Con 20 y 5: 25"],
        ["F · Minutos de la semana de un formato", "Minutos por pieza por piezas de la semana", "=D2*E2", "=D2*E2", "Con 25 y 3: 75"],
        ["F · Total de la semana", "La suma de los minutos de todos los formatos", "=SUMA(F2:F4)", "=SUM(F2:F4)", "Con 75, 60 y 15: 150"],
        ["F · Minutos usables", "Horas por 60 por uno menos la reserva", "=B6*60*(1-B7)", "=B6*60*(1-B7)", "Con 2 horas y 0.25: 90"],
        ["F · ¿Cabe?", "El total no supera los minutos usables", "=SI(F5<=F8;\"Sí\";\"No\")", "=IF(F5<=F8,\"Yes\",\"No\")", "Con 150 y 90: No"],
      ],
      note: "Ejemplo generado. El separador entre argumentos (punto y coma o coma) depende de la configuración regional. Cómo pegarla: en la fila 2 y copiada hacia abajo hasta la 4.",
    },
    calculadora: {
      caption: "Calculadora de capacidad con la semana 1 del caso",
      purpose: "Tener una hoja que dice si una semana cabe, lista para pegar en la celda A1 y cambiar por tus tiempos.",
      columns: ["Concepto", "Producción (min)", "Publicación (min)", "Minutos por pieza", "Piezas de la semana", "Minutos de la semana"],
      rows: [
        [FORMATOS.imagen.nombre, String(FORMATOS.imagen.prod), String(FORMATOS.imagen.pub), "=B2+C2", "2", "=D2*E2"],
        [FORMATOS.serie.nombre, String(FORMATOS.serie.prod), String(FORMATOS.serie.pub), "=B3+C3", "1", "=D3*E3"],
        [FORMATOS.mensaje.nombre, String(FORMATOS.mensaje.prod), String(FORMATOS.mensaje.pub), "=B4+C4", "1", "=D4*E4"],
        ["Total de la semana", "—", "—", "—", "=SUMA(E2:E4)", "=SUMA(F2:F4)"],
        ["Horas semanales disponibles", String(HORAS), "—", "—", "—", "—"],
        ["Reserva para imprevistos", String(RESERVA), "—", "—", "—", "—"],
        ["Minutos usables", "—", "—", "—", "—", "=B6*60*(1-B7)"],
        ["¿Cabe?", "—", "—", "—", "—", "=SI(F5<=F8;\"Sí\";\"No\")"],
      ],
      note: "Cambia los minutos, las piezas, las horas y la reserva por los tuyos. Con coma decimal, cambia el punto de 0.2 por una coma.",
      copyable: true,
    },
    final: {
      caption: "Calendario final de cuatro semanas",
      purpose: "Tener el calendario corregido, con cada semana dentro de tus minutos usables, para copiarlo a una hoja.",
      columns: ["Semana", "Día", "Idea", "Formato", "Minutos"],
      rows: filas(FINAL),
      copyable: true,
      note: "Ejemplo generado. Totales por semana: " + totales(FINAL) + `; todos dentro de los ${USABLES} minutos usables.`,
    },
    reciclaje: {
      caption: "Plan de reciclaje para la semana 4",
      purpose: "Ver qué piezas se reutilizan, con qué cambios y cuáles no, sin pasarse de los minutos usables.",
      columns: ["Pieza original", "Semana original", "Versión reciclada", "Semana destino", "Minutos", "Qué cambia", "Qué no cambia"],
      rows: [
        ["D · Historia de la receta de la abuela", "1", "Una frase de la receta en imagen con texto (sábado)", "4", String(MINUTOS_RECICLAR), "El formato", "Los datos de la historia"],
      ],
      note:
        `Ejemplo generado. No se recicla: A y B (llevan datos que cambian cada semana), F (está ligada a una fecha propia) y C (no cabe: con D reciclada la semana 4 suma ${suma(FINAL, 4).total + MINUTOS_RECICLAR}; con C también, ${suma(FINAL, 4).total + 2 * MINUTOS_RECICLAR}, más de ${USABLES}). ` +
        `Total de la semana 4 con D reciclada: ${suma(FINAL, 4).total + MINUTOS_RECICLAR} minutos.`,
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cinco de los seis pasos. Las sumas que deciden si el calendario cabe salen siempre de tu hoja.",
    steps: [
      {
        title: "Reúne tus datos de partida",
        description: "Escribe tu banco de ideas con su formato, tus horas y tu reserva, tus minutos por formato, tus días y tus fechas propias.",
        output: "Los cuatro datos escritos, sin estimaciones de la IA.",
      },
      {
        title: "Arma tu hoja de capacidad",
        description: "Con el prompt de fórmulas, o copiando la calculadora, deja lista una hoja que diga si una semana cabe.",
        output: "Una calculadora que funciona con números de práctica.",
      },
      {
        title: "Pide el calendario",
        description: "Entrega a la IA tu banco, tus minutos usables, tus tiempos, tus días y tus fechas, y pide cuatro semanas.",
        output: "Una tabla por semana con minutos y bloque de producción.",
      },
      {
        title: "Recalcula y puntúa",
        description: "Comprueba cada semana en tu hoja y puntúa el calendario con la rúbrica, a mano o con el prompt de revisión.",
        output: "Una lista de lo que no cabe o no cumple.",
      },
      {
        title: "Ajusta lo que no cabe",
        description: "Pide mover o quitar las piezas mínimas, sin ideas nuevas, y vuelve a recalcular.",
        output: "Un calendario donde todas las semanas caben.",
      },
      {
        title: "Verifica fechas y planifica el reciclaje",
        description: "Comprueba tú las fechas y los datos con vigencia, y pide qué piezas reciclar sin pasarte de tu tiempo.",
        output: "Un calendario verificado y un plan de reciclaje.",
      },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    formulas: {
      title: "Prompt de fórmulas: armar tu hoja sin compartir datos",
      objective: "Que la IA te dé las fórmulas de la calculadora a partir de la descripción de tus columnas, sin ver ninguno de tus tiempos.",
      whenToUse: "Cuando quieres construir la hoja tú mismo o adaptar la calculadora a tus columnas.",
      variables: [
        { name: "PROGRAMA", description: "La hoja de cálculo que usas.", example: "Google Sheets" },
        {
          name: "COLUMNAS",
          description: "Letra y contenido de cada columna o celda que ya tienes.",
          example: "A: formato · B: minutos de producción · C: minutos de publicación · E: piezas de la semana · B6: horas semanales · B7: reserva como decimal",
        },
      ],
      prompt: `Actúa como asistente de hojas de cálculo para una persona sin experiencia. Tu destinatario es la persona dueña de un negocio pequeño, que escribirá las fórmulas ella misma. Tu objetivo es darle las fórmulas de la calculadora de capacidad a partir de la descripción de sus columnas, sin ver sus datos.

### CONTEXTO
Programa de hoja de cálculo: {{PROGRAMA}}

### DATOS
Columnas y celdas de mi hoja (letra y qué contiene):
{{COLUMNAS}}

### CUENTAS QUE NECESITO
${LISTA_CUENTAS}

### REGLAS
1. Usa solo las columnas y celdas que te describí. Si falta una para alguna cuenta, escribe [FALTA: la columna] y no inventes una.
2. No me pidas ni uses mis tiempos reales. Para comprobar cada fórmula usa números de práctica sencillos.
3. Escribe cada fórmula para la fila 2 (o la celda indicada), con el nombre de las funciones en español y en inglés, y recuérdame que el separador entre argumentos depende de la configuración regional.
4. Explica en una frase qué hace cada fórmula, sin jerga.
5. Si no conoces el nombre exacto de una función en mi programa, dilo en lugar de suponerlo.

### FORMATO DE SALIDA
Una tabla con columnas fijas: Columna | Qué calcula | Fórmula en español | Fórmula en inglés | Comprobación con números de práctica. Después, una lista «Cómo pegarla» con dónde escribirla y cómo copiarla hacia abajo. La tabla define la forma; el contenido sale de mis columnas.

### ANTES DE RESPONDER
Verifica que: cada fórmula aplica la definición de arriba tal como está escrita; la comprobación con números de práctica es correcta (calcúlala dos veces); cada fórmula usa solo las columnas descritas; no usaste ningún tiempo mío. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "…sin ver sus datos.",
          why: "Le describes la estructura, no tus tiempos: aprendes a hacer las fórmulas sin compartir nada de tu negocio.",
        },
        {
          part: "…usa números de práctica sencillos.",
          why: "Te permite comprobar la fórmula con cuentas que haces de cabeza.",
        },
        {
          part: "Si falta una para alguna cuenta, escribe [FALTA: la columna]…",
          why: "Evita que invente una columna que no tienes y te deje una fórmula que no funciona.",
        },
      ],
      evaluate: "Escribe la fórmula en tu hoja con los números de práctica: el resultado debe coincidir con la última columna.",
      improve: "Si tu programa no reconoce una función, pega su mensaje de error y pide la alternativa.",
      warnings: ["Con coma decimal, los argumentos suelen separarse con punto y coma."],
    },

    calendario: {
      title: "Prompt de calendario: repartir el banco en semanas",
      objective: "Que la IA distribuya las ideas de tu banco en un calendario que quepa en tus minutos usables, mostrando cada suma.",
      whenToUse: "Cuando tienes tu banco, tus tiempos por formato y tus días escritos.",
      variables: [
        { name: "BANCO", description: "Tu banco: código, idea, formato y si se repite.", example: "La tabla de tu banco de ideas" },
        { name: "OBJETIVO", description: "Lo que quieres que pase este mes.", example: OBJETIVO },
        { name: "MINUTOS_USABLES", description: "Tus minutos por semana, ya con la reserva descontada.", example: String(USABLES) },
        { name: "TIEMPOS_POR_FORMATO", description: "Producción y publicación de cada formato.", example: "Imagen con texto: 25 + 5 = 30" },
        { name: "DIAS", description: "Día de producción, días de publicación y días sin publicar.", example: DIAS },
        { name: "FECHAS_PROPIAS", description: "Fechas tuyas que deben respetarse.", example: FECHAS },
      ],
      prompt: `Actúa como planificador de contenido para un negocio pequeño. Tu destinatario es la persona dueña, que producirá todo con poco tiempo. Tu objetivo es distribuir las ideas de su banco en un calendario de cuatro semanas que quepa en sus minutos usables.

### CONTEXTO
Objetivo del mes: {{OBJETIVO}}
Días: {{DIAS}}

### DATOS (los que YO te doy; son la única fuente de hechos)
Banco de ideas (código, idea, formato, recurrencia):
{{BANCO}}

Minutos usables por semana: {{MINUTOS_USABLES}}
Minutos por pieza según su formato (producción + publicación): {{TIEMPOS_POR_FORMATO}}
Fechas propias que deben respetarse: {{FECHAS_PROPIAS}}

### REGLAS
1. Usa solo ideas del banco, con su formato. No inventes ideas, fechas, feriados, ofertas ni datos. Si el banco no alcanza para llenar una semana, deja los huecos y dilo: no completes con ideas nuevas.
2. Cada semana debe sumar como máximo mis minutos usables. Calcula la suma con los minutos por pieza que te di, muestra la cuenta y no uses otros tiempos.
3. Respeta mis días y mis fechas propias. No añadas fechas comerciales ni feriados: los agrego yo.
4. Agrupa la producción de cada semana en un solo bloque, y separa los minutos de publicación.
5. Las ideas marcadas «cada semana» se repiten con contenido nuevo que yo aportaré; las demás se usan una sola vez. No recicles: eso se hace después, con otro prompt.
6. Si mis datos se contradicen (por ejemplo, una fecha propia en un día en que no publico), dímelo antes de armar el calendario.
7. Distingue lo que sale de mis datos de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Semana | Día | Idea (código y nombre) | Formato | Minutos; (2) «Totales por semana»: minutos de producción + minutos de publicación = total, y si cabe; (3) «Bloque de producción»: día y minutos de cada semana; (4) «FALTA» con cada [FALTA]. La tabla define la forma; el contenido sale de mi banco.

### ANTES DE RESPONDER
Verifica que: cada pieza es del banco; cada suma se recalculó dos veces y coincide; ninguna semana supera mis minutos usables; ninguna pieza cae en un día en que no publico; mi fecha propia está en su día; no hay ideas nuevas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Si el banco no alcanza para llenar una semana, deja los huecos y dilo…",
          why: "Evita que rellene con ideas genéricas: un hueco a la vista es mejor que una pieza inventada.",
        },
        {
          part: "Calcula la suma con los minutos por pieza que te di, muestra la cuenta…",
          why: "Te da algo que comprobar: la cuenta visible permite repetirla en tu hoja.",
        },
        {
          part: "No añadas fechas comerciales ni feriados: los agrego yo.",
          why: "Las fechas y los feriados varían por país: las aportas y comprueban tú.",
        },
      ],
      evaluate: "Recalcula cada semana en tu hoja y compárala con la línea de totales.",
      improve: "Si quedan huecos, añade ideas a tu banco en lugar de pedirle que las invente.",
      warnings: ["Puede equivocarse al sumar aunque muestre la cuenta: la referencia es tu hoja."],
    },

    revision: {
      title: "Prompt de revisión: recalcular y puntuar",
      objective: "Que la IA recalcule cada semana desde cero, señale las diferencias y puntúe el calendario con la rúbrica.",
      whenToUse: "Justo después de recibir el calendario, en la misma conversación, y con tu hoja abierta para contrastar.",
      variables: [{ name: "CALENDARIO", description: "El calendario que quieres revisar, con su tabla.", example: "La tabla del prompt de calendario" }],
      prompt: `Actúa como revisor de calendarios de contenido para un negocio pequeño. Tu destinatario es la persona dueña, que verificará tus cifras en su hoja. Tu objetivo es recalcular la suma de cada semana desde cero y puntuar el calendario con una rúbrica fija. No lo rehagas.

### CONTEXTO
Usa el banco, los tiempos por formato, los minutos usables y las fechas de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Calendario a revisar:
{{CALENDARIO}}

### RÚBRICA (puntúa cada criterio de 0 a 2: 0 = no cumple, 1 = en parte, 2 = cumple)
${LISTA_CRITERIOS}

### REGLAS
1. Recalcula desde cero la suma de cada semana, pieza por pieza, con los tiempos por formato de esta conversación; ignora los totales que traiga el calendario.
2. Si tu suma difiere de la declarada, dilo con las dos cifras.
3. Si alguna semana supera los minutos usables, o «${CRITERIOS[0].label}» saca 0, marca el calendario NO USAR hasta corregirlo.
4. Cada puntaje se apoya en un fragmento literal del calendario, entre comillas.
5. No des por buenas fechas comerciales ni feriados: lista las que aparezcan y dime que las compruebo yo.
6. No pidas datos que no necesites; si algo es ambiguo, pregúntame.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Semana | Piezas | Producción | Publicación | Total recalculado | Total declarado | ¿Cabe?; (2) una tabla con columnas fijas: Criterio | Puntaje (0-2) | Fragmento que lo justifica, con el total sobre ${MAXIMO} y el veredicto «${RESULTADOS[0].label}» (menos de ${RESULTADOS[1].min}), «${RESULTADOS[1].label}» (de ${RESULTADOS[1].min} a ${RESULTADOS[2].min - 1}) o «${RESULTADOS[2].label}» (${RESULTADOS[2].min} o más); (3) «Para comprobar tú»: las fechas y los datos con vigencia. La tabla define la forma; el contenido sale de mi calendario.

### ANTES DE RESPONDER
Verifica que: recalculaste cada semana dos veces; cada puntaje tiene su fragmento literal; los totales de la rúbrica suman bien (máximo ${MAXIMO}); aplicaste NO USAR donde correspondía; no reescribiste el calendario. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Recalcula desde cero la suma de cada semana… ignora los totales que traiga el calendario.",
          why: "Evita que confirme una cuenta ajena: la suma se rehace en lugar de darse por buena.",
        },
        {
          part: "Si tu suma difiere de la declarada, dilo con las dos cifras.",
          why: "Convierte la diferencia en algo que puedes comprobar con una sola resta.",
        },
        {
          part: "…marca el calendario NO USAR hasta corregirlo.",
          why: "Un calendario que no cabe no se salva con buenas notas en lo demás.",
        },
      ],
      evaluate: "Compara sus sumas con las de tu hoja: si difieren, confía en tu hoja.",
      improve: "Si puntúa todo casi igual, pide más severidad en «Capacidad» y «Fechas».",
      warnings: ["Puede equivocarse al recalcular: repite tú al menos la semana con más piezas."],
    },

    ajuste: {
      title: "Prompt de ajuste: mover lo que no cabe",
      objective: "Que la IA corrija solo lo que falla, moviendo o quitando las piezas mínimas, y muestre las sumas nuevas.",
      whenToUse: "Después de la revisión, cuando alguna semana no cabe.",
      variables: [
        { name: "PROBLEMAS", description: "Lo que falló, con tus cifras.", example: "La semana 3 suma 145 minutos y el máximo es 144" },
        { name: "NO_TOCAR", description: "Piezas o fechas que no se pueden mover.", example: "La pieza F, por ser mi aniversario" },
      ],
      prompt: `Actúa como editor de calendarios de contenido para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo que falla, moviendo o quitando las piezas mínimas necesarias, sin tocar lo demás.

### CONTEXTO
Usa el calendario, el banco, los tiempos por formato, los minutos usables y los días de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Problemas que detecté (con mis cifras):
{{PROBLEMAS}}

Lo que no se puede mover:
{{NO_TOCAR}}

### REGLAS
1. Mueve o quita el mínimo de piezas; no añadas ideas nuevas ni cambies formatos ni tiempos.
2. Prefiere mover una pieza a una semana con espacio antes que quitarla.
3. Cada semana debe quedar dentro de mis minutos usables: recalcula cada suma y muestra la cuenta.
4. Respeta lo que no se puede mover, mis días de publicación y mis fechas propias. Si no puedes corregir sin romperlos, dilo y dime qué pieza quitarías.
5. Si mis cifras de los problemas no coinciden con las tuyas, dímelo antes de cambiar nada.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla con columnas fijas Pieza | De (semana y día) | A (semana y día) o QUITADA | Motivo; (2) «Calendario final»: una tabla con columnas fijas Semana | Día | Idea | Formato | Minutos; (3) «Totales por semana»: producción + publicación = total. Las tablas definen la forma; el contenido sale de mi calendario.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo necesario; ninguna semana supera mis minutos usables (recalcula cada una dos veces); no hay ideas nuevas; lo que no se puede mover sigue igual; ninguna pieza cae en un día en que no publico. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Mueve o quita el mínimo de piezas; no añadas ideas nuevas ni cambies formatos ni tiempos.",
          why: "Limita la corrección a lo que falló, para que no rehaga un calendario que ya estaba bien.",
        },
        {
          part: "Prefiere mover una pieza a una semana con espacio antes que quitarla.",
          why: "Conserva el trabajo planeado: un hueco en una semana se compensa en otra.",
        },
        {
          part: "Si mis cifras de los problemas no coinciden con las tuyas, dímelo…",
          why: "Evita corregir a ciegas sobre una cuenta que ella también podría tener mal.",
        },
      ],
      evaluate: "Recalcula cada semana del calendario final en tu hoja.",
      improve: "Si tras el ajuste una semana queda con muy pocas piezas, añade ideas a tu banco en vez de pedirlas.",
    },

    reciclaje: {
      title: "Prompt de reciclaje: volver a usar piezas ya publicadas",
      objective: "Que la IA proponga qué piezas ya publicadas reutilizar, con otro formato u otro ángulo y los mismos datos, sin pasarte de tu tiempo.",
      whenToUse: "Cuando ya hay piezas publicadas y una semana con espacio.",
      variables: [
        { name: "PUBLICADAS", description: "Las piezas ya publicadas, con su semana y su formato.", example: "D: semana 1, serie de imágenes" },
        { name: "ESPERA_MINIMA", description: "Cuántas semanas esperar antes de reutilizar una pieza.", example: "3 semanas" },
        { name: "MINUTOS_POR_RECICLAJE", description: "Cuánto te cuesta reciclar una pieza, con su publicación.", example: `${MINUTOS_RECICLAR} minutos` },
      ],
      prompt: `Actúa como editor de contenido para un negocio pequeño. Tu destinatario es la persona dueña, que quiere reutilizar lo que ya publicó sin que parezca repetido. Tu objetivo es proponer qué piezas reciclar, con qué cambios y en qué semana, sin pasarse de su tiempo.

### CONTEXTO
Usa el calendario final, los minutos usables y las fechas propias de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Piezas ya publicadas:
{{PUBLICADAS}}

Espera mínima antes de reutilizar una pieza: {{ESPERA_MINIMA}}
Costo de reciclar una pieza: {{MINUTOS_POR_RECICLAJE}}

### REGLAS
1. Recicla solo piezas de mi lista de publicadas, no más de una vez cada una y no antes de la espera mínima.
2. Cambia el formato o el ángulo, pero no los datos. Todo dato con vigencia (menús, precios, fechas) márcalo como [FALTA: dato actualizado] y lo aporto yo.
3. No recicles piezas ligadas a una fecha propia ni con datos que cambian cada semana; lista cuáles y por qué en «No se recicla».
4. No superes mis minutos usables en la semana destino: recalcula la suma con el costo de reciclar y muestra la cuenta. Si una pieza no cabe, no la incluyas y dilo.
5. No republiques una pieza idéntica: si no puedes cambiarle nada, no la recicles.
6. Distingue en cada fila lo que cambia y lo que no.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Pieza original | Semana original | Versión reciclada | Semana destino | Minutos | Qué cambia | Qué no cambia; (2) «No se recicla»: cada pieza con su motivo; (3) «Total de la semana destino»: la suma con la cuenta. La tabla define la forma; el contenido sale de mis piezas.

### ANTES DE RESPONDER
Verifica que: respetaste la espera mínima; ninguna pieza reciclada cambia sus datos; la semana destino no supera mis minutos usables (recalcula la suma dos veces); ninguna pieza ligada a una fecha o con datos que cambian está en la tabla; nada quedó idéntico. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia el formato o el ángulo, pero no los datos.",
          why: "Reutilizar es cambiar la forma, no la información que ya verificaste.",
        },
        {
          part: "No recicles piezas ligadas a una fecha propia ni con datos que cambian cada semana…",
          why: "Un menú viejo o un aniversario pasado son justo lo que no debe volver a salir.",
        },
        {
          part: "No superes mis minutos usables en la semana destino…",
          why: "Un reciclaje que rompe tu capacidad reproduce el problema que resolvió el calendario.",
        },
      ],
      evaluate: "Comprueba que la semana destino suma lo que dice y que ninguna pieza tiene datos vencidos.",
      improve: "Si todo queda en «No se recicla», amplía tu lista de piezas publicadas o baja la espera mínima.",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: `Salida ilustrativa, redactada aplicando el prompt de calendario al caso de Mesa Larga (${USABLES} minutos usables). La tuya será distinta.`,
    parts: [
      {
        type: "table",
        table: {
          caption: "Primer calendario, tal como llega",
          purpose: "Ver el calendario con el formato que pidió el prompt, para recalcular cada semana.",
          columns: ["Semana", "Día", "Idea", "Formato", "Minutos"],
          rows: filas(PRIMERO),
          note:
            "Totales por semana: " +
            totales(PRIMERO, { semana: 3, total: 130 }) +
            ". Bloque de producción: lunes, con " +
            [1, 2, 3, 4].map((s) => `${suma(PRIMERO, s).prod} min en la semana ${s}`).join(", ") +
            ". FALTA: [FALTA: más ideas en el banco para llenar la semana 4].",
        },
      },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "calendario",
    title: "Puntúa un calendario",
    intro:
      "Elige un calendario y respóndele a los cinco criterios: 0, 1 o 2 puntos cada uno, hasta " +
      MAXIMO +
      ". Si «" +
      CRITERIOS[0].label +
      "» saca 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.",
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro: "El calendario parece completo y la IA muestra cuentas. Aun así hay que rehacerlas: es la única forma de saber si cabe.",
    criteria: [
      {
        criterionId: "capacidad",
        verdict: "risk",
        comment: `La semana 3 suma ${suma(PRIMERO, 3).total} minutos (${suma(PRIMERO, 3).prod} de producción y ${suma(PRIMERO, 3).pub} de publicación), no los 130 que declara, y pasa por uno los ${USABLES} usables. La cuenta declarada, «${suma(PRIMERO, 3).prod} + ${suma(PRIMERO, 3).pub} = 130», está mal.`,
      },
      {
        criterionId: "origen",
        verdict: "ok",
        comment: "Todas las piezas son del banco y la semana 4 quedó con dos: el prompt dejó el hueco en lugar de inventar ideas.",
      },
      {
        criterionId: "fechas",
        verdict: "ok",
        comment: "El aniversario cae el sábado de la semana 3 y ninguna pieza cae en domingo.",
      },
      {
        criterionId: "variedad",
        verdict: "improve",
        comment: "La semana 4 tiene solo dos imágenes con texto: es consecuencia de que el banco no alcanzó.",
      },
      {
        criterionId: "lote",
        verdict: "ok",
        comment: "Cada semana indica un bloque de producción el lunes con los minutos de producción de sus piezas.",
      },
    ],
    conclusion:
      "Un calendario bien presentado puede no caber. La diferencia está en una sola semana y se arregla moviendo una pieza, pero solo se ve al recalcular.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir lo mínimo: una pieza que se mueve, no un calendario que se rehace.",
    promptId: "ajuste",
    why: "El análisis mostró un solo problema de capacidad. El prompt limita el cambio a mover o quitar piezas, pide recalcular cada suma y respeta lo que no puede moverse.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de ajuste, con PROBLEMAS y NO_TOCAR del ejemplo. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Cambios del ajuste",
          purpose: "Comprobar qué se movió y por qué, y que lo que no podía moverse sigue igual.",
          columns: ["Pieza", "De (semana y día)", "A (semana y día) o QUITADA", "Motivo"],
          rows: [
            ["H · El equipo de cocina, presentado", "Semana 3, viernes", "Semana 4, viernes", `La semana 3 pasaba de ${USABLES}; la 4 tenía espacio.`],
          ],
        },
      },
      {
        type: "text",
        text: "**Calendario final:** en la tabla siguiente. **Totales por semana:** " + totales(FINAL) + ".",
      },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Planear sin medir tus tiempos",
      whyItHurts: "Un tiempo por pieza inventado hace que todas las sumas salgan bien y ninguna semana se cumpla.",
      instead: "Cronometra tus últimas publicaciones antes de planear.",
    },
    {
      title: "Llenar el cien por ciento de tu tiempo",
      whyItHurts: "Sin reserva, el primer imprevisto rompe la semana y el calendario se abandona.",
      instead: "Descuenta una reserva antes de calcular tus minutos usables.",
    },
    {
      title: "Reciclar una pieza sin cambiarle nada",
      whyItHurts: "Quien ya la vio la reconoce, y una con datos vencidos puede generar reclamos.",
      instead: "Cambia el formato o el ángulo, espera unas semanas y actualiza los datos con vigencia.",
    },
    {
      title: "Dar por buena una fecha que no verificaste",
      whyItHurts: "Una fecha comercial o un feriado equivocado se ve tan seguro como uno correcto.",
      instead: "Aporta tus fechas y comprueba cada una en una fuente oficial de tu país.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de comprometerte con el calendario, repasa esta lista.",
    items: [
      { label: "Recalculé en mi hoja la suma de cada semana.", detail: "No usé los totales que escribió la IA." },
      { label: "Mis tiempos por formato son los que medí, no una estimación." },
      { label: "Las fechas propias están en el día correcto." },
      { label: "Comprobé en una fuente oficial cada feriado o fecha comercial que añadí.", detail: "Varían según el país y cambian cada año." },
      { label: "Los datos con vigencia (menús, precios, horarios) están actualizados antes de cada publicación." },
      { label: "Tengo permiso para las fotos, marcas y textos que voy a usar." },
      { label: "Revisé las reglas de las plataformas y de mi país sobre lo que voy a publicar." },
    ],
    principle: "La IA reparte y ayuda a revisar. La persona verifica y decide.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con el calendario en marcha, el trabajo es que se sostenga y mejore.",
    steps: [
      { title: "Anota los minutos reales", detail: "Cada semana, cuánto tardó de verdad la producción y la publicación." },
      { title: "Corrige tus tiempos por formato", detail: "Si tus minutos reales difieren de los tuyos, actualiza la calculadora." },
      { title: "Traslada lo que no se publicó", detail: "Pasa a la semana siguiente lo que quedó sin hacer, en lugar de acumularlo." },
      { title: "Rehaz el calendario cada mes", detail: "Con un banco renovado; los tiempos, la reserva y las fechas cambian poco." },
      { title: "Guarda la hoja como plantilla", detail: "La próxima vez cambias solo lo que cambió." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena tu tiempo, pero tiene límites.",
    items: [
      { title: "No conoce tu ritmo", detail: "La IA no ve cuánto tardas ni qué imprevistos tienes: eso lo aportas tú." },
      { title: "Puede sumar mal o colocar mal una fecha", detail: "Aunque muestre la cuenta, puede equivocarse: por eso las sumas y las fechas se comprueban." },
      { title: "No programa ni publica", detail: "Reparte las piezas en semanas; publicarlas y programarlas depende de tu plataforma." },
      { title: "No sabe cuándo rinde mejor cada pieza", detail: "El horario y el día que mejor funcionan salen de tus propias estadísticas." },
      { title: "No sustituye las normas de publicidad", detail: "Las reglas sobre lo que publicas dependen de tu país y de la plataforma." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Un calendario que se cumple parte de tu tiempo real, no de tus ganas. Con tus tiempos medidos, una hoja que dice si cabe y una IA que reparte tus ideas dentro de ese límite, planificar deja de ser una fuente de culpa.",
    takeaways: [
      "Mide tu tiempo y descuenta una reserva antes de planificar.",
      "Cada semana entra con lo que puedes producir, no con lo que quisieras.",
      "Produce por lotes y recicla cambiando la forma, no los datos.",
      "Las fechas y los feriados los aportas y compruebas tú.",
    ],
    nextGuide: "crear-publicaciones-para-redes-sociales-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["prompt", "asistente-ia", "variable", "hoja-de-calculo", "formato", "lote", "reciclaje", "rubrica", "dato-inventado"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Cuántas piezas por semana debo planear?",
      answer: "Las que caben en tus minutos usables. No hay una cifra universal: depende de tu tiempo y de tus formatos, y por eso la calculadora usa los tuyos.",
    },
    {
      question: "¿Y si mis tiempos por formato cambian?",
      answer: "Actualízalos en la calculadora y pide el calendario de nuevo. Con el uso, tus tiempos reales suelen acercarse y el calendario se vuelve más fiable.",
    },
    {
      question: "¿Puedo pedirle a la IA las fechas comerciales y los feriados?",
      answer: "Puede equivocarse, y varían según el país y el año. Es más seguro que las aportes tú, comprobadas en una fuente oficial, y que el prompt las respete.",
    },
    {
      question: "¿Cada cuánto rehago el calendario?",
      answer: "Una vez al mes, con un banco de ideas renovado. Si te atrasas antes, traslada lo pendiente en lugar de rehacerlo entero.",
    },
  ],
});
