/**
 * Esquema de una página de herramienta («Herramienta + guía corta»). Una página = un archivo de datos
 * en content/herramientas/{area}/{slug}.ts que exporta `defineHerramienta({...})`.
 *
 * Reglas del esquema:
 *  - `publicado: false` (por defecto) = la página responde con noindex y no aparece en el sitemap, en
 *    /herramientas, en las páginas de área ni en «relacionadas». Solo pasa a `true` cuando cumple los
 *    estándares de calidad (scripts/validate-herramientas.ts los comprueba).
 *  - Lo que falte (fecha de la prueba, imagen…) se deja como `null`/vacío con un comentario `TODO:` en el
 *    archivo de datos. Nunca en la página visible.
 */
import type { CategorySlug } from "../../content/categorias";

export type AreaId = CategorySlug;
export type TipoHerramienta = "generador" | "calculadora" | "analizador" | "kit";

/* ───────────────────────────── perfil «Mi negocio» ───────────────────────────── */

export const PERFIL_CLAVES = ["nombre", "rubro", "ciudad", "queVendes", "clientes", "tono", "canales", "direccion", "horario", "contacto", "moneda"] as const;
export type PerfilClave = (typeof PERFIL_CLAVES)[number];
export type Perfil = Partial<Record<PerfilClave, string>>;

/* ───────────────────────────── campos del formulario ───────────────────────────── */

export interface Campo {
  id: string;
  label: string;
  /** `largo` = área de texto (para pegar consultas, reseñas, listas…). */
  tipo: "texto" | "largo" | "numero" | "seleccion";
  /** Valor de «Probar con un ejemplo». Obligatorio: cada campo se puede probar. */
  ejemplo: string;
  requerido?: boolean;
  /** Ayuda corta bajo el campo (qué poner y qué no). */
  ayuda?: string;
  opciones?: string[];
  maxLength?: number;
}

/* ───────────────────────────── calculadora ───────────────────────────── */

export type FormatoNumero = "moneda" | "porcentaje" | "numero" | "entero" | "si-no";

export interface EntradaCalculadora {
  id: string;
  label: string;
  /** Cómo se escribe el dato: `moneda` antepone el símbolo del perfil; `porcentaje` se escribe como 20 (=20 %). */
  unidad?: "moneda" | "porcentaje" | "numero" | "entero";
  ejemplo: string;
  /** `false` = opcional: vacío vale `porDefecto` (0 si no se indica). */
  requerido?: boolean;
  porDefecto?: number;
  min?: number;
  max?: number;
  ayuda?: string;
}

export interface SalidaCalculadora {
  id: string;
  etiqueta: string;
  /**
   * Expresión aritmética (sin eval): números, + − × ÷, paréntesis, comparaciones, && ||, y las funciones
   * min, max, abs, round(x; n), techo, piso, si(condición; sí; no). Puede usar los ids de las entradas y
   * de las salidas anteriores. Las entradas de tipo porcentaje ya vienen como fracción (20 → 0.2).
   */
  formula: string;
  formato: FormatoNumero;
  decimales?: number;
  /** Si `false`, se muestra en la página pero no viaja al prompt. Por defecto `true`. */
  enPrompt?: boolean;
  /** Salida que depende de datos opcionales: sin ellos se muestra «—» y no viaja al prompt (no se marca [FALTA]). */
  opcional?: boolean;
  ayuda?: string;
}

export interface CasoDePrueba {
  nombre: string;
  entradas: Record<string, string | number>;
  /** Valor esperado por salida: número (compara el valor) o texto (compara el texto mostrado). */
  esperado: Record<string, number | string>;
  tolerancia?: number;
}

/** Caso de prueba de un pre-proceso: textos que se pegan y resultados esperados (número = valor; texto = texto mostrado). */
export interface CasoPreproceso {
  nombre: string;
  valores: Record<string, string>;
  esperado: Record<string, number | string>;
}

/**
 * Pre-proceso de un Analizador: la página cuenta o suma el texto pegado antes de que la IA lo analice.
 *  - `conteo-temas`: cuenta reseñas por tema según un libro de códigos («Tema: palabra, palabra»).
 *  - `resumen-ventas`: totales de una tabla de ventas (fecha, producto, cantidad, monto).
 */
export interface Preproceso {
  tipo: "conteo-temas" | "resumen-ventas";
  /** ids de los campos: `texto` = lo que se analiza; `temas` = el libro de códigos (solo conteo-temas). */
  campos: { texto: string; temas?: string };
  /** Al menos 3 casos, igual que las calculadoras. */
  casosDePrueba: CasoPreproceso[];
}

export interface Calculadora {
  entradas: EntradaCalculadora[];
  salidas: SalidaCalculadora[];
  /** Al menos 3 casos: cada fórmula se verifica con casos conocidos (scripts y `npm test` los ejecutan). */
  casosDePrueba: CasoDePrueba[];
}

/* ───────────────────────────── bloques de la página ───────────────────────────── */

export interface MejoraPrompt {
  label: string;
  /** Una línea para pegar en el mismo chat. Sin variables. */
  prompt: string;
}

/** Únicas etiquetas válidas de una imagen (estándar 2). «Prueba real» = captura real, sin editar, de un chat con una IA. */
export const ETIQUETAS_IMAGEN = ["Prueba real", "Ilustración", "Simulación", "Resultado final diseñado con el texto de la IA", "Foto generada con IA"] as const;
export type EtiquetaImagen = (typeof ETIQUETAS_IMAGEN)[number];

export interface CapturaEjemplo {
  /** Ruta pública, en /img/{area}/{slug}/…, por ejemplo /img/marketing/crear-afiches-con-ia/prueba-01.webp */
  src: string;
  /** Obligatorio: describe lo que muestra la imagen. */
  alt: string;
  /** «Prueba real» solo para capturas reales, sin editar, de un chat. */
  etiqueta: EtiquetaImagen;
  /** Texto bajo la imagen. */
  leyenda: string;
  /** Tamaño real del archivo en píxeles (evita saltos de diseño). */
  ancho: number;
  alto: number;
}

/**
 * Captura que aún no existe. Solo se ve con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris punteado en el bloque 6);
 * en producción no se renderiza nada. Una página `publicado: true` no puede tener ninguna pendiente.
 */
export interface CapturaPendiente {
  /** Nombre del archivo esperado en public/img/{area}/{slug}/, por ejemplo «prueba-01.webp». */
  archivo: string;
  etiqueta: EtiquetaImagen;
  /** Qué debe mostrar la captura (para quien la toma). */
  muestra: string;
}

export interface EjemploReal {
  /** Lleva «(ficticio)» o «(ficticia)» la primera vez que aparece. */
  negocio: string;
  datos: Record<string, string>;
  /**
   * Lo que sale del caso, línea por línea (por ejemplo, los niveles de un afiche). Debe coincidir con
   * la captura real: si cambia la captura, cambia esto.
   */
  resultado?: Record<string, string>;
  capturas: CapturaEjemplo[];
  /** «Qué corregí yo» (3 líneas). */
  queCorregi: string[];
}

export interface PorQueFunciona {
  titulo: string;
  texto: string;
}

export interface RubroEjemplo {
  rubro: string;
  ejemplo: string;
  consejo: string;
}

export interface ErrorComun {
  error: string;
  solucion: string;
}

export interface PreguntaFrecuente {
  p: string;
  r: string;
}

/** Límites de una plataforma (para las futuras páginas de anuncios por plataforma). */
export interface LimitePlataforma {
  concepto: string;
  valor: string;
  /** URL de la documentación oficial donde se verificó. */
  fuente: string;
  /** AAAA-MM-DD: día en que se verificó. */
  fechaVerificacion: string;
}

export interface Herramienta {
  /** `false` = noindex y fuera de sitemap, biblioteca, áreas y relacionadas. */
  publicado: boolean;
  meta: {
    slug: string;
    area: AreaId;
    tipo: TipoHerramienta;
    titulo: string;
    /** Meta description: 140–160 caracteres. También es la entradilla de la página. */
    descripcion: string;
    tiempo: string;
    /** IA con la que se hizo la prueba real. `null` mientras no exista la prueba. */
    probadoEn: string | null;
    /** AAAA-MM-DD de la prueba real. `null` mientras no exista. */
    probadoFecha: string | null;
    /** AAAA-MM-DD de la última modificación real del contenido. */
    actualizado: string;
    /** AAAA-MM-DD de la primera publicación (si ya estuvo publicada antes con otra forma). */
    fechaPublicacion?: string;
    /** id de content/autores.ts. Por defecto, el autor del sitio. */
    autor?: string;
    /** Ruta pública de la imagen og:image propia (solo se usa si el archivo existe). */
    ogImage?: string;
    /** Solo para páginas por plataforma. */
    plataforma?: { id: string; nombre: string };
    limites?: LimitePlataforma[];
  };
  antesDespues: { antes: string; despues: string };
  campos: Campo[];
  /** Campos del perfil «Mi negocio» que esta herramienta usa (se completan solos). */
  usaPerfil: PerfilClave[];
  calculadora: Calculadora | null;
  /** Solo Analizadores: cuenta o suma en la página antes del prompt. */
  preproceso?: Preproceso | null;
  /**
   * Parte específica del prompt. Puede citar campos con `{{id}}`; el prompt final nunca muestra llaves:
   * un campo vacío se marca [FALTA] (si es requerido) o «no indicado».
   */
  tarea: string;
  /** Opcional: los 3 pasos de «Cómo usarlo». */
  pasos?: [string, string, string];
  mejoras: MejoraPrompt[];
  ejemplo: EjemploReal;
  /** Capturas que faltan por subir (una prueba NUEVA con el prompt que genera la página hoy). `[]` cuando no falta ninguna. */
  capturasPendientes: CapturaPendiente[];
  checklist: string[];
  porQueFunciona: PorQueFunciona[];
  rubros: RubroEjemplo[];
  errores: ErrorComun[];
  faq: PreguntaFrecuente[];
  /** Rutas «area/slug» de herramientas relacionadas. */
  relacionadas: string[];
  /** Texto largo plegado. `capturas` = pruebas reales adicionales (por ejemplo, las de la versión anterior del método). */
  metodoCompleto: { titulo: string; parrafos: string[]; capturas?: CapturaEjemplo[] } | null;
}

export function defineHerramienta<T extends Herramienta>(herramienta: T): T {
  return herramienta;
}
