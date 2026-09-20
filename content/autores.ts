/**
 * Registro de autoría. Solo contiene entidades reales: no se inventan autores,
 * perfiles, credenciales ni experiencia. Si en el futuro hay una persona real
 * detrás de una guía y quiere firmarla, se añade aquí con la información que
 * ella misma confirme.
 */
export interface Author {
  id: string;
  name: string;
  /** Tipo schema.org para el JSON-LD. */
  type: "Organization" | "Person";
}

export const authors: readonly Author[] = [{ id: "develoclick", name: "DeveloClick", type: "Organization" }];

export function getAuthor(id: string): Author | undefined {
  const wanted = id.toLowerCase();
  return authors.find((author) => author.id === wanted || author.name.toLowerCase() === wanted);
}
