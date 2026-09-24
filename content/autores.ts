/**
 * Registro de autoría. Solo contiene entidades reales: no se inventan autores,
 * perfiles, credenciales ni experiencia. Si en el futuro hay una persona real
 * detrás de una guía y quiere firmarla, se añade aquí con la información que
 * ella misma confirme.
 */
// TODO: bio breve del autor (la escribe el dueño del sitio; no se inventa ni se deduce). Mientras no exista, no se muestra.
// TODO: confirmar el nombre con el que se firma (los estándares dicen «Nino»; se pidió «Nicolas»). Se cambia solo aquí.
export interface Author {
  id: string;
  name: string;
  /** Tipo schema.org para el JSON-LD. */
  type: "Organization" | "Person";
}

export const authors: readonly Author[] = [
  { id: "nicolas", name: "Nicolas", type: "Person" },
  { id: "develoclick", name: "DeveloClick", type: "Organization" },
];

/** Quien prueba y firma las herramientas (persona) y quien edita y publica el sitio (organización). */
export const AUTOR_POR_DEFECTO = "nicolas";
export const EDITORIAL = "develoclick";

export function getAuthor(id: string): Author | undefined {
  const wanted = id.toLowerCase();
  return authors.find((author) => author.id === wanted || author.name.toLowerCase() === wanted);
}
