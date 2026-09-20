import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * ventas/definir-precios-y-margenes-con-ia
 *
 * Tipo: números y datos + decisión (`handlesNumbers`). Todo el caso (la galletería Migas, sus costos, sus
 * volúmenes y sus decisiones) es FICTICIO. Cada cifra se calcula en este archivo a partir de las constantes y
 * se verificó con código aparte (ver README.md). Las respuestas de la IA son EJEMPLOS GENERADOS: están
 * redactadas aplicando literalmente cada prompt a la hoja del caso; no proceden de una conversación real ni
 * de una prueba del autor. El error del pedido ingenuo (sumar el margen al costo) es ILUSTRATIVO, escrito a
 * propósito. Las pruebas reales viven en `evidence.pruebas`, que solo rellena el autor.
 * La guía no afirma que ningún precio sea rentable ni cubre impuestos o normas de precios: los decide y
 * confirma la persona.
 *
 * Fuente única de verdad: los datos del caso (constantes de arriba), las cuentas (CUENTAS), los criterios
 * (CRITERIOS), los umbrales (RESULTADOS), los puntajes (PUNTAJES) y los escenarios (ESCENARIOS) se definen UNA
 * vez; la hoja, las tablas, los ejemplos, la rúbrica y los prompts los leen. Decimales con coma.
 */
const slot = guideSlots("ventas", "definir-precios-y-margenes-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const r1 = (n: number) => Math.round(n * 10) / 10;
const f = (n: number) => String(r1(n)).replace(".", ",");

const GALLETAS_TANDA = 24;
const GALLETAS_CAJA = 6;
const ING_TANDA = 48;
const EMPAQUE = 3;
const MIN_TANDA = 60;
const HORA = 20;
const FIJOS_MES = 600;
const CAJAS_MES = 150;
const MARGEN_DESEADO = 40;
const PRECIO_ELEGIDO = 40;
const AUMENTO_ING = 25;
const CAJAS_BAJA = 100;

const CAJAS_TANDA = GALLETAS_TANDA / GALLETAS_CAJA;
const costoPorCaja = (ingTanda: number, cajasMes: number) => ({
  ing: ingTanda / CAJAS_TANDA,
  mo: ((MIN_TANDA / 60) * HORA) / CAJAS_TANDA,
  fijos: FIJOS_MES / cajasMes,
  total: ingTanda / CAJAS_TANDA + EMPAQUE + ((MIN_TANDA / 60) * HORA) / CAJAS_TANDA + FIJOS_MES / cajasMes,
});
const precioObjetivo = (costo: number) => (costo * 100) / (100 - MARGEN_DESEADO);
const margenReal = (precio: number, costo: number) => r1(((precio - costo) / precio) * 100);

const BASE = costoPorCaja(ING_TANDA, CAJAS_MES);
const COSTO = BASE.total;
const PRECIO_OBJ = precioObjetivo(COSTO);
const GANANCIA = PRECIO_OBJ - COSTO;
const RECARGO = r1((GANANCIA / COSTO) * 100);
const MARGEN_ELEGIDO = margenReal(PRECIO_ELEGIDO, COSTO);

/* escenarios: cada uno cambia uno o dos datos de la hoja */
const ING_SUBE = (ING_TANDA * (100 + AUMENTO_ING)) / 100;
const ESCENARIOS = [
  { nombre: `Los ingredientes suben ${AUMENTO_ING} %`, celdas: `B5: de ${ING_TANDA} a ${ING_SUBE}`, mirar: "Costo total (C13) y margen real (C19)", ing: ING_SUBE, cajas: CAJAS_MES },
  { nombre: `Se venden ${CAJAS_BAJA} cajas al mes`, celdas: `B11: de ${CAJAS_MES} a ${CAJAS_BAJA}`, mirar: "Gastos fijos por caja (C12), costo total y margen real", ing: ING_TANDA, cajas: CAJAS_BAJA },
  { nombre: "Las dos cosas a la vez", celdas: `B5: ${ING_SUBE} y B11: ${CAJAS_BAJA}`, mirar: "Costo total, margen real y precio objetivo (C15)", ing: ING_SUBE, cajas: CAJAS_BAJA },
];
const resultado = (ing: number, cajas: number) => {
  const c = costoPorCaja(ing, cajas).total;
  return [f(c), `${f(margenReal(PRECIO_ELEGIDO, c))} %`, f(precioObjetivo(c))];
};

/* el pedido ingenuo: el margen se suma al costo */
const PRECIO_INGENUO = COSTO * (1 + MARGEN_DESEADO / 100);
const GANANCIA_INGENUA = PRECIO_INGENUO - COSTO;
const MARGEN_INGENUO = margenReal(PRECIO_INGENUO, COSTO);
const DIFERENCIA = PRECIO_ELEGIDO - PRECIO_INGENUO;

/* números de práctica para comprobar las fórmulas */
const P = { galletas: 24, caja: 6, ingTanda: 40, cajasTanda: 4, min: 30, hora: 20, cajas2: 2, fijos: 300, ventas: 100, ing: 10, emp: 2, mo: 5, fij: 3, costo: 20, margen: 50, precio: 40, costo2: 30 };
const P_CT = P.galletas / P.caja;
const P_ING = P.ingTanda / P.cajasTanda;
const P_MO = ((P.min / 60) * P.hora) / P.cajas2;
const P_FIJ = P.fijos / P.ventas;
const P_COSTO = P.ing + P.emp + P.mo + P.fij;
const P_OBJ = (P.costo * 100) / (100 - P.margen);
const P_GAN = P_OBJ - P.costo;
const P_REC = r1((P_GAN / P.costo) * 100);
const P_MR = r1(((P.precio - P.costo2) / P.precio) * 100);

const CUENTAS = [
  "Cajas por tanda: galletas por tanda ÷ galletas por caja.",
  "Ingredientes por caja: ingredientes por tanda ÷ cajas por tanda.",
  "Mano de obra por caja: minutos por tanda ÷ 60 × valor de la hora ÷ cajas por tanda.",
  "Gastos fijos por caja: gastos fijos del mes ÷ cajas vendidas al mes.",
  "Costo total por caja: ingredientes + caja y etiqueta + mano de obra + gastos fijos, todo por caja.",
  "Precio objetivo: costo total × 100 ÷ (100 − margen deseado).",
  "Ganancia por caja: precio objetivo − costo total.",
  "Recargo sobre el costo: ganancia ÷ costo total × 100, con un decimal.",
  "Margen real: (precio elegido − costo total) ÷ precio elegido × 100, con un decimal.",
] as const;
const LISTA_CUENTAS = CUENTAS.map((c, i) => `${i + 1}. ${c}`).join("\n");

const FORMULAS: { celda: string; cuenta: number; es: string; en: string; prueba: string }[] = [
  { celda: "C4", cuenta: 0, es: "=B2/B3", en: "=B2/B3", prueba: `Con ${P.galletas} y ${P.caja}: ${P_CT}` },
  { celda: "C5", cuenta: 1, es: "=B5/C4", en: "=B5/C4", prueba: `Con ${P.ingTanda} y ${P.cajasTanda}: ${P_ING}` },
  { celda: "C9", cuenta: 2, es: "=B7/60*B8/C4", en: "=B7/60*B8/C4", prueba: `Con ${P.min} minutos, hora de ${P.hora} y ${P.cajas2} cajas: ${P_MO}` },
  { celda: "C12", cuenta: 3, es: "=B10/B11", en: "=B10/B11", prueba: `Con ${P.fijos} y ${P.ventas}: ${P_FIJ}` },
  { celda: "C13", cuenta: 4, es: "=C5+C6+C9+C12", en: "=C5+C6+C9+C12", prueba: `Con ${P.ing}, ${P.emp}, ${P.mo} y ${P.fij}: ${P_COSTO}` },
  { celda: "C15", cuenta: 5, es: "=C13*100/(100-B14)", en: "=C13*100/(100-B14)", prueba: `Con costo ${P.costo} y margen ${P.margen}: ${P_OBJ}` },
  { celda: "C16", cuenta: 6, es: "=C15-C13", en: "=C15-C13", prueba: `Con ${P_OBJ} y ${P.costo}: ${P_GAN}` },
  { celda: "C17", cuenta: 7, es: "=REDONDEAR(C16/C13*100;1)", en: "=ROUND(C16/C13*100,1)", prueba: `Con ${P_GAN} y ${P.costo}: ${P_REC}` },
  { celda: "C19", cuenta: 8, es: "=REDONDEAR((B18-C13)/B18*100;1)", en: "=ROUND((B18-C13)/B18*100,1)", prueba: `Con precio ${P.precio} y costo ${P.costo2}: ${P_MR}` },
];

const COSTOS = [
  { nombre: "Producto y tanda", pide: "Qué vendes, cuántas unidades salen de una tanda y cuántas lleva cada venta." },
  { nombre: "Ingredientes", pide: "Lo que cuestan por tanda, incluido lo que se pierde, con su origen." },
  { nombre: "Empaque", pide: "Caja, etiqueta o bolsa por unidad vendida." },
  { nombre: "Tu tiempo", pide: "Minutos de trabajo por tanda y cuánto vale tu hora, aunque hoy no te la pagues." },
  { nombre: "Gastos fijos del mes", pide: "Alquiler, luz, gas y herramientas: lo que pagas aunque no vendas." },
  { nombre: "Ventas del mes", pide: "Cuántas unidades vendes en un mes normal; si no lo sabes, es un supuesto." },
] as const;
const LISTA_COSTOS = COSTOS.map((c, i) => `${i + 1}. ${c.nombre}: ${c.pide}`).join("\n");

/* la lectura del ejemplo se compone con las cifras; el defecto y su corrección son frases sueltas */
const FRASE_BASE_ERR = `ganas ${MARGEN_DESEADO} por cada 100 que te cuesta la caja`;
const FRASE_BASE_OK = `de cada ${PRECIO_ELEGIDO} que cobras, ${GANANCIA} quedan después de costos`;
const FRASE_IMPREVISTOS = "con espacio para cubrir imprevistos";
const LECTURA_PRIMERA = [
  `Costo total por caja: ${COSTO} (ingredientes ${BASE.ing}, caja y etiqueta ${EMPAQUE}, mano de obra ${BASE.mo} y gastos fijos ${BASE.fijos}).`,
  `Precio objetivo con un margen deseado de ${MARGEN_DESEADO} %: ${PRECIO_OBJ}. Ganancia por caja: ${GANANCIA}.`,
  `Recargo sobre el costo: ${f(RECARGO)} %.`,
  `Margen: ${MARGEN_DESEADO} %, es decir, ${FRASE_BASE_ERR}.`,
  `Con el precio de ${PRECIO_ELEGIDO}, el margen queda ${FRASE_IMPREVISTOS}.`,
];
const SUPUESTOS = `Que vendes ${CAJAS_MES} cajas al mes y que tu hora de trabajo vale ${HORA}.`;
const NO_DICE = "Si tus clientes pagarían ese precio ni cuánto cobran otros negocios.";
const PREGUNTAS_LECTURA = `¿Vendes de verdad unas ${CAJAS_MES} cajas al mes? ¿Tu hora vale ${HORA} para ti? ¿Los ingredientes son los de tu última compra?`;

const PROBLEMAS = [
  {
    antes: FRASE_BASE_ERR,
    despues: FRASE_BASE_OK,
    motivo: `El margen va sobre el precio: ${GANANCIA} de ${PRECIO_ELEGIDO}. Sobre el costo sería ${f(RECARGO)} %.`,
  },
  { antes: FRASE_IMPREVISTOS, despues: "Se quita la frase.", motivo: "La hoja no dice si el margen alcanza para algo: eso lo decides tú." },
];
const PROBLEMAS_TEXTO = `«${PROBLEMAS[0].antes}»: el margen va sobre el precio. «${PROBLEMAS[1].antes}»: la hoja no dice si el margen alcanza.`;

const CRITERIOS = [
  { id: "cifras", label: "Las cifras son las de la hoja", detail: "Cada cifra, unidad y base coincide con la hoja, sin recalcular." },
  { id: "bases", label: "Cada porcentaje dice su base", detail: "El margen se explica sobre el precio y el recargo sobre el costo." },
  { id: "veredicto", label: "No decide ni promete", detail: "No afirma que el precio sea rentable, suficiente o seguro ni recomienda uno." },
  { id: "supuestos", label: "Nombra lo que supone la hoja", detail: "Enumera los supuestos: ventas del mes, valor de tu hora, reparto de gastos." },
  { id: "preguntas", label: "Deja preguntas para aclarar", detail: "Cierra con lo que falta por saber antes de decidir." },
] as const;
const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Fallan varios criterios: revisa la hoja antes de volver a pedir la lectura." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado, empezando por las cifras y las bases." },
  { min: 9, label: "Lista para verificar", advice: "Cumple casi todo: pasa a probar escenarios y a decidir." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (total: number) => [...RESULTADOS].reverse().find((r) => total >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { cifras: 2, bases: 1, veredicto: 1, supuestos: 2, preguntas: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");
export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "definir-precios-y-margenes-con-ia",
    category: "ventas",
    title: "Definir precios y márgenes con apoyo de la IA",
    description:
      "Ordena tus costos, calcula el precio en una hoja de cálculo y usa la IA para revisar la lógica y explorar escenarios; la decisión del precio es tuya.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["numeros-datos", "decision-comparacion"],
    estandarGuia: 3,
    handlesNumbers: true,
    activoOriginal:
      "Calculadora de costo y precio para hoja de cálculo con fórmulas en español e inglés (copiable), tabla de escenarios y rúbrica de cinco criterios con dos reglas de bloqueo",
    problem: "No sabes con certeza cuánto cobrar por un producto o servicio ni qué margen te queda después de costos.",
    whyThisPage:
      "Distingue estrictamente cálculo (hoja de cálculo), interpretación (IA) y decisión (emprendedor) en una tarea financiera sensible, y no afirma que un precio sea rentable.",
    relatedGuides: ["crear-promociones-con-ia", "crear-cotizaciones-y-propuestas-con-ia", "analizar-ventas-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Un precio puesto por costumbre o copiado de otro puede dejarte sin ganancia sin que lo notes. Calcula tu costo completo en una hoja, deja que la IA explique lo que dicen los números y decide el precio tú.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de dos horas la primera vez; menos al actualizar la hoja",
    needs: ["Un asistente de IA de chat", "Una hoja de cálculo", "Tus costos reales: facturas, tiempos y gastos del mes"],
    result: "Una hoja con el costo completo y el precio de tu producto, una lectura de esos números sin veredictos y escenarios para probar antes de decidir",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el método: una hoja con el costo completo y el precio, y al lado la lectura que hace la IA de esos números.",
      description:
        "Una hoja de cálculo con la calculadora del caso ficticio (costo por caja, precio objetivo, ganancia, recargo y margen real) a la izquierda y, a la derecha, la lectura del asistente con «Lo que dice la hoja» y «Preguntas para aclarar». Resaltar el costo total. Sin datos personales.",
      alt: "Hoja con el costo y el precio de un producto y, al lado, la lectura de esos números hecha por un asistente.",
      caption: "La hoja calcula; la lectura solo explica.",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña cómo se ven los datos de partida ya reunidos antes de abrir la IA.",
      description:
        "Un documento con cuatro bloques: facturas de ingredientes con su precio, el tiempo cronometrado de una tanda, los gastos fijos del mes y las ventas de un mes normal. Caso ficticio, sin datos personales.",
      alt: "Documento con facturas de ingredientes, tiempos de una tanda, gastos fijos y ventas de un negocio ficticio.",
      caption: "Los datos que la IA no puede saber.",
      zoom: true,
    }),
    hoja: slot("calculadora-de-precio.webp", {
      section: "hoja",
      ratio: "4/3",
      purpose: "Muestra la calculadora pegada y funcionando, con la fórmula del precio objetivo visible.",
      description:
        "La calculadora pegada en la celda A1: datos en la columna B y resultados en la C, con costo total 24, precio objetivo 40 y margen real 40 %. Resaltar la barra de fórmulas con la fórmula del precio objetivo. Caso ficticio.",
      alt: "Hoja de cálculo con la calculadora de costo y precio, con costo total, precio objetivo y margen real, y la fórmula del precio en la barra.",
      caption: "La calculadora con el caso de la galletería.",
      zoom: true,
    }),
    primerResultado: slot("lectura-inicial.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver la primera lectura y localizar las dos frases que no coinciden con la hoja.",
      description:
        "La lectura devuelta por el asistente, con la frase «ganas 40 por cada 100 que te cuesta la caja» y la de «espacio para cubrir imprevistos» subrayadas. Caso ficticio, sin datos de cuenta.",
      alt: "Lectura de una hoja de costos con dos frases subrayadas.",
      caption: "La primera lectura, con dos frases que revisar.",
      zoom: true,
    }),
    contraste: slot("contraste-con-la-hoja.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar la lectura con la hoja y a ver la diferencia entre margen y recargo.",
      description:
        "La hoja junto a la lectura, con una línea entre cada cifra y su celda y una marca en el margen: 16 de 40 es 40 %, mientras que 16 de 24 es 66,7 %. Caso ficticio.",
      alt: "Hoja y lectura lado a lado con cada cifra enlazada y la diferencia entre margen y recargo marcada.",
      caption: "Cada cifra de la lectura, contrastada con la hoja.",
      zoom: true,
    }),
    escenarios: slot("tabla-de-escenarios.webp", {
      section: "adaptacion",
      ratio: "4/3",
      purpose: "Muestra los escenarios probados en la hoja, con el costo, el margen y el precio de cada uno.",
      description:
        "Una tabla con el caso base y los tres escenarios (ingredientes +25 %, 100 cajas al mes y ambos), con el costo total, el margen real y el precio para mantener el 40 %. Resaltar los que bajan de 35 %. Caso ficticio.",
      alt: "Tabla con un caso base y tres escenarios de costos, con su margen y el precio para mantener el margen deseado.",
      caption: "Qué pasa si cambian tus costos.",
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
      promptId: "costos",
      purpose: "Prueba real del prompt de costos: el ida y vuelta de preguntas y la tabla que devolvió.",
      description:
        "Captura de la entrevista (preguntas y respuestas) y de la tabla final con su columna Estado y la lista «Pendiente». Responde «no sé» al menos una vez. Ocultar datos personales y de cuenta.",
      alt: "Captura de una entrevista con un asistente y de la tabla de costos que devolvió.",
      caption: "Prueba del prompt de costos.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "lectura",
      purpose: "Prueba real del prompt de lectura: lo que dice la hoja, lo que supone, lo que no dice y las preguntas.",
      description:
        "Captura de las cinco secciones de la respuesta. Usa la hoja del caso o la tuya. Ocultar datos personales y de cuenta.",
      alt: "Captura de la lectura de una hoja de costos devuelta por un asistente.",
      caption: "Prueba del prompt de lectura.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios y lo que queda sin tocar.",
      description:
        "Captura de la tabla de cambios, de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una lectura con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba5: slot("prueba-prompt-05.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "escenarios",
      purpose: "Prueba real del prompt de escenarios: las celdas que cambian y qué mirar en la hoja.",
      description:
        "Captura de la tabla de escenarios y de «Cómo probarlo». Anota aparte si sus valores nuevos coinciden con tu cuenta. Ocultar datos personales y de cuenta.",
      alt: "Captura de una tabla de escenarios de costos devuelta por un asistente.",
      caption: "Prueba del prompt de escenarios.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Ponerle precio a un producto parece fácil hasta que hay que justificarlo. Muchos negocios pequeños copian el precio de otro, le suman un porcentaje al costo de los ingredientes o lo dejan como siempre. Los errores se repiten: contar solo los materiales y olvidar el tiempo propio y los gastos fijos, confundir margen con recargo y no saber qué pasa si sube un costo.\n\nUn asistente de IA puede explicar los números y ordenar tus costos, pero puede equivocarse al calcular, mezclar margen y recargo y decir con seguridad que un precio «es rentable» sin conocer tus ventas.\n\n**La hoja calcula, la IA interpreta y tú decides el precio.**",
    symptoms: [
      "Tu precio es el que cobraba otro, o el de siempre.",
      "Cuentas los ingredientes, pero no tu tiempo ni el alquiler.",
      "No sabes cuánto ganas realmente por cada venta.",
      "Le pediste a una IA un precio para un margen y no sabes si fiarte del resultado.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con el costo completo y un precio calculado para un producto tuyo, y con un método para repetirlo.",
    deliverables: [
      { label: "Una calculadora de costo y precio", detail: "Una hoja con fórmulas en español e inglés que suma el costo completo y da tu precio objetivo." },
      { label: "Una lectura de los números", detail: "Lo que dice la hoja, lo que supone y lo que no dice, sin veredictos." },
      { label: "Una tabla de escenarios", detail: "Qué pasa con tu margen si suben los ingredientes o bajan las ventas." },
      { label: "Una rúbrica de cinco criterios", detail: "Para revisar cualquier lectura antes de fiarte de ella." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Vendes un producto que preparas o compras, y quieres saber cuánto te cuesta de verdad y cuánto cobrar.",
      "Tienes tus costos a mano, aunque sea en facturas y notas.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Quieres que la IA te diga qué precio poner: aquí la IA explica y tú decides.",
      "Necesitas contabilidad o consejo tributario: esta guía no lo da.",
      "Ya tienes precios y costos y buscas diseñar una oferta: para eso hay otra guía.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Galletería Migas (ficticio) — galletas artesanales por encargo",
    situation:
      "Migas es un negocio de dos personas que hornea galletas en tandas y las vende por encargo y en ferias. Va a lanzar una caja de seis y no sabe cuánto le cuesta ni cuánto cobrar.",
    goal: "El costo completo de una caja y un precio calculado con un margen deseado, con la decisión final a cargo de la dueña.",
    data: [
      { label: "Producto", value: `Una caja de ${GALLETAS_CAJA} galletas; cada tanda rinde ${GALLETAS_TANDA} galletas` },
      { label: "Lo que quiere", value: `Un margen del ${MARGEN_DESEADO} % sobre el precio` },
      { label: "Lo que no sabe", value: "Cuánto vale su tiempo dentro del costo y qué pasa si suben los ingredientes" },
    ],
    problem: "Un asistente al que le pidió «un precio con 40 % de margen» le devolvió uno con menos margen del que ella creía.",
    application: "Ordena sus costos con una entrevista, arma la hoja, pide una lectura de los números, la contrasta, corrige lo señalado y prueba escenarios.",
    result: "Un costo por caja, un precio objetivo, una lectura sin veredictos y tres escenarios, con el precio final por decidir.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan el trabajo. Las cifras del caso son ficticias; las de tu producto son las tuyas.",
    blocks: [
      {
        title: "Costo completo, no solo ingredientes",
        detail:
          "El costo de una unidad suma los materiales, el empaque, tu tiempo y una parte de los gastos fijos. Dejar fuera tu tiempo o el alquiler hace que el precio pague los ingredientes y no el negocio.",
        example: `En el caso, de ${COSTO} por caja, ${BASE.ing} son ingredientes; el resto es empaque, trabajo y gastos fijos.`,
      },
      {
        title: "Margen y recargo no son lo mismo",
        detail:
          "El margen se calcula sobre el precio: qué parte de lo que cobras te queda. El recargo, sobre el costo: cuánto le sumas al costo. Un mismo precio da dos porcentajes distintos.",
        example: `Con costo ${COSTO} y precio ${PRECIO_OBJ}, la ganancia es ${GANANCIA}: ${MARGEN_DESEADO} % del precio y ${f(RECARGO)} % del costo.`,
      },
      {
        title: "Precio mínimo, objetivo y elegido",
        detail:
          "La hoja da dos referencias: el costo (por debajo pierdes) y el precio objetivo para el margen que deseas. El precio elegido lo decides tú, y para ello miras algo que la hoja no sabe: lo que pagan tus clientes.",
      },
      {
        title: "Cada supuesto mueve el resultado",
        detail: "Las ventas del mes y el valor de tu hora son estimaciones. Cambiarlos en la hoja te dice cuánto depende tu margen de ellos.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: `Mi caja de ${GALLETAS_CAJA} galletas me cuesta ${COSTO} y quiero un margen del ${MARGEN_DESEADO} %. ¿A qué precio la vendo?`,
    whyInsufficient:
      "Con esa frase la IA no sabe de dónde sale el costo ni qué significa el margen para ti. Puede sumar el 40 % al costo (ejemplo ilustrativo) y responder con seguridad, y el precio sale más bajo de lo que necesitas para ese margen.",
    issues: [
      "El costo llega como una sola cifra: nadie comprueba qué incluye.",
      "«Margen» puede entenderse sobre el costo o sobre el precio, y no se aclara.",
      "El cálculo y la respuesta van juntos, sin una hoja con la que comparar.",
      "No hay supuestos a la vista: ventas, tu tiempo, gastos fijos.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Junta cuatro cosas antes de abrir la IA. Ella no puede saber ninguna.",
    items: [
      { label: "Lo que cuestan tus materiales", detail: "Facturas o precios de tu última compra, por tanda y por unidad de empaque.", required: true },
      { label: "Tu tiempo", detail: "Cuánto tardas en una tanda, cronometrado, y cuánto vale tu hora.", required: true },
      { label: "Tus gastos fijos del mes", detail: "Los pagos mensuales que no dependen de cuánto vendes.", required: true },
      { label: "Tus ventas de un mes normal", detail: "Cuántas unidades vendes. Si no lo sabes, anótalo como supuesto.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribió la IA y lo que calcula la hoja",
      purpose: "Ver cómo sumar el margen al costo da un precio menor y un margen real distinto del deseado.",
      columns: ["Concepto", "Lo que escribió la IA", "Lo que calcula la hoja"],
      rows: [
        ["Precio", f(PRECIO_INGENUO), f(PRECIO_OBJ)],
        ["Ganancia por caja", f(GANANCIA_INGENUA), f(GANANCIA)],
        ["Margen real sobre el precio", `${f(MARGEN_INGENUO)} %`, `${MARGEN_DESEADO} %`],
      ],
      note: `Ejemplo ilustrativo, escrito a propósito. La IA sumó el ${MARGEN_DESEADO} % al costo, que es un recargo, y no lo calculó sobre el precio: cobrarías ${f(DIFERENCIA)} de menos por caja.`,
    },
    hoja: {
      caption: "Las fórmulas de cada celda, en español y en inglés",
      purpose: "Saber qué escribir en cada celda y cómo probarlo con números sencillos antes de usar tus costos.",
      columns: ["Celda", "Qué calcula", "Fórmula en español", "Fórmula en inglés", "Comprobación con números de práctica"],
      rows: FORMULAS.map((x) => [x.celda, CUENTAS[x.cuenta], x.es, x.en, x.prueba]),
      note: "Ejemplo generado. Según tu región, los argumentos se separan con punto y coma o con coma.",
    },
    calculadora: {
      caption: "Calculadora de costo y precio con el caso de la galletería",
      purpose: "Tener una hoja que suma el costo completo y da el precio objetivo, lista para pegar en la celda A1 y cambiar por tus datos.",
      columns: ["Concepto", "Dato", "Resultado"],
      rows: [
        ["Galletas por tanda", String(GALLETAS_TANDA), "—"],
        ["Galletas por caja", String(GALLETAS_CAJA), "—"],
        ["Cajas por tanda", "—", "=B2/B3"],
        ["Ingredientes por tanda", String(ING_TANDA), "=B5/C4"],
        ["Caja y etiqueta (por caja)", String(EMPAQUE), "=B6"],
        ["Minutos de trabajo por tanda", String(MIN_TANDA), "—"],
        ["Valor de una hora de trabajo", String(HORA), "—"],
        ["Mano de obra por caja", "—", "=B7/60*B8/C4"],
        ["Gastos fijos del mes", String(FIJOS_MES), "—"],
        ["Cajas vendidas al mes (supuesto)", String(CAJAS_MES), "—"],
        ["Gastos fijos por caja", "—", "=B10/B11"],
        ["Costo total por caja", "—", "=C5+C6+C9+C12"],
        ["Margen deseado sobre el precio (%)", String(MARGEN_DESEADO), "—"],
        ["Precio objetivo", "—", "=C13*100/(100-B14)"],
        ["Ganancia por caja", "—", "=C15-C13"],
        ["Recargo sobre el costo (%)", "—", "=REDONDEAR(C16/C13*100;1)"],
        ["Precio elegido", String(PRECIO_ELEGIDO), "—"],
        ["Margen real con el precio elegido (%)", "—", "=REDONDEAR((B18-C13)/B18*100;1)"],
      ],
      copyable: true,
      note: "Cambia los datos de la columna B por los tuyos. El precio elegido es tu decisión: empieza igualándolo al objetivo y pruébalo después.",
    },
    escenarios: {
      caption: "Escenarios propuestos por el prompt",
      purpose: "Saber qué celda cambiar y qué mirar para probar cada «qué pasa si», sin que la IA calcule.",
      columns: ["Escenario", "Celda y valor nuevo", "Qué mirar en la hoja"],
      rows: ESCENARIOS.map((e) => [e.nombre, e.celdas, e.mirar]),
      note: "Ejemplo generado. La IA propone las celdas; los resultados salen de la hoja, en la tabla siguiente.",
    },
    resultados: {
      caption: "Resultado de cada escenario, calculado en la hoja",
      purpose: "Ver cuánto se mueve tu margen con cada cambio, con el precio elegido sin tocar.",
      columns: ["Escenario", "Costo total por caja", `Margen real con el precio de ${PRECIO_ELEGIDO}`, `Precio para mantener el ${MARGEN_DESEADO} %`],
      rows: [
        ["Caso base", f(COSTO), `${f(MARGEN_ELEGIDO)} %`, f(PRECIO_OBJ)],
        ...ESCENARIOS.map((e) => [e.nombre, ...resultado(e.ing, e.cajas)]),
      ],
      copyable: true,
      note: "Ejemplo con datos ficticios. Con costo mayor, el precio para mantener el margen sube; qué precio cobrar sigue siendo decisión de la dueña.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cinco de los siete pasos llevan un prompt. El primero y el último los haces tú solo.",
    steps: [
      { title: "Reúne tus costos y tus tiempos", description: "Junta facturas, cronometra una tanda y anota tus gastos del mes.", output: "Datos con su origen." },
      { title: "Arma tu hoja de cálculo", description: "Con el prompt de fórmulas, o copiando la calculadora, deja una hoja que calcule.", output: "Una hoja que funciona con números de práctica." },
      { title: "Ordena tus costos con la entrevista", description: "Deja que la IA te pregunte de una en una y marque qué es verificado y qué es supuesto.", output: "Una tabla de costos con origen y estado." },
      { title: "Pide la lectura de la hoja", description: "Entrega la hoja y pide qué dicen los números, qué suponen y qué queda por aclarar.", output: "Una lectura sin veredictos." },
      { title: "Contrasta con la hoja y corrige", description: "Compara cada cifra y cada base, puntúa con la rúbrica y pide cambiar solo lo señalado.", output: "La lectura corregida." },
      { title: "Prueba escenarios", description: "Pide qué celdas cambiar para cada «qué pasa si» y léelos en la hoja.", output: "Una tabla de escenarios." },
      { title: "Decide y verifica", description: "Elige el precio tú, compáralo con lo que pagan tus clientes y confirma con un profesional lo que corresponda.", output: "Un precio decidido." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    formulas: {
      title: "Prompt de fórmulas: armar tu hoja sin compartir datos",
      objective: "Obtener las fórmulas de la calculadora a partir de la descripción de tus columnas, sin mostrar ninguno de tus costos.",
      whenToUse: "Cuando quieres construir la hoja tú mismo o adaptar la calculadora a tus columnas.",
      variables: [
        { name: "PROGRAMA", description: "La hoja de cálculo que usas.", example: "Google Sheets" },
        {
          name: "COLUMNAS_Y_CELDAS",
          description: "Letra y contenido de cada columna o celda que ya tienes.",
          example: "A: concepto · B: dato que escribo · C: resultado · B2 y B3: galletas por tanda y por caja · B5 a B8, B10 y B11: datos de costo y ventas · B14: margen deseado · B18: precio elegido",
        },
      ],
      prompt: `Eres un asistente que ayuda con hojas de cálculo a personas que apenas empiezan. Hablarás con la dueña o el dueño de un negocio pequeño, que escribirá cada fórmula con sus propias manos. Tu misión es proponerle las fórmulas de una calculadora de costo y precio usando únicamente la descripción de sus celdas, sin conocer sus cifras reales.

### CONTEXTO
Programa: {{PROGRAMA}}

### DATOS
Cómo está armada mi hoja (celda o columna y lo que contiene):
{{COLUMNAS_Y_CELDAS}}

### CUENTAS QUE NECESITO
${LISTA_CUENTAS}

### REGLAS
1. Trabaja solo con las celdas que describí. Si para una cuenta falta una celda, escribe [FALTA: la celda]; no la crees por tu cuenta.
2. No pidas mis costos ni mis ventas. Para probar cada fórmula usa números redondos que pueda resolver mentalmente.
3. Los porcentajes están como enteros (40 significa 40 %): úsalos tal cual y divide entre 100 solo cuando la cuenta lo pida.
4. Da cada fórmula con las funciones en español y en inglés, y avísame de que el separador de argumentos depende de la región configurada.
5. No mezcles margen y recargo: el margen es sobre el precio y el recargo, sobre el costo. Añade una frase simple por fórmula; si dudas del nombre de una función en mi programa, dilo.

### FORMATO DE SALIDA
Una tabla de columnas fijas: Celda | Qué calcula | Fórmula en español | Fórmula en inglés | Comprobación con números de práctica. Debajo, «Cómo pegarla», con el lugar de cada fórmula. La tabla fija la forma; el contenido sale de mis celdas.

### ANTES DE RESPONDER
Comprueba que: cada fórmula responde a la cuenta escrita arriba; la comprobación con números de práctica es correcta (haz la cuenta dos veces); no usaste celdas que no describí; el precio objetivo sale de dividir el costo entre lo que queda tras el margen y no de sumarle el margen. Corrige lo que falle.`,
      explanation: [
        {
          part: "…sin conocer sus cifras reales.",
          why: "Le describes la estructura, no tus costos: construyes el cálculo sin compartir nada de tu negocio.",
        },
        {
          part: "No mezcles margen y recargo: el margen es sobre el precio y el recargo, sobre el costo.",
          why: "Es el error más común al fijar un precio, y aquí queda prohibido por escrito.",
        },
        {
          part: "Para probar cada fórmula usa números redondos que pueda resolver mentalmente.",
          why: "Puedes verificar cada fórmula con cuentas propias antes de usar tus costos.",
        },
      ],
      evaluate: "Escribe cada fórmula con los números de práctica: el resultado debe coincidir con la última columna.",
      improve: "Si tu programa no reconoce una función, pega su mensaje de error y pide la alternativa.",
      warnings: ["Con coma decimal, los argumentos suelen separarse con punto y coma."],
    },

    costos: {
      title: "Prompt de costos: que la IA te entreviste",
      objective: "Ordenar tus costos con preguntas de una en una, marcando el origen de cada dato y qué es un supuesto.",
      whenToUse: "Cuando tienes tus costos dispersos o no sabes qué incluir, antes de llenar la hoja.",
      variables: [
        { name: "PRODUCTO", description: "Qué vas a ponerle precio.", example: "Una caja de 6 galletas artesanales" },
        { name: "LO_QUE_TENGO", description: "Lo que ya tienes anotado; si nada, escribe «nada».", example: "Facturas de harina y mantequilla del mes" },
      ],
      prompt: `Actúa como un entrevistador que ayuda a un negocio pequeño a ordenar los costos de un producto. Tu destinatario es la persona dueña, que conoce su trabajo pero nunca lo puso por escrito. Tu objetivo es completar la tabla de costos usando SOLO lo que yo te diga, y marcar qué es un dato y qué es un supuesto.

### CONTEXTO
Producto: {{PRODUCTO}}
Lo que ya tengo anotado (puede estar vacío):
{{LO_QUE_TENGO}}

### COSTOS A COMPLETAR (en este orden)
${LISTA_COSTOS}

### REGLAS
1. Pregúntame de a UNA cosa y espera mi respuesta. Máximo 10 preguntas; no repitas lo que ya está en CONTEXTO.
2. Para cada dato pregúntame de dónde sale (factura, cronómetro, recibo, estimación mía). Si es una estimación, márcalo «Supuesto»; si no lo sé, [FALTA: el dato].
3. No me sugieras cantidades, precios ni porcentajes habituales de mi rubro, y no me digas qué precio poner.
4. Si me olvido de un costo, pregúntame por él («¿cuentas tu tiempo?», «¿y el empaque?») sin darle un valor.
5. Si dos respuestas se contradicen, cita las dos frases y pídeme que elija.
6. Separa siempre lo que yo dije de lo que tú supones o sugieres, y no presentes una suposición como si fuera un dato.
7. No opines sobre contabilidad ni impuestos; si tengo dudas, dime que consulte a un profesional.

### FORMATO DE SALIDA
Al terminar (o al llegar a 10 preguntas), una tabla con columnas fijas: Costo | Dato (con mis palabras) | De dónde sale | Estado. El estado es «Verificado» o «Supuesto». Después, «Pendiente»: cada [FALTA] y cómo podría conseguirlo. La tabla define la forma; el contenido lo pongo yo.

### ANTES DE RESPONDER
Verifica que: están todos los costos, en el orden indicado; cada dato usa mis palabras y mis cifras; ningún dato apareció sin que yo lo dijera; cada «Verificado» tiene un origen que yo indiqué; toda estimación está marcada como «Supuesto». Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo copiar cada dato en la columna B de mi hoja y anotar qué celdas son supuestos.`,
      explanation: [
        {
          part: "No me sugieras cantidades, precios ni porcentajes habituales de mi rubro…",
          why: "Un costo «habitual» que no es el tuyo hace que toda la hoja calcule sobre un dato ajeno.",
        },
        {
          part: "Si me olvido de un costo, pregúntame por él… sin darle un valor.",
          why: "Te recuerda lo que suele olvidarse, como tu tiempo o el empaque, sin decidir por ti.",
        },
        {
          part: "…márcalo «Supuesto»; si no lo sé, [FALTA: el dato].",
          why: "Separa lo que comprobaste de lo que estimaste, para saber qué escenarios probar.",
        },
      ],
      evaluate: "Comprueba que cada dato usa tus palabras y que lo que estimaste dice «Supuesto».",
      improve: "Si una respuesta quedó vaga, contesta con la cifra exacta y pide reescribir esa fila.",
      conversation: [
        { who: "ia", text: `Primera pregunta: ¿cuántas galletas salen de una tanda y cuántas lleva cada caja?` },
        { who: "tu", text: `Salen ${GALLETAS_TANDA} galletas y cada caja lleva ${GALLETAS_CAJA}.` },
        { who: "ia", text: "Anotado. ¿Cuánto te costaron los ingredientes de la última tanda y de dónde sale ese dato?" },
      ],
      warnings: ["No pegues datos personales de clientes ni de proveedores."],
    },

    lectura: {
      title: "Prompt de lectura: qué dicen los números de la hoja",
      objective: "Obtener una explicación sencilla de lo que dice la hoja, lo que supone y lo que no dice, sin recalcular ni decidir por ti.",
      whenToUse: "Cuando tu hoja está completa y probada con números de práctica.",
      variables: [
        { name: "NEGOCIO", description: "Tu negocio, en una frase.", example: "Galletería artesanal por encargo" },
        { name: "PRODUCTO", description: "El producto al que le pones precio.", example: "Caja de 6 galletas" },
        { name: "DECISION", description: "Lo que tienes que decidir.", example: "Qué precio cobrar por la caja" },
        { name: "HOJA", description: "La tabla de la hoja, con sus datos y sus resultados.", example: "La tabla de la calculadora, ya con tus datos" },
      ],
      prompt: `Actúa como analista de costos para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá el precio ella misma. Tu objetivo es explicar en palabras simples lo que dicen los números de su hoja y lo que no dicen, sin recalcular y sin decidir por ella.

### CONTEXTO
Mi negocio: {{NEGOCIO}}
Producto: {{PRODUCTO}}
Decisión que debo tomar: {{DECISION}}

### DATOS (la hoja es la única fuente de cifras)
{{HOJA}}

### REGLAS
1. No recalcules ni redondees: copia cada cifra con su unidad y su base tal como está en la hoja.
2. Cada porcentaje dice su base: el margen se calcula sobre el precio; el recargo, sobre el costo.
3. No afirmes que un precio o un margen es rentable, suficiente, bueno ni seguro, y no recomiendes un precio: la decisión es mía.
4. Nombra cada supuesto que usa la hoja, como las ventas del mes o el valor de mi hora.
5. No compares con precios de otros negocios ni digas qué es habitual en mi rubro: no tienes esos datos.
6. Si falta un dato o dos cifras se contradicen, avísame antes de escribir y marca [FALTA: el dato].
7. Distingue lo que sale de la hoja de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) «Lo que dice la hoja»: una lista con cada cifra, su unidad y su base; (2) «Lo que supone la hoja»; (3) «Lo que la hoja no dice»; (4) «Preguntas para aclarar antes de decidir»; (5) «FALTA». El formato define la forma; el contenido sale de mi hoja.

### ANTES DE RESPONDER
Verifica que: cada cifra es idéntica a la de la hoja; cada porcentaje dice su base; ninguna frase afirma que el precio es rentable o suficiente ni recomienda uno; están nombrados los supuestos; no comparaste con otros negocios. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que debo contrastar cada cifra con mi hoja y puntuar tu respuesta con la rúbrica.`,
      explanation: [
        {
          part: "No recalcules ni redondees: copia cada cifra con su unidad y su base…",
          why: "Separa el cálculo, que hace la hoja, de la explicación, que hace la IA.",
        },
        {
          part: "No afirmes que un precio o un margen es rentable, suficiente, bueno ni seguro…",
          why: "La IA no conoce tus ventas ni tus clientes: no puede saberlo.",
        },
        {
          part: "«Preguntas para aclarar antes de decidir»",
          why: "Convierte cada duda en una tarea tuya, en lugar de una suposición escondida.",
        },
      ],
      evaluate: "Contrasta cada cifra y cada base con tu hoja, y puntúa con la rúbrica.",
      improve: "Si suena genérica, aclara la decisión que tomas en DECISION; no le añadas datos.",
      warnings: ["Es un borrador de lectura: no decide el precio y puede equivocarse al explicar."],
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo lo señalado",
      objective: "Corregir únicamente las frases con problema, con cifras y bases de la hoja, y dejar intacto el resto.",
      whenToUse: "Después de contrastar la lectura, cuando alguna frase tiene un problema.",
      variables: [
        { name: "PROBLEMAS", description: "Las frases con problema y su motivo.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Cifras o frases que no se pueden cambiar.", example: "La hoja y las cifras" },
      ],
      prompt: `Actúa como editor de lecturas de costos para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO las frases señaladas, usando solo la hoja, y dejar intacto lo demás.

### CONTEXTO
Usa la hoja y la lectura de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Problemas que detecté (frase y motivo):
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo las frases señaladas y lo que su cambio obligue a ajustar. No modifiques la hoja, las cifras ni las frases correctas.
2. Para cada corrección usa solo cifras de la hoja, con su base. Si falta el dato, escribe [FALTA: el dato] en lugar de inventarlo.
3. Si quitas una frase sin respaldo, no la sustituyas por otra parecida: quítala o deja solo la parte que la hoja respalda.
4. Si un problema que te señalé no existe en la hoja, o la hoja se contradice, dímelo antes de cambiar nada.
5. No añadas cifras, comparaciones ni recomendaciones de precio.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla con columnas fijas Antes | Después | Motivo, con solo la frase que cambia, para que yo la sustituya en mi lectura; (2) «Sin cambios»: las secciones que no toqué; (3) «FALTA» con cada [FALTA]. La tabla define la forma; el contenido sale de mi lectura.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada corrección usa cifras y bases de la hoja; no apareció ninguna cifra nueva; las secciones sin cambios están idénticas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo las frases señaladas…",
          why: "Evita que rehaga frases y cifras que ya coincidían con la hoja.",
        },
        {
          part: "Si quitas una frase sin respaldo, no la sustituyas por otra parecida…",
          why: "Evita cambiar un veredicto por otro igual de infundado.",
        },
        {
          part: "Si un problema que te señalé no existe… dímelo antes de cambiar nada.",
          why: "Evita corregir a ciegas un problema que tú mismo pudiste marcar mal.",
        },
      ],
      evaluate: "Sustituye las frases y vuelve a contrastar con tu hoja: las demás cifras deben seguir idénticas.",
      improve: "Si la corrección mezcla cifras, pega de nuevo la hoja y pide repetir solo esa frase.",
    },

    escenarios: {
      title: "Prompt de escenarios: qué pasa si cambia un costo",
      objective: "Saber qué celdas de la hoja cambiar para cada «qué pasa si», sin que la IA calcule los resultados.",
      whenToUse: "Cuando la lectura está corregida y quieres ver cuánto depende tu margen de un supuesto.",
      variables: [
        { name: "CAMBIOS", description: "Los «qué pasa si» que quieres probar, con su porcentaje o su cifra.", example: `Ingredientes +${AUMENTO_ING} %; ventas de ${CAJAS_BAJA} cajas al mes; las dos cosas a la vez` },
        { name: "CELDAS_DE_DATOS", description: "Qué celda guarda cada dato de tu hoja.", example: "B5: ingredientes por tanda · B11: cajas vendidas al mes" },
      ],
      prompt: `Actúa como asistente de análisis para un negocio pequeño. Tu destinatario es la persona dueña, que probará cada escenario en su propia hoja. Tu objetivo es decirle qué celdas cambiar y qué mirar para cada «qué pasa si», sin calcular los resultados.

### CONTEXTO
Usa la hoja y la lectura de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Cambios que quiero probar:
{{CAMBIOS}}

Dónde está cada dato en mi hoja:
{{CELDAS_DE_DATOS}}

### REGLAS
1. Usa solo los cambios que te di: no inventes escenarios ni porcentajes «típicos».
2. Para cada cambio di la celda de datos que se modifica y su valor nuevo. Si es un porcentaje, muestra la cuenta.
3. No calcules costos, márgenes ni precios: eso lo hace la hoja.
4. Si un cambio afecta más de una celda, lístalas todas. Si no corresponde a ninguna celda de datos, dilo y no lo inventes.
5. No afirmes que un escenario sea bueno o malo para el negocio: solo qué mirar.
6. Distingue lo que sale de mis datos de lo que supones o sugieres.

### FORMATO DE SALIDA
En este orden: (1) una tabla con columnas fijas: Escenario | Celda y valor nuevo | Qué mirar en la hoja; (2) «Cómo probarlo»: pasos para cambiar la celda, leer el resultado y volver al valor original; (3) «Preguntas para aclarar». La tabla define la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: solo hay escenarios que yo pedí; cada valor nuevo es el dato de mi hoja más o menos el cambio indicado (recalcula esa cuenta dos veces); no aparece ningún costo, margen ni precio calculado; cada cambio tiene sus celdas. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Usa solo los cambios que te di: no inventes escenarios ni porcentajes «típicos».",
          why: "Una subida «típica» que no es la tuya te haría probar un mundo que no existe.",
        },
        {
          part: "No calcules costos, márgenes ni precios: eso lo hace la hoja.",
          why: "Deja el cálculo donde se puede comprobar.",
        },
        {
          part: "No afirmes que un escenario sea bueno o malo para el negocio…",
          why: "Evaluar un escenario exige conocer tus ventas y tus clientes, y eso lo sabes tú.",
        },
      ],
      evaluate: "Cambia cada celda en tu hoja y comprueba que el valor nuevo es el que la tabla dice.",
      improve: "Si un cambio quedó sin celda, aclara en CELDAS_DE_DATOS dónde vive ese dato.",
      warnings: ["Puede equivocarse al calcular el valor nuevo: comprueba esa cuenta en tu hoja."],
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de lectura a la hoja de la galletería. La tuya será distinta.",
    parts: [
      { type: "text", text: "**Lo que dice la hoja.**" },
      { type: "list", items: LECTURA_PRIMERA },
      { type: "text", text: `**Lo que supone la hoja.** ${SUPUESTOS}` },
      { type: "text", text: `**Lo que la hoja no dice.** ${NO_DICE}` },
      { type: "text", text: `**Preguntas para aclarar antes de decidir.** ${PREGUNTAS_LECTURA}` },
      { type: "text", text: "**FALTA:** ninguno." },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "lectura",
    title: "Puntúa una lectura",
    intro:
      `Puntúa la lectura en los cinco criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[2].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      "La lectura es clara y sus cifras se parecen a las de la hoja. Para saber si lo son, se contrasta cada una y se puntúa con la rúbrica. " +
      `En este ejemplo el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "cifras",
        verdict: vered("cifras"),
        comment: "El costo, el precio objetivo, la ganancia y el recargo son los de la hoja, con sus unidades.",
      },
      {
        criterionId: "bases",
        verdict: vered("bases"),
        comment: `«${FRASE_BASE_ERR}» describe un ${MARGEN_DESEADO} % sobre el costo. En la hoja es sobre el precio: ${GANANCIA} de ${PRECIO_ELEGIDO}. Sobre el costo, la ganancia es ${f(RECARGO)} %.`,
      },
      {
        criterionId: "veredicto",
        verdict: vered("veredicto"),
        comment: `«${cap1(FRASE_IMPREVISTOS)}» sugiere que el margen alcanza para algo. La hoja no dice eso, y el prompt pide no afirmar que un margen sea suficiente.`,
      },
      {
        criterionId: "supuestos",
        verdict: vered("supuestos"),
        comment: "Nombra las ventas del mes y el valor de la hora.",
      },
      {
        criterionId: "preguntas",
        verdict: vered("preguntas"),
        comment: "Cierra con tres preguntas para aclarar antes de decidir.",
      },
    ],
    conclusion: "Es un buen borrador: las cifras son las de la hoja. Dos detalles habrían pasado por buenos al leerlo rápido, y solo se ven contrastando cada frase.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir dos frases, no rehacer la lectura ni tocar la hoja.",
    promptId: "ajuste",
    why: "El contraste señaló una base mal descrita y una frase de suficiencia. El prompt limita el cambio a lo señalado, pide usar solo cifras y bases de la hoja y separa lo cambiado de lo que sigue igual.",
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
        text: `**Sin cambios:** costo, precio objetivo, ganancia, recargo, supuestos, lo que la hoja no dice y las preguntas. **FALTA:** ninguno. Al repetir el contraste con las dos frases corregidas, la rúbrica suma ${MAXIMO} de ${MAXIMO}.`,
      },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Contar solo los ingredientes",
      whyItHurts: "El precio termina pagando los materiales y no tu tiempo ni el alquiler, y la ganancia aparente no existe.",
      instead: "Suma empaque, tu hora y una parte de los gastos fijos al costo de cada unidad.",
    },
    {
      title: "Sumar el margen al costo",
      whyItHurts: "Un 40 % sumado al costo deja un margen real menor, y la diferencia se pierde en cada venta.",
      instead: "Calcula el precio como costo × 100 ÷ (100 − margen) y comprueba el margen real en la hoja.",
    },
    {
      title: "Dar por cierto un volumen de ventas",
      whyItHurts: "Los gastos fijos por unidad dependen de cuántas vendes: si vendes menos, cada unidad carga más costo.",
      instead: "Anótalo como supuesto y pruébalo con un escenario.",
    },
    {
      title: "Preguntarle a la IA si el precio es rentable",
      whyItHurts: "Puede responder con seguridad sin conocer tus ventas, tus clientes ni tus gastos reales.",
      instead: "Pídele que explique los números y que deje preguntas; la decisión es tuya.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de fijar el precio, repasa esta lista. Marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Cada dato de la hoja tiene su origen, y los supuestos están marcados como supuestos." },
      { label: "Puse un valor a mi hora de trabajo, aunque hoy no me la pague, y sé que ese valor es una decisión mía." },
      { label: "Comprobé una fila de la hoja con una calculadora aparte." },
      { label: "Comparé el precio con lo que pagan mis clientes y con lo que cobran otros negocios, que la hoja no sabe." },
      { label: "Probé qué pasa con mi margen si suben los costos o bajan las ventas." },
      {
        label: "Consulté a un profesional cómo tratan mi país y mi rubro los impuestos y los precios.",
        detail: "Cambian de un lugar a otro y aquí no se cubren.",
      },
      { label: "Entiendo que el margen es un cálculo con supuestos y no una garantía de ganancia." },
    ],
    principle: "La IA explica y pregunta. El precio es una decisión tuya.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con el precio decidido, la hoja se mantiene viva.",
    steps: [
      { title: "Anota tus ventas reales cada mes", detail: "Compáralas con el supuesto de la hoja." },
      { title: "Actualiza la hoja cuando cambie un costo", detail: "Un proveedor nuevo, un alquiler distinto o el valor de tu hora." },
      { title: "Guarda cada versión con su fecha", detail: "Así sabes con qué costos se fijó cada precio." },
      { title: "Repite el método con cada producto", detail: "Cada uno con su hoja; los gastos fijos los repartes tú entre ellos." },
      { title: "Anota lo que decidiste y por qué", detail: "Te ayudará a revisar tu precio con datos, no de memoria." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena tu precio, pero tiene límites.",
    items: [
      { title: "No decide el precio", detail: "Conocer el costo no dice cuánto pagarían tus clientes: eso lo sabes tú." },
      { title: "No conoce tus ventas", detail: "El margen que sale depende de supuestos como el volumen del mes." },
      { title: "No reparte tus gastos fijos", detail: "Si vendes varios productos, decides cuánto de cada gasto le toca a cada uno." },
      { title: "No da asesoría contable ni tributaria", detail: "Los impuestos y las reglas de precios cambian según el país: pregunta a un profesional." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Un buen precio nace de conocer tu costo completo y de saber cuánto depende tu margen de tus supuestos. Con una hoja que calcula, una IA que explica sin veredictos y una decisión que sigue siendo tuya, ponerle precio deja de ser una costumbre y se vuelve un cálculo que puedes revisar.",
    takeaways: [
      "Cuenta el costo completo: materiales, empaque, tu tiempo y gastos fijos.",
      "Distingue margen (sobre el precio) de recargo (sobre el costo).",
      "Marca los supuestos y pruébalos con escenarios.",
      "Compara con tus clientes antes de fijar el precio.",
    ],
    nextGuide: "crear-promociones-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "hoja-de-calculo", "costo-fijo", "recargo", "rubrica"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Debo ponerle valor a mi propio tiempo?",
      answer: "Conviene: si no, el precio paga tus ingredientes y no tu trabajo. El valor de tu hora lo decides tú; lo importante es que aparezca en la hoja.",
    },
    {
      question: "¿Qué margen es el correcto?",
      answer: "No hay una cifra universal: depende de tu negocio, tus gastos y lo que puedes cobrar. La hoja muestra el margen que resulta; el que deseas lo decides tú.",
    },
    {
      question: "¿Puedo copiar el precio de la competencia?",
      answer: "Puedes usarlo como referencia, después de calcular tu costo. Así sabes cuánto ganarías o perderías con ese precio.",
    },
    {
      question: "¿Cada cuánto actualizo la hoja?",
      answer: "Cuando cambie un costo importante o compruebes que tus ventas reales difieren del supuesto.",
    },
  ],
});

function cap1(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
