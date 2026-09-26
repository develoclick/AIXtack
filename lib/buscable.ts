import type { ItemBuscable } from "@/components/home/buscador";
import { getCategoria } from "@/content/categorias";
import { prompts, rutaDePrompt } from "@/content/prompts";

/** Lista que alimenta el buscador (portada y categorías): un elemento por prompt publicado. */
export function itemsBuscables(): ItemBuscable[] {
  return prompts.map((p) => ({
    titulo: p.tituloCorto,
    descripcion: p.resumen,
    categoria: getCategoria(p.categoria)?.nombre ?? "",
    ruta: rutaDePrompt(p),
  }));
}
