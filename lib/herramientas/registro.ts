/**
 * Registro de herramientas: descubre content/herramientas/{area}/{slug}.ts, importa cada archivo y
 * expone las páginas. Reglas de publicación (estándar 19):
 *  - `publicado: false` → la página existe (con noindex) pero NO aparece en listados, áreas, sitemap ni
 *    «relacionadas»: todos esos usos pasan por `listarPublicadas()` / `obtenerPublicada()`.
 *  - Los archivos que empiezan por «_» son páginas internas de prueba: solo existen con `next dev`.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { categories } from "../../content/categorias";
import type { AreaId, Herramienta } from "./tipos";

const DIRECTORIO = path.join(process.cwd(), "content", "herramientas");
const esProduccion = process.env.NODE_ENV === "production";

export interface HerramientaCargada extends Herramienta {
  /** Solo se ve en desarrollo. */
  interna: boolean;
}

export const rutaHerramienta = (h: Pick<Herramienta["meta"], "area" | "slug">) => `/${h.area}/${h.slug}`;

let cache: Promise<HerramientaCargada[]> | null = null;

async function leerArchivos(): Promise<{ area: AreaId; archivo: string }[]> {
  const entradas: { area: AreaId; archivo: string }[] = [];
  for (const area of categories) {
    let hijos: import("node:fs").Dirent[];
    try {
      hijos = await fs.readdir(path.join(DIRECTORIO, area.slug), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const hijo of hijos) {
      if (!hijo.isFile() || !/\.ts$/.test(hijo.name) || /\.test\.ts$/.test(hijo.name)) continue;
      if (esProduccion && hijo.name.startsWith("_")) continue;
      entradas.push({ area: area.slug, archivo: hijo.name.replace(/\.ts$/, "") });
    }
  }
  return entradas;
}

async function cargar(area: AreaId, archivo: string): Promise<HerramientaCargada> {
  const modulo = await import(`@/content/herramientas/${area}/${archivo}`);
  const datos = modulo.default as Herramienta | undefined;
  if (!datos) throw new Error(`content/herramientas/${area}/${archivo}.ts no exporta «default».`);
  const interna = archivo.startsWith("_");
  const slugEsperado = archivo.replace(/^_/, "");
  if (datos.meta.slug !== slugEsperado || datos.meta.area !== area) {
    throw new Error(`content/herramientas/${area}/${archivo}.ts declara ${datos.meta.area}/${datos.meta.slug}: debe coincidir con su carpeta y su nombre.`);
  }
  return { ...datos, interna };
}

/** Todas las páginas que existen para esta compilación (publicadas o no; sin las internas en producción). */
export function listarTodas(): Promise<HerramientaCargada[]> {
  cache ??= leerArchivos().then(async (archivos) => {
    const paginas = await Promise.all(archivos.map((a) => cargar(a.area, a.archivo)));
    return paginas.sort((a, b) => a.meta.area.localeCompare(b.meta.area) || a.meta.slug.localeCompare(b.meta.slug));
  });
  return cache;
}

/** Solo las publicadas: la única fuente para /herramientas, áreas, sitemap y «relacionadas». */
export async function listarPublicadas(): Promise<HerramientaCargada[]> {
  return (await listarTodas()).filter((h) => h.publicado && !h.interna);
}

export async function publicadasPorArea(area: AreaId): Promise<HerramientaCargada[]> {
  return (await listarPublicadas()).filter((h) => h.meta.area === area);
}

/** Cualquier página existente (para servirla, con noindex si no está publicada). */
export async function obtenerHerramienta(area: string, slug: string): Promise<HerramientaCargada | undefined> {
  return (await listarTodas()).find((h) => h.meta.area === area && h.meta.slug === slug);
}

/** «area/slug» → herramienta, solo si está publicada. */
export async function relacionadasDe(h: Herramienta): Promise<HerramientaCargada[]> {
  const publicadas = await listarPublicadas();
  return h.relacionadas.flatMap((ruta) => {
    const [area, slug] = ruta.split("/");
    const destino = publicadas.find((p) => p.meta.area === area && p.meta.slug === slug);
    return destino ? [destino] : [];
  });
}
