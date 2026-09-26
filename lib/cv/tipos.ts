/** Datos que escribe la persona en el formulario del generador de hoja de vida. */
export type IdiomaCv = "es" | "en";
export type NivelCv = "sin-experiencia" | "junior" | "semi-senior" | "senior";

export interface ExperienciaCv {
  id: string;
  cargo: string;
  empresa: string;
  lugar: string;
  inicio: string;
  fin: string;
  /** Lo que hizo y logró, una idea por línea (en sus propias palabras). */
  logros: string;
}

export interface EstudioCv {
  id: string;
  titulo: string;
  institucion: string;
  lugar: string;
  inicio: string;
  fin: string;
  /** Promedio, honores, tesis, cursos relevantes… (opcional). */
  detalle: string;
}

export interface DatosCv {
  idioma: IdiomaCv;
  nivel: NivelCv;
  puesto: string;
  oferta: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  linkedin: string;
  web: string;
  /** Fortalezas o resumen que la persona quiere destacar (opcional). */
  resumen: string;
  experiencias: ExperienciaCv[];
  estudios: EstudioCv[];
  habilidades: string;
  idiomas: string;
  certificaciones: string;
  proyectos: string;
}

export const MAX_EXPERIENCIAS = 6;
export const MAX_ESTUDIOS = 4;

export const NIVELES: { valor: NivelCv; etiqueta: string; ayuda: string }[] = [
  { valor: "sin-experiencia", etiqueta: "Sin experiencia laboral (estudiante o recién egresado)", ayuda: "La educación va primero." },
  { valor: "junior", etiqueta: "Junior (hasta 2 años)", ayuda: "La educación va primero." },
  { valor: "semi-senior", etiqueta: "Semi senior (2 a 6 años)", ayuda: "La experiencia va primero." },
  { valor: "senior", etiqueta: "Senior (más de 6 años)", ayuda: "La experiencia va primero." },
];

let contador = 0;
/** Identificador nuevo para una fila repetible (solo se llama desde eventos del usuario, nunca al renderizar). */
export function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}-${Date.now().toString(36)}-${contador}`;
}

export function experienciaVacia(id: string): ExperienciaCv {
  return { id, cargo: "", empresa: "", lugar: "", inicio: "", fin: "", logros: "" };
}

export function estudioVacio(id: string): EstudioCv {
  return { id, titulo: "", institucion: "", lugar: "", inicio: "", fin: "", detalle: "" };
}

export function datosVacios(): DatosCv {
  return {
    idioma: "es",
    nivel: "junior",
    puesto: "",
    oferta: "",
    nombre: "",
    email: "",
    telefono: "",
    ciudad: "",
    linkedin: "",
    web: "",
    resumen: "",
    experiencias: [experienciaVacia("exp-1")],
    estudios: [estudioVacio("est-1")],
    habilidades: "",
    idiomas: "",
    certificaciones: "",
    proyectos: "",
  };
}

/** Hoja de vida ya redactada: es lo que se muestra en pantalla y lo que se convierte en Word. */
export interface CvEntrada {
  izq1: string;
  der1: string;
  izq2: string;
  der2: string;
  puntos: string[];
}

export interface CvSeccion {
  titulo: string;
  parrafos: string[];
  entradas: CvEntrada[];
  puntos: string[];
}

export interface CvDocumento {
  nombre: string;
  contacto: string[];
  secciones: CvSeccion[];
}
