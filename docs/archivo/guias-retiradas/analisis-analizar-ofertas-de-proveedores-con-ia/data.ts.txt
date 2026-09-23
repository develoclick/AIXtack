import { defineGuide } from "@/lib/guides/model";
import { guideSlots } from "@/lib/guides/images";

/**
 * analisis/analizar-ofertas-de-proveedores-con-ia
 *
 * Tipo: números y datos + decisión o comparación (`handlesNumbers`). Todo el caso (la heladería Polo Norte, los
 * tres proveedores y sus ofertas) es FICTICIO: los textos y los precios los inventó el autor de la guía. Cada
 * cifra se calcula en este archivo con las mismas cuentas de la hoja y se verificó con código aparte, evaluando
 * las fórmulas ES/EN tal como se pegan (ver README.md). Los resultados de la IA son EJEMPLOS GENERADOS:
 * redactados aplicando literalmente cada prompt; no proceden de una conversación real ni de una prueba del autor
 * (esas viven en `evidence.pruebas`, que solo rellena el autor). El pedido ingenuo es ILUSTRATIVO.
 *
 * Fuente única de verdad: la necesidad (NECESIDAD_SETS), las opciones de precio (OPCIONES), las columnas de la hoja
 * (COLUMNAS), las cuentas (CUENTAS), los criterios (CRITERIOS), los umbrales (RESULTADOS) y los puntajes
 * (PUNTAJES) se definen UNA vez y los leen la hoja, las tablas, los prompts, los ejemplos y la rúbrica.
 */
const slot = guideSlots("analisis", "analizar-ofertas-de-proveedores-con-ia");

/* ───────────────────────────── constantes (fuente única) ───────────────────────────── */

const NECESIDAD_SETS = 6000;
const UMBRAL = 3;
const NECESIDAD = "6.000 sets de vaso de cartón de 8 oz con tapa, de pared simple, para los próximos 3 meses";
const PRIMERA_FILA = 4;
const ULTIMA_FILA = 7;

const COLUMNAS = [
  "Proveedor u opción", "Precio de lista", "Sets por unidad de precio", "Impuesto aparte", "Pedido mínimo (sets)", "Envío por pedido", "Días de entrega", "Pago",
  "Precio por set", "Sets a comprar", "Sobrante (sets)", "Costo total", "Costo por set que necesito", "Diferencia con la más barata", "Alerta",
] as const;
const DATOS_OFERTA = COLUMNAS.slice(0, 8);
const COLUMNAS_EXTRACCION = [...DATOS_OFERTA, "Producto", "Fragmento del precio"];

/** Las ofertas tal como llegaron (ficticias). */
const OFERTAS: [nombre: string, texto: string][] = [
  ["Proveedor A", "Cotización 0142. Vaso de cartón 8 oz con tapa, pared simple. Precio: $85 por millar (1.000 sets), con impuestos incluidos. Pedido mínimo: 5.000 sets. Envío gratis a la ciudad. Entrega: 3 días. Pago: contado contra entrega."],
  ["Proveedor B", "Le ofrecemos vaso 8 oz con tapa, pared simple, en paquetes de 50 sets a $4,60 el paquete, más 12 % de impuestos. Pedido mínimo: 5.000 sets (100 paquetes). Costo de envío por pedido: $60. Entrega: 7 días. Pago a 30 días desde la entrega."],
  ["Proveedor C", "Vaso 8 oz de pared doble con tapa. Desde 5.000 sets: $0,088 c/u. Desde 10.000 sets: $0,079 c/u. Precios sin impuestos (12 % adicional). Flete por cuenta del cliente, estimado $90 por pedido. Entrega: 15 días. Pago: 50 % adelantado y el saldo contra entrega."],
];
const FLETE_C = "Flete por cuenta del cliente, estimado $90 por pedido";

type Opcion = { nombre: string; p: string; sets: number; imp: number; min: number; envio: number; dias: number; pago: string; producto: string; fragmento: string };
const OPCIONES: Opcion[] = [
  { nombre: "Proveedor A", p: "85", sets: 1000, imp: 0, min: 5000, envio: 0, dias: 3, pago: "Contado", producto: "Vaso 8 oz, pared simple, con tapa", fragmento: "$85 por millar (1.000 sets)" },
  { nombre: "Proveedor B", p: "4,60", sets: 50, imp: 12, min: 5000, envio: 60, dias: 7, pago: "30 días desde la entrega", producto: "Vaso 8 oz, pared simple, con tapa", fragmento: "$4,60 el paquete" },
  { nombre: "Proveedor C, desde 5.000", p: "0,088", sets: 1, imp: 12, min: 5000, envio: 90, dias: 15, pago: "50 % adelantado", producto: "Vaso 8 oz, pared doble, con tapa", fragmento: "Desde 5.000 sets: $0,088 c/u" },
  { nombre: "Proveedor C, desde 10.000", p: "0,079", sets: 1, imp: 12, min: 10000, envio: 90, dias: 15, pago: "50 % adelantado", producto: "Vaso 8 oz, pared doble, con tapa", fragmento: "Desde 10.000 sets: $0,079 c/u" },
];
/** Lo que la IA extrajo la primera vez: dos cifras mal transcritas. */
const EXTRAIDO: Opcion[] = OPCIONES.map((o) => (o.nombre === "Proveedor B" ? { ...o, p: "460" } : o.nombre.startsWith("Proveedor C") ? { ...o, envio: 0 } : o));

const num = (p: string) => Number(p.replace(",", "."));
const coma = (n: number, d: number) => n.toFixed(d).replace(".", ",");
const dinero = (n: number, d = 2) => `$${coma(n, d)}`;
const pct = (n: number) => `${coma(n * 100, 1)} %`;
const mediana = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const calcular = (opciones: Opcion[]) => {
  const filas = opciones.map((o) => {
    const porSet = num(o.p) / o.sets;
    const comprar = Math.ceil(Math.max(NECESIDAD_SETS, o.min) / o.sets) * o.sets;
    const total = comprar * porSet * (1 + o.imp / 100) + o.envio;
    return { porSet, comprar, sobrante: comprar - NECESIDAD_SETS, total, real: total / NECESIDAD_SETS };
  });
  const menor = Math.min(...filas.map((f) => f.real));
  const med = mediana(filas.map((f) => f.porSet));
  return filas.map((f) => ({ ...f, dif: f.real / menor - 1, alerta: f.porSet > UMBRAL * med || f.porSet < med / UMBRAL ? "Revisar" : "OK" }));
};
const FINAL = calcular(OPCIONES);
const PRIMERA = calcular(EXTRAIDO);
const idx = (nombre: string) => OPCIONES.findIndex((o) => o.nombre === nombre);
const A = FINAL[idx("Proveedor A")], B = FINAL[idx("Proveedor B")], C5 = FINAL[idx("Proveedor C, desde 5.000")], C10 = FINAL[idx("Proveedor C, desde 10.000")];
const IMP_TXT = (o: Opcion) => `${o.imp} %`;

/* cuentas de la hoja (fila 4 = primera oferta) */
const CUENTAS: [celda: string, que: string, detalle: string][] = [
  ["I", "Precio por set", "el precio de lista dividido entre los sets por unidad de precio"],
  ["J", "Sets a comprar", "el mayor entre lo que necesito y el pedido mínimo, redondeado hacia arriba a un múltiplo de la unidad de precio"],
  ["K", "Sobrante (sets)", "los sets a comprar menos lo que necesito"],
  ["L", "Costo total", "sets a comprar × precio por set × (1 + impuesto aparte) + envío"],
  ["M", "Costo por set que necesito", "el costo total dividido entre lo que necesito"],
  ["N", "Diferencia con la más barata", "el costo por set que necesito dividido entre el menor de esos costos, menos 1"],
  ["O", "Alerta", "«Revisar» si el precio por set supera B2 veces la mediana de los precios por set o es menor que esa mediana dividida entre B2; «OK» si no"],
];
const LISTA_CUENTAS = CUENTAS.map(([c, q, d], i) => `${i + 1}. ${q} (columna ${c}): ${d}.`).join("\n");
const R = (col: string) => `$${col}$${PRIMERA_FILA}:$${col}$${ULTIMA_FILA}`;
const FORMULAS: { celda: string; es: string; en: string; prueba: string }[] = [
  { celda: "I4", es: "=B4/C4", en: "=B4/C4", prueba: "6 y 2 en B4 y C4: 3" },
  { celda: "J4", es: "=REDONDEAR.MAS(MAX($B$1;E4)/C4;0)*C4", en: "=ROUNDUP(MAX($B$1,E4)/C4,0)*C4", prueba: "10 en B1, 5 en E4 y 4 en C4: 12" },
  { celda: "K4", es: "=J4-$B$1", en: "=J4-$B$1", prueba: "12 en J4 y 10 en B1: 2" },
  { celda: "L4", es: "=J4*I4*(1+D4)+F4", en: "=J4*I4*(1+D4)+F4", prueba: "J4 10, I4 2, D4 0,5 y F4 4: 34" },
  { celda: "M4", es: "=L4/$B$1", en: "=L4/$B$1", prueba: "34 en L4 y 10 en B1: 3,4" },
  { celda: "N4", es: `=M4/MIN(${R("M")})-1`, en: `=M4/MIN(${R("M")})-1`, prueba: "M4 3,4 y un mínimo de 2 en M4:M7: 0,7" },
  {
    celda: "O4",
    es: `=SI(O(I4>$B$2*MEDIANA(${R("I")});I4<MEDIANA(${R("I")})/$B$2);"Revisar";"OK")`,
    en: `=IF(OR(I4>$B$2*MEDIAN(${R("I")}),I4<MEDIAN(${R("I")})/$B$2),"Revisar","OK")`,
    prueba: "I4 9, los demás 1 en I4:I7 y 3 en B2: Revisar",
  },
];

/* extracción y ajuste */
const fragOpcion = (o: Opcion) => `«${o.fragmento}»`;
const filaExtraccion = (o: Opcion) => [o.nombre, o.p, String(o.sets), IMP_TXT(o), String(o.min), String(o.envio), String(o.dias), o.pago, o.producto, fragOpcion(o)];
const DUDAS_IA = "Impuestos: la oferta A dice que sus precios ya los incluyen; B y C los suman aparte (12 %).";
const DIFERENCIA_IA = "La oferta C es de pared doble; la necesidad pide pared simple.";
const DUDAS_NUEVAS = "El flete de C es estimado. La oferta B no aclara si el impuesto se suma también al envío.";
const PROBLEMAS_TEXTO = `1) B: el precio de lista es 4,60 y no 460. 2) C, las dos opciones: el envío es 90 y no 0. 3) En «Dudas» faltan dos: ${DUDAS_NUEVAS.charAt(0).toLowerCase()}${DUDAS_NUEVAS.slice(1)}`;
const CAMBIOS: [opcion: string, campo: string, antes: string, despues: string, fragmento: string][] = [
  ["Proveedor B", "Precio de lista", EXTRAIDO[1].p, OPCIONES[1].p, fragOpcion(OPCIONES[1])],
  ["Proveedor C, desde 5.000", "Envío por pedido", String(EXTRAIDO[2].envio), String(OPCIONES[2].envio), `«${FLETE_C}»`],
  ["Proveedor C, desde 10.000", "Envío por pedido", String(EXTRAIDO[3].envio), String(OPCIONES[3].envio), `«${FLETE_C}»`],
];

/* rúbrica */
const CRITERIOS = [
  { id: "cifras", label: "Cada cifra coincide con la oferta", detail: "Cada número se copió tal como aparece: sin cambiar decimales, unidades ni monedas." },
  { id: "vacios", label: "Marca lo que falta o queda abierto", detail: "Lo que no aparece, es estimado o depende de algo queda en «Dudas» o en «FALTA»: no se rellena." },
  { id: "producto", label: "Deja a la vista lo que no es igual", detail: "Cada opción conserva la descripción de su producto y lo que difiere de tu necesidad se anota." },
  { id: "sincalculos", label: "No calcula", detail: "No hay totales, conversiones ni promedios: los hace la hoja." },
  { id: "formato", label: "Respeta el formato pedido", detail: "Una fila por opción de precio, con las columnas pedidas y los números con el separador indicado." },
] as const;
const RESULTADOS = [
  { min: 0, label: "Rehacer", advice: "Fallan varios criterios: revisa tus ofertas y vuelve a pedir la extracción." },
  { min: 6, label: "Con ajustes", advice: "Sirve de base: corrige lo señalado antes de calcular." },
  { min: 9, label: "Lista para calcular", advice: "Cumple casi todo: pégala en la hoja y sigue." },
] as const;
const MAXIMO = CRITERIOS.length * 2;
const veredicto = (t: number) => [...RESULTADOS].reverse().find((r) => t >= r.min)!.label;
const PUNTAJES: Record<(typeof CRITERIOS)[number]["id"], 0 | 1 | 2> = { cifras: 1, vacios: 1, producto: 2, sincalculos: 2, formato: 2 };
const TOTAL_PRIMERO = Object.values(PUNTAJES).reduce<number>((n, v) => n + v, 0);
const vered = (id: keyof typeof PUNTAJES): "ok" | "improve" | "risk" => (PUNTAJES[id] === 2 ? "ok" : PUNTAJES[id] === 1 ? "improve" : "risk");

export default defineGuide({
  /* ───────────────────────────── metadatos ───────────────────────────── */
  metadata: {
    slug: "analizar-ofertas-de-proveedores-con-ia",
    category: "analisis",
    title: "Analizar ofertas de proveedores con IA",
    description:
      "Ordena varias cotizaciones de proveedores en una tabla comparable, detecta diferencias de condiciones y prepara preguntas para aclarar; tú decides.",
    author: "DeveloClick",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    status: "published",
    tipoGuia: ["numeros-datos", "decision-comparacion"],
    estandarGuia: 3,
    handlesNumbers: true,
    activoOriginal:
      "Hoja comparadora copiable (fórmulas ES/EN con costo real por unidad y alerta de precios sospechosos), mapa de decisión copiable y rúbrica de cinco criterios con dos bloqueos",
    problem: "Tienes tres o cuatro cotizaciones de proveedores que no son fáciles de comparar y no quieres decidir a ojo.",
    whyThisPage:
      "Enseña a normalizar cotizaciones heterogéneas (precio unitario real, plazos, condiciones, costos ocultos) tratando a la IA como analista y no como decisor, con cálculos verificados.",
    relatedGuides: ["definir-precios-y-margenes-con-ia", "crear-cotizaciones-y-propuestas-con-ia"],
  },

  /* ───────────────────────────── hero ───────────────────────────── */
  hero: {
    subtitle:
      "Tres proveedores, tres formas de cotizar. Pon cada oferta en el mismo formato, calcula lo que de verdad pagarías por unidad y descubre qué preguntar antes de decidir.",
    difficulty: "Intermedio",
  },

  /* ───────────────────────────── ficha rápida ───────────────────────────── */
  quickFacts: {
    time: "Cerca de dos horas la primera vez; menos con tu hoja ya armada",
    needs: ["Un asistente de IA de chat", "Una hoja de cálculo", "Las ofertas tal como las recibiste", "Tu necesidad escrita: producto, cantidad y plazo"],
    result: "Una hoja que compara las ofertas por su costo real, una tabla revisada contra cada oferta y una lista de preguntas para aclarar",
  },

  /* ───────────────────────────── imágenes (manifiesto) ───────────────────────────── */
  images: {
    hero: slot("hero.webp", {
      section: "hero",
      ratio: "16/9",
      purpose: "Resume el resultado: tres ofertas distintas convertidas en una tabla que se compara por el costo real.",
      description:
        "A la izquierda, tres ofertas ficticias con formatos distintos (una por millar, una por paquete, una por unidad); a la derecha, una hoja con una sola columna de costo por unidad necesaria y la más baja resaltada. Sin logos ni datos de contacto reales.",
      alt: "Tres cotizaciones con formatos distintos y, al lado, una tabla que las compara por costo real por unidad.",
      caption: "De tres formatos a una misma vara de medir.",
    }),
    ofertas: slot("ofertas-recibidas.webp", {
      section: "datos",
      ratio: "4/3",
      purpose: "Muestra las ofertas del caso tal como llegaron, con lo que hay que localizar en cada una.",
      description:
        "Las tres ofertas del caso una junto a otra, con resaltados de colores sobre el precio, la unidad de venta, el impuesto, el pedido mínimo, el envío, la entrega y el pago. Sin datos de contacto. Caso ficticio.",
      alt: "Tres ofertas de proveedores con sus datos de precio, unidad, impuesto, mínimo, envío, entrega y pago resaltados.",
      caption: "Los siete datos que hay que localizar en cada oferta.",
      zoom: true,
    }),
    hoja: slot("hoja-comparadora.webp", {
      section: "hoja",
      ratio: "4/3",
      purpose: "Muestra la hoja del comparador ya armada, con las fórmulas de una fila visibles.",
      description:
        "La hoja con la necesidad en B1, el umbral en B2, los encabezados en la fila 3 y las cuatro opciones en las filas 4 a 7. Resaltar la barra de fórmulas con la de «Costo total» y la columna «Costo por set que necesito». Caso ficticio.",
      alt: "Hoja de cálculo con cuatro opciones de proveedores y las fórmulas de costo total y costo por unidad.",
      caption: "El comparador, listo para recibir las ofertas.",
      zoom: true,
    }),
    primerResultado: slot("extraccion-inicial.webp", {
      section: "primer-resultado",
      ratio: "16/9",
      purpose: "Permite ver la tabla que devolvió el asistente y localizar las dos cifras que no coinciden con las ofertas.",
      description:
        "La tabla de extracción con las cuatro opciones y las celdas del precio de B y del envío de C resaltadas; al lado, los fragmentos de las ofertas originales. Caso ficticio; ocultar datos de cuenta.",
      alt: "Tabla de datos extraídos de ofertas con dos celdas resaltadas junto a los textos originales.",
      caption: "La primera extracción, con dos cifras que revisar.",
      zoom: true,
    }),
    contraste: slot("contraste-con-la-oferta.webp", {
      section: "analisis",
      ratio: "16/9",
      purpose: "Enseña a contrastar cada cifra de la tabla con su oferta original y a leer la alerta de la hoja.",
      description:
        "Cada celda de la tabla unida por una línea a su fragmento en la oferta original; las dos que no coinciden en rojo. Al lado, la hoja con «Revisar» en la fila de B. Caso ficticio.",
      alt: "Tabla de extracción con cada cifra conectada a su oferta original y una alerta de la hoja en una fila.",
      caption: "Cada cifra, contra su oferta.",
      zoom: true,
    }),
    final: slot("resultado-corregido.webp", {
      section: "resultado-final",
      ratio: "16/9",
      purpose: "Muestra la hoja con los datos corregidos y cuánto cambian los resultados.",
      description:
        "La hoja con las columnas de resultado para las cuatro opciones, la más barata resaltada y, a un lado, los costos por unidad de la primera extracción con las diferencias marcadas. Caso ficticio.",
      alt: "Hoja con el costo real por unidad de cuatro opciones, antes y después de corregir dos cifras.",
      caption: "Dos cifras corregidas cambian la lectura.",
      zoom: true,
    }),
    preguntas: slot("preguntas-a-proveedores.webp", {
      section: "adaptacion",
      ratio: "16/9",
      purpose: "Muestra la lista de preguntas por proveedor, cada una con el dato que la origina.",
      description:
        "La tabla de preguntas por proveedor con su motivo y el dato de la oferta que la origina, y debajo «Lo que la hoja no puede decir». Caso ficticio; ocultar datos de cuenta.",
      alt: "Tabla de preguntas para aclarar con cada proveedor, con su motivo y el dato que las origina.",
      caption: "Qué preguntar, y por qué.",
      zoom: true,
    }),
    prueba1: slot("prueba-prompt-01.webp", {
      section: "hoja",
      ratio: "16/9",
      promptId: "formulas",
      purpose: "Prueba real del prompt de fórmulas: la tabla de fórmulas y su comprobación con números de práctica.",
      description:
        "Captura de la tabla de fórmulas y de «Cómo pegarla». Usa solo la descripción de tus columnas, sin ofertas. Ocultar datos personales y de cuenta.",
      alt: "Captura de las fórmulas de una hoja de cálculo devueltas por un asistente.",
      caption: "Prueba del prompt de fórmulas.",
      zoom: true,
    }),
    prueba2: slot("prueba-prompt-02.webp", {
      section: "prompt",
      ratio: "16/9",
      promptId: "extraer",
      purpose: "Prueba real del prompt de extracción: la tabla, «Dudas», «Diferencias con la necesidad» y «FALTA».",
      description:
        "Captura de la tabla de extracción y de sus apartados finales. Usa las tres ofertas del caso (o las tuyas sin datos de contacto). Anota aparte qué cifras no coinciden con las ofertas. Ocultar datos personales y de cuenta.",
      alt: "Captura de una tabla de datos extraídos de ofertas de proveedores devuelta por un asistente.",
      caption: "Prueba del prompt de extracción.",
      zoom: true,
    }),
    prueba3: slot("prueba-prompt-03.webp", {
      section: "iteracion",
      ratio: "16/9",
      promptId: "ajuste",
      purpose: "Prueba real del prompt de ajuste: los cambios con su fragmento y lo que queda sin tocar.",
      description: "Captura de la tabla de cambios, de «Dudas nuevas», de «Sin cambios» y de «FALTA». Ocultar datos personales y de cuenta.",
      alt: "Captura de la corrección de una tabla de ofertas con su tabla de cambios.",
      caption: "Prueba del prompt de ajuste.",
      zoom: true,
    }),
    prueba4: slot("prueba-prompt-04.webp", {
      section: "adaptacion",
      ratio: "16/9",
      promptId: "preguntas",
      purpose: "Prueba real del prompt de preguntas: las diferencias, las preguntas por proveedor y lo que la hoja no puede decir.",
      description:
        "Captura de los cuatro apartados de la respuesta. Usa la tabla final y los resultados de la hoja del caso. Comprueba aparte que las cifras coinciden con las de tu hoja. Ocultar datos personales y de cuenta.",
      alt: "Captura de una lista de preguntas para proveedores devuelta por un asistente.",
      caption: "Prueba del prompt de preguntas.",
      zoom: true,
    }),
  },

  /* ───────────────────────────── problema ───────────────────────────── */
  problem: {
    summary:
      "Las cotizaciones llegan cada una a su manera: una cobra por millar, otra por paquete y otra por unidad; una incluye los impuestos y otra los suma aparte; una regala el envío y otra lo deja «por tu cuenta». Comparar los precios de lista es comparar cosas distintas.\n\nUn asistente de IA puede ordenar las ofertas en una tabla en minutos, pero puede equivocarse al copiar una cifra, pasar por alto una condición o comparar lo que no es comparable. Y una oferta puede traer datos de contacto o bancarios que no hace falta compartir.\n\n**La IA lee las ofertas y pregunta lo que falta, la hoja calcula y tú decides: nadie decide por ti.**",
    symptoms: [
      "Cada oferta usa otra unidad de venta, y no sabes cuánto cuesta cada pieza.",
      "No sabes si los precios incluyen impuestos ni cuánto suma el envío.",
      "El precio más bajo exige comprar más de lo que necesitas.",
      "Le pediste a una IA «cuál conviene» y no sabes si sus cuentas son ciertas.",
    ],
  },

  /* ───────────────────────────── resultado esperado ───────────────────────────── */
  outcome: {
    summary: "Saldrás con las ofertas puestas en la misma vara de medir y con una lista de lo que debes aclarar antes de decidir.",
    deliverables: [
      { label: "Una hoja comparadora", detail: "Con fórmulas en español e inglés que calculan el costo real por unidad." },
      { label: "Una tabla de extracción revisada", detail: "Cada cifra contrastada con su oferta original." },
      { label: "Una lista de preguntas", detail: "Por proveedor, con el dato que las origina y lo que la hoja no puede decir." },
      { label: "Una rúbrica y un mapa de decisión", detail: "Para revisar la extracción y elegir qué mirar primero." },
    ],
  },

  /* ───────────────────────────── para quién ───────────────────────────── */
  audience: {
    forWho: [
      "Compras insumos o productos y tienes dos o más cotizaciones que comparar.",
      "Puedes quitar los datos de contacto y bancarios antes de compartir las ofertas.",
      "Nunca usaste una IA, o casi nada: cada término se explica la primera vez.",
    ],
    notForWho: [
      "Quieres que la IA elija el proveedor: aquí solo ordena, calcula con la hoja y pregunta.",
      "Comparas contratos, servicios financieros o compras muy grandes.",
      "Tienes una sola oferta: no hay con qué compararla.",
    ],
  },

  /* ───────────────────────────── caso ───────────────────────────── */
  caseStudy: {
    business: "Heladería Polo Norte (ficticia) — heladería artesanal",
    situation:
      "Polo Norte vende helados en vaso y repone vasos con tapa cada tres meses. Recibió tres ofertas, y una tiene dos precios según la cantidad. Todo es inventado para esta guía.",
    goal: "Saber cuánto le costaría de verdad cada opción por cada set que necesita y qué debe aclarar antes de elegir.",
    data: [
      { label: "Necesidad", value: NECESIDAD },
      { label: "Ofertas", value: "Tres proveedores y cuatro opciones de precio" },
      { label: "Formatos", value: "Por millar, por paquete y por unidad; con impuestos incluidos o aparte" },
    ],
    problem: "La oferta con el precio por unidad más bajo parece la mejor. La dueña no sabe si lo es al sumar impuestos, envío y cantidades mínimas.",
    application: "Define su necesidad, arma la hoja, extrae los datos, los contrasta, los corrige, calcula y pide las preguntas.",
    result: "Una hoja con el costo real por set de cada opción y una lista de preguntas por proveedor.",
    fictional: true,
  },

  /* ───────────────────────────── marco ───────────────────────────── */
  framework: {
    intro: "Cuatro ideas ordenan la comparación.",
    blocks: [
      {
        title: "Compara lo mismo con lo mismo",
        detail: "Todas las ofertas se miden contra la misma necesidad: producto, cantidad y plazo. Si un proveedor cotiza otra cosa, se anota.",
      },
      {
        title: "El precio de lista no es el precio real",
        detail: "Entre lo que dice la oferta y lo que pagas hay unidades de venta, impuestos aparte, envío, cantidades mínimas y tramos. El costo real por unidad los junta todos.",
        example: "«$85 por millar» y «$4,60 el paquete de 50» no se pueden comparar hasta llevarlos a un precio por set.",
      },
      {
        title: "Cada herramienta hace lo suyo",
        detail: "La IA lee textos desordenados y los pone en columnas; la hoja hace las cuentas y avisa si algo no cuadra; tú decides con tus criterios.",
      },
      {
        title: "Lo que falta también es información",
        detail: "Un dato ausente, estimado o ambiguo no se rellena: se pregunta. Una buena comparación termina con la lista de lo que hay que aclarar.",
      },
    ],
  },

  /* ───────────────────────────── antes ───────────────────────────── */
  before: {
    request: "Te pego tres cotizaciones de vasos con tapa. ¿Cuál es la más barata y cuál me conviene?",
    whyInsufficient:
      "Con esa frase la IA compara precios de lista, calcula mientras redacta y elige por ti: una respuesta segura que puede no sostenerse (ejemplo ilustrativo).",
    issues: [
      "No define qué necesitas: cantidad, producto ni plazo.",
      "No pide separar lo que dice la oferta de lo que se calcula.",
      "No hay una hoja con la que comparar las cuentas de la IA.",
      "Deja la elección, que es tuya, en manos de la IA.",
    ],
  },

  /* ───────────────────────────── datos ───────────────────────────── */
  dataPreparation: {
    intro: "Reúne cuatro cosas antes de abrir la IA.",
    items: [
      { label: "Tu necesidad escrita", detail: "Qué producto, cuántas unidades, para cuándo y con qué características mínimas. Sin esto no hay con qué comparar.", required: true },
      { label: "Las ofertas tal como llegaron", detail: "El texto completo de cada una, copiado a un documento. Quita los datos de contacto y bancarios.", required: true },
      { label: "Tus condiciones", detail: "Cómo puedes pagar y cuándo lo necesitas. Sirven para leer el plazo y el pago, no para calcular.", required: true },
      { label: "Un criterio de comparación", detail: "Todo con impuestos o todo sin ellos. Aquí se compara con los impuestos incluidos.", required: true },
    ],
  },

  /* ───────────────────────────── tablas ───────────────────────────── */
  comparisons: {
    ingenuo: {
      caption: "El pedido ingenuo: lo que escribe la IA y lo que dice la hoja",
      purpose: "Ver cómo un pedido sin necesidad ni hoja produce afirmaciones que no se sostienen.",
      columns: ["Frase de la IA", "Lo que dice la hoja"],
      rows: [
        ["«La más barata es la del proveedor C: $0,079 por set.»", `Ese precio exige comprar 10.000 sets. Para 6.000, C cuesta ${dinero(C5.real, 4)} por set con impuestos y flete; A, ${dinero(A.real, 4)}.`],
        [`«B es solo un ${coma((num(OPCIONES[1].p) / OPCIONES[1].sets / (num(OPCIONES[0].p) / OPCIONES[0].sets) - 1) * 100, 1)} % más cara que A.»`, `Con el impuesto aparte y el envío, B cuesta ${pct(B.dif)} más por set que necesitas.`],
        ["«Te conviene el proveedor A.»", "La elección es tuya y aún hay dudas por aclarar, como el grosor del vaso de A."],
      ],
      note: "Ejemplo ilustrativo, escrito a propósito. Las cifras las calcula la hoja del caso.",
    },
    ofertas: {
      caption: "Las tres ofertas del caso, tal como llegaron",
      purpose: "Tener el texto original de cada oferta para contrastar la extracción.",
      columns: ["Oferta", "Texto recibido"],
      rows: OFERTAS,
      note: "Ofertas ficticias. En las tuyas quita los datos de contacto y bancarios.",
    },
    plantilla: {
      caption: "Plantilla de la hoja comparadora",
      purpose: "Saber qué va en cada celda de la hoja.",
      columns: ["Celda", "Contenido"],
      rows: [
        ["A1 y B1", `«Sets que necesito» y el número (${NECESIDAD_SETS})`],
        ["A2 y B2", `«Alerta si el precio por set es más de … veces la mediana» y el número (${UMBRAL})`],
        ["A3:O3", COLUMNAS.join(" · ")],
        [`A${PRIMERA_FILA}:H${ULTIMA_FILA}`, "Los datos de cada oferta: los pega la extracción"],
        [`I${PRIMERA_FILA}:O${ULTIMA_FILA}`, "Las fórmulas de la tabla siguiente, copiadas hacia abajo"],
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
    resultado: {
      caption: "Resultado de la hoja con los datos corregidos",
      purpose: "Ver el costo real por set de cada opción y cuánto cambiaron los resultados al corregir dos cifras.",
      columns: ["Opción", "Sets a comprar", "Sobrante (sets)", "Costo total", "Costo por set que necesito (primera extracción)", "Costo por set que necesito (corregido)", "Diferencia con la más barata", "Alerta de la primera extracción"],
      rows: OPCIONES.map((o, i) => [o.nombre, String(FINAL[i].comprar), String(FINAL[i].sobrante), dinero(FINAL[i].total), dinero(PRIMERA[i].real, 4), dinero(FINAL[i].real, 4), pct(FINAL[i].dif), PRIMERA[i].alerta]),
      copyable: true,
      note: `Ejemplo con datos ficticios, calculado por la hoja, con una necesidad de ${NECESIDAD_SETS} sets.`,
    },
    diferencias: {
      caption: "Diferencias que importan y lo que la hoja no puede decir",
      purpose: "Ver las diferencias con su cifra y los límites de la comparación.",
      columns: ["Apartado", "Contenido"],
      rows: [
        ["Costo por set que necesito", `A ${dinero(A.real, 4)}; B ${dinero(B.real, 4)}; C desde 5.000, ${dinero(C5.real, 4)}; C desde 10.000, ${dinero(C10.real, 4)} (sobran ${C10.sobrante} sets).`],
        ["Producto", "C cotiza pared doble; A y B, pared simple."],
        ["Lo que la hoja no puede decir", "Si los vasos sirven para tu uso, si cada proveedor cumple y cómo afecta cada pago a tu caja."],
        ["FALTA", "Ninguno"],
      ],
    },
    preguntas: {
      caption: "Preguntas por proveedor",
      purpose: "Tener qué preguntar a cada proveedor, con el dato que lo origina.",
      columns: ["Proveedor", "Pregunta", "Por qué importa", "Dato que la origina"],
      rows: [
        ["A", "¿Qué grosor o material tiene el vaso de pared simple?", "El precio más bajo solo sirve si el producto es equivalente.", "Producto: «pared simple», sin más detalle"],
        ["B", "¿El impuesto se suma también al envío?", "Puede subir el costo total.", "«Costo de envío por pedido: $60»"],
        ["C", "¿Cuál es el flete final y de qué depende?", "Es un estimado y afecta el costo total.", `«${FLETE_C}»`],
        ["C", "¿Existe la misma oferta en pared simple?", "La necesidad pide pared simple y C cotiza pared doble.", "Producto: «pared doble»"],
      ],
      copyable: true,
    },
    criterios: {
      caption: "Qué mirar según lo que más te importa",
      purpose: "Elegir qué dato revisar primero según tu situación.",
      columns: ["Si lo que más pesa es…", "Mira primero", "En el caso de Polo Norte"],
      rows: [
        ["Que tu caja está justa este mes", "Condición de pago", "A cobra al contado; B, a 30 días; C, 50 % adelantado."],
        ["Necesitar los vasos pronto", "Días de entrega", `A entrega en ${OPCIONES[0].dias} días, B en ${OPCIONES[1].dias} y C en ${OPCIONES[2].dias}.`],
        ["Comprar más en el futuro", "Tramos de precio", `Comprar 10.000 sets a C deja ${C10.sobrante} sobrantes hoy.`],
      ],
      copyable: true,
    },
  },

  /* ───────────────────────────── método ───────────────────────────── */
  method: {
    intro: "Cuatro de los ocho pasos llevan un prompt. Los otros cuatro los haces tú solo.",
    steps: [
      { title: "Define lo que necesitas", description: "Escribe qué producto, en qué cantidad y para cuándo. Todas las ofertas se miden contra esto.", output: "Una necesidad escrita." },
      { title: "Reúne las ofertas tal como llegaron", description: "Copia cada oferta completa a un documento, sin datos de contacto ni bancarios.", output: "Las ofertas en texto." },
      { title: "Arma la hoja del comparador", description: "Con el prompt de fórmulas o la plantilla, arma la hoja y pruébala con números de práctica.", output: "Una hoja que calcula bien." },
      { title: "Extrae los datos con la IA", description: "Pega tu necesidad y las ofertas, y pide una fila por opción de precio.", output: "Una tabla de extracción." },
      { title: "Contrasta con las ofertas y corrige", description: "Compara cada cifra con su oferta, puntúa con la rúbrica y pide cambiar solo lo señalado.", output: "Una tabla corregida." },
      { title: "Deja que la hoja calcule", description: "Pega la tabla en la hoja y mira el costo por set que necesitas y las alertas.", output: "Un costo real por opción." },
      { title: "Pide las preguntas para aclarar", description: "Entrega la tabla y los resultados, y pide diferencias, preguntas por proveedor y los límites.", output: "Una lista de preguntas." },
      { title: "Decide y confirma", description: "Elige con tus criterios y confirma por escrito con el proveedor antes de pagar.", output: "Una decisión tuya, confirmada por escrito." },
    ],
  },

  /* ───────────────────────────── prompts ───────────────────────────── */
  prompts: {
    formulas: {
      title: "Prompt de fórmulas: armar tu comparador sin compartir ofertas",
      objective: "Obtener las fórmulas de la hoja a partir de la descripción de tus columnas, sin pegar ninguna oferta.",
      whenToUse: "Cuando quieres construir el comparador tú mismo o adaptarlo a tus columnas.",
      variables: [
        { name: "PROGRAMA", description: "La hoja de cálculo que usas.", example: "Google Sheets" },
        {
          name: "COLUMNAS_Y_CELDAS",
          description: "Letra y contenido de cada columna o celda.",
          example: `A a H: ${DATOS_OFERTA.join(", ").toLowerCase()} · filas ${PRIMERA_FILA} a ${ULTIMA_FILA} · B1: sets que necesito · B2: veces sobre la mediana`,
        },
      ],
      prompt: `Actúa como asistente de hojas de cálculo para una persona que apenas empieza y que escribirá cada fórmula por su cuenta. Tu objetivo es proponerle las fórmulas de una hoja que compara ofertas de proveedores, usando solo la descripción de sus columnas, sin ver ninguna oferta.

### CONTEXTO
Programa: {{PROGRAMA}}

### DATOS
Cómo está armada mi hoja (columna o celda y lo que contiene):
{{COLUMNAS_Y_CELDAS}}

### CUENTAS QUE NECESITO (fila ${PRIMERA_FILA}, para copiar hacia abajo)
${LISTA_CUENTAS}

### REGLAS
1. Trabaja solo con las columnas que describí. Si para una cuenta falta una, escribe [FALTA: la columna] y no la crees.
2. No me pidas ofertas. Para probar cada fórmula usa números de práctica que pueda resolver mentalmente.
3. Da cada fórmula con las funciones en español y en inglés, y recuérdame que el separador de argumentos depende de la región.
4. Fija con signos de dólar las celdas y los rangos que no deben moverse al copiar, y dime cuáles.
5. Separa lo que sale de mi descripción de lo que supones tú, y marca cada suposición «SUPUESTO».

### FORMATO DE SALIDA
Una tabla de columnas fijas: Celda | Qué calcula | Fórmula en español | Fórmula en inglés | Comprobación con números de práctica. Debajo, «Cómo pegarla», con el lugar de cada fórmula. La tabla fija la forma; el contenido sale de mis columnas.

### ANTES DE RESPONDER
Verifica que: cada fórmula responde a la cuenta escrita; la comprobación con números de práctica es correcta (haz la cuenta dos veces); no usaste columnas que no describí; los rangos fijos están marcados; toda suposición está señalada. Corrige lo que falle.`,
      explanation: [
        {
          part: "sin ver ninguna oferta.",
          why: "Le describes la estructura y no las ofertas: construyes el cálculo sin compartir precios ni datos de un proveedor.",
        },
        {
          part: "usa números de práctica que pueda resolver mentalmente.",
          why: "Puedes comprobar cada fórmula con cuentas propias antes de usar tus ofertas.",
        },
        {
          part: "Fija con signos de dólar las celdas y los rangos que no deben moverse al copiar",
          why: "Evita que, al copiar hacia abajo, la fórmula compare contra un rango que se mueve.",
        },
      ],
      evaluate: "Escribe cada fórmula con los números de práctica: el resultado debe coincidir con tu cuenta a mano.",
      improve: "Si tu programa no reconoce una función, pega su mensaje de error y pide la alternativa.",
    },

    extraer: {
      title: "Prompt de extracción: una fila por opción, sin calcular",
      objective: "Transcribir los datos de cada oferta a una tabla comparable, con lo que falta o queda abierto a la vista.",
      whenToUse: "Cuando tu necesidad está escrita y tienes las ofertas completas, sin datos de contacto.",
      variables: [
        { name: "NECESIDAD", description: "Producto, cantidad y plazo que necesitas.", example: NECESIDAD },
        { name: "OFERTAS", description: "El texto de cada oferta, sin datos de contacto.", example: "Proveedor A: «Cotización 0142. Vaso de cartón…»" },
        { name: "SEPARADOR", description: "El separador decimal de tu hoja: coma o punto.", example: "coma" },
      ],
      prompt: `Actúa como un asistente que ordena ofertas de proveedores para un negocio pequeño. Tu destinatario es la persona dueña, que pegará tu tabla en una hoja de cálculo y la contrastará con cada oferta. Tu objetivo es transcribir los datos de cada oferta a una tabla comparable, sin calcular nada.

### CONTEXTO
Lo que necesito: {{NECESIDAD}}
Separador decimal de mi hoja: {{SEPARADOR}}

### DATOS (única fuente)
Ofertas tal como las recibí, sin datos de contacto:
{{OFERTAS}}

### REGLAS
1. Una fila por opción de precio: si una oferta tiene tramos de cantidad, una fila por tramo.
2. Copia cada dato tal como lo dice la oferta. Escribe los números con el separador indicado y sin separador de miles.
3. «Impuesto aparte» es el porcentaje que la oferta suma sobre el precio; si dice que el precio ya lo incluye, escribe 0 %.
4. No calcules nada: ni totales, ni precios convertidos a otra unidad, ni promedios, ni comparaciones. Eso lo hace la hoja.
5. Si un dato no aparece en la oferta, escribe FALTA en la celda y anota en el apartado «FALTA»: [FALTA: qué dato y en qué oferta]. Anota también en «Dudas» lo que la oferta deje abierto.
6. No completes con lo habitual del rubro ni con supuestos. Si supones algo, márcalo «SUPUESTO».
7. «Producto» copia la descripción de la oferta; si difiere de lo que necesito, anótalo en «Diferencias con la necesidad».
8. No recomiendes ni ordenes proveedores, y no copies datos de contacto ni bancarios.

### FORMATO DE SALIDA
En este orden: (1) una tabla de columnas fijas: ${COLUMNAS_EXTRACCION.join(" | ")}; (2) «Dudas»; (3) «Diferencias con la necesidad»; (4) «FALTA». La tabla fija la forma; el contenido sale de las ofertas.

### ANTES DE RESPONDER
Verifica que: cada número aparece en la oferta; cada fila tiene todas las columnas o FALTA; no hay cálculos; los números usan el separador indicado; todo lo ausente o abierto está en «Dudas»; no hay recomendaciones. Corrige lo que no cumpla.

### SIGUIENTE PASO
Termina indicándome que pegue en la hoja las ocho primeras columnas y que compare cada cifra con su oferta original antes de mirar los resultados.`,
      explanation: [
        {
          part: "Una fila por opción de precio: si una oferta tiene tramos de cantidad, una fila por tramo.",
          why: "Una oferta con dos precios son dos opciones distintas, y la hoja decide cuál corresponde a tu cantidad.",
        },
        {
          part: "No calcules nada: ni totales, ni precios convertidos a otra unidad, ni promedios, ni comparaciones.",
          why: "Separa lo que la IA hace bien, leer y ordenar textos, de lo que se comprueba: las cuentas.",
        },
        {
          part: "Anota también en «Dudas» lo que la oferta deje abierto.",
          why: "Un dato estimado o ambiguo no se rellena: se convierte en una pregunta para el proveedor.",
        },
      ],
      evaluate: "Contrasta cada cifra con su oferta original y busca en «Dudas» lo que queda abierto.",
      improve: "Si una cifra no coincide, usa el prompt de ajuste en lugar de repetir la extracción.",
    },

    ajuste: {
      title: "Prompt de ajuste: corregir solo las celdas señaladas",
      objective: "Corregir únicamente las celdas y las dudas señaladas, con un fragmento literal de la oferta, y dejar el resto intacto.",
      whenToUse: "Después de contrastar, cuando alguna cifra no coincide o falta una duda.",
      variables: [
        { name: "PROBLEMAS", description: "Lo que hay que corregir y por qué.", example: PROBLEMAS_TEXTO },
        { name: "NO_TOCAR", description: "Lo que no puede cambiar.", example: "Las demás cifras" },
      ],
      prompt: `Actúa como editor de tablas de ofertas para un negocio pequeño. Tu destinatario es la persona dueña. Tu objetivo es corregir SOLO lo señalado, apoyándote en las ofertas originales, y dejar intacto lo demás.

### CONTEXTO
Usa la tabla y las ofertas de esta conversación. Si falta alguna, pídemela antes de seguir.

### DATOS
Problemas que detecté:
{{PROBLEMAS}}

Lo que no se puede tocar:
{{NO_TOCAR}}

### REGLAS
1. Cambia solo lo señalado y lo que ese cambio obligue a ajustar.
2. Cada dato nuevo se apoya en un fragmento copiado letra por letra de la oferta. Cópialo en su columna.
3. Si un problema que te señalé no está en la tabla, o la oferta no lo confirma, dímelo antes de cambiar nada.
4. No calcules nada. Si para una corrección falta un dato, escribe [FALTA: qué dato] en lugar de inventarlo.

### FORMATO DE SALIDA
En este orden: (1) «Cambios»: una tabla de columnas fijas: Opción | Campo | Antes | Después | Fragmento de la oferta; (2) «Dudas nuevas»; (3) «Sin cambios»: lo que no toqué; (4) «FALTA». La tabla fija la forma; el contenido sale de mis ofertas.

### ANTES DE RESPONDER
Verifica que: solo cambiaste lo señalado; cada fragmento aparece tal cual en la oferta; el resto de la tabla está idéntico; no hay cálculos. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Cambia solo lo señalado",
          why: "Evita que rehaga celdas que ya coincidían con la oferta.",
        },
        {
          part: "Cada dato nuevo se apoya en un fragmento copiado letra por letra de la oferta.",
          why: "Cada corrección queda con su respaldo y puedes comprobarla contra el texto original.",
        },
        {
          part: "Si un problema que te señalé no está en la tabla, o la oferta no lo confirma, dímelo antes de cambiar nada.",
          why: "Evita corregir a ciegas un problema que tú pudiste señalar mal.",
        },
      ],
      evaluate: "Compara el resultado con la tabla anterior: solo deben cambiar las celdas señaladas.",
      improve: "Si cambia una cifra que no señalaste, pide repetir solo lo señalado.",
    },

    preguntas: {
      title: "Prompt de preguntas: diferencias, aclaraciones y lo que la hoja no dice",
      objective: "Obtener las diferencias que importan, con su cifra, y preguntas para cada proveedor, sin que la IA elija ni recomiende.",
      whenToUse: "Cuando la tabla está corregida y la hoja ya calculó los resultados.",
      variables: [
        { name: "NECESIDAD", description: "Producto, cantidad y plazo que necesitas.", example: NECESIDAD },
        { name: "TABLA_FINAL", description: "Tu tabla corregida, con sus apartados.", example: "Las columnas de la extracción" },
        { name: "RESULTADOS", description: "Las columnas de resultado de tu hoja.", example: "Sets a comprar, costo total, costo por set que necesito" },
      ],
      prompt: `Actúa como analista de ofertas de proveedores para un negocio pequeño. Tu destinatario es la persona dueña, que decidirá y hablará con los proveedores. Tu objetivo es explicar en palabras simples las diferencias que importan y preparar preguntas para aclarar, sin elegir por ella.

### CONTEXTO
Lo que necesito: {{NECESIDAD}}

### DATOS (única fuente)
Tabla revisada de las ofertas:
{{TABLA_FINAL}}

Resultados calculados por mi hoja:
{{RESULTADOS}}

### REGLAS
1. Copia las cifras de los resultados tal como están; no las recalcules ni las redondees.
2. Cada diferencia y cada pregunta cita el dato que la origina: la opción y el campo, o el fragmento de la oferta.
3. Pregunta solo por lo que falta, lo estimado, lo ambiguo o lo que cambia el costo o la comparabilidad. Máximo tres preguntas por proveedor.
4. No recomiendes ni ordenes proveedores, no digas cuál «conviene» y no juzgues su seriedad ni su calidad.
5. No supongas prácticas de los proveedores («suelen…»). Si propones una explicación, márcala «HIPÓTESIS».
6. Distingue lo que sale de la hoja, de las ofertas y de lo que supones.
7. Si falta un dato o dos datos se contradicen, escribe [FALTA: qué dato] en lugar de resolverlo.

### FORMATO DE SALIDA
En este orden: (1) «Diferencias que importan»: una lista, cada una con su cifra; (2) «Preguntas por proveedor»: una tabla de columnas fijas: Proveedor | Pregunta | Por qué importa | Dato que la origina; (3) «Lo que la hoja no puede decir»; (4) «FALTA». La tabla fija la forma; el contenido sale de mis datos.

### ANTES DE RESPONDER
Verifica que: cada cifra es idéntica a la de mis resultados; cada pregunta tiene su dato de origen; no hay más de tres preguntas por proveedor; no hay recomendaciones ni ranking; toda hipótesis está marcada; hay al menos una cosa que la hoja no puede decir. Corrige lo que no cumpla.`,
      explanation: [
        {
          part: "Copia las cifras de los resultados tal como están; no las recalcules ni las redondees.",
          why: "Mantiene separados el cálculo, que hace la hoja, y la lectura, que hace la IA.",
        },
        {
          part: "no digas cuál «conviene»",
          why: "La elección depende de tus criterios y de tu caja, que la IA no conoce.",
        },
        {
          part: "«Lo que la hoja no puede decir»",
          why: "Obliga a nombrar los límites, en lugar de dejar que la comparación suene más segura de lo que es.",
        },
      ],
      evaluate: "Comprueba cada cifra con tu hoja y cada pregunta con la oferta que la origina.",
      improve: "Si recomienda un proveedor, pídele que lo quite.",
    },
  },

  /* ───────────────────────────── primer resultado ───────────────────────────── */
  firstResult: {
    kind: "generated",
    intro: `Salida ilustrativa, redactada aplicando el prompt de extracción a las tres ofertas del caso, con el separador «coma». La tuya será distinta.`,
    parts: [
      {
        type: "table",
        table: {
          caption: "Primera extracción, tal como llega",
          purpose: "Tener la tabla en el formato del prompt para pegarla en la hoja.",
          columns: COLUMNAS_EXTRACCION,
          rows: EXTRAIDO.map(filaExtraccion),
        },
      },
      { type: "text", text: `**Dudas.** ${DUDAS_IA} **Diferencias con la necesidad.** ${DIFERENCIA_IA} **FALTA.** Ninguno.` },
    ],
  },

  /* ───────────────────────────── rúbrica ───────────────────────────── */
  rubric: {
    id: "extraccion",
    title: "Puntúa una extracción",
    intro:
      `Puntúa tu tabla en los cinco criterios: 0, 1 o 2 puntos cada uno, hasta ${MAXIMO}. ` +
      `Si «${CRITERIOS[0].label}» o «${CRITERIOS[3].label}» sacan 0, no se usa aunque el total sea alto. Todo ocurre en tu navegador y no se guarda.`,
    criteria: CRITERIOS.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    outcomes: RESULTADOS.map((r) => ({ min: r.min, label: r.label, advice: r.advice })),
  },

  /* ───────────────────────────── análisis ───────────────────────────── */
  analysis: {
    intro:
      `La tabla parece completa y ordenada. Para saber si se puede calcular con ella, se contrasta cifra por cifra con las ofertas y se puntúa con la rúbrica: ` +
      `el total es ${TOTAL_PRIMERO} de ${MAXIMO}: «${veredicto(TOTAL_PRIMERO)}».`,
    criteria: [
      {
        criterionId: "cifras",
        verdict: vered("cifras"),
        comment: `Dos cifras no coinciden: el precio de B (${EXTRAIDO[1].p} en lugar de ${OPCIONES[1].p}) y el envío de C (0 en lugar de ${OPCIONES[2].envio}). La alerta de la hoja marca la primera; la segunda no.`,
      },
      {
        criterionId: "vacios",
        verdict: vered("vacios"),
        comment: "Anota la diferencia de impuestos, pero no que el flete de C es estimado ni que B no aclara si el impuesto se suma al envío.",
      },
      {
        criterionId: "producto",
        verdict: vered("producto"),
        comment: "Conserva «pared doble» en C y lo anota en «Diferencias con la necesidad».",
      },
      {
        criterionId: "sincalculos",
        verdict: vered("sincalculos"),
        comment: "No hay totales ni precios convertidos: solo transcribe, como pide el prompt.",
      },
      {
        criterionId: "formato",
        verdict: vered("formato"),
        comment: "Una fila por opción, con un tramo por fila en C, y los números con coma y sin separador de miles.",
      },
    ],
    conclusion: "Es una buena base: no calcula nada y conserva las diferencias del producto. Las dos cifras mal copiadas cambian el resultado de dos proveedores.",
  },

  /* ───────────────────────────── iteración ───────────────────────────── */
  iteration: {
    intro: "Iterar aquí es corregir tres celdas y dos dudas, no repetir la extracción.",
    promptId: "ajuste",
    why: "El contraste señaló dos cifras mal copiadas y dos dudas que faltaban. El prompt limita el cambio a lo señalado, exige un fragmento literal de la oferta y separa lo cambiado de lo que no.",
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
          purpose: "Comprobar qué celdas cambiaron y con qué fragmento de la oferta.",
          columns: ["Opción", "Campo", "Antes", "Después", "Fragmento de la oferta"],
          rows: CAMBIOS,
        },
      },
      { type: "text", text: `**Dudas nuevas.** ${DUDAS_NUEVAS} **Sin cambios:** las demás cifras. **FALTA:** ninguno.` },
    ],
  },

  /* ───────────────────────────── errores ───────────────────────────── */
  mistakes: [
    {
      title: "Comparar los precios de lista",
      whyItHurts: "Unidades, impuestos, envío y mínimos cambian el orden: el precio más bajo puede terminar siendo el más caro.",
      instead: "Compara el costo real por unidad que necesitas, que sale de la hoja.",
    },
    {
      title: "Dar por iguales productos distintos",
      whyItHurts: "Una oferta puede ser más cara porque cotiza otra cosa, y eso no aparece en ningún precio.",
      instead: "Conserva la descripción del producto en la tabla y anota lo que difiere de tu necesidad.",
    },
    {
      title: "Pegar en la hoja lo que devolvió la IA sin mirar la oferta",
      whyItHurts: "Un decimal mal leído o un envío pasado por alto cambian el resultado sin avisar.",
      instead: "Contrasta cada cifra con su oferta original, con la ayuda de la alerta de la hoja.",
    },
    {
      title: "Decidir con dudas pendientes",
      whyItHurts: "Un flete estimado o un impuesto sin aclarar pueden mover el costo después de que ya elegiste.",
      instead: "Pregunta, guarda la respuesta por escrito y recalcula antes de pagar.",
    },
  ],

  /* ───────────────────────────── verificación ───────────────────────────── */
  verification: {
    intro: "Antes de decidir, marca cada punto cuando lo hayas comprobado tú, no la IA.",
    items: [
      { label: "Cada cifra de la tabla coincide con su oferta original; las revisé una por una." },
      { label: "Los proveedores cotizan el mismo producto y la misma cantidad, o lo que difiere está anotado." },
      { label: "Probé las fórmulas con números de práctica y coinciden con mi cuenta a mano." },
      { label: "Miré cada fila que la alerta marcó como «Revisar» antes de usar el resultado." },
      { label: "Sé qué está por aclarar y no decidí con eso pendiente." },
      { label: "Antes de pagar confirmé por escrito con el proveedor el precio, el plazo, el envío y los impuestos." },
      { label: "No compartí datos de contacto ni bancarios de los proveedores, y revisé si sus ofertas piden confidencialidad." },
    ],
    principle: "La IA lee y pregunta, la hoja calcula. La decisión y la confirmación con el proveedor las haces tú.",
  },

  /* ───────────────────────────── aplicación ───────────────────────────── */
  application: {
    intro: "Con las preguntas hechas, queda aclarar, recalcular y guardar.",
    steps: [
      { title: "Guarda las respuestas por escrito", detail: "Pega cada respuesta en un documento con su fecha: son parte de la oferta." },
      { title: "Recalcula con lo aclarado", detail: "Cambia en la hoja los datos que resultaron distintos y mira si cambió el orden." },
      { title: "Guarda el comparador con su fecha", detail: "Las ofertas caducan: sin fecha no sabrás si los precios siguen vigentes." },
      { title: "Anota lo que elegiste y por qué", detail: "En la próxima compra verás qué pesó y si funcionó." },
      { title: "Repite en cada renovación", detail: "Con la hoja ya armada, solo cambian la necesidad y las ofertas." },
    ],
  },

  /* ───────────────────────────── limitaciones ───────────────────────────── */
  limitations: {
    intro: "El método ordena la comparación, pero tiene límites.",
    items: [
      { title: "No es una decisión financiera", detail: "No mira tu flujo de caja ni tu relación con el proveedor: eso lo pesas tú." },
      { title: "No evalúa calidad ni confiabilidad", detail: "Una oferta barata puede venir de un proveedor que no cumple: pide muestras y referencias." },
      { title: "Las ofertas cambian", detail: "Los precios y las condiciones caducan: confirma que siguen vigentes antes de pagar." },
      { title: "No cubre contratos ni impuestos", detail: "Las normas cambian por país. Si el pedido es grande o hay contrato, consulta a un profesional." },
    ],
  },

  /* ───────────────────────────── conclusión ───────────────────────────── */
  conclusion: {
    summary:
      "Comparar bien no es mirar el precio más bajo: es poner las ofertas en el mismo formato, contar todo lo que pagarás y saber qué falta por preguntar.",
    takeaways: [
      "Escribe tu necesidad antes de abrir ninguna oferta.",
      "Compara el costo real por unidad y no el precio de lista.",
      "Contrasta cada cifra con su oferta original.",
      "Termina con una lista de preguntas, no con una elección apresurada.",
    ],
    nextGuide: "definir-precios-y-margenes-con-ia",
  },

  /* ───────────────────────────── evidencia (la rellena solo el autor) ───────────────────────────── */
  evidence: {},

  /* ───────────────────────────── glosario ───────────────────────────── */
  glossary: ["asistente-ia", "prompt", "variable", "hoja-de-calculo", "costo-real-por-unidad", "tramo", "rubrica"],

  /* ───────────────────────────── FAQ ───────────────────────────── */
  faq: [
    {
      question: "¿Cuántas ofertas necesito?",
      answer: "Con dos ya puedes comparar, y con tres o cuatro tienes más contexto. No hay una cifra mágica: importa que cotizen lo mismo.",
    },
    {
      question: "¿Y si las ofertas vienen en PDF o en imagen?",
      answer: "Copia el texto si puedes. Si el asistente lee imágenes, contrasta cada cifra con más cuidado: puede leer mal un número.",
    },
    {
      question: "¿Puedo pegar las ofertas en una IA?",
      answer: "Depende de la herramienta y de cada proveedor. Quita datos de contacto y bancarios, comparte solo lo necesario y revisa si la oferta es confidencial.",
    },
    {
      question: "¿Y si un proveedor ofrece un descuento por pronto pago?",
      answer: "Agrégalo como otra opción en la hoja, con su condición de pago. Este comparador no calcula su efecto en tu caja.",
    },
  ],
});
