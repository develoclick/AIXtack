import { defineGuide, type ResultData } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * marketing/crear-promociones-con-ia — regenerada con el estándar v3 (la publicación y las imágenes
 * previstas se conservan: `slug` y `publishedAt` no cambian).
 *
 * Tipo: números y datos, con una parte de decisión. Todo el caso (Café Mirador, precios, costos y
 * ventas) es FICTICIO. Cada cifra se verificó con código (ver README.md). Las respuestas de la IA de
 * los cuatro prompts son PRUEBAS REALES del autor: cada bloque `kind: "real"` es la transcripción
 * literal de su captura (`prueba-prompt-0N.webp`). La comparativa «Cuentas de la IA / Mi hoja» toma la
 * columna de la IA de esa transcripción y recalcula la de la hoja con las fórmulas de la calculadora.
 * Fecha y asistente de las pruebas: `evidence.pruebas`, que solo rellena el autor.
 *
 * Fuente única de verdad: las tres cuentas (CUENTAS), los criterios de la rúbrica (CRITERIOS), los
 * umbrales (RESULTADOS), los productos y los datos del caso se definen UNA vez y los leen el marco, la
 * rúbrica, los prompts y los ejemplos.
 */
const slot = guideSlots("marketing", "crear-promociones-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const CUENTAS = [
  {
    id: "margen",
    nombre: "Margen de una canasta",
    formula: "margen = lo que paga el cliente − el costo de esa canasta",
  },
  {
    id: "descuento",
    nombre: "Descuento real",
    formula: "descuento real = (precio normal − precio con promoción) ÷ precio normal",
  },
  {
    id: "necesarias",
    nombre: "Ventas necesarias",
    formula: "ventas necesarias = margen antes ÷ margen después − 1",
  },
] as const;

const CRITERIOS = [
  { id: "datos", label: "Usa solo mis datos", detail: "Cada precio y costo es uno que le di." },
  { id: "descuento", label: "Convierte cada oferta en descuento", detail: "El 2x1, el «gratis» y los combos aparecen como porcentaje del precio normal." },
  { id: "formulas", label: "Aplica las fórmulas pedidas", detail: "Cada cifra sale de las tres fórmulas, con la canasta correcta." },
  { id: "coinciden", label: "Coincide con mi hoja", detail: "Al recalcular una fila en mi hoja obtengo la misma cifra, salvo centésimas." },
  { id: "limites", label: "Marca lo que rompe mis límites", detail: "Señala los descuentos por encima de mi máximo y los precios por debajo del costo." },
  { id: "prediccion", label: "No predice ventas", detail: "Las ventas necesarias se presentan como umbral, no como pronóstico." },
] as const;

const RESULTADOS = [
  { min: 0, label: "No usar", advice: "Falla en varios criterios: repite el pedido o haz tú todas las cuentas en la hoja." },
  { min: 7, label: "Usar con correcciones", advice: "Sustituye las filas que no coinciden por las de tu hoja." },
  { min: 10, label: "Utilizable", advice: "Coincide casi todo: pasa a decidir con tus cifras." },
] as const;

const PRODUCTOS = [
  { nombre: "Café", precio: "2.50", costo: "0.60" },
  { nombre: "Croissant", precio: "2.00", costo: "0.70" },
  { nombre: "Jugo natural", precio: "3.00", costo: "1.10" },
  { nombre: "Desayuno completo (café + croissant + jugo)", precio: "7.50", costo: "2.40" },
] as const;

const OBJETIVO = "Pasar de 20 a 24 pedidos de café + croissant por semana en la franja lenta";
const LIMITES = "Descuento máximo del 20 % y nada por debajo del costo";
const VENTAS_ACTUALES = "20 pedidos de café + croissant por semana";
const FRANJA = "Martes a jueves, de 9:30 a 11:30, durante tres semanas";
const PARADA = "Detener si tras dos semanas se venden menos de 24 pedidos por semana";
const PRECIOS_PROMO =
  "A: $4.00 por café + croissant · B: 15 % menos que $7.50 · C: cinco visitas de café + croissant, la 5.ª gratis: $18.00 en lugar de $22.50 · D: dos cafés + dos croissants, el 2.º croissant gratis: $7.00 en lugar de $9.00";

const LISTA_CUENTAS = CUENTAS.map((c, i) => `${i + 1}. ${c.nombre}: ${c.formula}.`).join("\n");
const MAXIMO = CRITERIOS.length * 2;

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "crear-promociones-con-ia",
    category: "marketing",
    title: "Crear promociones con IA: diseña ofertas que sí te convienen",
    description:
      "Aprende a diseñar y comparar promociones con tus propias cuentas: una hoja que calcula el margen, cuatro alternativas de la IA y una decisión con criterio de parada.",
    author: "DeveloClick",
    publishedAt: "2026-09-18",
    updatedAt: "2026-09-23",
    status: "published",
    tipoGuia: ["numeros-datos", "decision-comparacion"],
    estandarGuia: 3,
    activoOriginal: "Calculadora de promociones para hoja de cálculo (se copia como tabla, con fórmulas en español e inglés) y rúbrica de seis criterios para contrastar las cuentas de la IA",
    problem: "Quieres lanzar una promoción pero no sabes qué tipo de oferta te conviene ni cómo evaluarla antes de comunicarla.",
    whyThisPage:
      "Se centra en diseñar y evaluar la oferta, no solo en redactarla: enseña a pedir alternativas a la IA y a compararlas con criterios propios, sin dar por hecha su rentabilidad.",
    relatedGuides: ["crear-anuncios-con-ia", "crear-afiches-con-ia"],
    handlesNumbers: true,
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Una promoción no es un descuento con buen diseño: es una decisión con números. Tu hoja calcula, la IA propone y compara alternativas, y tú decides con las cuentas a la vista.",
    difficulty: "Principiante",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Unas dos horas la primera vez, repartidas en dos o tres días",
    needs: ["Un asistente de IA de chat", "Una hoja de cálculo", "Precio y costo por unidad de lo que vendes"],
    result: "Una promoción elegida con tus cifras, con su métrica y su condición de parada",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el método en una imagen: de la canasta a las cuentas y de las cuentas a la decisión, con las cifras del combo del caso.",
      description:
        "Diagrama de tres tarjetas en tres pasos (Canasta, Tus cuentas, Tu decisión) con el caso ficticio de Café Mirador: un café con croissant, el margen antes y después del combo y la decisión de probar tres semanas.",
      alt: "Diagrama del caso ficticio de Café Mirador en tres pasos: una canasta de café y croissant; las cuentas, con margen antes de $3.20, margen con el combo a $4.00 de $2.70 y ventas necesarias de +18.5 %; y la decisión, probar tres semanas y parar si hay menos de 24 pedidos.",
      caption: "Una promoción es una decisión con números: canasta, cuentas y decisión (caso ficticio).",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "21/9",
      purpose: "Enseña qué datos reunir antes de abrir la IA y con qué nivel de detalle: precio y costo por unidad de cada producto, más objetivo y límites.",
      description:
        "Hoja de cálculo «Datos del caso — Café Mirador (caso ficticio)» con producto, precio, costo y margen de cuatro productos, y debajo el objetivo, la franja, las ventas actuales y los límites.",
      alt: "Hoja de cálculo «Datos del caso — Café Mirador» con precio, costo y margen de café, croissant, jugo natural y desayuno completo, y debajo el objetivo de pasar de 20 a 24 pedidos, la franja de martes a jueves, las ventas actuales y el límite de descuento del 20 %.",
      caption: "Los datos del caso en una hoja: precio y costo por unidad, más objetivo y límites (caso ficticio).",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "hoja",
      ratio: "16/9",
      promptId: "formulas",
      purpose: "Prueba real del prompt de fórmulas: la tabla de fórmulas devuelta y su comprobación con números de práctica.",
      description:
        "Captura de la respuesta del asistente con la tabla de fórmulas (español, inglés y comprobación con números de práctica) y la lista «Cómo pegarla». Usa solo la descripción de las columnas, sin cifras reales.",
      alt: "Captura de la respuesta de un asistente de IA: tabla con la fórmula de cada columna de la hoja en español y en inglés, su comprobación con números de práctica y la lista «Cómo pegarla».",
      caption: "Prueba real: las fórmulas de la hoja que devolvió el prompt de fórmulas.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "alternativas",
      purpose: "Prueba real del prompt de alternativas: las cuatro promociones con los datos del caso.",
      description:
        "Captura de la respuesta del asistente con las cuatro promociones (A a D) y sus campos: qué se ofrece, qué compra el cliente, por qué encaja, riesgo para el margen, dato que falta, origen y tipo.",
      alt: "Captura de la respuesta de un asistente de IA con cuatro promociones para Café Mirador (combo de media mañana, desayuno completo, tarjeta de fidelidad y ven acompañado), cada una con su canasta, su riesgo para el margen y el dato que le falta.",
      caption: "Prueba real: las cuatro alternativas, todavía sin cifras.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "cuentas",
      purpose: "Prueba real del prompt de cuentas: la tabla de cifras y las cuentas paso a paso, para contrastarlas con tu hoja.",
      description:
        "Captura de la respuesta con la tabla de cuentas de las cuatro promociones, las cuentas paso a paso y «Para comprobar tú»: la promoción D queda fuera del límite del 20 %.",
      alt: "Captura de la respuesta de un asistente de IA con la tabla de cuentas de cuatro promociones, las cuentas paso a paso y la sección «Para comprobar tú»; la promoción D no respeta el límite del 20 %.",
      caption: "Prueba real: las cuentas de la IA, para recalcular en tu hoja.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "decision",
      purpose: "Prueba real del prompt de decisión (1 de 2): diferencias con tus cifras, promociones descartadas y recomendación con la cuenta semanal.",
      description:
        "Primera parte de la respuesta: diferencias con las cifras anteriores, la promoción D descartada por superar el 20 % y la recomendación de la promoción A con la cuenta semanal.",
      alt: "Captura, primera parte, de la recomendación de un asistente de IA: diferencias con las cifras anteriores, promoción D descartada por superar el 20 % y recomendación de la promoción A con su cuenta semanal.",
      caption: "Prueba real: recomendación con tus cifras (1 de 2).",
      zoom: true,
    }),
    prueba4b: slot("prueba-prompt-04b.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "decision",
      purpose: "Prueba real del prompt de decisión (2 de 2): qué medir, duración y condición de parada, y las cuentas para comprobar.",
      description:
        "Segunda parte de la respuesta: qué medir, duración de tres semanas, condición de parada con menos de 24 pedidos por semana y las cuentas para comprobar antes de lanzar.",
      alt: "Captura, segunda parte, de la recomendación de un asistente de IA: qué medir, duración de tres semanas, parada si hay menos de 24 pedidos por semana tras dos semanas y las cuentas para comprobar.",
      caption: "Prueba real: qué medir, duración y parada (2 de 2).",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Casi todas las promociones nacen igual: las ventas están flojas, alguien piensa «hagamos un 2x1» y lo publica. Entran clientes y, al cerrar el mes, las cuentas no cuadran: la promoción vendió, pero **con menos ganancia por cada venta**.\n\nEl problema rara vez es la falta de ideas: una oferta se elige por lo atractiva que suena y no por lo que le hace a tu margen. Si le pides ideas a un asistente de IA sin contexto, obtienes lo mismo. Y si le pides las cuentas, puede equivocarse al calcular y presentarlas con la misma seguridad.\n\n**Las cuentas se hacen en tu hoja; la IA propone, compara y ayuda a decidir.**",
    symptoms: [
      "Sabes cuánto vendes, pero no cuánto te queda de cada producto.",
      "Elegiste el descuento porque «es lo que hace todo el mundo».",
      "Le pediste ideas a una IA y recibiste una lista para cualquier negocio.",
      "Vendiste más, pero no sabes si ganaste más.",
      "No sabes cuándo detener la oferta.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con una promoción concreta, sus cuentas y una forma de comprobar si funcionó. No una lista de ideas: una decisión.",
    deliverables: [
      { label: "Una calculadora en tu hoja", detail: "Margen, descuento real y ventas necesarias, con fórmulas que copias." },
      { label: "Cuatro alternativas comparadas", detail: "Cada una con sus cifras." },
      { label: "Una recomendación con condiciones", detail: "Qué medir, cuánto dura y cuándo detenerla." },
      { label: "Una rúbrica para las cuentas de la IA", detail: "Para saber cuáles usar y cuáles rehacer." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Vendes productos o servicios con un costo que puedes estimar y quieres lanzar una oferta que te convenga.",
      "Sabes sumar y restar en una hoja de cálculo, o quieres aprenderlo aquí.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "No conoces el costo de lo que vendes: antes de una promoción necesitas esa base, aunque sea aproximada.",
      "Buscas el texto del anuncio: aquí se decide qué oferta lanzar, no cómo se cuenta.",
      "Esperas que la IA te diga cuánto vas a vender: no puede saberlo y aquí no se pide.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Café Mirador (ficticio) — cafetería de barrio",
    situation:
      "Café Mirador tiene dos personas en el mostrador. De martes a jueves, entre las 9:30 y las 11:30, casi no entra nadie: es su franja más lenta.",
    goal: "Atraer más clientes en esa franja sin regalar la ganancia. La dueña puso dos límites y una meta.",
    data: [
      ...PRODUCTOS.map((p) => ({ label: p.nombre, value: `Precio $${p.precio} · costo $${p.costo}` })),
      { label: "Ventas actuales en la franja", value: VENTAS_ACTUALES },
      { label: "Objetivo", value: OBJETIVO },
      { label: "Límites de la dueña", value: LIMITES },
    ],
    problem: "Quiere una promoción para esa franja y sospecha que alguna oferta le hará perder dinero, sin saber cuál.",
    application: "Arma una hoja, pide alternativas a un asistente, contrasta sus cifras y decide con las suyas.",
    result: "Descarta la opción que rompe su límite (la D, con un 22.22 % de descuento), elige el combo de media mañana y fija cuánto lo probará y cuándo lo detendrá.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro:
      "Tres cuentas responden a la pregunta de si una promoción te conviene. Las haces tú en la hoja: la IA puede proponerte las promociones, pero la referencia son tus cuentas.",
    blocks: [
      {
        title: CUENTAS[0].nombre,
        simple: "La canasta es lo que el cliente se lleva en una misma compra.",
        detail:
          "Una canasta puede ser un café, dos cafés en un 2x1 o un combo. Su margen es lo que paga el cliente menos lo que te cuesta esa canasta. Calcular por canasta evita comparar un café con dos.",
        example: "Combo de café y croissant: paga $4.00, cuesta $1.30, margen $2.70.",
      },
      {
        title: CUENTAS[1].nombre,
        detail:
          "Es la rebaja como parte del precio normal de la canasta. Un «2x1», un «gratis» y un «segundo a mitad de precio» también son descuentos: se pasan a precio con promoción y luego a porcentaje.",
        example: "En un 2x1, dos cafés valen $5.00 y el cliente paga $2.50: es un 50 %.",
      },
      {
        title: CUENTAS[2].nombre,
        detail:
          "Cuánto más tendrías que vender esa canasta para ganar lo mismo que hoy. Es un umbral, no un pronóstico: dice cuánto te haría falta, no cuánto venderás.",
        example: "El combo baja el margen de $3.20 a $2.70: necesitas vender un 18.5 % más.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Dame ideas de promociones para mi cafetería.",
    whyInsufficient:
      "La IA no sabe cuánto cuesta tu café, a quién le vendes ni qué límite tienes, así que rellena con lo más común: descuentos, 2x1, «gana un café gratis». Una respuesta habitual cierra con algo como «con estas promociones podrías aumentar tus ventas un 30 %» (ejemplo ilustrativo): una predicción sin ningún dato detrás.",
    issues: [
      "No hay objetivo: no se sabe si quieres más clientes, más ticket o liquidar producto.",
      "No hay costos: es imposible saber qué oferta deja ganancia.",
      "No hay límites: puede proponerte un descuento que no puedes permitirte.",
      "No hay criterio para comparar las opciones.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Antes de abrir la IA, reúne estos datos. Si falta alguno de los obligatorios, ese es tu primer trabajo: la IA no puede inventarlo por ti.",
    items: [
      { label: "Precio de venta de cada producto", detail: "Lo que paga hoy el cliente, con o sin impuestos según cómo cobres. Sé consistente en todos.", required: true },
      { label: "Costo por unidad", detail: "Lo que te cuesta producir o comprar una unidad (ingredientes, empaque). No incluyas alquiler ni sueldos: eso pide otra cuenta.", required: true },
      { label: "Objetivo con una cifra", detail: "Lo que quieres conseguir, expresado de forma que puedas comprobarlo.", required: true },
      { label: "Límites que no cruzarás", detail: "Descuento máximo, precio mínimo y productos que no entran.", required: true },
      { label: "Franja o periodo", detail: "Cuándo aplicaría la promoción: días, horas o fechas.", required: true },
      { label: "Ventas actuales de la franja", detail: "Un dato aproximado de cuánto se vende hoy. Sin él no sabrás si la promoción mejoró algo.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    calculadora: {
      caption: "Calculadora de promociones con el caso de Café Mirador",
      purpose: "Tener una hoja que calcula las tres cuentas de cada promoción, lista para pegar en la celda A1 y para cambiar los números por los tuyos.",
      columns: ["Promoción", "Precio normal", "Costo", "Margen antes", "Precio con promoción", "Descuento real", "Margen después", "Ventas necesarias", "Descuento máximo", "¿Respeta el límite?"],
      rows: [
        ["A · Combo de media mañana (1 café + 1 croissant)", "4.50", "1.30", "=B2-C2", "4.00", "=(B2-E2)/B2", "=E2-C2", "=SI(G2>0;D2/G2-1;\"pérdida\")", "0.2", "=SI(Y(F2<=I2;E2>=C2);\"Sí\";\"No\")"],
        ["B · Desayuno completo con 15 %", "7.50", "2.40", "=B3-C3", "6.375", "=(B3-E3)/B3", "=E3-C3", "=SI(G3>0;D3/G3-1;\"pérdida\")", "0.2", "=SI(Y(F3<=I3;E3>=C3);\"Sí\";\"No\")"],
        ["C · Tarjeta de fidelidad (5 visitas de café + croissant, la 5.ª gratis)", "22.50", "6.50", "=B4-C4", "18.00", "=(B4-E4)/B4", "=E4-C4", "=SI(G4>0;D4/G4-1;\"pérdida\")", "0.2", "=SI(Y(F4<=I4;E4>=C4);\"Sí\";\"No\")"],
        ["D · Ven acompañado (2 cafés + 2 croissants, el 2.º croissant gratis)", "9.00", "2.60", "=B5-C5", "7.00", "=(B5-E5)/B5", "=E5-C5", "=SI(G5>0;D5/G5-1;\"pérdida\")", "0.2", "=SI(Y(F5<=I5;E5>=C5);\"Sí\";\"No\")"],
      ],
      note: "Cada fila es una canasta: un café + un croissant (A), un desayuno (B), cinco visitas (C) y dos cafés + dos croissants (D). Con coma decimal, cambia los puntos por comas; para tu negocio, sustituye las columnas B, C, E e I.",
      copyable: true,
    },
    tipos: {
      caption: "Qué tipo de promoción encaja con cada objetivo",
      purpose: "Elegir el tipo de oferta antes de diseñarla: cada una sirve a un objetivo distinto y tiene su propio riesgo.",
      columns: ["Tipo", "Sirve mejor para", "Riesgo principal", "Úsala cuando"],
      rows: [
        ["Descuento porcentual", "Mover un producto concreto", "Baja el margen de todas las ventas", "Necesitas rotar stock o llenar una franja"],
        ["Combo o paquete", "Subir el ticket medio", "Combinar productos con poco margen entre sí", "Tienes productos que se compran juntos"],
        ["2x1 y «gratis»", "Atraer clientes nuevos", "Se lee como regalo y se mide poco", "El regalo cuesta poco"],
        ["Tarjeta de fidelidad", "Que vuelvan quienes ya te conocen", "Tarda en dar resultados", "Tienes clientes que repiten"],
        ["Oferta por tiempo limitado", "Crear urgencia en un momento concreto", "Acostumbra al cliente a esperar la oferta", "Hay una fecha o un stock reales que acaban"],
      ],
      note: "Tabla cualitativa: orienta la elección, no sustituye las cuentas de cada caso.",
    },
    cuentasVsHoja: {
      caption: "Cuentas de la IA frente a mi hoja, fila por fila",
      purpose: "Comprobar que cada cifra que devolvió la IA coincide con la de tu hoja y saber de dónde viene una diferencia de centésimas.",
      columns: ["Promoción", "Margen después: cuentas de la IA", "Margen después: mi hoja", "Ventas necesarias: cuentas de la IA", "Ventas necesarias: mi hoja", "¿Coinciden?"],
      rows: [
        ["A · Combo de media mañana", "$2.70", "$2.70", "18.52 %", "18.5 %", "Sí"],
        ["B · Desayuno completo", "$3.975", "$3.98", "28.30 %", "28.3 %", "Sí"],
        ["C · Tarjeta de fidelidad", "$11.50", "$11.50", "39.13 %", "39.1 %", "Sí"],
        ["D · Ven acompañado", "$4.40", "$4.40", "45.45 %", "45.5 %", "Sí"],
      ],
      note: "Cuentas de la IA: transcritas de la prueba real. Mi hoja: las cuatro filas recalculadas con las fórmulas de la calculadora de esta guía y mostradas con el formato de la hoja (dos decimales en dinero, uno en porcentajes). Las diferencias son de redondeo.",
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "La IA interviene con un prompt en cuatro de los seis pasos. Los cálculos que deciden algo salen siempre de tu hoja.",
    steps: [
      {
        title: "Define tu objetivo y tus límites",
        description: "Escribe qué quieres conseguir con una cifra y qué no harás: «vender más» no sirve; «pasar de 20 a 24 pedidos por semana» sí.",
        output: "Un objetivo medible y una lista corta de límites.",
      },
      {
        title: "Arma tu hoja con las tres cuentas",
        description: "Con el prompt de fórmulas, o copiando la calculadora, deja lista una hoja que haga las tres cuentas.",
        output: "Una calculadora que funciona con números de práctica.",
      },
      {
        title: "Pide cuatro promociones distintas",
        description: "Envía a la IA tus precios, costos, objetivo y límites; pide alternativas de tipos distintos.",
        output: "Cuatro alternativas, todavía sin cifras.",
      },
      {
        title: "Pídele las cuentas y contrástalas con tu hoja",
        description: "Pide la tabla de cifras, recalcula las cuatro filas en tu hoja y puntúala con la rúbrica.",
        output: "Una tabla de cifras contrastada con la tuya.",
      },
      {
        title: "Decide con tus cifras y fija cómo medir",
        description: "Entrega a la IA tus cifras y tu condición de parada, y pide una recomendación.",
        output: "Una promoción con métrica, duración y condición de parada.",
      },
      {
        title: "Verifica y lanza en pequeño",
        description: "Repite las cuentas de la recomendación, recorre la lista de verificación y publica con fecha de fin.",
        output: "Una promoción lanzada con condiciones claras.",
      },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    formulas: {
      title: "Prompt de fórmulas: armar tu hoja sin compartir datos",
      objective: "Que la IA te dé las fórmulas de las tres cuentas a partir de la descripción de tus columnas, sin ver ninguna cifra de tu negocio.",
      whenToUse: "Cuando quieres construir la hoja o adaptar la calculadora a tus columnas.",
      variables: [
        { name: "PROGRAMA", description: "La hoja de cálculo que usas.", example: "Google Sheets" },
        { name: "COLUMNAS", description: "Letra y contenido de cada columna que ya tienes.", example: "A: promoción · B: precio normal de la canasta · C: costo de la canasta · E: precio con promoción · I: descuento máximo permitido" },
      ],
      prompt: `Actúa como asistente de hojas de cálculo para una persona sin experiencia. Tu destinatario es el dueño de un negocio pequeño, que escribirá las fórmulas él mismo. Tu objetivo es darle las fórmulas de tres cuentas de promoción a partir de la descripción de sus columnas, sin ver sus datos.

### CONTEXTO
Programa de hoja de cálculo: {{PROGRAMA}}

### DATOS
Columnas de mi hoja (letra y qué contiene):
{{COLUMNAS}}

### CUENTAS QUE NECESITO
${LISTA_CUENTAS}
4. Si la promoción respeta mis límites: el descuento real no supera el descuento máximo de mi hoja y el precio con promoción no es menor que el costo.
5. El costo de una canasta con varios productos: la suma de los costos de cada producto.

### REGLAS
1. Usa solo las columnas que te describí. Si falta una para alguna cuenta, escribe [FALTA: la columna] y no inventes una.
2. No me pidas ni uses cifras reales de mi negocio. Para comprobar cada fórmula usa números de práctica sencillos (por ejemplo, precio 10 y costo 4).
3. Escribe cada fórmula para la fila 2, con el nombre de las funciones en español y en inglés, y recuérdame que el separador entre argumentos depende de la configuración regional.
4. Si una fórmula puede dar un error (división entre cero, margen negativo), trata ese caso con una función condicional y explícalo.
5. Explica en una frase qué hace cada fórmula, sin jerga.
6. Si no conoces el nombre exacto de una función en mi programa, dilo en lugar de suponerlo.

### FORMATO DE SALIDA
Una tabla con columnas fijas: Columna | Qué calcula | Fórmula en español | Fórmula en inglés | Comprobación con números de práctica. Después, una lista «Cómo pegarla» con dónde escribirla y cómo copiarla hacia abajo. La tabla define la forma; el contenido sale de mis columnas.

### ANTES DE RESPONDER
Verifica que: cada fórmula aplica la definición de arriba tal como está escrita; la comprobación con números de práctica es correcta (calcúlala dos veces); cada fórmula usa solo las columnas descritas; los casos de error están tratados; no usaste cifras de mi negocio. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "…sin ver sus datos.",
          why: "Le describes la estructura, no las cifras.",
        },
        {
          part: "…usa números de práctica sencillos (por ejemplo, precio 10 y costo 4).",
          why: "Te permite comprobar la fórmula con cuentas que haces de cabeza.",
        },
        {
          part: "Si una fórmula puede dar un error… trata ese caso con una función condicional…",
          why: "Evita el error típico de dividir por cero cuando un precio baja hasta el costo.",
        },
      ],
      evaluate: "Escribe la fórmula en tu hoja con los números de práctica: el resultado debe coincidir con la última columna.",
      improve: "Si tu programa no reconoce una función, pega su mensaje de error y pide la alternativa.",
      warnings: ["Con coma decimal, los argumentos suelen separarse con punto y coma."],
    },

    alternativas: {
      title: "Prompt de alternativas: cuatro promociones distintas",
      objective: "Obtener cuatro promociones de tipos distintos, ajustadas a tu negocio y a tus límites, sin cálculos ni predicciones.",
      whenToUse: "Cuando ya tienes precios, costos, objetivo y límites escritos.",
      variables: [
        { name: "NEGOCIO", description: "Qué negocio es y cómo trabaja.", example: "Cafetería de barrio con dos personas en el mostrador" },
        { name: "PUBLICO", description: "A quién quieres atraer y qué hace hoy en tu negocio.", example: "Vecinos que trabajan cerca y pasan de camino a la oficina" },
        { name: "PRODUCTOS_Y_COSTOS", description: "Precio y costo por unidad de cada producto involucrado.", example: "Café: precio $2.50, costo $0.60 · Croissant: precio $2.00, costo $0.70" },
        { name: "OBJETIVO", description: "Lo que quieres lograr, con una cifra.", example: OBJETIVO },
        { name: "FRANJA", description: "Cuándo aplica la promoción.", example: FRANJA },
        { name: "LIMITES", description: "Lo que no puedes o no quieres hacer.", example: LIMITES },
      ],
      prompt: `Actúa como asesor comercial para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá con sus propias cuentas. Tu objetivo es proponer cuatro promociones distintas entre sí, ajustadas a su negocio, sin calcular cifras.

### CONTEXTO
Negocio: {{NEGOCIO}}
Público: {{PUBLICO}}

### DATOS (los que YO te doy; son la única fuente de hechos)
Productos, precios y costos por unidad: {{PRODUCTOS_Y_COSTOS}}
Objetivo (con una cifra): {{OBJETIVO}}
Cuándo aplica: {{FRANJA}}
Límites que no puedo cruzar: {{LIMITES}}

### REGLAS
1. Usa solo los datos anteriores. Si necesitas uno que falta, pregúntame o márcalo como [FALTA: el dato].
2. Propón cuatro promociones de tipos distintos; no cuatro versiones del mismo descuento.
3. No hagas cálculos ni inventes precios, porcentajes o ventas. Si una promoción necesita un precio o un porcentaje, déjalo como dato que me falta.
4. No prometas ni estimes resultados de ventas.
5. Distingue lo que sale de mis datos, lo que supones y lo que sugieres.
6. Si mis datos se contradicen o no alcanzan para proponer algo útil, dímelo antes de proponer.

### FORMATO DE SALIDA
Para cada promoción, con estos títulos y en este orden: PROMOCIÓN (con su letra, de A a D, y su nombre), Qué se ofrece (una frase para explicárselo al cliente), Qué compra el cliente (la canasta: qué productos y cuántos), Por qué encaja (con mi público y mi franja), Riesgo para mi margen (en palabras, sin cifras), Dato que me falta (o «ninguno»), Origen (de mis datos, supuesto o sugerido). Los títulos definen la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: las cuatro son de tipos distintos; ninguna incluye cálculos ni predicciones; cada una indica su canasta; lo que supones o sugieres está marcado; los precios o porcentajes que no te di figuran como dato que falta. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "No hagas cálculos ni inventes precios, porcentajes o ventas.",
          why: "Separa el trabajo: la IA propone y tú calculas.",
        },
        {
          part: "Qué compra el cliente (la canasta: qué productos y cuántos)",
          why: "Obliga a definir qué se vende, dato sin el cual no se puede calcular.",
        },
        {
          part: "Propón cuatro promociones de tipos distintos…",
          why: "Evita cuatro versiones del mismo descuento: para comparar hacen falta alternativas reales.",
        },
      ],
      evaluate: "Comprueba que cada promoción indica su canasta y que ninguna trae cálculos ni predicciones.",
      improve: "Si las alternativas se parecen, añade a tus límites qué tipos no quieres y pide otra ronda.",
      warnings: ["No pegues datos personales de clientes ni información confidencial de proveedores."],
    },

    cuentas: {
      title: "Prompt de cuentas: calcular las cifras para contrastarlas",
      objective: "Que la IA calcule las tres cuentas de cada promoción con tus fórmulas, muestre cada paso y marque lo que rompe tus límites.",
      whenToUse: "Con las cuatro alternativas ya recibidas, en la misma conversación, y con tu hoja abierta para contrastar.",
      variables: [
        { name: "PRECIOS_CON_PROMOCION", description: "Lo que pagaría el cliente por cada canasta; los decides tú.", example: PRECIOS_PROMO },
        { name: "LIMITES", description: "Tus límites, con el descuento máximo y el precio mínimo.", example: LIMITES },
      ],
      prompt: `Actúa como analista de promociones para un negocio pequeño. Tu destinatario es la persona dueña, que verificará tus cifras en su hoja de cálculo. Tu objetivo es calcular tres cuentas para cada promoción de esta conversación con las fórmulas que te doy, y marcar las que cruzan sus límites.

### CONTEXTO
Usa las promociones y las canastas propuestas más arriba, y los precios y costos que te di. Si falta alguno, pídemelo antes de calcular.

### DATOS
Precios con promoción que decidí (por canasta):
{{PRECIOS_CON_PROMOCION}}

Mis límites:
{{LIMITES}}

### FÓRMULAS (aplícalas tal cual)
${LISTA_CUENTAS}
El margen antes usa el precio normal de la canasta; el margen después, el precio con promoción.

### REGLAS
1. Convierte todo «2x1», «gratis» o «segundo a mitad de precio» en un precio con promoción para su canasta antes de aplicar las fórmulas: también son descuentos.
2. Usa solo los precios y costos de mis datos. Si falta uno, escribe [FALTA: el dato] y no calcules esa fila.
3. Si el margen después es cero o negativo, escribe «pérdida por venta» en lugar de un porcentaje.
4. No estimes cuánto aumentarán las ventas: las ventas necesarias son un umbral, no una predicción.
5. Muestra la cuenta paso a paso de cada fila, para que pueda repetirla.
6. Redondea a dos decimales solo al final y avísame de que mi hoja puede diferir en centésimas.
7. Marca cada fila «No» si supera mi descuento máximo o si el precio queda por debajo del costo.

### FORMATO DE SALIDA
Una tabla con columnas fijas: Promoción | Precio normal | Precio con promoción | Costo | Descuento real | Margen antes → después | Ventas necesarias | ¿Respeta mis límites? Debajo, «Cuentas paso a paso» y «Para comprobar tú» (las cifras que debo recalcular en mi hoja). La tabla define la forma; el contenido sale de mis promociones.

### ANTES DE RESPONDER
Verifica que: cada fila usa la canasta propuesta; aplicaste las tres fórmulas tal como están escritas; recalculaste cada cifra una segunda vez y coinciden; los 2x1 y los «gratis» están convertidos; ninguna cifra sale de otro origen que mis datos; marcaste los límites. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Convierte todo «2x1», «gratis» o «segundo a mitad de precio» en un precio con promoción…",
          why: "Evita que un regalo parezca estar dentro de tu límite.",
        },
        {
          part: "Muestra la cuenta paso a paso de cada fila…",
          why: "Te permite repetir cada fila y ver dónde difiere.",
        },
        {
          part: "las ventas necesarias son un umbral, no una predicción.",
          why: "Corta de raíz la promesa de aumentos que ningún dato respalda.",
        },
      ],
      evaluate: "Recalcula en tu hoja al menos una fila completa y compárala con la de la IA.",
      improve: "Si una fila no coincide, pega tu cifra y pide que revise su cuenta; no la corrijas a ciegas.",
      warnings: ["Aunque el prompt le pide comprobar sus cuentas, puede equivocarse: la referencia es tu hoja."],
    },

    decision: {
      title: "Prompt de decisión: recomendar con tus cifras",
      objective: "Que la IA recomiende una promoción usando solo tus cifras comprobadas y deje por escrito qué medir, cuánto dura y cuándo pararla.",
      whenToUse: "Tras contrastar las cuentas de la IA con tu hoja, cuando ya tienes tus cifras.",
      variables: [
        { name: "MIS_CIFRAS", description: "La tabla de tu hoja, ya comprobada.", example: "La tabla de la calculadora, con las cuatro filas" },
        { name: "VENTAS_ACTUALES", description: "Cuánto vendes hoy de la canasta afectada.", example: VENTAS_ACTUALES },
        { name: "DURACION", description: "Cuánto durará la prueba.", example: "Tres semanas" },
        { name: "PARADA", description: "La condición con la que detendrás la promoción; la decides tú.", example: PARADA },
      ],
      prompt: `Actúa como asesor comercial para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá con sus propias cuentas. Tu objetivo es recomendar una promoción usando SOLO sus cifras comprobadas y dejar por escrito qué medir, cuánto dura y cuándo detenerla.

### CONTEXTO
Usa las promociones, el objetivo y los límites de esta conversación. Si falta alguno, pídemelo antes de seguir.

### DATOS (comprobados por mí en mi hoja; sustituyen cualquier cifra tuya anterior)
{{MIS_CIFRAS}}

Ventas actuales de la canasta afectada: {{VENTAS_ACTUALES}}
Duración de la prueba: {{DURACION}}
Condición de parada que decidí: {{PARADA}}

### REGLAS
1. Usa exclusivamente mis cifras. Si tus cifras anteriores difieren de las mías, ignóralas y dime en qué filas difieren.
2. No corrijas mis cifras. Si una te parece inconsistente, pregúntame.
3. Descarta las promociones que superan mis límites y explica cada descarte con su cifra.
4. Con mis ventas actuales, compara el margen semanal de hoy con el de la promoción y muestra la cuenta.
5. No prometas ni estimes resultados de ventas: di qué cifra tendría que cumplirse.
6. La condición de parada es la mía; no la reemplaces ni inventes umbrales.
7. Termina con «Para comprobar tú»: las cuentas que debo repetir antes de lanzar.

### FORMATO DE SALIDA
En este orden: (1) «Diferencias con tus cifras anteriores»; (2) «Descartadas», con motivo; (3) «Recomendación»: una promoción con la cuenta semanal; (4) «Qué medir»; (5) «Duración y parada», con mis datos; (6) «Para comprobar tú». Los títulos definen la forma; el contenido sale de mis cifras.

### ANTES DE RESPONDER
Verifica que: solo usaste mis cifras; las diferencias están listadas; las descartadas superan de verdad un límite; la cuenta semanal usa mis ventas actuales; la parada es la mía; no hay predicciones ni umbrales inventados. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "…sustituyen cualquier cifra tuya anterior",
          why: "Deja claro qué cifras mandan: las que comprobaste tú, no las de la IA.",
        },
        {
          part: "La condición de parada es la mía; no la reemplaces ni inventes umbrales.",
          why: "Cuándo parar es una decisión tuya, no de la IA.",
        },
        {
          part: "«Para comprobar tú»",
          why: "Lista las cuentas que debes repetir antes de lanzar.",
        },
      ],
      evaluate: "Repite con una calculadora las cuentas de «Para comprobar tú».",
      improve: "Si la recomendación no encaja, cambia el objetivo o los límites y repite; no pidas otra opinión sin datos.",
    },
  },

  /* ───────────────────────────── primer resultado (prueba real, transcripción literal) ───────────────────────────── */
  firstResult: {
    kind: "real",
    promptId: "alternativas",
    intro: "Transcripción literal de la captura de la prueba real, sin cambios.",
    parts: [
      {
        type: "table",
        table: {
          caption: "Las cuatro promociones, tal como respondió la IA",
          purpose: "Leer cada alternativa con su canasta, su riesgo y el dato que le falta, antes de calcular ninguna cifra.",
          columns: ["Campo", "A — Combo de media mañana", "B — Desayuno completo", "C — Tarjeta de fidelidad", "D — Ven acompañado"],
          rows: [
            [
              "Qué se ofrece",
              "Café + croissant como combinación especial",
              "Desayuno completo a precio promocional",
              "Incentivo para volver a comprar durante la franja lenta",
              "Beneficio para clientes que vengan acompañados",
            ],
            ["Qué compra el cliente", "1 café + 1 croissant", "1 desayuno completo: café + croissant + jugo natural", "1 café + 1 croissant por visita", "2 cafés + 2 croissants"],
            [
              "Por qué encaja",
              "Coincide directamente con el objetivo de aumentar los pedidos de café + croissant entre 9:30 y 11:30",
              "El desayuno reúne tres productos del negocio y puede dirigirse a personas que trabajan en la zona",
              "Vecinos y trabajadores de la zona pueden tener oportunidades de volver durante la semana",
              "Busca generar compras de dos personas en una franja con poca entrada de clientes",
            ],
            [
              "Riesgo para mi margen",
              "El descuento reduce el margen de la combinación",
              "El descuento reduce el margen de la venta completa",
              "La recompensa puede reducir el margen de una compra futura",
              "El beneficio entregado al acompañante puede reducir el margen",
            ],
            [
              "Dato que me falta",
              "Precio o porcentaje de descuento",
              "Precio o porcentaje de descuento",
              "Cantidad de compras necesarias y recompensa",
              "Beneficio concreto para quien venga acompañado",
            ],
            ["Origen", "Datos + sugerido", "Datos + sugerido", "Datos + sugerido", "Datos + sugerido"],
            ["Tipo", "Combo", "Descuento", "Fidelización", "Captación por acompañante"],
          ],
        },
      },
      {
        type: "text",
        text: "**Dato común:** todas se plantean para **martes a jueves, de 9:30 a 11:30**, y cualquier descuento debe respetar el límite máximo del 20 % y no llevar el precio por debajo del costo.",
      },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "cuentas-ia",
    title: "Puntúa las cuentas de la IA",
    intro:
      "Contrasta la tabla de la IA con tu hoja y respóndele a los seis criterios: 0, 1 o 2 puntos cada uno, hasta " +
      MAXIMO +
      ". Si «" +
      CRITERIOS[3].label +
      "» saca 0, no uses esas cifras aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.",
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro: "La tabla se ve profesional y las cuentas están a la vista. Por eso hay que reproducirla: una sola fila mal calculada cambia la recomendación.",
    criteria: [
      {
        criterionId: "datos",
        verdict: "ok",
        comment: "Usa los precios y costos que diste; ninguna cifra sale de otro origen.",
      },
      {
        criterionId: "descuento",
        verdict: "ok",
        comment: "Convierte la tarjeta en un 20 % (cinco visitas, la quinta gratis) y el segundo croissant gratis en un 22.22 %, con la canasta de cada una.",
      },
      {
        criterionId: "formulas",
        verdict: "ok",
        comment: "Aplicó el 15 % al precio del desayuno, no al margen: $6.375 − $2.40 = $3.975.",
      },
      {
        criterionId: "coinciden",
        verdict: "ok",
        comment: "Las cuatro filas coinciden con la hoja.",
      },
      {
        criterionId: "limites",
        verdict: "ok",
        comment: "Marca la promoción D como fuera de tu límite: su descuento real es 22.22 %, más del 20 %.",
      },
      {
        criterionId: "prediccion",
        verdict: "ok",
        comment: "Presenta las ventas necesarias como umbral, no como pronóstico.",
      },
    ],
    conclusion:
      "En nuestra prueba real, las cuatro filas coinciden. Aun así, la decisión se toma con tu hoja: una sola fila mal calculada cambia la recomendación.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar es volver a la misma conversación con un mensaje corto que la lleva al siguiente paso. No empiezas de cero: le entregas tus cifras como fuente.",
    promptId: "decision",
    why: "El contraste confirmó que las cuatro filas coinciden con tu hoja, pero una tabla no decide: falta elegir una promoción, con qué medirla y cuándo pararla. El mensaje entrega tus cifras y tu condición de parada, y pide la recomendación con lo que se medirá.",
  },

  /* ───────────────────────────── resultado final (prueba real, transcripción literal) ───────────────────────────── */
  improvedResult: {
    kind: "real",
    promptId: "decision",
    intro: "Transcripción literal de las dos capturas de la prueba real, sin cambios.",
    parts: [
      { type: "text", text: "**1. Diferencias con tus cifras anteriores**" },
      { type: "text", text: "Tus cifras comprobadas sustituyen las anteriores. Las diferencias relevantes son:" },
      {
        type: "list",
        items: [
          "**A:** mis cifras anteriores coincidían con las tuyas.",
          "**B:** mis cifras anteriores coincidían con las tuyas.",
          "**C:** mis cifras anteriores coincidían con las tuyas.",
          "**D:** mis cifras anteriores coincidían con las tuyas.",
        ],
      },
      { type: "text", text: "No hay diferencias numéricas que corregir entre los cálculos anteriores y los datos que ahora das." },
      { type: "text", text: "**2. Descartadas**" },
      { type: "text", text: "**D — Ven acompañado**" },
      { type: "text", text: "Se descarta porque **supera el descuento máximo permitido**:" },
      { type: "list", items: ["Descuento real: 22.2 %", "Límite: 20 %", "Resultado: **No respeta el límite**"] },
      { type: "text", text: "Aun cuando el margen después es positivo ($4.40), la promoción no cumple tu condición de descuento máximo." },
      { type: "text", text: "Las promociones A, B y C permanecen disponibles porque respetan el límite." },
      { type: "text", text: "**3. Recomendación**" },
      { type: "text", text: "**A — Combo de media mañana**" },
      {
        type: "text",
        text: "La recomiendo como promoción de prueba porque es la alternativa que, según tus cifras, requiere el menor incremento de ventas para compensar la reducción del margen por pedido.",
      },
      { type: "text", text: "**Situación actual:**" },
      { type: "list", items: ["20 pedidos por semana", "Margen normal por pedido: $3.20", "Margen semanal actual: 20 × $3.20 = $64.00"] },
      { type: "text", text: "**Con la promoción A:**" },
      { type: "list", items: ["Margen por pedido: $2.70", "Margen semanal si se mantienen 20 pedidos: 20 × $2.70 = $54.00"] },
      { type: "text", text: "Por tanto, con 20 pedidos semanales, la promoción produciría **$54.00 de margen**, frente a **$64.00** actualmente." },
      { type: "text", text: "Tu cifra comprobada indica que se necesitan **+18.5 % de ventas** para compensar esa reducción de margen." },
      { type: "text", text: "No estoy estimando que se alcance ese incremento; durante la prueba tendrás que comprobar cuántos pedidos se producen realmente." },
      { type: "text", text: "**4. Qué medir**" },
      { type: "text", text: "Durante la prueba registra, para martes a jueves, de 9:30 a 11:30:" },
      {
        type: "table",
        table: {
          caption: "Qué medir durante la prueba, según la IA",
          purpose: "Ver las cinco cifras que se registran cada semana y con qué se compara la promoción.",
          columns: ["Métrica", "Qué registrar"],
          rows: [
            ["Pedidos de la canasta", "Número de pedidos de café + croissant"],
            ["Margen por pedido", "$2.70 durante la promoción A"],
            ["Pedidos semanales", "Total de la franja durante cada semana"],
            ["Margen semanal de la promoción", "Pedidos de la semana × $2.70"],
            ["Referencia actual", "20 pedidos × $3.20 = $64.00"],
          ],
        },
      },
      { type: "text", text: "El dato principal que debes comprobar es si el volumen de pedidos alcanza el nivel necesario para compensar el menor margen por pedido." },
      { type: "text", text: "**5. Duración y parada**" },
      { type: "text", text: "**Duración:** tres semanas." },
      { type: "text", text: "**Condición de parada que decidiste:**" },
      { type: "text", text: "«Si después de dos semanas hay **menos de 24 pedidos por semana**, detienes la promoción.»" },
      { type: "text", text: "No sustituyo ese criterio ni añado otro umbral." },
      {
        type: "text",
        text: "Tu referencia actual es 20 pedidos de café + croissant por semana. La prueba debe comprobar si el volumen alcanza el nivel que has establecido para la decisión.",
      },
      { type: "text", text: "**6. Para comprobar tú**" },
      { type: "text", text: "Antes de lanzar, repite estas cuentas en tu hoja:" },
      { type: "text", text: "**Situación actual**" },
      { type: "list", items: ["20 × $3.20 = $64.00 de margen semanal"] },
      { type: "text", text: "**Promoción A**" },
      {
        type: "list",
        items: [
          "Margen por pedido: $4.00 − $1.30 = $2.70",
          "Margen semanal con 20 pedidos: 20 × $2.70 = $54.00",
          "Descuento real: ($4.50 − $4.00) ÷ $4.50 = 11.1 %",
          "Ventas necesarias: +18.5 %",
        ],
      },
      { type: "text", text: "**Límite**" },
      { type: "list", items: ["11.1 % ≤ 20 % → Sí", "$4.00 > $1.30 → Sí"] },
      {
        type: "text",
        text: "Y conserva como condición de decisión la que ya definiste: **tres semanas de prueba y detener después de dos semanas si hay menos de 24 pedidos por semana**.",
      },
    ],
  },

  /* ───────────────────────────── ejemplos ───────────────────────────── */
  examples: [
    {
      id: "restaurante",
      title: "Restaurante: menú del día entre semana",
      business: "La Esquina — restaurante de menú ejecutivo (ficticio)",
      scenario: "Los lunes y martes el comedor se llena a medias; la dueña no quiere bajar el precio del menú.",
      keyData: [
        { label: "Menú del día", value: "$9.00 · costo $3.60 · margen $5.40" },
        { label: "Opción 1", value: "Bebida incluida, con costo de $0.50" },
        { label: "Opción 2", value: "15 % de descuento" },
      ],
      approach:
        "La bebida deja el descuento real en 0 %, pero baja el margen de 5.40 a 4.90: exige un 10.2 % más de ventas. El 15 % lo baja a 4.05: un 33.3 % más.",
      decision: "La bebida exige mucho menos crecimiento: se prueba dos semanas, sin tocar el precio.",
      fictional: true,
    },
    {
      id: "servicio",
      title: "Servicio: estudio de fotografía",
      business: "Luz Cálida — estudio de fotografía (ficticio)",
      scenario: "En un servicio con agenda, una hora vacía no se recupera; los martes y miércoles hay huecos.",
      keyData: [
        { label: "Sesión", value: "$60.00 · costos directos $12.00 · margen $48.00" },
        { label: "Promoción", value: "20 % en martes y miércoles" },
      ],
      approach:
        "Con el 20 %, la sesión cuesta 48.00 y el margen baja a 36.00: hacen falta un 33.3 % más de sesiones. El tiempo de la persona no está en el costo: se valora aparte.",
      decision: "Se limita a cuatro huecos por semana y se mantiene el precio completo el resto de días, para no enseñar a esperar el descuento.",
      fictional: true,
    },
  ],

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Empezar por el descuento y no por el objetivo",
      whyItHurts: "Si eliges «un 20 %» antes de saber qué quieres, no puedes juzgar si la oferta sirve.",
      instead: "Escribe primero el objetivo con una cifra y una franja; el descuento es solo una herramienta.",
    },
    {
      title: "Comparar canastas distintas",
      whyItHurts: "Comparar el margen de un café con el de dos hace parecer una promoción mejor o peor de lo que es.",
      instead: "Define la canasta de cada promoción y calcula su margen antes y después sobre esa misma canasta.",
    },
    {
      title: "Lanzar sin fecha de fin ni métrica",
      whyItHurts: "Sin fin, la promoción se convierte en tu precio real. Sin métrica, no sabrás si funcionó.",
      instead: "Antes de lanzar, escribe la fecha de fin, la cifra que vas a mirar y la condición de parada.",
    },
    {
      title: "Compartir con la IA datos que no hacen falta",
      whyItHurts: "Nombres de clientes o proveedores no sirven para diseñar una promoción y pueden ser confidenciales.",
      instead: "Comparte solo precios, costos y contexto general; para las fórmulas basta con describir las columnas.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de lanzar, repasa esta lista: ninguna respuesta de la IA se usa sin pasar por aquí.",
    items: [
      { label: "Recalculé en mi hoja las cuentas de la recomendación.", detail: "Margen antes y después, y ventas necesarias." },
      { label: "Las cifras que usé son las de mi hoja, no las de la IA." },
      { label: "Ninguna promoción baja del costo ni supera mi límite de descuento.", detail: "Incluidos el 2x1 y el «gratis», convertidos a porcentaje." },
      { label: "Eliminé toda afirmación sobre ventas futuras." },
      { label: "Las condiciones son claras: fechas, exclusiones y stock." },
      { label: "Puedo cumplir la oferta con mi equipo y mi stock." },
      { label: "Revisé las reglas de mi país o ciudad sobre promociones y publicidad de precios.", detail: "Varían según el lugar; esta guía no las cubre." },
    ],
    principle: "La IA ayuda a generar y analizar. La persona verifica y decide.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Después del lanzamiento, el trabajo es medir y aprender. La segunda promoción parte de una hoja que ya funciona.",
    steps: [
      { title: "Anota la métrica cada semana", detail: "Registra los pedidos de la canasta y compáralos con el umbral." },
      { title: "Compara el margen semanal real", detail: "Al cerrar, contrasta lo que ganaste con lo que ganabas antes." },
      { title: "Decide qué haces con la oferta", detail: "Extenderla, ajustarla o retirarla, según lo que mediste." },
      { title: "Guarda la calculadora como plantilla", detail: "Cambia solo precios, costos y límite." },
      { title: "Actualiza los costos cuando cambien", detail: "Un costo desactualizado falsea todas las cuentas que vengan después." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "Este método ayuda a decidir mejor, pero tiene límites que conviene conocer.",
    items: [
      { title: "No conoce tu mercado local", detail: "La IA no ve qué hace tu competencia ni cómo se comportan tus clientes." },
      {
        title: "Las cuentas son una simplificación",
        detail: "Comparan el margen de una canasta: no incluyen lo que más compra quien entra por la oferta, ni costos fijos, impuestos o el tiempo de tu equipo.",
      },
      { title: "No predice cuánto venderás", detail: "Calcula cuánto necesitarías vender para no perder; que lo consigas depende de ti." },
      { title: "Puede equivocarse al calcular", detail: "Aun con las fórmulas a la vista, puede cometer errores de cálculo o presentar con seguridad algo falso: por eso decides con tu hoja." },
      { title: "No sustituye asesoría legal o contable", detail: "Las reglas sobre promociones, precios y consumidores varían por país." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Una buena promoción empieza en tu hoja de cálculo, no en la pantalla del asistente. La IA es útil para proponer alternativas y ordenar la decisión, pero el criterio (tus límites, tu margen, tu objetivo) lo pones tú.",
    takeaways: [
      "Calcula el margen por canasta antes de diseñar cualquier oferta.",
      "Un 2x1 o un «gratis» es un descuento: conviértelo a porcentaje.",
      "La primera respuesta de la IA es una lluvia de ideas; la decisión sale de tus cifras.",
      "Las ventas necesarias son un umbral, nunca una predicción.",
      "Lanza en pequeño, con fecha de fin, métrica y condición de parada.",
    ],
    nextGuide: "crear-anuncios-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["prompt", "asistente-ia", "variable", "hoja-de-calculo", "margen", "rubrica", "dato-inventado"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Y si no sé cuánto me cuestan mis productos?",
      answer:
        "Sin costos no puedes saber si una oferta deja ganancia. Empieza por un costo aproximado de cada producto (ingredientes, empaque, compra al proveedor): es mejor que ninguno.",
    },
    {
      question: "¿Es seguro pegar mis precios y costos en una herramienta de IA?",
      answer:
        "Depende de la herramienta y de cuán confidencial sea para ti: revisa su política de privacidad y no incluyas datos de clientes. Para las fórmulas basta con describir las columnas.",
    },
    {
      question: "¿Puede la IA decirme cuánto voy a vender con la promoción?",
      answer:
        "No con fiabilidad. Puede calcular cuánto tendrías que vender para ganar lo mismo que hoy; cuánto venderás depende de tu clientela y del momento.",
    },
    {
      question: "¿Cuánto tiempo debo probar una promoción?",
      answer:
        "Lo suficiente para compararla con tus semanas normales; con pocas ventas por semana, una prueba corta varía mucho. Las tres semanas del ejemplo son ilustrativas: fija tú la duración antes de empezar.",
    },
  ],
});

/* ───────────────────────────── transcripciones literales (pruebas reales 01 y 03) ───────────────────────────── */

/** Prueba real 01 (`prueba-prompt-01.webp`): la respuesta al prompt de fórmulas, sin cambios. */
export const formulasResult: ResultData = {
  kind: "real",
  promptId: "formulas",
  intro: "Transcripción literal de la captura de la prueba real, sin cambios.",
  parts: [
    {
      type: "table",
      table: {
        caption: "Fórmulas de la calculadora, tal como respondió la IA",
        purpose: "Ver qué fórmula va en cada columna y cómo comprobarla con números de práctica antes de usar tus datos.",
        columns: ["Columna", "Qué calcula", "Fórmula en español", "Fórmula en inglés", "Comprobación con números de práctica"],
        rows: [
          ["D2 — Margen antes", "Resta el costo al precio normal.", "=B2-C2", "=B2-C2", "Si B2=10 y C2=4 → 6"],
          ["F2 — Descuento real", "Calcula qué parte del precio normal se descontó.", "=SI(B2=0;\"\";(B2-E2)/B2)", "=IF(B2=0,\"\",(B2-E2)/B2)", "B2=10, E2=8 → (10−8)/10 = 20 %"],
          ["G2 — Margen después", "Resta el costo al precio promocional.", "=E2-C2", "=E2-C2", "E2=8, C2=4 → 4"],
          [
            "H2 — Ventas necesarias",
            "Compara el margen antes con el margen después, según tu fórmula.",
            "=SI(G2<=0;\"pérdida por venta\";D2/G2-1)",
            "=IF(G2<=0,\"pérdida por venta\",D2/G2-1)",
            "D2=6, G2=4 → 6/4−1 = 50 %",
          ],
          [
            "J2 — ¿Respeta el límite?",
            "Comprueba que el descuento no supere el máximo y que el precio promocional no sea menor que el costo.",
            "=SI(Y(F2<=I2;E2>=C2);\"Sí\";\"No\")",
            "=IF(AND(F2<=I2,E2>=C2),\"Sí\",\"No\")",
            "F2=20 %, I2=20 %, E2=8, C2=4 → Sí",
          ],
          ["C2 — Costo de combo", "Suma el costo del café y el croissant.", "=C10+C11", "=C10+C11", "Si C10=2 y C11=3 → 5"],
        ],
      },
    },
    { type: "text", text: "**Cómo pegarla**" },
    {
      type: "list",
      ordered: true,
      items: [
        "En D2, pega la fórmula del margen antes.",
        "En F2, pega la fórmula del descuento real.",
        "En G2, pega la fórmula del margen después.",
        "En H2, pega la fórmula de ventas necesarias.",
        "En J2, pega la fórmula que comprueba los límites.",
        "Para una promoción cuyo costo sea específicamente **café + croissant**, puedes poner en C2: `=C10+C11`",
        "Selecciona las celdas con fórmulas de la fila 2 y arrastra el pequeño cuadrado de la esquina inferior derecha hacia abajo para copiarlas a las demás promociones.",
      ],
    },
    {
      type: "text",
      text: "**Importante:** la fórmula de H2 sigue exactamente tu definición: `margen antes ÷ margen después − 1`. Si el margen después es cero o negativo, muestra «pérdida por venta» en lugar de intentar dividir.",
    },
    {
      type: "text",
      text: "Las comprobaciones prácticas también coinciden al repetirlas: 10−4=6; (10−8)/10=0.20; 8−4=4; 6/4−1=0.50; y el límite se cumple cuando 20 % no supera 20 % y 8 no es menor que 4.",
    },
  ],
};

/** Prueba real 03 (`prueba-prompt-03.webp`): la respuesta al prompt de cuentas, sin cambios. */
export const cuentasResult: ResultData = {
  kind: "real",
  promptId: "cuentas",
  intro: "Transcripción literal de la captura de la prueba real, sin cambios.",
  parts: [
    {
      type: "table",
      table: {
        caption: "Cuentas devueltas por la IA para las cuatro promociones",
        purpose: "Ver la tabla tal como llegó, con el formato que pidió el prompt, para contrastarla fila por fila con tu hoja.",
        columns: ["Promoción", "Precio normal", "Precio con promoción", "Costo", "Descuento real", "Margen antes → después", "Ventas necesarias", "¿Respeta mis límites?"],
        rows: [
          ["A — Combo de media mañana", "$4.50", "$4.00", "$1.30", "11.11 %", "$3.20 → $2.70", "18.52 %", "Sí"],
          ["B — Desayuno completo", "$7.50", "$6.375", "$2.40", "15.00 %", "$5.10 → $3.975", "28.30 %", "Sí"],
          ["C — Tarjeta de fidelidad", "$22.50", "$18.00", "$6.50", "20.00 %", "$16.00 → $11.50", "39.13 %", "Sí"],
          ["D — Ven acompañado", "$9.00", "$7.00", "$2.60", "22.22 %", "$6.40 → $4.40", "45.45 %", "No — supera el 20 %"],
        ],
      },
    },
    { type: "text", text: "**Cuentas paso a paso**" },
    { type: "text", text: "**A — Combo de media mañana**" },
    {
      type: "list",
      items: [
        "Costo: $0.60 + $0.70 = $1.30",
        "Margen antes: $4.50 − $1.30 = $3.20",
        "Margen después: $4.00 − $1.30 = $2.70",
        "Descuento real: ($4.50 − $4.00) ÷ $4.50 = 11.11 %",
        "Ventas necesarias: $3.20 ÷ $2.70 − 1 = 18.52 %",
      ],
    },
    { type: "text", text: "**B — Desayuno completo**" },
    {
      type: "list",
      items: [
        "Costo: $0.60 + $0.70 + $1.10 = $2.40",
        "Margen antes: $7.50 − $2.40 = $5.10",
        "Margen después: $6.375 − $2.40 = $3.975",
        "Descuento real: ($7.50 − $6.375) ÷ $7.50 = 15.00 %",
        "Ventas necesarias: $5.10 ÷ $3.975 − 1 = 28.30 %",
      ],
    },
    { type: "text", text: "**C — Tarjeta de fidelidad**" },
    { type: "text", text: "La canasta son cinco visitas de café + croissant:" },
    {
      type: "list",
      items: [
        "Costo: 5 × ($0.60 + $0.70) = $6.50",
        "Precio normal: 5 × ($2.50 + $2.00) = $22.50",
        "Margen antes: $22.50 − $6.50 = $16.00",
        "Margen después: $18.00 − $6.50 = $11.50",
        "Descuento real: ($22.50 − $18.00) ÷ $22.50 = 20.00 %",
        "Ventas necesarias: $16.00 ÷ $11.50 − 1 = 39.13 %",
      ],
    },
    { type: "text", text: "**D — Ven acompañado**" },
    { type: "text", text: "El segundo croissant gratis se convierte en una canasta de $7.00:" },
    {
      type: "list",
      items: [
        "Costo: ($0.60 × 2) + ($0.70 × 2) = $2.60",
        "Margen antes: $9.00 − $2.60 = $6.40",
        "Margen después: $7.00 − $2.60 = $4.40",
        "Descuento real: ($9.00 − $7.00) ÷ $9.00 = 22.22 %",
        "Ventas necesarias: $6.40 ÷ $4.40 − 1 = 45.45 %",
        "Límite: 22.22 % > 20 %, por lo que no respeta tu límite de descuento.",
      ],
    },
    { type: "text", text: "**Para comprobar tú**" },
    {
      type: "table",
      table: {
        caption: "Para comprobar tú: qué recalcular en la hoja",
        purpose: "Repetir en tu hoja las cuentas de cada promoción para ver si coinciden con las de la IA.",
        columns: ["Promoción", "Recalcular en la hoja"],
        rows: [
          ["A", "Costo = 0.60 + 0.70 = 1.30 · Margen después = 4.00 − 1.30 = 2.70 · Descuento = (4.50 − 4.00) / 4.50 = 11.11 % · Ventas = 3.20 / 2.70 − 1 = 18.52 %"],
          ["B", "Costo = 0.60 + 0.70 + 1.10 = 2.40 · Margen después = 6.375 − 2.40 = 3.975 · Descuento = (7.50 − 6.375) / 7.50 = 15.00 % · Ventas = 5.10 / 3.975 − 1 = 28.30 %"],
          ["C", "Costo = 5 × (0.60 + 0.70) = 6.50 · Margen después = 18.00 − 6.50 = 11.50 · Descuento = (22.50 − 18.00) / 22.50 = 20.00 % · Ventas = 16.00 / 11.50 − 1 = 39.13 %"],
          ["D", "Costo = (2 × 0.60) + (2 × 0.70) = 2.60 · Margen después = 7.00 − 2.60 = 4.40 · Descuento = (9.00 − 7.00) / 9.00 = 22.22 % · Ventas = 6.40 / 4.40 − 1 = 45.45 %"],
        ],
      },
    },
    {
      type: "text",
      text: "**Conclusión estrictamente numérica:** A, B y C respetan tus límites. D no, porque su descuento real es 22.22 %, aunque su precio promocional sigue estando por encima del costo.",
    },
  ],
};

/** «Ilustración: el error más frecuente» (caso ficticio): lo lee el componente `ErrorFrecuente` de ./components. */
export const errorFrecuente = {
  incorrecto: { titulo: "El 15 % aplicado al margen", cuenta: "5.10 × 0.85 = 4.34", ventas: "+17.6 %" },
  correcto: { titulo: "El 15 % aplicado al precio", cuenta: "6.375 − 2.40 = 3.975", ventas: "+28.3 %" },
  nota: "En nuestra prueba real, la IA no cometió este error; es el que más aparece y la razón para recalcular siempre en tu hoja.",
};
