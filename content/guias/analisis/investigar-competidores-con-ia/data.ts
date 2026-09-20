import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * analisis/investigar-competidores-con-ia
 *
 * Tipo: estrategia y planificación + decisión o comparación. No es una guía de números: los precios del caso son
 * datos, no cuentas. Todo el caso (Gimnasio Cima, los gimnasios A, B y C, sus horarios, precios, reseñas y las fechas
 * de consulta) es FICTICIO: no describe ningún negocio real. Los ejemplos de la IA están redactados aplicando
 * literalmente cada prompt: no proceden de una conversación real ni de una prueba del autor (esas viven en
 * `evidence.pruebas`, que solo rellena el autor). El pedido ingenuo es ILUSTRATIVO. La guía no cita fuentes externas:
 * los datos sobre competidores los aporta siempre la persona, con su fuente y su fecha.
 *
 * Fuente única de verdad: la ficha de evidencia (EVID), los tipos de dato (TIPOS), las columnas de la ficha
 * (COL_FICHA), los criterios (CRITERIOS), los umbrales (RESULTADOS) y los puntajes (PUNTAJES) se definen UNA vez y los
 * leen las tablas, los prompts, los ejemplos y la rúbrica.
 */
const slot = guideSlots("analisis", "investigar-competidores-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const TIPOS = ["Dato propio", "Publicado por el competidor", "Observado por mí", "Opinión de clientes", "Estimación mía"] as const;
const COL_FICHA = ["ID", "Negocio", "Dato", "Tipo de dato", "Fuente", "Fecha de consulta"];
const COL_HIP = ["Observación (con su evidencia)", "Hipótesis (no hecho)", "Qué la debilita", "Cómo comprobarla"];
const NEGOCIO = "Gimnasio Cima (ficticio), gimnasio de barrio con clases en grupos pequeños";
const DECISION = "Decidir cómo presentar mi gimnasio frente a los otros tres del barrio";

type Fila = { id: string; quien: string; dato: string; tipo: (typeof TIPOS)[number]; fuente: string; fecha: string };
/** La ficha tal como la arma la persona la primera vez: dos filas con un defecto (E09 sin fecha; E12 con el tipo equivocado). */
const EVID: Fila[] = [
  { id: "E01", quien: "Mi negocio", dato: "Horario: lunes a sábado de 6:30 a 21:00", tipo: "Dato propio", fuente: "Mis registros", fecha: "2026-09-15" },
  { id: "E02", quien: "Mi negocio", dato: "Plan mensual de $35, con todas las clases", tipo: "Dato propio", fuente: "Mis registros", fecha: "2026-09-15" },
  { id: "E03", quien: "Mi negocio", dato: "Clases en grupos de máximo 10 personas", tipo: "Dato propio", fuente: "Mis registros", fecha: "2026-09-15" },
  { id: "E04", quien: "Gimnasio A", dato: "Horario: lunes a sábado de 6:00 a 22:00", tipo: "Publicado por el competidor", fuente: "Sitio web, página de horarios", fecha: "2026-09-08" },
  { id: "E05", quien: "Gimnasio A", dato: "Plan mensual de $30, solo sala de máquinas", tipo: "Observado por mí", fuente: "Cartel en la entrada (foto propia)", fecha: "2026-09-10" },
  { id: "E06", quien: "Gimnasio A", dato: "Su horario publicado no incluye clases", tipo: "Observado por mí", fuente: "Sitio web, página de horarios", fecha: "2026-09-08" },
  { id: "E07", quien: "Gimnasio B", dato: "Clases de spinning y funcional de 7:00 a 20:00", tipo: "Publicado por el competidor", fuente: "Sitio web, página de clases", fecha: "2026-09-08" },
  { id: "E08", quien: "Gimnasio B", dato: "Plan mensual de $45, con 8 clases", tipo: "Publicado por el competidor", fuente: "Sitio web, página de planes", fecha: "2026-09-08" },
  { id: "E09", quien: "Gimnasio B", dato: "Reserva de clases por aplicación", tipo: "Publicado por el competidor", fuente: "Sitio web, página de clases", fecha: "(falta)" },
  { id: "E10", quien: "Gimnasio C", dato: "Abierto las 24 horas", tipo: "Publicado por el competidor", fuente: "Sitio web, página principal", fecha: "2026-09-12" },
  { id: "E11", quien: "Gimnasio C", dato: "Plan mensual de $25, sin clases", tipo: "Publicado por el competidor", fuente: "Sitio web, página de planes", fecha: "2026-09-12" },
  { id: "E12", quien: "Gimnasio C", dato: "3 de las 12 reseñas públicas que leí mencionan suciedad los fines de semana", tipo: "Observado por mí", fuente: "Reseñas públicas de su perfil", fecha: "2026-09-12" },
];
const HAY = (id: string) => EVID.find((e) => e.id === id)!;
const SIN_PROBLEMA = EVID.map((e) => e.id).filter((id) => !["E06", "E09", "E12"].includes(id));
const compacta = (ids: string[]) => {
  const n = (id: string) => Number(id.slice(1));
  const tramos: string[] = [];
  for (let i = 0; i < ids.length; ) {
    let j = i;
    while (j + 1 < ids.length && n(ids[j + 1]) === n(ids[j]) + 1) j++;
    tramos.push(j === i ? ids[i] : j === i + 1 ? `${ids[i]}, ${ids[j]}` : `${ids[i]}–${ids[j]}`);
    i = j + 1;
  }
  return tramos.join(", ");
};

/* plan de investigación (salida del prompt `plan`) */
const PLAN_FILAS = [
  ["Horarios", "¿Cuándo abre cada uno y qué días?", "Sitio web, redes y carteles", "Si tienen turnos o servicios que no publican."],
  ["Planes y precios", "¿Qué planes ofrece cada uno y qué incluye cada plan?", "Sitio web y carteles", "Descuentos o promociones que no se publican."],
  ["Servicios", "¿Ofrece clases y de qué tipo?", "Sitio web y redes", "Cuántas personas hay en cada clase."],
  ["Lo que dicen los clientes", "¿Qué dicen en público quienes ya van?", "Reseñas públicas", "Qué opinan los clientes que no escriben reseñas."],
  ["Cómo se presentan", "¿Con qué palabras se describen?", "Sitio web y redes", "Cómo son en realidad."],
];

/* revisión de la ficha (salida del prompt `revision`) */
const REVISION_FILAS = [
  ["E06", "Es la ausencia de un dato: su horario publicado no incluye clases.", "No prueba que no ofrezca clases: puede no publicarlas.", "Mirar otra fuente, como sus redes, antes de afirmarlo."],
  ["E09", "No tiene fecha de consulta.", "Sin fecha no sabes si sigue vigente.", "La fecha en que lo viste."],
  ["E12", "Está como «Observado por mí», pero es lo que dicen los clientes.", "Una opinión no es un hecho.", "Cambiar el tipo a «Opinión de clientes»."],
];

/* síntesis (salida del prompt `sintesis`): cada celda cita su id */
const c = (txt: string, ...ids: string[]) => `${txt} [${ids.join(", ")}]`;
const COMPARACION = [
  ["Horario", c("6:30–21:00, lunes a sábado", "E01"), c("6:00–22:00, lunes a sábado", "E04"), c("Clases de 7:00 a 20:00", "E07"), c("24 horas", "E10")],
  ["Plan mensual", c("$35, todas las clases", "E02"), c("$30, solo máquinas", "E05"), c("$45, 8 clases", "E08"), c("$25, sin clases", "E11")],
  ["Clases", c("Sí, grupos de máximo 10", "E03"), c("No las publica", "E06"), c("Spinning y funcional", "E07"), c("Sin clases", "E11")],
  ["Tamaño de los grupos", c("Máximo 10", "E03"), "Sin dato", "Sin dato", "Sin dato"],
  ["Opiniones públicas", "Sin dato", "Sin dato", "Sin dato", c("3 de 12 reseñas mencionan suciedad los fines de semana; es una opinión", "E12")],
];
const H1_ANTES = "HIPÓTESIS: Cima ocupa un punto intermedio de precio.";
const H3_ANTES = "HIPÓTESIS: C tiene un problema de limpieza los fines de semana.";
const COMP3_ANTES = "Investigar más sobre C.";
const HIPOTESIS_PRIMERA = [
  [
    `Planes mensuales: Cima $35 con todas las clases [E02]; A $30, solo máquinas [E05]; B $45, con 8 clases [E08]; C $25, sin clases [E11].`,
    H1_ANTES,
    "Puede haber otros planes que no vi.",
    "Preguntar a mis clientes con qué gimnasios comparan el precio.",
  ],
  [
    "Solo B publica clases, y Cima tiene grupos de máximo 10 personas [E03, E06, E07, E11].",
    "HIPÓTESIS: los grupos pequeños diferencian a Cima de B.",
    "No hay dato del tamaño de los grupos de B.",
    "Mirar la aplicación de reservas de B o preguntarles el tamaño máximo de sus clases.",
  ],
  [
    "3 de las 12 reseñas públicas de C que leí mencionan suciedad los fines de semana; es una opinión de clientes [E12].",
    H3_ANTES,
    "Son 3 reseñas de un solo perfil.",
    COMP3_ANTES,
  ],
];
const H1_DESPUES = "HIPÓTESIS: entre los gimnasios con clases, Cima incluye todas las clases a $35 y B, 8 clases a $45 [E02, E08]; con A y C no hay precio comparable, porque no incluyen clases [E05, E11].";
const H3_DESPUES = "HIPÓTESIS: una parte de los clientes de C percibe poca limpieza los fines de semana (3 de 12 reseñas) [E12].";
const COMP3_DESPUES = "Leer las reseñas públicas de C de otras semanas y ver si la queja se repite; comprobar yo mismo la limpieza un fin de semana.";
const CAMBIOS = [
  [H1_ANTES, H1_DESPUES, "E02, E05, E08 y E11 son planes con contenido distinto: no se comparan por precio."],
  [H3_ANTES, H3_DESPUES, "E12 es una opinión de clientes con alcance limitado, no un hecho."],
  [COMP3_ANTES, COMP3_DESPUES, "La comprobación debe ser algo concreto que puedo hacer."],
];
const PROBLEMAS_TEXTO = `1) La hipótesis 1 compara precios de planes que incluyen cosas distintas. 2) La hipótesis 3 dice que C «tiene un problema» y solo hay una opinión en 3 de 12 reseñas. 3) «${COMP3_ANTES}» no dice qué hacer.`;

/* rúbrica */
const CRITERIOS = [
  { id: "fuentes", label: "Cada dato lleva su fuente", detail: "Cada dato de las tablas cita el id de una fila de tu ficha; ninguno sale de la memoria de la IA." },
  { id: "tipos", label: "Distingue hecho, opinión y estimación", detail: "Lo que dicen los clientes se presenta como opinión, con su alcance, y nada se afirma con más fuerza que su fuente." },
  { id: "vacios", label: "Marca «Sin dato» y no rellena", detail: "Lo que no está en tu ficha queda como «Sin dato» o en «FALTA», y no se lee como que el competidor no lo tiene." },
  { id: "comparable", label: "Compara solo lo comparable", detail: "Si dos datos miden cosas distintas, lo dice; no compara precios de planes con distinto contenido." },
  { id: "comprobar", label: "Dice cómo comprobar", detail: "Cada hipótesis propone algo concreto que puedes hacer con datos que puedes conseguir." },
  { id: "limites", label: "Dice lo que no se puede afirmar", detail: "Nombra los límites de la evidencia y no recomienda estrategias ni dice quién es mejor." },
] as const;
const RESULTADOS = [
  { min: 0, label: "No usar todavía", advice: "Fallan varios criterios: corrige con el prompt de ajuste o revisa primero tu ficha." },
  { min: 7, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado antes de apoyarte en él." },
  { min: 11, label: "Lista para comprobar", advice: "Cumple casi todo: comprueba las hipótesis con clientes antes de decidir." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { fuentes: 2, tipos: 1, vacios: 2, comparable: 1, comprobar: 1, limites: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "investigar-competidores-con-ia",
    category: "analisis",
    title: "Investigar competidores con IA",
    description:
      "Estructura una investigación de competidores con fuentes que tú aportas y usa la IA para ordenarlas y compararlas, sin dar por hechos datos inventados.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["estrategia-planificacion", "decision-comparacion"],
    estandarGuia: 3,
    usesExternalInfo: true,
    activoOriginal:
      "Plan de investigación, ficha de evidencia copiable (con fuente, fecha y tipo de dato por fila), guía de cinco tipos de dato y rúbrica de seis criterios con dos bloqueos",
    problem: "Quieres saber en qué se diferencia tu negocio de otros parecidos, pero investigar y comparar te llevaría demasiado tiempo.",
    whyThisPage:
      "Insiste en que ningún dato sobre competidores sale de la memoria de la IA: cada dato lleva su fuente y se distingue lo aportado por el usuario de lo generado.",
    relatedGuides: ["analizar-ventas-con-ia", "crear-anuncios-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Reúne tú los datos de los negocios con los que te comparan, ponles fuente y fecha, y deja que la IA los ordene, los compare y proponga hipótesis de diferenciación que luego comprobarás.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Unas tres horas la primera vez, la mayor parte reuniendo datos",
    needs: ["Un asistente de IA de chat", "Una hoja de cálculo o un documento para la ficha", "De tres a cinco negocios con los que te comparan tus clientes", "Acceso a sus fuentes públicas: web, redes, carteles y reseñas"],
    result: "Un plan de investigación, una ficha de evidencia revisada y una comparación con hipótesis de diferenciación y su forma de comprobarlas",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el resultado: una ficha de evidencia con fuente y fecha por dato y una comparación que la cita.",
      description:
        "A la izquierda, una tabla de evidencia con una columna de fuente y otra de fecha resaltadas; a la derecha, una tabla de comparación cuyas celdas llevan identificadores entre corchetes. Datos ficticios de gimnasios inventados. Sin logos ni nombres reales.",
      alt: "Una ficha de evidencia con fuente y fecha y, al lado, una tabla de comparación cuyas celdas citan la ficha.",
      caption: "Cada dato de la comparación se puede rastrear hasta su fuente.",
    }),
    ficha: slot("ficha-de-evidencia.webp", {
      section: "entrevista",
      ratio: "16/9",
      purpose: "Muestra la ficha de evidencia ya armada, con las columnas de fuente, fecha y tipo de dato.",
      description:
        "La ficha con doce filas de tres negocios inventados y el tuyo. Resaltar las columnas «Tipo de dato», «Fuente» y «Fecha de consulta», y marcar con un recuadro las dos filas con un defecto (una sin fecha y una con el tipo equivocado). Caso ficticio.",
      alt: "Tabla de evidencia con doce datos, cada uno con su fuente, su fecha y su tipo, y dos filas marcadas.",
      caption: "La ficha: un dato, una fuente, una fecha, un tipo.",
      zoom: true,
    }),
    revision: slot("revision-de-la-ficha.webp", {
      section: "prompt",
      ratio: "16/9",
      purpose: "Enseña a leer la revisión de la ficha y a corregir lo que señala.",
      description:
        "La tabla de problemas de la revisión al lado de las tres filas de la ficha que señala, con la corrección de cada una escrita debajo. Caso ficticio; ocultar datos de cuenta.",
      alt: "Tabla de problemas detectados en una ficha de evidencia junto a las filas de la ficha que señala.",
      caption: "Revisar la ficha antes de comparar.",
      zoom: true,
    }),
    primerResultado: slot("primera-comparacion.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver la primera comparación y localizar las frases que hay que revisar.",
      description:
        "La tabla de comparación y la de hipótesis que devolvió el asistente, con tres celdas resaltadas: la hipótesis del precio intermedio, la de limpieza y la comprobación «Investigar más sobre C». Caso ficticio.",
      alt: "Tablas de comparación e hipótesis devueltas por un asistente, con tres celdas resaltadas.",
      caption: "La primera comparación, con tres cosas que revisar.",
      zoom: true,
    }),
    contraste: slot("contraste-con-la-ficha.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar cada frase de la comparación con la fila de la ficha que la respalda.",
      description:
        "Cada hipótesis unida por una línea a las filas de la ficha que cita; las que no respaldan lo que dice, en rojo. Al lado, la rúbrica puntuada (9 de 12). Caso ficticio.",
      alt: "Hipótesis de una comparación conectadas con las filas de la ficha que las respaldan, con la rúbrica puntuada.",
      caption: "Cada hipótesis, contra su evidencia.",
      zoom: true,
    }),
    final: slot("hipotesis-corregidas.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra las tres correcciones del ajuste.",
      description:
        "La tabla de cambios con el antes y el después de cada frase y el motivo, con las frases nuevas resaltadas. Caso ficticio.",
      alt: "Tabla con tres cambios en una comparación de competidores: la frase anterior, la nueva y el motivo.",
      caption: "Tres cambios, el resto intacto.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "plan",
      purpose: "Prueba real del prompt de plan: la tabla de aspectos, la ficha y «FALTA».",
      description:
        "Captura de la tabla del plan y de la ficha de evidencia que propone. Usa solo la descripción de tu negocio, tu decisión y los nombres de tus competidores. Comprueba aparte que no aporta ningún dato de ellos. Ocultar datos personales y de cuenta.",
      alt: "Captura de un plan de investigación de competidores devuelto por un asistente.",
      caption: "Prueba del prompt de plan.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "revision",
      purpose: "Prueba real del prompt de revisión: la tabla de problemas y las filas sin problema.",
      description:
        "Captura de la tabla de problemas y de «Filas sin problema». Usa tu ficha o la del caso. Anota aparte si el asistente añadió algún dato que no estaba. Ocultar datos personales y de cuenta.",
      alt: "Captura de la revisión de una ficha de evidencia devuelta por un asistente.",
      caption: "Prueba del prompt de revisión.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "sintesis",
      purpose: "Prueba real del prompt de síntesis: la comparación, las hipótesis y los límites.",
      description:
        "Captura de las dos tablas, de «Con esta evidencia no se puede afirmar» y de «FALTA». Usa la ficha revisada. Comprueba aparte que cada id citado existe y respalda la frase. Ocultar datos personales y de cuenta.",
      alt: "Captura de una comparación de competidores con hipótesis devuelta por un asistente.",
      caption: "Prueba del prompt de síntesis.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una comparación con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Saber en qué te diferencias de otros negocios parecidos exige mirarlos: sus precios, sus horarios, lo que ofrecen y lo que dicen sus clientes. Hacerlo a mano lleva horas, y compararlo a ojo lleva a conclusiones de memoria: «ellos son más caros», «nadie hace lo que yo hago».\n\nLa IA parece un atajo: le preguntas por tus competidores y responde con detalle. El riesgo es que ese detalle puede ser inventado, y como suena a informe, te lo crees. Además, si comparas lo que no es comparable o tratas una opinión como un hecho, tu «diferenciación» se apoya en arena.\n\n**Ningún dato sobre tus competidores sale de la memoria de la IA: cada dato lo aportas tú, con su fuente y su fecha.**",
    symptoms: [
      "Tienes una idea de cómo son tus competidores, pero no sabes de dónde salió.",
      "Comparas precios sin saber si los planes incluyen lo mismo.",
      "Le preguntaste a una IA por otros negocios y no sabes qué parte era cierta.",
      "Quieres diferenciarte, pero no sabes en qué ni cómo comprobarlo.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con una comparación en la que cada dato se puede rastrear hasta su fuente y con hipótesis de diferenciación que sabes cómo comprobar.",
    deliverables: [
      { label: "Un plan de investigación", detail: "Qué mirar en cada competidor, dónde y con qué límites." },
      { label: "Una ficha de evidencia", detail: "Cada dato con su fuente, su fecha y su tipo." },
      { label: "Una comparación con hipótesis", detail: "Lo que muestra la evidencia, lo que no y cómo comprobar cada hipótesis." },
      { label: "Una rúbrica de seis criterios", detail: "Para revisar cualquier comparación de la IA antes de usarla." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes un negocio con varios competidores directos y quieres saber en qué te diferencias.",
      "Puedes dedicar unas horas a mirar sus fuentes públicas.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Quieres que la IA te cuente cómo son tus competidores: aquí solo trabaja con lo que tú reúnes.",
      "Buscas información privada de otros negocios: la guía se limita a fuentes públicas.",
      "Necesitas un estudio de mercado con cifras del sector: esto es una comparación de casos, no un estudio.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: NEGOCIO,
    situation:
      "Cima ofrece clases en grupos de hasta diez personas. En su barrio hay otros tres gimnasios. Quiere decidir cómo presentarse y no sabe en qué se diferencia de verdad. Todo es inventado para esta guía, incluidos los tres gimnasios.",
    goal: DECISION + ".",
    data: [
      { label: "Competidores", value: "Gimnasio A, Gimnasio B y Gimnasio C (ficticios)" },
      { label: "Fuentes públicas", value: "Sitio web, carteles, redes y reseñas públicas de cada uno" },
      { label: "Lo que sabe de sí mismo", value: "Su horario, su plan y el tamaño de sus grupos" },
      { label: "Lo que no sabe", value: "Cómo son los otros por dentro, más allá de lo que publican" },
    ],
    problem: "Cree que es el único con grupos pequeños y que su precio es «intermedio», pero no lo comprobó. Y una IA a la que preguntó le dio datos de los otros gimnasios sin decir de dónde salían.",
    application: "Pide un plan, reúne la evidencia en una ficha, la revisa, pide la comparación con hipótesis, la contrasta y corrige, y comprueba una hipótesis con clientes.",
    result: "Una comparación en la que cada dato cita su fila de la ficha y tres hipótesis con su forma de comprobarlas.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan la investigación.",
    blocks: [
      {
        title: "Un dato sin fuente y sin fecha no es un dato",
        detail: "Cada dato entra a la ficha con dónde lo viste y cuándo. Sin eso es una afirmación: puedes usarla como pista, no como hecho.",
      },
      {
        title: "No todo dato pesa lo mismo",
        detail: "Lo que un negocio publica, lo que tú viste, lo que dicen sus clientes y lo que estimas no tienen la misma fuerza. La ficha los separa.",
        example: "«Abre las 24 horas» lo publica el gimnasio; «está sucio» es lo que dicen algunos clientes.",
      },
      {
        title: "«Sin dato» no es «no lo tiene»",
        detail: "Que un competidor no publique clases no prueba que no las ofrezca. Lo que falta se marca, no se rellena.",
      },
      {
        title: "Diferenciarse se comprueba con clientes",
        detail: "Una comparación de fichas solo genera hipótesis. Que la diferenciación exista lo dicen tus clientes.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Investiga los gimnasios de mi barrio y dime en qué me diferencio.",
    whyInsufficient:
      "La IA no tiene fuentes que consultar en esa conversación y responde igual, con seguridad y con detalle. Lo que sale puede sonar a informe y ser inventado (ejemplo ilustrativo).",
    issues: [
      "No aporta ningún dato de los competidores: la IA tiene que inventarlos o recordarlos.",
      "No pide fuente ni fecha para nada.",
      "No separa lo que se sabe de lo que se supone.",
      "Le pide a la IA una conclusión que solo puedes comprobar tú.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Antes de abrir la IA, reúne cuatro cosas.",
    items: [
      { label: "La decisión", detail: "Qué vas a decidir con esta investigación. Sin decisión, cualquier dato parece útil.", required: true },
      { label: "Los negocios a comparar", detail: "De tres a cinco con los que tus clientes te comparan de verdad, incluidos los que no son iguales a ti.", required: true },
      { label: "Tus propios datos", detail: "Lo que sabes de tu negocio, con la misma ficha que usarás para los demás.", required: true },
      { label: "Acceso a fuentes públicas", detail: "Sus sitios web, redes, carteles y reseñas. Solo lo que cualquier cliente puede ver.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribe la IA y lo que dice tu evidencia",
      purpose: "Ver cómo un pedido sin datos produce afirmaciones que ninguna fuente respalda.",
      columns: ["Frase de la IA", "Lo que dice tu ficha"],
      rows: [
        ["«El Gimnasio A ofrece clases de yoga a las 7:00.»", `La ficha no tiene ningún dato de clases de A: su horario publicado no las incluye (${HAY("E06").id}).`],
        ["«El Gimnasio B cobra unos $40 al mes.»", `La ficha dice $45 con 8 clases (${HAY("E08").id}). La cifra de la IA no tiene fuente.`],
        ["«El Gimnasio C perdió clientes este año.»", "No hay ningún dato sobre eso: es una invención."],
        ["«Te diferencias por tu excelente atención.»", "Ninguna evidencia habla de atención, ni de tu negocio ni de los demás."],
      ],
      note: "Ejemplo ilustrativo, escrito a propósito.",
    },
    tipos: {
      caption: "Cinco tipos de dato",
      purpose: "Saber cómo tratar cada dato según de dónde viene.",
      columns: ["Tipo de dato", "Qué es", "Cómo tratarlo"],
      rows: [
        [TIPOS[0], "Lo que sabes de tu negocio.", "Es tu punto de partida; anota cuándo lo revisaste."],
        [TIPOS[1], "Lo que el negocio dice de sí mismo.", "Es su versión: puede estar desactualizada o incompleta."],
        [TIPOS[2], "Lo que viste tú, incluida la ausencia de un dato.", "Una ausencia no prueba nada."],
        [TIPOS[3], "Lo que dicen sus clientes en público.", "Cuenta cuántas opiniones leíste y cuántas dicen lo mismo."],
        [TIPOS[4], "Una cifra o idea tuya sin fuente directa.", "Márcala siempre y no la mezcles con hechos."],
      ],
      copyable: true,
    },
    plan: {
      caption: "Plan de investigación",
      purpose: "Saber qué mirar, dónde y qué límite tiene cada aspecto.",
      columns: ["Aspecto", "Pregunta", "Dónde mirar", "Lo que no te dirá"],
      rows: PLAN_FILAS,
      note: "Ejemplo generado con el prompt de plan. Cada dato que encuentres entra a la ficha.",
    },
    ficha: {
      caption: "Ficha de evidencia",
      purpose: "Anotar de dónde sale cada dato, cuándo lo viste y de qué tipo es.",
      columns: COL_FICHA,
      rows: EVID.map((e) => [e.id, e.quien, e.dato, e.tipo, e.fuente, e.fecha]),
      copyable: true,
      note: "Caso ficticio: la ficha de Cima con sus tres competidores. Tiene dos defectos a propósito.",
    },
    revision: {
      caption: "Revisión de la ficha",
      purpose: "Ver los problemas que hay que corregir antes de comparar.",
      columns: ["ID", "Problema", "Por qué importa", "Qué haría falta"],
      rows: REVISION_FILAS,
      note: `Ejemplo generado con el prompt de revisión. Filas sin problema: ${compacta(SIN_PROBLEMA)}. FALTA: ninguno.`,
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cuatro de los siete pasos llevan un prompt. Los otros tres los haces tú solo.",
    steps: [
      { title: "Define la decisión y a quién comparar", description: "Escribe qué vas a decidir y elige de tres a cinco negocios con los que tus clientes te comparan.", output: "Una decisión y una lista de negocios." },
      { title: "Pide el plan de investigación", description: "Entrega tu negocio, tu decisión y solo los nombres de los competidores, y pide qué mirar, dónde y con qué límites.", output: "Un plan y una ficha vacía." },
      { title: "Reúne la evidencia en la ficha", description: "Recorre las fuentes públicas del plan y anota cada dato con su fuente, su fecha y su tipo.", output: "Una ficha de evidencia." },
      { title: "Revisa la ficha con la IA", description: "Pega la ficha y pide que señale filas sin fuente, sin fecha, mal clasificadas o que no prueban lo que parece.", output: "Una ficha corregida." },
      { title: "Pide la comparación y las hipótesis", description: "Con la ficha revisada, pide una comparación con ids y hipótesis de diferenciación con su forma de comprobarlas.", output: "Una comparación y sus hipótesis." },
      { title: "Contrasta y corrige", description: "Comprueba cada frase contra tu ficha, puntúa con la rúbrica y pide cambiar solo lo señalado.", output: "Una comparación corregida." },
      { title: "Comprueba una hipótesis y decide", description: "Haz con tus clientes la comprobación propuesta y decide solo con lo comprobado.", output: "Una hipótesis confirmada o descartada." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    plan: {
      title: "Prompt de plan: qué mirar de tus competidores, sin aportar ningún dato",
      objective: "Obtener un plan con qué preguntar, dónde mirar y qué límite tiene cada aspecto, sin que la IA describa a tus competidores.",
      whenToUse: "Cuando tienes la decisión y la lista de negocios a comparar.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una o dos frases.", example: NEGOCIO },
        { name: "DECISION", description: "Lo que vas a decidir con la investigación.", example: DECISION },
        { name: "COMPETIDORES", description: "Solo sus nombres o su tipo, sin ningún dato.", example: "Gimnasio A, Gimnasio B y Gimnasio C" },
      ],
      prompt: `Actúa como asistente que planifica investigaciones de competidores para negocios pequeños. Tu destinatario es la persona dueña, que investigará por su cuenta. Tu objetivo es un plan de qué mirar, dónde y cómo anotarlo, sin aportar ningún dato sobre los competidores.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Lo que voy a decidir: {{DECISION}}
Negocios a comparar (solo nombres): {{COMPETIDORES}}

### REGLAS
1. No aportes ningún dato, cifra ni descripción de esos negocios, ni siquiera como ejemplo. Lo que sepas de ellos por tu entrenamiento no se usa.
2. Propón entre cuatro y seis aspectos, todos ligados a mi decisión.
3. Propón solo fuentes públicas que yo pueda mirar: sitio web, redes públicas, carteles y reseñas públicas. No propongas hacerte pasar por cliente, usar cuentas falsas, pedir datos confidenciales ni copiar contenido protegido.
4. Para cada aspecto di qué límite tiene: qué no me dirá con fuentes públicas.
5. Los tipos de dato son solo estos cinco: ${TIPOS.join(", ")}.
6. Si mi decisión o mi lista no bastan para planificar, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: Aspecto | Pregunta | Dónde mirar | Lo que no te dirá; (2) «Ficha de evidencia»: la tabla vacía con las columnas ${COL_FICHA.join(" | ")}; (3) «FALTA». La tabla fija la forma; el contenido sale de mi decisión.

### ANTES DE RESPONDER
Verifica que: no hay ningún dato, cifra ni descripción de los competidores; hay entre cuatro y seis aspectos; todas las fuentes son públicas y las puedo mirar yo; cada aspecto dice lo que no me dirá; solo usaste los cinco tipos de dato. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que reúna yo la evidencia y que la anote en la ficha, con su fuente y su fecha.`,
      explanation: [
        {
          part: "No aportes ningún dato, cifra ni descripción de esos negocios, ni siquiera como ejemplo.",
          why: "Impide que la IA mezcle en el plan detalles inventados o recordados de negocios que no puede comprobar.",
        },
        {
          part: "Propón solo fuentes públicas que yo pueda mirar",
          why: "Mantiene la investigación en lo que cualquier cliente puede ver, sin trucos ni información privada.",
        },
        {
          part: "Para cada aspecto di qué límite tiene",
          why: "Te avisa desde el principio de lo que la investigación no podrá decirte.",
        },
      ],
      evaluate: "Comprueba que el plan no dice nada de cómo son tus competidores y que cada aspecto tiene su límite.",
      improve: "Si añade un dato de un competidor, pídele que lo quite y que rehaga el plan sin ejemplos.",
    },

    revision: {
      title: "Prompt de revisión: qué filas de tu ficha no sostienen lo que parecen",
      objective: "Obtener una lista de las filas de la ficha con problemas de fuente, fecha, tipo o alcance, sin que la IA añada ni corrija ningún dato.",
      whenToUse: "Cuando terminaste de reunir la evidencia y antes de pedir la comparación.",
      variables: [
        { name: "DECISION", description: "Lo que vas a decidir con la investigación.", example: DECISION },
        { name: "FICHA", description: "Tu ficha de evidencia, completa.", example: "La tabla con sus doce filas" },
      ],
      prompt: `Actúa como revisor de evidencia para un negocio pequeño. Tu destinatario es la persona dueña, que corregirá su ficha. Tu objetivo es señalar qué filas no sostienen lo que parecen, sin añadir ni corregir ningún dato.

### CONTEXTO
Lo que voy a decidir: {{DECISION}}
Los tipos de dato válidos son: ${TIPOS.join(", ")}.

### DATOS (única fuente)
Mi ficha de evidencia:
{{FICHA}}

### REGLAS
1. Usa solo mi ficha. No añadas datos, no cambies cifras y no completes lo que falta con lo que sepas de esos negocios.
2. Revisa cada fila: ¿tiene fuente, fecha y un tipo válido?
3. Comprueba que el tipo es coherente: lo que dicen los clientes es «Opinión de clientes»; lo que el negocio publica es «Publicado por el competidor»; la ausencia de un dato es «Observado por mí» y no prueba nada.
4. Señala las filas que se contradicen y las que miden cosas distintas aunque parezcan comparables.
5. No des ninguna fila por verificada: verificar es mi trabajo.
6. Si falta información para revisar una fila, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: ID | Problema | Por qué importa | Qué haría falta; (2) «Filas sin problema»: los ids; (3) «FALTA». La tabla fija la forma; el contenido sale de mi ficha.

### ANTES DE RESPONDER
Verifica que: cada fila de la ficha está en la tabla o en «Filas sin problema»; no añadiste ni cambiaste ningún dato; cada tipo señalado está entre los válidos; no diste nada por verificado. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "sin añadir ni corregir ningún dato.",
          why: "La revisión señala; los datos los corriges tú con la fuente delante.",
        },
        {
          part: "la ausencia de un dato es «Observado por mí» y no prueba nada.",
          why: "Evita el error más frecuente: creer que lo que un negocio no publica no lo ofrece.",
        },
        {
          part: "No des ninguna fila por verificada",
          why: "Evita que la revisión suene a garantía: la comprobación de la fuente es tuya.",
        },
      ],
      evaluate: "Comprueba que cada fila aparece en la tabla o en «Filas sin problema» y que no añadió datos.",
      improve: "Si da alguna fila por verificada, pídele que quite esa frase y repita solo esa parte.",
    },

    sintesis: {
      title: "Prompt de síntesis: comparación e hipótesis de diferenciación",
      objective: "Obtener una comparación en la que cada dato cita su fila de la ficha y unas hipótesis de diferenciación con su forma de comprobarlas.",
      whenToUse: "Cuando tu ficha está revisada y corregida.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio.", example: NEGOCIO },
        { name: "DECISION", description: "Lo que vas a decidir.", example: DECISION },
        { name: "FICHA", description: "Tu ficha corregida, completa.", example: "La tabla con sus doce filas" },
      ],
      prompt: `Actúa como analista de competidores para negocios pequeños. Tu destinatario es la persona dueña, que decidirá y comprobará con sus clientes. Tu objetivo es comparar mi negocio con los demás usando SOLO mi ficha y proponer hipótesis de diferenciación, sin elegir por ella.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Lo que voy a decidir: {{DECISION}}

### DATOS (única fuente)
Mi ficha de evidencia, revisada:
{{FICHA}}

### REGLAS
1. Usa solo la ficha. Nada de lo que sepas de estos negocios entra en tus tablas. Cada dato que escribas lleva el id de su fila entre corchetes.
2. Si un dato no está en la ficha, escribe «Sin dato». «Sin dato» no significa que el negocio no lo tenga.
3. Conserva el tipo de dato: lo que dicen los clientes se presenta como opinión, con su alcance, nunca como un hecho.
4. Compara solo lo comparable. Si dos datos miden cosas distintas, dilo en la celda.
5. Cada hipótesis dice en qué evidencia se apoya (ids), qué la debilita y cómo comprobarla con algo concreto que yo pueda hacer.
6. No recomiendes estrategias, no digas cuál negocio es mejor y no afirmes causas ni intenciones de los competidores.
7. Di lo que no se puede afirmar con esta evidencia. Si falta un dato, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) «Comparación»: una tabla de columnas fijas, una por negocio: Aspecto | Mi negocio | y una columna por competidor; (2) «Hipótesis de diferenciación»: una tabla de columnas fijas: ${COL_HIP.join(" | ")}; (3) «Con esta evidencia no se puede afirmar»; (4) «FALTA». La tabla fija la forma; el contenido sale de mi ficha.

### ANTES DE RESPONDER
Verifica que: cada dato de las tablas cita un id que existe en mi ficha y dice lo mismo que esa fila; lo que falta dice «Sin dato»; las opiniones están como opiniones; cada hipótesis dice cómo comprobarla; no hay recomendaciones ni causas afirmadas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Usa solo la ficha. Nada de lo que sepas de estos negocios entra en tus tablas.",
          why: "Es la regla central: todo dato tiene su fila, así que puedes comprobar cualquier celda en su fuente.",
        },
        {
          part: "«Sin dato» no significa que el negocio no lo tenga.",
          why: "Evita convertir un vacío de tu investigación en una ventaja que no has comprobado.",
        },
        {
          part: "cómo comprobarla con algo concreto que yo pueda hacer.",
          why: "Convierte cada hipótesis en una tarea, en lugar de dejarla como una idea suelta.",
        },
        {
          part: "«Con esta evidencia no se puede afirmar»",
          why: "Obliga a nombrar los límites, en lugar de dejar que la comparación suene más segura de lo que es.",
        },
      ],
      evaluate: "Comprueba que cada id citado existe y respalda la frase, y que ninguna opinión aparece como hecho.",
      improve: "Si aparece un dato sin id, pídele que lo quite o que lo mueva a «FALTA».",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las frases señaladas, apoyándose en las filas de la ficha, y dejar el resto intacto.",
      whenToUse: "Después de contrastar, cuando la comparación tiene un problema.",
      variables: [
        { name: "PROBLEMAS", description: "Lo que hay que corregir y por qué.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Lo que no puede cambiar.", example: "La tabla de comparación y los ids" },
      ],
      prompt: `Actúa como editor de análisis de competidores para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, usando mi ficha, y dejar intacto lo demás.

### CONTEXTO
Usa la ficha y la comparación de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Problemas que detecté:
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo lo señalado y lo que ese cambio obligue a ajustar.
2. Cada frase nueva se apoya en filas de mi ficha y cita sus ids. No añadas datos que no estén en ella.
3. Si un problema que te señalé no existe en la comparación, o mi ficha se contradice, dímelo antes de cambiar nada.
4. En «Motivo» cita las filas de la ficha que justifican el cambio.
5. No recomiendes estrategias. Si para una corrección falta un dato, escribe [FALTA: qué dato] en lugar de inventarlo.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla de columnas fijas: Antes | Después | Motivo; (2) «Sin cambios»: lo que no toqué; (3) «FALTA». La tabla fija la forma; el contenido sale de mi ficha.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada frase nueva cita ids que existen en mi ficha; cada «Motivo» cita sus filas; lo que no se puede tocar está idéntico; no hay recomendaciones. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo lo señalado",
          why: "Evita que rehaga partes que ya estaban respaldadas por la ficha.",
        },
        {
          part: "Cada frase nueva se apoya en filas de mi ficha y cita sus ids.",
          why: "Cada corrección queda con su respaldo y puedes comprobarla en la fuente.",
        },
        {
          part: "Si un problema que te señalé no existe en la comparación",
          why: "Evita corregir a ciegas un problema que tú pudiste señalar mal.",
        },
      ],
      evaluate: "Compara con la comparación anterior: solo deben cambiar las frases señaladas.",
      improve: "Si cambia la tabla de comparación, pide repetir solo lo señalado.",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de síntesis a la ficha corregida del caso. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Primera comparación, tal como llega",
          purpose: "Tener la comparación en el formato del prompt para contrastarla con la ficha.",
          columns: ["Aspecto", "Mi negocio", "Gimnasio A", "Gimnasio B", "Gimnasio C"],
          rows: COMPARACION,
        },
      },
      {
        type: "table",
        table: {
          caption: "Hipótesis de diferenciación, tal como llegan",
          purpose: "Tener las hipótesis en el formato del prompt para contrastarlas.",
          columns: COL_HIP,
          rows: HIPOTESIS_PRIMERA,
        },
      },
      { type: "text", text: "**Con esta evidencia no se puede afirmar:** que Cima sea la mejor opción por precio ni que A o C no ofrezcan lo que no publican. **FALTA:** el tamaño de los grupos de B." },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "comparacion",
    title: "Puntúa una comparación de competidores",
    intro:
      `Puntúa la comparación en los seis criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `La comparación parece rigurosa: cada dato lleva su id y hay «Sin dato» donde falta. Se contrasta con la ficha y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      { criterionId: "fuentes", verdict: vered("fuentes"), comment: "Cada dato de las tablas cita un id que existe en la ficha y dice lo mismo que su fila." },
      {
        criterionId: "tipos",
        verdict: vered("tipos"),
        comment: "Presenta bien la opinión de C, con su alcance de 3 de 12 reseñas, pero la hipótesis afirma que C «tiene un problema de limpieza»: convierte una opinión en un hecho.",
      },
      { criterionId: "vacios", verdict: vered("vacios"), comment: "Marca «Sin dato» donde falta y lo lleva a «FALTA»: no lee un vacío como una ausencia." },
      {
        criterionId: "comparable",
        verdict: vered("comparable"),
        comment: "En la tabla aclara qué incluye cada plan, pero la hipótesis 1 usa los cuatro precios para decir que Cima está «en un punto intermedio», aunque los planes incluyen cosas distintas.",
      },
      { criterionId: "comprobar", verdict: vered("comprobar"), comment: "La hipótesis 3 se comprueba con «Investigar más sobre C»: no dice qué hacer." },
      { criterionId: "limites", verdict: vered("limites"), comment: "Nombra lo que no se puede afirmar y no recomienda estrategias, como pide el prompt." },
    ],
    conclusion: "Es una buena base: no inventa datos y cita su evidencia. Los tres defectos son de matiz y se leen bien a primera vista.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir tres frases, no rehacer la comparación.",
    promptId: "ajuste",
    why: "El contraste señaló una comparación de precios sin el mismo alcance, una opinión escrita como hecho y una comprobación vaga. El prompt limita el cambio a lo señalado, exige que cada frase nueva cite filas de la ficha y separa lo cambiado de lo que sigue igual.",
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
          purpose: "Comprobar qué frases cambiaron y por qué.",
          columns: ["Antes", "Después", "Motivo"],
          rows: CAMBIOS,
        },
      },
      { type: "text", text: "**Sin cambios:** la tabla de comparación y los ids. **FALTA:** ninguno." },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Preguntarle a la IA cómo son tus competidores",
      whyItHurts: "Responde con detalle aunque no tenga de dónde sacarlo, y ese detalle puede ser un dato inventado.",
      instead: "Reúne tú los datos y pídele solo que los ordene, los revise y los compare.",
    },
    {
      title: "Anotar datos sin fuente ni fecha",
      whyItHurts: "Meses después no sabrás si un precio sigue vigente ni de dónde salió.",
      instead: "Cada fila lleva su fuente y su fecha de consulta.",
    },
    {
      title: "Tratar una opinión como un hecho",
      whyItHurts: "Tres reseñas sobre suciedad no prueban que el lugar esté sucio.",
      instead: "Anota cuántas leíste y cuántas dicen lo mismo, y trátalo como opinión.",
    },
    {
      title: "Concluir que no lo tiene porque no lo publica",
      whyItHurts: "Puedes creer que eres el único con algo que otros hacen sin anunciarlo.",
      instead: "Marca «Sin dato» y comprueba con una pregunta abierta o con tus clientes.",
    },
    {
      title: "Conseguir datos con trucos",
      whyItHurts: "Hacerte pasar por otra persona o usar información que no es pública puede traerte problemas y quita valor a lo que encuentres.",
      instead: "Limítate a lo que cualquier cliente puede ver.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de decidir, marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Cada fila de la ficha tiene fuente, fecha y un tipo de dato válido." },
      { label: "Volví a abrir la fuente de los datos que sostienen mi decisión y coinciden." },
      { label: "Las opiniones aparecen como opiniones, con su alcance." },
      { label: "No leí «Sin dato» como «no lo tiene»." },
      { label: "Comparé solo planes o productos equivalentes, o anoté lo que difería." },
      { label: "Todo salió de fuentes públicas, sin hacerme pasar por otra persona, y no pegué nombres de clientes de las reseñas." },
      { label: "Revisé las condiciones de cada plataforma y las normas de mi país sobre uso de datos.", detail: "Cambian de un lugar a otro y aquí no se cubren." },
    ],
    principle: "La IA ordena, revisa y propone hipótesis. Los datos son tuyos y tú comprobaste su fuente.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la primera comparación hecha, la ficha se convierte en un recurso vivo.",
    steps: [
      { title: "Guarda la ficha con su fecha", detail: "Los precios y los horarios cambian: sin fecha no sabrás qué sigue vigente." },
      { title: "Actualízala cada cierto tiempo", detail: "Elige un intervalo y revisa solo las filas que cambian con más frecuencia." },
      { title: "Anota lo que comprobaste con clientes", detail: "Cada hipótesis confirmada o descartada, con su fecha y con lo que dijeron." },
      { title: "Añade un competidor sin rehacer todo", detail: "Suma sus filas a la ficha y repite solo la comparación." },
      { title: "Convierte una hipótesis en una prueba pequeña", detail: "Cambia una frase de tu presentación y mira si tus clientes lo notan." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena tu investigación, pero tiene límites claros.",
    items: [
      { title: "Solo ve lo público", detail: "No conoce cómo trabajan por dentro ni sus resultados, y no debe intentar averiguarlo." },
      { title: "La evidencia envejece", detail: "Un precio o un horario de hace meses puede haber cambiado." },
      { title: "No mide lo que tus clientes valoran", detail: "Una diferencia real puede no importarles, y solo ellos lo dicen." },
      { title: "No es asesoría legal", detail: "Las normas sobre uso de datos y competencia varían por país y por plataforma." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Investigar competidores con IA funciona cuando la ficha es tuya: cada dato con su fuente y su fecha, cada tipo de dato en su sitio y cada vacío marcado. Con eso, la comparación deja de ser una impresión y se convierte en hipótesis que puedes comprobar.",
    takeaways: [
      "Un dato sin fuente y sin fecha es solo una pista.",
      "Distingue lo que se publica, lo que viste y lo que opinan los clientes.",
      "«Sin dato» no es «no lo tiene».",
      "Una comparación de fichas genera hipótesis: compruébalas con tus clientes.",
    ],
    nextGuide: "crear-anuncios-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "dato-inventado", "evidencia", "diferenciacion", "hipotesis", "rubrica"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿La IA puede buscar en internet por mí?",
      answer:
        "Depende de la herramienta. Algunas buscan y citan enlaces y otras no. En todo caso, abre tú cada fuente antes de anotar el dato en la ficha.",
    },
    {
      question: "¿A cuántos competidores conviene investigar?",
      answer: "De tres a cinco suelen bastar. Elige los negocios con los que tus clientes te comparan, aunque no sean idénticos a ti.",
    },
    {
      question: "¿Puedo pegar reseñas de clientes de otros negocios?",
      answer: "Pega solo lo que necesites y quita los nombres de las personas. Anota cuántas reseñas leíste y cuántas dicen lo mismo, en lugar de copiarlas enteras.",
    },
    {
      question: "¿Qué hago si un competidor no publica sus precios?",
      answer: "Anótalo como «Sin dato». Puedes preguntar a tus clientes o pedir información como cualquier cliente potencial, siempre sin hacerte pasar por otra persona.",
    },
  ],
});
