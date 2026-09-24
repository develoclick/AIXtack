/**
 * Registro de autoría. Solo contiene entidades reales: no se inventan autores,
 * perfiles, credenciales ni experiencia. Si en el futuro hay una persona real
 * detrás de una guía y quiere firmarla, se añade aquí con la información que
 * ella misma confirme.
 */
// TODO: bio breve del autor (la escribe el dueño del sitio; no se inventa ni se deduce). Mientras no exista, no se muestra.
export interface Author {
  id: string;
  name: string;
  /** Biografía breve (2–4 líneas), escrita por la propia persona. Sin ella, no se muestra nada. */
  bio?: string;
  /** Tipo schema.org para el JSON-LD. */
  type: "Organization" | "Person";
}

export const authors: readonly Author[] = [
  { id: "nicolas", name: "Nicolas", type: "Person" /* bio: TODO, la escribe Nicolas */ },
  { id: "develoclick", name: "DeveloClick", type: "Organization" },
];

/** Quien prueba y firma las herramientas (persona: Nicolas) y quien edita y publica el sitio (organización: DeveloClick). Todo el sitio lee el nombre de aquí. */
export const AUTOR_POR_DEFECTO = "nicolas";
export const EDITORIAL = "develoclick";

export function getAuthor(id: string): Author | undefined {
  const wanted = id.toLowerCase();
  return authors.find((author) => author.id === wanted || author.name.toLowerCase() === wanted);
}
