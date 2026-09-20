import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * analisis/analizar-ventas-con-ia (regenerada al estándar v3)
 *
 * Tipo: números y datos (`handlesNumbers`). Todo el caso (Verde Hogar, sus productos, ventas y sucesos) es
 * FICTICIO. Cada cifra se calcula en este archivo con las mismas cuentas de la hoja y se verificó con código aparte,
 * evaluando las fórmulas ES/EN tal como se pegan sobre una hoja de ventas generada para la comprobación (ver
 * README.md). Las respuestas de la IA son EJEMPLOS GENERADOS: redactados aplicando literalmente cada prompt; no
 * proceden de una conversación real ni de una prueba del autor (esas viven en `evidence.pruebas`, que solo rellena
 * el autor). El pedido ingenuo, con sus cifras erradas a propósito, es ILUSTRATIVO.
 *
 * Fuente única de verdad: los productos y sus unidades y precios (PRODUCTOS), los días y compras por mes, los
 * criterios (CRITERIOS), los umbrales (RESULTADOS), los puntajes (PUNTAJES) y las cuentas (CUENTAS) se definen UNA vez
 * y los leen la hoja, las tablas, los prompts, los ejemplos y la rúbrica. Convención: cifras sin separador de miles
 * ($1119) y con coma decimal ($11,88).
 */
const slot = guideSlots("analisis", "analizar-ventas-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const MESES = ["Julio", "Agosto", "Septiembre"] as const;
const DIAS_ABIERTOS = [31, 31, 27];
const COMPRAS = [80, 92, 78];
const PRODUCTOS: { n: string; precio: number[]; uds: number[] }[] = [
  { n: "Monstera", precio: [20, 20, 20], uds: [12, 15, 9] },
  { n: "Helecho", precio: [8, 8, 8], uds: [20, 18, 17] },
  { n: "Pack de suculentas", precio: [12, 12, 12], uds: [25, 30, 24] },
  { n: "Maceta", precio: [6, 5, 6], uds: [30, 48, 31] },
  { n: "Fertilizante", precio: [5, 5, 5], uds: [14, 15, 15] },
];
const coma = (n: number, d: number) => n.toFixed(d).replace(".", ",");
const con = (x: number) => `${x >= 0 ? "+" : "−"}${coma(Math.abs(x) * 100, 1)} %`;
const sin = (x: number) => `${coma(x * 100, 1)} %`;
const ingreso = (p: (typeof PRODUCTOS)[number], m: number) => p.precio[m] * p.uds[m];
const P = (nombre: string) => PRODUCTOS.find((p) => p.n === nombre)!;
const TOT_MES = MESES.map((_, m) => PRODUCTOS.reduce((n, p) => n + ingreso(p, m), 0));
const TOT_PROD = PRODUCTOS.map((p) => MESES.reduce((n, _, m) => n + ingreso(p, m), 0));
const TOTAL = TOT_MES.reduce((a, b) => a + b, 0);
const TICKET = TOT_MES.map((t, m) => t / COMPRAS[m]);
const TICKET_TOTAL = TOTAL / COMPRAS.reduce((a, b) => a + b, 0);
const POR_DIA = TOT_MES.map((t, m) => t / DIAS_ABIERTOS[m]);
const VAR_MES = [1, 2].map((m) => TOT_MES[m] / TOT_MES[m - 1] - 1);
const VAR_DIA = [1, 2].map((m) => POR_DIA[m] / POR_DIA[m - 1] - 1);
const SEP_VS_JUL_DIA = POR_DIA[2] / POR_DIA[0] - 1;
const CAIDA_SEP = TOT_MES[1] - TOT_MES[2];
const monstera = P("Monstera"), maceta = P("Maceta");
const MAC_UDS = maceta.uds[1] / maceta.uds[0] - 1;
const MAC_ING = ingreso(maceta, 1) / ingreso(maceta, 0) - 1;
const mes3 = (f: (m: number) => string) => MESES.map((_, m) => f(m));
const listaMeses = (f: (m: number) => string) => `${f(0)}, ${f(1)} y ${f(2)}`;

/* lo que pasó en cada periodo (el contexto que solo el negocio conoce) */
const CONTEXTO = "Agosto: la maceta costó $5 en lugar de $6 todo el mes. Septiembre: tienda cerrada 3 días por una reforma (27 días abiertos), sin promoción. No se registró si hubo faltantes de stock.";

/* cuentas de la hoja y fórmulas */
const CUENTAS: [donde: string, que: string, detalle: string][] = [
  ["Ventas!E", "Total de una venta", "unidades por precio"],
  ["Ventas!F", "Mes de una venta", "el número del mes de la fecha"],
  ["Resumen!B2:D6", "Ventas de un producto en un mes", "la suma de los totales de Ventas con ese producto y ese mes"],
  ["Resumen!B7:D7", "Total de ventas de un mes", "la suma de los cinco productos de ese mes"],
  ["Resumen!E2:F6", "Total de un producto y % del total", "la suma de sus tres meses, y ese total dividido entre el total general de E7"],
  ["Resumen!B9:E9", "Ticket promedio", "las ventas divididas entre las compras"],
  ["Resumen!C10:D10", "Variación frente al mes anterior", "el mes nuevo dividido entre el mes anterior, menos 1"],
  ["Resumen!B12:D12", "Ventas por día abierto", "las ventas del mes divididas entre sus días abiertos"],
  ["Resumen!C13:D13", "Variación por día abierto", "las ventas por día abierto nuevas divididas entre las anteriores, menos 1"],
  ["Resumen!B14", "Control", "el total por producto (E7) menos la suma de los totales por mes; debe dar 0"],
];
const LISTA_CUENTAS = CUENTAS.map(([d, q, t], i) => `${i + 1}. ${q} (${d}): ${t}.`).join("\n");
const RNG = (c: string) => `Ventas!$${c}$2:$${c}$1000`;
const ARGS_SUMIFS = [RNG("E"), RNG("B"), "$A2", RNG("F"), "B$1"];
const FORMULAS: { celda: string; es: string; en: string; prueba: string }[] = [
  { celda: "Ventas!E2", es: "=C2*D2", en: "=C2*D2", prueba: "3 unidades a 4: 12" },
  { celda: "Ventas!F2", es: "=MES(A2)", en: "=MONTH(A2)", prueba: "Una fecha del 15 de agosto: 8" },
  {
    celda: "Resumen!B2",
    es: `=SUMAR.SI.CONJUNTO(${ARGS_SUMIFS.join(";")})`,
    en: `=SUMIFS(${ARGS_SUMIFS.join(",")})`,
    prueba: "Monstera 20 y 30 en el mes 7, y Helecho 5 en el mes 7: 50",
  },
  { celda: "Resumen!B7", es: "=SUMA(B2:B6)", en: "=SUM(B2:B6)", prueba: "10, 20, 5, 0 y 15: 50" },
  { celda: "Resumen!F2", es: "=E2/$E$7", en: "=E2/$E$7", prueba: "E2 30 y E7 120: 0,25" },
  { celda: "Resumen!B9", es: "=B7/B8", en: "=B7/B8", prueba: "950 entre 80 compras: 11,875" },
  { celda: "Resumen!C10", es: "=C7/B7-1", en: "=C7/B7-1", prueba: "100 y luego 120: 0,2" },
  { celda: "Resumen!B12", es: "=B7/B11", en: "=B7/B11", prueba: "930 entre 31 días: 30" },
  { celda: "Resumen!C13", es: "=C12/B12-1", en: "=C12/B12-1", prueba: "30 y luego 36: 0,2" },
  { celda: "Resumen!B14", es: "=E7-SUMA(B7:D7)", en: "=E7-SUM(B7:D7)", prueba: "E7 200 y B7:D7 100, 60 y 40: 0" },
];

/* tablas de hipótesis */
const COLUMNAS_HIP = ["Observación (de mi resumen)", "Hipótesis (no causa)", "Qué la apoya o la debilita", "Cómo comprobarla"];
const OBS_TOTALES = `Ventas: ${listaMeses((m) => `$${TOT_MES[m]}`)}. Septiembre es ${con(VAR_MES[1])} frente a agosto.`;
const PRIMERA_FILAS = [
  [
    `${OBS_TOTALES} La tienda estuvo cerrada tres días en septiembre.`,
    "HIPÓTESIS: la caída se explica en buena parte por el fin de la promoción de las macetas. Alternativa: los tres días de cierre.",
    `Apoya: las macetas bajaron de $${ingreso(maceta, 1)} a $${ingreso(maceta, 2)}. Debilita: el cierre también reduce las ventas.`,
    "Analizar más datos de ventas.",
  ],
  [
    `Monstera: $${ingreso(monstera, 1)} en agosto y $${ingreso(monstera, 2)} en septiembre.`,
    "HIPÓTESIS: hay menos demanda de monstera. Alternativa: faltó stock.",
    "Apoya: es el producto que más bajó.",
    "Revisar el registro de stock y sumar más meses.",
  ],
  [
    `Maceta: ${listaMeses((m) => `$${ingreso(maceta, m)}`)}. En agosto costó $${maceta.precio[1]} en lugar de $${maceta.precio[0]}.`,
    "HIPÓTESIS: el precio menor de agosto aumentó las ventas de macetas. Alternativa: agosto fue un buen mes para toda la tienda.",
    `Debilita: el helecho bajó en agosto (de $${ingreso(P("Helecho"), 0)} a $${ingreso(P("Helecho"), 1)}).`,
    "Comparar el margen de agosto con el de otros meses.",
  ],
];
const MAC_FRASE = `${con(MAC_UDS)} en unidades y ${con(MAC_ING)} en ingresos`;
const FRENTE = `septiembre ${con(VAR_DIA[1])} frente a agosto y ${con(SEP_VS_JUL_DIA)} frente a julio`;
const PROBLEMAS_TEXTO = `1) Comparas septiembre con agosto por totales, con 27 y 31 días abiertos. 2) «Se explica en buena parte» da un peso que mis datos no muestran. 3) «Analizar más datos de ventas» no dice qué dato ni qué cálculo.`;
const FINAL_FILAS = [
  [
    `${OBS_TOTALES} Por día abierto (${DIAS_ABIERTOS.join(", ")} días): ${listaMeses((m) => `$${coma(POR_DIA[m], 2)}`)}; ${FRENTE}.`,
    "A) Los tres días de cierre explican parte de la caída. B) Agosto estuvo por encima de lo normal.",
    `A se apoya: al ajustar por días abiertos, la caída pasa de ${sin(-VAR_MES[1])} a ${sin(-VAR_DIA[1])}. B se apoya si septiembre por día abierto queda cerca de julio ($${coma(POR_DIA[2], 2)} frente a $${coma(POR_DIA[0], 2)}).`,
    "Ver las ventas día por día de agosto y septiembre y comparar los días de la promoción con los demás.",
  ],
  [
    `Monstera: ${listaMeses((m) => String(monstera.uds[m]))} unidades; ingresos ${listaMeses((m) => `$${ingreso(monstera, m)}`)}.`,
    "A) Faltó stock. B) Bajó la demanda. C) El cierre afectó más a este producto.",
    "A se debilita si hubo stock todo el mes. B necesita más meses para sostenerse: con tres datos no se puede afirmar.",
    "Revisar el registro de stock y los días con existencias; añadir los próximos meses.",
  ],
  [
    `Maceta: unidades ${listaMeses((m) => String(maceta.uds[m]))}; ingresos ${listaMeses((m) => `$${ingreso(maceta, m)}`)}. En agosto, ${MAC_FRASE}.`,
    "La promoción aumentó las unidades, pero el precio menor hizo que el ingreso subiera menos.",
    "Se apoya con que en septiembre, sin promoción, vuelven al nivel de julio. No dice nada del margen.",
    "Comparar el margen de agosto con el de otros meses, con costos reales, antes de repetir la promoción.",
  ],
];

/* rúbrica */
const CRITERIOS = [
  { id: "cifras", label: "Cada cifra está en tu resumen", detail: "Las cifras coinciden con tu resumen o con los datos que le diste; ninguna es un cálculo nuevo." },
  { id: "capas", label: "Separa hechos de hipótesis", detail: "Cada explicación dice «hipótesis» y ninguna se presenta como causa ni con un peso que tus datos no muestran." },
  { id: "alternativas", label: "Ofrece alternativas", detail: "Cada observación importante tiene más de una explicación posible." },
  { id: "justa", label: "Compara de forma justa", detail: "Usa lo que pasó en el periodo y compara por días abiertos o condiciones parecidas, o pide el dato que falta." },
  { id: "comprobar", label: "Dice cómo comprobar", detail: "Cada hipótesis trae qué dato y qué cálculo la confirmarían o la descartarían, con datos que puedes conseguir." },
  { id: "limites", label: "Dice lo que no se puede afirmar", detail: "Señala los límites de los datos y no recomienda decisiones." },
] as const;
const RESULTADOS = [
  { min: 0, label: "No usar todavía", advice: "Fallan varios criterios: corrige con el prompt de ajuste o vuelve a pedirlo con más contexto." },
  { min: 7, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado antes de apoyarte en él." },
  { min: 11, label: "Lista para comprobar", advice: "Cumple casi todo: comprueba las hipótesis con tus datos antes de decidir." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { cifras: 2, capas: 1, alternativas: 2, justa: 1, comprobar: 1, limites: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "analizar-ventas-con-ia",
    category: "analisis",
    title: "Analizar tus ventas con IA sin tomar hipótesis por hechos",
    description:
      "Calcula tus totales en una hoja, usa la IA para interpretarlos y formular preguntas, y aprende a distinguir una hipótesis de una causa antes de decidir.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["numeros-datos"],
    estandarGuia: 3,
    handlesNumbers: true,
    activoOriginal:
      "Hoja de ventas y resumen copiable (fórmulas ES/EN, total de control y comparación por día abierto), mapa de preguntas y rúbrica de seis criterios con dos bloqueos",
    problem: "Tienes datos de ventas pero no sabes qué preguntas hacerles ni cómo interpretarlos con criterio.",
    whyThisPage:
      "Marca la frontera entre lo que se calcula (hoja de cálculo) y lo que se interpreta (IA) y enseña a pedir hipótesis, no causas, evitando conclusiones no comprobadas.",
    relatedGuides: ["crear-promociones-con-ia", "definir-precios-y-margenes-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Ordena tus ventas en una hoja que cuadra, pide hipótesis en lugar de causas y comprueba cada una antes de cambiar surtido, precios o promociones.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "De 2 a 3 horas la primera vez, más si tus datos están desordenados",
    needs: ["Una hoja de cálculo", "Un asistente de IA", "Las ventas de al menos tres meses", "Lo que pasó en cada mes: promociones, cierres, faltantes"],
    result: "Un resumen de ventas que cuadra, una lectura con hipótesis y la forma de comprobar cada una",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Muestra de un vistazo el punto de partida correcto: un resumen calculado en la hoja, con los totales a la vista, antes de hablar con la IA.",
      description:
        "Captura de una hoja de cálculo con la tabla resumen de un negocio: filas por producto, columnas por mes y una fila de totales resaltada con un recuadro. Debe verse que los totales son una fórmula y no un número escrito a mano. Datos ficticios y ninguna información de clientes.",
      alt: "Hoja de cálculo con una tabla resumen de ventas por producto y por mes, con la fila de totales resaltada.",
      caption: "Primero los totales, calculados en la hoja.",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "16/9",
      purpose: "Enseña qué formato deben tener los datos antes de calcular: una fila por venta, con las mismas columnas siempre. Es lo que más falla en la práctica.",
      description:
        "Dos tablas lado a lado con las mismas ventas: a la izquierda una versión desordenada (fechas escritas de distintas formas, unidades y precios en la misma celda, el mismo producto con nombres distintos) y a la derecha la versión limpia con columnas de fecha, producto, unidades, precio y total. Marcar con flechas dos correcciones. Datos ficticios sin nombres de clientes.",
      alt: "Dos tablas de ventas comparadas: una desordenada, con formatos mezclados, y otra limpia con una columna por dato.",
      caption: "El mismo contenido, desordenado y limpio.",
      zoom: true,
    }),
    resumen: slot("tabla-resumen.webp", {
      section: "hoja",
      ratio: "4/3",
      purpose: "Muestra la hoja Resumen armada, con la fórmula de una celda visible y el total de control en cero.",
      description:
        "La hoja Resumen con los cinco productos por mes, la fila de totales, las filas de compras, ticket promedio y variación, y al final la celda de control con un 0 resaltado en verde. Mostrar en la barra de fórmulas la fórmula de SUMAR.SI.CONJUNTO de una celda. Datos ficticios.",
      alt: "Hoja Resumen de ventas con una fórmula de suma condicional en la barra de fórmulas y la celda de control en cero.",
      caption: "Dos formas de sumar, un mismo total.",
      zoom: true,
    }),
    primerResultado: slot("primera-lectura.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver la primera lectura de la IA y localizar las tres frases que hay que revisar.",
      description:
        "La tabla que devolvió el asistente con tres celdas resaltadas: la comparación por totales, la frase «se explica en buena parte» y «Analizar más datos de ventas». Al lado, el resumen de Verde Hogar. Caso ficticio; ocultar datos de cuenta.",
      alt: "Tabla de observaciones e hipótesis devuelta por un asistente, con tres celdas resaltadas junto al resumen de ventas.",
      caption: "La primera lectura, con tres cosas que revisar.",
      zoom: true,
    }),
    comprobacion: slot("comprobacion-de-cifras.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a revisar una lectura de la IA contra la hoja: es la habilidad más importante de la guía y se entiende mejor viéndola hecha.",
      description:
        "Dos columnas: a la izquierda tres frases de la lectura con una cifra o un peso cada una; a la derecha la celda de la hoja que las respalda o las contradice. Marcar en verde la que coincide y en rojo las que no. Usar las cifras ficticias del caso.",
      alt: "Comparación entre frases de una lectura de la IA y las celdas de la hoja que las respaldan o las contradicen.",
      caption: "Cada frase, contra tu hoja.",
      zoom: true,
    }),
    hipotesis: slot("hipotesis-y-comprobaciones.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra el entregable final ya organizado: observaciones, hipótesis y cómo comprobarlas.",
      description:
        "La tabla final con cuatro columnas (observación, hipótesis, qué la apoya o la debilita, cómo comprobarla) y tres filas ficticias. Resaltar con un recuadro la columna «Cómo comprobarla» y con otro la palabra «hipótesis». Sin datos personales.",
      alt: "Tabla con cuatro columnas: observación de las ventas, hipótesis, qué la apoya o la debilita y cómo comprobarla.",
      caption: "Del dato a la pregunta, y de la pregunta a la comprobación.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "hoja",
      ratio: "16/9",
      promptId: "formulas",
      purpose: "Prueba real del prompt de fórmulas: la tabla de fórmulas y su comprobación con números de práctica.",
      description:
        "Captura de la tabla de fórmulas y de «Cómo pegarla». Usa solo la descripción de tus hojas y columnas, sin ventas. Ocultar datos personales y de cuenta.",
      alt: "Captura de las fórmulas de una hoja de cálculo devueltas por un asistente.",
      caption: "Prueba del prompt de fórmulas.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "principal",
      purpose: "Prueba real del prompt principal: la tabla de observaciones e hipótesis y sus apartados finales.",
      description:
        "Captura de la tabla, de «Con estos datos no se puede afirmar» y de «FALTA». Usa el resumen y el contexto del caso (o los tuyos, sin datos personales). Comprueba aparte cada cifra con tu hoja. Ocultar datos personales y de cuenta.",
      alt: "Captura de una lectura de ventas con hipótesis devuelta por un asistente.",
      caption: "Prueba del prompt principal.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "auditoria",
      purpose: "Prueba real del prompt de auditoría: la tabla de cifras con su origen y cómo recalcularlas.",
      description:
        "Captura de la tabla de auditoría y de sus apartados. Usa la lectura del caso o una tuya. Anota aparte si el asistente dio por buena una cifra que no lo era. Ocultar datos personales y de cuenta.",
      alt: "Captura de una auditoría de cifras de un análisis de ventas devuelta por un asistente.",
      caption: "Prueba del prompt de auditoría.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: la tabla corregida y lo que sigue sin poder afirmarse.",
      description:
        "Captura de la tabla corregida, de «Con estos datos no se puede afirmar» y de «FALTA». Usa PROBLEMAS y DATOS_ADICIONALES del caso. Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una lectura de ventas devuelta por un asistente.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Casi todos los negocios tienen sus ventas registradas en alguna parte, pero pocos las miran con método: se compara el total del mes «a ojo» con el anterior y se saca una conclusión.\n\nLa IA parece la ayuda ideal: pegas los datos y le preguntas qué pasó. Responde con seguridad, con porcentajes y con explicaciones, y ahí está el riesgo: puede equivocarse al sumar y **siempre puede darte una explicación que suena razonable aunque nadie la haya comprobado**. Una causa inventada con buena redacción es peor que ninguna respuesta, porque decides con ella.\n\n**La hoja calcula, la IA propone hipótesis y tú compruebas y decides.**",
    symptoms: [
      "Miras el total del mes, pero no sabes qué productos lo mueven ni qué cambió.",
      "Cuando las ventas bajan, tienes una explicación en la cabeza que nunca comprobaste.",
      "Le pegaste tus ventas a una IA y te dio un análisis que no sabes si creer.",
      "Comparas meses distintos (con más días, con una promoción, con un cierre) como si fueran iguales.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con un análisis en el que cada cifra está comprobada y cada explicación está marcada como lo que es.",
    deliverables: [
      { label: "Una hoja de ventas y resumen", detail: "Con un formato único y un resumen que cuadra." },
      { label: "Una comparación justa", detail: "Ventas por día abierto, para no comparar meses desiguales." },
      { label: "Hipótesis con forma de comprobarlas", detail: "Qué dato confirmaría o descartaría cada una." },
      { label: "Una rúbrica de seis criterios", detail: "Para revisar cualquier análisis de la IA." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Tienes ventas registradas de al menos unos meses y quieres entender qué te dicen.",
      "Sabes sumar y ordenar en una hoja de cálculo, o estás dispuesto a aprender.",
      "Quieres apoyarte en la IA sin creerte todo lo que responde.",
    ],
    notForWho: [
      "Buscas que la IA te diga qué hacer: aquí las decisiones son tuyas.",
      "No llevas ningún registro de ventas: empieza por anotarlas de forma ordenada.",
      "Necesitas contabilidad, impuestos o auditoría.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Verde Hogar (ficticio) — tienda de plantas de interior",
    situation:
      "Verde Hogar es una tienda pequeña, abierta todos los días. Tiene tres meses de ventas y en septiembre bajaron. Para el ejemplo se analizan cinco productos.",
    goal: "Entender qué cambió entre agosto y septiembre y decidir qué comprobar antes de tocar el surtido o los precios.",
    data: [
      { label: "Productos", value: PRODUCTOS.map((p) => p.n).join(", ") },
      { label: "Ventas del trimestre", value: listaMeses((m) => `${MESES[m].toLowerCase()} $${TOT_MES[m]}`) },
      { label: "Lo que pasó", value: CONTEXTO },
      { label: "Decisión pendiente", value: "Repetir la promoción o cambiar el surtido" },
    ],
    problem: "Creen que cayeron porque terminó la promoción, pero nunca lo comprobaron. Y una IA a la que pegaron las ventas les dio cifras que no coincidían con su hoja.",
    application: "Ordenan sus ventas, arman el resumen, piden la lectura, la contrastan, la corrigen con datos nuevos y comprueban las hipótesis.",
    result: "Una tabla con hipótesis alternativas y la forma de comprobar cada una.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas separan lo que se sabe de lo que se supone.",
    blocks: [
      {
        title: "Calcular, interpretar y decidir son tres trabajos",
        detail:
          "Sumar tiene una única respuesta correcta, y la hoja la da siempre. Interpretar es leer los números y ver qué llama la atención, y ahí ayuda la IA. Decidir depende de tu negocio.",
        example: `La hoja dice que septiembre fue $${CAIDA_SEP} menos que agosto; la IA sugiere por qué podría ser; tú decides qué revisar.`,
      },
      {
        title: "Una hipótesis no es una causa",
        detail: "«Bajó porque terminó la promoción» es una hipótesis. Solo será una causa si compruebas que la promoción movía esas ventas.",
      },
      {
        title: "Compara de forma justa",
        detail: "Un mes con tres días de cierre no se compara con uno completo sin ajustar. Pregúntate qué fue distinto en cada periodo.",
        example: `$${TOT_MES[2]} en ${DIAS_ABIERTOS[2]} días abiertos son $${coma(POR_DIA[2], 2)} por día; agosto fue de $${coma(POR_DIA[1], 2)}.`,
      },
      {
        title: "Con tres datos no hay tendencia",
        detail: "Tres meses sirven para observar y preguntar, no para afirmar tendencias.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Aquí están mis ventas de los últimos tres meses. Dime qué pasó y qué debería hacer.",
    whyInsufficient:
      "La IA no sabe qué pasó en tu negocio, calcula mientras redacta y elige por ti. Suena a análisis y puede ser una lista de suposiciones (ejemplo ilustrativo).",
    issues: [
      "No se le dice lo que pasó cada mes: no puede tenerlo en cuenta.",
      "No se le pide separar datos de suposiciones.",
      "«Qué debería hacer» pide una decisión que solo tú puedes tomar.",
      "No hay ninguna comprobación prevista.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "El trabajo más importante ocurre antes de abrir la IA. Reúne cuatro cosas.",
    items: [
      { label: "Una decisión concreta", detail: "Para qué miras los datos. Sin decisión, cualquier dato parece interesante.", example: "¿Repetir la promoción o cambiar el surtido?", required: true },
      { label: "Una tabla limpia de ventas", detail: "Una fila por venta, con las mismas columnas: fecha, producto, unidades y precio. Un producto, un nombre.", example: "12/07 · Monstera · 1 · $20", required: true },
      { label: "Lo que pasó en cada periodo", detail: "Promociones, cambios de precio, cierres y faltantes. Sin esto, cualquier explicación será genérica.", required: true },
      { label: "Qué no vas a compartir", detail: "Nombres, teléfonos o direcciones de clientes: no hacen falta.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribe la IA y lo que dice la hoja",
      purpose: "Ver cómo un pedido sin resumen produce cifras erradas y causas sin comprobar.",
      columns: ["Frase de la IA", "Lo que dice la hoja o por qué no se sostiene"],
      rows: [
        [`«Las ventas del trimestre sumaron $${TOTAL + 80}.»`, `La hoja suma $${TOTAL}: ${listaMeses((m) => `$${TOT_MES[m]}`)}.`],
        [`«Septiembre cayó un 24 % respecto a agosto.»`, `La hoja da ${con(VAR_MES[1])}, y por día abierto la caída es de ${sin(-VAR_DIA[1])}.`],
        [`«Las suculentas representan el 40 % de las ventas.»`, `La hoja da ${sin(TOT_PROD[2] / TOTAL)}.`],
        ["«La caída se debe a que terminó la promoción.»", "Es una causa afirmada, sin comprobar, y la tienda cerró tres días."],
      ],
      note: "Ejemplo ilustrativo, escrito a propósito con tres cifras erradas. La hoja del caso las contradice.",
    },
    preguntas: {
      caption: "Cinco preguntas que tus ventas pueden contestar",
      purpose: "Elegir qué preguntarle a tus datos y qué cuenta hacer.",
      columns: ["Pregunta", "Cuenta en la hoja", "Lo que no puede decirte"],
      rows: [
        ["¿Qué productos mueven el total?", "Ventas por producto y % del total", "Por qué se venden más o menos."],
        ["¿La diferencia es del negocio o del calendario?", "Ventas por día abierto", "Si el calendario fue la única razón."],
        ["¿Una promoción vendió más o solo bajó el precio?", "Unidades e ingresos del producto", "Si dejó margen."],
      ],
      copyable: true,
    },
    plantilla: {
      caption: "Plantilla de la hoja de ventas y resumen",
      purpose: "Saber qué va en cada hoja y en cada celda.",
      columns: ["Hoja y celdas", "Contenido"],
      rows: [
        ["Ventas!A1:F1", "Encabezados: Fecha, Producto, Unidades, Precio, Total, Mes"],
        ["Ventas!A2:F…", "Una fila por venta: fecha, producto, unidades y precio, y las dos primeras fórmulas de la tabla siguiente"],
        ["Resumen!A1:F1", `«Producto», los números de mes (7, 8 y 9), «Total» y «% del total»`],
        ["Resumen!A2:F7", "Los productos en A2:A6 y sus ventas por mes, totales y % del total"],
        ["Resumen!A8:D14", "Compras y días abiertos (los anotas tú), ticket promedio, variaciones, ventas por día abierto y el control"],
      ],
      copyable: true,
    },
    hoja: {
      caption: "Las fórmulas de la hoja, en español y en inglés",
      purpose: "Saber qué escribir en cada celda y cómo probarlo con números de práctica.",
      columns: ["Celda", "Qué calcula", "Fórmula en español", "Fórmula en inglés", "Comprobación con números de práctica"],
      rows: FORMULAS.map((f, i) => [f.celda, CUENTAS[i][1], f.es, f.en, f.prueba]),
      copyable: true,
      note: "Ejemplo generado. Según tu región, los argumentos se separan con punto y coma o con coma.",
    },
    resumen: {
      caption: "Resumen del trimestre de Verde Hogar",
      purpose: "Ver el resumen calculado que se le da a la IA.",
      columns: ["Producto", "Julio", "Agosto", "Septiembre", "Total", "% del total"],
      rows: [
        ...PRODUCTOS.map((p, i) => [p.n, ...mes3((m) => String(ingreso(p, m))), String(TOT_PROD[i]), sin(TOT_PROD[i] / TOTAL)]),
        ["Total de ventas", ...mes3((m) => String(TOT_MES[m])), String(TOTAL), "100,0 %"],
        ["Compras (tickets)", ...mes3((m) => String(COMPRAS[m])), String(COMPRAS.reduce((a, b) => a + b, 0)), "—"],
        ["Ticket promedio", ...mes3((m) => coma(TICKET[m], 2)), coma(TICKET_TOTAL, 2), "—"],
        ["Variación frente al mes anterior", "—", con(VAR_MES[0]), con(VAR_MES[1]), "—", "—"],
      ],
      copyable: true,
      note: "Cifras ficticias en $. Es lo que se pega en el prompt principal, junto con lo que pasó en cada mes.",
    },
    diaAbierto: {
      caption: "Datos nuevos de la hoja: comparación por día abierto y unidades",
      purpose: "Ver cómo cambia la lectura al comparar por días abiertos.",
      columns: ["Concepto", "Julio", "Agosto", "Septiembre"],
      rows: [
        ["Días abiertos", ...mes3((m) => String(DIAS_ABIERTOS[m]))],
        ["Ventas por día abierto", ...mes3((m) => coma(POR_DIA[m], 2))],
        ["Variación por día abierto frente al mes anterior", "—", con(VAR_DIA[0]), con(VAR_DIA[1])],
        ["Unidades de monstera", ...mes3((m) => String(monstera.uds[m]))],
        ["Unidades de maceta", ...mes3((m) => String(maceta.uds[m]))],
        ["Variación de unidades de maceta", "—", ...[1, 2].map((m) => con(maceta.uds[m] / maceta.uds[m - 1] - 1))],
        ["Variación de ingresos de maceta", "—", ...[1, 2].map((m) => con(ingreso(maceta, m) / ingreso(maceta, m - 1) - 1))],
      ],
      note: `Septiembre frente a julio, por día abierto: ${con(SEP_VS_JUL_DIA)}. Las unidades salen de tu hoja de ventas.`,
    },
    limites: {
      caption: "Cuándo no se puede afirmar",
      purpose: "Reconocer cuándo los datos no bastan.",
      columns: ["Situación", "Tentación", "Qué hacer"],
      rows: [
        ["Tienes tres meses de datos", "Hablar de temporadas o tendencias", "Observa y anota: una temporada pide al menos un año."],
        ["Un producto pasa de 2 a 4 ventas", "Decir que creció un 100 %", "Habla de cantidades: con bases pequeñas, el porcentaje engaña."],
        ["Un mes tuvo un cierre o una promoción", "Comparar los totales", "Compara por día abierto."],
        ["Un producto baja un mes", "Dejar de comprarlo", "Espera más meses y revisa el stock."],
      ],
      copyable: true,
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Tres de los siete pasos llevan un prompt. Los otros cuatro los haces tú solo.",
    steps: [
      { title: "Define la decisión y las preguntas", description: "Escribe qué decisión quieres tomar y elige las preguntas que tus datos puedan contestar.", output: "Una decisión y sus preguntas." },
      { title: "Deja las ventas en una tabla limpia", description: "Una fila por venta, mismas columnas, un nombre por producto y las fechas escritas igual. Quita todo dato personal.", output: "Una tabla lista para calcular." },
      { title: "Arma la hoja y calcula el resumen", description: "Con el prompt de fórmulas o con la plantilla, arma la hoja y pruébala con números de práctica.", output: "Un resumen calculado." },
      { title: "Comprueba que las cuentas cuadran", description: "Suma de dos maneras y mira que el total de control dé 0. Si no, corrige antes de seguir.", output: "Un resumen que cuadra." },
      { title: "Pide la lectura a la IA", description: "Pega tu resumen, no las ventas sueltas, y lo que pasó en cada mes, y pide hipótesis.", output: "Una tabla de hipótesis." },
      { title: "Contrasta y corrige", description: "Compara cada cifra y cada frase con tu hoja, puntúa con la rúbrica y pide cambiar solo lo señalado.", output: "Una lectura corregida." },
      { title: "Comprueba una hipótesis y decide", description: "Haz la comprobación que se propuso, con datos que tienes, y decide solo con lo comprobado.", output: "Una hipótesis confirmada o descartada." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    formulas: {
      title: "Prompt de fórmulas: armar tu hoja sin compartir tus ventas",
      objective: "Obtener las fórmulas de tu hoja a partir de la descripción de tus columnas, sin pegar ninguna venta.",
      whenToUse: "Cuando quieres construir la hoja tú mismo o adaptarla a tus columnas.",
      variables: [
        { name: "PROGRAMA", description: "La hoja de cálculo que usas.", example: "Google Sheets" },
        {
          name: "COLUMNAS_Y_CELDAS",
          description: "Cada hoja, columna o bloque y lo que contiene.",
          example: "Ventas: A fecha, B producto, C unidades, D precio, E total, F mes · Resumen: productos en A2:A6, meses en B1:D1, compras en la fila 8, días abiertos en la fila 11",
        },
      ],
      prompt: `Actúa como asistente de hojas de cálculo para una persona que apenas empieza y que escribirá cada fórmula por su cuenta. Tu objetivo es proponerle las fórmulas de una hoja de ventas y de su resumen, usando solo la descripción de sus hojas y columnas, sin ver ninguna venta.

### CONTEXTO
Programa: {{PROGRAMA}}

### DATOS
Cómo están armadas mis hojas (hoja, columna o bloque y lo que contiene):
{{COLUMNAS_Y_CELDAS}}

### CUENTAS QUE NECESITO
${LISTA_CUENTAS}

### REGLAS
1. Trabaja solo con las hojas y columnas que describí. Si para una cuenta falta una, escribe [FALTA: la columna] y no la crees.
2. No me pidas mis ventas. Para probar cada fórmula usa números de práctica que pueda resolver mentalmente.
3. Da cada fórmula con las funciones en español y en inglés, y recuérdame que el separador de argumentos depende de la región.
4. Fija con signos de dólar las celdas y los rangos que no deben moverse al copiar, y dime cuáles.
5. Separa lo que sale de mi descripción de lo que supones tú, y marca cada suposición «SUPUESTO».

### FORMATO DE SALIDA
Una tabla de columnas fijas: Celda | Qué calcula | Fórmula en español | Fórmula en inglés | Comprobación con números de práctica. Debajo, «Cómo pegarla», con el lugar de cada fórmula. La tabla fija la forma; el contenido sale de mis columnas.

### ANTES DE RESPONDER
Verifica que: cada fórmula responde a la cuenta escrita; la comprobación con números de práctica es correcta (haz la cuenta dos veces); no usaste columnas que no describí; los rangos fijos están marcados; el control da 0 cuando los totales cuadran; toda suposición está señalada. Corrige lo que falle.`,
      explanation: [
        {
          part: "sin ver ninguna venta.",
          why: "Le describes la estructura y no tus ventas: armas el cálculo sin compartir datos de tu negocio.",
        },
        {
          part: "usa números de práctica que pueda resolver mentalmente.",
          why: "Puedes comprobar cada fórmula con cuentas propias antes de usar tus ventas.",
        },
        {
          part: "el control da 0 cuando los totales cuadran",
          why: "Te recuerda incluir el total de control, la cuenta que avisa si algo no suma bien.",
        },
      ],
      evaluate: "Escribe cada fórmula con los números de práctica: el resultado debe coincidir con tu cuenta a mano.",
      improve: "Si tu programa no reconoce una función, pega su mensaje de error y pide la alternativa.",
    },

    principal: {
      title: "Prompt principal: observaciones, hipótesis y cómo comprobarlas",
      objective: "Obtener observaciones, hipótesis con alternativas y formas de comprobarlas, sin cálculos nuevos ni causas afirmadas.",
      whenToUse: "Cuando tu resumen cuadra y tienes anotado lo que pasó en cada periodo.",
      variables: [
        { name: "NEGOCIO", description: "Qué es tu negocio.", example: "Tienda de plantas de interior" },
        { name: "PERIODO", description: "Los meses que cubre el resumen.", example: "Julio, agosto y septiembre" },
        { name: "TABLA_RESUMEN", description: "Tu resumen ya calculado, como texto.", example: "Ventas por mes: julio $950, agosto $1119…" },
        { name: "CONTEXTO", description: "Lo que pasó en cada periodo.", example: "Agosto: maceta a $5 en lugar de $6. Septiembre: 3 días cerrado" },
        { name: "PREGUNTA", description: "Lo que quieres entender.", example: "Qué cambió en septiembre" },
      ],
      prompt: `Actúa como analista de ventas para negocios pequeños. Tu destinatario es la persona dueña, que decidirá y comprobará lo que le expliques. Tu objetivo es interpretar un resumen de ventas YA CALCULADO en su hoja de cálculo, no recalcularlo.

### CONTEXTO
Negocio: {{NEGOCIO}}
Periodo: {{PERIODO}}
Lo que pasó en cada periodo (promociones, cierres, cambios de precio, faltantes):
{{CONTEXTO}}
Lo que quiero entender: {{PREGUNTA}}

### DATOS (única fuente de cifras)
Resumen calculado por mí:
{{TABLA_RESUMEN}}

### REGLAS
1. Cita solo cifras que estén escritas en mi resumen, tal como están. No hagas sumas, porcentajes ni promedios nuevos: si necesitas uno, pídemelo en «FALTA».
2. Distingue lo que muestran mis cifras (observación) de lo que supones (hipótesis). Usa la palabra «hipótesis» y no afirmes ninguna causa.
3. Da al menos dos explicaciones posibles por cada observación importante.
4. Ten en cuenta lo que pasó en el periodo. Si dos periodos no son comparables, dilo y pide el dato que falta.
5. Para cada hipótesis, di qué dato y qué cálculo de mi hoja la confirmarían o la descartarían.
6. No recomiendes decisiones y no digas cuál explicación es la correcta.
7. Si con estos datos no se puede afirmar algo, dilo. Si falta un dato, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: ${COLUMNAS_HIP.join(" | ")}; (2) «Con estos datos no se puede afirmar»; (3) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: cada cifra aparece tal cual en mi resumen; ninguna explicación se presenta como causa; cada observación tiene al menos dos hipótesis; cada hipótesis dice cómo comprobarla; usaste lo que pasó en el periodo; no hay recomendaciones. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "YA CALCULADO en su hoja de cálculo, no recalcularlo.",
          why: "Reparte el trabajo: las cuentas son de la hoja y la lectura, de la IA. Así se evita el riesgo de que calcule mal.",
        },
        {
          part: "Lo que pasó en cada periodo",
          why: "Es lo que la IA no puede saber. Sin esto, explicará una caída con lo más habitual, aunque tu caso sea otro.",
        },
        {
          part: "Da al menos dos explicaciones posibles por cada observación importante.",
          why: "Evita quedarse con la primera explicación que suena bien y obliga a comparar posibilidades.",
        },
        {
          part: "«Con estos datos no se puede afirmar»",
          why: "Obliga a nombrar los límites, en lugar de dejar que la lectura suene más segura de lo que es.",
        },
      ],
      evaluate: "Comprueba que cada cifra citada está en tu resumen y que ninguna frase afirma una causa.",
      improve: "Si la respuesta es genérica, añade más contexto de lo que pasó cada mes.",
    },

    auditoria: {
      title: "Prompt de auditoría: qué cifras debes recalcular",
      objective: "Obtener cada cifra del análisis con su origen y cómo recalcularla en tu hoja.",
      whenToUse: "Justo después de recibir la lectura, como primera pasada antes de tu propia revisión.",
      variables: [
        { name: "TABLA_RESUMEN", description: "El mismo resumen del prompt principal.", example: "Ventas por mes: julio $950, agosto $1119…" },
        { name: "CONTEXTO", description: "Lo que pasó en cada periodo.", example: "Agosto: maceta a $5. Septiembre: 3 días cerrado" },
      ],
      prompt: `Actúa como auditor de análisis de ventas. Tu destinatario es la persona dueña, que recalculará las cifras en su hoja. Tu objetivo es señalar qué debe comprobar, no dar nada por correcto.

### CONTEXTO
Audita el análisis de esta conversación. Si falta, pídemelo antes de seguir.
Lo que pasó en cada periodo: {{CONTEXTO}}

### DATOS (única fuente)
Mi resumen calculado:
{{TABLA_RESUMEN}}

### REGLAS
1. Lista cada frase del análisis que contenga una cifra o una explicación.
2. Clasifica cada una como: «Dato de mi resumen», «Cálculo nuevo», «Interpretación», «Hipótesis» o «Causa afirmada».
3. Para cada cifra, di dónde está en mi resumen (fila y columna) o escribe «No está», y cómo la recalcularía yo en mi hoja.
4. Señala lo que contradiga o ignore lo que pasó en el periodo y cualquier recomendación de decisión.
5. No des por correcta ninguna cifra y no hagas cálculos: solo indícame cómo comprobarla.
6. Si falta un dato para clasificar una frase, escribe [FALTA: qué dato].

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: Frase | Tipo | Cifra | Dónde está en mi resumen | Cómo la recalcularía yo; (2) «Contradice o ignora el contexto»; (3) «Recomendaciones»; (4) «FALTA». La tabla fija la forma; el contenido sale del análisis y de mis datos.

### ANTES DE RESPONDER
Verifica que: cada frase con cifra o explicación está en la tabla; cada tipo es uno de los cinco; ninguna cifra quedó sin su origen o su forma de recalcularla; no diste nada por correcto; no hay cálculos. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Clasifica cada una como: «Dato de mi resumen», «Cálculo nuevo», «Interpretación», «Hipótesis» o «Causa afirmada».",
          why: "Te enseña a leer por capas: qué es un hecho, qué una suposición y qué una causa que nadie comprobó.",
        },
        {
          part: "cómo la recalcularía yo en mi hoja.",
          why: "Convierte cada cifra en una tarea de comprobación concreta.",
        },
        {
          part: "No des por correcta ninguna cifra",
          why: "Evita que la auditoría suene a garantía: la comprobación sigue siendo tuya.",
        },
      ],
      evaluate: "Verifica tú las cifras que marca como correctas: también puede equivocarse al auditarse.",
      improve: "Pídele que ordene los problemas de más a menos graves.",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir y añadir datos nuevos",
      objective: "Corregir solo lo señalado y añadir los datos nuevos que calculaste tú, sin afirmar causas.",
      whenToUse: "Después de contrastar, con la lista de problemas y los datos que calculaste en tu hoja.",
      variables: [
        { name: "PROBLEMAS", description: "Lo que hay que corregir y por qué.", example: PROBLEMAS_TEXTO },
        { name: "DATOS_ADICIONALES", description: "Datos nuevos calculados por ti en la hoja.", example: "Ventas por día abierto, sus variaciones y las unidades de monstera y maceta" },
      ],
      prompt: `Actúa como analista de ventas que corrige su propio análisis. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, usando los datos nuevos que calculó, y dejar intacto lo demás.

### CONTEXTO
Usa el resumen, lo que pasó en cada periodo y la tabla de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS
Problemas que detecté:
{{PROBLEMAS}}

Datos nuevos que calculé en mi hoja (son tu única fuente de cifras nuevas):
{{DATOS_ADICIONALES}}

### REGLAS
1. Cambia solo lo señalado y lo que ese cambio obligue a ajustar. Cita solo cifras de mi resumen o de mis datos nuevos, tal como están, y no hagas cálculos.
2. Para cada hipótesis di qué la apoya, qué la debilita y qué sigue sin poder decirse con mis datos. No afirmes ninguna causa.
3. Cada hipótesis dice qué dato y qué cálculo de mi hoja la confirmarían o la descartarían. Ordénalas según lo fácil que sea comprobarlas.
4. No recomiendes decisiones. Si un problema que te señalé no existe en tu tabla, dímelo antes de cambiar nada.
5. Si falta un dato, escribe [FALTA: qué dato] en lugar de inventarlo.

### FORMATO DE SALIDA
En este orden: (1) la tabla completa, con las columnas fijas: ${COLUMNAS_HIP.join(" | ")}; (2) «Con estos datos no se puede afirmar»; (3) «Cambios»: una lista de lo que modificaste; (4) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; toda cifra nueva sale de mis datos nuevos o de mi resumen; ninguna frase afirma una causa; cada hipótesis dice cómo comprobarla; no hay recomendaciones. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo lo señalado",
          why: "Evita que rehaga observaciones que ya estaban bien.",
        },
        {
          part: "Para cada hipótesis di qué la apoya, qué la debilita",
          why: "Pasas de una explicación única a varias, con pruebas a favor y en contra.",
        },
        {
          part: "Ordénalas según lo fácil que sea comprobarlas.",
          why: "Empiezas por lo que puedes comprobar hoy con lo que tienes.",
        },
      ],
      evaluate: "Comprueba que ninguna cifra nueva salió de la IA y que ninguna frase diga «se debe a».",
      improve: "Si sigue afirmando causas, repite la regla y pide sustituir «porque» por «una posible explicación es».",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt principal al resumen y al contexto del caso. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Primera lectura, tal como llega",
          purpose: "Tener la lectura en el formato del prompt.",
          columns: COLUMNAS_HIP,
          rows: PRIMERA_FILAS,
        },
      },
      { type: "text", text: "**Con estos datos no se puede afirmar:** la causa de la caída ni una pérdida de demanda de la monstera. **FALTA:** el registro de stock." },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "analisis-ventas",
    title: "Puntúa un análisis de la IA",
    intro:
      `Puntúa el análisis en los seis criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[1].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `La tabla suena a un buen análisis. Se contrasta con la hoja y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "cifras",
        verdict: vered("cifras"),
        comment: "Todas las cifras están en el resumen: ninguna es un cálculo nuevo.",
      },
      {
        criterionId: "capas",
        verdict: vered("capas"),
        comment: "Dice «hipótesis», pero «se explica en buena parte» da un peso que las cifras no muestran.",
      },
      {
        criterionId: "alternativas",
        verdict: vered("alternativas"),
        comment: "Ofrece una alternativa por observación, como pide el prompt.",
      },
      {
        criterionId: "justa",
        verdict: vered("justa"),
        comment: `Menciona el cierre, pero compara por totales (${con(VAR_MES[1])}) y no pide las ventas por día abierto.`,
      },
      {
        criterionId: "comprobar",
        verdict: vered("comprobar"),
        comment: "La primera hipótesis se comprueba con «Analizar más datos de ventas»: no dice cuáles.",
      },
      {
        criterionId: "limites",
        verdict: vered("limites"),
        comment: "Nombra lo que no se puede afirmar y no recomienda decisiones.",
      },
    ],
    conclusion: "Es una buena base: las cifras coinciden y no decide por ti. Los tres defectos se arreglan con datos que solo tu hoja puede dar.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí no es pedir «hazlo mejor»: es señalar tres cosas y dar datos nuevos calculados por ti.",
    promptId: "ajuste",
    why: `El contraste señaló una comparación injusta, un peso sin respaldo y una comprobación vaga. Se corrige con datos de tu hoja y con las reglas del ajuste: solo lo señalado, hipótesis que dicen cómo comprobarlas y ninguna cifra que no salga de tus datos.`,
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de ajuste, con los PROBLEMAS y los DATOS_ADICIONALES del ejemplo. La tuya será distinta.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Observaciones, hipótesis y cómo comprobarlas",
          purpose: "Ver el resultado esperado: varias explicaciones con la forma de comprobar cada una.",
          columns: COLUMNAS_HIP,
          rows: FINAL_FILAS,
        },
      },
      { type: "text", text: "**Con estos datos no se puede afirmar:** que alguna hipótesis sea la causa ni que haya una tendencia. **Cambios:** la comparación por día abierto y la comprobación de cada hipótesis. **FALTA:** ventas día por día y registro de stock." },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Pegar las ventas sueltas",
      whyItHurts: "Con cientos de filas, la IA mezcla cálculo y lectura, puede equivocarse y recibe datos que no necesita.",
      instead: "Pega el resumen ya calculado y comprobado, sin datos de clientes.",
    },
    {
      title: "Aceptar un «porque» sin comprobar",
      whyItHurts: "Una explicación razonable no es cierta: puedes repetir una promoción por un motivo equivocado.",
      instead: "Pide hipótesis, mantén varias abiertas y comprueba cada una con datos.",
    },
    {
      title: "Comparar periodos desiguales",
      whyItHurts: "Un mes con menos días abiertos o con promoción no es comparable con uno normal.",
      instead: "Compara por día abierto y anota lo que hizo distinto a cada periodo.",
    },
    {
      title: "Hablar de tendencias con pocos datos",
      whyItHurts: "En meses sueltos, un cambio pequeño parece tendencia y un porcentaje alto puede ser dos ventas de diferencia.",
      instead: "Trabaja con cantidades y di lo que aún no se puede saber.",
    },
      ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Marca cada punto cuando lo hayas comprobado tú, en tu hoja, no la IA.",
    items: [
      { label: "El total de control da 0: la suma por producto es igual a la suma por mes." },
      { label: "Probé las fórmulas con números de práctica y coinciden con mi cuenta a mano." },
      { label: "Cada cifra del análisis aparece en mi resumen o la recalculé yo." },
      { label: "Toda explicación dice «hipótesis», sin un peso que mis datos no muestran." },
      { label: "Comparé periodos comparables: días abiertos y promociones." },
      { label: "Sé qué datos faltan y no decidí con eso pendiente." },
      { label: "No compartí datos de clientes. Si hay dinero importante o impuestos, consulté a un contador." },
    ],
    principle: "La IA lee y propone hipótesis. Las cuentas salen de tu hoja y la decisión es tuya.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con la primera lectura hecha, el trabajo es repetirla con orden.",
    steps: [
      { title: "Anota lo que comprobaste", detail: "Guarda cada hipótesis confirmada o descartada, con su fecha y su dato." },
      { title: "Repite cada mes con las mismas cifras", detail: "Añade el mes nuevo a la hoja y mira siempre lo mismo." },
      { title: "Guarda lo que pasó cada mes", detail: "Sin ese registro no podrás explicar un cambio dentro de seis meses." },
      { title: "Suma meses antes de hablar de tendencias", detail: "Con más meses, unas hipótesis se sostienen y otras se caen." },
      { title: "Revisa tus preguntas", detail: "Si cambia la decisión, cambia lo que le preguntas a tus ventas." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ayuda a pensar mejor tus datos, pero tiene límites claros.",
    items: [
      { title: "No encuentra causas", detail: "Solo propone explicaciones posibles: saber cuál es la correcta exige comprobarlas." },
      { title: "Con pocos datos no hay conclusiones", detail: "Tres meses sirven para observar y preguntar, no para hablar de temporadas." },
      { title: "Depende de que tú cuentes lo que pasó", detail: "No sabe lo que ocurrió cada mes si no se lo cuentas." },
      { title: "No sustituye a un contador", detail: "Sirve para entender ventas, no para impuestos, contabilidad o decisiones financieras importantes." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Un análisis de ventas útil termina en una lista de cosas por comprobar, no en una explicación cerrada. Con un resumen que cuadra y comparaciones justas, decides con menos suposiciones.",
    takeaways: [
      "Comprueba que tus cuentas cuadran antes de mostrárselas a nadie.",
      "Una hipótesis no es una causa hasta que se comprueba.",
      "Compara periodos parecidos y anota lo que pasó en cada uno.",
      "Con pocos datos, pregunta más que concluye.",
    ],
    nextGuide: "definir-precios-y-margenes-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "dato-personal", "hoja-de-calculo", "hipotesis", "total-de-control", "ticket-promedio", "rubrica"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Cuántos meses de datos necesito?",
      answer:
        "Tres meses sirven para observar y plantear preguntas. Para hablar de temporadas necesitas al menos un año, y aun así conviene tomarlo con cuidado.",
    },
    {
      question: "¿Qué hago si mis datos están desordenados?",
      answer:
        "Empieza por ordenarlos: una fila por venta, las mismas columnas y un solo nombre por producto. Si el desorden es muy grande, empieza con un mes y amplía después.",
    },
    {
      question: "¿Sirve si vendo servicios y no productos?",
      answer:
        "Sí: cambia «producto» por «servicio» en la tabla. Las cuentas y la lectura son las mismas; cambia lo que puede pasar cada mes.",
    },
  ],
});
