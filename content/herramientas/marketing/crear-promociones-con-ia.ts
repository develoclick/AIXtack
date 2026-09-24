import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /marketing/crear-promociones-con-ia (Calculadora). Fuente: la guía larga content/guias/marketing/crear-promociones-con-ia
 * y sus capturas reales. Caso: Café Mirador (ficticio). La página calcula margen, descuento real, ventas necesarias y
 * si respeta el límite; el prompt recibe esas cifras ya hechas y NO las recalcula.
 *
 * Las capturas son REALES pero del método anterior, en el que la IA calculaba y el dueño contrastaba con su hoja.
 * Se muestran con esa aclaración. `publicado` sigue en `false` hasta tener la prueba del prompt nuevo (IA y fecha).
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "crear-promociones-con-ia",
    area: "marketing",
    tipo: "calculadora",
    titulo: "Crea una promoción que no te haga perder dinero",
    descripcion: "Calcula el margen, el descuento real y las ventas que necesitas, y copia un prompt que redacta la promoción sin recalcular ni inventar cifras.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA y fecha de la prueba del prompt nuevo (las capturas actuales son del método anterior; se desconoce la IA y la fecha).
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/marketing/crear-promociones-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Dame ideas de promociones para mi cafetería.» La IA no sabe cuánto cuesta tu café ni qué límite tienes: rellena con un 2x1 o «gana un café gratis» y cierra con «podrías aumentar tus ventas un 30 %» (ejemplo ilustrativo), una predicción sin ningún dato.",
    despues: "Tus **cuentas hechas por la página** (margen, descuento real, ventas necesarias y si respeta tu límite) y un prompt que redacta la promoción con esas cifras, **sin recalcularlas** y sin prometer ventas.",
  },

  campos: [
    { id: "promocion", label: "¿Qué promoción quieres lanzar?", tipo: "texto", ejemplo: "Combo de media mañana: 1 café + 1 croissant a $4.00", requerido: true, ayuda: "Qué compra el cliente (la canasta) y a qué precio." },
    { id: "tipo", label: "Tipo de promoción", tipo: "seleccion", ejemplo: "Combo", opciones: ["Descuento en %", "2x1 o producto gratis", "Combo", "Tarjeta de visitas", "Otro"], requerido: true },
    { id: "franja", label: "Cuándo aplica", tipo: "texto", ejemplo: "Martes a jueves, de 9:30 a 11:30, durante tres semanas", requerido: true, ayuda: "Días, horas o fechas, y cuánto dura." },
    { id: "objetivo", label: "Objetivo con una cifra", tipo: "texto", ejemplo: "Pasar de 20 a 24 pedidos de café + croissant por semana", requerido: true, ayuda: "«Vender más» no sirve; una cifra que puedas comprobar, sí." },
    { id: "parada", label: "Condición de parada", tipo: "texto", ejemplo: "Detener si tras dos semanas se venden menos de 24 pedidos por semana", requerido: true, ayuda: "La decides tú antes de lanzar." },
    { id: "limites", label: "Otros límites (opcional)", tipo: "texto", ejemplo: "Nada por debajo del costo", ayuda: "Productos que no entran, precios mínimos…" },
  ],
  usaPerfil: ["nombre", "rubro", "moneda"],

  calculadora: {
    entradas: [
      { id: "precioNormal", label: "Precio normal de la canasta", unidad: "moneda", ejemplo: "4.50", ayuda: "Lo que paga hoy el cliente por todo lo que se lleva." },
      { id: "costo", label: "Costo de la canasta", unidad: "moneda", ejemplo: "1.30", ayuda: "Ingredientes y empaque, sin alquiler ni sueldos." },
      { id: "precioPromo", label: "Precio con promoción", unidad: "moneda", ejemplo: "4.00", ayuda: "Un 2x1 o un «gratis» también se escribe como el precio que paga el cliente por la canasta." },
      { id: "descuentoMaximo", label: "Descuento máximo aceptable", unidad: "porcentaje", ejemplo: "20", max: 100 },
      { id: "ventasActuales", label: "Pedidos actuales por semana", unidad: "entero", ejemplo: "20", ayuda: "De esta canasta, en la franja." },
      { id: "objetivoPedidos", label: "Pedidos por semana que buscas", unidad: "entero", ejemplo: "24" },
    ],
    salidas: [
      { id: "margenAntes", etiqueta: "Margen por canasta antes", formula: "precioNormal - costo", formato: "moneda" },
      { id: "margenDespues", etiqueta: "Margen por canasta con la promoción", formula: "precioPromo - costo", formato: "moneda" },
      { id: "descuentoReal", etiqueta: "Descuento real", formula: "(precioNormal - precioPromo) / precioNormal", formato: "porcentaje", decimales: 1 },
      { id: "ventasNecesarias", etiqueta: "Ventas necesarias para ganar lo mismo", formula: "margenAntes / si(margenDespues > 0; margenDespues; 0) - 1", formato: "porcentaje", decimales: 1, ayuda: "Es un umbral, no una predicción." },
      { id: "pedidosNecesarios", etiqueta: "Pedidos por semana que necesitarías", formula: "ventasActuales * (1 + ventasNecesarias)", formato: "numero", decimales: 1 },
      { id: "respeta", etiqueta: "¿Respeta tu límite?", formula: "descuentoReal <= descuentoMaximo && precioPromo >= costo", formato: "si-no" },
      { id: "conviene", etiqueta: "¿Conviene probarla con estas cifras?", formula: "si(respeta; pedidosNecesarios <= objetivoPedidos; 0)", formato: "si-no", ayuda: "Sí = respeta tu límite y los pedidos necesarios no superan tu objetivo." },
    ],
    casosDePrueba: [
      { nombre: "A · Combo de media mañana", entradas: { precioNormal: 4.5, costo: 1.3, precioPromo: 4, descuentoMaximo: 20, ventasActuales: 20, objetivoPedidos: 24 }, esperado: { margenAntes: 3.2, margenDespues: 2.7, descuentoReal: 0.1111, ventasNecesarias: 0.1852, pedidosNecesarios: 23.7037, respeta: "Sí", conviene: "Sí" } },
      { nombre: "B · Desayuno completo con 15 %", entradas: { precioNormal: 7.5, costo: 2.4, precioPromo: 6.375, descuentoMaximo: 20, ventasActuales: 20, objetivoPedidos: 24 }, esperado: { margenAntes: 5.1, margenDespues: 3.975, descuentoReal: 0.15, ventasNecesarias: 0.283, pedidosNecesarios: 25.6604, respeta: "Sí", conviene: "No" } },
      { nombre: "C · Tarjeta de 5 visitas, la 5.ª gratis", entradas: { precioNormal: 22.5, costo: 6.5, precioPromo: 18, descuentoMaximo: 20, ventasActuales: 20, objetivoPedidos: 24 }, esperado: { margenAntes: 16, margenDespues: 11.5, descuentoReal: 0.2, ventasNecesarias: 0.3913, pedidosNecesarios: 27.8261, respeta: "Sí", conviene: "No" } },
      { nombre: "D · Ven acompañado (2.º croissant gratis)", entradas: { precioNormal: 9, costo: 2.6, precioPromo: 7, descuentoMaximo: 20, ventasActuales: 20, objetivoPedidos: 24 }, esperado: { margenAntes: 6.4, margenDespues: 4.4, descuentoReal: 0.2222, ventasNecesarias: 0.4545, respeta: "No", conviene: "No" } },
      { nombre: "Precio por debajo del costo", entradas: { precioNormal: 4.5, costo: 1.3, precioPromo: 1, descuentoMaximo: 20, ventasActuales: 20, objetivoPedidos: 24 }, esperado: { margenDespues: -0.3, respeta: "No", conviene: "No" } },
    ],
  },

  tarea: `Redacta mi promoción con los números que ya calculó la página. Los datos de arriba son la única fuente de hechos y las cifras de «Cálculos ya hechos» son las buenas: no las recalcules, no las corrijas y no inventes otras.

Entrega:
1. TEXTO DE LA PROMOCIÓN para el cliente: una versión corta y una versión de dos o tres frases, para «{{promocion}}». Usa las cifras solo si ayudan al cliente a entender la oferta (precio, fecha, condiciones).
2. DOS ALTERNATIVAS de un tipo distinto a «{{tipo}}», cada una con: qué se ofrece, qué compra el cliente y el dato que me falta. No pongas precios ni porcentajes en ellas: son ideas para que yo las calcule en la página.
3. QUÉ MEDIR Y CUÁNDO PARAR: qué anotar cada semana en «{{franja}}» y cómo comparar con mi objetivo («{{objetivo}}»). La condición de parada es la mía y no la reemplazas: «{{parada}}».

Reglas:
- No prometas ni estimes ventas: los «pedidos que necesitarías» son un umbral, no un pronóstico.
- Si la promoción no respeta mi límite o no conviene según los cálculos, dilo con la cifra en lugar de defenderla.
- Separa lo que sale de mis datos de lo que supones o sugieres.
- Otros límites: {{limites}}.

Formato de salida, en este orden y con estos títulos: TEXTO DE LA PROMOCIÓN, ALTERNATIVAS, QUÉ MEDIR, DE DÓNDE SALE CADA CIFRA y FALTA.

Antes de responder, comprueba que cada cifra que usaste está en «Cálculos ya hechos» o en mis datos, que no hiciste cuentas nuevas y que no hay predicciones de ventas. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más corto", prompt: "Hazlo más corto sin quitar el precio ni la vigencia." },
    { label: "Probar una alternativa", prompt: "Toma la alternativa 1 y dime qué dato me falta para calcularla en la página." },
    { label: "Solo lo verificable", prompt: "Subraya cada cifra del texto y dime de qué línea de mis datos o de los cálculos sale." },
    { label: "Condiciones claras", prompt: "Escribe las condiciones de la promoción en una línea para la letra pequeña, sin añadir ninguna nueva." },
  ],

  ejemplo: {
    negocio: "Café Mirador (ficticio), cafetería de barrio con dos personas en el mostrador",
    datos: {
      Productos: "Café $2.50 (costo $0.60) · Croissant $2.00 (costo $0.70) · Jugo natural $3.00 (costo $1.10)",
      Objetivo: "Pasar de 20 a 24 pedidos de café + croissant por semana en la franja lenta",
      Franja: "Martes a jueves, de 9:30 a 11:30, durante tres semanas",
      Límites: "Descuento máximo del 20 % y nada por debajo del costo",
      "Condición de parada": "Detener si tras dos semanas se venden menos de 24 pedidos por semana",
    },
    resultado: {
      "Promoción A · Combo (1 café + 1 croissant a $4.00)": "Margen $3.20 → $2.70 · descuento real 11.1 % · ventas necesarias +18.5 % (23.7 pedidos por semana) · respeta el límite",
      "Promoción D · Ven acompañado": "Descartada: descuento real 22.2 %, supera el límite del 20 %",
      "Recomendación": "Probar A durante tres semanas y detenerla si tras dos semanas hay menos de 24 pedidos por semana",
    },
    capturas: [
      {
        src: "/img/marketing/crear-promociones-con-ia/prueba-prompt-02.webp",
        alt: "Captura de la respuesta de un asistente de IA con cuatro promociones para Café Mirador: combo de media mañana, desayuno completo, tarjeta de fidelidad y ven acompañado, cada una con su canasta, su riesgo y el dato que le falta.",
        etiqueta: "Prueba real",
        ancho: 1087,
        alto: 544,
        leyenda: "Prueba real, con el prompt de la versión anterior de esta guía: las cuatro alternativas, todavía sin cifras.",
      },
      {
        src: "/img/marketing/crear-promociones-con-ia/prueba-prompt-04.webp",
        alt: "Captura de la recomendación de un asistente de IA: diferencias con las cifras anteriores, promoción D descartada por superar el 20 % y recomendación de la promoción A con su cuenta semanal.",
        etiqueta: "Prueba real",
        ancho: 522,
        alto: 784,
        leyenda: "Prueba real, método anterior: la recomendación con las cifras del dueño (en aquel método, la IA también hacía las cuentas).",
      },
    ],
    queCorregi: [
      "La IA dejó las cuatro promociones sin precio («precio o porcentaje de descuento»): los precios los puse yo.",
      "La tarjeta y «ven acompañado» necesitaban una recompensa concreta: la definí yo (la 5.ª visita gratis; el 2.º croissant gratis).",
      "Repetí las cuentas en mi hoja y coincidieron; la condición de parada (menos de 24 pedidos por semana tras dos semanas) la puse yo.",
    ],
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo con el prompt de esta página y las cifras ya calculadas de Café Mirador (ficticio): el texto de la promoción y las dos alternativas, sin que la IA recalcule.",
    },
  ],

  checklist: [
    "Recalculé el margen y las ventas necesarias en mi hoja y coinciden con los de la página.",
    "Ninguna promoción baja del costo ni supera mi descuento máximo (el 2x1 y el «gratis» incluidos).",
    "Eliminé toda frase que prometa ventas futuras.",
    "Las condiciones son claras: fechas, exclusiones y stock.",
    "Puedo cumplir la oferta con mi equipo y mi stock, y escribí cuándo la voy a detener.",
  ],

  porQueFunciona: [
    {
      titulo: "La página calcula, la IA propone, tú decides",
      texto: "Las cuentas las hace la calculadora y el prompt las recibe ya hechas, con la orden de no recalcularlas. Una IA puede presentar con seguridad una cuenta mal hecha; una fórmula con casos de prueba, no.",
    },
    {
      titulo: "Se calcula por canasta",
      texto: "La **canasta** es lo que el cliente se lleva en una misma compra: un café, dos cafés en un 2x1 o un combo. Comparar el margen de un café con el de dos hace parecer una promoción mejor o peor de lo que es.",
    },
    {
      titulo: "Un 2x1 o un «gratis» es un descuento",
      texto: "Se escribe como el precio que paga el cliente por la canasta y se convierte en porcentaje del precio normal. Así queda a la vista si rompe tu límite, aunque suene a regalo.",
    },
    {
      titulo: "Las ventas necesarias son un umbral",
      texto: "Dicen cuánto más tendrías que vender para ganar lo mismo que hoy; no cuánto vas a vender. Por eso el prompt prohíbe predecir y pide una condición de parada tuya.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "La Esquina (ficticio): menú del día a $9.00 con costo de $3.60, margen $5.40. Con una bebida incluida (costo $0.50) el margen baja a $4.90: necesita +10.2 % de ventas. Con un 15 % de descuento baja a $4.05: +33.3 %.",
      consejo: "Compara siempre los dos caminos con la misma canasta: la bebida incluida deja el precio a la vista y exige mucho menos crecimiento.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Rincón (ficticia): artículo a $10.00 con costo de $4.00. Segunda unidad a mitad de precio: la canasta de dos vale $15.00 en vez de $20.00, el descuento real es 25 % y el margen baja de $12.00 a $7.00: necesita +71.4 %.",
      consejo: "«A mitad de precio» suena a poco, pero sobre la canasta de dos es un 25 %. Conviértelo antes de compararlo con tu límite.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Luz Cálida (ficticio, estudio de fotografía): sesión a $60.00 con costos directos de $12.00, margen $48.00. Con un 20 % en martes y miércoles el margen baja a $36.00: necesita +33.3 % de sesiones.",
      consejo: "En un servicio con agenda, una hora vacía no se recupera. Limita los cupos y mantén el precio completo los demás días para no enseñar a esperar el descuento.",
    },
  ],

  errores: [
    {
      error: "Empezar por el descuento y no por el objetivo",
      solucion: "Si eliges «un 20 %» antes de saber qué quieres, no puedes juzgar si la oferta sirve. Escribe primero el objetivo con una cifra y una franja.",
    },
    {
      error: "Comparar canastas distintas",
      solucion: "Define la canasta de cada promoción y calcula el margen antes y después sobre esa misma canasta.",
    },
    {
      error: "Lanzar sin fecha de fin ni métrica",
      solucion: "Sin fin, la promoción se convierte en tu precio real. Antes de lanzar, escribe la fecha de fin, la cifra que mirarás y la condición de parada.",
    },
    {
      error: "Pedirle a la IA que haga las cuentas",
      solucion: "Puede equivocarse al calcular y presentarlo con seguridad. Si la usas para contrastar, repite al menos una fila completa en tu hoja.",
    },
  ],

  faq: [
    { p: "¿Y si no sé cuánto me cuestan mis productos?", r: "Sin costos no puedes saber si una oferta deja ganancia. Empieza por un costo aproximado de cada producto (ingredientes, empaque, compra al proveedor): es mejor que ninguno." },
    { p: "¿Es seguro pegar mis precios y costos en una herramienta de IA?", r: "Depende de la herramienta y de cuán confidencial sea para ti: revisa su política de privacidad y no incluyas datos de clientes. Los cálculos ocurren en esta página, en tu navegador." },
    { p: "¿Puede la IA decirme cuánto voy a vender con la promoción?", r: "No con fiabilidad. La página calcula cuánto tendrías que vender para ganar lo mismo que hoy; cuánto venderás depende de tu clientela y del momento." },
    { p: "¿Cuánto tiempo debo probar una promoción?", r: "Lo suficiente para compararla con tus semanas normales; con pocas ventas por semana, una prueba corta varía mucho. Fija tú la duración antes de empezar." },
    { p: "¿Qué pasa si el precio con promoción queda por debajo del costo?", r: "La calculadora lo marca: el margen sale negativo, las ventas necesarias no se calculan y «¿Respeta tu límite?» dice «No»." },
    { p: "¿Tengo que revisar alguna regla sobre promociones?", r: "Sí: las reglas sobre promociones, precios y consumidores varían por país y esta herramienta no las cubre. Consulta a un profesional." },
  ],

  relacionadas: ["marketing/crear-anuncios-con-ia", "marketing/crear-afiches-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: las tres cuentas, la hoja y las pruebas del método anterior",
    parrafos: [
      "**Las tres cuentas.** (1) Margen de una canasta = lo que paga el cliente − el costo de esa canasta. (2) Descuento real = (precio normal − precio con promoción) ÷ precio normal. (3) Ventas necesarias = margen antes ÷ margen después − 1. Son las que hace la calculadora de arriba; si prefieres una hoja de cálculo, son tres fórmulas: `=B2-C2`, `=(B2-E2)/B2` y `=SI(G2>0;D2/G2-1;\"pérdida\")` (en inglés `=IF(G2>0,D2/G2-1,\"loss\")`; con coma decimal, los argumentos suelen separarse con punto y coma).",
      "**El caso completo.** En Café Mirador (ficticio) las cuatro promociones salen así: A, combo a $4.00: descuento real 11.11 %, margen $3.20 → $2.70, ventas necesarias 18.52 %, respeta el límite. B, desayuno con 15 %: 15.00 %, $5.10 → $3.975, 28.30 %, respeta. C, tarjeta de cinco visitas con la quinta gratis: 20.00 %, $16.00 → $11.50, 39.13 %, respeta. D, «ven acompañado» con el segundo croissant gratis: 22.22 %, $6.40 → $4.40, 45.45 %, no respeta el límite del 20 %.",
      "**El error más frecuente (ilustración, caso ficticio).** Aplicar el 15 % al margen en lugar de al precio: 5.10 × 0.85 = 4.34, cuando lo correcto es 6.375 − 2.40 = 3.975, y las ventas necesarias pasan de +17.6 % a +28.3 %. En la prueba real la IA no cometió este error; por eso las cuentas de esta página las hace una fórmula y no la IA.",
      "**Punto de equilibrio de la prueba.** Con 20 pedidos por semana y un margen de $3.20 ganas $64.00; con la promoción A y los mismos 20 pedidos, $54.00. Con 24 pedidos, 24 × $2.70 = $64.80, casi lo mismo que hoy. El punto de equilibrio está en 23.7 pedidos: por eso la condición de parada de este caso es «menos de 24».",
      "**Rúbrica de seis criterios** para contrastar cuentas ajenas, con 0, 1 o 2 puntos cada una: usa solo mis datos; convierte cada oferta en descuento; aplica las fórmulas pedidas; coincide con mi hoja; marca lo que rompe mis límites; no predice ventas.",
      "**Pruebas reales del método anterior.** Las capturas de abajo son respuestas reales de una IA, sin editar, a los prompts encadenados de la versión anterior de esta guía, con los datos de Café Mirador. En ese método la IA calculaba y se contrastaba con la hoja: en la prueba, las cuatro filas coincidieron. La primera es una captura real de la hoja de datos del caso.",
    ],
    capturas: [
      {
        src: "/img/marketing/crear-promociones-con-ia/datos-necesarios.webp",
        alt: "Hoja de cálculo «Datos del caso — Café Mirador» con precio, costo y margen de café, croissant, jugo natural y desayuno completo, y debajo el objetivo, la franja, las ventas actuales y los límites.",
        etiqueta: "Ilustración",
        ancho: 1600,
        alto: 711,
        leyenda: "Captura de la hoja con los datos del caso ficticio de Café Mirador; no es una respuesta de una IA.",
      },
      {
        src: "/img/marketing/crear-promociones-con-ia/prueba-prompt-03.webp",
        alt: "Captura de la respuesta de un asistente de IA con la tabla de cuentas de las cuatro promociones, las cuentas paso a paso y «Para comprobar tú»; la promoción D no respeta el límite del 20 %.",
        etiqueta: "Prueba real",
        ancho: 634,
        alto: 787,
        leyenda: "Prueba real, método anterior: las cuentas que devolvió la IA, para recalcular en la hoja.",
      },
    ],
  },
});
