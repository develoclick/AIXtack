import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /ventas/crear-descripciones-de-productos-con-ia (Generador). Fuente: la guía larga
 * content/guias/ventas/crear-descripciones-de-productos-con-ia (ficha con estado y origen, hecho/adjetivo/promesa, auditoría).
 * Caso: Luz de Cera (ficticio). Sin pruebas reales todavía: `publicado` en `false`.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "crear-descripciones-de-productos-con-ia",
    area: "ventas",
    tipo: "generador",
    titulo: "Crea descripciones de productos sin inventar datos",
    descripcion: "Escribe lo que has comprobado de tu producto y copia un prompt que redacta una versión corta y una larga, y te dice qué datos faltan en lugar de inventarlos.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/ventas/crear-descripciones-de-productos-con-ia/og.webp",
  },

  antesDespues: {
    antes: "«Escribe una descripción para mi vela de soja con aroma a cedro y vainilla.» La IA no sabe cuánto pesa la vela ni cómo se usa y rellena los huecos con lo habitual: «cera 100 % natural», «más de 40 horas» (ejemplo ilustrativo). Suena seguro y en parte es inventado.",
    despues: "Una **versión corta** y una **larga** que usan solo lo que comprobaste, y una lista **FALTA** con cada dato que no tienes y cada pregunta de tus clientes que no puedes responder todavía.",
  },

  campos: [
    { id: "producto", label: "¿Qué producto?", tipo: "texto", ejemplo: "Vela Cedro y Vainilla, 200 g", requerido: true },
    { id: "datosComprobados", label: "Datos comprobados", tipo: "largo", ejemplo: "Cera de soja y mecha de algodón (etiqueta del proveedor). Vaso de vidrio con tapa de madera. Aroma con notas de cedro y vainilla (ficha de la fragancia). 200 g netos, 9 cm de alto y 8 cm de diámetro (medido en el taller). Hecha a mano en lotes pequeños. Primer uso: unas 3 horas; recortar la mecha a 5 mm; no dejar sin vigilancia.", requerido: true, ayuda: "Materiales, medidas, uso y cuidados: solo lo que has verificado y de dónde sale." },
    { id: "sinConfirmar", label: "Datos que aún no has confirmado (opcional)", tipo: "largo", ejemplo: "Porcentaje de soja de la cera. Cuántas horas dura la vela. Certificaciones de seguridad.", ayuda: "Lo que sabes que no has comprobado. El prompt no lo usará ni lo insinuará." },
    { id: "dondeVendes", label: "¿Dónde se vende y a quién?", tipo: "texto", ejemplo: "Ficha de producto de la tienda online, para personas que buscan un regalo", requerido: true },
    { id: "preguntas", label: "Preguntas que hacen tus clientes", tipo: "largo", ejemplo: "¿Cuánto mide? ¿Cuánto dura? ¿Cómo se cuida?", ayuda: "Las que más te repiten por mensaje." },
    { id: "longitud", label: "Largo de la versión corta", tipo: "seleccion", ejemplo: "Unas 40 palabras", opciones: ["Unas 25 palabras", "Unas 40 palabras", "Unas 60 palabras"], requerido: true },
  ],
  usaPerfil: ["nombre", "rubro", "tono"],
  calculadora: null,

  tarea: `Escribe la descripción de mi producto. Los «Datos comprobados» son la única fuente de hechos: no completes ni supongas nada.

Entrega, en este orden y con estos títulos:
1. VERSIÓN CORTA ({{longitud}}) para «{{dondeVendes}}».
2. VERSIÓN LARGA: la corta desarrollada, con qué es, de qué está hecho, cómo se usa, medidas y cuidados, solo con lo que aparece en mis datos.
3. DATOS QUE USÉ: una lista con cada dato de la descripción y la frase de mis datos de la que sale.
4. FALTA: cada pregunta de mis clientes que no puedes responder con mis datos («{{preguntas}}») y cada dato que necesitarías y no tengo.

Reglas:
- Usa solo los «Datos comprobados». Lo que sigue sin confirmar ({{sinConfirmar}}) no lo menciones ni lo insinúes, tampoco con adjetivos como «duradera» o «segura».
- No inventes materiales, medidas, duración, certificaciones, beneficios para la salud ni comparaciones con otras marcas. No uses superlativos ni fórmulas como «100 % natural» o «garantizado» que no estén en mis datos.
- Los adjetivos de tono están permitidos si no sugieren un hecho que mis datos no contienen.
- No incluyas precios, promociones ni plazos de envío: caducan y la descripción hablaría de más.
- Responde las preguntas de mis clientes solo con datos míos. Si una no tiene dato, no la respondas y anótala en FALTA.
- Si dos datos se contradicen, avísame antes de escribir.

Formato de salida: VERSIÓN CORTA, VERSIÓN LARGA, DATOS QUE USÉ y FALTA.

Antes de responder, comprueba que cada dato de las dos versiones está en mis datos comprobados, que no hay promesas de seguridad ni de salud, que no mencionaste nada sin confirmar y que cada pregunta sin dato está en FALTA. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Otro canal", prompt: "Adapta la versión corta a un mensaje de WhatsApp de dos frases, sin añadir ningún dato." },
    { label: "Solo lo verificable", prompt: "Lista cada frase de la descripción y dime de qué dato mío sale; marca las que no tengan origen." },
    { label: "Más cercano", prompt: "Reescribe la versión corta con un tono más cálido sin cambiar ningún hecho." },
    { label: "Preguntas pendientes", prompt: "Convierte la lista FALTA en tareas concretas: qué medir, qué pedir al proveedor o qué probar." },
  ],

  ejemplo: {
    negocio: "Luz de Cera (ficticio), taller de velas artesanales de dos personas que vende en su tienda online y en ferias",
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Espacios de imagen: guarda cada archivo (.webp, .png o .jpg) con su nombre en public/img/ventas/crear-descripciones-de-productos-con-ia/ y aparece solo. Ver docs/como-publicar.md.
  imagenes: [
    {
      id: "prueba-01",
      archivo: "prueba-01",
      etiqueta: "Prueba real",
      titulo: "Chat de la IA con la respuesta al prompt de esta página",
      alt: "Chat nuevo: la versión corta, la versión larga y la lista FALTA (lo que no tiene dato) para un producto de Luz de Cera (ficticio).",
      leyenda: "Prueba real: la respuesta de la IA al prompt de esta página, sin editar.",
      ubicacion: "ejemplo",
      obligatoria: true,
    },
  ],

  checklist: [
    "Cada dato de la descripción está en mis datos comprobados y sé de dónde sale.",
    "Comprobé medidas y peso con una regla, una balanza o la ficha oficial.",
    "No hay afirmaciones de seguridad, salud o certificaciones sin un documento detrás.",
    "No hay superlativos ni comparaciones que no pueda demostrar.",
    "Otra persona la leyó sin conocer el producto y no le quedaron dudas; revisé las normas de mi canal y de mi país sobre etiquetado y publicidad.",
  ],

  porQueFunciona: [
    {
      titulo: "Una sola fuente de hechos",
      texto: "Lo que escribes como comprobado es lo único que la IA puede usar. Lo que aún no confirmaste queda fuera y se anota como pendiente: así la descripción no puede afirmar lo que tú todavía no sabes.",
    },
    {
      titulo: "Hecho, adjetivo o promesa",
      texto: "Toda frase es un **hecho** (necesita un dato tuyo), un **adjetivo de tono** (libre, si no sugiere un hecho) o una **promesa** de seguridad, salud o rendimiento (necesita una prueba o un certificado). El prompt prohíbe la tercera categoría.",
    },
    {
      titulo: "Un hueco se anota, no se rellena",
      texto: "Cuando falta un dato, lo honesto es preguntarlo. La lista FALTA se convierte en tareas: medir, pedir al proveedor, probar. Cada hueco que cierras mejora la descripción con un dato real.",
    },
    {
      titulo: "Lo que preguntan tus clientes manda",
      texto: "Las dudas que más te repiten por mensaje son las que la descripción debe responder. Si no hay dato para una, el prompt no la responde y te la devuelve como pendiente.",
    },
  ],

  rubros: [
    {
      rubro: "Alimentos",
      ejemplo: "Dulces Almendra (ficticio), mermelada de fresa de 250 g: ingredientes copiados de la etiqueta, peso neto medido, hecha en lotes pequeños. Sin confirmar: duración una vez abierta y aptitud para personas con alergias.",
      consejo: "Copia los ingredientes y alérgenos de la etiqueta real. No dejes que la IA los resuma ni los complete.",
    },
    {
      rubro: "Ropa",
      ejemplo: "Boutique Aldea (ficticia), camiseta de algodón: composición de la etiqueta, tallas con medidas tomadas sobre la prenda, instrucciones de lavado del fabricante. Sin confirmar: encogimiento tras el lavado.",
      consejo: "Las tallas se responden con medidas reales de la prenda: es la duda que más devoluciones evita.",
    },
    {
      rubro: "Cuidado personal",
      ejemplo: "Jabones Brisa (ficticio), jabón artesanal de 100 g: ingredientes de la etiqueta, aroma, peso y forma de conservarlo. Sin confirmar: cualquier efecto sobre la piel.",
      consejo: "Nada de efectos sobre la piel o la salud sin un documento detrás: es donde las descripciones inventadas suenan mejor y se sostienen peor.",
    },
    {
      rubro: "Decoración y hogar",
      ejemplo: "Rincón (ficticia), un jarrón de cerámica: material y acabado según el proveedor, alto, diámetro de la boca y capacidad medidos en la tienda, y forma de limpiarlo. Sin confirmar: si es apto para contener agua o flores frescas y si resiste el lavavajillas.",
      consejo: "En decoración la duda típica es «¿cabe en mi espacio?»: pon las medidas reales y, si puedes, una referencia (junto a qué objeto se fotografió). No des por hecho usos que no probaste.",
    },
  ],

  errores: [
    {
      error: "Pedirle a la IA que «complete» lo que no sabes",
      solucion: "Rellena los huecos con lo más probable, no con lo verdadero. Escribe ese dato como «sin confirmar» y pide que te diga qué le faltó.",
    },
    {
      error: "Pegar el texto del proveedor como si fuera tuyo",
      solucion: "Es la descripción que tienen otras tiendas: no te distingue ni responde a tus clientes. Úsalo como fuente de datos y redacta desde tus datos comprobados.",
    },
    {
      error: "Publicar porque «suena bien»",
      solucion: "La fluidez no prueba la exactitud, y las promesas de seguridad y rendimiento son las que mejor suenan y peor se sostienen. Revisa frase por frase con tus datos al lado.",
    },
    {
      error: "Meter precio, envío o promociones en la descripción",
      solucion: "Caducan: cuando cambia el precio, la descripción miente. La descripción habla del producto; el precio y las ofertas van en sus campos.",
    },
  ],

  faq: [
    { p: "¿Tengo que decir que usé IA para escribir la descripción?", r: "Depende de dónde publiques. Algunos canales piden declararlo y para tu propia web no hay una regla universal que podamos afirmar: revisa las normas de tu canal y de tu país." },
    { p: "¿Puedo generar todas mis descripciones de una vez?", r: "No conviene: sin datos comprobados por producto aumentan los datos inventados. Ve de uno en uno y guarda los datos de cada producto." },
    { p: "¿Y si mi proveedor no me da los datos que necesito?", r: "Trátalos como «sin confirmar» y no los uses. Pídelos por escrito, mídelos tú o prueba el producto si puedes comprobarlo." },
    { p: "¿Cuánto debe medir una descripción?", r: "Lo necesario para resolver las dudas de tu comprador. El máximo lo fija cada canal, y es un tope, no un objetivo." },
    { p: "¿Puedo pedir que suene más vendedora?", r: "Puedes pedir un tono más cálido o más breve. Evita «más vendedora»: empuja hacia superlativos y promesas que no puedes sostener." },
    { p: "¿La herramienta valida la seguridad o la normativa de mi producto?", r: "No. Las declaraciones sobre seguridad, salud o etiquetado requieren validación profesional y normas locales: esta herramienta ayuda a organizar los datos, no a certificarlos." },
  ],

  relacionadas: ["marketing/crear-anuncios-con-ia", "marketing/crear-publicaciones-para-redes-con-ia"],

  metodoCompleto: {
    titulo: "Método completo: la ficha del producto y la auditoría",
    parrafos: [
      "**La ficha de producto.** La versión anterior de esta guía usaba una tabla con cuatro columnas: campo, dato, estado (verificado o sin confirmar) y de dónde sale. Los campos eran producto y variante, materiales, características propias, medidas, peso y contenido, elaboración u origen, uso y cuidados, duración o rendimiento, y seguridad, salud y certificaciones. Esta página lo resume en dos cuadros: «Datos comprobados» y «Datos que aún no has confirmado».",
      "**El caso completo.** Luz de Cera (ficticio) tiene verificados los materiales (cera de soja y mecha de algodón, de la etiqueta del proveedor), el vaso de vidrio con tapa de madera, el aroma, las medidas (200 g, 9 cm de alto, 8 cm de diámetro, medidas en el taller), la elaboración y los cuidados. Sin confirmar quedan el porcentaje de soja de la cera, la duración de la vela y cualquier certificación. Las preguntas de sus clientes («¿cuánto mide?», «¿cuánto dura?», «¿cómo se cuida?») se responden con lo verificado, salvo la duración, que queda como pendiente.",
      "**La auditoría.** Después de redactar, pega la descripción y tu ficha en el mismo chat y pídele a la IA que compare cada frase con la ficha, sin reescribir. Léela con la ficha al lado: comparar dos textos es una tarea más acotada que recordar hechos, pero la IA también puede equivocarse.",
      "**Cómo cerrar los huecos de la lista FALTA.** Cada dato pendiente se convierte en una tarea concreta: medir el producto con una regla o una balanza, pedir por escrito la ficha al proveedor, probar el producto y anotar lo que ocurre, o guardar el documento que respalda una afirmación. Cuando tengas el dato, pásalo a «Datos comprobados» con su origen y vuelve a copiar el prompt: la descripción mejora con cada hueco cerrado.",
      "**Qué no debe entrar nunca.** Precios, promociones y plazos de envío (caducan), comparaciones con otras marcas, superlativos que no puedas demostrar y cualquier promesa de seguridad, salud o rendimiento sin un documento detrás. Si un adjetivo suena a hecho, trátalo como hecho y pide su respaldo.",
      "**Rúbrica de cinco criterios** para revisar la descripción (0, 1 o 2 puntos cada uno): cada hecho tiene su fila; no insinúa lo que no se afirma; sin promesas de seguridad ni salud; responde las dudas del comprador; cumple el largo y el canal.",
      "**Lo que este método no hace.** No conoce tu producto (solo sabe cómo se describen productos parecidos), no asegura que obedezca aunque se lo prohíbas (por eso se audita), no valida seguridad, salud ni normativa, y una buena descripción no compensa unas fotos flojas, un precio incoherente o un envío poco fiable.",
      "**Cómo escribir los datos comprobados.** Una idea por frase y, entre paréntesis, de dónde sale: «Cera de soja (etiqueta del proveedor)», «9 cm de alto (medido en el taller)». Si un dato viene de una persona, di quién y cuándo. Copia los números tal como los mediste, con su unidad. Si dudas de un dato, no lo escondas entre los comprobados: pásalo a «Datos que aún no has confirmado». Una lista corta y verdadera vale más que una larga con un dato dudoso, porque ese único dato puede convertirse en la frase que un cliente te reclame.",
      "**Cómo usar las preguntas de tus clientes.** Tus clientes ya te dicen qué necesitan saber. Antes de pegar la lista, ordénala de la más repetida a la menos: la descripción debe responder primero a las dos o tres primeras. Si no tienes datos para una, la herramienta la devuelve en FALTA y esa es la tarea que te queda: medir, pedir el dato o probar. Cuando la cierres, la próxima descripción del mismo tipo de producto ya saldrá con esa respuesta.",
      "**Qué le toca a la foto, al título y a la descripción.** La foto muestra el tamaño y el aspecto; el título dice qué es; la descripción explica de qué está hecho, cómo se usa y cómo se cuida. No repitas en la descripción lo que ya dice el título ni describas lo que la foto muestra. Y no uses la descripción para compensar una foto que engaña: si el color real es distinto, dilo en un dato comprobado («el color puede variar según la pantalla») en lugar de adornarlo.",
      "**Cuándo revisar una descripción publicada.** Revísala cuando cambie el proveedor o el material, cuando modifiques el tamaño o el embalaje, cuando un cliente reporte una duda que la descripción no resolvía y cuando dejes de vender una variante. Una descripción que ya no coincide con el producto genera devoluciones y reclamos. Anota la fecha de la última revisión junto a los datos comprobados para saber cuándo volver a mirarla.",
      "**Aviso.** Las reglas sobre etiquetado, alérgenos, ingredientes, cosméticos, alimentos, juguetes o productos para la piel cambian según el país y el canal de venta. Esta herramienta organiza los datos que tú confirmas; no valida seguridad ni normativa ni sustituye la revisión de un profesional cuando el producto lo requiera.",
    ],
  },
});
