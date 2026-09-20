/**
 * Redirecciones 301 decididas URL por URL. Solo existe una regla cuando la página
 * de destino responde a la MISMA intención que la antigua. Una URL antigua sin
 * equivalente real no se redirige: desaparece con 410 (ver proxy.ts).
 *
 * Las reglas cuyo destino es una guía solo se activan cuando esa guía está publicada
 * (status "published"); mientras sea borrador, la URL antigua responde 410. Lo aplican
 * next.config.ts (vía lib/guides/redirects.ts) y lo comprueba scripts/validate-guides.ts.
 */
export interface RedirectRule {
  from: string;
  to: string;
  /** Por qué las dos URLs comparten intención. */
  reason: string;
}

export const redirects: RedirectRule[] = [
  // — Páginas institucionales (activas desde ya) —
  {
    from: "/privacidad",
    to: "/politica-de-privacidad",
    reason: "Misma página (política de privacidad) con la URL definitiva.",
  },
  {
    from: "/cookies",
    to: "/politica-de-cookies",
    reason: "Misma página (política de cookies) con la URL definitiva.",
  },
  {
    from: "/autores",
    to: "/sobre-nosotros",
    reason: "Quién está detrás del sitio: ahora se explica en Sobre nosotros.",
  },
  {
    from: "/politica-editorial",
    to: "/sobre-nosotros",
    reason: "Cómo se produce el contenido (incluido el uso de IA): ahora se explica en Sobre nosotros.",
  },

  // — Marketing —
  {
    from: "/prompts/ideas-contenido-redes-sociales",
    to: "/marketing/guias/ideas-de-contenido-para-tu-negocio-con-ia",
    reason: "Ambas resuelven \"qué publicar en redes\": obtener ideas de contenido adaptadas al negocio.",
  },
  {
    from: "/prompts/calendario-de-contenido-mensual",
    to: "/marketing/guias/calendario-de-contenido-con-ia",
    reason: "Ambas resuelven cómo organizar el contenido de redes en un calendario.",
  },
  {
    from: "/blog/guia-de-ia-para-redes-sociales",
    to: "/marketing/guias/crear-publicaciones-para-redes-sociales-con-ia",
    reason: "Ambas enseñan a planificar y crear publicaciones de redes sociales con IA.",
  },

  // — Ventas —
  {
    from: "/prompts/descripcion-producto-ecommerce",
    to: "/ventas/guias/crear-descripciones-de-productos-con-ia",
    reason: "Ambas resuelven cómo escribir la descripción comercial de un producto.",
  },
  {
    from: "/prompts/descripcion-producto-ecommerce-bullets",
    to: "/ventas/guias/crear-descripciones-de-productos-con-ia",
    reason: "Variante de la misma tarea (descripción de producto en viñetas); la guía la cubre.",
  },
  {
    from: "/prompts/propuesta-comercial-b2b",
    to: "/ventas/guias/crear-cotizaciones-y-propuestas-con-ia",
    reason: "Ambas resuelven cómo preparar una propuesta comercial clara.",
  },

  // — Clientes —
  {
    from: "/prompts/respuesta-atencion-cliente-reclamacion",
    to: "/clientes/guias/responder-reclamos-con-ia",
    reason: "Ambas resuelven cómo responder a un reclamo de un cliente.",
  },
  {
    from: "/prompts/respuesta-a-resena-negativa",
    to: "/clientes/guias/responder-reclamos-con-ia",
    reason:
      "Una reseña negativa es un reclamo público; la guía debe incluir la versión pública de la respuesta (verificar antes de publicar la guía).",
  },
  {
    from: "/prompts/analisis-de-resenas-de-clientes",
    to: "/clientes/guias/analizar-opiniones-de-clientes-con-ia",
    reason: "Ambas resuelven cómo extraer patrones de las opiniones de los clientes.",
  },

  // — Análisis —
  {
    from: "/prompts/analisis-competitivo-de-mercado",
    to: "/analisis/guias/investigar-competidores-con-ia",
    reason: "Ambas resuelven cómo comparar el negocio con sus competidores.",
  },

  // — Negocio —
  {
    from: "/prompts/matriz-de-priorizacion-eisenhower",
    to: "/negocio/guias/organizar-tareas-del-negocio-con-ia",
    reason: "Ambas resuelven cómo ordenar y priorizar una lista de tareas.",
  },
];
