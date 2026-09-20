import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * negocio/documentar-procesos-con-ia
 *
 * Tipo: automatización o flujo + comunicación (el procedimiento es un texto para otra persona). No es de números:
 * los pocos datos (12 pasos, «más de tres piezas», 24 horas, martes y jueves) son parte del caso y se verificaron
 * con código. Todo el caso (Cerámica Sol, Lucía, Mateo, sus notas, sus respuestas, sus herramientas) es FICTICIO.
 * Los ejemplos de la IA están redactados aplicando literalmente cada prompt: no proceden de una conversación real ni
 * de una prueba del autor (esas viven en `evidence.pruebas`, que solo rellena el autor). El pedido ingenuo es
 * ILUSTRATIVO. La prueba del procedimiento con otra persona NO se hizo: el registro queda sin rellenar y no hay
 * resultados inventados.
 *
 * Fuente única de verdad: los pasos del procedimiento (PASOS), lo que Lucía dice en la entrevista, las columnas de
 * cada tabla, la rúbrica y sus puntajes se definen UNA vez y los leen las tablas, los prompts, los ejemplos y los
 * criterios.
 */
const slot = guideSlots("negocio", "documentar-procesos-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const NEGOCIO = "Cerámica Sol (ficticia), una tienda online de cerámica artesanal";
const PROCESO = "Registrar un pedido, desde que llega el aviso hasta que sale el paquete";

/** Lo que Lucía anotó al hacer el proceso una vez (7 líneas, incompletas a propósito). */
const NOTAS = [
  "Llega el correo «Nuevo pedido».",
  "Abro el panel y miro que esté pagado.",
  "Reviso el stock.",
  "Anoto el pedido en la hoja.",
  "Empaco.",
  "Hago la etiqueta y dejo la caja para el mensajero.",
  "Pongo «Enviado» con el seguimiento.",
];

type Paso = { dijo: string; que: string; donde: string; ok: string; distinto: string };
/** El procedimiento correcto, paso a paso. Es lo que Lucía dijo en la entrevista, ordenado. */
const PASOS: Paso[] = [
  { dijo: "abro el pedido en el panel, sección Pedidos, y veo el número del pedido y sus productos", que: "Abrir el pedido nuevo", donde: "Panel de la tienda, sección Pedidos", ok: "Veo el número del pedido y sus productos", distinto: "—" },
  {
    dijo: "miro en el panel, dentro del pedido, que el estado del pago diga «Pagado»",
    que: "Comprobar que el pago dice «Pagado»",
    donde: "Panel de la tienda, dentro del pedido",
    ok: "El estado dice «Pagado»",
    distinto: "Si dice «Pendiente», no preparar nada; esperar 24 horas y, pasado ese plazo, escribir al cliente",
  },
  {
    dijo: "miro en la hoja de stock que cada producto tenga al menos las unidades pedidas",
    que: "Comprobar que hay unidades de cada producto",
    donde: "Hoja de stock",
    ok: "Cada producto tiene al menos las unidades pedidas",
    distinto: "Si falta alguno, avisar al cliente antes de seguir",
  },
  {
    dijo: "reviso en el panel, dentro del pedido, que haya calle, número, ciudad y teléfono",
    que: "Revisar que la dirección y el teléfono estén completos",
    donde: "Panel de la tienda, dentro del pedido",
    ok: "Hay calle, número, ciudad y teléfono",
    distinto: "Si falta un dato, escribir al cliente y no enviar hasta tenerlo",
  },
  { dijo: "anoto el pedido en una fila nueva de la hoja de pedidos, con número, fecha, productos y dirección", que: "Anotar el pedido en una fila nueva", donde: "Hoja de pedidos", ok: "La fila tiene número, fecha, productos y dirección", distinto: "—" },
  { dijo: "descuento las unidades vendidas en la hoja de stock y compruebo que el stock bajó en las unidades pedidas", que: "Descontar las unidades vendidas", donde: "Hoja de stock", ok: "El stock bajó en las unidades pedidas", distinto: "—" },
  {
    dijo: "empaco las piezas en la caja, en la mesa de empaque, y la agito: no se mueve ninguna pieza",
    que: "Empacar las piezas en la caja",
    donde: "Mesa de empaque",
    ok: "Ninguna pieza se mueve al agitar la caja",
    distinto: "Si el pedido tiene más de tres piezas, usar la caja grande",
  },
  { dijo: "creo la etiqueta en el sitio de la empresa de mensajería y debe mostrar la dirección del pedido", que: "Crear la etiqueta de envío", donde: "Sitio de la empresa de mensajería", ok: "La etiqueta muestra la dirección del pedido", distinto: "—" },
  { dijo: "pego la etiqueta en la caja, en la mesa de empaque, visible y sin arrugas", que: "Pegar la etiqueta en la caja", donde: "Mesa de empaque", ok: "La etiqueta queda visible y sin arrugas", distinto: "—" },
  {
    dijo: "dejo la caja en la mesa de salida",
    que: "Dejar la caja en la mesa de salida",
    donde: "Mesa de salida",
    ok: "La caja está en la mesa de salida",
    distinto: "El mensajero pasa los martes y los jueves; si es otro día, la caja espera al próximo",
  },
  {
    dijo: "cambio el estado del pedido a «Enviado» con el número de seguimiento, en el panel, dentro del pedido, y veo el estado «Enviado»",
    que: "Cambiar el estado del pedido a «Enviado» con el número de seguimiento",
    donde: "Panel de la tienda, dentro del pedido",
    ok: "El pedido muestra el estado «Enviado»",
    distinto: "—",
  },
  { dijo: "copio el número de seguimiento en la fila del pedido de la hoja de pedidos y compruebo que quedó", que: "Copiar el número de seguimiento en la fila del pedido", donde: "Hoja de pedidos", ok: "La fila tiene el número de seguimiento", distinto: "—" },
];
const N_PASOS = PASOS.length;
const N_EXC = PASOS.filter((p) => p.distinto !== "—").length;

/** Lo que dice la entrevista, salvo los pasos (que salen de PASOS). */
const RESPUESTAS: [bloque: string, dije: string, estado: string][] = [
  ["Cuándo empieza", "Cuando llega el correo «Nuevo pedido» de la tienda.", "Confirmado"],
  ["Quién lo hace", "Hasta ahora, yo. Desde el lunes, Mateo, que nunca lo hizo.", "Confirmado"],
  ["Qué se necesita", "Acceso al panel de la tienda, a la hoja de stock y a la hoja de pedidos; papel de burbujas, cajas y cinta; mi cuenta en el sitio de la mensajería.", "Confirmado"],
  ["Cómo lo hago", `${PASOS.map((p, i) => `${i + 1}) ${p.dijo}`).join("; ")}.`, "Confirmado"],
  [
    "Decisiones y excepciones",
    "Si el pago está «Pendiente», espero 24 horas y luego escribo al cliente. Si falta stock, aviso antes de seguir. Si falta un dato de la dirección, escribo al cliente y no envío hasta tenerlo. Con más de tres piezas uso la caja grande. El mensajero pasa los martes y los jueves.",
    "Confirmado",
  ],
  ["Cuándo está terminado", "Cuando el pedido dice «Enviado», la fila de la hoja tiene el seguimiento y el stock está descontado.", "Confirmado"],
  ["Lo que no sé", "Qué hacer si el mensajero no pasa el día previsto.", "Pendiente"],
];
const TERMINADO = RESPUESTAS[5][1].replace(/^Cuando /, "").replace(/\.$/, "");
const cap = (t: string) => `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
const ANTES_DE_EMPEZAR = "El panel de la tienda, las hojas de stock y de pedidos, papel de burbujas, cajas, cinta y la cuenta de la mensajería.";
const PENDIENTE = `[FALTA: ${RESPUESTAS[6][1].replace(/\.$/, "").replace(/^Qué/, "qué")}]`;

/* tabla del procedimiento */
const COL_PROC = ["Paso", "Qué hacer", "Dónde", "Cómo sé que salió bien", "Si algo sale distinto"];
const fila = (p: Paso, i: number) => [String(i + 1), p.que, p.donde, p.ok, p.distinto];
/** La primera vez: tres pasos quedan a medias (el paso 4, el 7 y el 10). */
const P4 = 3, P7 = 6, P10 = 9;
const PRIMERA: Paso[] = PASOS.map((p, i) =>
  i === P4 ? { ...p, distinto: "Si falta un dato, escribir al cliente" }
  : i === P7 ? { ...p, ok: "La caja está bien empacada" }
  : i === P10 ? { ...p, distinto: "—" }
  : p,
);
const CELDA = (pasos: Paso[], i: number, col: 3 | 4) => `Paso ${i + 1} · ${COL_PROC[col]}: ${fila(pasos[i], i)[col]}`;
const CAMBIOS = [
  [CELDA(PRIMERA, P4, 4), CELDA(PASOS, P4, 4), "Lucía dijo que no se envía sin la dirección completa."],
  [CELDA(PRIMERA, P7, 3), CELDA(PASOS, P7, 3), "Es la señal que Lucía dio, y se puede comprobar."],
  [CELDA(PRIMERA, P10, 4), CELDA(PASOS, P10, 4), "Lucía dijo cuándo pasa el mensajero; quien empieza no puede adivinarlo."],
];
const PROBLEMAS_TXT =
  `1) El paso ${P4 + 1} no dice que no se envía sin el dato. 2) El paso ${P7 + 1} no dice cómo sé que salió bien. 3) El paso ${P10 + 1} no dice cuándo pasa el mensajero.`;

/* versión para quien empieza (checklist) */
const COL_CHECK = ["Marca", "Lo que hago", "Lo que compruebo"];
const FILAS_CHECK = PASOS.map((p, i) => ["☐", `${i + 1}. ${p.que}${p.distinto !== "—" ? " (ver «Si algo sale distinto»)" : ""}`, p.ok]);
const FALTA_TXT = PENDIENTE.replace(/^\[FALTA: /, "").replace(/\]$/, "");
const NOTA_CHECK =
  `Antes de empezar: ${ANTES_DE_EMPEZAR} Si algo sale distinto: ` +
  PASOS.map((p, i) => (p.distinto !== "—" ? `paso ${i + 1}, ${p.distinto.charAt(0).toLowerCase()}${p.distinto.slice(1)}` : "")).filter(Boolean).join("; ") +
  `. Terminé cuando: ${TERMINADO}. FALTA: ${FALTA_TXT}.`;

/* rúbrica */
const CRITERIOS = [
  { id: "origen", label: "Todo sale de tus respuestas", detail: "No agrega pasos, herramientas, plazos ni cifras que no dijiste." },
  { id: "pasos", label: "Un paso, una acción", detail: "Cada paso empieza con un verbo, hace una sola cosa y respeta tu orden." },
  { id: "verificable", label: "Cada paso dice cómo saber que salió bien", detail: "La señal es la que diste tú y se puede ver o comprobar." },
  { id: "excepciones", label: "Lo que sale distinto dice qué hacer", detail: "Cada excepción dice qué hacer, con su condición y su plazo." },
  { id: "novato", label: "Lo entiende quien nunca lo hizo", detail: "Sin abreviaturas ni «como siempre»; dice dónde está cada cosa y cuándo." },
  { id: "pendientes", label: "Lo que no sabes queda marcado", detail: "Los huecos aparecen como [FALTA] y no se rellenan." },
] as const;
const RESULTADOS = [
  { min: 0, label: "No usar todavía", advice: "Fallan varios criterios: corrige con el prompt de ajuste o vuelve a la entrevista." },
  { min: 7, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado antes de dárselo a nadie." },
  { min: 11, label: "Lista para probar", advice: "Cumple casi todo: dásela a otra persona para probarla." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { origen: 2, pasos: 2, verificable: 1, excepciones: 1, novato: 1, pendientes: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "documentar-procesos-con-ia",
    category: "negocio",
    title: "Documentar procesos de tu negocio con IA",
    description: "Deja por escrito cómo se hacen tus tareas repetitivas (por ejemplo, registrar un pedido) haciendo que la IA te entreviste, y pruébalo con otra persona.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["automatizacion-flujo", "comunicacion-atencion"],
    estandarGuia: 3,
    activoOriginal:
      "Ficha del proceso, entrevista guiada, procedimiento en formato fijo, versión para quien empieza y registro de la prueba (copiables), y rúbrica de seis criterios con dos bloqueos",
    problem: "Hay tareas que solo tú sabes hacer y no están escritas en ningún sitio, lo que te impide delegarlas o retomarlas.",
    whyThisPage:
      "Propone un método distinto a pedirle un procedimiento a la IA: la IA entrevista al dueño para extraer el proceso real y luego se prueba con una persona.",
    relatedGuides: ["organizar-tareas-del-negocio-con-ia", "responder-consultas-de-clientes-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Haz el proceso una vez con notas, deja que la IA te entreviste, convierte tus respuestas en un procedimiento y pruébalo con alguien que no lo conozca.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Unas dos horas para el primer proceso, más el rato de la prueba con otra persona",
    needs: ["Un asistente de IA de chat", "Un documento donde guardar el procedimiento", "Un proceso que se repita y que puedas hacer una vez con notas", "Una persona que no lo conozca y quiera probarlo"],
    result: "Un procedimiento paso a paso, una versión para quien empieza y una prueba hecha con otra persona",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el camino: unas notas cortas, una entrevista y un procedimiento probado por otra persona.",
      description:
        "Tres bloques de izquierda a derecha: unas notas de siete líneas, una conversación de preguntas y respuestas y una lista de pasos con casillas, con una segunda persona marcándolas. Datos ficticios de una tienda inventada. Sin logos ni nombres reales.",
      alt: "Notas breves, una entrevista y una lista de pasos que otra persona va marcando.",
      caption: "De unas notas a un procedimiento que otra persona puede seguir.",
    }),
    recorrido: slot("notas-del-recorrido.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Muestra las notas de un recorrido real: cortas, desordenadas y con pasos que faltan.",
      description:
        "Las siete líneas de notas escritas a mano o en un bloc, junto a la pantalla del panel de la tienda en pequeño. Resaltar que algunas acciones, como revisar la dirección, no están anotadas. Caso ficticio, sin datos de clientes.",
      alt: "Siete líneas de notas de un recorrido, junto a una pantalla de pedidos.",
      caption: "Las notas del recorrido: lo que se ve y lo que falta.",
      zoom: true,
    }),
    primerResultado: slot("primer-procedimiento.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver el primer procedimiento y localizar las tres celdas que hay que revisar.",
      description:
        "La tabla de 12 pasos con tres celdas resaltadas: la excepción del paso 4, la señal del paso 7 y la excepción del paso 10. Al lado, el apartado «FALTA». Caso ficticio.",
      alt: "Tabla de doce pasos con tres celdas resaltadas para revisar.",
      caption: "El primer procedimiento, con tres cosas que revisar.",
      zoom: true,
    }),
    contraste: slot("contraste-con-tus-respuestas.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar cada paso con lo que dijiste en la entrevista.",
      description:
        "Las respuestas de la entrevista a la izquierda y la tabla a la derecha, con líneas que unen cada paso con su respuesta; en rojo, los tres pasos que dicen menos que la respuesta. Debajo, la rúbrica puntuada (9 de 12). Caso ficticio.",
      alt: "Respuestas de la entrevista conectadas con cada paso del procedimiento y la rúbrica puntuada.",
      caption: "Cada paso, contra lo que dijiste.",
      zoom: true,
    }),
    checklist: slot("version-para-quien-empieza.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Muestra la versión corta con casillas que se le entrega a quien va a probar el procedimiento.",
      description:
        "Una hoja con «Antes de empezar», doce casillas con su comprobación y, debajo, «Terminé cuando». Una mano marca dos casillas. Caso ficticio.",
      alt: "Hoja con casillas para marcar doce pasos y una comprobación en cada uno.",
      caption: "La versión para quien empieza.",
      zoom: true,
    }),
    registro: slot("registro-de-la-prueba.webp", {
      section: "medicion",
      ratio: "16/9",
      purpose: "Muestra el registro de la prueba vacío junto a la persona que observa.",
      description:
        "La tabla del registro con una fila por paso y las columnas «¿Lo hizo sin ayuda?», «¿Dónde dudó o se equivocó?» y «Cambio que hago», sin rellenar. A un lado, una libreta y un reloj. Caso ficticio.",
      alt: "Tabla vacía para anotar dónde se traba una persona que prueba un procedimiento.",
      caption: "El registro, antes de la prueba.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "entrevista",
      ratio: "16/9",
      promptId: "entrevista",
      purpose: "Prueba real del prompt de entrevista: las preguntas de la IA y el resumen final.",
      description:
        "Captura de un intercambio de preguntas y respuestas y de la tabla «Resumen de mis respuestas» con su columna «Estado». Usa las notas del caso (o las tuyas, sin datos de clientes ni contraseñas). Comprueba que hace una sola pregunta cada vez. Ocultar datos personales y de cuenta.",
      alt: "Captura de una entrevista de un asistente sobre cómo se hace una tarea y su resumen.",
      caption: "Prueba del prompt de entrevista.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "procedimiento",
      purpose: "Prueba real del prompt de procedimiento: la tabla de pasos y «FALTA».",
      description:
        "Captura de la tabla de pasos y de los apartados «Antes de empezar», «Cuándo está terminado» y «FALTA». Usa el resumen de la entrevista del caso. Comprueba aparte que no agregó ningún paso ni herramienta. Ocultar datos personales y de cuenta.",
      alt: "Captura de un procedimiento paso a paso devuelto por un asistente.",
      caption: "Prueba del prompt de procedimiento.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de un procedimiento con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "checklist",
      purpose: "Prueba real del prompt de versión para quien empieza: la lista con casillas y sus apartados.",
      description:
        "Captura de «Antes de empezar», la lista de pasos con casillas, «Si algo sale distinto» y «Terminé cuando». Usa el procedimiento corregido del caso. Comprueba aparte que tiene los mismos pasos y en el mismo orden. Ocultar datos personales y de cuenta.",
      alt: "Captura de una lista de pasos con casillas para quien empieza, devuelta por un asistente.",
      caption: "Prueba del prompt de versión para quien empieza.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "En casi todos los negocios pequeños hay tareas que solo sabe hacer una persona: registrar un pedido, cerrar la caja, preparar un envío. Se hacen bien porque se hacen a diario, y por eso no están escritas. Cuando esa persona falta o quiere delegar, todo se detiene o se hace mal.\n\nEscribirlas casi nunca es fácil. Al recordar se olvidan los pasos que se hacen sin pensar, y quien lee después no sabe qué hacer cuando algo sale distinto. La IA parece la solución, pero si le pides «el procedimiento para registrar un pedido» puede inventar herramientas que no usas y pasos que nadie hace, porque no sabe cómo trabajas.\n\n**La IA le da forma a lo que sabes; solo una prueba con otra persona demuestra que el procedimiento sirve.**",
    symptoms: [
      "Solo tú sabes cómo se hace, y nadie más puede sin llamarte.",
      "Cuando delegas, te llegan preguntas que respondes de memoria.",
      "Escribiste un manual y nadie lo usa: no coincide con lo que se hace.",
      "Pediste a una IA un procedimiento y no sabes qué parte es real.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con un procedimiento que refleja lo que haces y que una persona que no lo conocía pudo seguir.",
    deliverables: [
      { label: "Una ficha del proceso", detail: "Cuándo empieza, quién lo hace, qué se necesita y cuándo termina." },
      { label: "Un procedimiento paso a paso", detail: "Con dónde, cómo saber que salió bien y qué hacer si algo sale distinto." },
      { label: "Una versión para quien empieza", detail: "Corta, con casillas." },
      { label: "Una prueba hecha con otra persona", detail: "Con un registro de dónde se trabó y qué cambiaste." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes una tarea que se repite y que solo tú sabes hacer.",
      "Quieres delegarla o poder retomarla después de una pausa.",
      "Puedes hacerla una vez con notas y pedirle a otra persona que la pruebe.",
    ],
    notForWho: [
      "Buscas manuales certificados de calidad, seguridad o salud: esos requieren a quien corresponda.",
      "Tu tarea cambia cada vez y no tiene un camino repetible.",
      "Esperas que la IA descubra cómo trabajas sin que se lo cuentes.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: NEGOCIO,
    situation:
      "Lucía atiende sola todos los pedidos de su tienda. El lunes empieza Mateo, un ayudante a tiempo parcial, y ella no podrá estar a su lado. Nada está escrito. Todo es inventado.",
    goal: "Dejar por escrito cómo registrar y enviar un pedido para que Mateo lo haga sin preguntarle.",
    data: [
      { label: "Proceso", value: "Registrar un pedido, desde el aviso hasta que sale el paquete" },
      { label: "Lo que existe", value: `Siete líneas de notas de un recorrido real` },
      { label: "Quién lo hará", value: "Mateo, que nunca lo hizo" },
    ],
    problem: "Lucía hace el proceso sin pensar: sus notas tienen siete líneas y el proceso real, más.",
    application: "Hace el recorrido con notas, se deja entrevistar por la IA, ordena sus respuestas y se lo da a Mateo para probarlo.",
    result: `Un procedimiento de ${N_PASOS} pasos con ${N_EXC} casos distintos y una versión corta para Mateo; la prueba aún no se hizo.`,
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan el camino de una tarea que vive en tu cabeza a un procedimiento que otra persona puede seguir.",
    blocks: [
      {
        title: "Lo que haces no es lo que crees que haces",
        detail: "Al recordar se saltan los pasos que haces sin pensar. Por eso el proceso se hace una vez, con notas, antes de contarlo.",
      },
      {
        title: "Un procedimiento responde cinco preguntas",
        detail: "Cuándo empieza, quién lo hace, qué hace falta, cuáles son los pasos y cuándo está terminado. Si falta una, hay que adivinar.",
      },
      {
        title: "Lo raro también se escribe",
        detail: "Un pago pendiente o un dato que falta es donde más se traba quien empieza. Se escriben como «si pasa esto, haz esto».",
        example: "«Si el pago dice Pendiente, no preparar nada» evita que Mateo empaque algo que nadie pagó.",
      },
      {
        title: "Sirve cuando otra persona lo logra",
        detail: "Un procedimiento que solo entiende quien lo escribió no está terminado: se prueba con alguien que no sabe hacerlo.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Escríbeme el procedimiento para registrar un pedido en mi tienda online.",
    whyInsufficient:
      "La IA no sabe qué herramientas usas ni cómo trabajas, y responde igual: un procedimiento genérico, con pasos que nadie hace en tu negocio.",
    issues: [
      "Inventa herramientas y plazos que no existen en tu negocio.",
      "No pregunta nada: no sabe lo que haces sin pensar.",
      "No dice qué hacer cuando algo sale distinto.",
      "Nadie lo probó: parece completo y no se sabe si sirve.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Antes de abrir la IA, reúne tres cosas.",
    items: [
      { label: "Un proceso, solo uno", detail: "Uno que se repita, que solo tú sepas y que quieras delegar. Empieza por uno pequeño.", required: true },
      { label: "Notas de un recorrido real", detail: "Haz el proceso una vez, de verdad, y anota cada cosa que haces, incluso lo obvio. No corrijas ni ordenes.", required: true },
      { label: "Una persona que lo pruebe", detail: "Alguien que no conozca el proceso y pueda dedicarle un rato.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribe la IA y lo que pasa en tu negocio",
      purpose: "Ver cómo un pedido sin entrevista produce pasos que nadie hace.",
      columns: ["Frase de la IA", "Lo que pasa en tu negocio"],
      rows: [
        ["«Registra el pedido en tu sistema de gestión de clientes.»", "No hay tal sistema: los pedidos van en una hoja."],
        ["«Envía la confirmación con la plantilla de correo.»", "Tu proceso no tiene ese correo: termina al cambiar el estado a «Enviado»."],
        ["«Verifica el inventario en el almacén.»", "Tu stock está en una hoja de stock."],
        ["«Prepara el paquete dentro de las 24 horas.»", "Nadie dijo ese plazo: el mensajero pasa los martes y los jueves."],
      ],
      note: "Ejemplo ilustrativo.",
    },
    ficha: {
      caption: "Ficha del proceso",
      purpose: "Definir el proceso en siete campos antes de contarlo.",
      columns: ["Campo", "Qué escribir", "Caso del ejemplo"],
      rows: [
        ["Nombre", "Lo que se hace, con un verbo", PROCESO],
        ["Empieza cuando", "El aviso o el día que lo dispara", RESPUESTAS[0][1].replace(/\.$/, "").replace(/^Cuando /, "")],
        ["Lo hace", "Quién y con qué frecuencia", "Lucía, cada vez que llega un pedido"],
        ["Se necesita", "Accesos, materiales y herramientas (sin contraseñas)", "Panel de la tienda, hojas de stock y de pedidos, cajas"],
        ["Termina cuando", "La señal de que está hecho", TERMINADO],
        ["Lo probará", "Una persona que no lo conozca", "Mateo"],
      ],
      copyable: true,
      note: "Caso ficticio. Sin contraseñas ni datos de clientes.",
    },
    recorrido: {
      caption: "Notas del recorrido de Lucía, tal como las anotó",
      purpose: "Ver cuánto se olvida al contar un proceso de memoria.",
      columns: ["N.º", "Lo que anoté"],
      rows: NOTAS.map((n, i) => [String(i + 1), n]),
      note: `Siete líneas. El proceso real, según su entrevista, tiene ${N_PASOS} pasos.`,
    },
    respuestas: {
      caption: "Resumen de las respuestas de Lucía",
      purpose: "Ver lo que devuelve la entrevista: solo lo que ella dijo, con lo pendiente a la vista.",
      columns: ["Bloque", "Lo que dije", "Estado"],
      rows: RESPUESTAS.map((r) => [...r]),
      note: "Ejemplo generado con el prompt de entrevista.",
    },
    checklist: {
      caption: "Versión para quien empieza",
      purpose: "Ver la hoja corta con casillas que se entrega a quien va a probar el procedimiento.",
      columns: COL_CHECK,
      rows: FILAS_CHECK,
      copyable: true,
      note: `Ejemplo generado con el prompt de versión para quien empieza. ${NOTA_CHECK}`,
    },
    prueba: {
      caption: "Registro de la prueba con otra persona",
      purpose: "Anotar, paso a paso, dónde se trabó quien lo probó y qué cambias.",
      columns: ["Paso", "¿Lo hizo sin ayuda?", "¿Dónde dudó o se equivocó?", "Cambio que hago"],
      rows: PASOS.map((_, i) => [String(i + 1), "—", "—", "—"]),
      copyable: true,
      note: "Plantilla sin rellenar: la prueba del caso no se ha realizado, así que no hay resultados.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cuatro de los siete pasos llevan un prompt. Los otros tres los haces tú.",
    steps: [
      { title: "Elige un proceso y recórrelo", description: "Rellena su ficha, hazlo una vez de verdad y anota cada cosa que haces.", output: "Una ficha y unas notas." },
      { title: "Deja que la IA te entreviste", description: "Entrégale tus notas y contesta sus preguntas, de una en una, sin corregirte.", output: "Un resumen de tus respuestas." },
      { title: "Pide el procedimiento", description: "Con tu resumen, pide los pasos en un formato fijo, con dónde, cómo saber que salió bien y qué hacer si sale distinto.", output: "Un procedimiento en tabla." },
      { title: "Contrasta y corrige", description: "Compara cada paso con lo que dijiste, puntúa con la rúbrica y pide cambiar solo lo señalado.", output: "Un procedimiento corregido." },
      { title: "Pide la versión para quien empieza", description: "Convierte el procedimiento en una lista corta con casillas y comprobaciones.", output: "Una hoja para quien lo va a probar." },
      { title: "Pruébalo con otra persona", description: "Entrégale solo la versión corta y observa sin ayudar; anota dónde duda o se equivoca.", output: "Un registro de la prueba." },
      { title: "Corrige, fecha y publica", description: "Cambia el procedimiento donde se trabó quien lo probó, anota la fecha y déjalo donde todos lo vean.", output: "Un procedimiento probado." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    entrevista: {
      title: "Prompt de entrevista: que la IA te pregunte cómo lo haces",
      objective: "Sacar lo que haces sin pensar, con preguntas de una en una, y devolverlo como un resumen de tus respuestas.",
      whenToUse: "Después de hacer el recorrido con notas, antes de escribir ningún procedimiento.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: NEGOCIO },
        { name: "PROCESO", description: "El proceso que documentas, con dónde empieza y dónde termina.", example: PROCESO },
        { name: "MIS_NOTAS", description: "Las notas de tu recorrido, sin ordenar.", example: NOTAS.slice(0, 3).join(" ") + " …" },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a dejar por escrito un proceso. Tu destinatario es la persona dueña, que hace el proceso sin pensar y no lo tiene escrito. Tu objetivo es reunir SOLO lo que yo te diga, para que otra persona pueda seguirlo, sin inventar nada.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
El proceso: {{PROCESO}}

### DATOS (única fuente)
Mis notas de un recorrido real, sin ordenar:
{{MIS_NOTAS}}

### QUÉ NECESITO SABER
Cuándo empieza, quién lo hace, qué se necesita, cómo lo hago paso a paso, qué pasa cuando algo sale distinto, cuándo está terminado y lo que no sé.

### REGLAS
1. Pregúntame de a UNA cosa y espera mi respuesta. Máximo 15 preguntas; no repitas lo que ya está en mis notas.
2. Empieza por mis notas: pregúntame qué hago entre una línea y la siguiente, porque ahí suelen faltar pasos.
3. Para cada paso que me cueste explicar, pregúntame cómo sé que salió bien.
4. Para cada decisión, pregúntame qué hago si sale distinto.
5. No propongas pasos, herramientas ni plazos que yo no mencione, ni me digas cómo se hace «normalmente» en otros negocios.
6. No me pidas contraseñas ni datos personales de clientes.
7. Si dos respuestas se contradicen, cita las dos frases y pídeme que elija. Si no sé algo, márcalo «Pendiente» y sigue.
8. Separa lo que yo dije de lo que tú supones, y no presentes una suposición como si fuera mi respuesta.

### FORMATO DE SALIDA
Al terminar (o al llegar a 15 preguntas), una tabla de columnas fijas: Bloque | Lo que dije | Estado. El estado es «Confirmado» o «Pendiente». Después, «Pendiente»: lo que no sé. La tabla fija la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Verifica que: cada pregunta es una sola; ningún paso, herramienta ni plazo apareció sin que yo lo dijera; cada «Confirmado» corresponde a algo que dije; toda suposición está marcada; no pediste contraseñas ni datos de clientes. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable RESPUESTAS.`,
      explanation: [
        { part: "pregúntame qué hago entre una línea y la siguiente, porque ahí suelen faltar pasos.", why: "Lo que se hace sin pensar no aparece en las notas; una pregunta entre dos líneas lo saca." },
        { part: "No propongas pasos, herramientas ni plazos que yo no mencione", why: "Evita que se llene de cosas que nadie hace en tu negocio." },
        { part: "Si no sé algo, márcalo «Pendiente» y sigue.", why: "Un hueco a la vista se puede completar; uno inventado se descubre cuando alguien se traba." },
      ],
      evaluate: "Comprueba que cada «Confirmado» es algo que dijiste tú y que hizo las preguntas de a una.",
      improve: "Si propone un paso que no dijiste, contéstale que no lo haces y pídele que lo saque del resumen.",
      conversation: [
        { who: "ia", text: "Primera pregunta: según tus notas, el proceso empieza con un correo «Nuevo pedido». ¿Es lo único que te avisa, o miras algún otro lugar?" },
        { who: "tu", text: "Solo el correo." },
        { who: "ia", text: "Anotado. Entre «miro que esté pagado» y «reviso el stock», ¿hay algún caso en que el pago no diga «Pagado»? ¿Qué haces entonces?" },
      ],
    },

    procedimiento: {
      title: "Prompt de procedimiento: de tus respuestas a pasos que otra persona pueda seguir",
      objective: "Obtener un procedimiento en tabla: un paso por acción, dónde, cómo saber que salió bien y qué hacer si sale distinto.",
      whenToUse: "Cuando tienes el resumen de la entrevista, con lo pendiente marcado.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio, en una frase.", example: NEGOCIO },
        { name: "PROCESO", description: "El proceso que documentas.", example: PROCESO },
        { name: "RESPUESTAS", description: "La tabla completa de la entrevista, pegada.", example: `${RESPUESTAS[0][0]} | ${RESPUESTAS[0][1]} | ${RESPUESTAS[0][2]}\n…` },
      ],
      prompt: `Actúa como redactor de procedimientos para un negocio pequeño. Tu destinatario es una persona que nunca hizo la tarea y la hará sin poder preguntar. Tu objetivo es ordenar lo que yo dije en un procedimiento claro, sin agregar nada mío.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
El proceso: {{PROCESO}}

### DATOS (única fuente)
Mis respuestas de la entrevista, con su estado:
{{RESPUESTAS}}

### REGLAS
1. Usa solo lo que dije. No agregues pasos, herramientas, plazos ni cifras.
2. Un paso, una acción: cada paso empieza con un verbo y tiene un solo objeto. Respeta mi orden.
3. En «Dónde» pon el lugar o la herramienta tal como la nombré.
4. En «Cómo sé que salió bien» pon una señal que yo di, con mis palabras. Si no la di, escribe [FALTA: señal].
5. En «Si algo sale distinto» pon lo que dije que hago en ese caso. Si no dije nada, escribe «—».
6. Escribe para alguien que nunca hizo la tarea: sin abreviaturas ni «como siempre». Lo que se necesita antes va en «Antes de empezar».
7. Lo que marqué «Pendiente» pasa a «FALTA» y no lo resuelves tú.
8. No recomiendes mejoras y no cambies el orden.

### FORMATO DE SALIDA
En este orden: (1) «Antes de empezar»: lo que se necesita; (2) una tabla de columnas fijas: ${COL_PROC.join(" | ")}; (3) «Cuándo está terminado»; (4) «FALTA». La tabla fija la forma; el contenido sale de mis respuestas.

### ANTES DE RESPONDER
Verifica que: cada paso, herramienta y plazo salió de mis respuestas; cada paso tiene una sola acción; el orden es el mío; cada señal es una que yo di; cada «Pendiente» pasó a «FALTA». Corrige lo que no cumpla.`,
      explanation: [
        { part: "Usa solo lo que dije. No agregues pasos, herramientas, plazos ni cifras.", why: "Separa un procedimiento tuyo de uno genérico." },
        { part: "Un paso, una acción: cada paso empieza con un verbo y tiene un solo objeto.", why: "Un paso con dos acciones se olvida a medias; con una, se marca." },
        { part: "Escribe para alguien que nunca hizo la tarea: sin abreviaturas ni «como siempre».", why: "Quien empieza no comparte tus costumbres: lo evidente para ti no existe para él." },
        { part: "Lo que marqué «Pendiente» pasa a «FALTA» y no lo resuelves tú.", why: "Un vacío a la vista lo completas tú, que eres quien lo sabe." },
      ],
      evaluate: "Compara cada paso con tu respuesta: nada nuevo, mismo orden y una señal tuya en cada paso.",
      improve: "Si un paso mezcla dos acciones o trae algo que no dijiste, pide repetir solo ese paso.",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las celdas señaladas, apoyándose en lo que dijiste, y dejar el resto intacto.",
      whenToUse: "Después de contrastar (o de la prueba con otra persona), cuando el procedimiento tiene un problema.",
      variables: [
        { name: "PROBLEMAS_DETECTADOS", description: "Lo que hay que corregir y por qué.", example: PROBLEMAS_TXT },
        { name: "NO_TOCAR", description: "Lo que no puede cambiar.", example: "Los demás pasos y su orden" },
      ],
      prompt: `Actúa como editor de procedimientos para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, usando lo que dije en la entrevista, y dejar intacto lo demás.

### CONTEXTO
Usa el resumen de mi entrevista y el procedimiento de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Problemas que detecté:
{{PROBLEMAS_DETECTADOS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo lo señalado y lo que ese cambio obligue a ajustar. Si obliga a cambiar otro paso, inclúyelo en «Cambios».
2. Cada cambio se apoya en lo que dije en la entrevista, o en lo que te cuento en los problemas. No agregues pasos, herramientas, plazos ni cifras.
3. Si lo que señalé no existe en el procedimiento, o no está en mis respuestas, dímelo antes de cambiar nada.
4. En «Motivo» cita lo que dije o el problema que señalé.
5. No recomiendes mejoras. Si falta un dato, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla de columnas fijas: Antes | Después | Motivo; (2) «Sin cambios»: lo que no toqué; (3) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada cambio cita lo que dije o el problema; lo que no se puede tocar está idéntico; no hay pasos, herramientas ni plazos nuevos. Corrige lo que no cumpla.`,
      explanation: [
        { part: "Cambia solo lo señalado", why: "Evita que rehaga los pasos que ya estaban bien y cambie algo sin que lo notes." },
        { part: "En «Motivo» cita lo que dije o el problema que señalé.", why: "Cada corrección queda con su respaldo y puedes comprobarla." },
        { part: "Si lo que señalé no existe en el procedimiento, o no está en mis respuestas, dímelo antes de cambiar nada.", why: "Evita corregir a ciegas algo que tú pudiste señalar mal." },
      ],
      evaluate: "Compara con el procedimiento anterior: solo deben cambiar las celdas señaladas.",
      improve: "Si toca un paso que no señalaste, pide repetir solo lo señalado.",
    },

    checklist: {
      title: "Prompt de versión para quien empieza: una lista corta con casillas",
      objective: "Convertir el procedimiento en una hoja corta con casillas que otra persona pueda seguir sola.",
      whenToUse: "Cuando el procedimiento está corregido y vas a dárselo a alguien para probarlo.",
      variables: [
        { name: "PROCEDIMIENTO", description: "La tabla del procedimiento corregido, pegada.", example: `${PASOS[0].que} | ${PASOS[0].donde} | …` },
        { name: "PARA_QUIEN", description: "Quién lo va a usar y qué sabe del negocio.", example: "Mateo, que empieza el lunes y nunca hizo el proceso" },
      ],
      prompt: `Actúa como redactor de instrucciones para una persona que empieza en un negocio pequeño. Tu destinatario es {{PARA_QUIEN}}, que seguirá la hoja sin poder preguntar. Tu objetivo es convertir mi procedimiento en una hoja corta con casillas, sin cambiar su contenido.

### CONTEXTO
Quien la usará: {{PARA_QUIEN}}

### DATOS (única fuente)
Mi procedimiento corregido, con su «Antes de empezar», su «Cuándo está terminado» y sus «FALTA»:
{{PROCEDIMIENTO}}

### REGLAS
1. No agregues ni quites pasos: la hoja tiene los mismos pasos, en el mismo orden y con la misma numeración.
2. Cada línea empieza con un verbo y cabe en una frase. Conserva la señal de «Cómo sé que salió bien» en la columna «Lo que compruebo».
3. Si un paso tiene algo en «Si algo sale distinto», marca esa línea con «(ver «Si algo sale distinto»)» y copia el texto abajo, sin cambiarlo.
4. Escribe sin jerga para alguien que no conoce el negocio, sin cambiar lo que dice el procedimiento.
5. Copia «Antes de empezar» y «Cuándo está terminado» tal como están. Lo que estaba en «FALTA» sigue en «FALTA».
6. No prometas que quien la use lo hará bien y no añadas consejos.

### FORMATO DE SALIDA
En este orden: (1) «Antes de empezar»; (2) una tabla de columnas fijas: ${COL_CHECK.join(" | ")}; (3) «Si algo sale distinto»; (4) «Terminé cuando»; (5) «FALTA». La tabla fija la forma; el contenido sale de mi procedimiento.

### ANTES DE RESPONDER
Verifica que: hay los mismos pasos y en el mismo orden; cada línea empieza con un verbo; cada señal es la del procedimiento; cada texto de «Si algo sale distinto» es una copia; no agregaste consejos ni promesas. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo entregar esta hoja a la persona que va a probar el procedimiento, sin explicarle nada más.`,
      explanation: [
        { part: "No agregues ni quites pasos: la hoja tiene los mismos pasos, en el mismo orden y con la misma numeración.", why: "Si cambia un paso, la prueba comprueba otro procedimiento." },
        { part: "Cada línea empieza con un verbo y cabe en una frase.", why: "Una casilla se marca con la acción hecha; una frase larga, a medias." },
        { part: "copia el texto abajo, sin cambiarlo.", why: "Lo que se hace cuando algo sale distinto no se resume: se copia." },
      ],
      evaluate: "Cuenta los pasos y compara el orden con tu procedimiento: deben ser los mismos.",
      improve: "Si resumió una excepción, pídele que copie el texto original en «Si algo sale distinto».",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de procedimiento al resumen de la entrevista. La tuya será distinta.",
    parts: [
      { type: "text", text: `**Antes de empezar:** ${ANTES_DE_EMPEZAR}` },
      {
        type: "table",
        table: {
          caption: "Primer procedimiento, tal como llega",
          purpose: "Tener el procedimiento en el formato del prompt para contrastarlo con la entrevista.",
          columns: COL_PROC,
          rows: PRIMERA.map(fila),
        },
      },
      { type: "text", text: `**Cuándo está terminado:** ${cap(TERMINADO)}. **FALTA:** ${FALTA_TXT}.` },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "procedimiento",
    title: "Puntúa un procedimiento antes de probarlo",
    intro:
      `Puntúa el procedimiento en los seis criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[5].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `El procedimiento parece completo: ${N_PASOS} pasos, cada uno con su lugar y su señal. Se contrasta con tus respuestas y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      { criterionId: "origen", verdict: vered("origen"), comment: "Cada paso, lugar y plazo está en tu entrevista; no aparece ningún sistema que no uses." },
      { criterionId: "pasos", verdict: vered("pasos"), comment: `Los ${N_PASOS} pasos empiezan con un verbo y hacen una sola cosa, en tu orden.` },
      { criterionId: "verificable", verdict: vered("verificable"), comment: `El paso ${P7 + 1} dice «${PRIMERA[P7].ok}»: tú diste una señal que se puede comprobar y no aparece.` },
      { criterionId: "excepciones", verdict: vered("excepciones"), comment: `El paso ${P4 + 1} dice «${PRIMERA[P4].distinto}», pero tú dijiste que no se envía hasta tener el dato.` },
      { criterionId: "novato", verdict: vered("novato"), comment: `El paso ${P10 + 1} no dice cuándo pasa el mensajero: quien empieza no puede saber cuándo esperar.` },
      { criterionId: "pendientes", verdict: vered("pendientes"), comment: "Lo que no sabías, qué hacer si el mensajero no pasa, quedó en «FALTA»." },
    ],
    conclusion: "Es una buena base: no inventa nada y conserva tu orden. Los tres fallos son de detalle, pero son justo los que hacen dudar a quien empieza.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir tres celdas, no pedir otro procedimiento.",
    promptId: "ajuste",
    why: "El contraste señaló tres cosas. El prompt limita el cambio a lo señalado, exige citar lo que dijiste y separa lo cambiado de lo que sigue igual.",
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
      { type: "text", text: `**Sin cambios:** los otros ${N_PASOS - CAMBIOS.length} pasos y su orden. **FALTA:** ${FALTA_TXT}, que solo Lucía puede responder.` },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Contar el proceso de memoria",
      whyItHurts: "Al recordar se saltan los pasos que haces sin pensar, y esos son los que a quien empieza le faltan.",
      instead: "Haz el proceso una vez con notas antes de contarlo.",
    },
    {
      title: "Pedirle el procedimiento a la IA sin entrevista",
      whyItHurts: "Devuelve algo con buena pinta hecho de herramientas y plazos que no son los tuyos.",
      instead: "Que te entreviste primero y redacte solo con tus respuestas.",
    },
    {
      title: "Escribir para ti",
      whyItHurts: "Las abreviaturas y los «como siempre» solo los entiende quien ya sabe hacerlo.",
      instead: "Escribe para alguien que nunca hizo la tarea y no puede preguntar.",
    },
    {
      title: "Probarlo con quien ya sabe",
      whyItHurts: "Quien ya conoce el proceso rellena los huecos sin darse cuenta y la prueba no encuentra nada.",
      instead: "Pídele la prueba a alguien que no conozca la tarea.",
    },
    {
      title: "Ayudar durante la prueba",
      whyItHurts: "Cada ayuda tapa un hueco del procedimiento, que seguirá ahí cuando no estés.",
      instead: "Anota la pregunta que te hace y no la respondas; la respuesta va al procedimiento.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de dar el procedimiento por bueno, marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Hice el proceso una vez, de verdad, con notas, antes de contarlo." },
      { label: "Cada paso del procedimiento lo dije yo en la entrevista; la IA no agregó ninguno." },
      { label: "Cada paso tiene una sola acción y una señal de que salió bien." },
      { label: "Lo que la IA marcó como «FALTA» lo completé yo o sigue marcado." },
      { label: "No pegué contraseñas ni datos personales de clientes en la conversación." },
      { label: "Una persona que no conocía el proceso lo hizo sin mi ayuda." },
      { label: "Cambié el procedimiento donde esa persona se trabó y anoté la fecha de la versión." },
    ],
    principle: "La IA ordena lo que sabes, pero quien dice si sirve es alguien que no lo conocía: sin esa prueba, el procedimiento sigue siendo un borrador.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con el primer proceso probado, toca mantenerlo vivo y repetir el método.",
    steps: [
      { title: "Guarda una sola versión a la vista", detail: "En un lugar conocido, con su fecha y el nombre de quien la probó." },
      { title: "Revisa cuando algo cambie", detail: "Una herramienta, un plazo o una persona nuevos piden repasarlo." },
      { title: "Pide a quien lo usa que anote lo que falta", detail: "Cada duda suya es un paso o una excepción sin escribir." },
      { title: "Pasa al siguiente proceso", detail: "Usa la misma ficha y el mismo método; el segundo lleva menos tiempo que el primero." },
      { title: "Lleva la cuenta de lo documentado", detail: "Una lista de procesos con su fecha de revisión evita que envejezcan." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método deja por escrito lo que haces, con límites claros.",
    items: [
      { title: "El procedimiento es tan bueno como tu recorrido", detail: "Si haces el proceso con prisa o de forma rara, escribirás ese camino." },
      { title: "Una prueba no cubre todos los casos", detail: "Con una persona y un pedido se ven los tropiezos frecuentes." },
      { title: "No reemplaza la formación", detail: "Si la tarea afecta la seguridad o la salud de alguien, requiere formación y normas que esta guía no cubre." },
      { title: "Describe pasos, no los ejecuta", detail: "Deja por escrito lo que hace una persona: no automatiza nada." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Un proceso que vive en tu cabeza se vuelve un procedimiento en cuatro movimientos: hacerlo con notas, contarlo en una entrevista, ordenarlo en pasos con su señal y su excepción, y probarlo con otra persona. La IA acelera los tres primeros; el cuarto lo hace alguien que no sabe.",
    takeaways: [
      "Haz el proceso con notas antes de contarlo: la memoria se salta lo automático.",
      "Escribe cada paso como una sola acción, con su señal y su excepción.",
      "Marca lo que no sabes; no dejes que se rellene.",
      "Pruébalo con alguien que no lo conozca y no le ayudes.",
    ],
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "procedimiento", "disparador", "excepcion", "rubrica", "dato-personal"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Qué proceso conviene documentar primero?",
      answer: "Uno que repitas seguido, que solo tú sepas y que quieras delegar. Uno pequeño.",
    },
    {
      question: "¿Puedo dictar el recorrido en lugar de escribirlo?",
      answer: "Sí, si te resulta más natural. Pásalo a texto y quita antes los nombres y los datos de clientes.",
    },
    {
      question: "¿Qué hago si no tengo a nadie que lo pruebe?",
      answer: "Pide el favor a alguien que no conozca la tarea, aunque no trabaje contigo. Probarlo tú sirve menos: rellenas los huecos sin darte cuenta.",
    },
    {
      question: "¿Puedo pegar contraseñas o capturas para que la IA entienda mejor?",
      answer: "No. Describe con palabras dónde está cada cosa; nunca pegues contraseñas ni datos personales de clientes.",
    },
  ],
});
