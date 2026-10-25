/**
 * Registro de autoría. Solo contiene entidades reales: no se inventan autores,
 * perfiles, credenciales ni experiencia. Las biografías las escribe la propia persona.
 */
export interface Author {
  id: string;
  name: string;
  /** Biografía de una línea, escrita por la propia persona: va al JSON-LD (`description`). */
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
    bioCorta: "Nicolas — ingeniero de prompts en Perú. Desde hace dos años ayuda a pequeños negocios a usar la IA y automatizar tareas.",
    bioLarga: [
      "Soy Nicolas y trabajo desde Perú. Me dedico a la ingeniería de prompts y desde hace dos años doy consultoría y apoyo a pequeños negocios para usar la IA y automatizar tareas de su día a día.",
      "Creé Guía Prompts IA para que cualquier persona pueda aprovechar la IA sin perder tiempo ni saber de tecnología: eliges una tarea, llenas unos datos y obtienes un prompt listo para usar.",
      "Diseño cada herramienta con una regla: la página hace los cálculos y la IA solo interpreta o redacta. Los números salen de fórmulas que se comprueban con pruebas automáticas, y el resultado de la IA siempre debe revisarse antes de usarlo.",
    ],
    pais: "Perú",
  },
  { id: "develoclick", name: "DeveloClick", type: "Organization" },
];

/**
 * Nicolas: persona natural, con domicilio en Perú; escribe el sitio y es el responsable editorial y legal del sitio.
 * DeveloClick: nombre del proyecto (NO una empresa registrada); es el `publisher` del JSON-LD. Todo el sitio lee los nombres de aquí.
 */
export const AUTOR_POR_DEFECTO = "nicolas";
export const EDITORIAL = "develoclick";

export function getAuthor(id: string): Author | undefined {
  const wanted = id.toLowerCase();
  return authors.find((author) => author.id === wanted || author.name.toLowerCase() === wanted);
}
