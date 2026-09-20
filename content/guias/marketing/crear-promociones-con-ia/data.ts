import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * marketing/crear-promociones-con-ia — regenerada con el estándar v3 (la publicación y las imágenes
 * previstas se conservan: `slug` y `publishedAt` no cambian).
 *
 * Tipo: números y datos, con una parte de decisión. Todo el caso (Café Mirador, precios, costos y
 * ventas) es FICTICIO. Cada cifra se verificó con código (ver README.md). Las respuestas de la IA son
 * EJEMPLOS GENERADOS: están redactadas aplicando literalmente cada prompt a los datos del caso; no
 * proceden de una conversación real ni de una prueba del autor. Las pruebas reales viven en
 * `evidence.pruebas`, que solo rellena el autor.
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
const PARADA = "Detener si tras dos semanas se venden menos de 22 pedidos por semana";
const PRECIOS_PROMO = "A: $2.50 por dos cafés · B: $4.00 por café + croissant · C: 15 % menos que $7.50 · D: $10.00 por cinco cafés";

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
    updatedAt: "2026-09-19",
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
      purpose: "Resume el método en una escena: una hoja de cálculo con las cuentas de una promoción junto a una conversación con la IA.",
      description:
        "Una mesa de trabajo de cafetería (caso ficticio) con una laptop que muestra, a un lado, la hoja con margen y descuento real de cuatro promociones y, al otro, una conversación con un asistente de IA. Una libreta con el objetivo y los límites escritos a mano. Sin logotipos reales ni datos de personas.",
      alt: "Mesa de una cafetería con una laptop que muestra una hoja de cálculo con las cuentas de cuatro promociones y una conversación con un asistente de IA.",
      caption: "Tu hoja calcula; la IA propone; tú decides.",
    }),
    datos: slot("datos-necesarios.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Enseña qué datos reunir antes de abrir la IA y con qué nivel de detalle: precio y costo por unidad de cada producto.",
      description:
        "Una hoja de cálculo con cuatro columnas (producto, precio, costo y margen) para los cuatro productos del caso ficticio. Resaltar la columna de costo. Debajo, dos líneas con el objetivo y los límites. Sin datos personales.",
      alt: "Hoja de cálculo con producto, precio, costo y margen de cuatro productos de una cafetería, y el objetivo y los límites debajo.",
      caption: "Precio y costo por unidad: la base de todo.",
      zoom: true,
    }),
    hoja: slot("calculadora-de-promociones.webp", {
      section: "hoja",
      ratio: "4/3",
      purpose: "Muestra la calculadora ya pegada en una hoja, con las fórmulas visibles, para que el lector vea que funciona sin salir de su programa.",
      description:
        "La calculadora pegada en la celda A1 de una hoja: cuatro filas de promociones, con los resultados en las columnas de margen, descuento real y ventas necesarias. Resaltar con un recuadro la barra de fórmulas mostrando la fórmula de ventas necesarias. Caso ficticio.",
      alt: "Hoja de cálculo con la calculadora de promociones pegada, cuatro filas de resultados y la fórmula de ventas necesarias en la barra de fórmulas.",
      caption: "La calculadora funcionando con el caso.",
      zoom: true,
    }),
    alternativas: slot("cuatro-promociones.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver cómo llegan las cuatro alternativas y comprobar que cada una indica su canasta y lo que falta.",
      description:
        "La primera respuesta del asistente con las cuatro promociones (A a D), cada una con su canasta, su riesgo y su dato faltante. Marcar con un recuadro los campos «Qué compra el cliente» y «Dato que me falta». Caso ficticio, sin datos de cuenta.",
      alt: "Cuatro promociones propuestas por un asistente, cada una con su canasta, su riesgo para el margen y el dato que falta.",
      caption: "Las cuatro alternativas, sin números todavía.",
      zoom: true,
    }),
    cuentas: slot("cuentas-de-la-ia-y-mi-hoja.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar la tabla de la IA con la hoja propia y a encontrar la fila que no coincide.",
      description:
        "A la izquierda, la tabla de cuentas devuelta por el asistente; a la derecha, la calculadora del lector con las mismas cuatro filas. Resaltar en rojo la celda de margen después y de ventas necesarias de la fila C, que difieren. Caso ficticio.",
      alt: "Tabla de cuentas de un asistente junto a la calculadora del lector, con la fila C resaltada porque sus cifras no coinciden.",
      caption: "Una fila no coincide: eso es lo que se busca.",
      zoom: true,
    }),
    decision: slot("decision-con-tus-cifras.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra el entregable final: una recomendación con la cuenta semanal, qué medir y la condición de parada.",
      description:
        "La respuesta del asistente con las secciones diferencias, descartadas, recomendación, qué medir, duración y parada, y «Para comprobar tú». Resaltar la condición de parada escrita por el dueño. Caso ficticio.",
      alt: "Respuesta de un asistente con una recomendación de promoción, la cuenta semanal, qué medir y la condición de parada.",
      caption: "Una decisión con condiciones, no una lista de ideas.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "hoja",
      ratio: "16/9",
      promptId: "formulas",
      purpose: "Prueba real del prompt de fórmulas: la tabla de fórmulas devuelta y su comprobación con números de práctica.",
      description:
        "Captura de la respuesta con la tabla de fórmulas y la lista «Cómo pegarla». Usa solo la descripción de tus columnas, sin cifras reales. Ocultar datos personales y de cuenta.",
      alt: "Captura de las fórmulas de una hoja de cálculo devueltas por un asistente.",
      caption: "Prueba del prompt de fórmulas.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "alternativas",
      purpose: "Prueba real del prompt de alternativas: las cuatro promociones con un negocio real o el caso.",
      description:
        "Captura de la respuesta con las cuatro promociones y sus campos. Usar el caso de la guía o los datos de tu negocio. Ocultar datos personales y de cuenta.",
      alt: "Captura de cuatro alternativas de promoción devueltas por un asistente.",
      caption: "Prueba del prompt de alternativas.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "analisis",
      ratio: "16/9",
      promptId: "cuentas",
      purpose: "Prueba real del prompt de cuentas: la tabla de cifras y las cuentas paso a paso, para contrastarlas con tu hoja.",
      description:
        "Captura de la tabla, las cuentas paso a paso y «Para comprobar tú». Anota aparte si alguna fila no coincide con tu hoja. Ocultar datos personales y de cuenta.",
      alt: "Captura de la tabla de cuentas de cuatro promociones devuelta por un asistente.",
      caption: "Prueba del prompt de cuentas.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "decision",
      purpose: "Prueba real del prompt de decisión: la recomendación con tus cifras, qué medir y la condición de parada.",
      description:
        "Captura de la respuesta con todas sus secciones. Pega antes tus cifras comprobadas en la hoja. Ocultar datos personales y de cuenta.",
      alt: "Captura de la recomendación final de una promoción con su condición de parada.",
      caption: "Prueba del prompt de decisión.",
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
    problem: "Tiene tres ideas (un 2x1, rebajar el desayuno, una tarjeta de fidelidad) y una sospecha: que alguna le hará perder dinero.",
    application: "Arma una hoja, pide alternativas a un asistente, contrasta sus cifras y decide con las suyas.",
    result: "Descarta la opción que rompe su límite, elige una alcanzable y fija cuánto la probará y cuándo la detendrá.",
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
    hoja: {
      caption: "Fórmulas de la calculadora, en español e inglés",
      purpose: "Ver qué fórmula va en cada columna y cómo comprobarla con números de práctica antes de usar tus datos.",
      columns: ["Columna", "Qué calcula", "Fórmula en español", "Fórmula en inglés", "Comprobación con números de práctica"],
      rows: [
        ["C · Costo de una canasta con varios productos", "La suma de los costos de cada producto", "=SUMA(C10:C11)", "=SUM(C10:C11)", "Con 4 y 1.5: 5.5"],
        ["D · Margen antes", "Precio normal menos costo", "=B2-C2", "=B2-C2", "Con 10 y 4: 6"],
        ["F · Descuento real", "La rebaja como parte del precio normal", "=(B2-E2)/B2", "=(B2-E2)/B2", "Con 10 y 8: 0.2 (20 %)"],
        ["G · Margen después", "Precio con promoción menos costo", "=E2-C2", "=E2-C2", "Con 8 y 4: 4"],
        [
          "H · Ventas necesarias",
          "Cuánto más hay que vender para ganar lo mismo; avisa si el margen es cero o negativo",
          "=SI(G2>0;D2/G2-1;\"pérdida\")",
          "=IF(G2>0,D2/G2-1,\"loss\")",
          "Con 6 y 4: 0.5 (50 %)",
        ],
        [
          "J · ¿Respeta el límite?",
          "El descuento no supera el máximo y el precio no baja del costo",
          "=SI(Y(F2<=I2;E2>=C2);\"Sí\";\"No\")",
          "=IF(AND(F2<=I2,E2>=C2),\"Yes\",\"No\")",
          "Descuento 0.2, máximo 0.25, precio 8 y costo 4: Sí",
        ],
      ],
      note: "Ejemplo generado. El separador entre argumentos depende de la configuración regional; da formato de porcentaje a las columnas F y H.",
    },
    calculadora: {
      caption: "Calculadora de promociones con el caso de Café Mirador",
      purpose: "Tener una hoja que calcula las tres cuentas de cada promoción, lista para pegar en la celda A1 y para cambiar los números por los tuyos.",
      columns: ["Promoción", "Precio normal", "Costo", "Margen antes", "Precio con promoción", "Descuento real", "Margen después", "Ventas necesarias", "Descuento máximo", "¿Respeta el límite?"],
      rows: [
        ["A · 2x1 en café", "5.00", "1.20", "=B2-C2", "2.50", "=(B2-E2)/B2", "=E2-C2", "=SI(G2>0;D2/G2-1;\"pérdida\")", "0.2", "=SI(Y(F2<=I2;E2>=C2);\"Sí\";\"No\")"],
        ["B · Combo café + croissant", "4.50", "1.30", "=B3-C3", "4.00", "=(B3-E3)/B3", "=E3-C3", "=SI(G3>0;D3/G3-1;\"pérdida\")", "0.2", "=SI(Y(F3<=I3;E3>=C3);\"Sí\";\"No\")"],
        ["C · 15 % en desayuno completo", "7.50", "2.40", "=B4-C4", "6.375", "=(B4-E4)/B4", "=E4-C4", "=SI(G4>0;D4/G4-1;\"pérdida\")", "0.2", "=SI(Y(F4<=I4;E4>=C4);\"Sí\";\"No\")"],
        ["D · Quinto café gratis", "12.50", "3.00", "=B5-C5", "10.00", "=(B5-E5)/B5", "=E5-C5", "=SI(G5>0;D5/G5-1;\"pérdida\")", "0.2", "=SI(Y(F5<=I5;E5>=C5);\"Sí\";\"No\")"],
      ],
      note: "Cada fila es una canasta (dos cafés, un combo, un desayuno, cinco cafés). Con coma decimal, cambia los puntos por comas; para tu negocio, sustituye las columnas B, C, E e I.",
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
    cuentasIA: {
      caption: "Cuentas devueltas por la IA para las cuatro promociones",
      purpose: "Ver la tabla tal como llega, con el mismo formato que pidió el prompt, para contrastarla fila por fila con tu hoja.",
      columns: ["Promoción", "Precio normal", "Precio con promoción", "Costo", "Descuento real", "Margen antes → después", "Ventas necesarias", "¿Respeta mis límites?"],
      rows: [
        ["A · 2x1 en café", "$5.00", "$2.50", "$1.20", "50 %", "$3.80 → $1.30", "+192.3 %", "No: supera el 20 %"],
        ["B · Combo café + croissant", "$4.50", "$4.00", "$1.30", "11.1 %", "$3.20 → $2.70", "+18.5 %", "Sí"],
        ["C · 15 % en desayuno completo", "$7.50", "$6.38", "$2.40", "15 %", "$5.10 → $4.34", "+17.6 %", "Sí"],
        ["D · Quinto café gratis", "$12.50", "$10.00", "$3.00", "20 %", "$9.50 → $7.00", "+35.7 %", "Sí, justo en el límite"],
      ],
      note: "Ejemplo generado. Cuenta de la fila C según la IA: 5.10 × 0.85 = 4.34; 5.10 ÷ 4.34 − 1 = 17.6 %. Redondeo a dos decimales.",
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

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: "Salida ilustrativa, redactada aplicando el prompt de alternativas a los datos de Café Mirador. La tuya será distinta.",
    parts: [
      {
        type: "text",
        text: "**PROMOCIÓN A · 2x1 en café**\n\n**Qué se ofrece:** «Pide un café y llévate otro gratis, de martes a jueves por la mañana.»\n\n**Qué compra el cliente:** dos cafés.\n\n**Por qué encaja:** atrae a quien viene acompañado o invita a un compañero de trabajo.\n\n**Riesgo para mi margen:** el segundo café se regala y tiene el mismo costo que uno pagado.\n\n**Dato que me falta:** ninguno. **Origen:** sugerido.",
      },
      {
        type: "text",
        text: "**PROMOCIÓN B · Combo de media mañana**\n\n**Qué se ofrece:** «Café y croissant juntos, más baratos que por separado.»\n\n**Qué compra el cliente:** un café y un croissant.\n\n**Por qué encaja:** sirve a quien busca algo rápido antes de las once.\n\n**Riesgo para mi margen:** menor margen por pedido; funciona si vienen más personas.\n\n**Dato que me falta:** el precio del combo. **Origen:** sugerido.",
      },
      {
        type: "text",
        text: "**PROMOCIÓN C · Descuento en el desayuno completo**\n\n**Qué se ofrece:** «Desayuno completo con descuento entre semana.»\n\n**Qué compra el cliente:** un desayuno completo.\n\n**Por qué encaja:** atrae a quien desayuna tarde y sin prisa.\n\n**Riesgo para mi margen:** baja el margen de cada desayuno vendido.\n\n**Dato que me falta:** el porcentaje de descuento, dentro de mi límite. **Origen:** sugerido.",
      },
      {
        type: "text",
        text: "**PROMOCIÓN D · Tarjeta de fidelidad**\n\n**Qué se ofrece:** «Cada café suma un sello; el quinto es gratis.»\n\n**Qué compra el cliente:** cinco cafés a lo largo del tiempo.\n\n**Por qué encaja:** premia a los clientes habituales de la zona.\n\n**Riesgo para mi margen:** tarda en dar resultados.\n\n**Dato que me falta:** ninguno. **Origen:** sugerido.",
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
        comment: "Convierte el 2x1 en un 50 % y la tarjeta en un 20 %, con su canasta de dos y de cinco cafés.",
      },
      {
        criterionId: "formulas",
        verdict: "risk",
        comment: "En la fila C aplicó el 15 % al margen y no al precio: 5.10 × 0.85 da 4.34, cuando el margen después es 6.375 − 2.40 = 3.975.",
      },
      {
        criterionId: "coinciden",
        verdict: "risk",
        comment:
          "La fila C no coincide con tu hoja ($3.98 y +28.3 %). Se nota incluso dentro de la fila: su precio con promoción menos el costo da 3.98, no 4.34. Las filas A, B y D sí coinciden.",
      },
      {
        criterionId: "limites",
        verdict: "ok",
        comment: "Marca el 2x1 como fuera de tu límite y la tarjeta como justo en el límite.",
      },
      {
        criterionId: "prediccion",
        verdict: "ok",
        comment: "Presenta las ventas necesarias como umbral, no como pronóstico.",
      },
    ],
    conclusion:
      "Sirve como borrador: tres filas correctas y una equivocada. Para decidir usa siempre las cifras de tu hoja, y pídele a la IA que trabaje sobre ellas.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar es volver a la misma conversación con un mensaje corto que corrige lo detectado. No empiezas de cero: le entregas tus cifras como fuente.",
    promptId: "decision",
    why: "El análisis dejó dos pendientes: una cifra equivocada y una decisión sin condiciones. El mensaje entrega tus cifras y tu condición de parada, y pide la recomendación con lo que se medirá.",
  },

  /* ───────────────────────────── resultado final ───────────────────────────── */
  improvedResult: {
    kind: "generated",
    intro: "Salida ilustrativa del prompt de decisión aplicado a las cifras de la hoja de Café Mirador. La tuya será distinta.",
    parts: [
      {
        type: "text",
        text: "**Diferencias con tus cifras anteriores:** en la fila C escribí «$5.10 → $4.34, +17.6 %»; tu hoja dice «$5.10 → $3.98, +28.3 %». Uso las tuyas.\n\n**Descartadas:** A (2x1): descuento real del 50 %, supera tu límite del 20 %.",
      },
      {
        type: "text",
        text: "**Recomendación: B (combo café + croissant a $4.00).** Necesita un 18.5 % más de pedidos para ganar lo mismo. Margen semanal hoy: 20 × $3.20 = $64.00. Con la promoción, en tu objetivo de 24 pedidos: 24 × $2.70 = $64.80.",
      },
      {
        type: "list",
        items: [
          "**Qué medir:** pedidos de café + croissant por semana en la franja, y cuántos compradores dicen que es su primera vez.",
          "**Duración y parada:** tres semanas, con tu condición de parada (menos de 22 pedidos por semana tras dos semanas).",
          "**Para comprobar tú:** 20 × 3.20; 24 × 2.70; y 22 × 2.70 = $59.40, por debajo de los $64.00 de hoy. Con 24 pedidos el margen queda casi igual al actual: la promoción solo mejora tu situación si atrae a clientes que compran otras cosas o vuelven, y eso no está en la cuenta.",
        ],
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
