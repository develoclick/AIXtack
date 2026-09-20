import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * clientes/responder-reclamos-con-ia
 *
 * Tipo: comunicación y atención al cliente + tema sensible (emociones, dinero, riesgo legal). No es una guía de
 * números: las únicas cuentas son fechas y días hábiles del caso, verificadas con código (ver README.md).
 * Todo el caso (la tienda Luz de Barrio, el reclamo, la reseña y la decisión de la dueña) es FICTICIO. Los
 * ejemplos de la IA están redactados aplicando literalmente cada prompt: no proceden de una conversación real ni
 * de una prueba del autor (esas viven en `evidence.pruebas`, que solo rellena el autor). El pedido ingenuo es
 * ILUSTRATIVO y está escrito a propósito.
 *
 * Fuente única de verdad: el registro (REGISTRO), los puntos de la ficha (PUNTOS), la tarjeta de decisión (TARJETA
 * y sus constantes de oferta), las frases del borrador (FRASE_*), los criterios (CRITERIOS), los umbrales
 * (RESULTADOS), los puntajes (PUNTAJES) y los límites de palabras se definen UNA vez y los leen las tablas, los
 * prompts, los ejemplos y la rúbrica.
 */
const slot = guideSlots("clientes", "responder-reclamos-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const palabras = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;
const LIMITE_PRIVADA = 160;
const LIMITE_PUBLICA = 70;

/** Lo que promete el negocio en su web. */
const POLITICAS = "Despachamos en 1 día hábil. La mensajería tarda de 2 a 3 días hábiles.";

/** Registro de hechos del caso (junio; el día 1 es lunes). */
const REGISTRO: [cuando: string, que: string, fuente: string][] = [
  ["Lunes 1, 10:20", "Se confirma el pago del pedido (un set de velas de regalo).", "Registro de pedidos"],
  ["Lunes 1, 10:32", "El negocio escribe: «Sale mañana y te llega entre el jueves y el viernes».", "Chat de WhatsApp"],
  ["Martes 2", "El pedido no sale: faltan cajas de envío.", "Nota de la dueña"],
  ["Jueves 4, 18:40", "El cliente escribe: «¿Dónde está mi pedido? Es para el sábado».", "Chat de WhatsApp"],
  ["Viernes 5, 09:30", "Se emite la guía y el pedido sale del taller.", "Registro de la mensajería"],
  ["Viernes 5, 10:05", "El negocio responde al mensaje del jueves.", "Chat de WhatsApp"],
  ["Martes 9, 14:12", "La mensajería marca el pedido como entregado.", "Seguimiento de la mensajería"],
  ["Miércoles 10, 09:15", "El cliente envía el reclamo.", "Chat de WhatsApp"],
];

/** El reclamo, tal como llega (sin datos personales). */
const RECLAMO =
  "Pedí un set de velas de regalo y llegó el martes, cuando me dijeron que llegaba el jueves. Era para el sábado. Escribí tres veces preguntando y nadie contestó. Además la caja llegó golpeada. Es una estafa. Quiero que me devuelvan todo el dinero.";
const RESENA = "Nunca más. Mi regalo llegó tarde y nadie contestó. Es una estafa.";

type Estado = "Confirmado" | "Parcial" | "No confirmado";
const PUNTOS: { punto: string; estado: Estado; registros: string; falta: string }[] = [
  { punto: "El pedido llegó el martes.", estado: "Confirmado", registros: "Entregado el martes 9 a las 14:12 (seguimiento de la mensajería).", falta: "—" },
  { punto: "Me dijeron que llegaba el jueves.", estado: "Parcial", registros: "El mensaje del lunes 1 decía «entre el jueves y el viernes».", falta: "—" },
  { punto: "Era para el sábado.", estado: "Confirmado", registros: "El jueves 4 a las 18:40 el cliente escribió «Es para el sábado».", falta: "—" },
  { punto: "Escribí tres veces y nadie contestó.", estado: "Parcial", registros: "Hay un mensaje (jueves 4, 18:40), respondido el viernes 5 a las 10:05. No hay otros dos.", falta: "Por qué canal escribió las otras dos veces." },
  { punto: "La caja llegó golpeada.", estado: "No confirmado", registros: "No hay foto ni nota de recepción.", falta: "Una foto de la caja." },
];
const EMOCIONES = "«Es una estafa» (juicio) y «nadie contestó» (queja por la atención). El tono parece de enojo (SUPUESTO).";
const PIDE = "Explícito: «que me devuelvan todo el dinero». Parece querer también que se reconozca el retraso (SUPUESTO).";

/* tarjeta de decisión (la decide la persona dueña, no la IA) */
const PLAZO_DEVOLUCION = "5 días hábiles";
const CUPON = "10 %";
const NO_TOTAL = "No podemos devolver el total del pedido, porque el producto fue entregado.";
const VALIDEZ_CUPON = "60 días";
const TARJETA: [campo: string, decision: string][] = [
  ["Reconozco", "El pedido salió el viernes 5 y no el martes 2, como se le informó al cliente."],
  ["Motivo que puedo decir", "Faltaron cajas de envío."],
  ["Ofrezco 1", `Devolver el costo del envío a la forma de pago original, en hasta ${PLAZO_DEVOLUCION} desde que el cliente responda.`],
  ["Ofrezco 2", `Un cupón del ${CUPON} para su próxima compra, válido por ${VALIDEZ_CUPON}.`],
  ["No ofrezco", "Devolver el total del pedido."],
  ["Cómo lo digo", NO_TOTAL],
  ["Pido al cliente", "Una foto de la caja y, si escribió por otro canal, cuál."],
  ["Siguiente paso único", "Que responda este mensaje."],
  ["Aprueba", "La dueña."],
];

/* frases del borrador: el corregido es el primero con dos cambios */
const FRASE_APERTURA_FRIA = "Lamentamos las molestias que esto pudo causarte y gracias por escribirnos.";
const FRASE_APERTURA = "Lamentamos que tu pedido llegara el martes, cuando lo necesitabas para el sábado, y gracias por escribirnos.";
const FRASE_HECHO = "Tu pedido salió el viernes 5 y no el martes 2, como te informamos, porque faltaron cajas de envío. Te pedimos disculpas por el retraso.";
const FRASE_MENSAJES = "En nuestra bandeja vemos un mensaje tuyo del jueves 4 a las 18:40, que respondimos el viernes 5 a las 10:05. Si escribiste por otro canal, dinos cuál al responder.";
const FRASE_OFERTA = `Te devolvemos el costo del envío a la forma de pago original, en hasta ${PLAZO_DEVOLUCION} desde que nos respondas, y te damos un cupón del ${CUPON} para tu próxima compra, válido por ${VALIDEZ_CUPON}. ${NO_TOTAL}`;
const FRASE_PASO = "Para seguir, responde este mensaje con una foto de la caja.";

const BORRADOR = ["Hola.", FRASE_APERTURA_FRIA, FRASE_HECHO, FRASE_OFERTA, FRASE_PASO];
const CORREGIDO = ["Hola.", FRASE_APERTURA, FRASE_HECHO, FRASE_MENSAJES, FRASE_OFERTA, FRASE_PASO];

/* respuesta pública */
const LO_DIGO = "El despacho salió más tarde de lo que informamos.";
const CANAL_PRIVADO = "WhatsApp";
const PUBLICA = `Gracias por tu comentario. Lamentamos que tu pedido no llegara cuando lo necesitabas: el despacho salió más tarde de lo que informamos. Ya te escribimos por ${CANAL_PRIVADO} para resolverlo contigo. Si prefieres otro canal, avísanos por ahí.`;

/* rúbrica */
const CRITERIOS = [
  { id: "hechos", label: "Cada hecho sale de tu ficha", detail: "Solo aparece lo Confirmado, o lo Parcial con su matiz. Lo No confirmado se pregunta, no se afirma." },
  { id: "ofrece", label: "Ofrece solo lo que decidiste", detail: "Cada oferta y cada «no» coincide con tu tarjeta, con su condición y su plazo." },
  { id: "reconoce", label: "Reconoce lo que pasó, sin culpar ni discutir", detail: "Nombra el hecho concreto que vivió el cliente y lo que marcaste en «Reconozco». No duda de él, no culpa a terceros ni lo corrige." },
  { id: "puntos", label: "Responde a cada punto", detail: "Cada punto de la ficha y cada petición tiene respuesta: un dato, un matiz o una pregunta." },
  { id: "tono", label: "Suena sereno y claro", detail: "Frases cortas y llanas, sin defensiva ni súplicas, en el trato que elegiste." },
] as const;
const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Fallan varios criterios: vuelve a tu ficha y a tu tarjeta antes de pedir otro borrador." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado antes de enviar." },
  { min: 9, label: "Lista para revisión final", advice: "Cumple casi todo: haz la verificación humana y envía." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { hechos: 2, ofrece: 2, reconoce: 1, puntos: 1, tono: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

const PROBLEMAS_TEXTO = `1) No responde al punto 4 de la ficha («escribí tres veces y nadie contestó», Parcial). 2) La primera frase es genérica («las molestias que esto pudo causarte») y no nombra lo que vivió el cliente.`;

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "responder-reclamos-con-ia",
    category: "clientes",
    title: "Responder reclamos de clientes con IA",
    description:
      "Prepara una respuesta profesional a un reclamo sin contestar impulsivamente: separa hechos de emociones y ofrece solo lo que tu negocio decide cumplir.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["comunicacion-atencion", "tema-sensible"],
    estandarGuia: 3,
    activoOriginal:
      "Ficha del reclamo y tarjeta de decisión copiables, y rúbrica de cinco criterios con dos reglas de bloqueo para revisar la respuesta antes de enviarla",
    problem: "Recibiste un reclamo y quieres responder con calma y profesionalismo, sin prometer algo que no puedes cumplir.",
    whyThisPage:
      "Ofrece un método para no responder impulsivamente (pausa, hechos, decisión propia, respuesta) y cubre la versión pública y la privada de la respuesta.",
    relatedGuides: ["responder-consultas-de-clientes-con-ia", "analizar-opiniones-de-clientes-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Un reclamo llega justo cuando menos ganas hay de responder. Haz una pausa, ordena los hechos y decide qué ofreces antes de escribir una línea, en privado y en público.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de una hora por reclamo; algo más la primera vez",
    needs: ["Un asistente de IA de chat", "El mensaje del cliente, sin datos personales", "Tus registros del pedido: fechas, chats y seguimiento", "Tus políticas escritas, si las tienes"],
    result: "Una ficha del reclamo, una tarjeta con tu decisión y una respuesta privada y otra pública revisadas",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el resultado: un reclamo, los hechos ordenados y una respuesta serena.",
      description:
        "Una composición de tres columnas: a la izquierda un mensaje de reclamo ficticio en un chat, en el centro una tabla con hechos y estados (Confirmado, Parcial, No confirmado) y a la derecha una respuesta corta. Sin nombres ni teléfonos reales.",
      alt: "Un mensaje de reclamo, una tabla de hechos con su estado y una respuesta breve, dispuestos de izquierda a derecha.",
      caption: "Del reclamo a una respuesta con los hechos claros.",
    }),
    registro: slot("registro-de-hechos.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Muestra cómo se ve el registro de hechos ya reunido antes de abrir la IA.",
      description:
        "La tabla del registro con fecha y hora, qué pasó y la fuente de cada línea, y al lado el mensaje del cliente ya anonimizado. Un recuadro marca lo que se quitó (nombre, teléfono, dirección, número de pedido). Caso ficticio.",
      alt: "Tabla con ocho líneas de hechos con fecha, hora y fuente, junto a un mensaje de cliente sin datos personales.",
      caption: "Los hechos, con fecha, hora y fuente.",
      zoom: true,
    }),
    ficha: slot("ficha-del-reclamo.webp", {
      section: "entrevista",
      ratio: "16/9",
      purpose: "Enseña a leer la ficha: los puntos del cliente con su estado y lo que falta comprobar.",
      description:
        "La ficha del caso con sus cinco puntos, cada uno con el color de su estado, y debajo los apartados «Emociones y juicios» y «Lo que pide». Resaltar el punto «No confirmado». Caso ficticio.",
      alt: "Tabla de puntos de un reclamo con su estado de confirmación y apartados de emociones y petición.",
      caption: "La ficha separa lo comprobado de lo que solo dice el cliente.",
      zoom: true,
    }),
    tarjeta: slot("tarjeta-de-decision.webp", {
      section: "prompt",
      ratio: "4/3",
      purpose: "Muestra la tarjeta de decisión ya rellena, para que se vea que la decisión está escrita antes del texto.",
      description:
        "La tarjeta con sus nueve campos rellenos con el caso: lo que se reconoce, lo que se ofrece con su condición y plazo, lo que no se ofrece, cómo se dice y el siguiente paso. Resaltar «Ofrezco» y «No ofrezco». Caso ficticio.",
      alt: "Tabla con la decisión de un negocio ante un reclamo: qué reconoce, qué ofrece y qué no.",
      caption: "La decisión, escrita antes de pedir el texto.",
      zoom: true,
    }),
    primerResultado: slot("borrador-inicial.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver el primer borrador y localizar la frase genérica y el punto sin responder.",
      description:
        "El borrador de respuesta con la primera frase y la ausencia del párrafo sobre los mensajes marcadas, y al lado la ficha para comparar. Caso ficticio; ocultar datos de cuenta.",
      alt: "Borrador de respuesta a un reclamo con una frase resaltada y la ficha del caso al lado.",
      caption: "El primer borrador, con dos cosas que revisar.",
      zoom: true,
    }),
    contraste: slot("contraste-con-la-tarjeta.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar cada frase del borrador con la ficha y la tarjeta.",
      description:
        "El borrador con cada frase enlazada por una línea a la fila de la ficha o al campo de la tarjeta de donde sale, y la rúbrica puntuada al lado (8 de 10). Marcar la frase sin origen. Caso ficticio.",
      alt: "Borrador de respuesta con cada frase conectada a la fila de la ficha o al campo de la tarjeta que la respalda.",
      caption: "Cada frase debe tener un origen.",
      zoom: true,
    }),
    final: slot("respuesta-corregida.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra la respuesta después del ajuste, con los dos cambios resaltados.",
      description:
        "La respuesta corregida con las dos partes nuevas resaltadas: la apertura concreta y el párrafo sobre los mensajes. Debajo, la tabla de cambios. Caso ficticio.",
      alt: "Respuesta a un reclamo con dos partes resaltadas y una tabla con los cambios respecto al borrador.",
      caption: "Dos cambios, el resto intacto.",
      zoom: true,
    }),
    publica: slot("respuesta-publica.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Muestra la respuesta pública junto a la reseña, breve y sin datos del pedido.",
      description:
        "La reseña de una estrella (ficticia) con la respuesta pública debajo, y un recuadro con «Lo que dejé fuera»: fechas, oferta, la palabra «estafa» y el motivo. Sin nombres reales.",
      alt: "Una reseña negativa con una respuesta pública corta debajo y una lista de lo que se dejó fuera.",
      caption: "En público, poco y sin datos.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "ficha",
      purpose: "Prueba real del prompt de ficha: la tabla de puntos con su estado y los apartados finales.",
      description:
        "Captura de la tabla de puntos, de «Emociones y juicios», «Lo que pide», «Para una persona» y «FALTA». Usa el reclamo y los registros del caso (o los tuyos anonimizados). Ocultar datos personales y de cuenta.",
      alt: "Captura de la ficha de un reclamo devuelta por un asistente.",
      caption: "Prueba del prompt de ficha.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "privada",
      purpose: "Prueba real del prompt de respuesta privada: el texto, la tabla USADO y los apartados finales.",
      description:
        "Captura de «Respuesta», de la tabla «USADO», de «FALTA» y de «Para una persona». Usa la ficha y la tarjeta del caso. Anota aparte si cada oferta coincide con tu tarjeta. Ocultar datos personales y de cuenta.",
      alt: "Captura de una respuesta privada a un reclamo con su tabla de origen de cada frase.",
      caption: "Prueba del prompt de respuesta privada.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una respuesta con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "publica",
      purpose: "Prueba real del prompt de respuesta pública: el texto y lo que dejó fuera.",
      description:
        "Captura de «Respuesta pública», de «Lo que dejé fuera» y de «FALTA». Usa la reseña del caso. Cuenta las palabras aparte. Ocultar datos personales y de cuenta.",
      alt: "Captura de una respuesta pública a una reseña negativa devuelta por un asistente.",
      caption: "Prueba del prompt de respuesta pública.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Un reclamo suele llegar como un golpe: el cliente está enojado, mezcla lo que pasó con lo que siente y a veces tiene parte de razón y parte no. Responder enseguida es lo más humano y lo más riesgoso: se discute, se promete lo que no se puede cumplir o se ofrece de más para que pare.\n\nUn asistente de IA puede ordenar el mensaje y redactar con calma. Pero si le pegas solo el enojo, puede inventar una causa, ofrecer descuentos que nadie decidió o prometer que no volverá a pasar. Y si le pegas datos del cliente, los compartes sin necesidad.\n\n**La IA redacta lo que tú decidiste, con los hechos que tú comprobaste: la decisión de qué ofrecer nunca la toma ella.**",
    symptoms: [
      "Lees el mensaje y quieres contestar en el acto.",
      "No sabes si el cliente tiene razón en todo, en parte o en nada.",
      "Ofreciste algo para calmarlo y después no pudiste sostenerlo.",
      "Dudas cómo responder a una reseña pública sin discutir ni exponer datos.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con una respuesta lista para tu revisión final, sustentada en tus hechos y en una decisión tomada por ti.",
    deliverables: [
      { label: "Una ficha del reclamo", detail: "Cada punto del cliente con su estado: confirmado, parcial o no confirmado." },
      { label: "Una tarjeta de decisión", detail: "Lo que reconoces, lo que ofreces con su condición y plazo, y lo que no ofreces." },
      { label: "Una respuesta privada", detail: "Un borrador corto que dice cada cosa con su dato, revisado con una rúbrica." },
      { label: "Una respuesta pública", detail: "Breve, sin datos del pedido y sin ofertas, para una reseña." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Vendes a clientes finales y recibiste un reclamo por mensajería, redes o correo.",
      "Tú decides qué se ofrece, o puedes preguntarle a quien decide.",
      "Nunca usaste una IA, o casi nada.",
    ],
    notForWho: [
      "El reclamo menciona una lesión, un riesgo para la salud, una denuncia, un abogado o una disputa con el banco: debe llevarlo una persona con criterio.",
      "Quieres que la IA decida si compensas y cuánto.",
      "Quieres borrar o cambiar una reseña: eso depende de la plataforma.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Luz de Barrio (ficticio) — tienda online de velas artesanales",
    situation:
      "Luz de Barrio vende por Instagram y WhatsApp y despacha con una mensajería. Un miércoles, un cliente escribe enojado por un pedido que llegó tarde y, minutos después, deja una reseña de una estrella. Todo es inventado para esta guía.",
    goal: "Responder con calma, sin prometer de más, por privado y en la reseña pública.",
    data: [
      { label: "Reclamo por WhatsApp", value: `«${RECLAMO}»` },
      { label: "Reseña pública de una estrella", value: `«${RESENA}»` },
      { label: "Lo que promete la web", value: POLITICAS },
      { label: "Lo que registró el negocio", value: `${REGISTRO.length} líneas con fecha, hora y fuente` },
    ],
    problem: "El pedido llegó el martes. El cliente dice que le prometieron el jueves, que escribió tres veces sin respuesta y que la caja llegó golpeada, y pide el reembolso total.",
    application: "Hace una pausa, reúne sus hechos, ordena el reclamo, decide qué ofrece, pide la respuesta privada, la contrasta, la corrige y prepara la pública.",
    result: "Una respuesta privada que nombra lo que es suyo y ofrece solo lo decidido, y una pública breve.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan la respuesta.",
    blocks: [
      {
        title: "Primero, la pausa",
        detail: "La respuesta impulsiva se escribe aparte y no se envía. Lo que sí haces enseguida es fijar cuándo responderás, con un plazo que puedas cumplir.",
      },
      {
        title: "Hechos, versión y emoción no son lo mismo",
        detail: "Lo que pasó se comprueba con tus registros. Lo que el cliente cree y lo que siente se escuchan, pero no se cuentan como hechos.",
        example: "«Llegó el martes» se comprueba. «Es una estafa» es un juicio: no se discute ni se cuenta como hecho.",
      },
      {
        title: "La decisión va antes del texto",
        detail: "Qué reconoces, qué ofreces y qué no lo escribes tú, en una tarjeta. La IA redacta a partir de ella y no añade nada.",
      },
      {
        title: "Lo privado resuelve, lo público tranquiliza",
        detail: "En privado hay hechos, ofertas y una petición concreta. En público lo leen otros clientes: es corto y no lleva datos del pedido ni ofertas.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Un cliente me escribió muy enojado porque su pedido llegó tarde. Contéstale para calmarlo y ofrécele lo que haga falta.",
    whyInsufficient:
      "Con esa frase la IA no conoce los hechos ni tus políticas, y tú no decidiste nada. Rellena con causas, ofertas y promesas que suenan bien (ejemplo ilustrativo).",
    issues: [
      "No incluye ningún hecho, así que la IA inventa la causa.",
      "«Lo que haga falta» deja la compensación en manos de la IA.",
      "No separa lo que el cliente afirma de lo que puedes comprobar.",
      "No dice dónde se publicará: una respuesta privada y una pública no se escriben igual.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Reúne cuatro cosas antes de abrir la IA.",
    items: [
      { label: "El reclamo tal cual", detail: "Sin nombre, teléfono, dirección ni número de pedido: escribe «el cliente».", required: true },
      { label: "Tus registros", detail: "Pedido, conversaciones, seguimiento y fotos, con fecha y hora. Lo que no está registrado no se afirma.", required: true },
      { label: "Tus políticas escritas", detail: "Plazos de envío y devoluciones, tal como figuran en tu web.", required: true },
      { label: "Lo que estás en condiciones de ofrecer", detail: "Qué puedes cumplir y con qué costo. Se decide después de la ficha, pero conviene tenerlo pensado.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribe la IA y por qué no se sostiene",
      purpose: "Ver cómo un pedido sin hechos ni decisión produce frases que no puedes sostener.",
      columns: ["Frase de la IA", "Por qué no se sostiene"],
      rows: [
        ["«Tu pedido se retrasó por un problema con la mensajería.»", "Los registros muestran que salió tarde del taller; la mensajería tardó lo previsto."],
        ["«Te ofrecemos un 30 % de descuento y el reembolso total.»", "Ninguna de las dos ofertas estaba decidida."],
        ["«Esto no volverá a ocurrir.»", "Es una promesa que no depende solo de ti."],
        ["«Escribiste una sola vez, no tres.»", "Discute con el cliente y da por falso lo que no está comprobado: pudo escribir por otro canal."],
      ],
      note: "Ejemplo ilustrativo, escrito a propósito.",
    },
    registro: {
      caption: "Registro de hechos del caso",
      purpose: "Tener cada hecho con su fecha, hora y fuente.",
      columns: ["Cuándo", "Qué pasó", "Fuente"],
      rows: REGISTRO,
      copyable: true,
      note: "Caso ficticio. En tu registro añade solo lo que puedas comprobar.",
    },
    ficha: {
      caption: "Ficha del reclamo: puntos del cliente",
      purpose: "Ver cada punto del cliente con su estado y lo que falta comprobar.",
      columns: ["N.º", "Punto del cliente", "Estado", "Qué dicen mis registros", "Qué falta comprobar"],
      rows: PUNTOS.map((p, i) => [String(i + 1), p.punto, p.estado, p.registros, p.falta]),
      copyable: true,
    },
    fichaExtra: {
      caption: "Ficha del reclamo: el resto de apartados",
      purpose: "Ver lo que siente el cliente y lo que pide, separado de los hechos.",
      columns: ["Apartado", "Contenido"],
      rows: [
        ["Emociones y juicios", EMOCIONES],
        ["Lo que pide", PIDE],
        ["Para una persona", "Ninguno"],
        ["FALTA", "La foto de la caja; el canal de los otros dos mensajes"],
      ],
      note: "Ejemplo generado con el prompt de ficha.",
    },
    tarjeta: {
      caption: "Tarjeta de decisión",
      purpose: "Tener escrito qué reconoces, qué ofreces y qué no, antes de redactar.",
      columns: ["Campo", "Mi decisión"],
      rows: TARJETA,
      copyable: true,
      note: "Ejemplo ficticio: la decide la dueña del negocio, no la IA.",
    },
    publica: {
      caption: "Respuesta pública a la reseña",
      purpose: "Ver una respuesta breve y lo que se dejó fuera de ella.",
      columns: ["Apartado", "Contenido"],
      rows: [
        ["Respuesta pública", PUBLICA],
        ["Lo que dejé fuera", "Las fechas y horas; la compensación ofrecida; la palabra «estafa»; el motivo del retraso."],
        ["Para una persona", "Ninguno"],
        ["FALTA", "Ninguno"],
      ],
      note: `Ejemplo generado con LO_QUE_PUEDO_DECIR «${LO_DIGO}» y CANAL_PRIVADO «${CANAL_PRIVADO}».`,
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cuatro de los ocho pasos llevan un prompt. Los otros cuatro los haces tú solo.",
    steps: [
      { title: "Haz una pausa antes de contestar", description: "Escribe aparte lo que te gustaría responder y no lo envíes. Fija una hora para responder que puedas cumplir.", output: "Una hora de respuesta y tu borrador impulsivo, sin enviar." },
      { title: "Reúne tus hechos", description: "Junta pedido, conversaciones, seguimiento y políticas, con fecha y hora y sin datos personales.", output: "Un registro de hechos." },
      { title: "Ordena el reclamo con la IA", description: "Pega el reclamo y tus hechos, y pide separar lo confirmado, lo que dice el cliente y lo que siente.", output: "Una ficha del reclamo." },
      { title: "Decide qué reconoces y qué ofreces", description: "Con la ficha delante, escribe qué reconoces, qué ofreces con su condición y su plazo, y qué no ofreces.", output: "Una tarjeta de decisión." },
      { title: "Pide la respuesta privada", description: "Entrega la ficha y la tarjeta, y pide un único borrador que diga cada cosa con su dato.", output: "Un borrador de respuesta." },
      { title: "Contrasta y corrige", description: "Puntúa el borrador con la rúbrica, contra tu ficha y tu tarjeta, y pide cambiar solo lo señalado.", output: "Una respuesta lista para tu revisión." },
      { title: "Prepara la respuesta pública", description: "Si hay una reseña, pide una respuesta breve, sin datos del pedido ni ofertas.", output: "Una respuesta pública." },
      { title: "Verifica y envía", description: "Recorre la lista de verificación y envía primero la privada, por el canal del cliente.", output: "Una respuesta enviada." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    ficha: {
      title: "Prompt de ficha: ordenar el reclamo en hechos, versión y emoción",
      objective: "Separar lo que dice el cliente de lo que confirman tus registros, sin repartir culpas y sin redactar la respuesta.",
      whenToUse: "Cuando ya hiciste la pausa y juntaste tus registros.",
      variables: [
        { name: "NEGOCIO", description: "Qué vende tu negocio, en una frase.", example: "Tienda online de velas artesanales" },
        { name: "POLITICAS", description: "Lo que promete tu web sobre plazos y devoluciones.", example: POLITICAS },
        { name: "RECLAMO", description: "El mensaje o la reseña, sin datos personales.", example: `${RECLAMO.split(",")[0]}…` },
        { name: "REGISTROS", description: "Tus hechos: fecha, hora, qué pasó y fuente.", example: "Lunes 1, 10:20 · pago confirmado · registro de pedidos" },
      ],
      prompt: `Actúa como un asistente que ordena reclamos de clientes para un negocio pequeño. Tu destinatario es la persona dueña, que leerá la ficha antes de decidir qué responder. Tu objetivo es separar lo que dice el cliente de lo que confirman sus registros. No redactes ninguna respuesta.

### CONTEXTO
Negocio: {{NEGOCIO}}
Lo que promete mi negocio: {{POLITICAS}}

### DATOS (única fuente)
Reclamo del cliente, sin datos personales:
{{RECLAMO}}

Mis registros (fecha, hora, qué pasó y fuente):
{{REGISTROS}}

### REGLAS
1. Divide el reclamo en puntos: cada afirmación de un hecho es una fila. Las opiniones y las emociones no son puntos.
2. Estado de cada punto: «Confirmado» si mis registros lo muestran; «Parcial» si lo muestran con una diferencia, y di cuál es; «No confirmado» si mis registros no lo muestran ni lo contradicen. No marques «Confirmado» porque suene verosímil.
3. No decidas quién tiene la culpa, no valores si el cliente exagera y no supongas causas, intenciones ni datos que no estén en mis registros.
4. Separa lo que sale de mis registros de lo que dice el cliente y de lo que tú supones, y marca cada suposición con «SUPUESTO».
5. Anota aparte las emociones y los juicios del cliente, con sus palabras y sin calificarlos.
6. Distingue lo que el cliente pide de forma explícita de lo que parece querer, y marca lo segundo «SUPUESTO».
7. Si el reclamo menciona un daño a la salud o a una persona, una denuncia, un abogado, una disputa con el banco o la tarjeta, o una ley, anota el punto en «Para una persona» y no lo desarrolles.
8. Si falta un dato o dos datos se contradicen, no lo resuelvas: escribe [FALTA: qué dato] y qué registro lo aclararía.

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: N.º | Punto del cliente | Estado | Qué dicen mis registros | Qué falta comprobar; (2) «Emociones y juicios»; (3) «Lo que pide»; (4) «Para una persona»; (5) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: cada punto es un hecho y no una opinión; cada «Confirmado» cita un registro mío con su fecha y hora; nada de lo que dice el cliente aparece como confirmado sin registro; no hay culpas, causas ni respuesta redactada; toda suposición está marcada. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo decidir yo qué reconozco y qué ofrezco, y que después pegaré esta ficha en el prompt de respuesta privada.`,
      explanation: [
        {
          part: "Estado de cada punto: «Confirmado» si mis registros lo muestran",
          why: "Cada frase del cliente se contrasta con tus registros y no con lo que suena razonable.",
        },
        {
          part: "No decidas quién tiene la culpa",
          why: "La ficha ordena; la decisión de qué reconocer es tuya y viene después.",
        },
        {
          part: "Anota aparte las emociones y los juicios del cliente",
          why: "«Es una estafa» no es un hecho que se compruebe ni una acusación que se discuta; verlo separado te ayuda a no reaccionar a él.",
        },
      ],
      evaluate: "Comprueba que cada «Confirmado» tiene un registro tuyo con fecha y hora, y que las emociones no aparecen como puntos.",
      improve: "Si marca «Confirmado» algo sin registro, pega otra vez tus registros y pide rehacer solo esa fila.",
    },

    privada: {
      title: "Prompt de respuesta privada: solo lo confirmado y lo decidido",
      objective: "Obtener un único borrador para el cliente que reconozca lo que es del negocio y diga con claridad qué se ofrece y qué no.",
      whenToUse: "Cuando tienes la ficha y la tarjeta de decisión.",
      variables: [
        { name: "CANAL", description: "Por dónde le vas a responder.", example: "WhatsApp" },
        { name: "TONO", description: "Cómo quieres sonar.", example: "Cercano y sereno, de tú" },
        { name: "FICHA", description: "La ficha del reclamo del paso anterior, completa.", example: "La tabla de puntos, con sus estados, y los apartados finales" },
        { name: "TARJETA", description: "Tu tarjeta de decisión, completa.", example: "La tabla de campos: Reconozco, Ofrezco, No ofrezco…" },
      ],
      prompt: `Actúa como redactor de respuestas a reclamos para un negocio pequeño. Tu destinatario final es el cliente, pero antes lo revisa la persona dueña, que ya decidió lo que se ofrece. Tu objetivo es redactar UN borrador de respuesta privada, usando solo la ficha y la tarjeta.

### CONTEXTO
Canal: {{CANAL}}
Tono: {{TONO}}

### DATOS (única fuente)
Ficha del reclamo:
{{FICHA}}

Tarjeta de decisión de la persona dueña:
{{TARJETA}}

### REGLAS
1. Afirma solo lo marcado «Confirmado» en la ficha. Lo «Parcial» se dice con su matiz. Lo «No confirmado» no se afirma, no se niega y no se discute: pide el dato que falta.
2. Ofrece únicamente lo que está en «Ofrezco» de la tarjeta, con su condición y su plazo tal cual. No añadas compensaciones, descuentos ni plazos.
3. Lo que la tarjeta marca como «No ofrezco» se dice con las palabras de «Cómo lo digo», sin dar a entender que podría cambiar.
4. Di lo que la tarjeta marca como «Reconozco». No culpes a terceros, no discutas con el cliente y no lo corrijas.
5. Contesta cada punto de la ficha y cada petición: con un dato confirmado, con un matiz o con una pregunta.
6. No prometas que no volverá a ocurrir ni ningún cambio futuro, y no des opiniones legales ni cites leyes.
7. Orden: (a) reconocer lo que vivió el cliente, (b) lo que es del negocio, (c) lo que se ofrece y lo que no, (d) el siguiente paso, que es uno solo y el de la tarjeta.
8. Máximo ${LIMITE_PRIVADA} palabras, con frases cortas.
9. Si la ficha o la tarjeta no bastan para cumplir una regla, escribe [FALTA: qué dato] en lugar de inventarlo. Lo que esté en «Para una persona» no lo respondas.

### FORMATO DE SALIDA
En este orden: (1) «Respuesta»: el texto para enviar; (2) «USADO»: una tabla de columnas fijas: Frase | De dónde sale (fila de la ficha o campo de la tarjeta); (3) «FALTA»; (4) «Para una persona». El texto lo escribes tú; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: cada frase con un hecho se apoya en una fila «Confirmado» o «Parcial»; cada oferta y cada «no» coincide con la tarjeta, con su condición y su plazo; no hay culpas, promesas futuras ni consejos legales; cada punto de la ficha tiene respuesta; el siguiente paso es uno solo; el texto no pasa de ${LIMITE_PRIVADA} palabras. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Lo «No confirmado» no se afirma, no se niega y no se discute: pide el dato que falta.",
          why: "Si el cliente dice algo que no puedes comprobar, ni lo aceptas ni lo desmientes: preguntas.",
        },
        {
          part: "Ofrece únicamente lo que está en «Ofrezco» de la tarjeta",
          why: "Impide que aparezca un descuento o un plazo que nadie decidió.",
        },
        {
          part: "«USADO»: una tabla de columnas fijas: Frase | De dónde sale",
          why: "Te permite ver de dónde sale cada frase y detectar la que no tiene origen.",
        },
      ],
      evaluate: "Puntúa el borrador con la rúbrica y, en la tabla USADO, busca una frase sin origen.",
      improve: "Si falta un punto o una frase suena genérica, pide un ajuste solo de eso, sin rehacer el texto.",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las frases o los puntos señalados, con la ficha y la tarjeta como fuente, y dejar el resto intacto.",
      whenToUse: "Después de contrastar, cuando el borrador tiene un problema.",
      variables: [
        { name: "PROBLEMAS", description: "Lo que hay que corregir y por qué.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Lo que no puede cambiar.", example: "Las ofertas, los plazos y el paso final" },
      ],
      prompt: `Actúa como editor de respuestas a reclamos para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, usando la ficha y la tarjeta, y dejar intacto lo demás.

### CONTEXTO
Usa la ficha, la tarjeta y el borrador de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Problemas que detecté:
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo lo señalado y lo que ese cambio obligue a ajustar. No toques ofertas, plazos ni el paso final salvo que yo lo pida.
2. Cada frase nueva se apoya en un hecho «Confirmado» o «Parcial» de la ficha, o en un campo de la tarjeta. No añadas datos, ofertas ni promesas.
3. Si un problema que te señalé no existe en el borrador, o la ficha y la tarjeta se contradicen, dímelo antes de cambiar nada.
4. En «Motivo» cita la fila de la ficha o el campo de la tarjeta que justifica el cambio.
5. El texto resultante debe seguir teniendo ${LIMITE_PRIVADA} palabras o menos.
6. Si para una corrección falta un dato, escribe [FALTA: qué dato] en lugar de inventarlo.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla de columnas fijas: Antes | Después | Motivo; (2) «Sin cambios»: lo que no toqué; (3) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada frase nueva se apoya en la ficha o en la tarjeta; cada «Motivo» cita su fila o su campo; ofertas, plazos y paso final están idénticos; el texto no pasa de ${LIMITE_PRIVADA} palabras. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo lo señalado",
          why: "Evita que rehaga partes que ya estaban bien, sobre todo las ofertas.",
        },
        {
          part: "Si un problema que te señalé no existe en el borrador",
          why: "Evita corregir a ciegas un problema que tú pudiste señalar mal.",
        },
        {
          part: "En «Motivo» cita la fila de la ficha o el campo de la tarjeta",
          why: "Cada cambio queda con su respaldo y puedes comprobarlo.",
        },
      ],
      evaluate: "Compara el resultado con el borrador: solo deben cambiar las frases señaladas.",
      improve: "Si toca una oferta que no señalaste, pega otra vez el borrador y pide repetir solo lo señalado.",
    },

    publica: {
      title: "Prompt de respuesta pública: breve, sin datos y sin ofertas",
      objective: "Obtener una respuesta corta a una reseña que no exponga datos del pedido, no discuta y no anuncie compensaciones.",
      whenToUse: "Cuando el reclamo también está en una reseña y ya decidiste qué puedes decir en público.",
      variables: [
        { name: "RESENA", description: "El texto de la reseña.", example: RESENA },
        { name: "LO_QUE_PUEDO_DECIR", description: "Lo único que aceptas reconocer en público.", example: LO_DIGO },
        { name: "CANAL_PRIVADO", description: "Dónde seguirás la conversación.", example: CANAL_PRIVADO },
        { name: "YA_ESCRIBI", description: "Si ya respondiste en privado: sí o no.", example: "sí" },
      ],
      prompt: `Actúa como redactor de respuestas públicas a reseñas para un negocio pequeño. Tu destinatario es cualquier persona que lea la reseña, no solo el cliente. Tu objetivo es escribir una respuesta corta, serena y sin datos del caso.

### CONTEXTO
Canal privado: {{CANAL_PRIVADO}}
¿Ya le escribí en privado?: {{YA_ESCRIBI}}

### DATOS (única fuente)
Reseña:
{{RESENA}}

Lo único que puedo reconocer en público:
{{LO_QUE_PUEDO_DECIR}}

### REGLAS
1. Máximo ${LIMITE_PUBLICA} palabras.
2. Nada de datos del cliente ni del pedido: sin nombres, fechas, horas, números de pedido, montos ni productos.
3. No repitas ni discutas acusaciones como «estafa»: no las cites, no las niegues y no corrijas al cliente en público.
4. No menciones compensaciones, reembolsos ni descuentos: eso se habla en privado.
5. Reconoce solo lo que figura en «Lo único que puedo reconocer», con esas palabras. No expliques el motivo.
6. Si ya le escribí en privado, dilo; si no, invítalo a escribir al canal privado.
7. Sin promesas de cambio y sin emojis. El texto debe entenderse sin conocer el caso.
8. Si la reseña habla de salud, de una denuncia o de un abogado, no la respondas: anótalo en «Para una persona».
9. Si falta un dato, escribe [FALTA: qué dato] en lugar de inventarlo.

### FORMATO DE SALIDA
En este orden: (1) «Respuesta pública»; (2) «Lo que dejé fuera»: los datos, ofertas o acusaciones que evitaste, en una lista; (3) «Para una persona»; (4) «FALTA».

### ANTES DE RESPONDER
Verifica que: el texto no pasa de ${LIMITE_PUBLICA} palabras; no hay fechas, cifras ni nombres; no aparece ninguna oferta ni la palabra de la acusación; solo reconoce lo permitido; menciona el canal privado. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "No repitas ni discutas acusaciones como «estafa»",
          why: "Discutir en público convierte una reseña en una pelea que leen otros; repetir la palabra la deja escrita en tu respuesta.",
        },
        {
          part: "No menciones compensaciones, reembolsos ni descuentos: eso se habla en privado.",
          why: "Lo que ofreces en público puede volverse una expectativa para todos los clientes.",
        },
        {
          part: "«Lo que dejé fuera»",
          why: "Te muestra qué evitó, para que compruebes que no se coló un dato.",
        },
      ],
      evaluate: "Cuenta las palabras y busca fechas, cifras y ofertas: no debe haber ninguna.",
      improve: "Si suena a plantilla o defensivo, pide otra versión más corta con las mismas reglas.",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de respuesta privada a la ficha y a la tarjeta del caso. La tuya será distinta.",
    parts: [
      { type: "text", text: "**Respuesta**" },
      { type: "text", text: BORRADOR.slice(0, 2).join(" ") },
      { type: "text", text: BORRADOR[2] },
      { type: "text", text: BORRADOR[3] },
      { type: "text", text: BORRADOR[4] },
      {
        type: "table",
        table: {
          caption: "USADO en el primer borrador",
          purpose: "Ver de dónde sale cada frase del borrador.",
          columns: ["Frase", "De dónde sale"],
          rows: [
            ["«Lamentamos las molestias…»", "Fórmula de apertura; no sale de la ficha"],
            ["«Tu pedido salió el viernes 5 y no el martes 2…»", "Tarjeta: «Reconozco» y «Motivo que puedo decir»"],
            ["«Te devolvemos el costo del envío…»", "Tarjeta: «Ofrezco 1» y «Ofrezco 2»"],
            ["«No podemos devolver el total del pedido…»", "Tarjeta: «No ofrezco» y «Cómo lo digo»"],
            ["«Para seguir, responde este mensaje…»", "Ficha: punto 5 (No confirmado); tarjeta: «Siguiente paso único»"],
          ],
        },
      },
      { type: "text", text: "**FALTA:** ninguno. **Para una persona:** ninguno." },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "respuesta",
    title: "Puntúa una respuesta a un reclamo",
    intro:
      `Puntúa tu borrador en los cinco criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se envía aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `El borrador es corto, ofrece lo decidido y cada oferta coincide con la tarjeta. Se contrasta frase a frase con la ficha y la tarjeta y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "hechos",
        verdict: vered("hechos"),
        comment: "Cada hecho está en la ficha como Confirmado. No afirma nada de la caja golpeada: la pide.",
      },
      {
        criterionId: "ofrece",
        verdict: vered("ofrece"),
        comment: `Las dos ofertas y el «no» al reembolso total coinciden con la tarjeta, con su plazo de ${PLAZO_DEVOLUCION} y su cupón del ${CUPON} por ${VALIDEZ_CUPON}.`,
      },
      {
        criterionId: "reconoce",
        verdict: vered("reconoce"),
        comment: "Nombra el retraso, pero abre con «las molestias que esto pudo causarte»: no dice lo que vivió el cliente y el «pudo» pone en duda que lo vivió.",
      },
      {
        criterionId: "puntos",
        verdict: vered("puntos"),
        comment: "No responde al punto 4 de la ficha (los tres mensajes, Parcial): ni dice lo que muestran los registros ni pregunta por el otro canal.",
      },
      {
        criterionId: "tono",
        verdict: vered("tono"),
        comment: "Frases cortas y llanas, de tú, sin defensiva.",
      },
    ],
    conclusion: "Es una buena base: no inventa nada y no ofrece de más. Los dos defectos son de contenido y de matiz, y se leen bien a primera vista.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir dos cosas, no reescribir el borrador.",
    promptId: "ajuste",
    why: "El contraste señaló una apertura genérica y un punto sin responder. El prompt limita el cambio a lo señalado, exige que cada cambio se apoye en la ficha o la tarjeta, cita su fila o su campo en «Motivo» y separa lo cambiado de lo que no.",
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
          rows: [
            [`«${FRASE_APERTURA_FRIA}»`, `«${FRASE_APERTURA}»`, "Ficha, filas 1 y 3 (Confirmadas): nombra el hecho que vivió el cliente y quita el «pudo»."],
            ["(No había párrafo sobre los mensajes)", `«${FRASE_MENSAJES}»`, "Ficha, fila 4 (Parcial): dice lo que muestran los registros y pregunta lo que falta; tarjeta, «Pido al cliente»."],
          ],
        },
      },
      { type: "text", text: `**Sin cambios:** las ofertas, los plazos y el paso final. **FALTA:** ninguno. El texto queda en ${palabras(CORREGIDO.join(" "))} palabras (el límite es ${LIMITE_PRIVADA}).` },
      { type: "text", text: "**Respuesta final**" },
      { type: "text", text: CORREGIDO.slice(0, 2).join(" ") },
      { type: "text", text: CORREGIDO[2] },
      { type: "text", text: CORREGIDO[3] },
      { type: "text", text: CORREGIDO[4] },
      { type: "text", text: CORREGIDO[5] },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Responder en caliente",
      whyItHurts: "Con el enojo puesto se discute, se ofrece de más para que pare o se promete lo que no se puede cumplir.",
      instead: "Escribe la respuesta impulsiva aparte, no la envíes y responde cuando tengas hechos y decisión.",
    },
    {
      title: "Pedirle a la IA que «lo calme» sin hechos",
      whyItHurts: "Rellena con causas, ofertas y promesas que suenan bien y nadie decidió.",
      instead: "Pasa la ficha y la tarjeta, y pide solo el texto.",
    },
    {
      title: "Discutir en la reseña pública",
      whyItHurts: "La leen otros clientes: una discusión o un dato del pedido te hace más daño que la reseña.",
      instead: "Responde breve, sin datos ni ofertas, y sigue por privado.",
    },
    {
      title: "Dar todo por cierto o todo por falso",
      whyItHurts: "Aceptar sin comprobar te compromete; negar sin comprobar enfurece más.",
      instead: "Marca cada punto como confirmado, parcial o no confirmado y pregunta lo que falta.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de enviar, marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Leí el borrador como lo leería el cliente, con su mensaje original al lado." },
      { label: "Cada fecha, hora y dato coincide con mis registros." },
      { label: "Cada oferta coincide con mi tarjeta, con su condición y su plazo, y puedo cumplirla." },
      { label: "Ninguna frase culpa a un tercero ni discute con el cliente." },
      { label: "En la respuesta pública no hay nombres, fechas, números de pedido, montos ni ofertas." },
      { label: "Si el reclamo menciona salud, lesión, denuncia, abogado, disputa de pago o una ley, lo revisó una persona con criterio.", detail: "Esta guía no cubre esos casos." },
      { label: "Revisé las normas de la plataforma de la reseña y las de consumo de mi país.", detail: "Cambian de un lugar a otro y aquí no se cubren." },
    ],
    principle: "La IA redacta y propone. Lo que se afirma y lo que se ofrece lo confirmas tú antes de enviar.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la respuesta enviada, queda cumplir, registrar y mejorar.",
    steps: [
      { title: "Cumple lo ofrecido y anótalo", detail: "Haz lo que ofreciste y anota la fecha en que lo cumpliste." },
      { title: "Fija cuándo volver a mirar", detail: "Decide de antemano cuándo mirarás si respondió; con un solo recordatorio es suficiente." },
      { title: "Lleva un registro de casos", detail: "Una fila por caso: fecha, tema, qué reconociste y qué decidiste. Así verás los que se repiten." },
      { title: "Arregla la causa de fondo", detail: "Si faltaron cajas, cambia tu proceso o lo que prometes en la web." },
      { title: "Guarda plantillas para el próximo caso", detail: "Con tu ficha y tu tarjeta vacías, el siguiente empezará con los campos armados." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena tu respuesta, pero tiene límites.",
    items: [
      { title: "No cubre reclamos con riesgo legal o de salud", detail: "Una lesión, una denuncia, un abogado o una disputa de pago los debe llevar una persona con criterio." },
      { title: "No arregla la causa", detail: "Una buena respuesta no evita el próximo reclamo si el problema sigue." },
      { title: "No controla la reseña", detail: "El cliente puede no responder, mantener su reseña o cambiarla: eso no depende de ti." },
      { title: "Necesita políticas propias", detail: "Sin políticas escritas de envío y devolución, la tarjeta se decide a ciegas: empieza por ahí." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Un reclamo bien respondido empieza antes de escribir: con una pausa, los hechos ordenados y una decisión tomada. Con eso, la respuesta, privada y pública, es corta y clara.",
    takeaways: [
      "Haz la pausa antes de escribir.",
      "Separa lo que pasó, lo que dice el cliente y lo que siente.",
      "Escribe tu decisión antes de pedir el texto.",
      "Responde con detalle por privado y con pocas palabras en público.",
    ],
    nextGuide: "analizar-opiniones-de-clientes-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "dato-personal", "reclamo", "compensacion", "escalar", "rubrica"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Y si el cliente exige respuesta ya?",
      answer:
        "Puedes confirmar que recibiste el mensaje y decir cuándo responderás, con un plazo que puedas cumplir. El texto de fondo espera a tener los hechos.",
    },
    {
      question: "¿Respondo primero en privado o en la reseña?",
      answer:
        "No hay una regla única. En esta guía se responde primero en privado, para que el cliente no se entere de la oferta leyendo tu respuesta pública.",
    },
    {
      question: "¿Puedo pegar el mensaje del cliente en una IA?",
      answer:
        "Depende de la herramienta y de las normas de tu país. Quita nombre, teléfono, dirección y número de pedido antes, y comparte solo el texto necesario.",
    },
    {
      question: "¿Y si creo que el cliente miente?",
      answer:
        "Marca el punto como no confirmado y pregunta lo que falta, sin acusar. Si sospechas un fraude, sigue el proceso de tu plataforma de pago, que aquí no se cubre.",
    },
  ],
});
