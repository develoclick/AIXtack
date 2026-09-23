/**
 * Redirecciones 301 decididas URL por URL (docs/reestructuracion-guiapromptsia.md, sección 5). Siempre rutas
 * explícitas, sin comodines: cada fila es una decisión. Solo hay regla cuando el destino responde a la MISMA
 * intención que la URL antigua; las URLs del modelo anterior sin equivalente responden 410 (ver proxy.ts).
 *
 * Las aplica next.config.ts con `statusCode: 301` (no `permanent: true`, que en Next 16 emite 308) y las
 * comprueba lib/redirects.test.ts: destino existente, sin cadenas ni bucles, las 26 URLs de guías cubiertas.
 *
 * `temporal: true` (¹ en el documento) = «página más cercana»: cuando esa herramienta vuelva en una ola futura,
 * hay que CAMBIAR el destino por su URL nueva.
 */
export interface RedirectRule {
  from: string;
  to: string;
  /** Por qué las dos URLs comparten intención. */
  reason: string;
  /** Destino provisional (página más cercana mientras no exista la herramienta equivalente). */
  temporal?: boolean;
}

export const redirects: RedirectRule[] = [
  // — Páginas institucionales —
  { from: "/privacidad", to: "/politica-de-privacidad", reason: "Misma página (política de privacidad) con la URL definitiva." },
  { from: "/cookies", to: "/politica-de-cookies", reason: "Misma página (política de cookies) con la URL definitiva." },
  { from: "/autores", to: "/sobre-nosotros", reason: "Quién está detrás del sitio: se explica en Sobre nosotros." },
  { from: "/politica-editorial", to: "/sobre-nosotros", reason: "Cómo se produce el contenido (incluido el uso de IA): se explica en Sobre nosotros y en Cómo probamos." },

  // — Biblioteca y áreas: /guias y /{area}/guias pasan a la biblioteca y a las páginas de área —
  { from: "/guias", to: "/herramientas", reason: "La biblioteca de guías pasa a ser la biblioteca de herramientas." },
  { from: "/marketing/guias", to: "/marketing", reason: "Índice de guías del área → página del área." },
  { from: "/ventas/guias", to: "/ventas", reason: "Índice de guías del área → página del área." },
  { from: "/clientes/guias", to: "/clientes", reason: "Índice de guías del área → página del área." },
  { from: "/analisis/guias", to: "/analisis", reason: "Índice de guías del área → página del área." },
  { from: "/negocio/guias", to: "/negocio", reason: "Índice de guías del área → página del área." },

  // — Marketing —
  { from: "/marketing/guias/crear-anuncios-con-ia", to: "/marketing/crear-anuncios-con-ia", reason: "La guía pasa a ser la herramienta con su guía corta." },
  { from: "/marketing/guias/crear-promociones-con-ia", to: "/marketing/crear-promociones-con-ia", reason: "La guía pasa a ser la herramienta con su guía corta." },
  { from: "/marketing/guias/crear-afiches-con-ia", to: "/marketing/crear-afiches-con-ia", reason: "La guía pasa a ser la herramienta con su guía corta." },
  {
    from: "/marketing/guias/crear-publicaciones-para-redes-sociales-con-ia",
    to: "/marketing/crear-publicaciones-para-redes-con-ia",
    reason: "La guía pasa a ser la herramienta con su guía corta (slug más corto).",
  },
  { from: "/marketing/guias/calendario-de-contenido-con-ia", to: "/marketing/calendario-de-contenido-con-ia", reason: "La guía pasa a ser la herramienta con su guía corta." },
  {
    from: "/marketing/guias/ideas-de-contenido-para-tu-negocio-con-ia",
    to: "/marketing/calendario-de-contenido-con-ia",
    reason: "Las ideas de contenido son el primer paso del calendario: el kit del calendario las incluye.",
  },
  {
    from: "/marketing/guias/crear-campanas-promocionales-con-ia",
    to: "/marketing/crear-promociones-con-ia",
    reason: "La página más cercana: una campaña promocional parte de diseñar la promoción.",
    temporal: true,
  },

  // — Ventas —
  { from: "/ventas/guias/crear-descripciones-de-productos-con-ia", to: "/ventas/crear-descripciones-de-productos-con-ia", reason: "La guía pasa a ser la herramienta con su guía corta." },
  { from: "/ventas/guias/crear-cotizaciones-y-propuestas-con-ia", to: "/ventas/crear-cotizaciones-con-ia", reason: "La guía pasa a ser la herramienta (cotización con cálculo de totales)." },
  { from: "/ventas/guias/definir-precios-y-margenes-con-ia", to: "/ventas/calcular-precios-y-margenes", reason: "La guía pasa a ser la calculadora de precios y márgenes." },

  // — Clientes —
  { from: "/clientes/guias/responder-consultas-de-clientes-con-ia", to: "/clientes/responder-consultas-con-ia", reason: "La guía pasa a ser la herramienta con su guía corta." },
  { from: "/clientes/guias/responder-reclamos-con-ia", to: "/clientes/responder-reclamos-con-ia", reason: "La guía pasa a ser la herramienta con su guía corta." },
  { from: "/clientes/guias/analizar-opiniones-de-clientes-con-ia", to: "/clientes/analizar-opiniones-con-ia", reason: "La guía pasa a ser el analizador con su guía corta." },

  // — Análisis —
  { from: "/analisis/guias/analizar-ventas-con-ia", to: "/analisis/analizar-ventas-con-ia", reason: "La guía pasa a ser el analizador con su guía corta." },
  {
    from: "/analisis/guias/analizar-ofertas-de-proveedores-con-ia",
    to: "/analisis",
    reason: "Sin herramienta equivalente por ahora: se lleva a la página del área.",
    temporal: true,
  },
  {
    from: "/analisis/guias/investigar-competidores-con-ia",
    to: "/analisis",
    reason: "Sin herramienta equivalente por ahora: se lleva a la página del área.",
    temporal: true,
  },
  {
    from: "/analisis/guias/ideas-de-nuevos-productos-con-ia",
    to: "/analisis",
    reason: "Sin herramienta equivalente por ahora: se lleva a la página del área.",
    temporal: true,
  },

  // — Negocio —
  { from: "/negocio/guias/organizar-tareas-del-negocio-con-ia", to: "/negocio/organizar-tareas-con-ia", reason: "La guía pasa a ser el kit con su guía corta." },
  {
    from: "/negocio/guias/sistema-diario-de-trabajo-con-ia",
    to: "/negocio/organizar-tareas-con-ia",
    reason: "El sistema diario es la parte de rutina del kit de organizar tareas.",
  },
  { from: "/negocio/guias/documentar-procesos-con-ia", to: "/negocio/documentar-procesos-con-ia", reason: "La guía pasa a ser la herramienta con su guía corta." },

  // — URLs del modelo anterior (prompts sueltos y blog) que ya tenían equivalente; apuntan directo al destino final (sin cadenas) —
  { from: "/prompts/ideas-contenido-redes-sociales", to: "/marketing/calendario-de-contenido-con-ia", reason: "Ambas resuelven «qué publicar en redes»: ideas de contenido adaptadas al negocio." },
  { from: "/prompts/calendario-de-contenido-mensual", to: "/marketing/calendario-de-contenido-con-ia", reason: "Ambas resuelven cómo organizar el contenido de redes en un calendario." },
  { from: "/blog/guia-de-ia-para-redes-sociales", to: "/marketing/crear-publicaciones-para-redes-con-ia", reason: "Ambas enseñan a crear publicaciones de redes sociales con IA." },
  { from: "/prompts/descripcion-producto-ecommerce", to: "/ventas/crear-descripciones-de-productos-con-ia", reason: "Ambas resuelven cómo escribir la descripción comercial de un producto." },
  { from: "/prompts/descripcion-producto-ecommerce-bullets", to: "/ventas/crear-descripciones-de-productos-con-ia", reason: "Variante de la misma tarea (descripción en viñetas); la herramienta la cubre." },
  { from: "/prompts/propuesta-comercial-b2b", to: "/ventas/crear-cotizaciones-con-ia", reason: "Ambas resuelven cómo preparar una propuesta comercial clara." },
  { from: "/prompts/respuesta-atencion-cliente-reclamacion", to: "/clientes/responder-reclamos-con-ia", reason: "Ambas resuelven cómo responder a un reclamo de un cliente." },
  { from: "/prompts/respuesta-a-resena-negativa", to: "/clientes/responder-reclamos-con-ia", reason: "Una reseña negativa es un reclamo público; la herramienta debe cubrir la versión pública (comprobar antes de publicar)." },
  { from: "/prompts/analisis-de-resenas-de-clientes", to: "/clientes/analizar-opiniones-con-ia", reason: "Ambas resuelven cómo extraer patrones de las opiniones de los clientes." },
  {
    from: "/prompts/analisis-competitivo-de-mercado",
    to: "/analisis",
    reason: "Sin herramienta equivalente por ahora (la guía de competidores se retiró): página del área.",
    temporal: true,
  },
  { from: "/prompts/matriz-de-priorizacion-eisenhower", to: "/negocio/organizar-tareas-con-ia", reason: "Ambas resuelven cómo ordenar y priorizar una lista de tareas." },
];

/** Reglas en el formato de `redirects()` de next.config.ts. */
export function nextRedirects() {
  return redirects.map((rule) => ({ source: rule.from, destination: rule.to, statusCode: 301 as const }));
}
