import { detectarInventados, type Inventados } from "@/lib/optimizar/verificar";
import { COMPETENCIAS, type Historia, type IdCompetencia } from "./tipos";

export const HISTORIAS_MINIMO = 5;
export const HISTORIAS_MAXIMO = 7;

let contador = 0;
/** Identificador único de una historia (se llama desde eventos, nunca durante el render). */
export function nuevoIdHistoria(): string {
  contador += 1;
  return `h${Date.now().toString(36)}${contador}`;
}

export function historiaVacia(id: string): Historia {
  return { id, titulo: "", competencias: [], situacion: "", tarea: "", accion: "", resultado: "" };
}

const CAMPOS = ["situacion", "tarea", "accion", "resultado"] as const;

/** Una historia está completa si tiene título y las cuatro partes de STAR con algo de contenido. */
export function historiaCompleta(h: Historia): boolean {
  return h.titulo.trim().length > 0 && CAMPOS.every((c) => h[c].trim().length >= 15);
}

export function partesFaltantes(h: Historia): string[] {
  const nombres = { situacion: "Situación", tarea: "Tarea", accion: "Acción", resultado: "Resultado" } as const;
  return CAMPOS.filter((c) => h[c].trim().length < 15).map((c) => nombres[c]);
}

/** El resultado no trae ningún número: conviene preguntarse si hay un dato real que lo respalde (o decir que no lo hay). */
export function resultadoSinDato(h: Historia): boolean {
  return h.resultado.trim().length >= 15 && !/\d/.test(h.resultado);
}

export function textoDeHistoria(h: Historia): string {
  return [h.titulo, h.situacion, h.tarea, h.accion, h.resultado].join("\n");
}

/** Qué competencias cubren tus historias completas y cuáles te faltan. */
export function cobertura(historias: Historia[]): { cubiertas: IdCompetencia[]; faltan: IdCompetencia[] } {
  const usadas = new Set<IdCompetencia>();
  for (const h of historias.filter(historiaCompleta)) for (const c of h.competencias) usadas.add(c);
  return { cubiertas: COMPETENCIAS.filter((c) => usadas.has(c.id)).map((c) => c.id), faltan: COMPETENCIAS.filter((c) => !usadas.has(c.id)).map((c) => c.id) };
}

export const nombreCompetencia = (id: string) => COMPETENCIAS.find((c) => c.id === id)?.nombre ?? id;

/**
 * Detector de contradicciones: números y nombres que aparecen en lo que escribiste (una historia o tus notas de práctica) y NO en tu CV.
 * Un entrevistador compara lo que dices con lo que escribiste: cada uno de estos datos debe coincidir con tu CV o explicarse.
 */
export function contradicciones(fuenteCv: string, texto: string): Inventados {
  return detectarInventados(fuenteCv, texto, ["STAR", "CV"]);
}

/** Todas las historias como texto, listas para pegar en un documento. */
export function historiasATexto(historias: Historia[]): string {
  return historias
    .map((h, i) => [`${i + 1}. ${h.titulo || "(sin título)"}`, `Competencias: ${h.competencias.map(nombreCompetencia).join(", ") || "(ninguna)"}`, `Situación: ${h.situacion}`, `Tarea: ${h.tarea}`, `Acción: ${h.accion}`, `Resultado: ${h.resultado}`].join("\n"))
    .join("\n\n");
}
