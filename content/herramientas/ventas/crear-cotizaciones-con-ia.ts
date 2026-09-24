import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /ventas/crear-cotizaciones-con-ia (Calculadora). Fuente: la guía larga content/guias/ventas/crear-cotizaciones-y-propuestas-con-ia.
 * Caso: Maderas Rivera (ficticio). La página calcula subtotales, descuento, impuesto, total, anticipo y saldo; la IA
 * solo redacta con esas cifras ya hechas. Sin pruebas reales todavía: `publicado` en `false`.
 *
 * Bases explícitas: el descuento se aplica solo a los ítems «con descuento»; el impuesto, sobre el subtotal ya con
 * descuento; el anticipo, sobre el total. Redondeo único: el anticipo (a 2 decimales); el saldo se calcula restando.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "crear-cotizaciones-con-ia",
    area: "ventas",
    tipo: "calculadora",
    titulo: "Prepara una cotización clara con los totales correctos",
    descripcion: "Calcula subtotal, descuento, impuesto, anticipo y saldo, y copia un prompt que redacta la cotización o propuesta sin tocar tus cifras ni inventar condiciones.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/ventas/crear-cotizaciones-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Hazme una cotización: 3 módulos a 450, 2 a 300, una encimera a 700 y 12 horas de instalación a 25. Ponle 10 % de descuento, suma el impuesto de 20 % y dime el total.» La IA no sabe a qué líneas va el descuento y elige una interpretación que suena razonable (ejemplo ilustrativo): el documento sale con aspecto de terminado.",
    despues: "Los **totales calculados por la página**, cada porcentaje con su base, y un documento que copia esas cifras y solo escribe las **condiciones que tú confirmaste**. Lo pendiente queda como [FALTA].",
  },

  campos: [
    { id: "tipoDocumento", label: "Tipo de documento", tipo: "seleccion", ejemplo: "Cotización", opciones: ["Cotización", "Propuesta"], requerido: true, ayuda: "Una propuesta añade el contexto: lo que el cliente necesita y cómo trabajarás." },
    { id: "cliente", label: "Cliente y pedido", tipo: "largo", ejemplo: "Sra. Paredes: una cocina con tres módulos bajos, dos altos, una encimera de 2 m e instalación", requerido: true, ayuda: "En sus palabras, sin datos que no necesites." },
    { id: "itemsConDescuento", label: "Ítems que llevan descuento", tipo: "largo", ejemplo: "Módulo bajo de cocina (80 cm), 3 u. a 450 · Módulo alto de cocina (60 cm), 2 u. a 300", ayuda: "Descríbelos como irán en el documento. Los números se escriben en la calculadora." },
    { id: "itemsSinDescuento", label: "Ítems sin descuento", tipo: "largo", ejemplo: "Encimera de madera (2 m), 1 u. a 700 · Instalación, 12 h a 25", ayuda: "Opcional." },
    { id: "incluye", label: "Qué incluye", tipo: "largo", ejemplo: "Fabricación e instalación de 3 módulos bajos, 2 módulos altos y una encimera de 2 m", requerido: true },
    { id: "noIncluye", label: "Qué no incluye", tipo: "largo", ejemplo: "Pintura, retiro de muebles antiguos y conexiones de agua o gas", requerido: true, ayuda: "Lo que el cliente podría dar por hecho y no está." },
    { id: "pago", label: "Forma de pago", tipo: "texto", ejemplo: "40 % de anticipo al aceptar; el saldo, al terminar la instalación", requerido: true },
    { id: "validez", label: "Vigencia de la oferta", tipo: "texto", ejemplo: "15 días desde la emisión: del 12 al 27 de marzo", requerido: true },
    { id: "aceptar", label: "Cómo aceptar", tipo: "texto", ejemplo: "Responder este mensaje o escribir por WhatsApp; se confirma con el anticipo", requerido: true },
    { id: "plazo", label: "Plazo de entrega (solo si te comprometes)", tipo: "texto", ejemplo: "", ayuda: "Si aún no lo decidiste, déjalo vacío: el documento no lo escribirá." },
    { id: "garantia", label: "Garantía (solo si ya la decidiste)", tipo: "texto", ejemplo: "", ayuda: "Vacío = no aparece en el documento." },
  ],
  usaPerfil: ["nombre", "contacto", "tono", "moneda"],

  calculadora: {
    entradas: [
      { id: "cant1", label: "Ítem 1 con descuento: cantidad", unidad: "numero", ejemplo: "3" },
      { id: "precio1", label: "Ítem 1 con descuento: precio unitario", unidad: "moneda", ejemplo: "450" },
      { id: "cant2", label: "Ítem 2 con descuento: cantidad (opcional)", unidad: "numero", ejemplo: "2", requerido: false },
      { id: "precio2", label: "Ítem 2 con descuento: precio unitario (opcional)", unidad: "moneda", ejemplo: "300", requerido: false },
      { id: "cant3", label: "Ítem 3 sin descuento: cantidad (opcional)", unidad: "numero", ejemplo: "1", requerido: false },
      { id: "precio3", label: "Ítem 3 sin descuento: precio unitario (opcional)", unidad: "moneda", ejemplo: "700", requerido: false },
      { id: "cant4", label: "Ítem 4 sin descuento: cantidad (opcional)", unidad: "numero", ejemplo: "12", requerido: false },
      { id: "precio4", label: "Ítem 4 sin descuento: precio unitario (opcional)", unidad: "moneda", ejemplo: "25", requerido: false },
      { id: "descuento", label: "Descuento sobre los ítems con descuento (opcional)", unidad: "porcentaje", ejemplo: "10", requerido: false, max: 100 },
      { id: "impuesto", label: "Impuesto sobre el subtotal con descuento (opcional)", unidad: "porcentaje", ejemplo: "20", requerido: false, max: 100, ayuda: "El que te corresponda según tu país. Déjalo vacío si el precio ya lo incluye." },
      { id: "anticipo", label: "Anticipo sobre el total (opcional)", unidad: "porcentaje", ejemplo: "40", requerido: false, max: 100 },
    ],
    salidas: [
      { id: "baseDescuento", etiqueta: "Base del descuento (ítems con descuento)", formula: "cant1 * precio1 + cant2 * precio2", formato: "moneda" },
      { id: "sinDescuento", etiqueta: "Ítems sin descuento", formula: "cant3 * precio3 + cant4 * precio4", formato: "moneda" },
      { id: "subtotal", etiqueta: "Subtotal", formula: "baseDescuento + sinDescuento", formato: "moneda" },
      { id: "montoDescuento", etiqueta: "Descuento (sobre la base del descuento)", formula: "baseDescuento * descuento", formato: "moneda" },
      { id: "baseImpuesto", etiqueta: "Base del impuesto (subtotal menos descuento)", formula: "subtotal - montoDescuento", formato: "moneda" },
      { id: "montoImpuesto", etiqueta: "Impuesto (sobre la base del impuesto)", formula: "baseImpuesto * impuesto", formato: "moneda" },
      { id: "total", etiqueta: "Total", formula: "baseImpuesto + montoImpuesto", formato: "moneda" },
      { id: "montoAnticipo", etiqueta: "Anticipo (sobre el total; único redondeo)", formula: "round(total * anticipo; 2)", formato: "moneda" },
      { id: "saldo", etiqueta: "Saldo (total menos anticipo)", formula: "total - montoAnticipo", formato: "moneda" },
    ],
    casosDePrueba: [
      {
        nombre: "Maderas Rivera: cocina a medida",
        entradas: { cant1: 3, precio1: 450, cant2: 2, precio2: 300, cant3: 1, precio3: 700, cant4: 12, precio4: 25, descuento: 10, impuesto: 20, anticipo: 40 },
        esperado: { baseDescuento: 1950, sinDescuento: 1000, subtotal: 2950, montoDescuento: 195, baseImpuesto: 2755, montoImpuesto: 551, total: 3306, montoAnticipo: 1322.4, saldo: 1983.6 },
      },
      {
        nombre: "Un solo ítem, con impuesto y anticipo",
        entradas: { cant1: 1, precio1: 100, impuesto: 18, anticipo: 50 },
        esperado: { subtotal: 100, montoDescuento: 0, baseImpuesto: 100, montoImpuesto: 18, total: 118, montoAnticipo: 59, saldo: 59 },
      },
      {
        nombre: "Sin descuento, sin impuesto y sin anticipo",
        entradas: { cant1: 2, precio1: 50 },
        esperado: { subtotal: 100, montoDescuento: 0, montoImpuesto: 0, total: 100, montoAnticipo: 0, saldo: 100 },
      },
      {
        nombre: "Descuento solo sobre los ítems marcados",
        entradas: { cant1: 4, precio1: 25, cant2: 1, precio2: 50, cant3: 2, precio3: 30, descuento: 15 },
        esperado: { baseDescuento: 150, sinDescuento: 60, subtotal: 210, montoDescuento: 22.5, baseImpuesto: 187.5, total: 187.5 },
      },
      {
        nombre: "El redondeo está solo en el anticipo: anticipo y saldo suman el total",
        entradas: { cant1: 1, precio1: 33.33, anticipo: 33 },
        esperado: { total: 33.33, montoAnticipo: 11, saldo: 22.33 },
      },
    ],
  },

  tarea: `Redacta el documento comercial de mi negocio. La hoja de «Cálculos ya hechos» y mis datos de arriba son la única fuente: copia cada importe, porcentaje y total tal como está, junto al concepto que tiene, sin calcular ni redondear nada.

Tipo de documento: {{tipoDocumento}}.

Entrega, en este orden y con estos títulos:
1. ENCABEZADO: mi negocio, el cliente y el pedido, la fecha de emisión y hasta cuándo vale («{{validez}}»).
2. DETALLE: una tabla con las columnas Concepto | Cantidad | Precio unitario | Importe, con los ítems de mis datos (con descuento: {{itemsConDescuento}}; sin descuento: {{itemsSinDescuento}}).
3. TOTALES: cada renglón de los cálculos, y para cada porcentaje, el importe y la base a la que se aplicó.
4. CONDICIONES: qué incluye, qué no incluye, forma de pago, vigencia y cómo aceptar, con mis datos.
5. FALTA: lo que necesitaría y no me diste.

Reglas:
- Las condiciones que no aparezcan en mis datos (plazo de entrega, garantía) no las escribas ni las insinúes: anótalas en FALTA. Plazo: {{plazo}}. Garantía: {{garantia}}.
- No inventes garantías, plazos, materiales, marcas, referencias de otros clientes ni credenciales, y no uses adjetivos que afirmen una calidad que mis datos no contienen.
- Si el tipo es «Propuesta», añade antes del detalle una sección «Lo que entendimos» con el pedido del cliente en sus palabras y otra «Cómo trabajaremos» solo con lo que digan mis condiciones. Si no hay datos para una sección, escribe [FALTA: el dato].
- Si un total no es igual a la base del impuesto más el impuesto, avísame antes de escribir.
- Separa lo que sale de mis datos de lo que supones o sugieres.

Antes de responder, comprueba que cada importe y cada total es idéntico al de los cálculos, que cada porcentaje va con su importe y su base, que nada pendiente aparece ni insinuado y que el documento dice hasta cuándo vale y cómo aceptar. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más breve", prompt: "Hazlo más breve conservando todos los importes y las condiciones." },
    { label: "Tono más cercano", prompt: "Reescribe la introducción con un tono más cercano sin añadir datos ni condiciones nuevas." },
    { label: "Revisar contra los cálculos", prompt: "Compara cada cifra del documento con los cálculos ya hechos y dime cualquiera que no coincida, sin reescribir nada." },
    { label: "Corregir solo lo señalado", prompt: "Corrige únicamente las frases que te señalo y deja intacto el detalle y los totales." },
  ],

  ejemplo: {
    negocio: "Maderas Rivera (ficticio), carpintería de muebles a medida con dos personas",
    resultado: {
      Subtotal: "2950 (1950 con descuento + 1000 sin descuento)",
      "Descuento del 10 % sobre 1950": "195",
      "Impuesto del 20 % sobre 2755": "551",
      Total: "3306",
      "Anticipo del 40 % sobre el total": "1322.40",
      Saldo: "1983.60",
    },
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real») y, si el autor la tiene, una captura de la hoja.
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: la cotización redactada para Maderas Rivera (ficticio) con los totales que calculó la página. Deben verse el subtotal, el descuento, el impuesto, el total, el anticipo y el saldo sin que la IA cambie ninguna cifra.",
    },
  ],

  checklist: [
    "Cada cifra del documento coincide con la calculadora y la calculadora con mis precios y porcentajes.",
    "Comprobé el total una vez más, a mano o con una calculadora aparte.",
    "Cada descuento, impuesto y anticipo dice a qué importe se aplica.",
    "Las condiciones son las que decidí y puedo cumplir; lo pendiente está resuelto o no aparece.",
    "Confirmé con un profesional lo que corresponda a impuestos, facturación y garantías legales.",
  ],

  porQueFunciona: [
    {
      titulo: "La página calcula; la IA redacta",
      texto: "Si le pides a la IA que calcule y redacte en un solo mensaje, la cifra y la frase llegan juntas y con el mismo aspecto de terminadas. Aquí los totales salen de una fórmula con casos de prueba y el prompt los copia, sin tocarlos.",
    },
    {
      titulo: "Cada porcentaje tiene su base",
      texto: "«10 % de descuento» puede significar 195 o 295, y el cliente elegirá la que le convenga. La calculadora aplica el descuento solo a los ítems marcados, el impuesto al subtotal con descuento y el anticipo al total, y el documento lo escribe.",
    },
    {
      titulo: "Solo condiciones que decidiste",
      texto: "Un plazo o una garantía que suenan normales quedan escritos aunque nadie los decidiera, y el cliente los toma por una promesa. Lo que dejas vacío no aparece: el prompt lo anota como [FALTA].",
    },
    {
      titulo: "Un solo criterio de redondeo",
      texto: "Si un porcentaje da decimales, se redondea una vez, en el anticipo, y el saldo se calcula restando. Así las dos partes siempre suman el total.",
    },
  ],

  rubros: [
    {
      rubro: "Carpintería",
      ejemplo: "Maderas Rivera (ficticio): subtotal 2950; descuento del 10 % sobre los muebles 195; impuesto del 20 % sobre 2755: 551; total 3306; anticipo del 40 %: 1322.40.",
      consejo: "Si el descuento es «por llevar cinco módulos», escribe a qué líneas se aplica: las de los muebles, no la instalación ni la encimera.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio Trazo (ficticio, diseño gráfico): logo por $300 y 6 h de ajustes a $20; subtotal $420; impuesto del 18 %: $75.60; total $495.60; anticipo del 50 %: $247.80.",
      consejo: "Cambia las partidas por horas o entregables: las fórmulas son las mismas. Di cuántas rondas de ajustes incluye el precio.",
    },
    {
      rubro: "Comercio",
      ejemplo: "Muebles Norte (ficticio): 10 sillas a $40 con 5 % de descuento y un transporte de $25 sin descuento; subtotal $425; descuento $20 sobre las sillas; total $405 sin impuesto.",
      consejo: "Pon el transporte como línea aparte y sin descuento: el cliente ve qué paga por el producto y qué por llevarlo.",
    },
  ],

  errores: [
    {
      error: "Pedirle a la IA que calcule y redacte en un solo mensaje",
      solucion: "Calcula en la calculadora y pega los resultados al pedir el documento: así lo que hay que comprobar queda separado de lo que se redacta.",
    },
    {
      error: "Dejar que la IA complete tus condiciones",
      solucion: "Decide tú el plazo y la garantía. Si aún no los decidiste, déjalos vacíos: no aparecerán ni se insinuarán.",
    },
    {
      error: "Escribir un porcentaje sin su base",
      solucion: "Escribe siempre el importe y la base: «10 % sobre los módulos: 195».",
    },
    {
      error: "Cambiar una cifra en el texto y no en la calculadora",
      solucion: "La calculadora y el documento dejan de coincidir y ya no tienes con qué contrastar. Corrige primero los datos y vuelve a copiar el prompt.",
    },
  ],

  faq: [
    { p: "¿Qué hago si el cliente pide otra cantidad?", r: "Cámbiala en la calculadora, copia el prompt otra vez y pide de nuevo el documento. No edites las cifras dentro del texto." },
    { p: "¿Los precios llevan impuestos?", r: "Depende de tu país y de tu negocio. La calculadora permite sumar el impuesto aparte, como en el ejemplo, o dejarlo vacío. Confirma con un profesional cómo deben mostrarse." },
    { p: "¿Cuánto tiempo debe valer una cotización?", r: "El que tú decidas y puedas sostener. Lo importante es que lleve fecha de emisión y fecha límite." },
    { p: "¿Sirve si vendo solo servicios?", r: "Sí. Cambia las partidas por horas o entregables: las fórmulas son las mismas." },
    { p: "¿Cuál es la diferencia entre cotización y propuesta?", r: "Los números son los mismos. La cotización dice qué se entrega, cuánto cuesta y con qué condiciones; la propuesta añade lo que el cliente necesita y cómo lo resolverás." },
    { p: "¿Puede la IA fijar mi precio?", r: "No: no conoce tus costos ni tu margen, así que el precio es una decisión tuya. Para calcularlo, usa la herramienta de precios y márgenes." },
  ],

  relacionadas: ["ventas/calcular-precios-y-margenes", "marketing/crear-promociones-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: hoja equivalente, rúbrica y límites",
    parrafos: [
      "**Las mismas cuentas en una hoja de cálculo.** Con los importes en la columna F: subtotal `=SUMA(F2:F5)`; base del descuento `=SUMAR.SI(E2:E5;\"Sí\";F2:F5)` (en inglés `=SUMIF(E2:E5,\"Sí\",F2:F5)`); descuento `=F7*E8/100`; base del impuesto `=F6-F8`; impuesto `=F9*E10/100`; total `=F9+F10`; anticipo `=REDONDEAR(F11*E12/100;2)`; saldo `=F11-F12`. El separador entre argumentos depende de la configuración regional.",
      "**Tabla de condiciones.** Antes de pedir el documento anota, para cada condición, qué decidiste y su estado: qué incluye, qué no incluye, forma de pago, plazo, vigencia, garantía, cómo aceptar e impuestos. Lo que está «Pendiente» no se escribe. Un plazo o una garantía que aún no decidiste no se rellena con lo habitual.",
      "**Cotización o propuesta.** La cotización es corta: qué se entrega, cuánto cuesta y con qué condiciones. La propuesta añade dos secciones antes del detalle: «Lo que entendimos», con el pedido del cliente en sus palabras, y «Cómo trabajaremos», solo con lo que digan tus condiciones. Úsala cuando el cliente todavía está comparando o cuando el trabajo necesita explicación. En ambos casos los números son los mismos y salen de la calculadora.",
      "**Cómo revisar el documento que devuelve la IA.** Compara tres cosas en este orden: primero cada importe con la calculadora, después cada porcentaje con su base y, al final, cada condición con tus datos. Si una frase no está en tus datos (un plazo, una garantía, un adjetivo de calidad), bórrala o pídele a la IA que la quite. Si cambias una cifra, cámbiala primero en la calculadora y vuelve a copiar el prompt: nunca la edites solo en el texto.",
      "**Cuando el cliente negocia.** Un descuento nuevo se anota como un porcentaje nuevo sobre los ítems que corresponda, no como un precio final a ojo. Así el documento explica de dónde sale el importe y tú puedes comprobar cuánto margen te queda antes de aceptar. Si quieres saber si el descuento te conviene, calcula primero el precio y el margen con la herramienta de precios.",
      "**Rúbrica de cinco criterios** para revisar el documento (0, 1 o 2 puntos cada uno): las cifras coinciden con la hoja; solo condiciones confirmadas; dice qué incluye y qué no; se puede aceptar sin preguntar; sin promesas que nadie respalda.",
      "**Lo que este método no hace.** No fija tu precio, no conoce condiciones que no le das, no da asesoría legal ni tributaria (impuestos, facturación, garantías y cláusulas varían por país) y no envía la cotización ni da seguimiento al cliente.",
    ],
  },
});
