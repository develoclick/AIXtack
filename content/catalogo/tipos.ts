/**
 * Tipos del catálogo central (categorías, herramientas y artículos). Los datos viven en los archivos hermanos y toda la web
 * los lee a través de las funciones de content/catalogo/index.ts.
 */
export type IconoCategoria = "briefcase" | "plane" | "rocket" | "chart" | "wallet" | "megaphone";

export type EstadoContenido = "publicada" | "pendiente";

export interface PreguntaFrecuente {
  q: string;
  a: string;
}

export interface SeccionGuia {
  id: string;
  titulo: string;
  parrafos: string[];
}

/** Secciones del hub de una categoría. Todo es opcional: el hub solo dibuja lo que la categoría define. */
export interface ContenidoHub {
  /** Texto de la sección de introducción (por defecto «Cómo te ayuda esta categoría»). */
  tituloIntro?: string;
  /** «Cómo usar esta categoría» en pasos numerados. */
  comoUsar?: { titulo: string; pasos: string[] };
  /** Guía breve con 3–4 H2 de consejos propios. */
  guia?: { titulo: string; secciones: SeccionGuia[] };
  /** «¿Qué herramienta necesito?»: situación → herramienta (slug). Solo se dibujan las filas de herramientas publicadas y solo si hay 2 o más. */
  situaciones?: { situacion: string; herramienta: string }[];
  /** Lista de texto (sin enlaces) de las herramientas pendientes. Apagado por defecto: ver docs/COMO-AGREGAR-UNA-HERRAMIENTA.md. */
  mostrarProximamente?: boolean;
  /** Aviso al final del hub (por ejemplo, «La información es orientativa y no sustituye asesoría profesional»). */
  aviso?: string;
  /** Espacios de anuncio tras la introducción y antes de las preguntas frecuentes (solo en hubs con texto suficiente). */
  anuncios?: boolean;
}

export interface Categoria {
  slug: string;
  nombre: string;
  keywordPrincipal: string;
  /** Título de la pestaña (≤ 60 caracteres, tal cual se publica) y meta descripción (≤ 155). */
  seo: { title: string; description: string };
  h1: string;
  /** Introducción del hub (2 párrafos; la de «Carrera y empleo» conserva su texto original). */
  intro: string[];
  orden: number;
  /** Imagen Open Graph; sin ella se usa la generada en /og/{slug} (o la general del sitio). */
  ogImage?: string;
  icono: IconoCategoria;
  faqs: PreguntaFrecuente[];
  contenido: ContenidoHub;
}

interface HerramientaBase {
  slug: string;
  categoria: string;
  /** Título de la herramienta en el catálogo. */
  titulo: string;
  /** Beneficio en una frase (tarjetas del hub y de la portada mientras la página no define su propio resumen). */
  descripcionCorta: string;
  lote: 1 | 2 | 3;
  /** Slugs de herramientas relacionadas: solo se muestran las publicadas. */
  relacionadas: string[];
}

export interface HerramientaPendiente extends HerramientaBase {
  estado: "pendiente";
  fechaPublicacion?: undefined;
  fechaActualizacion?: undefined;
}

/** Datos de la página de una herramienta publicada (SEO, tarjetas e índice de la guía). */
export interface PaginaHerramienta {
  /** H1 de la página. */
  h1: string;
  /** Título corto de las tarjetas. */
  tituloCorto: string;
  /** Título de la pestaña (≤ 60 caracteres) y meta descripción (≤ 155). */
  metaTitulo: string;
  descripcion: string;
  /** Resumen de las tarjetas (si falta, se usa `descripcionCorta`). */
  resumen?: string;
  /** Qué obtiene la persona (una frase) para las tarjetas del hub. */
  queObtienes?: string;
  /** «cv-ats» la dibuja la ruta dinámica; «pagina-propia» tiene su propia carpeta en app/(site)/{categoria}/{slug}/. */
  tipo: "cv-ats" | "pagina-propia";
  tiempo: string;
  tiempoLectura: string;
  secciones: { id: string; titulo: string }[];
  /** Texto del botón de la tarjeta (por defecto «Usar herramienta»). */
  etiquetaBoton?: string;
  /** Etiquetas cortas de la tarjeta (por ejemplo «Descarga en Word»). */
  etiquetas?: string[];
}

export interface HerramientaPublicada extends HerramientaBase {
  estado: "publicada";
  /** Fechas reales AAAA-MM-DD. */
  fechaPublicacion: string;
  fechaActualizacion: string;
  pagina: PaginaHerramienta;
}

export type Herramienta = HerramientaPendiente | HerramientaPublicada;

interface ArticuloBase {
  slug: string;
  categoria: string;
  titulo: string;
  /** Slug de la herramienta a la que apoya el artículo. */
  herramientaPrincipal: string;
}

export interface ArticuloPendiente extends ArticuloBase {
  estado: "pendiente";
}

export interface ArticuloPublicado extends ArticuloBase {
  estado: "publicada";
  /** Título de la pestaña (≤ 60 caracteres) y meta descripción (≤ 155). */
  metaTitulo: string;
  descripcion: string;
  resumen: string;
  /** Texto de la tarjeta que lleva a la herramienta (distinto en cada artículo). */
  cta: string;
  fechaPublicacion: string;
  fechaActualizacion: string;
  tiempoLectura: string;
  secciones: { id: string; titulo: string }[];
}

export type Articulo = ArticuloPendiente | ArticuloPublicado;

export interface DatosCatalogo {
  categorias: Categoria[];
  herramientas: Herramienta[];
  articulos: Articulo[];
}
