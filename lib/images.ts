/**
 * Mapa central de ilustraciones SVG contextuales (public/images/). Solo
 * cubre las categorías "flagship" (las 6 destacadas en portada) y las 14
 * profesiones — el resto del catálogo (94 categorías, cientos de
 * herramientas/prompts/posts) sigue usando su icono de lucide-react o su
 * avatar por defecto, que ya cumplen bien esa función a esa escala.
 */

export interface ImageAsset {
  src: string;
  alt: string;
  credit?: {
    photographerName: string;
    photographerUrl: string;
    photoPageUrl: string;
  };
}

export const flagshipCategoryImages: Record<string, ImageAsset> = {
  "generacion-de-imagenes": {
    src: "https://images.unsplash.com/photo-1786192442781-bd3c12291c6c?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Generación de imágenes con IA",
    credit: {
      photographerName: "Anna Vaschenko",
      photographerUrl: "https://unsplash.com/es/@annaholograma",
      photoPageUrl: "https://unsplash.com/es/fotos/paisaje-abstracto-de-bloques-de-colores-1u33eF9c2LE",
    },
  },
  escritura: {
    src: "https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Escritura y copywriting con IA",
    credit: {
      photographerName: "Glenn Carstens-Peters",
      photographerUrl: "https://unsplash.com/es/@glenncarstenspeters",
      photoPageUrl: "https://unsplash.com/es/fotos/persona-que-usa-macbook-hBuwVLcYTnA",
    },
  },
  productividad: {
    src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Productividad y automatización con IA",
    credit: {
      photographerName: "Lukas Blazek",
      photographerUrl: "https://unsplash.com/es/@goumbik",
      photoPageUrl: "https://unsplash.com/es/fotos/macbook-pro-white-ceramic-mugand-black-smartphone-on-table-cckf4TsHAuw",
    },
  },
  programacion: {
    src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Programación y código con IA",
    credit: {
      photographerName: "Ilya Pavlov",
      photographerUrl: "https://unsplash.com/es/@ilyapavlov",
      photoPageUrl: "https://unsplash.com/es/fotos/una-pantalla-de-computadora-con-un-monton-de-codigo-ieic5Tq8YMk",
    },
  },
  "audio-y-voz": {
    src: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Audio y voz con IA",
    credit: {
      photographerName: "Will Francis",
      photographerUrl: "https://unsplash.com/es/@willfrancis",
      photoPageUrl: "https://unsplash.com/es/fotos/fotografia-macro-del-condensador-de-microfono-de-estudio-plateado-y-negro-c1ZN57GfDB0",
    },
  },
  video: {
    src: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Generación y edición de vídeo con IA",
    credit: {
      photographerName: "Jakob Owens",
      photographerUrl: "https://unsplash.com/es/@jakobowens1",
      photoPageUrl: "https://unsplash.com/es/fotos/persona-sosteniendo-una-claqueta-Hn3S90f6aak",
    },
  },
};

export const professionImages: Record<string, ImageAsset> = {
  programadores: {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para programadores",
    credit: {
      photographerName: "Israel Andrade",
      photographerUrl: "https://unsplash.com/es/@israelandrxde",
      photoPageUrl: "https://unsplash.com/es/fotos/grupo-de-personas-que-usan-una-computadora-portatil-QckxruozjRg",
    },
  },
  marketing: {
    src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para marketing digital",
    credit: {
      photographerName: "Redd Francisco",
      photographerUrl: "https://unsplash.com/es/@reddfrancisco",
      photoPageUrl: "https://unsplash.com/es/fotos/tres-hombres-sentados-mientras-usan-computadoras-portatiles-y-miran-a-un-hombre-junto-a-la-pizarra-wD1LRb9OeEo",
    },
  },
  disenadores: {
    src: "https://images.unsplash.com/photo-1732120529252-6829835e7468?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para diseñadores gráficos",
    credit: {
      photographerName: "Faizur Rehman",
      photographerUrl: "https://unsplash.com/es/@fazurrehman",
      photoPageUrl: "https://unsplash.com/es/fotos/una-persona-sosteniendo-un-boligrafo-y-escribiendo-en-una-computadora-portatil-9qoWKXTOTLs",
    },
  },
  abogados: {
    src: "https://images.unsplash.com/photo-1758518731462-d091b0b4ed0d?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para abogados",
    credit: {
      photographerName: "Vitaly Gariev",
      photographerUrl: "https://unsplash.com/es/@silverkblack",
      photoPageUrl: "https://unsplash.com/es/fotos/empresarios-firmando-un-contrato-en-una-mesa-iPheGw7_UaI",
    },
  },
  medicos: {
    src: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para médicos",
    credit: {
      photographerName: "Getty Images",
      photographerUrl: "https://unsplash.com/es/@gettyimages",
      photoPageUrl: "https://unsplash.com/es/fotos/medico-sosteniendo-un-estetoscopio-rojo-hIgeoQjS_iE",
    },
  },
  ingenieros: {
    src: "https://images.unsplash.com/photo-1774600166818-e554a4d4c376?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para ingenieros",
    credit: {
      photographerName: "Ümit Yıldırım",
      photographerUrl: "https://unsplash.com/es/@umityildirim",
      photoPageUrl: "https://unsplash.com/es/fotos/dos-mujeres-con-casco-revisan-planos-en-interiores-c7iL-YvyAyU",
    },
  },
  arquitectos: {
    src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para arquitectos",
    credit: {
      photographerName: "Sven Mieke",
      photographerUrl: "https://unsplash.com/es/@sxoxm",
      photoPageUrl: "https://unsplash.com/es/fotos/un-arquitecto-trabajando-en-un-borrador-con-un-lapiz-y-una-regla-HtBlQdxfG9k",
    },
  },
  profesores: {
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para profesores",
    credit: {
      photographerName: "Hatice Baran",
      photographerUrl: "https://unsplash.com/es/@haticebaran",
      photoPageUrl: "https://unsplash.com/es/fotos/alumnos-en-el-aula-con-el-profesor-presentando-zFSo6bnZJTw",
    },
  },
  contadores: {
    src: "https://images.unsplash.com/photo-1626266061368-46a8f578ddd6?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para contadores",
    credit: {
      photographerName: "Jakub Żerdzicki",
      photographerUrl: "https://unsplash.com/es/@jakubzerdzicki",
      photoPageUrl: "https://unsplash.com/es/fotos/persona-usando-la-calculadora-en-el-escritorio-con-una-taza-de-cafe-JhevWHCbVyw",
    },
  },
  emprendedores: {
    src: "https://images.unsplash.com/photo-1758598497635-48cbbb1f6555?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para emprendedores",
    credit: {
      photographerName: "Austin Distel",
      photographerUrl: "https://unsplash.com/es/@austindistel",
      photoPageUrl: "https://unsplash.com/es/fotos/hombre-sonriendo-en-un-entorno-de-oficina-moderno-o0WJ8AlIPJE",
    },
  },
  ventas: {
    src: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para ventas",
    credit: {
      photographerName: "Tahir osman",
      photographerUrl: "https://unsplash.com/es/@tahirosman",
      photoPageUrl: "https://unsplash.com/es/fotos/two-men-facing-each-other-while-shake-hands-and-smiling-NbtIDoFKGO8",
    },
  },
  "recursos-humanos": {
    src: "https://images.unsplash.com/photo-1758520144437-f068ecaf0d83?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para Recursos Humanos",
    credit: {
      photographerName: "Vitaly Gariev",
      photographerUrl: "https://unsplash.com/es/@silverkblack",
      photoPageUrl: "https://unsplash.com/es/fotos/mujer-con-gafas-entrevista-a-un-hombre-en-el-escritorio-de-la-oficina-pg2eJwNVpvY",
    },
  },
  "creadores-contenido": {
    src: "https://images.unsplash.com/photo-1695408247109-3bf125ad0538?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para creadores de contenido",
    credit: {
      photographerName: "Videodeck .co",
      photographerUrl: "https://unsplash.com/es/@videodeck",
      photoPageUrl: "https://unsplash.com/es/fotos/una-mujer-tomandose-una-foto-de-si-misma-en-una-cocina-RAH1ipSQh24",
    },
  },
  estudiantes: {
    src: "https://images.unsplash.com/photo-1741699428220-65f37f3fbbcb?w=1200&q=80&fm=jpg&fit=crop&auto=format",
    alt: "Prompts de IA para estudiantes",
    credit: {
      photographerName: "Kateryna Hliznitsova",
      photographerUrl: "https://unsplash.com/es/@kate_gliz",
      photoPageUrl: "https://unsplash.com/es/fotos/los-estudiantes-estudian-en-una-biblioteca-con-libros-klbApl9mxr0",
    },
  },
};
