import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /ventas/calcular-precios-y-margenes (Calculadora). Fuente: la guía larga content/guias/ventas/definir-precios-y-margenes-con-ia.
 * Caso: Galletería Migas (ficticia). La página calcula el costo completo, el precio para el margen deseado y el margen
 * real de un precio elegido; la IA lee esos números, sugiere escenarios y ayuda a comunicar el precio. NO decide el precio.
 *
 * Base explícita: el margen se calcula SOBRE EL PRECIO (precio = costo ÷ (1 − margen)); el recargo, sobre el costo.
 * Sin pruebas reales todavía: `publicado` en `false`.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "calcular-precios-y-margenes",
    area: "ventas",
    tipo: "calculadora",
    titulo: "Calcula el precio de venta y el margen de tu producto",
    descripcion: "Suma tu costo completo, calcula el precio para el margen que deseas y copia un prompt que lee los números, propone escenarios y te ayuda a comunicar el precio.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/ventas/calcular-precios-y-margenes/og.webp",
  },

  antesDespues: {
    antes: "«Mi caja de 6 galletas me cuesta 24 y quiero un margen del 40 %. ¿A qué precio la vendo?» La IA puede sumar el 40 % al costo (ejemplo ilustrativo) y responder con seguridad: el precio sale más bajo de lo que necesitas para ese margen.",
    despues: "El **costo completo** (materiales, empaque, tu tiempo y una parte de los gastos fijos), el precio **calculado sobre el precio y no sobre el costo**, y una lectura de esos números sin veredictos: la decisión del precio es tuya.",
  },

  campos: [
    { id: "producto", label: "¿Qué producto o servicio?", tipo: "texto", ejemplo: "Una caja de 6 galletas artesanales", requerido: true },
    { id: "dondeVendes", label: "¿Dónde y cómo lo vendes?", tipo: "texto", ejemplo: "Por encargo y en ferias", ayuda: "Opcional. Ayuda a proponer cómo comunicar el precio." },
    { id: "decision", label: "¿Qué decisión debes tomar?", tipo: "texto", ejemplo: "Qué precio cobrar por la caja", requerido: true },
    { id: "supuestos", label: "Supuestos que hiciste (opcional)", tipo: "largo", ejemplo: "Ventas del mes: 150 cajas (estimación). Mi hora de trabajo: 20 (el valor que me asigno).", ayuda: "Todo dato que sea una estimación y no una cifra comprobada." },
  ],
  usaPerfil: ["nombre", "rubro", "moneda"],

  calculadora: {
    entradas: [
      { id: "materiales", label: "Materiales por unidad", unidad: "moneda", ejemplo: "12", ayuda: "Ingredientes o compra del producto, por cada unidad que vendes." },
      { id: "empaque", label: "Empaque y etiqueta por unidad", unidad: "moneda", ejemplo: "3", requerido: false },
      { id: "minutos", label: "Minutos de trabajo por unidad", unidad: "numero", ejemplo: "15", requerido: false, ayuda: "El tiempo tuyo o de tu equipo que lleva cada unidad." },
      { id: "valorHora", label: "Valor de una hora de trabajo", unidad: "moneda", ejemplo: "20", requerido: false, ayuda: "Ponle un valor aunque hoy no te la pagues: es una decisión tuya." },
      { id: "gastosFijos", label: "Gastos fijos del mes", unidad: "moneda", ejemplo: "600", requerido: false, ayuda: "Alquiler, servicios, herramientas… lo que pagas aunque no vendas." },
      { id: "unidadesMes", label: "Unidades que vendes al mes (supuesto)", unidad: "entero", ejemplo: "150", ayuda: "Una estimación: si vendes menos, cada unidad carga más gastos fijos." },
      { id: "margenDeseado", label: "Margen deseado sobre el precio", unidad: "porcentaje", ejemplo: "40", max: 99, ayuda: "De cada 100 que cobras, cuánto quieres que te quede." },
      { id: "precioElegido", label: "Precio que estás pensando cobrar (opcional)", unidad: "moneda", ejemplo: "40", requerido: false },
      { id: "precioCompetencia", label: "Precio de la competencia (opcional)", unidad: "moneda", ejemplo: "36", requerido: false, ayuda: "Solo como referencia, después de conocer tu costo." },
    ],
    salidas: [
      { id: "manoObra", etiqueta: "Mano de obra por unidad", formula: "minutos / 60 * valorHora", formato: "moneda" },
      { id: "fijosUnidad", etiqueta: "Gastos fijos por unidad", formula: "gastosFijos / unidadesMes", formato: "moneda" },
      { id: "costoTotal", etiqueta: "Costo total por unidad", formula: "materiales + empaque + manoObra + fijosUnidad", formato: "moneda" },
      { id: "precioObjetivo", etiqueta: "Precio para tu margen deseado", formula: "costoTotal / (1 - margenDeseado)", formato: "moneda", ayuda: "Precio = costo ÷ (1 − margen). El margen va sobre el precio." },
      { id: "ganancia", etiqueta: "Ganancia por unidad a ese precio", formula: "precioObjetivo - costoTotal", formato: "moneda" },
      { id: "recargo", etiqueta: "Recargo sobre el costo a ese precio", formula: "ganancia / costoTotal", formato: "porcentaje", decimales: 1, ayuda: "No es lo mismo que el margen: un margen de 40 % equivale a un recargo de 66.7 %." },
      { id: "margenElegido", etiqueta: "Margen real con tu precio elegido", formula: "si(precioElegido > 0; (precioElegido - costoTotal) / precioElegido; 0 / 0)", formato: "porcentaje", decimales: 1, opcional: true },
      { id: "margenCompetencia", etiqueta: "Margen si cobraras el precio de la competencia", formula: "si(precioCompetencia > 0; (precioCompetencia - costoTotal) / precioCompetencia; 0 / 0)", formato: "porcentaje", decimales: 1, opcional: true },
    ],
    casosDePrueba: [
      {
        nombre: "Galletería Migas: caja de 6 galletas",
        entradas: { materiales: 12, empaque: 3, minutos: 15, valorHora: 20, gastosFijos: 600, unidadesMes: 150, margenDeseado: 40, precioElegido: 40, precioCompetencia: 36 },
        esperado: { manoObra: 5, fijosUnidad: 4, costoTotal: 24, precioObjetivo: 40, ganancia: 16, recargo: 0.6667, margenElegido: 0.4, margenCompetencia: 0.3333 },
      },
      {
        nombre: "Los ingredientes suben 25 %",
        entradas: { materiales: 15, empaque: 3, minutos: 15, valorHora: 20, gastosFijos: 600, unidadesMes: 150, margenDeseado: 40, precioElegido: 40 },
        esperado: { costoTotal: 27, precioObjetivo: 45, margenElegido: 0.325 },
      },
      {
        nombre: "Se venden 100 unidades al mes",
        entradas: { materiales: 12, empaque: 3, minutos: 15, valorHora: 20, gastosFijos: 600, unidadesMes: 100, margenDeseado: 40, precioElegido: 40 },
        esperado: { fijosUnidad: 6, costoTotal: 26, precioObjetivo: 43.3333, margenElegido: 0.35 },
      },
      {
        nombre: "Las dos cosas a la vez",
        entradas: { materiales: 15, empaque: 3, minutos: 15, valorHora: 20, gastosFijos: 600, unidadesMes: 100, margenDeseado: 40, precioElegido: 40 },
        esperado: { costoTotal: 29, precioObjetivo: 48.3333, margenElegido: 0.275 },
      },
      {
        nombre: "Solo materiales y margen (sin precio elegido ni competencia)",
        entradas: { materiales: 30, unidadesMes: 1, margenDeseado: 50 },
        esperado: { costoTotal: 30, precioObjetivo: 60, ganancia: 30, recargo: 1 },
      },
    ],
  },

  tarea: `Ayúdame a leer los números de mi precio y a decidir cómo comunicarlo. Los datos de arriba y los «Cálculos ya hechos» son la única fuente de cifras: no los recalcules, no los redondees y no inventes otros.

Entrega:
1. LO QUE DICE LA HOJA: una lista con cada cifra de los cálculos, su unidad y su base. Explica en palabras simples la diferencia entre el margen (sobre el precio) y el recargo (sobre el costo) con mis cifras.
2. LO QUE SUPONE Y LO QUE NO DICE: cada supuesto que usan las cifras (por ejemplo, las unidades vendidas al mes o el valor de mi hora) y lo que los números no pueden decir (lo que pagan mis clientes, lo que cobran otros).
3. TRES ESCENARIOS «qué pasa si»: para cada uno, qué dato de la calculadora debería cambiar y en cuánto (por ejemplo, materiales +25 % o menos unidades vendidas). No calcules el resultado: yo lo veré cambiando el dato en la calculadora.
4. CÓMO COMUNICAR EL PRECIO de «{{producto}}»: dos frases para decírselo a un cliente, sin justificar el precio con datos que yo no te di y sin compararme con otros negocios. Decisión que debo tomar: {{decision}}. Dónde vendo: {{dondeVendes}}.
5. PREGUNTAS PARA ACLARAR antes de decidir.

Reglas:
- No afirmes que un precio o un margen es rentable, suficiente, bueno ni seguro, y no recomiendes un precio: la decisión es mía.
- Supuestos que hice: {{supuestos}}.
- Si falta un dato o dos cifras se contradicen, avísame antes de escribir y marca [FALTA: el dato].
- Separa lo que sale de mis cifras de lo que supones o sugieres.

Formato de salida, en este orden y con estos títulos: LO QUE DICE LA HOJA, LO QUE SUPONE Y LO QUE NO DICE, ESCENARIOS, CÓMO COMUNICAR EL PRECIO, PREGUNTAS PARA ACLARAR y FALTA.

Antes de responder, comprueba que cada cifra es idéntica a la de los cálculos, que cada porcentaje dice su base, que ninguna frase afirma que el precio es rentable o recomienda uno y que no comparaste con otros negocios. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más sencillo", prompt: "Explícame lo mismo en tres frases y sin tecnicismos, con mis cifras." },
    { label: "Otro escenario", prompt: "Propón un cuarto escenario sobre un dato que aún no hayas tocado y dime qué dato de la calculadora cambiar." },
    { label: "Revisar bases", prompt: "Revisa tu respuesta y dime si algún porcentaje quedó sin su base (precio o costo)." },
    { label: "Preguntas para mi cliente", prompt: "Dame tres preguntas para saber cuánto estarían dispuestos a pagar mis clientes, sin inventar cifras." },
  ],

  ejemplo: {
    negocio: "Galletería Migas (ficticia), galletas artesanales por encargo y en ferias, con dos personas",
    resultado: {
      "Costo total por caja": "24 (12 materiales + 3 empaque + 5 trabajo + 4 gastos fijos)",
      "Precio para el 40 %": "40 (24 ÷ 0.60)",
      "Ganancia y recargo": "16 por caja: un recargo del 66.7 % sobre el costo",
      "Si los ingredientes suben 25 %": "costo 27; con el precio de 40 el margen baja a 32.5 %; para mantener el 40 % el precio sería 45",
      "Si se venden 100 cajas al mes": "costo 26; margen 35 %; para mantener el 40 % el precio sería 43.3",
    },
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Espacios de imagen: guarda cada archivo (.webp, .png o .jpg) con su nombre en public/img/ventas/calcular-precios-y-margenes/ y aparece solo. Ver docs/como-publicar.md.
  imagenes: [
    {
      id: "prueba-01",
      archivo: "prueba-01",
      etiqueta: "Prueba real",
      titulo: "Chat de la IA con la respuesta al prompt de esta página",
      alt: "Chat nuevo: la revisión de la lógica del precio de Galletería Migas (ficticia), los escenarios y cómo comunicar el precio, con las cifras ya calculadas por la página.",
      leyenda: "Prueba real: la respuesta de la IA al prompt de esta página, sin editar.",
      ubicacion: "ejemplo",
      obligatoria: true,
    },
  ],

  checklist: [
    "Cada dato tiene su origen y los supuestos están marcados como supuestos.",
    "Puse un valor a mi hora de trabajo, aunque hoy no me la pague, y sé que es una decisión mía.",
    "Recalculé el precio sugerido en una hoja aparte antes de aceptarlo.",
    "Comparé el precio con lo que pagan mis clientes y con lo que cobran otros, que la calculadora no sabe.",
    "Probé qué pasa con mi margen si suben los costos o bajan las ventas, y consulté a un profesional lo que corresponda a impuestos y precios.",
  ],

  porQueFunciona: [
    {
      titulo: "Costo completo, no solo ingredientes",
      texto: "El costo de una unidad suma materiales, empaque, tu tiempo y una parte de los gastos fijos. Si dejas fuera tu hora o el alquiler, el precio paga los ingredientes y no el negocio.",
    },
    {
      titulo: "Margen y recargo no son lo mismo",
      texto: "El **margen** se calcula sobre el precio: qué parte de lo que cobras te queda. El **recargo**, sobre el costo. Sumar un 40 % al costo deja un margen real de 28.6 %, no de 40 %; por eso la fórmula es costo ÷ (1 − margen).",
    },
    {
      titulo: "Tres precios distintos",
      texto: "Hay un precio mínimo (el costo: por debajo pierdes), un precio objetivo (el que da tu margen) y el precio que eliges tú. Para elegir miras lo que la calculadora no sabe: lo que pagan tus clientes.",
    },
    {
      titulo: "Cada supuesto mueve el resultado",
      texto: "Las unidades vendidas al mes y el valor de tu hora son estimaciones. Cambiarlas en la calculadora te dice cuánto depende tu margen de ellas, y la IA propone qué probar sin calcularlo por ti.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia), un plato de fondo a la carta: materiales $2.20, empaque $0.30, 10 minutos a $12 la hora ($2.00) y gastos fijos de $2,400 con 1,600 platos al mes ($1.50). Costo total $6.00; para un margen del 40 %, el precio es $10.00.",
      consejo: "Los platos que compartes con otros (aceite, gas) entran en los gastos fijos: decide cuánto de cada gasto le toca a cada plato.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio de uñas Brillo (ficticio): materiales $2.00, 45 minutos a $10 la hora ($7.50) y gastos fijos de $900 con 300 servicios al mes ($3.00). Costo total $12.50; para un margen del 50 %, el precio es $25.00.",
      consejo: "En un servicio, tu tiempo es casi todo el costo. Si no le pones valor a tu hora, el precio parece rentable y no lo es.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Rincón (ficticia), un jarrón: compra $8.00, empaque $1.00, 6 minutos a $15 la hora ($1.50) y gastos fijos de $1,500 con 600 ventas al mes ($2.50). Costo total $13.00; para un margen del 35 %, el precio es $20.00.",
      consejo: "Si compras por volumen, el costo de materiales cambia con cada pedido: actualiza la calculadora cuando cambie un costo importante.",
    },
    {
      rubro: "Trabajo por encargo",
      ejemplo: "Maderas Rivera (ficticio): cada mueble es distinto, así que no hay un costo por unidad fijo. Se calcula cada trabajo por separado: materiales del encargo, horas reales de taller y de instalación con el valor de la hora, y una parte de los gastos fijos según cuántos encargos se hacen al mes.",
      consejo: "Guarda el costo real de cada trabajo terminado y compáralo con lo que habías calculado: esa diferencia es lo que más te enseña para el próximo precio.",
    },
  ],

  errores: [
    {
      error: "Contar solo los ingredientes",
      solucion: "Suma empaque, tu hora y una parte de los gastos fijos al costo de cada unidad. Si no, la ganancia aparente no existe.",
    },
    {
      error: "Sumar el margen al costo",
      solucion: "Un 40 % sumado al costo deja un margen real menor. Calcula el precio como costo ÷ (1 − margen) y comprueba el margen real con tu precio elegido.",
    },
    {
      error: "Dar por cierto un volumen de ventas",
      solucion: "Los gastos fijos por unidad dependen de cuántas vendes: si vendes menos, cada unidad carga más costo. Anótalo como supuesto y pruébalo con un escenario.",
    },
    {
      error: "Preguntarle a la IA si el precio es rentable",
      solucion: "Puede responder con seguridad sin conocer tus ventas, tus clientes ni tus gastos reales. Pídele que explique los números y que deje preguntas: la decisión es tuya.",
    },
  ],

  faq: [
    { p: "¿Debo ponerle valor a mi propio tiempo?", r: "Conviene: si no, el precio paga tus ingredientes y no tu trabajo. El valor de tu hora lo decides tú; lo importante es que aparezca en el cálculo." },
    { p: "¿Qué margen es el correcto?", r: "No hay una cifra universal: depende de tu negocio, tus gastos y lo que puedes cobrar. La calculadora muestra el margen que resulta; el que deseas lo decides tú." },
    { p: "¿Puedo copiar el precio de la competencia?", r: "Puedes usarlo como referencia, después de calcular tu costo. Así sabes cuánto ganarías o perderías con ese precio: es lo que muestra el margen con el precio de la competencia." },
    { p: "¿Cada cuánto actualizo los datos?", r: "Cuando cambie un costo importante o compruebes que tus ventas reales difieren del supuesto." },
    { p: "¿Qué hago si vendo varios productos?", r: "Calcula uno por uno y decide cuánto de cada gasto fijo le toca a cada producto: la calculadora no reparte tus gastos por ti." },
    { p: "¿La IA me dará el precio correcto?", r: "No. Lee los números, propone escenarios y ayuda a comunicar el precio, pero no conoce lo que pagan tus clientes. Tampoco da asesoría contable ni tributaria: los impuestos y las reglas de precios cambian según el país." },
  ],

  relacionadas: ["ventas/crear-cotizaciones-con-ia", "analisis/calcular-punto-de-equilibrio"],

  metodoCompleto: {
    titulo: "Método completo: las fórmulas, la hoja y los escenarios",
    parrafos: [
      "**Las fórmulas.** Mano de obra por unidad = minutos ÷ 60 × valor de la hora. Gastos fijos por unidad = gastos fijos del mes ÷ unidades vendidas al mes. Costo total = materiales + empaque + mano de obra + gastos fijos por unidad. Precio para el margen deseado = costo total ÷ (1 − margen). Ganancia = precio − costo. Recargo = ganancia ÷ costo. Margen real de un precio elegido = (precio − costo) ÷ precio.",
      "**El caso completo.** En la Galletería Migas (ficticia): una tanda rinde 24 galletas, es decir 4 cajas de 6. Los ingredientes de la tanda cuestan 48 (12 por caja) y la caja con etiqueta 3. Una hora de trabajo por tanda, valorada en 20, son 5 por caja. Los gastos fijos de 600 entre 150 cajas son 4 por caja. El costo total es 24 y el precio para un margen del 40 % es 40.",
      "**Los escenarios del caso.** Ingredientes +25 %: costo 27, margen real con el precio de 40 baja a 32.5 % y el precio para mantener el 40 % sube a 45. Se venden 100 cajas: costo 26, margen 35 %, precio para el 40 % de 43.3. Las dos cosas a la vez: costo 29, margen 27.5 % y precio de 48.3. La calculadora hace estas cuentas cuando cambias los datos; la IA solo propone qué cambiar.",
      "**La misma hoja en una hoja de cálculo.** Con los datos en la columna B: costo por caja `=B5/C4+B6+B7/60*B8/C4+B10/B11`; precio objetivo `=C13*100/(100-B14)`; margen real `=REDONDEAR((B18-C13)/B18*100;1)`. En inglés, `ROUND`. Los porcentajes se escriben como números enteros (40 significa 40 %).",
      "**Rúbrica de cinco criterios** para revisar la lectura de la IA (0, 1 o 2 puntos cada uno): las cifras son las de la calculadora; cada porcentaje dice su base; no decide ni promete; nombra lo que supone; deja preguntas para aclarar.",
      "**Lo que este método no hace.** No decide el precio, no conoce tus ventas, no reparte tus gastos fijos entre varios productos y no da asesoría contable ni tributaria.",
      "**Cómo estimar el valor de tu hora.** Una forma sencilla es partir de lo que necesitas que te pague el negocio cada mes y dividirlo entre las horas que de verdad puedes dedicar a producir o atender. Ojo: no todas tus horas se pueden vender, porque parte del tiempo se va en comprar, limpiar, contestar mensajes y organizarte. Por eso el valor de tu hora suele ser mayor que un simple sueldo dividido entre las horas del mes. Si no sabes por dónde empezar, prueba con un valor y cambia el dato en la calculadora para ver cuánto mueve el precio.",
      "**Redondear el precio sin perder de vista el margen.** El precio que calcula la página es el que da exactamente tu margen deseado. En la práctica solemos redondear (de 43.33 a 44 o a 45) por comodidad al cobrar o porque el mercado lo entiende mejor. Redondear hacia arriba mejora el margen; hacia abajo, lo reduce. Escribe el precio que pensabas cobrar en «Precio que estás pensando cobrar» y mira el margen real que resulta: así sabes exactamente qué estás decidiendo.",
      "**Comisiones, envíos y descuentos.** Si vendes por una plataforma que cobra una comisión, si aceptas pagos con tarjeta o si ofreces envío gratis, esos costos también son parte de lo que cuesta vender. Súmalos a los materiales o al empaque antes de calcular. Con los descuentos, calcula cuánto baja tu margen antes de ofrecerlos: un descuento que parece pequeño sobre el precio puede ser grande sobre lo que te queda. Puedes comprobarlo cambiando el precio elegido en la calculadora.",
      "**Cuándo revisar el precio.** Revísalo cuando cambie el costo de un ingrediente o de un material importante, cuando cambie tu alquiler o el valor de tu tiempo, cuando vendas claramente menos o más de lo que suponías y cuando lances un producto nuevo. No esperes a que el margen sea negativo: una revisión cada tres o cuatro meses suele ser suficiente para un negocio pequeño. Si tienes que subir el precio, decide primero cuánto y solo después pídele a la IA cómo comunicarlo.",
      "**Aviso.** Esta herramienta ayuda a entender tus costos y a comparar escenarios. No da asesoría contable, tributaria ni legal: los impuestos, las reglas sobre cómo mostrar precios y las normas de consumo cambian según el país, y conviene consultarlas con un profesional antes de fijar o publicar un precio.",
    ],
  },
});
