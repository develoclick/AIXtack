/** Datos y catálogos de «Crear un logo profesional para tu empresa con IA». El cálculo, el prompt y el lector viven en los archivos hermanos. */
export type Estilo = "moderno" | "elegante" | "minimalista" | "tecnologico" | "artesanal" | "corporativo";
export const ESTILOS: { valor: Estilo; etiqueta: string }[] = [
  { valor: "moderno", etiqueta: "Moderno" },
  { valor: "elegante", etiqueta: "Elegante" },
  { valor: "minimalista", etiqueta: "Minimalista" },
  { valor: "tecnologico", etiqueta: "Tecnológico" },
  { valor: "artesanal", etiqueta: "Artesanal" },
  { valor: "corporativo", etiqueta: "Corporativo" },
];

export type Uso = "redes" | "web" | "empaque" | "fachada" | "uniformes" | "impresion";
export const USOS: { valor: Uso; etiqueta: string }[] = [
  { valor: "redes", etiqueta: "Redes sociales" },
  { valor: "web", etiqueta: "Sitio web" },
  { valor: "empaque", etiqueta: "Empaque" },
  { valor: "fachada", etiqueta: "Fachada" },
  { valor: "uniformes", etiqueta: "Uniformes" },
  { valor: "impresion", etiqueta: "Impresión (tarjetas, volantes)" },
];

/** Los tres deslizadores de personalidad de marca, de 0 (extremo izquierdo) a 100 (extremo derecho). */
export interface Personalidad {
  clasicoModerno: number;
  serioCercano: number;
  lujoAccesible: number;
}

export const DESLIZADORES: { clave: keyof Personalidad; izquierda: string; derecha: string }[] = [
  { clave: "clasicoModerno", izquierda: "Clásico", derecha: "Moderno" },
  { clave: "serioCercano", izquierda: "Serio", derecha: "Cercano" },
  { clave: "lujoAccesible", izquierda: "Lujo", derecha: "Accesible" },
];

export interface DatosLogo {
  nombreEmpresa: string;
  eslogan: string;
  rubro: string;
  oferta: string;
  publico: string;
  personalidad: Personalidad;
  adjetivos: string;
  coloresPreferidos: string;
  coloresEvitar: string;
  referencias: string;
  estilo: Estilo;
  simbolos: string;
  usos: Uso[];
  competencia: string;
  generador: string;
}

export function datosVaciosLogo(): DatosLogo {
  return {
    nombreEmpresa: "",
    eslogan: "",
    rubro: "",
    oferta: "",
    publico: "",
    personalidad: { clasicoModerno: 50, serioCercano: 50, lujoAccesible: 50 },
    adjetivos: "",
    coloresPreferidos: "",
    coloresEvitar: "",
    referencias: "",
    estilo: "moderno",
    simbolos: "",
    usos: [],
    competencia: "",
    generador: "",
  };
}

/** Un concepto de logo (la respuesta trae 3). */
export interface Concepto {
  nombre: string;
  idea: string;
  tipo: string;
  composicion: string;
  justificacion: string;
}

/** Un color de la paleta, tal como lo lee la página (el contraste lo calcula ella, nunca la IA). */
export interface ColorPaleta {
  nombre: string;
  hex: string;
  rgb: string;
  uso: string;
}

export interface Tipografia {
  nombre: string;
  alternativaGoogleFonts: string;
  uso: string;
  licencia: string;
}

/** El prompt de imagen (en inglés y español) de una variante del logo. */
export interface PromptVariante {
  variante: string;
  en: string;
  es: string;
}

export type ClaveRespuesta = "brief" | "conceptos" | "especificaciones" | "variantes" | "prompts" | "aplicaciones" | "revision" | "verificar" | "siguiente";

export const TITULOS_RESPUESTA: { clave: ClaveRespuesta; titulo: string }[] = [
  { clave: "brief", titulo: "Brief" },
  { clave: "conceptos", titulo: "Conceptos" },
  { clave: "especificaciones", titulo: "Especificaciones" },
  { clave: "variantes", titulo: "Variantes" },
  { clave: "prompts", titulo: "Prompts de imagen" },
  { clave: "aplicaciones", titulo: "Aplicaciones" },
  { clave: "revision", titulo: "Revisión y riesgos" },
  { clave: "verificar", titulo: "Qué debes verificar" },
  { clave: "siguiente", titulo: "Siguiente paso" },
];

/** Tamaños del favicon y el avatar que genera el laboratorio del logo (en píxeles). */
export const TAMANOS_FAVICON = [16, 32, 180, 512] as const;
