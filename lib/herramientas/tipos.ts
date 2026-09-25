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

/** Separador de las opciones marcadas de un campo `casillas` (las opciones no pueden llevar «;»). */
export const SEPARADOR_CASILLAS = "; ";

export interface Campo {
  id: string;
  label: string;
  /**
   * `largo` = área de texto (para pegar consultas, reseñas, listas…); `seleccion` = una opción de `opciones`;
   * `casillas` = varias opciones marcables: el valor es la lista de las marcadas unidas con SEPARADOR_CASILLAS.
   */
  tipo: "texto" | "largo" | "numero" | "seleccion" | "casillas";
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
 *  - `conteo-palabras`: cuenta las palabras del texto que irá en la pieza (por ejemplo, los cuatro niveles de un afiche) con
 *    `contarPalabras()` y las compara con un máximo. El total viaja al prompt por una variable de la tarea, no como «cálculo hecho».
 */
export interface Preproceso {
  tipo: "conteo-temas" | "resumen-ventas" | "conteo-palabras";
  /** ids de los campos: `texto` = lo que se analiza; `temas` = el libro de códigos (solo conteo-temas). No se usa en conteo-palabras. */
  campos: { texto?: string; temas?: string };
  /** Solo conteo-palabras: cada nivel es la unión (con `union`) de los campos indicados que tengan texto; `maximo` es el tope de palabras. */
  palabras?: { maximo: number; niveles: { id: string; etiqueta: string; campos: string[]; union: string }[] };
  /** Variables de la tarea: `{{nombre}}` se sustituye por el valor del resultado con ese id (por ejemplo `{ palabras: "total" }`). */
  variables?: Record<string, string>;
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

/**
 * Únicas etiquetas válidas de una imagen (estándar 2). «Prueba real» = captura real, sin editar, de un chat con una IA.
 * «Captura de la herramienta» = captura de esta misma página (por ejemplo, el formulario lleno).
 */
export const ETIQUETAS_IMAGEN = ["Prueba real", "Captura de la herramienta", "Ilustración", "Simulación", "Resultado final diseñado con el texto de la IA", "Foto generada con IA"] as const;
/** Etiquetas de imágenes hechas por una IA: su leyenda tiene que decir que fueron generadas con IA. */
export const ETIQUETAS_GENERADAS_CON_IA: readonly string[] = ["Simulación", "Foto generada con IA"];
/** ¿La leyenda (o la descripción de una captura pendiente) dice que la imagen fue generada con IA? */
export const dicePorIA = (texto: string) => /generad[oa]s? con (una )?IA/i.test(texto);
export type EtiquetaImagen = (typeof ETIQUETAS_IMAGEN)[number];

/**
 * Un ESPACIO DE IMAGEN de la página: se define en los datos y la imagen aparece sola cuando existe el archivo
 * `public/img/{area}/{slug}/{archivo}.webp` (o .png, o .jpg; gana .webp). No hay que tocar el archivo de datos al añadirla:
 * su ancho y su alto reales se leen del archivo al construir la página.
 *
 *  - Si el archivo existe: se muestra con su etiqueta, su `alt` y su `leyenda`, y se puede ampliar con la lupa.
 *  - Si no existe y la página es un borrador (`publicado: false`) con la vista previa activa (`next dev` o MOSTRAR_BORRADORES=true):
 *    un recuadro punteado con el título, la etiqueta prevista y el nombre del archivo esperado.
 *  - Si no existe y la página está publicada: una imagen `obligatoria` rompe el build con un error claro; una opcional no enseña nada.
 */
export interface EspacioImagen {
  /** Identificador único dentro de la página. */
  id: string;
  /** Nombre del archivo SIN extensión (minúsculas, números y guiones): «prueba-01». */
  archivo: string;
  /** Solo las etiquetas de `ETIQUETAS_IMAGEN`. «Prueba real» = captura real, sin editar, de un chat con una IA. */
  etiqueta: EtiquetaImagen;
  /** Obligatorio: describe lo que muestra la imagen (mínimo 25 caracteres). */
  alt: string;
  /** Texto visible bajo la imagen. «Simulación» y «Foto generada con IA» deben decir que fue generada con IA. */
  leyenda: string;
  /**
   * Dónde va: «preparacion», «paso-2»…«paso-5» (evidencia de un paso del proceso), «ejemplo» (páginas simples), «metodo-completo»
   * y, en una página de proceso, «resultado-{id}» (la tarjeta de «Lo que vas a tener» con ese id). Puede ser una lista
   * (por ejemplo, `["paso-4", "resultado-afiche"]`: la misma imagen en el ejemplo y en la tarjeta).
   */
  ubicacion: string | string[];
  /** `true` = si la página está publicada, tiene que existir el archivo (si no, el build falla). */
  obligatoria: boolean;
  /** Nota que sale debajo de la imagen (solo cuando la imagen existe). */
  nota?: string;
  /** Título corto de lo que debe ir, para el recuadro de vista previa («Chat de la IA con el texto del afiche»). */
  titulo?: string;
  /** Proporción esperada del recuadro de vista previa, «ancho:alto» (por defecto «16:10»). Evita saltos de diseño. */
  proporcion?: string;
}

/** Una fila de «Quién hizo qué»: el paso del proceso, lo que hizo la IA, lo que hizo el autor y el tiempo real. */
export interface PasoDelEjemplo {
  /** Número del paso de `pasos` al que corresponde. */
  paso: number;
  hizoLaIA: string;
  hiceYo: string;
  tiempo: string;
}

export interface EjemploReal {
  /** Lleva «(ficticio)» o «(ficticia)» la primera vez que aparece. */
  negocio: string;
  /**
   * Lo que sale del caso, línea por línea (por ejemplo, los niveles de un afiche). Debe coincidir con
   * la captura real: si cambia la captura, cambia esto.
   */
  resultado?: Record<string, string>;
  /**
   * Respuesta completa de la IA, copiada tal cual del MISMO chat de la captura «Prueba real». Se muestra en un bloque
   * plegable «Respuesta completa de la IA (transcripción del mismo chat)». Vacía hasta que exista la prueba: nunca se
   * escribe a mano ni se genera.
   */
  transcripcion?: string;
  /**
   * Quién hizo qué en la prueba real, paso a paso (lo que hizo la IA, lo que hizo el autor y cuánto tardó). Lo escribe el autor
   * con su prueba real: nunca se inventa. Vacío = no se muestra nada (tampoco en producción).
   */
  pasos?: PasoDelEjemplo[];
  /** Tiempo total de la prueba real (por ejemplo «14 min»). Vacío = no se muestra. */
  tiempoTotal?: string;
  /** «Qué corregí yo» (3 líneas). */
  queCorregi: string[];
}

/* ───────────────────────────── proceso (herramienta + guía corta, versión «proceso») ───────────────────────────── */

/**
 * Condición sobre los datos del formulario (y del perfil), en texto:
 *  - `campo=Valor`: el campo vale exactamente ese valor;
 *  - `campo~Valor`: el campo (por ejemplo, unas casillas) contiene esa opción;
 *  - `campo`: el campo tiene texto; `!campo`: está vacío;
 *  - `perfil.rubro`: lo mismo con un dato del perfil «Mi negocio»;
 *  - varias condiciones separadas por «|» = basta una (O).
 */
export type Condicion = string;

/** «Lo que vas a tener»: un resultado concreto del proceso. Sin captura se muestra un icono y la descripción. */
export interface ResultadoFinal {
  id: string;
  titulo: string;
  descripcion: string;
  /** Icono: «texto», «afiche», «movil», «mockup», «mensaje» o «imprimir». */
  icono?: string;
}

/** «El problema»: un error típico (título y explicación). */
export interface ProblemaItem {
  titulo: string;
  texto: string;
}

/** «Qué necesitas». */
export interface Necesidad {
  nombre: string;
  para: string;
  obligatorio: boolean;
  alternativa?: string;
}

/** Un aviso visible (por ejemplo, «es una simulación»), opcionalmente solo si se cumple una condición. */
export interface AvisoPaso {
  texto: string;
  si?: Condicion;
}

export interface OpcionPaso {
  id: string;
  titulo: string;
  texto: string;
  /** Plantilla del prompt de esta opción (mismas reglas que `PasoProceso.prompt`). */
  prompt?: string;
  /** La opción solo se ve si se cumple esta condición (por ejemplo, un formato marcado). */
  mostrarSi?: Condicion;
  /** La opción va la primera si se cumple esta condición (por ejemplo, la herramienta elegida). */
  primeraSi?: Condicion;
  /** Nota que solo se ve si se cumple su condición (por ejemplo, «recomendada» cuando la persona no sabe). */
  notas?: AvisoPaso[];
  avisos?: AvisoPaso[];
  /** A dónde se pega el prompt (por defecto, ChatGPT, Gemini o Claude). */
  destino?: string;
}

/**
 * Un texto listo para pegar en el mismo chat de la IA cuando algo sale mal. Es una plantilla (mismas reglas que un prompt de
 * paso): se rellena con los datos del formulario y se copia con un botón «Copiar corrección».
 */
export interface Correccion {
  /** Qué corrige (por ejemplo «Precio»): distingue los botones cuando hay varios. */
  etiqueta: string;
  prompt: string;
  /** La corrección solo se ve si se cumple esta condición (por ejemplo, que la condición del formulario tenga texto). */
  mostrarSi?: Condicion;
  /** A dónde se pega (por defecto, ChatGPT, Gemini o Claude). */
  destino?: string;
}

/** Una salida de «Si algo falla»: un texto, o un texto con las correcciones que se copian. */
export type SalidaFalla = string | { texto: string; correcciones: Correccion[] };

export interface PasoProceso {
  numero: number;
  titulo: string;
  /** Por ejemplo «2 min». */
  tiempo: string;
  queHaces: string;
  opciones?: OpcionPaso[];
  /** Plantilla del prompt del paso: se construye con los datos del formulario y del perfil, y nunca muestra llaves. */
  prompt?: string;
  /** El prompt del paso es el prompt completo de la herramienta (reglas comunes, datos y `tarea`). */
  promptMaestro?: boolean;
  destino?: string;
  avisos?: AvisoPaso[];
  /** Datos del formulario que hay que comprobar (paso de revisión): se muestran con su valor actual. */
  comprobar?: { etiqueta: string; campo: string }[];
  /** Muestra «Te falta…» y el conteo del formulario (paso de datos). */
  muestraEstadoDatos?: boolean;
  /** Muestra las «mejoras» (líneas para pegar en el mismo chat) dentro del paso. */
  mostrarMejoras?: boolean;
  /** Texto cuando ninguna opción se ve (por ejemplo, no se marcó ningún formato). */
  sinOpciones?: string;
  asiSabesQueSalioBien: string[];
  /** «Si algo falla». Cada salida que pide escribirle algo a la IA lleva sus `correcciones` (botón «Copiar corrección»). */
  siAlgoFalla: SalidaFalla[];
  /** Lo que tienes al terminar el paso. */
  resultado: string;
}

/** Lista final marcable (el estado se guarda solo en el navegador). */
export interface ItemKit {
  id: string;
  texto: string;
  mostrarSi?: Condicion;
}

/** Los pasos de un proceso, o `null` si `pasos` es la lista simple de 3 textos de «Cómo usarlo». */
export function pasosDelProceso(h: { pasos?: readonly unknown[] }): PasoProceso[] | null {
  const p = h.pasos;
  return p && p.length > 0 && typeof p[0] === "object" ? (p as PasoProceso[]) : null;
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
    /** Herramienta de fuera que se usa además de la IA de chat (por ejemplo «Canva»): sale en la etiqueta del encabezado. */
    herramientasExtra?: string;
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
  /**
   * Opcional. O bien los 3 textos de «Cómo usarlo» (versión simple), o bien los pasos de un PROCESO (`PasoProceso[]`), que
   * activa la plantilla de proceso junto con `resultadoFinal`, `problema`, `necesitas` y `kitFinal`.
   */
  pasos?: [string, string, string] | PasoProceso[];
  /** «Lo que vas a tener»: los resultados concretos del proceso. */
  resultadoFinal?: ResultadoFinal[];
  /** «El problema»: 3 errores típicos. */
  problema?: ProblemaItem[];
  /** «Qué necesitas». */
  necesitas?: Necesidad[];
  /** «Tu kit final»: lista marcable de lo que tendrás al terminar. */
  kitFinal?: ItemKit[];
  /** Título propio del bloque de revisión (por defecto «Revisa antes de publicar»). */
  tituloRevision?: string;
  mejoras: MejoraPrompt[];
  ejemplo: EjemploReal;
  /** Los espacios de imagen de la página (ver `EspacioImagen`). `[]` si no lleva imágenes. */
  imagenes: EspacioImagen[];
  checklist: string[];
  porQueFunciona: PorQueFunciona[];
  rubros: RubroEjemplo[];
  errores: ErrorComun[];
  faq: PreguntaFrecuente[];
  /** Rutas «area/slug» de herramientas relacionadas. */
  relacionadas: string[];
  /** Texto largo plegado. Sus imágenes son los espacios con `ubicacion: "metodo-completo"`. */
  metodoCompleto: { titulo: string; parrafos: string[] } | null;
}

export function defineHerramienta<T extends Herramienta>(herramienta: T): T {
  return herramienta;
}

/** Ubicaciones fijas de un espacio de imagen; además valen «paso-N» y «resultado-{id}» (ver `ubicacionesDe`). */
export const UBICACIONES_FIJAS = ["preparacion", "ejemplo", "metodo-completo"] as const;

/** Las ubicaciones de un espacio como lista. */
export const ubicacionesDe = (e: Pick<EspacioImagen, "ubicacion">): string[] => (Array.isArray(e.ubicacion) ? e.ubicacion : [e.ubicacion]);

/** Un espacio de imagen es evidencia del ejemplo si va en la preparación, en un paso, en «ejemplo» o en las páginas simples. */
export const esDelEjemplo = (u: string) => u === "preparacion" || u === "ejemplo" || /^paso-\d+$/.test(u);
