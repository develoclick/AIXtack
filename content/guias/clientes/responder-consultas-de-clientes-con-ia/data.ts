import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * clientes/responder-consultas-de-clientes-con-ia
 *
 * Tipo: comunicación y atención al cliente. Todo el caso (el Taller Los Pinos, sus precios, horarios, políticas y
 * conversaciones) es FICTICIO. Las respuestas de la IA son EJEMPLOS GENERADOS: están redactadas aplicando
 * literalmente cada prompt a la base del caso; no proceden de una conversación real ni de una prueba del autor. La
 * guía no cita datos externos que caduquen: enseña un método. Las pruebas reales viven en `evidence.pruebas`, que
 * solo rellena el autor.
 *
 * Fuente única de verdad: los datos del taller (precio, duración, turnos, garantía), las columnas de la base
 * (COLUMNAS), la base misma (BASE), los criterios (CRITERIOS), los umbrales (RESULTADOS), los puntajes (PUNTAJES)
 * y las frases del ejemplo (S) se definen UNA vez; las tablas, los ejemplos, la rúbrica y los prompts los leen.
 */
const slot = guideSlots("clientes", "responder-consultas-de-clientes-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const DESDE = 35;
const HORAS = 2;
const TURNO_1 = "15:00";
const TURNO_2 = "16:30";
const DIAS_GARANTIA = 30;
const TONO = "Cercano y directo, sin fórmulas";

const COLUMNAS = [
  { nombre: "Respuesta aprobada", pide: "Lo que tu negocio responde y de lo que se hace responsable." },
  { nombre: "Dato que cambia", pide: "Lo que solo vale hoy y se pega cada vez, como los turnos o un precio vigente." },
  { nombre: "Responde una persona si…", pide: "Cuándo la IA no debe redactar." },
] as const;
const LISTA_COLUMNAS = COLUMNAS.map((c, i) => `${i + 1}. ${c.nombre}: ${c.pide}`).join("\n");

const BASE: [consulta: string, respuesta: string, cambia: string, persona: string][] = [
  ["Horario", "Lunes a viernes 8:00–17:30 y sábados 8:00–13:00. Domingos y festivos, cerrado.", "Festivos del mes", "—"],
  [
    "Cambio de aceite y filtro",
    `Desde $${DESDE}, según el vehículo. Para dar el precio exacto se necesitan marca, modelo y año. Tarda unas ${HORAS} horas.`,
    "Precio exacto por vehículo",
    "Vehículo de gama alta o duda sobre el tipo de aceite",
  ],
  ["Turnos", "Se agendan por WhatsApp con la marca, el modelo y el año del vehículo.", "Turnos libres de hoy", "Urgencia por avería en carretera"],
  ["Averías descritas por mensaje", "No se dan diagnósticos por mensaje: se invita a revisar el vehículo en el taller.", "—", "El cliente insiste en saber la causa"],
  ["Presupuestos", "Se entregan después de revisar el vehículo en el taller; no se dan por mensaje.", "—", "El cliente insiste en un precio de reparación"],
  ["Garantía", `${DIAS_GARANTIA} días en mano de obra (política del taller).`, "—", "Hay un reclamo"],
];
const DATOS_HOY = `Turnos libres hoy: ${TURNO_1} y ${TURNO_2}`;
const CONSULTA_BASE = "Buenas, ¿cuánto cuesta un cambio de aceite y me lo pueden hacer hoy?";
const CONSULTA = `${CONSULTA_BASE} Creo que mi auto también pierde un poco de aceite.`;
const MOTIVO_FALTANTE = "La base pide marca, modelo y año para dar el precio exacto.";

/* frases del ejemplo: cada una se define una sola vez y los textos se componen con ellas */
const S = {
  saludo: "¡Hola!",
  precio: `El cambio de aceite y filtro sale desde $${DESDE}, según el vehículo, y tarda unas ${HORAS} horas.`,
  turnos: `Hoy tenemos turno a las ${TURNO_1} y a las ${TURNO_2}.`,
  garantiaOk: `Tiene ${DIAS_GARANTIA} días de garantía en mano de obra.`,
  alcanceErr: "en todo el trabajo",
  alcanceOk: "en mano de obra",
  perdida: "Sobre la pérdida de aceite: por mensaje no podemos decirte la causa; hay que revisar el auto en el taller, y ahí te damos un presupuesto.",
  preguntaErr: "¿Qué modelo es y cuál de los dos horarios te sirve?",
  cambioPregunta: ["modelo", "marca, modelo y año"],
} as const;
const GARANTIA_ERR = S.garantiaOk.replace(S.alcanceOk, S.alcanceErr);
const PREGUNTA_OK = S.preguntaErr.replace(S.cambioPregunta[0], S.cambioPregunta[1]);
const BORRADOR_PRIMERO = [S.saludo, S.precio, S.turnos, GARANTIA_ERR, S.preguntaErr].join(" ");
const BORRADOR_FINAL = [S.saludo, S.precio, S.turnos, S.garantiaOk, S.perdida, PREGUNTA_OK].join(" ");

const PROBLEMAS = [
  { antes: GARANTIA_ERR, despues: S.garantiaOk, motivo: "La base dice «en mano de obra»: la cifra es correcta y el alcance no." },
  { antes: S.preguntaErr, despues: PREGUNTA_OK, motivo: MOTIVO_FALTANTE },
  { antes: "(no aparece)", despues: S.perdida, motivo: "El cliente también preguntó por la pérdida de aceite." },
];
const PROBLEMAS_TEXTO =
  `«${GARANTIA_ERR}»: la base dice «${S.alcanceOk}». ` +
  `«${S.preguntaErr}»: faltan la marca y el año. ` +
  "El borrador no atiende la pérdida de aceite que preguntó el cliente.";

const CORREO_CUERPO = [
  "Hola, gracias por escribir al Taller Los Pinos.",
  S.precio,
  S.turnos,
  S.garantiaOk,
  S.perdida,
  "Para reservar, respóndenos con la marca, el modelo y el año del vehículo y el horario que prefieres.",
  "Saludos, Taller Los Pinos",
].join(" ");
const CORREO_ASUNTO = "Cambio de aceite y turnos de hoy";
const REGLAS_CANAL = "Correo: asunto claro, saludo, párrafos cortos, cierre y firma «Taller Los Pinos»";

const CRITERIOS = [
  { id: "respaldo", label: "Cada dato sale de tu base", detail: "Cada precio, plazo, política o disponibilidad está en la base o en los datos de hoy, con su alcance." },
  { id: "limites", label: "No diagnostica ni promete", detail: "No da diagnósticos, garantías ni plazos que no estén escritos." },
  { id: "faltante", label: "Pide lo que falta", detail: "Pide al cliente los datos que la base exige para responder y los anota en «FALTA»." },
  { id: "responde", label: "Atiende todo lo que preguntó", detail: "Responde cada pregunta del mensaje, o dice que la verá una persona." },
  { id: "escalado", label: "Escala cuando toca", detail: "Marca «sí» y no redacta cuando la consulta es de una persona." },
] as const;
const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Fallan varios criterios: revisa la base antes de volver a pedir el borrador." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado, empezando por los datos y las promesas." },
  { min: 9, label: "Lista para verificar", advice: "Cumple casi todo: pasa a tu verificación antes de enviar." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (total: number) => [...RESULTADOS].reverse().find((r) => total >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { respaldo: 1, limites: 2, faltante: 1, responde: 1, escalado: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");
const LISTA_CRITERIOS = CRITERIOS.map((c, i) => `${i + 1}. ${c.label}: ${c.detail}`).join("\n");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "responder-consultas-de-clientes-con-ia",
    category: "clientes",
    title: "Responder consultas de clientes con IA sin prometer de más",
    description:
      "Aprende a redactar con IA respuestas a clientes por WhatsApp, redes o correo usando una base de respuestas propia, y a revisarlas antes de enviar.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["comunicacion-atencion"],
    estandarGuia: 3,
    activoOriginal:
      "Base de respuestas con lo que cambia cada día y cuándo responde una persona (tabla copiable), mapa de decisión sobre qué prepara la IA y qué atiende una persona (tabla copiable) y rúbrica de cinco criterios con dos reglas de bloqueo",
    problem: "Recibes las mismas consultas todos los días por WhatsApp, redes o correo y responderlas te quita tiempo.",
    whyThisPage:
      "Une la respuesta por mensajería y por correo (misma intención, distinto canal) y enseña a crear una base de datos propia del negocio para que la IA no invente horarios o precios.",
    relatedGuides: ["crear-descripciones-de-productos-con-ia", "crear-cotizaciones-y-propuestas-con-ia", "crear-publicaciones-para-redes-sociales-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Ahorra tiempo con los mensajes repetidos sin que la IA prometa un precio, un plazo o una garantía que tu negocio no ofrece: primero tu base de respuestas, después el borrador, y siempre una persona que revisa.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de dos horas para escribir tu base; después, unos minutos por consulta",
    needs: ["Un asistente de IA de chat", "Un documento o una hoja para tu base", "Unos 30 mensajes reales, sin datos personales"],
    result: "Una base de respuestas propia y borradores revisables que solo dicen lo que tu negocio ofrece",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el resultado: una consulta de un cliente y, al lado, el borrador ya revisado.",
      description:
        "Una conversación de mensajería anonimizada (sin nombres, teléfonos ni patentes): a un lado la consulta del cliente del caso ficticio y al otro el borrador ya revisado, con una marca en cada dato que sale de la base. Sin datos personales.",
      alt: "Conversación de mensajería con la consulta de un cliente a un lado y, al otro, el borrador de respuesta ya revisado por el negocio.",
      caption: "Una consulta y la respuesta revisada.",
    }),
    base: slot("base-de-respuestas.webp", {
      section: "entrevista",
      ratio: "16/9",
      purpose: "Muestra una base de respuestas completa en una hoja, con lo que cambia cada día y cuándo responde una persona.",
      description:
        "La base del caso pegada en una hoja de cálculo: una fila por consulta frecuente y las columnas de respuesta aprobada, dato que cambia y «Responde una persona si…». Resaltar las dos celdas «Pendiente», si las hay. Caso ficticio.",
      alt: "Hoja de cálculo con una fila por consulta frecuente y columnas para la respuesta aprobada, el dato que cambia y cuándo responde una persona.",
      caption: "Una base de respuestas en una hoja de cálculo.",
      zoom: true,
    }),
    primerResultado: slot("borrador-inicial.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver el primer borrador y localizar las tres cosas que no coinciden con la base.",
      description:
        "La respuesta del asistente con sus cuatro partes (borrador, usado, falta y escalar), con subrayadas la frase de la garantía, la pregunta por el modelo y, al lado, la fila de la base que corresponde. Caso ficticio, sin datos de cuenta.",
      alt: "Borrador de respuesta a un cliente con tres frases subrayadas frente a la base.",
      caption: "El primer borrador, con tres cosas que revisar.",
      zoom: true,
    }),
    revision: slot("revision-de-promesas.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña cómo se lee la revisión: frases con problema, su fila de la base y la rúbrica puntuada.",
      description:
        "La respuesta del prompt de revisión: la tabla «Frases con problema», los apartados de preguntas sin atender y datos que no pidió, y la rúbrica con sus cinco puntajes. Caso ficticio; ocultar datos de cuenta.",
      alt: "Revisión de un borrador con tabla de frases con problema y rúbrica puntuada.",
      caption: "La revisión, frase por frase.",
      zoom: true,
    }),
    final: slot("borrador-corregido.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra el entregable final: los tres cambios y el borrador que se envía.",
      description:
        "La tabla «Cambios» con sus tres filas y, debajo, el borrador final con las frases corregidas resaltadas. Caso ficticio.",
      alt: "Tabla de cambios y borrador final de una respuesta a un cliente.",
      caption: "El borrador que se envía.",
      zoom: true,
    }),
    correo: slot("version-por-correo.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Muestra el mismo borrador adaptado a correo, con los hechos idénticos.",
      description:
        "El borrador final de WhatsApp a la izquierda y su versión por correo a la derecha, con asunto, saludo y firma. Resaltar el precio, los turnos y la garantía en ambos lados para ver que no cambian. Caso ficticio.",
      alt: "Borrador de WhatsApp y su versión por correo lado a lado, con los mismos datos resaltados.",
      caption: "Cambia la forma, no los hechos.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "base",
      purpose: "Prueba real del prompt de base: el ida y vuelta de preguntas y la tabla que devolvió.",
      description:
        "Captura de la entrevista (preguntas y respuestas) y de la tabla final con su columna Estado y la lista «Pendiente». Responde «todavía no lo decidí» al menos una vez. Ocultar datos personales y de cuenta.",
      alt: "Captura de una entrevista con un asistente y de la base de respuestas que devolvió.",
      caption: "Prueba del prompt de base.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "borrador",
      purpose: "Prueba real del prompt de borrador: las cuatro partes de la respuesta.",
      description:
        "Captura de BORRADOR, USADO, FALTA y ESCALAR. Usa la base del caso o la tuya y una consulta real anonimizada. Ocultar datos personales y de cuenta.",
      alt: "Captura de un borrador de respuesta a un cliente devuelto por un asistente.",
      caption: "Prueba del prompt de borrador.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "revision",
      purpose: "Prueba real del prompt de revisión: las frases con problema y la rúbrica puntuada.",
      description:
        "Captura de la tabla de frases con problema, de las preguntas sin atender, de la rúbrica con sus fragmentos y de «Para comprobar tú». Anota aparte si sus marcas coinciden con las tuyas. Ocultar datos personales y de cuenta.",
      alt: "Captura de la revisión de un borrador con frases con problema y rúbrica.",
      caption: "Prueba del prompt de revisión.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de un borrador con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "canal",
      purpose: "Prueba real del prompt de canal: el texto adaptado y la comprobación contra el borrador final.",
      description:
        "Captura de la tabla con el texto adaptado, de «Contra el borrador final» y de «FALTA». Pega las reglas del canal que uses. Ocultar datos personales y de cuenta.",
      alt: "Captura de una respuesta adaptada a otro canal con su comprobación.",
      caption: "Prueba del prompt de canal.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Cuando el negocio crece, los mensajes se repiten: «¿cuánto cuesta?», «¿hasta qué hora abren?», «¿tienen turno hoy?». Cada respuesta lleva pocos minutos, pero se acumulan, interrumpen el trabajo y salen distintas según quién conteste.\n\nUna IA puede ayudar a redactarlas, y ahí aparece el riesgo. No sabe cómo trabaja tu negocio: si le pides «responde a este cliente», puede completar los huecos con lo que suena razonable, como un precio exacto que depende del caso, un plazo que nadie prometió o una garantía que no existe. Y un cliente que recibe esa promesa por escrito la va a citar.\n\n**La base de respuestas es la única fuente de hechos de la IA: ella redacta el borrador y lo envía una persona.**",
    symptoms: [
      "Contestas las mismas cinco o seis preguntas todos los días, casi con las mismas palabras.",
      "Tus respuestas cambian según quién las escriba.",
      "Tardas en responder por no interrumpir lo que haces, y algunos clientes se van.",
      "Probaste una IA y te dio una respuesta que prometía algo que tu negocio no hace.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con un sistema pequeño y revisable para contestar más rápido sin perder control sobre lo que prometes.",
    deliverables: [
      { label: "Una base de respuestas", detail: "Tus respuestas a las consultas más repetidas, con lo que cambia cada día y cuándo responde una persona." },
      { label: "Borradores revisables", detail: "Que dicen de dónde sale cada dato y qué les faltó." },
      { label: "Una rúbrica de cinco criterios", detail: "Para revisar cualquier borrador antes de enviarlo." },
      { label: "El mismo mensaje en otro canal", detail: "Con los hechos intactos." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Atiendes tú, o con poco equipo, consultas por WhatsApp, redes o correo, y muchas se repiten.",
      "Quieres contestar más rápido y con más consistencia, pero seguir decidiendo tú qué se promete.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Buscas un chatbot que conteste solo, sin nadie revisando: aquí se preparan borradores.",
      "Tu negocio no tiene definidos precios, plazos o políticas: primero tienes que escribirlos.",
      "Quieres empezar con los reclamos: requieren a una persona desde el principio.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Taller Los Pinos (ficticio) — taller mecánico de barrio",
    situation:
      "El Taller Los Pinos tiene cuatro personas y una sola línea de WhatsApp que atiende quien está más cerca del teléfono. Le llegan muchas consultas de precios, horarios y turnos, casi todas repetidas, y cada persona responde a su manera.",
    goal: "Contestar más rápido y de forma coherente, sin prometer precios ni plazos que dependen de revisar el vehículo y sin diagnosticar por mensaje.",
    data: [
      { label: "Lo que preguntan", value: "Precios, horarios, turnos y qué le pasa a un auto" },
      { label: "Regla del taller", value: "Nada de diagnósticos por mensaje" },
      { label: "Cómo lo hacen hoy", value: "Cada persona improvisa, y a veces se contradicen" },
    ],
    problem: "No existe una versión escrita de estas respuestas, y una IA que probaron les prometió un precio cerrado y una causa probable para una avería.",
    application: "Escriben su base con una entrevista, piden borradores solo con ella, los contrastan, corrigen lo señalado y adaptan el resultado al correo.",
    result: "Borradores coherentes con lo que el taller ofrece, que piden los datos que faltan y dejan fuera lo que no se puede prometer por mensaje.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan el trabajo. Los datos del caso son ficticios; los de tu negocio son los tuyos.",
    blocks: [
      {
        title: "Lo estable y lo del día van separados",
        detail:
          "La base guarda lo que casi no cambia. Lo que solo vale hoy, como los turnos o un precio vigente, se pega cada vez. Así la IA no usa un dato vencido.",
        example: `En el caso, el horario vive en la base; «${DATOS_HOY.toLowerCase()}» se pega cada mañana.`,
      },
      {
        title: "Un borrador no es una respuesta",
        detail: "La IA prepara; una persona lee, corrige y envía. Cambiar «respuesta final» por «borrador revisable» cambia cómo se lee cada frase.",
      },
      {
        title: "Cada dato dice de dónde sale",
        detail: "El borrador declara qué filas usó y qué dato le faltó. Un texto convincente sin esa lista esconde sus suposiciones.",
      },
      {
        title: "Hay consultas que no se preparan",
        detail: "Reclamos, clientes molestos y temas de seguridad, salud o dinero los atiende una persona. La base lo deja escrito para cada consulta.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: `Responde a este cliente: «${CONSULTA_BASE}»`,
    whyInsufficient:
      "La IA no conoce tus precios, tus turnos ni tus políticas. Ante el hueco, puede responder con lo más habitual en los talleres (ejemplo ilustrativo): un precio redondo, un «sin problema» y un plazo optimista. Suena amable y es justo lo que no conviene prometer por escrito.",
    issues: [
      "No hay base: lo que no se le dé, lo puede inventar.",
      "No hay datos de hoy: los turnos y los precios vigentes salen de su imaginación.",
      "No hay reglas ni salida: no sabe qué no prometer ni cuándo callarse.",
      "No hay revisión prevista: se toma como una respuesta terminada.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Junta cuatro cosas antes de abrir la IA. Ella no puede saber ninguna.",
    items: [
      { label: "Tus consultas reales", detail: "Unos 30 mensajes recientes, sin nombres, teléfonos, direcciones ni placas. Sirven para ver cuáles se repiten.", required: true },
      { label: "Lo que tu negocio responde", detail: "Para cada consulta frecuente, la respuesta de la que te haces responsable.", required: true },
      { label: "Lo que cambia cada día", detail: "Turnos, precios vigentes o stock, que pegarás cada vez.", required: true },
      { label: "Cuándo responde una persona", detail: "Las consultas que la IA no debe preparar.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    base: {
      caption: "Base de respuestas del taller",
      purpose: "Tener una respuesta aprobada por consulta, con lo que cambia cada día separado y la indicación de cuándo responde una persona.",
      columns: ["Consulta frecuente", ...COLUMNAS.map((c) => c.nombre)],
      rows: BASE,
      copyable: true,
      note: "Ejemplo ficticio. La tuya debe reflejar lo que tu negocio ofrece y puede sostener. «—» donde no aplica.",
    },
    tipos: {
      caption: "Qué puede hacer la IA con cada tipo de consulta",
      purpose: "Decidir en segundos si una consulta admite un borrador, si necesita un dato del día o si la atiende una persona.",
      columns: ["Tipo de consulta", "Ejemplo", "¿Borrador con IA?", "Quién envía"],
      rows: [
        ["Información que no cambia", "Horario, ubicación, cómo se agenda", "Sí, con la base", "Una persona"],
        ["Información que cambia cada día", "Turnos libres, precio vigente, stock", "Sí, si pegas los datos de hoy", "Una persona"],
        ["Falta un dato para responder", "«¿Cuánto cuesta un logo?» en un estudio de diseño", "Sí: el borrador pide el dato", "Una persona"],
        ["Precio o plazo que depende de tu criterio", "Presupuestos, entregas de reparaciones", "Solo para reunir la información", "Una persona"],
        ["Seguridad, salud, dinero o legal", "«¿Esta torta es apta para alérgicos?» en una pastelería", "No como respuesta", "Una persona"],
        ["Reclamo o cliente molesto", "«Me arreglaron mal el auto»", "No como primer paso", "Una persona"],
      ],
      copyable: true,
      note: "Ejemplos ilustrativos de varios rubros. Ajusta las reglas a los riesgos de tu negocio.",
    },
    correo: {
      caption: "El borrador final, adaptado a correo",
      purpose: "Ver qué cambia (la forma) y qué no (los hechos) al pasar el mismo borrador de WhatsApp a correo.",
      columns: ["Canal", "Texto adaptado", "Qué cambia", "Qué no cambia"],
      rows: [
        [
          "Correo",
          `Asunto: ${CORREO_ASUNTO}. ${CORREO_CUERPO}`,
          "Se añaden asunto, saludo y firma, y la pregunta pasa a un cierre",
          "El precio, la duración, los turnos y la garantía",
        ],
      ],
      note: "Ejemplo generado. Contra el borrador final: precio, duración, turnos y garantía, iguales.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cinco de los siete pasos. El primero y el último los haces tú solo.",
    steps: [
      { title: "Agrupa tus consultas y decide cuáles atiende una persona", description: "Recorre tus mensajes, agrúpalos por tipo y separa los que nunca prepara la IA.", output: "Una lista de consultas frecuentes y otra de las que atiende una persona." },
      { title: "Escribe tu base con la entrevista", description: "Deja que la IA te pregunte de una en una y marque lo que aún no decidiste.", output: "Una base con lo que cambia cada día y cuándo escalar." },
      { title: "Pide el borrador", description: "Entrega la base, los datos de hoy y la consulta, y pide un borrador que diga qué usó y qué le faltó.", output: "Un borrador con sus cuatro partes." },
      { title: "Contrasta con tu base", description: "Compara cada dato y puntúa con la rúbrica, a mano o con el prompt de revisión.", output: "Una lista de frases con problema." },
      { title: "Corrige solo lo señalado", description: "Pide cambiar únicamente lo señalado, sin tocar la base.", output: "Un borrador corregido." },
      { title: "Adapta a otro canal", description: "Si respondes por otro lugar, pide la misma respuesta con la forma de ese canal.", output: "Un texto para ese canal." },
      { title: "Revisa y envía tú", description: "Recorre tu lista de verificación, corrige el tono y envía desde tu cuenta.", output: "Una respuesta enviada por una persona." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    base: {
      title: "Prompt de base: que la IA te entreviste",
      objective: "Completar tu base de respuestas con preguntas de una en una, separando lo estable de lo que cambia y marcando lo pendiente.",
      whenToUse: "Cuando conoces tus consultas frecuentes pero nunca escribiste tus respuestas.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: "Taller mecánico de barrio con cuatro personas" },
        { name: "CONSULTAS", description: "Tus consultas frecuentes, una por línea.", example: "Horario · Cambio de aceite · Turnos · Averías por mensaje · Presupuestos · Garantía" },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a escribir su base de respuestas para atender consultas de clientes. Tu destinatario es la persona dueña, que responde a mano las mismas preguntas todos los días. Tu objetivo es completar la base usando SOLO lo que yo te diga, y marcar lo que todavía no decidí.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Consultas frecuentes que quiero cubrir (una por línea):
{{CONSULTAS}}

### PARA CADA CONSULTA, COMPLETA
${LISTA_COLUMNAS}

### REGLAS
1. Pregúntame de a UNA cosa por vez y espera mi respuesta. Máximo 15 preguntas; salta lo que ya está en CONTEXTO.
2. No propongas precios, plazos, políticas ni garantías: son decisiones mías. Si todavía no decidí una, márcala «Pendiente» y sigue.
3. Separa lo que casi nunca cambia (la respuesta aprobada) de lo que cambia cada día. Si dudo de cuál es cuál, pregúntamelo.
4. Pregúntame siempre cuándo debe responder una persona: reclamos, clientes molestos, dinero, seguridad, salud o cualquier cosa que dependa de mi criterio.
5. Si una respuesta es vaga («depende», «unas horas»), pídeme la condición o la cifra concreta.
6. Si dos respuestas se contradicen, cita las dos frases y pídeme que elija.
7. Separa lo que yo dije de lo que tú supones o sugieres, y no presentes una suposición como si fuera mi respuesta.
8. No des consejos legales ni sobre datos personales; si dudo, dime que lo consulte con un profesional.

### FORMATO DE SALIDA
Al terminar (o al llegar a 15 preguntas), una tabla con columnas fijas: Consulta | Respuesta aprobada | Dato que cambia | Responde una persona si… | Estado, con una fila por consulta. El estado es «Confirmado» o «Pendiente». Después, «Pendiente»: cada celda sin decidir y qué necesito resolver. La tabla define la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Verifica que: están todas las consultas; cada celda usa mis palabras y mis cifras; ningún precio, plazo ni política apareció sin que yo lo dijera; toda suposición está marcada; cada «Confirmado» corresponde a algo que dije. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable BASE_DE_RESPUESTAS.`,
      explanation: [
        {
          part: "No propongas precios, plazos, políticas ni garantías: son decisiones mías.",
          why: "Una política propuesta por la IA puede quedar escrita en tu base sin que la hayas decidido.",
        },
        {
          part: "Pregúntame siempre cuándo debe responder una persona…",
          why: "Deja escritas las consultas que la IA no debe preparar, antes de que aparezcan.",
        },
        {
          part: "Si todavía no decidí una, márcala «Pendiente» y sigue.",
          why: "Un pendiente visible es mejor que una respuesta que suena normal y nadie decidió.",
        },
      ],
      evaluate: "Comprueba que cada celda usa tus palabras y que lo que no decidiste dice «Pendiente».",
      improve: "Si una respuesta quedó vaga, contesta con la cifra o la condición exacta y pide reescribir esa fila.",
      conversation: [
        { who: "ia", text: "Primera consulta: el horario. ¿Qué días y a qué horas atienden?" },
        { who: "tu", text: "De lunes a viernes de 8 a 17:30 y los sábados de 8 a 13. Domingos y festivos cerramos." },
        { who: "ia", text: "Anotado. ¿Hay algo del horario que cambie de una semana a otra?" },
      ],
      warnings: ["No pegues datos personales de tus clientes."],
    },

    borrador: {
      title: "Prompt de borrador: la respuesta a una consulta",
      objective: "Obtener un borrador para tu canal, hecho solo con tu base y tus datos de hoy, que diga qué usó, qué le faltó y si conviene que responda una persona.",
      whenToUse: "Cada vez que llega una consulta que tu base cubre, o que casi cubre.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: "Taller mecánico de barrio" },
        { name: "CANAL", description: "Por dónde vas a responder.", example: "WhatsApp" },
        { name: "TONO", description: "Cómo suena tu negocio.", example: TONO },
        { name: "BASE_DE_RESPUESTAS", description: "La tabla de tu base, con sus filas.", example: "La tabla del paso 2, ya con tus datos" },
        { name: "DATOS_DEL_DIA", description: "Lo que solo vale hoy: turnos, precios vigentes, stock.", example: DATOS_HOY },
        { name: "CONSULTA_DEL_CLIENTE", description: "El mensaje del cliente, sin datos personales innecesarios.", example: CONSULTA },
      ],
      prompt: `Actúa como asistente que redacta BORRADORES de respuesta para los clientes de un negocio pequeño. Tu destinatario es el cliente que escribió, y una persona del negocio revisará cada borrador antes de enviarlo. Tu objetivo es responder su consulta usando SOLO la base y los datos de hoy.

### CONTEXTO
Negocio: {{NEGOCIO}}
Canal: {{CANAL}}. Tono: {{TONO}}.

### DATOS (la base y los datos de hoy son la única fuente de hechos)
Base de respuestas aprobadas:
{{BASE_DE_RESPUESTAS}}

Datos de hoy (turnos, precios o stock que solo valen hoy):
{{DATOS_DEL_DIA}}

Consulta del cliente:
{{CONSULTA_DEL_CLIENTE}}

### REGLAS
1. Usa solo la base y los datos de hoy. No inventes precios, plazos, políticas, garantías ni disponibilidad, y no prometas nada que no esté escrito.
2. Si la base dice que la respuesta depende de un dato del cliente, pídeselo en el borrador y anótalo en «FALTA».
3. No diagnostiques ni des consejos técnicos, de salud o legales por mensaje. No pidas contraseñas, datos de tarjeta ni documentos.
4. Responde «ESCALAR: sí» y no redactes borrador si la consulta es un reclamo, un cliente molesto, un tema de seguridad, salud, dinero o legal, o si la base indica que responde una persona.
5. Termina con un único siguiente paso claro para el cliente.
6. Distingue lo que sale de la base de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) «BORRADOR»: la respuesta lista para revisar, adaptada al canal; (2) «USADO»: qué filas de la base o qué datos de hoy usaste; (3) «FALTA»: qué dato necesitas y no está, y qué preguntarle al cliente; (4) «ESCALAR»: «sí» o «no». El formato define la forma; el contenido sale de mi base.

### ANTES DE RESPONDER
Verifica que: cada dato del borrador está en «USADO»; ningún precio, plazo ni política salió de otra parte; no hay diagnósticos ni promesas nuevas; «FALTA» y «ESCALAR» siguen las reglas de la base. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar el borrador en el siguiente prompt, en el lugar de la variable BORRADOR.`,
      explanation: [
        {
          part: "…una persona del negocio revisará cada borrador antes de enviarlo…",
          why: "Cambia el estándar de «respuesta final» a «borrador revisable» y evita que hable en nombre del negocio.",
        },
        {
          part: "Si la base dice que la respuesta depende de un dato del cliente, pídeselo…",
          why: "Le da una salida ante un hueco: preguntar en lugar de completar con lo habitual.",
        },
        {
          part: "Responde «ESCALAR: sí» y no redactes borrador si…",
          why: "Le da una salida legítima cuando la consulta no es para ella. Las reglas de tu base deben coincidir con esta.",
        },
      ],
      evaluate: "Contrasta cada dato y cada frase con tu base en el paso siguiente.",
      improve: "Si suena genérico, aclara el tono y el canal; no le añadas datos que no estén en la base.",
      warnings: ["Es un borrador: no está listo para enviar hasta que lo contrastes con tu base."],
    },

    revision: {
      title: "Prompt de revisión: contrastar el borrador con tu base",
      objective: "Comparar cada dato y cada frase del borrador con tu base y puntuar con la rúbrica, sin reescribir.",
      whenToUse: "Justo después del borrador, en la misma conversación, con tu base abierta.",
      variables: [
        { name: "BORRADOR", description: "El borrador que quieres revisar.", example: "El borrador del prompt anterior" },
        { name: "CONSULTA_DEL_CLIENTE", description: "El mensaje del cliente, tal como lo pegaste.", example: CONSULTA },
      ],
      prompt: `Actúa como revisor de respuestas a clientes para un negocio pequeño. Tu destinatario es la persona dueña, que comprobará tus marcas contra su base. Tu objetivo es comparar cada dato y cada frase del borrador con la base y los datos de hoy, y puntuarlo con una rúbrica fija. No reescribas nada.

### CONTEXTO
Usa la base de respuestas y los datos de hoy de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Borrador a revisar:
{{BORRADOR}}

Consulta del cliente:
{{CONSULTA_DEL_CLIENTE}}

### RÚBRICA (puntúa cada criterio de 0 a 2: 0 = no cumple, 1 = en parte, 2 = cumple)
${LISTA_CRITERIOS}

### REGLAS
1. Divide el borrador en frases. Para cada dato concreto (precio, plazo, condición, disponibilidad, garantía) busca la fila de la base o el dato de hoy que lo respalda y comprueba que el alcance coincida: «mano de obra» no es «todo el trabajo».
2. Marca cada frase con problema como «No está en la base», «Alcance distinto», «Promesa» o «Diagnóstico».
3. Compara la consulta con el borrador: lo que el cliente preguntó y el borrador no atiende va en «Preguntas sin atender».
4. Compara los datos que la base exige para responder con lo que el borrador pide al cliente: lo que falta va en «Datos que no pidió».
5. Cada puntaje se apoya en un fragmento literal entre comillas.
6. Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, marca el borrador NO ENVIAR hasta corregirlo.
7. No juzgues si un precio o una política son adecuados: lista lo que debo comprobar yo.

### FORMATO DE SALIDA
En este orden: (1) «Frases con problema»: una tabla con columnas fijas Frase | Problema | Fila de la base o dato de hoy (o «no está»); (2) «Preguntas sin atender» y «Datos que no pidió»; (3) una tabla con columnas fijas: Criterio | Puntaje (0-2) | Fragmento que lo justifica, con el total sobre ${MAXIMO} y el veredicto «${RESULTADOS[0].label}» (menos de ${RESULTADOS[1].min}), «${RESULTADOS[1].label}» (de ${RESULTADOS[1].min} a ${RESULTADOS[2].min - 1}) o «${RESULTADOS[2].label}» (${RESULTADOS[2].min} o más); (4) «Para comprobar tú». Las tablas definen la forma; el contenido sale de mi borrador y mi base.

### ANTES DE RESPONDER
Verifica que: revisaste todas las frases; cada frase con problema aparece en la primera tabla con su fila de la base; los puntajes coinciden con las marcas y suman bien (máximo ${MAXIMO}); aplicaste NO ENVIAR donde correspondía; no reescribiste nada. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "…comprueba que el alcance coincida: «mano de obra» no es «todo el trabajo».",
          why: "Un dato correcto con otro alcance es una promesa nueva.",
        },
        {
          part: "Compara la consulta con el borrador: lo que el cliente preguntó y el borrador no atiende…",
          why: "Un borrador puede estar bien escrito y dejar sin respuesta una pregunta del cliente.",
        },
        {
          part: "…marca el borrador NO ENVIAR hasta corregirlo.",
          why: "Un dato inventado o una promesa no se compensa con buen tono.",
        },
      ],
      evaluate: "Lee la tabla con tu base al lado; si sus marcas difieren de las tuyas, confía en tu base.",
      improve: "Si puntúa todo casi igual, pide más severidad en «Cada dato sale de tu base».",
      warnings: ["Puede dar por respaldada una frase que no lo está: la tabla ordena la revisión, no la sustituye."],
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente lo señalado, con datos de la base, y dejar intacto el resto del borrador.",
      whenToUse: "Después de la revisión, cuando alguna frase o pregunta tiene un problema.",
      variables: [
        { name: "PROBLEMAS", description: "Las frases con problema y lo que falta, con su motivo.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Frases o datos que no se pueden cambiar.", example: "La base y las frases correctas" },
      ],
      prompt: `Actúa como editor de respuestas a clientes para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, usando solo la base y los datos de hoy, y dejar intacto lo demás.

### CONTEXTO
Usa la base, los datos de hoy y el borrador de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Problemas que detecté (frase y motivo):
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo las frases señaladas y lo que su cambio obligue a ajustar. No modifiques la base ni las frases correctas.
2. Para cada corrección usa solo datos de la base o de hoy, con su alcance. Si falta el dato, escribe [FALTA: el dato] en lugar de inventarlo.
3. Si quitas una frase sin respaldo, no la sustituyas por otra parecida: quítala o deja solo la parte que la base respalda.
4. Si un problema que te señalé no existe en la base, o la base se contradice, dímelo antes de cambiar nada.
5. No añadas precios, plazos, garantías ni diagnósticos.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla con columnas fijas Antes | Después | Motivo, con solo la frase que cambia, para que yo la sustituya en mi borrador; (2) «Sin cambios»: lo que no toqué; (3) «FALTA» con cada [FALTA]. La tabla define la forma; el contenido sale de mi borrador.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada corrección usa datos de la base o de hoy con su alcance; no apareció ningún dato nuevo; lo que no toqué está idéntico. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo las frases señaladas…",
          why: "Evita que rehaga frases que ya coincidían con la base.",
        },
        {
          part: "Si quitas una frase sin respaldo, no la sustituyas por otra parecida…",
          why: "Evita cambiar una promesa por otra igual de inventada.",
        },
        {
          part: "Si un problema que te señalé no existe… dímelo antes de cambiar nada.",
          why: "Evita corregir a ciegas un problema que tú mismo pudiste marcar mal.",
        },
      ],
      evaluate: "Sustituye las frases y vuelve a contrastar con tu base: lo demás debe seguir idéntico.",
      improve: "Si la corrección mezcla datos, pega de nuevo la base y pide repetir solo esa frase.",
    },

    canal: {
      title: "Prompt de canal: el mismo mensaje en otro lugar",
      objective: "Adaptar el borrador final a otro canal, con su forma y sin cambiar ningún hecho.",
      whenToUse: "Cuando respondes por un canal distinto al del borrador, como el correo.",
      variables: [
        { name: "CANAL_NUEVO", description: "Por dónde vas a responder ahora.", example: "Correo" },
        { name: "REGLAS_DEL_CANAL", description: "Cómo se escribe en ese canal, con tu firma.", example: REGLAS_CANAL },
      ],
      prompt: `Actúa como adaptador de respuestas a clientes para un negocio pequeño. Tu destinatario es la persona dueña, que enviará el texto por otro canal. Tu objetivo es adaptar el borrador final a ese canal sin cambiar ninguno de sus hechos.

### CONTEXTO
Canal nuevo: {{CANAL_NUEVO}}
Usa el borrador final, la base y los datos de hoy de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Cómo se escribe en ese canal:
{{REGLAS_DEL_CANAL}}

### REGLAS
1. Puedes cambiar el orden, el largo, el saludo y el cierre. No cambies ni añadas hechos: precios, horas, plazos, garantías y condiciones quedan tal cual.
2. Sigue las reglas del canal de arriba. Si falta algo que piden (una firma, un asunto), escribe [FALTA: el dato] y no lo inventes.
3. Conserva el único siguiente paso para el cliente, adaptado al canal.
4. No añadas promociones, precios nuevos ni diagnósticos.
5. Distingue lo que sale del borrador final de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Canal | Texto adaptado | Qué cambia | Qué no cambia; (2) «Contra el borrador final»: cada dato (precio, duración, turnos, garantía) con «igual» o «distinto»; (3) «FALTA». La tabla define la forma; el contenido sale de mi borrador.

### ANTES DE RESPONDER
Verifica que: cada precio, hora, plazo y garantía es idéntico al del borrador final; no hay hechos nuevos; se siguen las reglas del canal; hay un único siguiente paso. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Puedes cambiar el orden, el largo, el saludo y el cierre. No cambies ni añadas hechos…",
          why: "Cambia la forma para el canal y deja los hechos que ya revisaste.",
        },
        {
          part: "«Contra el borrador final»: cada dato… con «igual» o «distinto».",
          why: "Convierte la comparación en algo que puedes comprobar en segundos.",
        },
        {
          part: "Si falta algo que piden (una firma, un asunto), escribe [FALTA: el dato]…",
          why: "Evita que invente una firma o un dato de contacto.",
        },
      ],
      evaluate: "Comprueba tú los precios, las horas y las condiciones en el texto adaptado.",
      improve: "Si sale demasiado largo, pega la regla de largo del canal y repite.",
      warnings: ["Las reglas de cada plataforma sobre mensajes y respuestas automáticas cambian: consúltalas allí."],
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: `Salida ilustrativa, redactada aplicando el prompt de borrador a la base del taller. El cliente escribió: «${CONSULTA}». La tuya será distinta.`,
    parts: [
      { type: "text", text: `**BORRADOR.** ${BORRADOR_PRIMERO}` },
      { type: "text", text: "**USADO.** Precio y duración del cambio de aceite, turnos de hoy y garantía." },
      { type: "text", text: `**FALTA.** El modelo del vehículo, para dar el precio exacto.` },
      { type: "text", text: "**ESCALAR.** No." },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "respuesta",
    title: "Puntúa un borrador",
    intro:
      `Puntúa tu borrador en los cinco criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se envía aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      "El borrador es breve, cálido y cabe en un mensaje, y por eso es fácil enviarlo sin más. Se contrasta con la base y se puntúa con la rúbrica. " +
      `En este ejemplo el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "respaldo",
        verdict: vered("respaldo"),
        comment: `«${GARANTIA_ERR.replace(/\.$/, "")}»: la base dice «${S.alcanceOk}». La cifra es correcta y el alcance no. El precio, la duración y los turnos son los de la base.`,
      },
      {
        criterionId: "limites",
        verdict: vered("limites"),
        comment: "No da diagnósticos y no promete plazos ni precios fuera de la base.",
      },
      {
        criterionId: "faltante",
        verdict: vered("faltante"),
        comment: `${MOTIVO_FALTANTE} El borrador pregunta solo por el modelo.`,
      },
      {
        criterionId: "responde",
        verdict: vered("responde"),
        comment: "El cliente también preguntó por una pérdida de aceite y el borrador no la menciona.",
      },
      {
        criterionId: "escalado",
        verdict: vered("escalado"),
        comment: "Marca «No»: no es un reclamo ni un tema de seguridad, y la base no manda a una persona por esto.",
      },
    ],
    conclusion: "Es un buen borrador: precio, duración y turnos son los de la base. Tres detalles habrían pasado por buenos al leerlo rápido.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir tres cosas, no rehacer el borrador ni tocar la base.",
    promptId: "ajuste",
    why: "La revisión señaló un alcance ampliado, un dato que faltaba pedir y una pregunta sin atender. El prompt limita el cambio a lo señalado, pide usar solo datos de la base con su alcance y separa lo cambiado de lo que sigue igual.",
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
          purpose: "Comprobar qué cambió y por qué, y que los datos de la base no se tocaron.",
          columns: ["Antes", "Después", "Motivo"],
          rows: PROBLEMAS.map((p) => [p.antes, p.despues, p.motivo]),
        },
      },
      { type: "text", text: `**Borrador final.** ${BORRADOR_FINAL}` },
      {
        type: "text",
        text: `**Sin cambios:** el precio, la duración y los turnos. **FALTA:** ninguno. Al repetir la revisión con estas correcciones, la rúbrica suma ${MAXIMO} de ${MAXIMO}.`,
      },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Responder con la IA sin una base propia",
      whyItHurts: "Sin tu base, la IA no puede saber cómo trabaja tu negocio y rellena los huecos con lo más habitual en cualquier negocio parecido.",
      instead: "Escribe primero las respuestas aprobadas, aunque sean cinco.",
    },
    {
      title: "Pegar datos personales que no hacen falta",
      whyItHurts: "Nombres, teléfonos, direcciones o placas no ayudan a redactar y pueden ser confidenciales.",
      instead: "Quita todo lo identificable y comparte solo lo necesario.",
    },
    {
      title: "Enviar el borrador sin contrastarlo",
      whyItHurts: "Un borrador convincente puede tener un alcance ampliado o una pregunta sin atender: justo lo que no se ve al leer deprisa.",
      instead: "Contrasta cada dato con tu base antes de enviar; si no puedes, no lo envíes.",
    },
    {
      title: "No actualizar la base",
      whyItHurts: "Tus precios, horarios y políticas cambian, y la IA repetirá las versiones viejas si la base no cambia.",
      instead: "Pon fecha a la base y actualízala cada vez que cambie algo; lo diario va en los datos de hoy.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de enviar, recorre esta lista. Marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Cada precio, plazo, condición o garantía está en mi base o en los datos de hoy.", detail: "Si no puedo señalar dónde, lo quito." },
      { label: "Los datos de hoy que menciono (turnos, precios, stock) siguen vigentes ahora mismo." },
      { label: "No promete nada que mi negocio no pueda cumplir." },
      { label: "No diagnostica ni da consejos técnicos, de salud o legales." },
      { label: "No pide contraseñas, datos de tarjeta ni documentos por mensaje." },
      { label: "Responde todo lo que el cliente preguntó y termina con un único siguiente paso." },
      {
        label: "Consulté las reglas de mi canal y de mi país sobre mensajes, datos personales y respuestas automáticas.",
        detail: "Cambian de un lugar a otro y aquí no se cubren.",
      },
    ],
    principle: "La IA ordena y redacta. Lo que se promete lo decide y lo envía una persona.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con el sistema en marcha, el trabajo es mantener la base viva.",
    steps: [
      { title: "Guarda lo que la IA marcó en FALTA", detail: "Cada dato que faltó es una fila nueva o una celda por completar." },
      { title: "Actualiza la base cuando cambie algo", detail: "Un precio, un horario o una política, con la fecha del cambio." },
      { title: "Anota qué corriges más", detail: "Si siempre corriges lo mismo, la base o el prompt necesitan un ajuste." },
      { title: "Prueba la base con mensajes de la semana pasada", detail: "Donde el borrador difiera de lo que respondiste, decide quién tenía razón." },
      { title: "Amplía por tipo de consulta", detail: "Cuando una consulta nueva se repita tres veces, ya merece su fila." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "Este método ahorra tiempo, pero no atiende a tus clientes por ti.",
    items: [
      { title: "No conoce el estado de un pedido", detail: "Solo sabe lo que le das en la conversación: un pedido, un stock o una agenda se pegan cada vez." },
      { title: "No es un chatbot", detail: "Prepara borradores que revisa una persona. Automatizar respuestas exige otras decisiones y reglas de cada plataforma." },
      { title: "No sustituye la atención humana", detail: "Reclamos, casos delicados y decisiones de dinero o seguridad los resuelve una persona." },
      { title: "No cumple la normativa por ti", detail: "Las reglas sobre datos personales y comunicaciones comerciales varían por país: consulta a un profesional." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Responder más rápido no exige que la IA sepa más de tu negocio: exige que tú se lo escribas una vez, en una base pequeña y revisable. La mejora llega cuando cada duda que aparece se convierte en una fila nueva.",
    takeaways: [
      "Empieza por una base de respuestas propia, aunque solo tenga cinco filas.",
      "Separa lo que casi no cambia de lo que cambia cada día.",
      "Define qué consultas atiende siempre una persona.",
      "Contrasta cada borrador con tu base antes de enviarlo.",
    ],
    nextGuide: "crear-cotizaciones-y-propuestas-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "escalar", "dato-personal", "rubrica", "canal"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Tengo que avisar a mis clientes de que uso IA para redactar?",
      answer:
        "No hay una respuesta única: depende del país, del canal y del tipo de comunicación. Lo prudente es revisar las normas de tu plataforma y de tu país, y ser honesto si un cliente te lo pregunta. Quien envía el mensaje eres tú.",
    },
    {
      question: "¿Puedo dejar que la IA responda sola?",
      answer:
        "Esta guía no lo cubre: prepara borradores que revisas. Automatizar exige decidir qué pasa cuando la IA se equivoca, y las plataformas tienen reglas propias sobre respuestas automáticas.",
    },
    {
      question: "¿Es seguro pegar mensajes de clientes en una IA?",
      answer:
        "Depende de la herramienta y de lo que pegues. Quita nombres, teléfonos y direcciones, comparte solo lo necesario y revisa la política de privacidad de la herramienta. Las leyes de protección de datos varían por país.",
    },
    {
      question: "¿Cuántas respuestas debe tener mi base?",
      answer: "Las que cubran tus consultas más repetidas: con cinco ya notarás la diferencia. Crece a medida que aparecen dudas nuevas.",
    },
  ],
});
