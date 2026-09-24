/**
 * Registro de autoría. Solo contiene entidades reales: no se inventan autores,
 * perfiles, credenciales ni experiencia. Las biografías las escribe la propia persona.
 */
export interface Author {
  id: string;
  name: string;
  /** Biografía de una línea, escrita por la propia persona: se muestra bajo «Probado por…» y va al JSON-LD (`description`). */
  bioCorta?: string;
  /** Biografía completa, un texto por párrafo: se muestra en «Sobre nosotros». */
  bioLarga?: readonly string[];
  /** País desde el que trabaja la persona. */
  pais?: string;
  /** Tipo schema.org para el JSON-LD. */
  type: "Organization" | "Person";
}

export const authors: readonly Author[] = [
  {
    id: "nicolas",
    name: "Nicolas",
    type: "Person",
    bioCorta: "Nicolas — ingeniero de prompts en Perú. Desde hace dos años ayuda a pequeños negocios a usar la IA y automatizar tareas. Prueba cada prompt antes de publicarlo.",
    bioLarga: [
      "Soy Nicolas y trabajo desde Perú. Me dedico a la ingeniería de prompts y desde hace dos años doy consultoría y apoyo a pequeños negocios para usar la IA y automatizar tareas de su día a día.",
      "Creé Guía Prompts IA para que emprendedores y pequeños negocios puedan aprovechar la IA sin perder tiempo ni saber de tecnología: eliges una tarea, llenas unos datos y obtienes un prompt listo para usar.",
      "Antes de publicar un prompt, lo pruebo varias veces, comparo las respuestas, lo ajusto con distintos cambios y me quedo con la versión que da mejores resultados. Cada herramienta muestra una prueba real y lo que tuve que corregir.",
    ],
    pais: "Perú",
  },
  { id: "develoclick", name: "DeveloClick", type: "Organization" },
];

/** Quien prueba y firma las herramientas (persona: Nicolas) y quien edita y publica el sitio (organización: DeveloClick). Todo el sitio lee el nombre de aquí. */
export const AUTOR_POR_DEFECTO = "nicolas";
export const EDITORIAL = "develoclick";

export function getAuthor(id: string): Author | undefined {
  const wanted = id.toLowerCase();
  return authors.find((author) => author.id === wanted || author.name.toLowerCase() === wanted);
}
