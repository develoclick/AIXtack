import { CATEGORIAS_NUEVAS } from "./categorias-nuevas";
import type { Categoria } from "./tipos";

/**
 * Las 6 categorías del sitio. «Carrera y empleo» ya estaba publicada: su URL, título, descripción y textos se conservan tal
 * cual estaban en producción (solo pasan a leerse desde aquí). Las otras 5 tienen su hub escrito y quedan ocultas (404) hasta
 * que publiques su primera herramienta en content/catalogo/herramientas.ts.
 */
const CARRERA: Categoria = {
  slug: "carrera-y-empleo",
  nombre: "Carrera y empleo",
  keywordPrincipal: "prompts de ia para empleo",
  seo: {
    // Título tal cual se publica hoy (título de la categoría + sufijo del sitio) y meta descripción actual.
    title: "Prompts para carrera y empleo · Guía Prompts IA",
    description: "Herramientas y guías para preparar tu hoja de vida y tu búsqueda de empleo: formato ATS, palabras clave, verbos de acción y CV sin experiencia.",
  },
  h1: "Prompts para carrera y empleo",
  intro: [
    "Buscar trabajo en Perú y en el resto de Latinoamérica suele significar postular por portales de empleo, por LinkedIn o por el correo de la empresa. En la mayoría de los casos, lo primero que se evalúa es tu hoja de vida (en otros países la llaman currículum o CV): un documento de una o dos páginas que debe convencer a alguien que lee decenas en pocos minutos y que, muchas veces, pasa antes por un sistema de seguimiento de candidatos (ATS).",
    "Esta categoría reúne herramientas y guías para preparar ese primer paso con más orden y menos improvisación. Empezamos por la hoja de vida porque es el documento que casi todas las personas necesitan y el que más dudas genera: cuánto debe medir, qué se pone primero, cómo se escriben los logros, cómo se adapta a cada oferta y qué hacer cuando todavía no hay experiencia.",
    "Cada herramienta funciona igual: llenas un formulario con tus datos, el prompt se arma solo y lo pegas en el asistente de IA que prefieras. La IA redacta una primera versión, pero la revisión es tuya: los prompts le piden que no invente cifras, empresas ni fechas, y las guías explican qué comprobar antes de enviar. Nada de lo que escribes se envía a este sitio: se queda en tu navegador.",
    "Aquí encontrarás la herramienta para crear tu hoja de vida en formato Harvard y descargarla en Word, y tres artículos de apoyo: cómo sacar las palabras clave de una oferta laboral, qué verbos usar en tus viñetas y cómo armar un CV cuando aún no tienes experiencia laboral. Iremos sumando otros temas de la categoría, como cartas de presentación o entrevistas, cuando estén completos y no antes, para no llenar el sitio de páginas a medias.",
    "Una advertencia honesta: ninguna hoja de vida, por bien hecha que esté, garantiza una entrevista. Lo que sí puedes controlar es que tu documento sea claro, verdadero y esté adaptado a cada puesto. Ahí es donde estas herramientas te ahorran tiempo."
  ],
  orden: 1,
  ogImage: "/og-default.webp",
  icono: "briefcase",
  faqs: [
    {
      "q": "¿Por dónde empiezo si nunca he hecho una hoja de vida?",
      "a": "Por la herramienta para crear tu CV: te pide tus datos paso a paso y hay un botón para ver un ejemplo completo antes de escribir nada. Si no tienes experiencia laboral, lee después el artículo sobre CV sin experiencia."
    },
    {
      "q": "¿Necesito pagar algo o registrarme?",
      "a": "No. Todo es gratis y sin cuentas. Para usar el prompt necesitas un asistente de IA; muchos ofrecen un plan gratuito, con límites que define cada empresa."
    },
    {
      "q": "¿Las herramientas escriben mi CV por mí?",
      "a": "Te ayudan a redactar una primera versión con tus datos, pero la revisión es tuya. Los prompts le piden a la IA que no invente nada, y aun así debes comprobar cada dato antes de enviar tu hoja de vida."
    }
  ],
  contenido: {
    comoUsar: {
      titulo: "Cómo usar esta categoría en tres pasos",
      pasos: [
        "Empieza por la herramienta: llena tus datos (o mira un ejemplo) y copia el prompt que se arma solo.",
        "Pega el prompt en tu asistente de IA, trae la respuesta y descarga tu hoja de vida en Word.",
        "Lee los artículos para pulirla: palabras clave de la oferta, verbos de acción y, si aún no trabajas, cómo armarla sin experiencia.",
      ],
    },
    // Se conserva el hub tal como estaba indexado: sin lista de pendientes, sin anuncios y sin aviso añadido.
    mostrarProximamente: false,
    anuncios: false,
  },
};

export const CATEGORIAS: Categoria[] = [CARRERA, ...CATEGORIAS_NUEVAS];
