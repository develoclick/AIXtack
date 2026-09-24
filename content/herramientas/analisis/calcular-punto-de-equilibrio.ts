import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /analisis/calcular-punto-de-equilibrio (Calculadora, NUEVA: no existía una guía previa). Contenido escrito desde cero
 * con un caso ficticio (Café Mirador, para dar continuidad a la herramienta de promociones). La página calcula el margen
 * de contribución y las unidades y ventas necesarias para no perder; la IA explica el resultado y propone formas de
 * bajar el punto de equilibrio SIN calcular. Sin pruebas reales todavía: `publicado` en `false`.
 *
 * Base explícita: costos fijos = lo que pagas aunque no vendas; costo variable = lo que cuesta cada unidad vendida.
 * Unidades = costos fijos ÷ margen de contribución, redondeadas hacia arriba (no se puede vender media unidad).
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "calcular-punto-de-equilibrio",
    area: "analisis",
    tipo: "calculadora",
    titulo: "Calcula cuánto necesitas vender para no perder",
    descripcion: "Calcula las unidades y las ventas que necesitas al mes y por día para no perder, y copia un prompt que lo explica en palabras simples y propone cómo bajarlo.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    ogImage: "/img/analisis/calcular-punto-de-equilibrio/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«¿Cuánto tengo que vender para no perder plata?» La IA responde con una cifra redondeada o una regla general (ejemplo ilustrativo), sin saber cuáles son tus costos fijos ni cuánto te cuesta cada venta.",
    despues: "El **punto de equilibrio** calculado por la página, al mes y por día, en unidades y en dinero; una explicación en palabras simples y **tres formas de bajarlo** para que pruebes cambiando un dato.",
  },

  campos: [
    { id: "negocio", label: "¿Qué negocio y qué vendes?", tipo: "texto", ejemplo: "Cafetería de barrio: café y croissant", requerido: true },
    { id: "unidad", label: "¿Qué cuenta como una venta?", tipo: "texto", ejemplo: "Un cliente que compra: se usa el gasto promedio por cliente", requerido: true, ayuda: "La «unidad» de la calculadora: un producto, el gasto promedio por cliente o un servicio." },
    { id: "supuestos", label: "Supuestos que hiciste (opcional)", tipo: "largo", ejemplo: "El gasto promedio de $5.00 por cliente es una estimación (mezcla de cafés, croissants, combos y jugos). No incluí el sueldo de la dueña.", ayuda: "Todo dato que sea una estimación y no una cifra comprobada." },
  ],
  usaPerfil: ["nombre", "rubro", "moneda"],

  calculadora: {
    entradas: [
      { id: "alquiler", label: "Alquiler del mes", unidad: "moneda", ejemplo: "800", requerido: false },
      { id: "sueldos", label: "Sueldos del mes", unidad: "moneda", ejemplo: "1400", requerido: false, ayuda: "Incluye el tuyo si quieres que el negocio también te lo pague." },
      { id: "servicios", label: "Servicios del mes (luz, agua, internet…)", unidad: "moneda", ejemplo: "200", requerido: false },
      { id: "otrosFijos", label: "Otros costos fijos del mes", unidad: "moneda", ejemplo: "160", requerido: false, ayuda: "Seguros, cuotas, licencias… lo que pagas aunque no vendas." },
      { id: "precio", label: "Precio promedio de una venta", unidad: "moneda", ejemplo: "5", ayuda: "Lo que realmente cobras en promedio, no el precio de lista. Si vendes productos distintos, usa el gasto promedio por cliente." },
      { id: "costoVariable", label: "Costo variable por venta", unidad: "moneda", ejemplo: "1.50", ayuda: "Lo que te cuesta cada venta (o cada cliente): ingredientes, empaque, comisión. No cuentes alquiler ni sueldos." },
      { id: "dias", label: "Días que abres al mes", unidad: "entero", ejemplo: "26", min: 1, max: 31 },
    ],
    salidas: [
      { id: "costosFijos", etiqueta: "Costos fijos del mes", formula: "alquiler + sueldos + servicios + otrosFijos", formato: "moneda" },
      { id: "margenContribucion", etiqueta: "Margen de contribución por venta", formula: "precio - costoVariable", formato: "moneda", ayuda: "Lo que queda de cada venta para cubrir los costos fijos." },
      { id: "razon", etiqueta: "Margen de contribución sobre el precio", formula: "margenContribucion / precio", formato: "porcentaje", decimales: 1 },
      { id: "unidadesMes", etiqueta: "Ventas al mes para no perder (unidades)", formula: "si(margenContribucion > 0; techo(costosFijos / margenContribucion); 0 / 0)", formato: "entero", ayuda: "Costos fijos ÷ margen de contribución, redondeado hacia arriba." },
      { id: "ventasMes", etiqueta: "Ventas al mes para no perder (dinero)", formula: "unidadesMes * precio", formato: "moneda" },
      { id: "unidadesDia", etiqueta: "Ventas por día abierto (unidades)", formula: "unidadesMes / dias", formato: "numero", decimales: 1 },
      { id: "ventasDia", etiqueta: "Ventas por día abierto (dinero)", formula: "ventasMes / dias", formato: "moneda" },
    ],
    casosDePrueba: [
      {
        nombre: "Café Mirador (ficticio)",
        entradas: { alquiler: 800, sueldos: 1400, servicios: 200, otrosFijos: 160, precio: 5, costoVariable: 1.5, dias: 26 },
        esperado: { costosFijos: 2560, margenContribucion: 3.5, razon: 0.7, unidadesMes: 732, ventasMes: 3660, unidadesDia: 28.1538, ventasDia: 140.7692 },
      },
      {
        nombre: "Resultado exacto: 250 unidades",
        entradas: { alquiler: 1000, precio: 10, costoVariable: 6, dias: 25 },
        esperado: { costosFijos: 1000, margenContribucion: 4, unidadesMes: 250, ventasMes: 2500, unidadesDia: 10, ventasDia: 100 },
      },
      {
        nombre: "Redondeo hacia arriba: 500.5 pasa a 501",
        entradas: { otrosFijos: 1001, precio: 3, costoVariable: 1, dias: 20 },
        esperado: { margenContribucion: 2, unidadesMes: 501, ventasMes: 1503, unidadesDia: 25.05 },
      },
      {
        nombre: "El costo variable iguala al precio: no hay punto de equilibrio",
        entradas: { alquiler: 500, precio: 5, costoVariable: 5, dias: 20 },
        esperado: { margenContribucion: 0 },
      },
    ],
  },

  tarea: `Explícame mi punto de equilibrio y ayúdame a bajarlo. Los datos de arriba y los «Cálculos ya hechos» son la única fuente de cifras: no los recalcules, no los redondees de nuevo y no inventes otros.

Negocio: {{negocio}}. Lo que cuenta como una venta: {{unidad}}.

Entrega:
1. QUÉ SIGNIFICA: explica en palabras simples, con mis cifras, qué son los costos fijos, el margen de contribución y el punto de equilibrio, y qué quiere decir vender por debajo o por encima de ese punto.
2. CÓMO LEERLO POR DÍA: qué significan las ventas por día abierto para mi rutina, sin prometer que las alcanzaré.
3. TRES FORMAS DE BAJAR EL PUNTO DE EQUILIBRIO: cada una con el dato de la calculadora que debería cambiar (precio, costo variable o costos fijos) y en qué sentido. No calcules el efecto: yo lo veré cambiando el dato en la calculadora.
4. LO QUE ESTE CÁLCULO NO DICE: por ejemplo, cuánto voy a vender de verdad o cuánto ganaré. Supuestos que hice: {{supuestos}}.
5. PREGUNTAS PARA ACLARAR antes de decidir.

Reglas:
- El punto de equilibrio es un umbral, no una meta ni una predicción: no estimes cuánto venderé.
- No des asesoría contable ni tributaria.
- Si falta un dato o dos cifras se contradicen, avísame antes de escribir y marca [FALTA: el dato].
- Separa lo que sale de mis cifras de lo que supones o sugieres.

Formato de salida, en este orden y con estos títulos: QUÉ SIGNIFICA, CÓMO LEERLO POR DÍA, TRES FORMAS DE BAJARLO, LO QUE NO DICE y PREGUNTAS PARA ACLARAR, y al final FALTA.

Antes de responder, comprueba que cada cifra es idéntica a la de los cálculos, que no hiciste cuentas nuevas, que ninguna frase predice ventas y que cada forma de bajarlo indica un dato de la calculadora. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más simple", prompt: "Explícame el punto de equilibrio con una comparación cotidiana y con mis cifras, en cinco frases." },
    { label: "Otra forma de bajarlo", prompt: "Dame una cuarta forma de bajar el punto de equilibrio y dime qué dato de la calculadora cambiar." },
    { label: "Preguntas para mi equipo", prompt: "Dame tres preguntas para que mi equipo piense cómo aumentar el precio promedio o bajar el costo variable." },
    { label: "Revisar supuestos", prompt: "Lista cada supuesto que usaron los cálculos y dime cuáles conviene comprobar primero." },
  ],

  ejemplo: {
    negocio: "Café Mirador (ficticio), cafetería de barrio que abre 26 días al mes en un local alquilado y vive del gasto promedio de cada cliente",
    resultado: {
      "Costos fijos del mes": "2560",
      "Margen de contribución por venta": "3.50 (70.0 % del precio)",
      "Ventas al mes para no perder": "732 clientes = 3660 en dinero",
      "Ventas por día abierto": "28.2 clientes = 140.77 en dinero",
    },
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: la respuesta de la IA con las cifras del punto de equilibrio de Café Mirador (ficticio) ya calculadas por la página. Debe verse la explicación en palabras simples y las tres formas de bajarlo, sin que la IA recalcule.",
    },
  ],

  checklist: [
    "Puse todos los costos fijos del mes, incluido un sueldo para mí si quiero que el negocio también me lo pague.",
    "El precio promedio es lo que realmente cobro, no el precio de lista.",
    "El costo variable incluye todo lo que cuesta cada venta y ningún costo fijo.",
    "Entiendo que el punto de equilibrio es un mínimo para no perder, no una meta ni una predicción.",
    "Repetí la división de los costos fijos entre el margen en una calculadora aparte y anoté qué datos son estimaciones.",
  ],

  porQueFunciona: [
    {
      titulo: "Separa lo que pagas siempre de lo que cuesta cada venta",
      texto: "Los **costos fijos** se pagan aunque no vendas (alquiler, sueldos, servicios). El **costo variable** aparece con cada venta (ingredientes, empaque, comisión). Mezclarlos es el error más común y hace que el resultado no sirva.",
    },
    {
      titulo: "El margen de contribución es lo que cada venta aporta",
      texto: "Es el precio menos el costo variable: lo que queda de cada venta para cubrir los costos fijos. Cuando la suma de esos aportes iguala los costos fijos, estás en el punto de equilibrio.",
    },
    {
      titulo: "La página calcula; la IA explica",
      texto: "La división y el redondeo los hace una fórmula con casos de prueba. La IA recibe el resultado ya hecho y lo explica en palabras simples, sin recalcularlo y sin predecir ventas.",
    },
    {
      titulo: "Bajarlo se prueba cambiando un dato",
      texto: "Solo hay tres palancas: subir el precio promedio, bajar el costo variable o bajar los costos fijos. La IA sugiere cuál mover y tú compruebas el efecto cambiando ese dato en la calculadora.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): costos fijos de $2,400 al mes, gasto promedio por cliente de $8.00 (mezcla del menú del día a $5 y platos a la carta) y costo variable de $2.40. El margen de contribución es $5.60: necesita 429 clientes al mes ($3,432); abriendo 25 días, son 17.2 clientes al día.",
      consejo: "Si tu carta tiene platos muy distintos, usa el precio y el costo promedio de lo que realmente se vende, no del plato más caro.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio de uñas Brillo (ficticio): costos fijos de $900, servicio promedio de $25 y materiales de $2.00. El margen de contribución es $23: necesita 40 servicios al mes ($1,000); abriendo 20 días, son 2 al día.",
      consejo: "En un servicio con agenda, las horas vacías no se recuperan: mira cuántas citas al día necesitas y compáralas con tu agenda real.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Rincón (ficticia): costos fijos de $1,500, producto promedio de $20 y costo variable de $10.50 (compra, empaque y tiempo de atención). El margen de contribución es $9.50: necesita 158 ventas al mes ($3,160); abriendo 26 días, son 6.1 al día.",
      consejo: "Con márgenes chicos por venta, pequeños cambios de precio mueven mucho el punto de equilibrio: pruébalos en la calculadora.",
    },
  ],

  errores: [
    {
      error: "Mezclar costos fijos y variables",
      solucion: "Pregúntate si el costo existe aunque no vendas nada: si sí, es fijo. Si aparece con cada venta, es variable.",
    },
    {
      error: "No incluir tu propio sueldo",
      solucion: "Si el negocio no te lo paga, el punto de equilibrio sale más bajo de lo que necesitas para vivir de él. Decide un valor y ponlo entre los sueldos.",
    },
    {
      error: "Usar el precio de lista en vez del precio promedio",
      solucion: "Con descuentos, promociones y combos, lo que cobras en promedio es menor. Usa lo que realmente entra por cada venta.",
    },
    {
      error: "Tomar el punto de equilibrio como una meta",
      solucion: "Es el mínimo para no perder, no una previsión ni el objetivo. Para decidir cuánto quieres ganar, añade esa ganancia a los costos que debes cubrir.",
    },
  ],

  faq: [
    { p: "¿Qué es una «venta» si vendo productos muy distintos?", r: "Usa el gasto promedio por cliente: lo que cobras en promedio a cada persona que compra y lo que te cuesta atenderla. Cuanto más parecidos sean tus productos, más fiable es el resultado." },
    { p: "¿Debo incluir los impuestos?", r: "Depende de tu país y de cómo cobres. Si los cobras aparte, no forman parte del precio. Consulta a un profesional cómo deben tratarse; esta herramienta no da asesoría contable ni tributaria." },
    { p: "¿Qué pasa si el costo variable es igual o mayor que el precio?", r: "No hay punto de equilibrio: cada venta pierde dinero o no aporta nada. La calculadora lo muestra como «—»; el problema está en el precio o en el costo de cada venta." },
    { p: "¿Cada cuánto debo recalcularlo?", r: "Cuando cambie un alquiler, un sueldo, el precio promedio o el costo de lo que vendes, y al menos cuando cambies tu forma de cobrar." },
    { p: "¿Sirve para saber cuánto voy a ganar?", r: "No. Dice cuánto necesitas vender para no perder. Para una ganancia deseada, súmala a los costos fijos que debes cubrir y vuelve a calcular." },
    { p: "¿Puede la IA decirme si voy a llegar al punto de equilibrio?", r: "No: no conoce tus ventas futuras. Puede explicar el resultado y proponer qué dato cambiar; cuánto vendas depende de tu clientela y del momento." },
  ],

  relacionadas: ["ventas/calcular-precios-y-margenes", "marketing/crear-promociones-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: las fórmulas y cómo usar el resultado",
    parrafos: [
      "**Las fórmulas.** Costos fijos = alquiler + sueldos + servicios + otros. Margen de contribución = precio promedio − costo variable por venta. Ventas al mes para no perder (en unidades) = costos fijos ÷ margen de contribución, redondeado hacia arriba. Ventas en dinero = unidades × precio promedio. Por día abierto = ventas del mes ÷ días que abres.",
      "**El caso completo.** En Café Mirador (ficticio): costos fijos de 2560 (800 de alquiler, 1400 en sueldos, 200 en servicios y 160 en otros). Cada cliente gasta 5.00 en promedio (la mezcla de cafés, croissants, combos y jugos que se venden, sin contar como «un producto» ninguno de ellos) y esa venta cuesta 1.50 en ingredientes y empaque, así que cada cliente aporta 3.50. 2560 ÷ 3.50 = 731.4, que se redondea a 732 clientes al mes: 3660 en dinero. Abriendo 26 días, son 28.2 clientes y 140.77 al día.",
      "**Cómo usar el resultado.** Compara las ventas por día que necesitas con las que tienes hoy. Si hoy vendes más, el margen sobre el punto de equilibrio es tu ganancia antes de otros costos que no incluiste. Si vendes menos, decide qué palanca mover: el precio promedio, el costo variable o los costos fijos. Cambia solo un dato cada vez para ver qué efecto tiene.",
      "**Dónde encontrar cada dato.** Los costos fijos están en tus recibos y extractos del último mes: alquiler, servicios, cuotas y sueldos. El precio promedio sale de dividir lo que vendiste en un periodo entre el número de ventas. El costo variable se calcula sumando lo que cuesta producir o comprar lo que se lleva cada cliente. Si no tienes un dato exacto, pon una estimación y anótala como supuesto: es mejor un cálculo con supuestos claros que ninguno.",
      "**Cuando quieres una ganancia.** Suma la ganancia mensual que quieres a los costos fijos y vuelve a calcular: el resultado es lo que necesitas vender para cubrir los costos y esa ganancia. Por ejemplo, si Café Mirador (ficticio) quisiera además 500 al mes, tendría que cubrir 3060: 3060 ÷ 3.50 = 874.3, es decir 875 clientes y 4375 en dinero. Sigue siendo un umbral, no una predicción.",
      "**Lo que este método no hace.** No predice ventas, no distingue entre productos con márgenes muy distintos (usa un promedio) y no da asesoría contable ni tributaria.",
    ],
  },
});
