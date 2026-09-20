import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * ventas/crear-cotizaciones-y-propuestas-con-ia
 *
 * Tipo: números y datos + comunicación (`handlesNumbers`). Todo el caso (la carpintería Maderas Rivera, la
 * Sra. Paredes, sus precios, porcentajes, condiciones y fechas) es FICTICIO. Cada cifra se calcula en este
 * archivo a partir de las constantes y se verificó con código aparte (ver README.md). Las respuestas de la IA
 * son EJEMPLOS GENERADOS: están redactadas aplicando literalmente cada prompt a los datos del caso; no proceden
 * de una conversación real ni de una prueba del autor. El error del pedido ingenuo es ILUSTRATIVO (escrito a
 * propósito). Las pruebas reales viven en `evidence.pruebas`, que solo rellena el autor.
 * La guía no cubre impuestos, facturación ni garantías legales: la persona los confirma con un profesional.
 *
 * Fuente única de verdad: las partidas (ITEMS) y los porcentajes (DESC_PCT, IMP_PCT, ANT_PCT) definen todas las
 * cifras; las condiciones (COND), los criterios (CRITERIOS), los umbrales (RESULTADOS), los puntajes (PUNTAJES)
 * y las cuentas (CUENTAS) se definen UNA vez y los leen la hoja, las tablas, el documento de ejemplo, la rúbrica
 * y los prompts.
 */
const slot = guideSlots("ventas", "crear-cotizaciones-y-propuestas-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const ITEMS = [
  { concepto: "Módulo bajo de cocina (80 cm)", unidad: "u.", cant: 3, precio: 450, desc: true },
  { concepto: "Módulo alto de cocina (60 cm)", unidad: "u.", cant: 2, precio: 300, desc: true },
  { concepto: "Encimera de madera (2 m)", unidad: "u.", cant: 1, precio: 700, desc: false },
  { concepto: "Instalación", unidad: "h", cant: 12, precio: 25, desc: false },
] as const;
const DESC_PCT = 10;
const IMP_PCT = 20;
const ANT_PCT = 40;
const EMISION_DIA = 12;
const VIGENCIA_DIAS = 15;
const HASTA_DIA = EMISION_DIA + VIGENCIA_DIAS;

const importe = (i: (typeof ITEMS)[number]) => i.cant * i.precio;
const SUBTOTAL = ITEMS.reduce((n, i) => n + importe(i), 0);
const BASE_DESC = ITEMS.filter((i) => i.desc).reduce((n, i) => n + importe(i), 0);
const DESCUENTO = (BASE_DESC * DESC_PCT) / 100;
const BASE_IMP = SUBTOTAL - DESCUENTO;
const IMPUESTO = (BASE_IMP * IMP_PCT) / 100;
const TOTAL = BASE_IMP + IMPUESTO;
const ANTICIPO = Math.round((TOTAL * ANT_PCT) / 100);
const SALDO = TOTAL - ANTICIPO;

/* el pedido ingenuo: la IA aplica el descuento a todo el subtotal */
const DESC_INGENUO = (SUBTOTAL * DESC_PCT) / 100;
const BASE_IMP_INGENUO = SUBTOTAL - DESC_INGENUO;
const IMP_INGENUO = (BASE_IMP_INGENUO * IMP_PCT) / 100;
const TOTAL_INGENUO = BASE_IMP_INGENUO + IMP_INGENUO;
const DIFERENCIA = TOTAL - TOTAL_INGENUO;

/* números de práctica para comprobar las fórmulas de la hoja */
const P = { cant: 2, precio: 20, conDesc: 40, sinDesc: 60, descPct: 10, impPct: 25, total: 105, antPct: 50 };
const P_IMPORTE = P.cant * P.precio;
const P_SUBTOTAL = P.conDesc + P.sinDesc;
const P_DESC = (P.conDesc * P.descPct) / 100;
const P_BASE = P_SUBTOTAL - P_DESC;
const P_IMP = (P_BASE * P.impPct) / 100;
const P_TOTAL = P_BASE + P_IMP;
const P_ANT = Math.round((P.total * P.antPct) / 100);
const P_SALDO = P.total - P_ANT;

const CUENTAS = [
  "Importe de cada línea: cantidad × precio unitario.",
  "Subtotal: la suma de los importes de todas las líneas.",
  "Base del descuento: la suma de los importes de las líneas marcadas «Sí» en «¿Con descuento?».",
  "Descuento: base del descuento × porcentaje de descuento ÷ 100.",
  "Base del impuesto: subtotal − descuento.",
  "Impuesto: base del impuesto × tasa ÷ 100.",
  "Total: base del impuesto + impuesto.",
  "Anticipo: total × porcentaje de anticipo ÷ 100, redondeado a cero decimales.",
  "Saldo: total − anticipo.",
] as const;
const LISTA_CUENTAS = CUENTAS.map((c, i) => `${i + 1}. ${c}`).join("\n");

const FORMULAS: { celda: string; cuenta: number; es: string; en: string; prueba: string }[] = [
  { celda: "F2 (y hacia abajo hasta F5)", cuenta: 0, es: "=C2*D2", en: "=C2*D2", prueba: `Con ${P.cant} y ${P.precio}: ${P_IMPORTE}` },
  { celda: "F6", cuenta: 1, es: "=SUMA(F2:F5)", en: "=SUM(F2:F5)", prueba: `Con ${P.conDesc} y ${P.sinDesc}: ${P_SUBTOTAL}` },
  { celda: "F7", cuenta: 2, es: '=SUMAR.SI(E2:E5;"Sí";F2:F5)', en: '=SUMIF(E2:E5,"Sí",F2:F5)', prueba: `Con ${P.conDesc} en «Sí» y ${P.sinDesc} en «No»: ${P.conDesc}` },
  { celda: "F8", cuenta: 3, es: "=F7*E8/100", en: "=F7*E8/100", prueba: `Con ${P.conDesc} y ${P.descPct}: ${P_DESC}` },
  { celda: "F9", cuenta: 4, es: "=F6-F8", en: "=F6-F8", prueba: `Con ${P_SUBTOTAL} y ${P_DESC}: ${P_BASE}` },
  { celda: "F10", cuenta: 5, es: "=F9*E10/100", en: "=F9*E10/100", prueba: `Con ${P_BASE} y ${P.impPct}: ${P_IMP}` },
  { celda: "F11", cuenta: 6, es: "=F9+F10", en: "=F9+F10", prueba: `Con ${P_BASE} y ${P_IMP}: ${P_TOTAL}` },
  { celda: "F12", cuenta: 7, es: "=REDONDEAR(F11*E12/100;0)", en: "=ROUND(F11*E12/100,0)", prueba: `Con ${P.total} y ${P.antPct}: ${P_ANT}` },
  { celda: "F13", cuenta: 8, es: "=F11-F12", en: "=F11-F12", prueba: `Con ${P.total} y ${P_ANT}: ${P_SALDO}` },
];

const OK = "Confirmado";
const PEND = "Pendiente";
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const COND = [
  { nombre: "Qué incluye", pide: "Cada cosa que entra en el precio, por separado.", valor: "Fabricación e instalación de 3 módulos bajos, 2 módulos altos y una encimera de 2 m", estado: OK },
  { nombre: "Qué no incluye", pide: "Lo que el cliente podría dar por hecho y no está.", valor: "Pintura, retiro de muebles antiguos y conexiones de agua o gas", estado: OK },
  { nombre: "Forma de pago", pide: "Cuánto se paga, cuándo y cómo.", valor: `${ANT_PCT} % de anticipo al aceptar; el saldo, al terminar la instalación`, estado: OK },
  { nombre: "Plazo", pide: "Cuánto tarda el trabajo, solo si te comprometes.", valor: "—", estado: PEND },
  { nombre: "Vigencia", pide: "Hasta qué fecha vale el precio.", valor: `${VIGENCIA_DIAS} días desde la emisión: del ${EMISION_DIA} al ${HASTA_DIA} de marzo`, estado: OK },
  { nombre: "Garantía", pide: "Qué cubres y por cuánto tiempo, solo si ya lo decidiste.", valor: "—", estado: PEND },
  { nombre: "Cómo aceptar", pide: "Qué debe hacer el cliente para aceptar.", valor: "Responder este mensaje o escribir por WhatsApp; se confirma con el anticipo", estado: OK },
  { nombre: "Impuestos", pide: "Si el precio los incluye o se suman, y con qué tasa: la que te corresponda.", valor: `No incluidos: se suma el ${IMP_PCT} %`, estado: OK },
] as const;
const cond = (nombre: string) => COND.find((c) => c.nombre === nombre)!;
const LISTA_COND = COND.map((c, i) => `${i + 1}. ${c.nombre}: ${c.pide}`).join("\n");

/* el documento del ejemplo se compone con las cifras y las condiciones; el defecto y su corrección son frases sueltas */
const NEGOCIO = "Maderas Rivera";
const CLIENTE = "la Sra. Paredes";
const ENCABEZADO = `${NEGOCIO} · Cotización para ${CLIENTE} · Emitida el ${EMISION_DIA} de marzo · Válida hasta el ${HASTA_DIA} de marzo`;
const DETALLE = ITEMS.map((i) => [i.concepto, `${i.cant} ${i.unidad}`, String(i.precio), String(importe(i))]);
const TOTALES = `Subtotal: ${SUBTOTAL}. Descuento (${DESC_PCT} % sobre los módulos): ${DESCUENTO}. Base del impuesto: ${BASE_IMP}. Impuesto (${IMP_PCT} %): ${IMPUESTO}. Total: ${TOTAL}.`;
const BASE_ANT_OK = "sobre el total";
const BASE_ANT_ERR = "sobre el subtotal";
const PAGO = `Pago: anticipo del ${ANT_PCT} % ${BASE_ANT_OK} (${ANTICIPO}) al aceptar y saldo de ${SALDO} al terminar la instalación.`;
const CALIDAD = "Trabajamos solo con materiales de primera calidad.";
const condiciones = (pago: string, calidad?: string) =>
  [`Incluye: ${lc(cond("Qué incluye").valor)}.`, `No incluye: ${lc(cond("Qué no incluye").valor)}.`, pago, calidad, `Para aceptar: ${lc(cond("Cómo aceptar").valor)}.`]
    .filter(Boolean)
    .join(" ");
const CONDICIONES_PRIMERA = condiciones(PAGO.replace(BASE_ANT_OK, BASE_ANT_ERR), CALIDAD);
const FALTA = "[FALTA: plazo de entrega] · [FALTA: garantía]";

const PROBLEMAS = [
  {
    antes: `anticipo del ${ANT_PCT} % ${BASE_ANT_ERR}`,
    despues: `anticipo del ${ANT_PCT} % ${BASE_ANT_OK}`,
    motivo: `La hoja calcula el anticipo sobre el total con impuesto: ${ANTICIPO} de ${TOTAL}.`,
    dice: `${ANT_PCT} % del subtotal (${SUBTOTAL}) serían ${(SUBTOTAL * ANT_PCT) / 100}, no ${ANTICIPO}`,
  },
  { antes: CALIDAD, despues: "Se quita la frase.", motivo: "Ningún dato respalda esa calidad.", dice: "" },
];
const PROBLEMAS_TEXTO = `«${PROBLEMAS[0].antes}»: la hoja lo calcula sobre el total. «${CALIDAD}»: ningún dato lo respalda.`;

const CRITERIOS = [
  { id: "cifras", label: "Las cifras coinciden con la hoja", detail: "Cada importe, porcentaje y total es el de la hoja, y dice a qué base se aplica." },
  { id: "condiciones", label: "Solo condiciones confirmadas", detail: "No escribe ni insinúa condiciones pendientes: plazos, garantías o cláusulas." },
  { id: "incluye", label: "Dice qué incluye y qué no", detail: "Enumera lo incluido y lo no incluido, sin dejar nada por suponer." },
  { id: "aceptar", label: "Se puede aceptar sin preguntar", detail: "Dice cómo se paga, hasta cuándo vale y qué debe hacer el cliente para aceptar." },
  { id: "promesas", label: "Sin promesas que nadie respalda", detail: "Ningún adjetivo ni frase afirma calidad, plazos o resultados que los datos no contienen." },
] as const;

const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Fallan varios criterios: revisa la hoja y las condiciones antes de volver a pedir el documento." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado, empezando por las cifras." },
  { min: 9, label: "Lista para verificar", advice: "Cumple casi todo: pasa a tu verificación antes de enviarla." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (total: number) => [...RESULTADOS].reverse().find((r) => total >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { cifras: 1, condiciones: 2, incluye: 2, aceptar: 2, promesas: 1 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");
const LISTA_CRITERIOS = CRITERIOS.map((c, i) => `${i + 1}. ${c.label}: ${c.detail}`).join("\n");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "crear-cotizaciones-y-propuestas-con-ia",
    category: "ventas",
    title: "Crear cotizaciones y propuestas comerciales con IA",
    description:
      "Convierte producto, cantidad, precio y condiciones en una cotización o propuesta clara, y comprueba los totales en una hoja de cálculo antes de enviarla.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["numeros-datos", "comunicacion-atencion"],
    estandarGuia: 3,
    handlesNumbers: true,
    activoOriginal:
      "Calculadora de cotización para hoja de cálculo con fórmulas en español e inglés, tabla de condiciones con lo confirmado y lo pendiente (ambas copiables) y rúbrica de cinco criterios con dos reglas de bloqueo",
    problem: "Un cliente te pide precio y necesitas enviar una cotización o propuesta clara, completa y sin errores.",
    whyThisPage:
      "Separa lo que redacta la IA de lo que se calcula fuera de ella: los totales se verifican en hoja de cálculo y las condiciones las confirma el emprendedor; no es asesoría legal.",
    relatedGuides: ["responder-consultas-de-clientes-con-ia", "crear-descripciones-de-productos-con-ia", "crear-promociones-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Una cotización con un total mal sumado o una condición dudosa cuesta dinero o una discusión. Calcula en una hoja, decide tus condiciones y pide a la IA solo la redacción, con las cifras copiadas de la hoja.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de dos horas la primera vez; unos veinte minutos con la hoja ya armada",
    needs: ["Un asistente de IA de chat", "Una hoja de cálculo", "El precio que ya decidiste y tus condiciones de venta"],
    result: "Una cotización o propuesta con las cifras comprobadas en la hoja y con solo las condiciones que tú confirmaste",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el resultado: la hoja que calcula y, a su lado, la cotización redactada con esas cifras.",
      description:
        "Una hoja de cálculo con la calculadora del caso ficticio (partidas, subtotal, descuento, impuesto, total, anticipo y saldo) a la izquierda y, a la derecha, la cotización redactada con los mismos totales. Resaltar el total en ambos lados. Sin datos personales.",
      alt: "Hoja de cálculo con una calculadora de cotización y, al lado, la cotización redactada con los mismos totales.",
      caption: "La hoja calcula; el documento repite sus cifras.",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña cómo se ven los datos de partida ya reunidos antes de abrir la IA.",
      description:
        "Un documento con cuatro bloques: las partidas con cantidad, unidad y precio; los tres porcentajes (descuento y a qué líneas se aplica, impuesto y anticipo); las condiciones ya decididas y lo que pidió el cliente. Caso ficticio, sin datos personales.",
      alt: "Documento con las partidas, los porcentajes, las condiciones y el pedido de un cliente ficticio.",
      caption: "Los datos que la IA no puede saber.",
      zoom: true,
    }),
    hoja: slot("calculadora-de-cotizacion.webp", {
      section: "hoja",
      ratio: "4/3",
      purpose: "Muestra la calculadora pegada y funcionando, con la fórmula del descuento visible.",
      description:
        "La calculadora pegada en la celda A1: cuatro partidas con su importe, subtotal 2950, descuento 195, total 3306, anticipo 1322 y saldo 1984. Resaltar la barra de fórmulas con la fórmula de la base del descuento. Caso ficticio.",
      alt: "Hoja de cálculo con la calculadora de cotización, sus totales y la fórmula de la base del descuento en la barra.",
      caption: "La calculadora con el caso de Maderas Rivera.",
      zoom: true,
    }),
    primerResultado: slot("borrador-de-cotizacion.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver el primer documento y localizar las dos frases que no coinciden con la hoja ni con los datos.",
      description:
        "La cotización devuelta por el asistente, con la frase del anticipo «sobre el subtotal» y la de «materiales de primera calidad» subrayadas. Caso ficticio, sin datos de cuenta.",
      alt: "Cotización redactada por un asistente con dos frases subrayadas.",
      caption: "El primer documento, con dos frases que revisar.",
      zoom: true,
    }),
    revision: slot("revision-de-cifras.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar el documento con la hoja, cifra por cifra.",
      description:
        "La hoja y el documento lado a lado, con una línea entre cada cifra y su equivalente y una marca en el anticipo: 40 % de 2950 sería 1180, no 1322. Caso ficticio.",
      alt: "Hoja y documento lado a lado con cada cifra enlazada y una diferencia marcada en el anticipo.",
      caption: "Cada cifra del documento, contrastada con la hoja.",
      zoom: true,
    }),
    final: slot("cotizacion-final.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra el entregable final: la cotización corregida, con sus pendientes visibles.",
      description:
        "La cotización final con las dos frases corregidas resaltadas y, debajo, la lista «FALTA» con el plazo y la garantía por decidir. Caso ficticio.",
      alt: "Cotización final con las frases corregidas y la lista de condiciones pendientes.",
      caption: "El documento final, con lo pendiente a la vista.",
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
      section: "entrevista",
      ratio: "16/9",
      promptId: "condiciones",
      purpose: "Prueba real del prompt de condiciones: el ida y vuelta de preguntas y la tabla que devolvió.",
      description:
        "Captura de la entrevista (preguntas y respuestas) y de la tabla final con su columna Estado y la lista de pendientes. Responde «todavía no lo decidí» al menos una vez. Ocultar datos personales y de cuenta.",
      alt: "Captura de una entrevista con un asistente y de la tabla de condiciones que devolvió.",
      caption: "Prueba del prompt de condiciones.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "cotizacion",
      purpose: "Prueba real del prompt de cotización: el documento, sus totales y la lista «FALTA».",
      description:
        "Captura del documento completo con su tabla de detalle, sus totales, sus condiciones y «FALTA». Usa la hoja del caso o la tuya. Ocultar datos personales y de cuenta.",
      alt: "Captura de una cotización redactada por un asistente.",
      caption: "Prueba del prompt de cotización.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "revision",
      purpose: "Prueba real del prompt de revisión: la tabla de cifras, las frases con problema y la rúbrica.",
      description:
        "Captura de la tabla de cifras, de las frases con problema, de la rúbrica con sus fragmentos y de «Para comprobar tú». Anota aparte si sus «coincide» son los tuyos. Ocultar datos personales y de cuenta.",
      alt: "Captura de la revisión de una cotización con cifras contrastadas y rúbrica.",
      caption: "Prueba del prompt de revisión.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description:
        "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una cotización con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Un cliente pregunta el precio y quieres responder rápido. Ahí aparecen los errores que salen caros: una suma mal hecha, un descuento aplicado a más de lo debido, un impuesto olvidado, una condición que el cliente entendió distinto de como la pensaste. Cobrar de menos no se nota hasta el final.\n\nUna cotización tiene dos capas. Las cifras se calculan; las condiciones (qué incluye, cómo se paga, hasta cuándo vale) se deciden. Un asistente de IA redacta bien las dos, pero puede equivocarse al calcular y no sabe qué decidiste ni qué te falta por decidir: si se lo pides, puede rellenar con un plazo o una garantía que suenan normales.\n\n**Las cifras salen de una hoja de cálculo, las condiciones las decides tú y la IA solo redacta el documento con ellas.**",
    symptoms: [
      "Tardas horas en armar cada cotización desde cero.",
      "Un total no cuadra y lo descubres cuando el cliente pregunta.",
      "Cada cotización dice las condiciones con palabras distintas y el cliente entiende lo que quiere.",
      "Le pediste a una IA que calculara y no sabes si fiarte del total.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con una cotización lista para verificar y con una hoja y un método para las siguientes.",
    deliverables: [
      { label: "Una calculadora de cotización", detail: "Una hoja con fórmulas en español e inglés que suma, descuenta, aplica el impuesto y separa el anticipo." },
      { label: "Una tabla de condiciones", detail: "Con lo que decidiste y lo que aún no." },
      { label: "Una cotización o una propuesta", detail: "Redactada con las cifras de la hoja y solo con tus condiciones." },
      { label: "Una rúbrica de cinco criterios", detail: "Para revisar cualquier documento antes de enviarlo." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Vendes productos o servicios a la medida y cada cliente pide un precio distinto.",
      "Ya sabes cuánto quieres cobrar y necesitas ponerlo en un documento claro.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Todavía no sabes cuánto cobrar: el precio se decide antes, con tus costos.",
      "Buscas un contrato o cláusulas legales: esta guía no es asesoría legal ni tributaria.",
      "Quieres que la IA fije precios o descuentos por ti.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Maderas Rivera (ficticio) — carpintería de muebles a medida",
    situation:
      "Maderas Rivera es una carpintería de dos personas. La Sra. Paredes pide precio para una cocina y casi acepta, pero armar cada cotización lleva una tarde y a veces los totales no cuadran.",
    goal: "Una cotización con los totales comprobados y solo con las condiciones que el taller decidió.",
    data: [
      { label: "Pedido de la cliente", value: "Tres módulos bajos, dos altos, una encimera de 2 m e instalación" },
      { label: "Ya decidido", value: `Descuento de ${DESC_PCT} % en los módulos, impuesto de ${IMP_PCT} %, anticipo de ${ANT_PCT} %, validez de ${VIGENCIA_DIAS} días` },
      { label: "Todavía sin decidir", value: "El plazo de entrega y la garantía" },
    ],
    problem: "Un asistente al que le pidió «la cotización con todo» calculó mal el descuento y el taller estuvo a punto de cobrar de menos.",
    application: "Arma la hoja, decide sus condiciones con una entrevista, pide el documento, lo contrasta con la hoja y corrige solo lo señalado.",
    result: "Una cotización con cifras iguales a las de la hoja y con el plazo y la garantía anotados como pendientes.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan el trabajo. Las cifras del caso son ficticias; las de tu cotización son las tuyas.",
    blocks: [
      {
        title: "Cotización y propuesta: mismo cálculo, distinto documento",
        detail:
          "La cotización dice qué se entrega, cuánto cuesta y con qué condiciones. La propuesta añade el contexto: qué necesita el cliente y cómo lo resolverás. Los números son los mismos; cambia cuánto se explica.",
        example: "En el caso, como propuesta el documento añadiría «Lo que entendimos» (el pedido de la Sra. Paredes) y «Cómo trabajaremos» (solo lo decidido).",
      },
      {
        title: "Las condiciones las decides tú",
        detail:
          "Qué incluye, cómo se paga, hasta cuándo vale, qué garantía ofreces: son decisiones tuyas. Lo que aún no decidiste se queda pendiente y fuera del documento.",
        example: "En el caso, el plazo y la garantía siguen sin decidir y no aparecen escritos.",
      },
      {
        title: "Cada porcentaje tiene una base",
        detail: "Un descuento, un impuesto o un anticipo se aplican a un importe concreto. Escribir esa base en el documento evita discusiones.",
        example: `En el caso, el descuento va sobre ${BASE_DESC} (los módulos), no sobre ${SUBTOTAL}; el anticipo va sobre el total, ${TOTAL}.`,
      },
      {
        title: "Un solo criterio de redondeo",
        detail: "Si un porcentaje da decimales, redondea una vez, en el anticipo, y calcula el saldo restando. Así las dos partes siempre suman el total.",
        example: `En el caso, ${ANT_PCT} % de ${TOTAL} da ${(TOTAL * ANT_PCT) / 100}: el anticipo es ${ANTICIPO} y el saldo, ${SALDO}.`,
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: `Hazme una cotización para la señora Paredes: 3 módulos bajos de cocina a 450, 2 módulos altos a 300, una encimera de madera a 700 y 12 horas de instalación a 25. Ponle ${DESC_PCT} % de descuento por llevar 5 módulos, suma el impuesto de ${IMP_PCT} % y dime el total.`,
    whyInsufficient:
      "Con esa frase la IA no sabe a qué líneas va el descuento, no conoce tus condiciones y calcula en el mismo mensaje en que redacta. Puede elegir una interpretación que suena razonable, como aplicar el descuento a todo el subtotal (ejemplo ilustrativo), y el documento sale con aspecto de terminado.",
    issues: [
      "El descuento no dice a qué líneas se aplica.",
      "El cálculo y la redacción van juntos: nadie separa lo que se comprueba.",
      "Faltan las condiciones, y un asistente puede completarlas con lo habitual.",
      "No hay una hoja con la que comparar.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Reúne cuatro cosas antes de abrir la IA. Ninguna la puede inventar ella.",
    items: [
      { label: "Tus partidas", detail: "Qué vendes, en qué unidad, cuántas y a qué precio unitario, ya decidido.", required: true },
      { label: "Tus tres porcentajes", detail: "El descuento y a qué líneas se aplica, el impuesto que te corresponda y el anticipo.", required: true },
      { label: "Lo que pidió el cliente", detail: "Sus palabras, sin adornar, y su nombre.", required: true },
      { label: "Tus condiciones", detail: "Las que ya decidiste. Las que no, las descubrirás en la entrevista.", required: false },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribió la IA y lo que calcula la hoja",
      purpose: "Ver cómo una interpretación razonable del descuento cambia el total, y que solo la hoja lo delata.",
      columns: ["Concepto", "Lo que escribió la IA", "Lo que calcula la hoja"],
      rows: [
        ["Descuento", String(DESC_INGENUO), String(DESCUENTO)],
        ["Base del impuesto", String(BASE_IMP_INGENUO), String(BASE_IMP)],
        ["Impuesto", String(IMP_INGENUO), String(IMPUESTO)],
        ["Total", String(TOTAL_INGENUO), String(TOTAL)],
      ],
      note: `Ejemplo ilustrativo, escrito a propósito. El subtotal (${SUBTOTAL}) coincide. La IA aplicó el ${DESC_PCT} % a todo el subtotal y no solo a los módulos: el taller cobraría ${DIFERENCIA} de menos.`,
    },
    hoja: {
      caption: "Fórmulas de la calculadora, en español e inglés",
      purpose: "Ver qué fórmula va en cada celda y cómo comprobarla con números de práctica antes de usar tus precios.",
      columns: ["Celda", "Qué calcula", "Fórmula en español", "Fórmula en inglés", "Comprobación con números de práctica"],
      rows: FORMULAS.map((f) => [f.celda, CUENTAS[f.cuenta], f.es, f.en, f.prueba]),
      note: "Ejemplo generado. El separador entre argumentos (punto y coma o coma) depende de la configuración regional. Cómo pegarla: las fórmulas de F2 se copian hasta F5; las demás, una por celda.",
    },
    calculadora: {
      caption: "Calculadora de cotización con el caso de Maderas Rivera",
      purpose: "Tener una hoja que suma, descuenta y separa el anticipo, lista para pegar en la celda A1 y cambiar por tus datos.",
      columns: ["Concepto", "Unidad", "Cantidad", "Precio unitario", "¿Con descuento?", "Importe"],
      rows: [
        ...ITEMS.map((i, k) => [i.concepto, i.unidad, String(i.cant), String(i.precio), i.desc ? "Sí" : "No", `=C${k + 2}*D${k + 2}`]),
        ["Subtotal", "—", "—", "—", "—", "=SUMA(F2:F5)"],
        ["Base del descuento (líneas con «Sí»)", "—", "—", "—", "—", '=SUMAR.SI(E2:E5;"Sí";F2:F5)'],
        ["Descuento (%)", "—", "—", "—", String(DESC_PCT), "=F7*E8/100"],
        ["Base del impuesto", "—", "—", "—", "—", "=F6-F8"],
        ["Impuesto (%)", "—", "—", "—", String(IMP_PCT), "=F9*E10/100"],
        ["Total", "—", "—", "—", "—", "=F9+F10"],
        ["Anticipo (%)", "—", "—", "—", String(ANT_PCT), "=REDONDEAR(F11*E12/100;0)"],
        ["Saldo", "—", "—", "—", "—", "=F11-F12"],
      ],
      copyable: true,
      note: "Cambia las partidas y los porcentajes por los tuyos. Escribe «Sí» o «No» tal cual en la columna E. Los porcentajes son números enteros: 10 significa 10 %.",
    },
    condiciones: {
      caption: "Tabla de condiciones del caso",
      purpose: "Dejar por escrito lo que decidiste y lo que no, para que el documento solo diga lo primero.",
      columns: ["Condición", "Qué poner", "Lo que decidió el taller", "Estado"],
      rows: COND.map((c) => [c.nombre, c.pide, c.valor, c.estado]),
      copyable: true,
      note: "Ejemplo ficticio. Cambia los valores por los tuyos; «—» y «Pendiente» si aún no decidiste.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cinco de los siete pasos. El primero y el último son solo tuyos.",
    steps: [
      { title: "Decide tu precio y tus porcentajes", description: "Fija tus partidas, el descuento y a qué líneas va, el impuesto y el anticipo.", output: "Datos de partida escritos." },
      { title: "Arma tu hoja de cálculo", description: "Con el prompt de fórmulas, o copiando la calculadora, deja una hoja que calcule.", output: "Una hoja que funciona con números de práctica." },
      { title: "Decide tus condiciones", description: "Deja que la IA te entreviste y marque lo que aún no decidiste.", output: "Una tabla de condiciones con estado." },
      { title: "Pide el documento", description: "Entrega la hoja, las condiciones y lo que pidió el cliente, y pide la cotización o la propuesta.", output: "Un documento con las cifras de la hoja." },
      { title: "Contrasta con la hoja", description: "Compara cada cifra y puntúa con la rúbrica, a mano o con el prompt de revisión.", output: "Una lista de frases y cifras con problema." },
      { title: "Corrige solo lo señalado", description: "Pide cambiar únicamente lo señalado, sin tocar la hoja.", output: "Las frases corregidas." },
      { title: "Verifica y envía", description: "Resuelve los pendientes, confirma con un profesional lo que corresponda y envía desde tu correo o tu mensajería.", output: "Un documento enviado." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    formulas: {
      title: "Prompt de fórmulas: armar tu hoja sin compartir datos",
      objective: "Obtener las fórmulas de la calculadora a partir de la descripción de tus columnas, sin mostrar ninguno de tus precios.",
      whenToUse: "Cuando quieres construir la hoja tú mismo o adaptar la calculadora a tus columnas.",
      variables: [
        { name: "PROGRAMA", description: "La hoja de cálculo que usas.", example: "Google Sheets" },
        {
          name: "COLUMNAS_Y_CELDAS",
          description: "Letra y contenido de cada columna o celda que ya tienes.",
          example: "A: concepto · B: unidad · C: cantidad · D: precio unitario · E: ¿con descuento? (Sí o No) · F: importe · E8, E10 y E12: porcentajes enteros",
        },
      ],
      prompt: `Actúa como asistente de hojas de cálculo para una persona sin experiencia. Tu destinatario es la dueña o el dueño de un negocio pequeño, que escribirá las fórmulas por su cuenta. Tu objetivo es darle las fórmulas de una calculadora de cotizaciones a partir de la descripción de sus columnas, sin ver ninguna cifra real de su negocio.

### CONTEXTO
Programa de hoja de cálculo: {{PROGRAMA}}

### DATOS
Columnas y celdas de mi hoja (letra y qué contiene):
{{COLUMNAS_Y_CELDAS}}

### CUENTAS QUE NECESITO
${LISTA_CUENTAS}

### REGLAS
1. Usa solo las columnas y celdas que te describí. Si falta una para alguna cuenta, escribe [FALTA: la celda] y no la inventes.
2. No me pidas precios ni cantidades reales. Para comprobar cada fórmula usa números de práctica que yo pueda calcular de cabeza.
3. Los porcentajes están escritos como números enteros (10 significa 10 %): divide entre 100 dentro de la fórmula.
4. Escribe cada fórmula con el nombre de las funciones en español y en inglés, y recuérdame que el separador entre argumentos depende de la configuración regional.
5. Explica en una frase qué hace cada fórmula, sin jerga. Si no conoces el nombre exacto de una función en mi programa, dilo en lugar de suponerlo.

### FORMATO DE SALIDA
Una tabla con columnas fijas: Celda | Qué calcula | Fórmula en español | Fórmula en inglés | Comprobación con números de práctica. Después, «Cómo pegarla»: dónde escribir cada fórmula y cómo copiarla hacia abajo. La tabla define la forma; el contenido sale de mis columnas.

### ANTES DE RESPONDER
Verifica que: cada fórmula aplica la cuenta tal como está escrita arriba; cada comprobación con números de práctica es correcta (calcúlala dos veces); solo usaste las celdas descritas; el descuento se aplica solo a las líneas marcadas «Sí». Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "…sin ver ninguna cifra real de su negocio.",
          why: "Le describes la estructura, no tus precios: aprendes a construir el cálculo sin compartir nada de tu negocio.",
        },
        {
          part: "Para comprobar cada fórmula usa números de práctica que yo pueda calcular de cabeza.",
          why: "Puedes verificar cada fórmula con cuentas propias antes de usar tus precios.",
        },
        {
          part: "Los porcentajes están escritos como números enteros…",
          why: "Evita el error de escribir 10 y que la hoja multiplique por 10 en lugar de por 0,1.",
        },
      ],
      evaluate: "Escribe cada fórmula con los números de práctica: el resultado debe coincidir con la última columna.",
      improve: "Si tu programa no reconoce una función, pega su mensaje de error y pide la alternativa.",
      warnings: ["Con coma decimal, los argumentos suelen separarse con punto y coma."],
    },

    condiciones: {
      title: "Prompt de condiciones: que la IA te entreviste",
      objective: "Completar tu tabla de condiciones con preguntas de una en una, y marcar lo que todavía no decidiste.",
      whenToUse: "Cuando tienes las cifras pero no las condiciones escritas, antes de pedir el documento.",
      variables: [
        { name: "TRABAJO", description: "Qué vas a cotizar, en una frase.", example: "Una cocina a medida: muebles, encimera e instalación" },
        { name: "LO_QUE_YA_DECIDI", description: "Lo que ya decidiste; si nada, escribe «nada».", example: `Anticipo de ${ANT_PCT} %, validez de ${VIGENCIA_DIAS} días` },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a dejar por escrito las condiciones de una cotización. Tu destinatario es la persona dueña, que conoce su trabajo pero nunca lo dejó escrito. Tu objetivo es completar la tabla de condiciones usando SOLO lo que yo te diga, y marcar lo que todavía no decidí.

### CONTEXTO
Trabajo que voy a cotizar: {{TRABAJO}}
Lo que ya tengo decidido (puede estar vacío):
{{LO_QUE_YA_DECIDI}}

### CONDICIONES A COMPLETAR (en este orden)
${LISTA_COND}

### REGLAS
1. Hazme UNA pregunta por turno y espera mi respuesta. Máximo 10 preguntas; no preguntes lo que ya está en CONTEXTO.
2. No propongas plazos, garantías, porcentajes ni cláusulas: esas decisiones son solo mías. Si todavía no decidí una, márcala «${PEND}» y sigue.
3. Si una respuesta es vaga («pronto», «unos días»), pídeme la fecha o la cifra concreta.
4. Si dos respuestas se contradicen, cita las dos frases textuales y pídeme que elija.
5. Distingue siempre entre lo que yo dije, lo que tú supones y lo que sugieres. Nunca conviertas una suposición en una condición.
6. No des consejos legales ni tributarios ni me digas qué es habitual en mi país. Si dudo, recomiéndame confirmarlo con un profesional.
7. Si no sé un dato, anótalo como [FALTA: el dato].

### FORMATO DE SALIDA
Al terminar (o al llegar a 10 preguntas), una tabla con columnas fijas: Condición | Lo que decidí (con mis palabras) | Estado. El estado es «${OK}» o «${PEND}». Después, «Pendiente»: cada condición sin decidir y qué necesito resolver. La tabla define la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Verifica que: están todas las condiciones, en el orden indicado; cada valor usa mis palabras y mis cifras; ninguna condición apareció sin que yo la dijera; toda suposición o sugerencia está marcada como tal; cada «${OK}» corresponde a algo que dije. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar la tabla completa en el siguiente prompt, en el lugar de la variable CONDICIONES.`,
      explanation: [
        {
          part: "No propongas plazos, garantías, porcentajes ni cláusulas: esas decisiones son solo mías.",
          why: "Una condición propuesta por la IA puede quedar escrita sin que la hayas decidido.",
        },
        {
          part: "Si todavía no decidí una, márcala «Pendiente» y sigue.",
          why: "Un pendiente a la vista es mejor que una garantía que suena normal y nadie decidió.",
        },
        {
          part: "No des consejos legales ni tributarios…",
          why: "Deja lo regulado en manos de un profesional, no de una respuesta que suena segura.",
        },
      ],
      evaluate: "Comprueba que cada valor usa tus palabras y que lo que no decidiste dice «Pendiente».",
      improve: "Si una respuesta quedó vaga, contesta con la fecha o la cifra exacta y pide reescribir esa fila.",
      conversation: [
        { who: "ia", text: "Primera pregunta: ¿qué incluye el precio, cosa por cosa?" },
        { who: "tu", text: "Fabricar e instalar tres módulos bajos, dos altos y una encimera de 2 metros." },
        { who: "ia", text: "Anotado. ¿Y qué no incluye, aunque el cliente pueda darlo por hecho?" },
      ],
      warnings: ["No pegues datos personales del cliente: basta con su nombre."],
    },

    cotizacion: {
      title: "Prompt de cotización: el documento a partir de la hoja",
      objective: "Obtener una cotización o una propuesta que copie las cifras de la hoja y use solo las condiciones confirmadas.",
      whenToUse: "Cuando tu hoja está comprobada y tu tabla de condiciones está lista.",
      variables: [
        { name: "NEGOCIO", description: "Tu negocio, en una frase.", example: "Carpintería de muebles a medida" },
        { name: "CLIENTE_Y_PEDIDO", description: "Su nombre y lo que pidió, en sus palabras.", example: "Sra. Paredes: una cocina con tres módulos bajos, dos altos, una encimera e instalación" },
        { name: "TIPO", description: "«Cotización» o «Propuesta».", example: "Cotización" },
        { name: "TONO", description: "Cómo suena tu negocio.", example: "Cordial y directo" },
        { name: "HOJA", description: "La tabla de la hoja, con sus partidas y sus totales.", example: "La tabla de la calculadora, ya con tus datos" },
        { name: "CONDICIONES", description: "La tabla de condiciones del paso anterior.", example: "La tabla con Condición, Lo que decidí y Estado" },
      ],
      prompt: `Actúa como redactor de documentos comerciales para un negocio pequeño. Tu destinatario es un cliente que decidirá si acepta, así que necesita entender qué recibe, cuánto paga y qué debe hacer. Tu objetivo es escribir el documento usando SOLO la hoja y las condiciones.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Cliente y pedido: {{CLIENTE_Y_PEDIDO}}
Tipo de documento: {{TIPO}}
Tono: {{TONO}}

### DATOS (la hoja y las condiciones son la única fuente)
Hoja:
{{HOJA}}

Condiciones:
{{CONDICIONES}}

### REGLAS
1. No calcules ni redondees: copia cada importe, porcentaje y total tal como está en la hoja, junto al concepto que tiene ahí.
2. Las condiciones «${PEND}» no las escribas ni las insinúes: anótalas en «FALTA».
3. No inventes garantías, plazos, materiales, marcas, referencias de otros clientes ni credenciales. No uses adjetivos que afirmen una calidad que los datos no contienen.
4. Si el tipo es «Propuesta», añade antes del detalle una sección «Lo que entendimos» con el pedido del cliente, en sus palabras, y una sección «Cómo trabajaremos» solo con lo que digan las condiciones. Si no hay datos para una sección, escribe [FALTA: el dato].
5. Escribe cuándo vale el precio y cómo aceptar, con los datos de las condiciones.
6. Si la hoja y las condiciones se contradicen, o un total no es igual a la base del impuesto más el impuesto, avísame antes de escribir.
7. Distingue lo que sale de los datos de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) «Encabezado»: negocio, cliente, fecha de emisión y de vigencia; (2) «Detalle»: una tabla con columnas fijas Concepto | Cantidad | Precio unitario | Importe; (3) «Totales»: cada renglón de la hoja; (4) «Condiciones»: incluye, no incluye, pago y aceptar; (5) «FALTA». La tabla define la forma; el contenido sale de mi hoja.

### ANTES DE RESPONDER
Verifica que: cada importe y cada total es idéntico al de la hoja; cada porcentaje va con su importe y su base; nada «${PEND}» aparece, ni insinuado; no hay garantías, plazos ni calidades inventados; el documento dice hasta cuándo vale y cómo aceptar. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar el documento completo en el siguiente prompt, en el lugar de la variable DOCUMENTO.`,
      explanation: [
        {
          part: "No calcules ni redondees: copia cada importe, porcentaje y total tal como está en la hoja…",
          why: "Separa el cálculo, que se comprueba, de la redacción, que se revisa.",
        },
        {
          part: "Las condiciones «Pendiente» no las escribas ni las insinúes…",
          why: "Un plazo o una garantía que nadie decidió puede convertirse en una promesa.",
        },
        {
          part: "Si el tipo es «Propuesta», añade antes del detalle una sección «Lo que entendimos»…",
          why: "La propuesta explica más, pero solo con lo que el cliente dijo y tú decidiste.",
        },
      ],
      evaluate: "Contrasta cada cifra y cada frase con tu hoja y tus condiciones en el paso siguiente.",
      improve: "Si el documento suena genérico, aclara el tono y el pedido del cliente; no le añadas datos.",
      warnings: ["Es un borrador: no está listo para enviar hasta que lo contrastes con la hoja."],
    },

    revision: {
      title: "Prompt de revisión: contrastar el documento con la hoja",
      objective: "Comparar cada cifra y cada frase del documento con la hoja y las condiciones, y puntuar con la rúbrica, sin reescribir.",
      whenToUse: "Justo después de recibir el documento, con tu hoja abierta.",
      variables: [
        { name: "DOCUMENTO", description: "El documento que quieres revisar.", example: "La cotización del prompt anterior" },
        { name: "HOJA", description: "La tabla de la hoja, igual que la usaste para redactar.", example: "La misma tabla de la calculadora" },
      ],
      prompt: `Actúa como revisor de cotizaciones para un negocio pequeño. Tu destinatario es la persona dueña, que comprobará tus marcas contra su hoja. Tu objetivo es comparar cada cifra y cada frase del documento con la hoja y las condiciones, y puntuarlo con una rúbrica fija. No reescribas nada.

### CONTEXTO
Usa la tabla de condiciones de esta conversación. Si falta, pídemela antes de seguir.

### DATOS
Documento a revisar:
{{DOCUMENTO}}

Hoja (la única referencia de las cifras):
{{HOJA}}

### RÚBRICA (puntúa cada criterio de 0 a 2: 0 = no cumple, 1 = en parte, 2 = cumple)
${LISTA_CRITERIOS}

### REGLAS
1. Compara cada cifra del documento con la hoja, línea por línea: detalle, subtotal, descuento, base, impuesto, total, anticipo y saldo. No recalcules ni corrijas la hoja.
2. Para cada descuento, impuesto o anticipo compara también la base a la que el documento dice que se aplica con la base de la hoja. Si la cifra coincide pero la base descrita no, márcalo «Alcance distinto».
3. Marca cada frase con problema como «No está en la hoja ni en las condiciones», «Condición pendiente escrita», «Alcance distinto» o «Promesa» (calidad, plazo, garantía o resultado).
4. Los adjetivos de tono no necesitan respaldo, pero no pueden afirmar calidad, plazos ni resultados que los datos no contienen.
5. Cada puntaje se apoya en un fragmento literal entre comillas.
6. Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, marca el documento NO ENVIAR hasta corregirlo.
7. No des por buenos impuestos, garantías ni cláusulas: lista lo que debo comprobar yo y no des asesoría legal ni tributaria.

### FORMATO DE SALIDA
En este orden: (1) «Cifras»: una tabla con columnas fijas Línea | En el documento | En la hoja | ¿Coincide?; (2) «Frases con problema»: una tabla con columnas fijas Frase | Problema | Dato de la hoja o de las condiciones (o «no está»); (3) una tabla con columnas fijas: Criterio | Puntaje (0-2) | Fragmento que lo justifica, con el total sobre ${MAXIMO} y el veredicto «${RESULTADOS[0].label}» (menos de ${RESULTADOS[1].min}), «${RESULTADOS[1].label}» (de ${RESULTADOS[1].min} a ${RESULTADOS[2].min - 1}) o «${RESULTADOS[2].label}» (${RESULTADOS[2].min} o más); (4) «Para comprobar tú». Las tablas definen la forma; el contenido sale de mi documento y mi hoja.

### ANTES DE RESPONDER
Verifica que: comparaste todas las líneas; cada diferencia aparece en su tabla con su dato de la hoja; los puntajes coinciden con las marcas y suman bien (máximo ${MAXIMO}); aplicaste NO ENVIAR donde correspondía; no reescribiste nada ni recalculaste la hoja. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Compara cada cifra del documento con la hoja, línea por línea… No recalcules ni corrijas la hoja.",
          why: "La hoja es la referencia: la IA compara dos listas que tiene delante, en lugar de calcular otra vez.",
        },
        {
          part: "Si la cifra coincide pero la base descrita no, márcalo «Alcance distinto».",
          why: "Una cifra correcta con la base equivocada engaña igual que una cifra falsa.",
        },
        {
          part: "…marca el documento NO ENVIAR hasta corregirlo.",
          why: "Una cifra distinta o una condición inventada no se compensa con buenas notas en lo demás.",
        },
      ],
      evaluate: "Comprueba tú las cifras marcadas «no coincide» y el total en tu hoja; si difieren, confía en tu hoja.",
      improve: "Si puntúa todo casi igual, pide más severidad en «Las cifras coinciden con la hoja».",
      warnings: ["Puede marcar «coincide» donde hay una diferencia: la tabla ordena la revisión, no la sustituye."],
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las frases con problema, con datos de la hoja y de las condiciones, y dejar intacto el resto.",
      whenToUse: "Después de la revisión, cuando alguna frase tiene un problema.",
      variables: [
        { name: "PROBLEMAS", description: "Las frases con problema y su motivo.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Cifras o frases que no se pueden cambiar.", example: "La hoja, el detalle y los totales" },
      ],
      prompt: `Actúa como editor de cotizaciones para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO las frases señaladas, usando solo la hoja y las condiciones, y dejar intacto lo demás.

### CONTEXTO
Usa la hoja, las condiciones y el documento de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Problemas que detecté (frase y motivo):
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo las frases señaladas y lo que su cambio obligue a ajustar. No modifiques la hoja, las cifras ni las frases correctas.
2. Para cada corrección usa solo datos de la hoja y de las condiciones «${OK}», con la base que tienen ahí. Si falta el dato, escribe [FALTA: el dato] en lugar de inventarlo.
3. Si quitas una frase sin respaldo, no la sustituyas por otra parecida: quítala o deja solo la parte que los datos respaldan.
4. Si un problema que te señalé no existe en la hoja o en las condiciones, o los datos se contradicen, dímelo antes de cambiar nada.
5. No añadas cifras, plazos, garantías ni promesas.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla con columnas fijas Antes | Después | Motivo, con solo la frase que cambia, para que yo la sustituya en mi documento; (2) «Sin cambios»: las secciones que no toqué; (3) «FALTA» con cada [FALTA]. La tabla define la forma; el contenido sale de mi documento.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada corrección usa datos de la hoja y de las condiciones «${OK}»; no apareció ninguna cifra nueva; las secciones sin cambios están idénticas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo las frases señaladas…",
          why: "Evita que rehaga frases y cifras que ya coincidían con la hoja.",
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
      evaluate: "Sustituye las frases y vuelve a contrastar con tu hoja: las demás cifras deben seguir idénticas.",
      improve: "Si la corrección mezcla cifras, pega de nuevo la hoja y pide repetir solo esa frase.",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: `Salida ilustrativa, redactada aplicando el prompt de cotización a la hoja y las condiciones de Maderas Rivera. La tuya será distinta.`,
    parts: [
      { type: "text", text: `**Encabezado.** ${ENCABEZADO}` },
      {
        type: "table",
        table: {
          caption: "Detalle de la cotización",
          purpose: "Tener el detalle con el formato que pidió el prompt, para contrastarlo con la hoja.",
          columns: ["Concepto", "Cantidad", "Precio unitario", "Importe"],
          rows: DETALLE,
        },
      },
      { type: "text", text: `**Totales.** ${TOTALES}` },
      { type: "text", text: `**Condiciones.** ${CONDICIONES_PRIMERA}` },
      { type: "text", text: `**FALTA:** ${FALTA}` },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "cotizacion",
    title: "Puntúa una cotización",
    intro:
      `Puntúa tu documento en los cinco criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se envía aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      "El documento se ve completo y todas sus cifras se parecen a las de la hoja. Para saber si lo son, se contrasta cada una y se puntúa con la rúbrica. " +
      `En este ejemplo el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "cifras",
        verdict: vered("cifras"),
        comment: `Todos los importes coinciden con la hoja. Pero el pago dice «${PROBLEMAS[0].antes}»: ${PROBLEMAS[0].dice}. La cifra es correcta y la base descrita no.`,
      },
      {
        criterionId: "condiciones",
        verdict: vered("condiciones"),
        comment: "El plazo y la garantía no aparecen escritos: el prompt los deja en «FALTA», como pide.",
      },
      {
        criterionId: "incluye",
        verdict: vered("incluye"),
        comment: "Enumera lo que incluye y lo que no incluye.",
      },
      {
        criterionId: "aceptar",
        verdict: vered("aceptar"),
        comment: "Dice cuándo vale la cotización, cómo se paga y cómo aceptar.",
      },
      {
        criterionId: "promesas",
        verdict: vered("promesas"),
        comment: `«${CALIDAD.replace(/\.$/, "")}» afirma una calidad que ningún dato respalda. No es una cifra, pero es una promesa.`,
      },
    ],
    conclusion: "Es un buen borrador: las cifras son las de la hoja. Dos detalles habrían pasado por buenos al leerlo rápido, y solo se ven contrastando cada frase.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir dos frases, no rehacer el documento ni tocar la hoja.",
    promptId: "ajuste",
    why: "La revisión señaló una base mal descrita y una promesa. El prompt limita el cambio a lo señalado, pide usar solo datos de la hoja y de las condiciones confirmadas, y separa lo cambiado de lo que sigue igual.",
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
          purpose: "Comprobar qué frase cambió y por qué, y que las cifras no se tocaron.",
          columns: ["Antes", "Después", "Motivo"],
          rows: PROBLEMAS.map((p) => [p.antes, p.despues, p.motivo]),
        },
      },
      {
        type: "text",
        text: `**Sin cambios:** encabezado, detalle, totales, qué incluye y qué no, vigencia y cómo aceptar. **FALTA:** ${FALTA}. Al repetir la revisión con las dos frases corregidas, la rúbrica suma ${MAXIMO} de ${MAXIMO}; el plazo y la garantía se deciden antes de enviar.`,
      },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Pedirle a la IA que calcule y redacte en un solo mensaje",
      whyItHurts: "Nadie separa lo que hay que comprobar: la cifra y la frase llegan juntas y con el mismo aspecto de terminadas.",
      instead: "Calcula en la hoja y pega la tabla al pedir el documento.",
    },
    {
      title: "Dejar que la IA complete tus condiciones",
      whyItHurts: "Un plazo o una garantía que suenan normales quedan escritos aunque nadie los decidió, y el cliente los toma por una promesa.",
      instead: "Decídelas tú y deja fuera las pendientes.",
    },
    {
      title: "Escribir un porcentaje sin su base",
      whyItHurts: "«10 % de descuento» puede significar 195 o 295, y el cliente elegirá la que le convenga.",
      instead: "Escribe siempre el importe y la base: «10 % sobre los módulos: 195».",
    },
    {
      title: "Cambiar una cifra en el texto y no en la hoja",
      whyItHurts: "La hoja y el documento dejan de coincidir y ya no tienes con qué contrastar.",
      instead: "Corrige primero la hoja y genera el documento con la tabla actualizada.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de enviar la cotización, repasa esta lista. Marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Cada cifra del documento coincide con mi hoja, y la hoja con mis precios y porcentajes." },
      { label: "Comprobé el total una vez más, a mano o con una calculadora aparte." },
      { label: "Cada descuento, impuesto y anticipo dice a qué importe se aplica." },
      { label: "Las condiciones son las que decidí y puedo cumplir; los pendientes están resueltos o no aparecen." },
      { label: "No hay garantías, plazos ni calidades que no salgan de mis decisiones." },
      {
        label: "Confirmé con un profesional lo que corresponda a impuestos, facturación y garantías legales.",
        detail: "Varían según el país y el tipo de negocio; esta guía no los cubre.",
      },
      { label: "El nombre y los datos del cliente son los que me dio, y el documento solo va a quien corresponde." },
    ],
    principle: "La IA ordena las palabras. Los números y las promesas los confirmas tú.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la cotización enviada, el trabajo es aprender de cada una.",
    steps: [
      { title: "Guarda cada cotización con su hoja", detail: "Si el cliente vuelve, la hoja explica cada cifra." },
      { title: "Anota las preguntas del cliente", detail: "Cada duda señala una condición que faltaba en el documento." },
      { title: "Registra si se aceptó y cuándo", detail: "Tu propio historial te dirá cuánto tiempo conviene que valga una cotización." },
      { title: "Actualiza tus precios cuando cambien tus costos", detail: "Cambia la hoja primero y luego el documento." },
      { title: "Guarda la hoja y las condiciones como plantillas", detail: "La próxima vez cambias solo las partidas y lo que haya cambiado." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena la cotización, pero tiene límites.",
    items: [
      { title: "No fija tu precio", detail: "No conoce tus costos ni tu margen: el precio es una decisión tuya." },
      { title: "No conoce tus condiciones", detail: "Solo redacta las que le das; las que no decidiste quedan pendientes." },
      { title: "No da asesoría legal ni tributaria", detail: "Impuestos, facturación, garantías y cláusulas varían por país: confírmalos con un profesional." },
      { title: "No envía ni da seguimiento", detail: "Prepara el documento; enviarlo y responder al cliente depende de ti." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Una cotización clara nace de separar dos trabajos: calcular y decidir por un lado, redactar por otro. Con una hoja que suma, unas condiciones que tú confirmas y una IA que ordena las palabras, el documento sale en minutos y sale igual cada vez.",
    takeaways: [
      "Calcula en una hoja y pega la tabla al pedir el documento.",
      "Decide tus condiciones; las pendientes se quedan fuera.",
      "Escribe cada porcentaje con su base.",
      "Contrasta cada cifra con la hoja antes de enviar.",
    ],
    nextGuide: "responder-consultas-de-clientes-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "hoja-de-calculo", "anticipo", "rubrica", "dato-personal"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Qué hago si el cliente pide otra cantidad?",
      answer: "Cámbiala en la hoja, copia la tabla otra vez y pide de nuevo el documento. No edites las cifras dentro del texto.",
    },
    {
      question: "¿Los precios llevan impuestos?",
      answer: "Depende de tu país y de tu negocio. La hoja permite sumarlos aparte, como en el ejemplo, o ponerlos en cero. Confirma con un profesional cómo deben mostrarse.",
    },
    {
      question: "¿Cuánto tiempo debe valer una cotización?",
      answer: "El que tú decidas y puedas sostener. Lo importante es que lleve fecha de emisión y fecha límite.",
    },
    {
      question: "¿Sirve si vendo solo servicios?",
      answer: "Sí. Cambia las partidas por horas o entregables: las fórmulas son las mismas.",
    },
  ],
});
