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
  requerido?: boolean;
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
  ayuda?: string;
}

export interface CasoDePrueba {
  nombre: string;
  entradas: Record<string, string | number>;
  /** Valor esperado por salida: número (compara el valor) o texto (compara el texto mostrado). */
  esperado: Record<string, number | string>;
  tolerancia?: number;
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

export type EtiquetaImagen = "Prueba real" | "Ilustración" | "Simulación";

export interface CapturaEjemplo {
  /** Ruta pública, en /img/{area}/{slug}/…  */
  src: string;
  alt: string;
  /** «Prueba real» solo para capturas reales, sin editar, de un chat. */
  etiqueta: EtiquetaImagen;
  pie?: string;
}

export interface EjemploReal {
  /** Lleva «(ficticio)» o «(ficticia)» la primera vez que aparece. */
  negocio: string;
  datos: Record<string, string>;
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
  /**
   * Parte específica del prompt. Puede citar campos con `{{id}}`; el prompt final nunca muestra llaves:
   * un campo vacío se marca [FALTA] (si es requerido) o «no indicado».
   */
  tarea: string;
  /** Opcional: los 3 pasos de «Cómo usarlo». */
  pasos?: [string, string, string];
  mejoras: MejoraPrompt[];
  ejemplo: EjemploReal;
  checklist: string[];
  porQueFunciona: PorQueFunciona[];
  rubros: RubroEjemplo[];
  errores: ErrorComun[];
  faq: PreguntaFrecuente[];
  /** Rutas «area/slug» de herramientas relacionadas. */
  relacionadas: string[];
  metodoCompleto: { titulo: string; parrafos: string[] } | null;
}

export function defineHerramienta<T extends Herramienta>(herramienta: T): T {
  return herramienta;
}
