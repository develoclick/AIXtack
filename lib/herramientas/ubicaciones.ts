/**
 * Dónde va cada imagen (lógica pura, sin fs): agrupa los espacios de imagen por ubicación para el bloque del ejemplo, para las
 * tarjetas de «Lo que vas a tener» y para el método completo.
 */
import type { ImagenResuelta } from "./imagenes";
import { esDelEjemplo, ubicacionesDe } from "./tipos";

export interface GrupoDeImagenes {
  /** «preparacion», «paso-N» o «ejemplo». */
  clave: string;
  /** Encabezado del grupo («Preparación», «Paso 2 · El texto de tu afiche»); vacío para «ejemplo». */
  titulo: string;
  imagenes: ImagenResuelta[];
}

/** Los espacios que van en una ubicación concreta, en el orden de los datos. */
export const imagenesEn = (imagenes: readonly ImagenResuelta[], ubicacion: string) => imagenes.filter((i) => ubicacionesDe(i.espacio).includes(ubicacion));

const numeroDePaso = (clave: string) => Number(clave.replace("paso-", ""));

export function tituloDeUbicacion(clave: string, pasos: readonly { numero: number; titulo: string }[] = []): string {
  if (clave === "preparacion") return "Preparación";
  if (clave === "ejemplo") return "";
  if (/^paso-\d+$/.test(clave)) {
    const p = pasos.find((x) => x.numero === numeroDePaso(clave));
    return p ? `Paso ${p.numero} · ${p.titulo}` : `Paso ${numeroDePaso(clave)}`;
  }
  return clave;
}

/** Los grupos del bloque del ejemplo: primero la preparación, luego cada paso en orden y al final lo que va en «ejemplo». */
export function gruposDelEjemplo(imagenes: readonly ImagenResuelta[], pasos: readonly { numero: number; titulo: string }[] = []): GrupoDeImagenes[] {
  const claves = new Set<string>();
  for (const i of imagenes) for (const u of ubicacionesDe(i.espacio)) if (esDelEjemplo(u)) claves.add(u);
  const orden = (c: string) => (c === "preparacion" ? -1 : c === "ejemplo" ? 1000 : numeroDePaso(c));
  return [...claves]
    .sort((a, b) => orden(a) - orden(b))
    .map((clave) => ({ clave, titulo: tituloDeUbicacion(clave, pasos), imagenes: imagenesEn(imagenes, clave) }));
}

/** Las ubicaciones válidas para una página: las fijas, un «paso-N» por cada paso y un «resultado-{id}» por cada tarjeta. */
export function ubicacionesValidas(pasos: readonly { numero: number }[], resultados: readonly { id: string }[]): Set<string> {
  return new Set(["preparacion", "ejemplo", "metodo-completo", ...pasos.map((p) => `paso-${p.numero}`), ...resultados.map((r) => `resultado-${r.id}`)]);
}
