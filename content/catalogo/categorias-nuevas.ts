import type { Categoria } from "./tipos";

/**
 * Hubs de las 5 categorías nuevas, escritos de una vez. Están ocultos (404, sin menú ni sitemap) hasta que se publique su
 * primera herramienta. Todo el texto es propio; ningún dato, estadística ni fuente inventados. Los enlaces a herramientas los
 * pone el hub a partir del catálogo (solo las publicadas).
 */
export const CATEGORIAS_NUEVAS: Categoria[] = [
  // ───────────────────────────── Viajes y entretenimiento ─────────────────────────────
  {
    slug: "viajes-y-entretenimiento",
    nombre: "Viajes y entretenimiento",
    keywordPrincipal: "planificar viaje con ia",
    seo: {
      title: "Herramientas de IA para planificar viajes (gratis)",
      description: "Presupuesto, itinerario, fechas más baratas y destinos según tu dinero: herramientas gratis con IA, sin registro y sin precios inventados.",
    },
    h1: "Planifica tus viajes con IA: presupuesto, itinerario y fechas",
    intro: [
      "Planificar un viaje suele fallar por lo mismo: se reserva antes de saber cuánto costará realmente todo, o el itinerario se arma con más entusiasmo que realismo (tres ciudades en cinco días, traslados que nadie contó). Las herramientas de esta categoría te ayudan a ordenar el viaje con números y tiempos reales antes de comprar nada: presupuesto, itinerario día por día, fechas para volar y comparación de opciones.",
      "Hay una diferencia importante con otros sitios: no tenemos precios en tiempo real ni conexión con aerolíneas u hoteles, y no vamos a inventarlos. Tú consultas los precios que te interesan (en un buscador de vuelos, en la página del hotel, con tu agencia), los escribes en la herramienta y ella hace el trabajo de ordenar, sumar, comparar y detectar lo que falta. La IA te ayuda a pensar; los datos de precio y disponibilidad los pones tú, con la fecha en que los consultaste. Todo se guarda en tu navegador.",
      "Cómo usar esta categoría: empieza siempre por el dinero y los días. Con el presupuesto sabrás cuánto cuesta el viaje completo, cuánto de ese total tiene precio real y cuánto es solo una estimación; con esa información ya puedes decidir si el destino, las fechas y el tipo de alojamiento encajan. Si el resultado no te convence, lo más barato es ajustarlo en la tabla antes de reservar, no después. Una buena costumbre es anotar la fecha en que consultaste cada precio: entre que cotizas y reservas los precios pueden cambiar, y esa fecha te recuerda qué debes volver a comprobar.",
      "También conviene separar lo imprescindible (transporte, alojamiento, comida, seguro) de lo opcional (compras, excursiones extra), para saber a qué renunciar primero si el presupuesto se queda corto. Las herramientas no reservan ni compran nada por ti: ordenan tu decisión.",
    ],
    orden: 2,
    icono: "plane",
    faqs: [
      { q: "¿Las herramientas reservan vuelos u hoteles?", a: "No. Sirven para planificar y decidir antes de reservar: calculan, ordenan y comparan. La reserva la haces tú en la aerolínea, el hotel o la agencia que elijas." },
      { q: "¿Tienen precios reales de vuelos y alojamientos?", a: "No, y por eso no los mostramos. Los precios cambian constantemente y una herramienta sin conexión a las aerolíneas no puede conocerlos. Tú los consultas y los escribes, y la herramienta trabaja con esos datos." },
      { q: "¿Sirven para viajes dentro del Perú?", a: "Sí. Funcionan para cualquier destino, dentro o fuera del país, porque trabajan con los datos que tú ingresas: fechas, precios, días, personas y tus preferencias." },
      { q: "¿Qué asistente de IA necesito?", a: "Cualquiera que permita pegar texto: ChatGPT, Gemini, Claude u otro. Cada modelo responde a su manera, así que revisa siempre lo que te sugiere, sobre todo horarios, distancias y lugares." },
      { q: "¿Se guarda mi información de viaje?", a: "Lo que escribes en los formularios se guarda solo en tu navegador, en tu equipo. Al pegar un prompt en una IA, esos datos pasan a ese servicio y se rigen por su política de privacidad." },
      { q: "¿Cuánto cuestan las herramientas?", a: "Nada. Son gratis y no piden registro. Para usar los prompts necesitas un asistente de IA; muchos tienen un plan gratuito, con límites que define cada empresa." },
    ],
    contenido: {
      guia: {
        titulo: "Guía breve: cómo planificar un viaje con IA sin sorpresas",
        secciones: [
          {
            id: "tres-numeros",
            titulo: "Antes de buscar vuelos, fija tres números",
            parrafos: [
              "Empieza por el dinero total que puedes gastar, la cantidad de días y la cantidad de personas. Con esos tres datos ya puedes descartar destinos y fechas que no encajan. Añade un colchón para imprevistos: cuánto depende de tu tolerancia al riesgo y de si viajas con niños, con tiempos ajustados o a un lugar que no conoces.",
              "Si tu presupuesto está en soles y los precios aparecen en dólares o euros, decide un tipo de cambio de trabajo y anótalo, para que todas las comparaciones usen el mismo.",
            ],
          },
          {
            id: "itinerario-sin-inventos",
            titulo: "Cómo pedir un itinerario a una IA sin que invente",
            parrafos: [
              "Una IA puede proponer un recorrido razonable, pero también puede sugerir un lugar cerrado, un horario que ya no aplica o un traslado imposible en el tiempo que afirma. Dale contexto (ritmo de viaje, movilidad, intereses, horas de llegada y de salida, cuántas actividades por día) y pídele que separe lo que es seguro de lo que debes comprobar.",
              "Después verifica cada punto en un mapa y en la página oficial del lugar: horarios, días de cierre, entradas y tiempos de traslado. Trata el itinerario como un borrador, no como una reserva.",
              "Pide también un plan B para los días de lluvia o de cansancio: dos o tres actividades cercanas y flexibles que puedas mover sin afectar las reservas.",
            ],
          },
          {
            id: "precios",
            titulo: "Precios: lo que la IA no puede saber",
            parrafos: [
              "Los precios de vuelos, alojamiento y actividades cambian con las fechas, la demanda y las condiciones de cada tarifa (equipaje, cambios, cancelación). Un asistente de chat no consulta esos precios en tiempo real, por eso las herramientas de esta categoría te piden que los escribas tú, junto con la fecha en que los viste.",
              "Al comparar, iguala las condiciones: el mismo equipaje, escalas comparables y la misma política de cancelación. Un vuelo barato sin equipaje puede terminar costando más que otro que parecía caro.",
            ],
          },
          {
            id: "errores-frecuentes",
            titulo: "Errores frecuentes al planificar",
            parrafos: [
              "Los más comunes: no contar los traslados desde y hacia el aeropuerto, llenar cada día de actividades sin dejar tiempo libre, reservar sin leer la política de cancelación y olvidar revisar los requisitos de entrada del país de destino (documentos, visas y otros requisitos, si aplican) en las fuentes oficiales.",
              "Cuando un plan falla, casi siempre faltaba un dato. Las herramientas están pensadas para avisarte de lo que no ingresaste antes de darte un resultado, en lugar de rellenarlo con suposiciones.",
              "Una regla práctica: si algo no está en tu presupuesto ni en tu itinerario, todavía no está decidido. Anota lo que falta (seguro de viaje, propinas, transporte local, comidas, entradas) y dale un monto aproximado, aunque sea provisional. Es preferible ajustar un número estimado que descubrir un gasto olvidado cuando ya reservaste.",
            ],
          },
        ],
      },
      situaciones: [
        { situacion: "Quiero saber cuánto costará mi viaje completo", herramienta: "planificar-presupuesto-de-viaje" },
        { situacion: "Ya sé a dónde voy y necesito organizar los días", herramienta: "crear-itinerario-de-viaje" },
        { situacion: "Puedo volar en varias fechas y quiero elegir la más barata", herramienta: "encontrar-fechas-mas-baratas-para-volar" },
        { situacion: "Tengo varias opciones y no sé cuál conviene", herramienta: "comparar-opciones-de-viaje" },
        { situacion: "Tengo un monto y no sé a dónde ir", herramienta: "descubrir-destinos-segun-presupuesto" },
      ],
      anuncios: true,
    },
  },

  // ───────────────────────────── Emprendimiento ─────────────────────────────
  {
    slug: "emprendimiento",
    nombre: "Emprendimiento",
    keywordPrincipal: "herramientas de ia para emprendedores",
    seo: {
      title: "Herramientas de IA para emprender: plan, logo y rentabilidad",
      description: "Crea tu plan de negocio, logo y catálogo, calcula la rentabilidad y valida nichos con prompts de IA gratis, sin registro y con ejemplos.",
    },
    h1: "Herramientas de IA para emprender y hacer crecer tu negocio",
    intro: [
      "Muchas ideas de negocio se quedan en la cabeza o se lanzan sin comprobar lo básico: si alguien pagaría por eso, cuánto cuesta producirlo y a qué precio deja ganancia. Las herramientas de esta categoría te llevan de la idea a un negocio que puedes medir: validar el nicho antes de invertir, calcular la rentabilidad por producto, escribir un plan de negocio y preparar materiales comerciales como el logo o el catálogo.",
      "Funcionan con tus datos: tú pones tus costos, tus precios y lo que sabes de tus clientes; la IA ayuda a ordenar, redactar y detectar huecos. No inventa cifras de mercado ni testimonios y, cuando algo no se puede saber con lo que escribiste, te lo señala en lugar de rellenarlo. Todo se guarda en tu navegador.",
    ],
    orden: 3,
    icono: "rocket",
    faqs: [
      { q: "¿La IA escribe mi plan de negocio por mí?", a: "Te ayuda a ordenarlo y a redactarlo con tus datos, pero las decisiones y las cifras son tuyas. Un plan escrito solo con datos genéricos no sirve: se nota y no te ayuda a decidir." },
      { q: "¿Sirve si todavía no tengo un negocio?", a: "Sí. Justamente ahí ayuda más: a validar la idea, elegir un nicho y calcular si los números cierran antes de gastar dinero." },
      { q: "¿Cómo puedo validar un nicho gastando poco?", a: "Conversando con posibles clientes, ofreciendo una versión mínima o una preventa pequeña y observando si pagan. La herramienta de nichos te guía en definir qué resultado te haría seguir y cuál te haría cambiar." },
      { q: "¿Puedo usar como marca un logo creado con IA?", a: "Depende de los términos de uso de la herramienta que lo genere y de que el diseño no se parezca a una marca ya registrada. Revisa esos términos, que pueden cambiar. En Perú, el registro de marcas lo gestiona INDECOPI: consulta sus requisitos antes de invertir en tu identidad visual." },
      { q: "¿Qué datos necesito para calcular la rentabilidad?", a: "El costo de cada producto o servicio, su precio de venta, tus gastos fijos del mes y, si puedes, cuántas unidades vendes. Si no sabes alguno, la herramienta te ayuda a estimarlo y lo marca como supuesto." },
      { q: "¿Cuánto cuestan las herramientas?", a: "Son gratis y no piden registro. Necesitas un asistente de IA para usar los prompts; muchos ofrecen un plan gratuito con límites que define cada empresa." },
    ],
    contenido: {
      guia: {
        titulo: "Guía breve: de la idea al primer cliente",
        secciones: [
          {
            id: "validar",
            titulo: "Valida antes de invertir",
            parrafos: [
              "Antes de gastar en un local, en inventario o en publicidad, busca una señal de que alguien quiere lo que ofreces: conversa con posibles clientes, ofrece una versión mínima o una preventa pequeña y observa si pagan. Una idea que solo les gusta a tus amigos no está validada.",
              "Define de antemano qué resultado te haría seguir y cuál te haría cambiar de rumbo (por ejemplo, cuántas personas deberían aceptar tu oferta). Así la decisión no depende de tu entusiasmo del momento.",
              "Una forma barata de validar es escribir una oferta clara (qué vendes, para quién, a qué precio y cuándo lo entregas) y mostrársela a diez personas que encajen con tu cliente ideal. Registra cuántas preguntan, cuántas piden más información y cuántas están dispuestas a pagar o a reservar. Ese registro vale más que cualquier opinión.",
            ],
          },
          {
            id: "numeros-minimos",
            titulo: "Los números mínimos que necesitas",
            parrafos: [
              "Necesitas conocer cuatro cifras: cuánto te cuesta cada unidad, a qué precio la vendes, cuánto pagas cada mes en gastos fijos y cuántas unidades tendrías que vender para no perder (el punto de equilibrio). Si no sabes cuánto cuesta producir o comprar una unidad, todavía no sabes si ganas.",
              "Incluye tu tiempo en las cuentas. Un negocio que paga los materiales pero no paga tu trabajo puede parecer rentable y no ser sostenible.",
              "Con esos números puedes responder tres preguntas prácticas: cuánto necesitas vender para cubrir tus gastos, cuánto te queda por cada venta y qué pasa si sube el costo de tu insumo principal. Si la respuesta a la última te asusta, tu negocio depende demasiado de un solo proveedor o de un margen muy angosto.",
            ],
          },
          {
            id: "materiales-sin-inventar",
            titulo: "Materiales comerciales sin inventar nada",
            parrafos: [
              "Un buen logo y un catálogo claro ayudan a que te tomen en serio, pero no reemplazan un producto que resuelva un problema real. Al pedirle textos a una IA, no le permitas inventar testimonios, premios, clientes ni cifras: si no puedes comprobarlo, no lo publiques.",
              "Revisa también los términos de uso de la herramienta de IA que uses para crear imágenes o textos, porque pueden cambiar y determinan si puedes usar lo generado con fines comerciales.",
            ],
          },
          {
            id: "ia-como-socia",
            titulo: "Usa la IA como socia de preguntas incómodas",
            parrafos: [
              "Pídele que busque los puntos débiles de tu plan: qué supuestos no comprobaste, qué pasaría si vendes la mitad de lo esperado, qué costo olvidaste. Sus respuestas son hipótesis para investigar, no verdades: cada una debe terminar en algo que puedas verificar con clientes, proveedores o tus propios números.",
              "Un buen ejercicio es pedirle que actúe como un cliente escéptico y liste las objeciones que pondría antes de comprarte. Después responde cada objeción con un dato o una prueba que puedas mostrar; las que no puedas responder son las que debes resolver antes de vender.",
            ],
          },
        ],
      },
      situaciones: [
        { situacion: "Tengo una idea y quiero ordenarla en un documento", herramienta: "crear-plan-de-negocio" },
        { situacion: "No sé si mi negocio gana dinero", herramienta: "calcular-rentabilidad-de-mi-negocio" },
        { situacion: "Quiero elegir a quién venderle", herramienta: "identificar-nichos-de-mercado" },
        { situacion: "Necesito una imagen de marca", herramienta: "crear-logo-profesional-para-mi-empresa" },
        { situacion: "Quiero mostrar mis productos a mis clientes", herramienta: "crear-catalogo-de-productos" },
      ],
      anuncios: true,
    },
  },

  // ───────────────────────────── Analítica e información ─────────────────────────────
  {
    slug: "analitica-e-informacion",
    nombre: "Analítica e información",
    keywordPrincipal: "analizar datos con ia",
    seo: {
      title: "Analizar datos y Excel con IA: herramientas gratis",
      description: "Limpia datos, analiza Excel y ventas, crea gráficos y segmenta clientes con IA. Tus archivos se procesan en tu navegador. Gratis y sin registro.",
    },
    h1: "Analiza tus datos y archivos Excel con IA",
    intro: [
      "Casi todos los negocios y equipos tienen datos: ventas en un Excel, listas de clientes, registros de gastos. El problema rara vez es la falta de datos; es el orden: filas duplicadas, fechas escritas de tres formas y nadie con tiempo para convertirlo todo en una decisión. Las herramientas de esta categoría siguen el flujo natural del trabajo con datos: limpiar, analizar, graficar y segmentar.",
      "La privacidad importa: las herramientas están pensadas para procesar tus archivos en tu navegador, sin subirlos a este sitio, y cada página te dirá con claridad qué se envía a la IA y qué no. Además, separan lo que los datos muestran (hechos) de lo que solo sugieren (hipótesis), para que no tomes decisiones sobre conclusiones que nadie comprobó.",
    ],
    orden: 4,
    icono: "chart",
    faqs: [
      { q: "¿Mis archivos se suben a algún servidor de este sitio?", a: "No. Las herramientas están diseñadas para trabajar con tus archivos en tu navegador. Cada página indicará qué información, si alguna, se copia en el prompt que tú pegas en una IA; esa parte se rige por la política de privacidad de la IA que uses." },
      { q: "¿Necesito saber fórmulas de Excel?", a: "No. Las herramientas te guían paso a paso y muestran las fórmulas que usan, para que puedas verificarlas y aprender de ellas." },
      { q: "¿La IA puede equivocarse en los cálculos?", a: "Sí. Un asistente de chat puede fallar en aritmética o malinterpretar una columna. Por eso conviene comprobar los resultados importantes con una fórmula o una tabla dinámica y no fiarse solo de la respuesta." },
      { q: "¿Sirve si mis datos están en Google Sheets?", a: "Normalmente puedes descargar tu hoja como archivo de Excel o como CSV y trabajar con él. Revisa que las columnas y los formatos de fecha se conserven." },
      { q: "¿Qué hago si mi archivo está muy desordenado?", a: "Empieza por limpiarlo: duplicados, celdas vacías, formatos de fecha y unidades. Un análisis sobre datos sucios produce conclusiones poco confiables." },
      { q: "¿Cuánto cuestan las herramientas?", a: "Son gratis y no piden registro. Para usar los prompts necesitas un asistente de IA; muchos tienen un plan gratuito, con límites que define cada empresa." },
    ],
    contenido: {
      guia: {
        titulo: "Guía breve: ordenar tus datos para decidir mejor",
        secciones: [
          {
            id: "limpiar-primero",
            titulo: "Limpia antes de analizar",
            parrafos: [
              "Un análisis sobre datos sucios da conclusiones sucias. Antes de calcular nada, revisa duplicados, celdas vacías, formatos de fecha, mayúsculas y minúsculas y unidades (soles y dólares mezclados en una misma columna, por ejemplo).",
              "Guarda siempre una copia del archivo original y anota cada cambio que hagas. Así puedes revertirlo si algo sale mal y explicar de dónde salió cada número.",
              "Un orden práctico: primero elimina los duplicados exactos, luego unifica las escrituras (por ejemplo, «Lima», «lima» y «LIMA»), después decide qué hacer con los vacíos (completarlos si tienes la información, marcarlos como «sin dato» o excluirlos) y por último revisa los valores extremos. Cada decisión cambia los resultados, por eso conviene dejarla anotada.",
            ],
          },
          {
            id: "hechos-e-hipotesis",
            titulo: "Separa los hechos de las hipótesis",
            parrafos: [
              "Un hecho se lee directamente en los datos («las ventas de octubre fueron mayores que las de septiembre»). Una hipótesis intenta explicarlo («subieron por la promoción») y necesita comprobación. Una IA suele mezclar ambas con mucha seguridad.",
              "Pídele que las etiquete por separado, y verifica los cálculos importantes con una fórmula. Cuando una conclusión te lleve a gastar dinero o a cambiar un precio, busca una segunda evidencia antes de actuar.",
              "Un ejemplo con datos inventados: si las ventas de un producto bajaron 20 % en un mes, eso es un hecho. Decir que bajaron porque un competidor rebajó su precio es una hipótesis: para comprobarla necesitas más información, como los precios del competidor o si tus otros productos también bajaron.",
            ],
          },
          {
            id: "grafico-correcto",
            titulo: "Elige el gráfico que responde tu pregunta",
            parrafos: [
              "Las líneas muestran evolución en el tiempo; las barras comparan categorías; los gráficos de dispersión muestran la relación entre dos variables; los circulares solo funcionan con pocas partes. Un gráfico debe responder una pregunta concreta: si no puedes decir cuál, probablemente sobra.",
              "Pon título con la conclusión, etiquetas legibles y una escala que no exagere las diferencias.",
              "Evita los gráficos con demasiadas series: si tienes más de cinco o seis líneas, es mejor agrupar o mostrar solo las que cuentan la historia. Ordena las barras de mayor a menor cuando compares categorías, salvo que tengan un orden natural, como los meses.",
            ],
          },
          {
            id: "muestras-pequenas",
            titulo: "Cuidado con las muestras pequeñas y los periodos distintos",
            parrafos: [
              "Con pocos datos, un solo cliente o un mes atípico cambian el resultado. Habla de cantidades antes que de porcentajes cuando la muestra sea pequeña, y avisa cuando los periodos no sean comparables (por ejemplo, un mes con más días de venta que otro). «Con estos datos no se puede afirmar» también es una conclusión válida.",
              "Antes de comparar dos periodos, verifica que midan lo mismo: los mismos días, la misma cantidad de locales abiertos y condiciones parecidas. Una comparación injusta produce conclusiones que no se sostienen cuando alguien pregunta cómo se calculó.",
            ],
          },
        ],
      },
      situaciones: [
        { situacion: "Mi archivo está desordenado", herramienta: "limpiar-datos" },
        { situacion: "Tengo un Excel y no sé qué buscar en él", herramienta: "analizar-excel-con-ia" },
        { situacion: "Quiero entender cómo van mis ventas", herramienta: "analizar-ventas-con-excel" },
        { situacion: "Necesito mostrar mis datos en un gráfico", herramienta: "convertir-datos-en-graficos" },
        { situacion: "Quiero saber a qué clientes dirigirme primero", herramienta: "segmentar-clientes" },
      ],
      anuncios: true,
    },
  },

  // ───────────────────────────── Finanzas y economía ─────────────────────────────
  {
    slug: "finanzas-y-economia",
    nombre: "Finanzas y economía",
    keywordPrincipal: "calculadoras financieras",
    seo: {
      title: "Calculadoras financieras con IA: ahorro, precios y más",
      description: "Presupuesto, ahorro, interés compuesto, precio de venta y punto de equilibrio: calculadoras gratis con fórmulas visibles y ayuda de IA.",
    },
    h1: "Calculadoras y herramientas de finanzas con IA",
    intro: [
      "Las finanzas personales y las de un pequeño negocio se resuelven, casi siempre, con aritmética bien ordenada: cuánto entra, cuánto sale, cuánto te queda y qué pasaría si algo cambia. Las herramientas de esta categoría son calculadoras con las fórmulas a la vista: presupuesto mensual, plan de ahorro, interés compuesto, precio de venta y punto de equilibrio, con una IA que ayuda a interpretar los resultados y a preparar preguntas para decidir.",
      "Tratamos el dinero con prudencia. Los cálculos los hace la calculadora (nunca la IA) y puedes ver cada fórmula; los supuestos, como tasas, plazos o costos, los pones tú y no los inventamos. Lo que obtienes es orientativo: no es asesoría financiera ni una recomendación de inversión, y para decisiones importantes conviene consultar a un profesional. Lo que escribes se queda en tu navegador.",
    ],
    orden: 5,
    icono: "wallet",
    faqs: [
      { q: "¿Estas herramientas dan asesoría financiera?", a: "No. Son calculadoras y guías para ordenar tus números. No recomiendan productos ni inversiones. Para decisiones importantes (un crédito, una inversión, un contrato), consulta a un profesional o a tu entidad financiera." },
      { q: "¿Las calculadoras usan tasas de interés reales?", a: "No. Las tasas y los plazos los ingresas tú, tomados de tu entidad o de tu contrato. Las tasas reales cambian y dependen del producto y de las comisiones, así que compara siempre con la tasa efectiva anual (TEA) y las condiciones por escrito." },
      { q: "¿Puedo confiar en los resultados que da la IA?", a: "Los cálculos los hace la calculadora, con fórmulas que puedes revisar. La IA se usa para explicar y ordenar, y puede equivocarse: verifica cifras y no le pidas que decida por ti." },
      { q: "¿Sirven para uso personal y para un negocio?", a: "Para ambos. Hay herramientas de presupuesto y ahorro personal, y otras de precios, gastos y punto de equilibrio para un pequeño negocio." },
      { q: "¿Se guardan mis datos financieros?", a: "Lo que escribes se queda en tu navegador, en tu equipo. Evita pegar en un asistente de IA números de cuenta, claves, tarjetas o documentos de identidad: no hacen falta para ningún cálculo." },
      { q: "¿Cuánto cuestan las herramientas?", a: "Son gratis y no piden registro. Para usar los prompts necesitas un asistente de IA; muchos tienen un plan gratuito con límites que define cada empresa." },
    ],
    contenido: {
      guia: {
        titulo: "Guía breve: usar la IA con tu dinero sin equivocarte",
        secciones: [
          {
            id: "flujo-del-mes",
            titulo: "Empieza por el flujo del mes",
            parrafos: [
              "Antes de cualquier plan, anota cuánto entra y cuánto sale en un mes real: ingresos, gastos fijos (alquiler, servicios, cuotas) y gastos variables (comida, transporte, salidas). No uses un mes ideal: la diferencia entre lo que crees que gastas y lo que gastas suele ser la primera sorpresa.",
              "Cuando tengas esa base, recién puedes plantearte una meta de ahorro o evaluar cuánto puedes destinar a una deuda o a una inversión.",
              "Separa lo que es obligatorio (lo que no puedes dejar de pagar) de lo que es flexible. Esa distinción te dice cuánto margen real tienes para ahorrar y qué gastos puedes recortar primero si un mes llegan menos ingresos. Guarda además un pequeño fondo para imprevistos antes de destinar dinero a metas más largas.",
            ],
          },
          {
            id: "margen-y-markup",
            titulo: "Margen y markup no son lo mismo",
            parrafos: [
              "El markup se calcula sobre el costo y el margen se calcula sobre el precio de venta. Un ejemplo con números inventados: si un producto te cuesta S/ 60 y lo vendes a S/ 100, ganas S/ 40. Eso es un markup de 66,7 % sobre el costo, pero un margen de 40 % sobre el precio.",
              "Confundirlos lleva a fijar precios que ganan menos de lo que crees. Antes de poner un precio, decide qué margen necesitas para cubrir tus gastos fijos y tu propio trabajo.",
              "Recuerda también los costos que no se ven en el precio de compra: comisiones de pago, envío, empaques, pérdidas y el tiempo que dedicas. Si no los incluyes, tu margen real es menor que el que muestra la calculadora.",
            ],
          },
          {
            id: "interes-compuesto",
            titulo: "Qué es el interés compuesto y qué debes vigilar",
            parrafos: [
              "Es el interés que se calcula sobre el capital y también sobre los intereses ya acumulados, por eso el tiempo y los aportes constantes pesan tanto. Una calculadora solo proyecta con la tasa que tú ingresas: las tasas reales cambian y dependen de la entidad, del producto y de las comisiones.",
              "Pide a tu entidad la tasa efectiva anual (TEA) y las condiciones por escrito antes de comparar, y desconfía de cualquier proyección que prometa un rendimiento fijo sin riesgo.",
            ],
          },
          {
            id: "ia-y-dinero",
            titulo: "Cómo usar la IA con temas de dinero",
            parrafos: [
              "No pegues números de cuenta, claves, datos de tarjetas ni documentos de identidad en un asistente de IA. Comprueba los cálculos con la calculadora, porque un asistente de chat puede equivocarse en aritmética.",
              "Usa la IA para explicar conceptos, preparar preguntas para tu banco o tu contador y ordenar tus ideas, no para decidir por ti. Las decisiones importantes merecen una segunda opinión profesional.",
            ],
          },
        ],
      },
      situaciones: [
        { situacion: "Quiero saber cuánto me queda cada mes", herramienta: "crear-presupuesto-personal" },
        { situacion: "Tengo una meta de ahorro con fecha", herramienta: "crear-plan-de-ahorro" },
        { situacion: "Quiero ver cómo crece un monto con el tiempo", herramienta: "calcular-interes-compuesto" },
        { situacion: "Voy a ponerle precio a un producto", herramienta: "calcular-precio-de-venta" },
        { situacion: "Quiero saber cuánto debo vender para no perder", herramienta: "calcular-punto-de-equilibrio" },
        { situacion: "Siento que mi negocio gasta demasiado", herramienta: "analizar-gastos-de-mi-negocio" },
      ],
      aviso: "La información es orientativa y no sustituye asesoría profesional.",
      anuncios: true,
    },
  },

  // ───────────────────────────── Marketing y ventas ─────────────────────────────
  {
    slug: "marketing-y-ventas",
    nombre: "Marketing y ventas",
    keywordPrincipal: "marketing con ia para pequeños negocios",
    seo: {
      title: "Herramientas de marketing con IA para pequeños negocios",
      description: "Propuesta de valor, plan de marketing, contenidos, anuncios y landing pages con IA. Gratis, sin registro y sin inventar datos de tu negocio.",
    },
    h1: "Marketing y ventas con IA para pequeños negocios",
    intro: [
      "La mayoría de los pequeños negocios empieza por lo último: publica en redes sin haber definido a quién le habla, qué ofrece de distinto ni cómo sabrá si funciona. Las herramientas de esta categoría siguen el orden inverso: propuesta de valor, plan de marketing, estrategia para conseguir clientes y, recién después, contenidos, anuncios y páginas de venta.",
      "Los prompts usan solo lo que tú les cuentas de tu negocio: tu oferta, tu público, tu tono y tus cifras reales. No inventan estadísticas, testimonios, premios ni promesas de resultados, y te avisan cuando falta un dato importante en lugar de rellenarlo. Los textos que obtienes son un borrador para que los revises y los adaptes: la responsabilidad de lo que publicas es tuya. Todo se guarda en tu navegador.",
    ],
    orden: 6,
    icono: "megaphone",
    faqs: [
      { q: "¿Qué debo hacer primero: redes, anuncios o una página web?", a: "Ninguna de las tres. Primero define tu propuesta de valor y a quién le hablas; con eso decides el canal. Publicar sin esa base produce mucho contenido y pocas ventas." },
      { q: "¿La IA escribe todo mi marketing?", a: "Te da borradores con tus datos y tu tono. Tú los revisas, los adaptas y decides qué publicar. Nada de lo que aparece debe afirmar algo que no puedas demostrar." },
      { q: "¿Cuánto debo invertir en anuncios?", a: "No hay una cifra única: depende de tu margen, de tu objetivo y de cuánto tardas en recuperar lo invertido. Empieza con un monto pequeño que puedas perder, mide qué pasa y ajusta." },
      { q: "¿Los textos hechos con IA suenan genéricos?", a: "Suenan genéricos cuando la IA no recibe datos propios. Si le das ejemplos reales de tu negocio, tu forma de hablar y lo que tus clientes preguntan, y luego editas el resultado, ganan personalidad." },
      { q: "¿Puedo poner testimonios o cifras que me sugiera la IA?", a: "No. Publica solo testimonios reales, con permiso de quien los dio, y cifras que puedas demostrar. Inventarlos perjudica tu credibilidad y puede incumplir las normas de las plataformas." },
      { q: "¿Cuánto cuestan las herramientas?", a: "Son gratis y no piden registro. Para usar los prompts necesitas un asistente de IA; muchos tienen un plan gratuito con límites que define cada empresa." },
    ],
    contenido: {
      guia: {
        titulo: "Guía breve: marketing con IA sin sonar genérico",
        secciones: [
          {
            id: "estrategia-primero",
            titulo: "Estrategia antes que publicaciones",
            parrafos: [
              "Antes de escribir un solo texto, responde cinco preguntas: ¿a quién le hablas?, ¿qué problema le resuelves?, ¿qué te hace distinto?, ¿por qué canal lo encontrarás? y ¿cómo sabrás si funcionó? Sin esas respuestas, una IA producirá textos correctos pero intercambiables.",
              "Una manera de comprobarlo es escribir, en una sola hoja, a tu cliente ideal con datos reales de las personas que ya te compraron: qué necesitaban, cómo te encontraron y qué las convenció. Si aún no tienes clientes, conversa con tres personas que encajen con tu público antes de escribir cualquier anuncio.",
            ],
          },
          {
            id: "propuesta-en-una-frase",
            titulo: "Una propuesta de valor en una frase",
            parrafos: [
              "Sirve una estructura simple: «Ayudo a [a quién] a [lograr qué] con [cómo], para que [beneficio concreto]». Si no puedes completarla con datos reales de tu negocio, todavía te falta conocer a tu cliente.",
              "Pruébala con tres clientes o posibles clientes: ¿la entienden a la primera? Si necesitas explicarla, ajústala.",
              "Ejemplo con datos inventados: «Ayudo a pequeñas panaderías de Arequipa a recibir pedidos por WhatsApp sin perder mensajes, con un catálogo simple y respuestas rápidas, para que vendan más los fines de semana». Es concreta, se entiende y se puede comprobar: si no puedes prometer algo así con honestidad, ajústalo.",
            ],
          },
          {
            id: "medir-lo-minimo",
            titulo: "Mide lo mínimo",
            parrafos: [
              "Elige una o dos métricas ligadas a ventas (consultas recibidas, cotizaciones enviadas, ventas cerradas) y anótalas cada semana. Los «me gusta» y las visualizaciones no pagan las cuentas por sí solos. Si aún no mides nada, empieza por contar cuántas personas te escriben y cuántas terminan comprando.",
              "Define un objetivo por periodo (por ejemplo, un número de consultas por semana) y revisa cada semana si te acercas o no. Cambia una sola cosa a la vez, como el mensaje o el canal, para saber qué produjo el cambio: si modificas todo junto, no sabrás qué funcionó.",
            ],
          },
          {
            id: "credibilidad",
            titulo: "Usa la IA sin perder credibilidad",
            parrafos: [
              "Pide borradores con tu tono, tus ejemplos y tus datos, y edítalos. No publiques testimonios, resultados o comparaciones con la competencia que no puedas demostrar. Si haces publicidad pagada, revisa las políticas de la plataforma, que restringen ciertas promesas y sectores y cambian con el tiempo.",
              "Conserva la voz de tu negocio: usa las palabras que tus clientes usan, no un lenguaje inflado. Y verifica cada dato que la IA agregue por su cuenta (precios, plazos, garantías, características): si no lo dijiste tú, probablemente lo inventó.",
            ],
          },
        ],
      },
      situaciones: [
        { situacion: "No tengo claro qué me diferencia", herramienta: "crear-propuesta-de-valor" },
        { situacion: "Quiero un plan simple para los próximos meses", herramienta: "crear-plan-de-marketing" },
        { situacion: "No sé qué publicar en mis redes", herramienta: "crear-calendario-de-contenidos" },
        { situacion: "Necesito textos para mis publicaciones", herramienta: "crear-publicaciones-para-redes-sociales" },
        { situacion: "Quiero anunciar mi oferta", herramienta: "crear-campana-publicitaria" },
        { situacion: "Quiero una página que explique y venda", herramienta: "crear-landing-page-de-venta" },
        { situacion: "Necesito más clientes de forma constante", herramienta: "crear-estrategia-para-conseguir-clientes" },
      ],
      anuncios: true,
    },
  },
];
