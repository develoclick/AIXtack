import { datosVaciosNichos, pesosVacios, type DatosNichos } from "@/lib/nichos/tipos";

export interface EjemploNichos {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosNichos;
  /** Respuesta ilustrativa del Prompt 1 (bloque CSV de 8 nichos), escrita por el autor, NO por una IA real. */
  respuestaNichos: string;
  /** Respuesta ilustrativa del Prompt 2 (hipótesis + plan de validación), para los 2 nichos marcados como favoritos abajo. */
  respuestaValidacion: string;
  /** Índices (0-based) de los 2 nichos elegidos como favoritos, dentro de `respuestaNichos`. */
  indicesFavoritos: [number, number];
}

/** Tres ejemplos. TODO es ficticio: personas, nichos y competencia están inventados solo para ilustrar la herramienta. */
function datos(p: Partial<DatosNichos>): DatosNichos {
  return { ...datosVaciosNichos(), ...p };
}

const cabeceraCsv = "nombre,cliente,problema,oferta,competencia,canales,monetizacion,recursos,entrada,inversion,recurrencia,diferenciacion,encaje,justificacion";
const filaCsv = (celdas: string[]) => celdas.map((c) => (/[",]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",");
const bloqueCsv = (filas: string[][]) => `\`\`\`csv\n${cabeceraCsv}\n${filas.map(filaCsv).join("\n")}\n\`\`\``;

/* ───────────────────────── 1. Profesora de inglés corporativo (el ejemplo de la especificación) ───────────────────────── */

const DATOS_INGLES = datos({
  conocimientos: "8 años dando clases de inglés corporativo y preparando entrevistas técnicas en inglés.",
  sectores: "Educación, tecnología, recursos humanos.",
  oferta: "Clases de inglés en línea, individuales y grupales, con enfoque en comunicación oral.",
  mercado: "Lima, Perú; clases en línea para toda Latinoamérica.",
  tipoCliente: "personas",
  recursos: "Laptop, cámara, cuenta de Zoom Pro, 3 años de material propio de entrevistas técnicas.",
  presupuesto: "600",
  horas: "15",
  canales: ["redes", "contactos", "web"],
  restricciones: "No quiero alquilar un local ni dar clases presenciales.",
  pesos: pesosVacios(),
});

const NICHOS_INGLES: string[][] = [
  ["Inglés para entrevistas de trabajo en empresas de TI, para desarrolladores peruanos con nivel intermedio", "Desarrolladores peruanos con inglés intermedio que postulan a empresas extranjeras", "Practican inglés técnico de entrevista solos, con videos sueltos de YouTube, sin retroalimentación", "Paquete de 4 sesiones de simulacro de entrevista técnica en inglés, con feedback grabado", "Academias de inglés general y profesores particulares sin enfoque técnico", "Comunidades de developers, LinkedIn, referidos", "Paquete de pago único (4 sesiones)", "Material propio de preguntas técnicas en inglés, experiencia dando clases a developers", "4", "4", "3", "5", "5", "Fácil de arrancar sin inventario (4); inversión baja, solo tu tiempo (4); pocas recompras salvo que cambien de trabajo (3); muy diferenciado del inglés genérico (5); encaja directo con tu experiencia (5)"],
  ["Inglés de atención al cliente para agentes nuevos de call center, sin experiencia previa", "Agentes nuevos de call center que deben aprobar una prueba de inglés de ingreso", "Reprueban la prueba de inglés de la empresa y tienen 2 semanas para mejorar", "Curso intensivo de 2 semanas con simulacros de llamadas en inglés", "Institutos de idiomas generalistas sin enfoque de call center", "Contactos en RR.HH. de call centers, redes", "Pago único por curso, o convenio con la empresa", "Material propio, adaptable de tus clases actuales", "3", "3", "2", "3", "3", "Entrada media, requiere contactar RR.HH. (3); inversión media en marketing (3); baja recurrencia, es un curso puntual (2); diferenciación media (3); encaje medio, no es tu experiencia principal (3)"],
  ["Inglés técnico para soporte IT remoto, para técnicos peruanos que atienden clientes de EE. UU.", "Técnicos de soporte IT que atienden tickets y llamadas en inglés con clientes de EE. UU.", "Cometen errores de vocabulario técnico en inglés que generan tickets mal resueltos", "Curso corto de vocabulario técnico + simulacro de llamadas de soporte", "Academias de inglés técnico genérico, cursos en línea grabados sin práctica oral", "Comunidades de soporte IT, LinkedIn", "Pago único por curso", "Material propio adaptado de tus clases de entrevista técnica", "3", "4", "3", "4", "4", "Entrada media, nicho más pequeño que developers (3); inversión baja (4); recurrencia media, podrían repetir con nuevo personal (3); buena diferenciación (4); encaja bien con tu experiencia técnica (4)"],
  ["Inglés para presentaciones ejecutivas, para gerentes medios que deben exponer ante casa matriz", "Gerentes medios de empresas con casa matriz en el extranjero", "Sienten que su presentación en inglés no transmite autoridad ni claridad", "Programa de 6 sesiones enfocado en estructura de presentación y pronunciación", "Coaches de comunicación ejecutiva, generalmente más caros", "Referidos corporativos, LinkedIn", "Paquete de 6 sesiones, precio más alto", "Tu experiencia con clientes corporativos previos", "2", "3", "3", "4", "3", "Entrada más difícil, requiere red de contactos corporativos (2); inversión media (3); recurrencia media, algunos repiten antes de presentaciones importantes (3); diferenciación buena frente a cursos genéricos (4); encaje medio, necesitas desarrollar más este ángulo (3)"],
  ["Inglés para servicio al cliente de hoteles boutique, para recepcionistas sin formación formal", "Recepcionistas de hoteles boutique en zonas turísticas con inglés básico", "Atienden huéspedes extranjeros con inglés limitado y temen cometer errores", "Curso corto presencial-remoto de frases y situaciones frecuentes de recepción", "Institutos de turismo con cursos de inglés genérico", "Contactos en el sector hotelero, redes", "Pago único por curso o convenio con el hotel", "Tendrías que crear material nuevo, específico de hotelería", "3", "3", "2", "3", "2", "Entrada media, depende de contactos en hotelería (3); inversión media (3); baja recurrencia (2); diferenciación media (3); encaje bajo, no es tu área actual (2)"],
  ["Inglés para citas médicas en clínicas privadas, para personal de admisión que atiende pacientes extranjeros", "Personal de admisión de clínicas privadas que reciben pacientes extranjeros", "No entienden vocabulario médico básico en inglés ni preguntas de seguros", "Curso corto de vocabulario médico-administrativo y simulacros de admisión", "Cursos de inglés médico para profesionales de salud, no para personal de admisión", "Contactos en clínicas, redes", "Pago único o convenio con la clínica", "Tendrías que crear material médico-administrativo desde cero", "2", "3", "2", "4", "2", "Entrada difícil, requiere contactos en salud (2); inversión media (3); baja recurrencia (2); buena diferenciación, nicho poco atendido (4); encaje bajo, tema nuevo para ti (2)"],
  ["Inglés para creadores de contenido que buscan monetizar en YouTube en inglés, para creadores peruanos con canal en español", "Creadores de contenido peruanos que quieren lanzar un canal o subtítulos en inglés", "No se sienten seguros grabando o subtitulando en inglés por miedo al acento", "Asesoría de guion y pronunciación para contenido en inglés", "Editores de video freelance que a veces ofrecen esto como extra", "Redes sociales, comunidades de creadores", "Por proyecto o mensualidad", "Tendrías que aprender el ecosistema de creadores de contenido", "3", "4", "3", "3", "2", "Entrada media (3); inversión baja (4); recurrencia media si es mensualidad (3); diferenciación media (3); encaje bajo, mercado nuevo para ti (2)"],
  ["Inglés para vendedores B2B que hacen llamadas de ventas a clientes extranjeros, para pymes exportadoras peruanas", "Vendedores de pymes peruanas que exportan y negocian en inglés por llamada o videollamada", "Pierden confianza al negociar en inglés y evitan objeciones o preguntas de precio", "Programa de simulacro de llamadas de ventas y manejo de objeciones en inglés", "Consultoras de exportación que incluyen esto como parte de un servicio más caro", "Referidos de cámaras de comercio, LinkedIn", "Paquete de 4 a 6 sesiones", "Tendrías que adaptar tu material de entrevistas al contexto de ventas", "3", "3", "3", "4", "3", "Entrada media, requiere llegar a pymes exportadoras (3); inversión media (3); recurrencia media (3); buena diferenciación (4); encaje medio, cercano a tu experiencia pero no igual (3)"],
];

const RESPUESTA_VALIDACION_INGLES = `## Hipótesis críticas
- Nicho 1 (desarrolladores, entrevistas técnicas): hay que validar si pagarían por adelantado por un paquete de simulacros, o si solo buscan contenido gratuito [HIPÓTESIS].
- Nicho 3 (soporte IT remoto): hay que validar si las empresas de soporte IT asignan presupuesto de capacitación a sus técnicos, o si el pago sería personal [HIPÓTESIS].

## Plan de validación: Nicho 1
- Días 1 a 5: 10 entrevistas a desarrolladores en comunidades de developers (Discord, grupos de Facebook), preguntando cómo preparan hoy sus entrevistas en inglés.
- Días 6 a 10: publicar el paquete en 2 comunidades de developers con una página simple de preventa.
- Días 11 a 14: dar seguimiento a quienes mostraron interés y cerrar las primeras preventas.
- Costo estimado: S/ 50 (hosting de la página de preventa).
- Criterio de éxito definido antes de empezar: al menos 3 pagos anticipados, o al menos 8 personas que dejen su contacto pidiendo el precio.

## Plan de validación: Nicho 2
- Días 1 a 5: 8 entrevistas a técnicos de soporte IT remoto sobre sus dificultades reales en llamadas en inglés.
- Días 6 a 10: publicar una oferta de prueba (1 sesión gratuita de diagnóstico) en comunidades de soporte IT.
- Días 11 a 14: ofrecer el curso completo a quienes tomaron la sesión gratuita.
- Costo estimado: S/ 0 (usas tus propias comunidades y contactos).
- Criterio de éxito definido antes de empezar: al menos 5 personas toman la sesión gratuita, y al menos 2 continúan al curso pago.

## Guion de entrevistas
- ¿Cómo te preparas hoy para una entrevista o llamada de trabajo en inglés?
- ¿Qué situación específica te genera más inseguridad al hablar inglés en el trabajo?
- ¿Has buscado ayuda antes para esto? ¿Qué usaste?
- Cuéntame la última vez que el inglés fue un obstáculo en tu trabajo.
- Si pudieras resolver esto, ¿qué cambiaría en tu día a día?
- ¿Qué tan seguido se presenta esta situación (cada entrevista, cada semana, ocasional)?
- ¿Con quién más hablas sobre este problema?
- ¿Qué es lo que NO te gustaría de un curso o servicio para esto?

## Qué debes verificar
- Confirma que las comunidades de developers y de soporte IT permiten publicar ofertas de servicios pagos antes de publicar ahí.
- Antes de cobrar cualquier preventa, verifica qué medio de pago vas a usar y si tiene comisión.
- Revisa si necesitas emitir algún comprobante de pago según tu situación tributaria.

## Siguiente paso
- Agenda las primeras 5 entrevistas del Nicho 1 para esta semana, antes de escribir una sola línea del curso.`;

/* ───────────────────────── 2. Contador con experiencia en costos, hacia pequeños talleres ───────────────────────── */

const DATOS_CONTADOR = datos({
  conocimientos: "12 años como contador, los últimos 5 llevando la contabilidad de costos de una fábrica textil mediana.",
  sectores: "Manufactura pequeña, talleres, comercio.",
  oferta: "Armar y ordenar la contabilidad de costos, y enseñar a leerla al dueño del negocio.",
  mercado: "Arequipa, Perú; también remoto para el resto del país.",
  tipoCliente: "empresas",
  recursos: "Excel avanzado, plantillas propias de costeo, una laptop y un software contable con licencia.",
  presupuesto: "800",
  horas: "10",
  canales: ["contactos", "referidos", "redes"],
  restricciones: "No quiero llevar la contabilidad tributaria completa de nadie, solo costos y gestión.",
  pesos: pesosVacios(),
});

const NICHOS_CONTADOR: string[][] = [
  ["Costeo por producto para talleres de costura que no saben cuánto ganan por prenda", "Dueños de talleres de costura de 3 a 15 personas", "Fijan precios «a ojo» y no saben si cada prenda deja ganancia real", "Servicio de armado de costeo por prenda + capacitación de 2 horas para leerlo", "Contadores generalistas que solo hacen la contabilidad tributaria, sin costeo", "Referidos de talleres, gremios de confección", "Proyecto único + revisión mensual opcional", "Tus plantillas propias de costeo textil", "4", "4", "4", "5", "5", "Entrada fácil, ya tienes las plantillas (4); inversión baja (4); buena recurrencia con la revisión mensual (4); muy diferenciado, nadie más ofrece esto en el sector (5); encaja directo con tu experiencia (5)"],
  ["Costeo para panaderías y pastelerías que no saben el costo real de cada producto", "Dueños de panaderías o pastelerías pequeñas", "Calculan el precio sumando ingredientes, sin incluir mano de obra ni gas ni merma", "Costeo por producto + plantilla simple de reposición de insumos", "Contadores generalistas, algunos videos genéricos de YouTube", "Referidos, redes, contactos de proveedores de insumos", "Proyecto único + revisión trimestral opcional", "Tendrías que adaptar tus plantillas textiles al rubro de alimentos", "4", "4", "3", "4", "3", "Entrada fácil (4); inversión baja (4); recurrencia media (3); buena diferenciación (4); encaje medio, requiere adaptar tu experiencia (3)"],
  ["Costeo para talleres de carpintería que cotizan proyectos a medida sin saber su margen real", "Carpinteros con taller propio que hacen muebles a medida", "Cotizan «por experiencia» y a veces terminan perdiendo en proyectos grandes", "Plantilla de costeo por proyecto + capacitación para cotizar con margen", "Contadores generalistas, cotizadores empíricos del propio gremio", "Referidos, gremios de carpintería", "Proyecto único", "Tendrías que aprender la estructura de costos específica de carpintería", "3", "4", "2", "4", "3", "Entrada media, necesitas entender el rubro (3); inversión baja (4); baja recurrencia, es más por proyecto (2); buena diferenciación (4); encaje medio (3)"],
  ["Contabilidad de costos para restaurantes pequeños que no saben el costo real de cada plato", "Dueños de restaurantes o cevicherías pequeñas", "Fijan el precio del menú copiando a la competencia, sin calcular su propio costo por plato", "Costeo por plato + plantilla de control de merma de cocina", "Consultoras gastronómicas, más caras y orientadas a restaurantes grandes", "Referidos, redes, contactos en el rubro gastronómico", "Proyecto único + revisión mensual opcional", "Tendrías que aprender la dinámica específica de costos de cocina", "3", "3", "3", "3", "3", "Entrada media (3); inversión media (3); recurrencia media (3); diferenciación media, hay más oferta en este rubro (3); encaje medio (3)"],
  ["Costeo para tiendas de ropa que compran al por mayor y no saben su margen real por prenda", "Dueños de tiendas de ropa que revenden mercadería comprada al por mayor", "Fijan precios sumando un porcentaje fijo, sin considerar mermas ni devoluciones", "Plantilla de costeo con mermas y devoluciones + capacitación", "Contadores generalistas, cursos genéricos de finanzas para emprendedores", "Referidos, redes de comerciantes", "Proyecto único", "Adaptar tus plantillas de costeo textil a la reventa", "4", "4", "3", "3", "4", "Entrada fácil (4); inversión baja (4); recurrencia media (3); diferenciación media, hay cursos genéricos similares (3); buen encaje con tu experiencia textil (4)"],
  ["Costeo para talleres de serigrafía y estampado que cotizan por volumen sin margen claro", "Talleres de serigrafía o estampado de polos y merchandising", "Cotizan por volumen copiando precios de otros talleres, sin saber su propio costo", "Plantilla de costeo por volumen + capacitación de cotización", "Contadores generalistas, cotizadores empíricos del gremio", "Referidos, gremios de serigrafía", "Proyecto único", "Tendrías que aprender la estructura de costos de este rubro específico", "3", "4", "2", "4", "3", "Entrada media (3); inversión baja (4); baja recurrencia (2); buena diferenciación (4); encaje medio (3)"],
  ["Costeo para productores de artesanía que venden en ferias y ONG de comercio justo", "Artesanos que venden en ferias, con producción a baja escala", "No saben si el precio de feria cubre sus costos reales de materiales y horas", "Plantilla simple de costeo por hora + materiales, adaptada a baja escala", "ONG que dan capacitación gratuita pero genérica", "Contactos en gremios de artesanos, ferias", "Proyecto único, precio bajo por el segmento", "Adaptar tus plantillas a producción muy pequeña", "3", "5", "2", "3", "2", "Entrada media (3); inversión muy baja (5); baja recurrencia (2); diferenciación media (3); encaje bajo, segmento de menor presupuesto (2)"],
  ["Costeo para talleres mecánicos que cotizan reparaciones sin separar repuestos de mano de obra", "Dueños de talleres mecánicos pequeños", "Cotizan un precio único sin separar el costo de repuestos del costo de la mano de obra", "Plantilla de costeo que separa repuestos, mano de obra y margen", "Contadores generalistas, sin oferta específica para talleres mecánicos", "Referidos, contactos en el gremio automotor", "Proyecto único + revisión semestral opcional", "Tendrías que aprender la estructura de costos del rubro automotor", "3", "4", "3", "4", "3", "Entrada media (3); inversión baja (4); recurrencia media (3); buena diferenciación, poca oferta específica (4); encaje medio (3)"],
];

const RESPUESTA_VALIDACION_CONTADOR = `## Hipótesis críticas
- Nicho 1 (talleres de costura): hay que validar si los dueños están dispuestos a pagar por un servicio de costeo, o si prefieren seguir «a ojo» [HIPÓTESIS].
- Nicho 5 (tiendas de ropa al por mayor): hay que validar si el margen que perciben hoy es realmente el problema, o si el problema es otro (por ejemplo, ventas bajas) [HIPÓTESIS].

## Plan de validación: Nicho 1
- Días 1 a 6: 10 entrevistas a dueños de talleres de costura, preguntando cómo fijan el precio de cada prenda hoy.
- Días 7 a 11: ofrecer un diagnóstico gratuito de costeo a 3 talleres, a cambio de una reseña o referido.
- Días 12 a 14: presentar la propuesta paga a los 3 talleres del diagnóstico.
- Costo estimado: S/ 0 (usas tus contactos y plantillas existentes).
- Criterio de éxito definido antes de empezar: al menos 2 de los 3 diagnósticos gratuitos se convierten en contrato pago.

## Plan de validación: Nicho 2
- Días 1 a 6: 8 entrevistas a dueños de tiendas de ropa sobre cómo calculan su margen hoy.
- Días 7 a 11: publicar una plantilla gratuita simplificada de costeo en un grupo de comerciantes, a cambio de contacto.
- Días 12 a 14: ofrecer la versión completa con capacitación a quienes descargaron la plantilla.
- Costo estimado: S/ 30 (impresión de material para la feria del gremio de comerciantes).
- Criterio de éxito definido antes de empezar: al menos 10 descargas de la plantilla y al menos 2 conversiones a la versión paga.

## Guion de entrevistas
- ¿Cómo decides hoy el precio de cada producto que vendes?
- ¿Alguna vez calculaste si un producto en particular te da pérdida?
- ¿Qué tan seguido revisas tus costos (nunca, cada año, cada mes)?
- Cuéntame la última vez que un costo te tomó por sorpresa.
- ¿Has usado alguna plantilla o programa para esto? ¿Qué tal te fue?
- Si tuvieras el costo exacto de cada producto, ¿qué harías distinto?
- ¿Con quién sueles hablar sobre este tema (otro comerciante, tu contador, nadie)?
- ¿Qué te haría dudar de contratar este servicio?

## Qué debes verificar
- Confirma con cada taller si ya tienen un contador y cómo se relaciona tu servicio con lo que ese contador ya hace.
- Antes de firmar cualquier proyecto, deja por escrito qué incluye y qué no (para no terminar haciendo contabilidad tributaria sin querer).
- Revisa si necesitas algún tipo de recibo o contrato simple para formalizar el servicio.

## Siguiente paso
- Agenda las primeras 5 entrevistas del Nicho 1 esta semana, con talleres de costura que ya conoces por referidos.`;

/* ───────────────────────── 3. Diseñadora gráfica con experiencia en branding, hacia nichos de identidad visual ───────────────────────── */

const DATOS_DISENADORA = datos({
  conocimientos: "6 años como diseñadora gráfica freelance, especializada en identidad visual y branding.",
  sectores: "Gastronomía, salud y bienestar, comercio local.",
  oferta: "Diseño de logo, paleta de colores y kit básico de redes sociales.",
  mercado: "Trujillo, Perú; remoto para el resto del país.",
  tipoCliente: "empresas",
  recursos: "Laptop con Adobe Creative Cloud, portafolio de 40 proyectos, una plantilla propia de brief de marca.",
  presupuesto: "300",
  horas: "20",
  canales: ["redes", "web", "referidos"],
  restricciones: "No quiero hacer diseño editorial (revistas o libros), solo identidad de marca.",
  pesos: pesosVacios(),
});

const NICHOS_DISENADORA: string[][] = [
  ["Identidad visual para emprendimientos de comida saludable que venden por delivery, sin marca definida", "Dueños de emprendimientos de comida saludable que empezaron vendiendo por WhatsApp o Instagram", "Usan fotos de celular y texto en Canva sin una identidad consistente entre publicaciones", "Kit de marca: logo, paleta, tipografía y 10 plantillas de publicación", "Diseñadores freelance generalistas, plantillas gratuitas de Canva", "Instagram, referidos de otros emprendedores de comida", "Paquete único de kit de marca", "Tu portafolio y tu conocimiento del rubro gastronómico", "4", "4", "3", "4", "5", "Entrada fácil (4); inversión baja (4); recurrencia media, pueden volver por más piezas (3); buena diferenciación frente a plantillas genéricas (4); encaje directo con tu experiencia (5)"],
  ["Identidad visual para consultorios de psicología o terapia que recién empiezan de forma independiente", "Psicólogos o terapeutas que dejan una clínica y abren su consulta propia", "No tienen marca propia y usan el logo genérico de la app donde agendan citas", "Kit de marca cálido y profesional: logo, paleta, tarjetas y plantillas para redes", "Diseñadores freelance generalistas, sin experiencia en el tono del sector salud mental", "Referidos de otros terapeutas, redes de bienestar", "Paquete único", "Tendrías que aprender el tono visual apropiado para salud mental", "3", "4", "3", "4", "3", "Entrada media, requiere entender el rubro (3); inversión baja (4); recurrencia media (3); buena diferenciación (4); encaje medio, cercano pero nuevo para ti (3)"],
  ["Identidad visual para bodegas y minimarkets de barrio que quieren modernizar su imagen", "Dueños de bodegas o minimarkets que quieren renovar su fachada y bolsas", "Su cartel y bolsas se ven anticuados y no transmiten confianza a clientes nuevos", "Kit de marca simple: logo, paleta y diseño de cartel/fachada", "Gigantografías locales que solo imprimen, sin diseño real; diseñadores generalistas", "Referidos, contactos de proveedores del barrio", "Paquete único", "Tu portafolio de identidad visual, adaptable a comercio local", "3", "4", "2", "3", "3", "Entrada media (3); inversión baja (4); baja recurrencia (2); diferenciación media (3); encaje medio (3)"],
  ["Identidad visual para instructores de yoga o pilates que dan clases particulares o en estudios pequeños", "Instructores independientes de yoga o pilates", "Promocionan sus clases con fotos sueltas, sin un estilo visual reconocible", "Kit de marca: logo, paleta relajante y plantillas para horarios y promociones", "Diseñadores freelance generalistas, plantillas de Canva para wellness", "Instagram, redes de bienestar, referidos", "Paquete único", "Tu experiencia en el rubro de salud y bienestar", "4", "4", "3", "3", "4", "Entrada fácil (4); inversión baja (4); recurrencia media (3); diferenciación media, hay bastantes plantillas de wellness (3); buen encaje con tu experiencia (4)"],
  ["Identidad visual para foodtrucks y puestos de comida ambulante que quieren destacar en ferias", "Dueños de foodtrucks o puestos de comida que participan en ferias gastronómicas", "Su rotulado se confunde con el de otros puestos similares en la misma feria", "Kit de marca llamativo: logo, paleta y diseño del rotulado del foodtruck", "Gigantografías locales, diseñadores generalistas sin experiencia en foodtrucks", "Ferias gastronómicas, redes, referidos entre foodtrucks", "Paquete único", "Tu portafolio gastronómico y conocimiento del formato de feria", "3", "3", "2", "4", "4", "Entrada media, depende de acceso a ferias (3); inversión media, requiere ir a ferias (3); baja recurrencia (2); buena diferenciación (4); buen encaje (4)"],
  ["Identidad visual para spas y centros de estética pequeños que compiten con cadenas grandes", "Dueños de spas o centros de estética independientes", "Su imagen se ve menos profesional que la de las cadenas grandes, y pierden clientes por eso", "Kit de marca elegante: logo, paleta y plantillas para promociones y certificados de regalo", "Diseñadores freelance generalistas, sin experiencia específica en estética", "Referidos, redes de belleza y bienestar", "Paquete único + piezas adicionales por encargo", "Tu experiencia en el rubro de salud y bienestar", "3", "4", "3", "3", "4", "Entrada media (3); inversión baja (4); recurrencia media (3); diferenciación media (3); buen encaje (4)"],
  ["Identidad visual para tiendas de productos naturales o herbolarias de barrio", "Dueños de tiendas de productos naturales o herbolarias pequeñas", "Su imagen no transmite confianza frente a tiendas naturistas más grandes y conocidas", "Kit de marca: logo, paleta natural y etiquetas para productos a granel", "Diseñadores generalistas, plantillas genéricas de etiquetas", "Referidos, redes de vida saludable", "Paquete único + diseño de etiquetas adicionales", "Tu experiencia en comida saludable, cercana a este rubro", "3", "4", "3", "3", "4", "Entrada media (3); inversión baja (4); recurrencia media, pueden pedir más etiquetas (3); diferenciación media (3); buen encaje, rubro cercano al que ya conoces (4)"],
  ["Identidad visual para entrenadores personales independientes que arman su propia cartera de clientes", "Entrenadores personales que dejaron un gimnasio para trabajar por su cuenta", "Usan fotos de entrenamientos sin ninguna marca que los distinga de otros entrenadores", "Kit de marca energético: logo, paleta y plantillas para publicar rutinas y testimonios", "Diseñadores freelance generalistas, plantillas fitness de Canva", "Instagram, redes de fitness, referidos", "Paquete único", "Tu experiencia en salud y bienestar, cercana al rubro fitness", "4", "4", "3", "3", "4", "Entrada fácil (4); inversión baja (4); recurrencia media (3); diferenciación media, mucha oferta de plantillas fitness (3); buen encaje (4)"],
];

const RESPUESTA_VALIDACION_DISENADORA = `## Hipótesis críticas
- Nicho 1 (comida saludable por delivery): hay que validar si pagarían por un kit completo, o si seguirían usando Canva gratis [HIPÓTESIS].
- Nicho 8 (entrenadores personales): hay que validar si recién independizados tienen presupuesto para esto, o si primero priorizan conseguir clientes [HIPÓTESIS].

## Plan de validación: Nicho 1
- Días 1 a 5: 10 entrevistas a dueños de emprendimientos de comida saludable que venden por delivery.
- Días 6 a 10: ofrecer un mini rediseño gratuito (solo el logo) a 3 emprendimientos, a cambio de una reseña pública.
- Días 11 a 14: presentar el kit completo pago a esos 3 emprendimientos y a quienes vieron la reseña.
- Costo estimado: S/ 0 (usas tu tiempo y herramientas actuales).
- Criterio de éxito definido antes de empezar: al menos 2 de los 3 rediseños gratuitos se convierten en el paquete completo pago.

## Plan de validación: Nicho 2
- Días 1 a 5: 8 entrevistas a entrenadores personales que dejaron un gimnasio en los últimos 6 meses.
- Días 6 a 10: publicar 2 antes/después de marca (con permiso de un cliente real o como ejemplo ficticio claramente marcado) en redes de fitness.
- Días 11 a 14: dar seguimiento a quienes comentaron o preguntaron precio.
- Costo estimado: S/ 20 (promoción pequeña en redes).
- Criterio de éxito definido antes de empezar: al menos 5 contactos interesados y al menos 1 venta cerrada.

## Guion de entrevistas
- ¿Cómo promocionas hoy tu negocio en redes sociales?
- ¿Alguna vez sentiste que tu imagen no se ve tan profesional como te gustaría?
- ¿Qué usas hoy para hacer tus publicaciones (Canva, plantillas, nada)?
- Cuéntame la última vez que compartiste algo y no quedaste conforme con cómo se veía.
- ¿Has considerado contratar a un diseñador antes? ¿Qué te detuvo?
- ¿Qué tan seguido necesitas piezas nuevas (cada semana, cada mes, rara vez)?
- ¿Con quién hablas sobre cómo mejorar tu imagen de marca?
- ¿Qué te haría dudar de contratar este servicio?

## Qué debes verificar
- Confirma que cualquier antes/después que muestres tenga permiso explícito del cliente, o márcalo como ejemplo ficticio.
- Antes de ofrecer un rediseño gratuito, define por escrito qué incluye exactamente, para no terminar haciendo trabajo extra sin cobrar.
- Revisa los derechos de cualquier fuente tipográfica o recurso que uses en los kits antes de entregarlos.

## Siguiente paso
- Contacta hoy mismo a los 3 emprendimientos de comida saludable para ofrecerles el rediseño gratuito del Nicho 1.`;

export const EJEMPLOS_NICHOS: EjemploNichos[] = [
  { id: "ingles", etiqueta: "Profesora de inglés corporativo", descripcion: "8 nichos, el mejor puntuado: inglés para entrevistas técnicas en TI.", datos: DATOS_INGLES, respuestaNichos: `## Nichos\n${bloqueCsv(NICHOS_INGLES)}\n\n## Qué debes verificar\n- Confirma que hay demanda real antes de invertir tiempo en crear material nuevo.\n- Verifica si necesitas algún permiso o registro para dar clases pagas de forma independiente.\n\n## Siguiente paso\n- Usa la matriz de esta página para comparar los 8 nichos con tus propios pesos.`, respuestaValidacion: RESPUESTA_VALIDACION_INGLES, indicesFavoritos: [0, 2] },
  { id: "contador", etiqueta: "Contador especializado en costos", descripcion: "8 nichos, el mejor puntuado: costeo para talleres de costura.", datos: DATOS_CONTADOR, respuestaNichos: `## Nichos\n${bloqueCsv(NICHOS_CONTADOR)}\n\n## Qué debes verificar\n- Confirma que cada nicho no compite directamente con el contador tributario que ya tenga el cliente.\n- Verifica si necesitas algún seguro de responsabilidad profesional para ofrecer este servicio.\n\n## Siguiente paso\n- Usa la matriz de esta página para comparar los 8 nichos con tus propios pesos.`, respuestaValidacion: RESPUESTA_VALIDACION_CONTADOR, indicesFavoritos: [0, 4] },
  { id: "disenadora", etiqueta: "Diseñadora gráfica de identidad visual", descripcion: "8 nichos, el mejor puntuado: identidad para comida saludable por delivery.", datos: DATOS_DISENADORA, respuestaNichos: `## Nichos\n${bloqueCsv(NICHOS_DISENADORA)}\n\n## Qué debes verificar\n- Confirma los derechos de cualquier tipografía o recurso antes de entregarlo a un cliente.\n- Verifica si necesitas un contrato simple para formalizar cada proyecto.\n\n## Siguiente paso\n- Usa la matriz de esta página para comparar los 8 nichos con tus propios pesos.`, respuestaValidacion: RESPUESTA_VALIDACION_DISENADORA, indicesFavoritos: [0, 7] },
];
