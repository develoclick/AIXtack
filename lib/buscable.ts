import type { ItemBuscable } from "@/components/home/buscador";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { getCategoria } from "@/content/categorias";
import { prompts, rutaDePrompt } from "@/content/prompts";

/** Lista que alimenta el buscador (portada y categorías): las herramientas y los artículos publicados. */
export function itemsBuscables(): ItemBuscable[] {
  return [
    ...prompts.map((p) => ({ titulo: p.tituloCorto, descripcion: p.resumen, categoria: getCategoria(p.categoria)?.nombre ?? "", ruta: rutaDePrompt(p) })),
    ...articulos.map((a) => ({ titulo: a.metaTitulo, descripcion: a.resumen, categoria: getCategoria(a.categoria)?.nombre ?? "", ruta: rutaDeArticulo(a) })),
  ];
}
