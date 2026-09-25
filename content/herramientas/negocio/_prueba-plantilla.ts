import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * PÁGINA INTERNA DE PRUEBA (archivo «_…»: solo existe con `next dev`, nunca en producción).
 * Sirve para revisar la plantilla completa de 13 bloques, la calculadora, el perfil y el prompt en
 * /negocio/prueba-plantilla. No es contenido editorial: no se publica ni entra en ningún listado.
 * La calculadora usa las cifras del caso ficticio Café Mirador.
 */
export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "prueba-plantilla",
    area: "negocio",
    tipo: "calculadora",
    titulo: "Página de prueba de la plantilla",
    descripcion: "Página interna para revisar la plantilla de herramientas: formulario, calculadora, perfil, prompt y los 13 bloques. No se publica.",
    tiempo: "5 min",
    probadoEn: null, // TODO: sin prueba real (página interna).
    probadoFecha: null, // TODO: sin prueba real (página interna).
    actualizado: "2026-09-23",
  },
  antesDespues: {
    antes: "«Dame una promoción para mi cafetería.» Una respuesta genérica, sin cifras y sin límites.",
    despues: "Los números ya calculados por la página y un prompt que pide **solo** el texto de la promoción, sin recalcular.",
  },
  campos: [
    { id: "oferta", label: "¿Qué promoción quieres redactar?", tipo: "texto", ejemplo: "Combo de media mañana: café y croissant", requerido: true, ayuda: "Una frase: qué se ofrece." },
    { id: "condiciones", label: "Condiciones", tipo: "largo", ejemplo: "Martes a jueves, de 9:30 a 11:30. Hasta agotar existencias.", ayuda: "Opcional. Días, horario y límites." },
    { id: "canal", label: "Canal", tipo: "seleccion", ejemplo: "Instagram", opciones: ["Instagram", "Facebook", "WhatsApp"], requerido: true },
  ],
  usaPerfil: ["nombre", "tono", "horario", "moneda"],
  calculadora: {
    entradas: [
      { id: "precioNormal", label: "Precio normal de la canasta", unidad: "moneda", ejemplo: "4.50" },
      { id: "costo", label: "Costo de la canasta", unidad: "moneda", ejemplo: "1.30" },
      { id: "precioPromo", label: "Precio con promoción", unidad: "moneda", ejemplo: "4.00" },
      { id: "descuentoMaximo", label: "Descuento máximo aceptable", unidad: "porcentaje", ejemplo: "20", max: 100 },
    ],
    salidas: [
      { id: "margenAntes", etiqueta: "Margen antes", formula: "precioNormal - costo", formato: "moneda" },
      { id: "descuentoReal", etiqueta: "Descuento real", formula: "(precioNormal - precioPromo) / precioNormal", formato: "porcentaje", decimales: 1 },
      { id: "margenDespues", etiqueta: "Margen después", formula: "precioPromo - costo", formato: "moneda" },
      { id: "ventasNecesarias", etiqueta: "Ventas necesarias", formula: "margenAntes / si(margenDespues > 0; margenDespues; 0) - 1", formato: "porcentaje", decimales: 1 },
      { id: "respeta", etiqueta: "¿Respeta el límite?", formula: "descuentoReal <= descuentoMaximo && precioPromo >= costo", formato: "si-no" },
    ],
    casosDePrueba: [
      { nombre: "A · Combo de media mañana", entradas: { precioNormal: 4.5, costo: 1.3, precioPromo: 4, descuentoMaximo: 20 }, esperado: { margenAntes: 3.2, margenDespues: 2.7, descuentoReal: 0.1111, ventasNecesarias: 0.1852, respeta: "Sí" } },
      { nombre: "B · Desayuno completo con 15 %", entradas: { precioNormal: 7.5, costo: 2.4, precioPromo: 6.375, descuentoMaximo: 20 }, esperado: { margenAntes: 5.1, margenDespues: 3.975, descuentoReal: 0.15, ventasNecesarias: 0.283, respeta: "Sí" } },
      { nombre: "C · Tarjeta de 5 visitas", entradas: { precioNormal: 22.5, costo: 6.5, precioPromo: 18, descuentoMaximo: 20 }, esperado: { margenAntes: 16, margenDespues: 11.5, descuentoReal: 0.2, ventasNecesarias: 0.3913, respeta: "Sí" } },
      { nombre: "D · Ven acompañado", entradas: { precioNormal: 9, costo: 2.6, precioPromo: 7, descuentoMaximo: 20 }, esperado: { margenAntes: 6.4, margenDespues: 4.4, descuentoReal: 0.2222, ventasNecesarias: 0.4545, respeta: "No" } },
    ],
  },
  tarea: `Redacta el texto de esta promoción para {{canal}}.
Oferta: {{oferta}}
Condiciones: {{condiciones}}
Usa las cifras de los cálculos ya hechos solo si ayudan al cliente a entender la oferta; no calcules nada nuevo. Entrega 2 versiones cortas y una lista de las afirmaciones que una persona debe verificar.`,
  mejoras: [
    { label: "Más corto", prompt: "Hazlo más corto sin perder el precio ni la vigencia." },
    { label: "Más cercano", prompt: "Reescríbelo con un tono más cercano, sin añadir datos nuevos." },
    { label: "Solo lo verificable", prompt: "Subraya cada afirmación que no esté en mis datos." },
  ],
  ejemplo: {
    negocio: "Café Mirador (ficticio)",
    queCorregi: ["Quité una frase que prometía más clientes.", "Añadí el horario de la promoción.", "Comprobé el precio contra la hoja."],
  },
  // Espacios de imagen: guarda cada archivo (.webp, .png o .jpg) con su nombre en public/img/negocio/prueba-plantilla/ y aparece solo. Ver docs/como-publicar.md.
  imagenes: [

  ],

  checklist: ["Los precios coinciden con mi hoja.", "La vigencia está clara.", "No promete resultados.", "Las condiciones están completas.", "Puedo cumplir la oferta."],
  porQueFunciona: [
    { titulo: "La página calcula", texto: "Los números salen de la calculadora; el prompt los recibe ya hechos." },
    { titulo: "Pregunta antes de inventar", texto: "Si falta un dato, la IA lo pregunta o lo marca como [FALTA]." },
    { titulo: "Separa datos de suposiciones", texto: "Cada suposición queda marcada para que la revises." },
  ],
  rubros: [
    { rubro: "Restaurante", ejemplo: "Menú del día con bebida incluida.", consejo: "Calcula la bebida como parte de la canasta." },
    { rubro: "Tienda", ejemplo: "Segunda unidad a mitad de precio.", consejo: "Convierte la oferta a descuento real antes de decidir." },
    { rubro: "Servicios", ejemplo: "Sesión con 20 % en horas vacías.", consejo: "Limita los cupos para no acostumbrar al descuento." },
  ],
  errores: [
    { error: "Pedirle a la IA que calcule", solucion: "Calcula en la página y pega los resultados." },
    { error: "No fijar un límite", solucion: "Define el descuento máximo antes de mirar las ideas." },
    { error: "Lanzar sin fecha de fin", solucion: "Escribe cuándo termina y qué medirás." },
  ],
  faq: [
    { p: "¿Se guardan mis datos?", r: "Solo en tu navegador." },
    { p: "¿Puedo usar otra IA?", r: "Sí: el prompt es texto que puedes pegar donde quieras." },
    { p: "¿Qué hago si falta un dato?", r: "Cópialo igualmente: la IA te lo preguntará." },
    { p: "¿Puedo borrar mi perfil?", r: "Sí, con «Borrar mis datos»." },
  ],
  relacionadas: [],
  metodoCompleto: { titulo: "Método completo", parrafos: ["Texto de prueba del bloque plegado «Método completo»."] },
});
