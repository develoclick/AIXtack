/**
 * CATÁLOGO CENTRAL de guiapromptsia.com: categorías, herramientas y artículos en un solo sitio.
 *
 * ┌─ CÓMO AGREGAR UNA HERRAMIENTA (para quien sea que genere una página nueva; guía completa en
 * │  docs/COMO-AGREGAR-UNA-HERRAMIENTA.md) ────────────────────────────────────────────────────────────────────────────
 * │ 1) Busca la herramienta en content/catalogo/herramientas.ts. Si la ruta de trabajo empieza por «empleabilidad-y-trabajo»,
 * │    su categoría es «carrera-y-empleo» (la URL pública es /carrera-y-empleo/…).
 * │ 2) La categoría YA EXISTE: no crees otro hub y no edites a mano el menú, el pie, la portada ni el sitemap.
 * │ 3) Crea la página de la herramienta (app/(site)/{categoria}/{slug}/page.tsx) y empieza con exigirPublicada(...).
 * │ 4) Al terminar, cambia su estado a "publicada" y rellena fechaPublicacion, fechaActualizacion y `pagina`. Si era la primera
 * │    de su categoría, la categoría se activa sola y aparecen automáticamente el menú, el pie, la portada, el hub, el
 * │    sitemap, el buscador y los enlaces de «Herramientas relacionadas».
 * │ 5) Si la herramienta no está en el registro, añádela con todos sus campos.
 * └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * REGLA DE ACTIVACIÓN: una categoría está activa si y solo si tiene al menos una herramienta «publicada». Mientras no la
 * tenga: no sale en el menú, el pie, la portada ni el sitemap, su URL responde 404 y ninguna página enlaza a ella. Un artículo
 * solo es visible si está «publicada» Y su categoría está activa. Todo esto son funciones derivadas (nada se guarda a mano).
 */
import { ARTICULOS } from "./articulos";
import { CATEGORIAS } from "./categorias";
import { HERRAMIENTAS } from "./herramientas";
import type { Articulo, ArticuloPublicado, Categoria, DatosCatalogo, Herramienta, HerramientaPendiente, HerramientaPublicada } from "./tipos";

export type * from "./tipos";

/** Las rutas de trabajo «empleabilidad-y-trabajo/…» se publican en «/carrera-y-empleo/…». */
export const ALIAS_DE_CATEGORIA: Record<string, string> = { "empleabilidad-y-trabajo": "carrera-y-empleo" };

export function categoriaReal(slug: string): string {
  return ALIAS_DE_CATEGORIA[slug] ?? slug;
}

/**
 * Crea la API de consulta sobre unos datos. La web usa la instancia de abajo (`catalogo`); las pruebas la crean con datos
 * modificados para comprobar la activación automática sin tocar el registro real.
 */
export function crearCatalogo(datos: DatosCatalogo) {
  const orden = (a: Herramienta, b: Herramienta) => a.lote - b.lote || datos.herramientas.indexOf(a) - datos.herramientas.indexOf(b);

  const categorias = datos.categorias.slice().sort((a, b) => a.orden - b.orden);

  const publicadas = (categoria?: string): HerramientaPublicada[] =>
    datos.herramientas.filter((h): h is HerramientaPublicada => h.estado === "publicada" && (!categoria || h.categoria === categoria)).sort(orden);

  const categoriaActiva = (slug: string): boolean => publicadas(slug).length > 0;
  const categoriasActivas = (): Categoria[] => categorias.filter((c) => categoriaActiva(c.slug));

  const api = {
    datos,
    categorias,
    getCategoria: (slug: string): Categoria | undefined => categorias.find((c) => c.slug === slug),
    /** La categoría solo si está activa (si no, la página debe responder 404). */
    getCategoriaActiva: (slug: string): Categoria | undefined => {
      const c = categorias.find((x) => x.slug === slug);
      return c && categoriaActiva(slug) ? c : undefined;
    },
    categoriaActiva,
    categoriasActivas,

    herramientasPublicadas: publicadas,
    herramientasPendientes: (categoria: string): HerramientaPendiente[] => datos.herramientas.filter((h): h is HerramientaPendiente => h.estado === "pendiente" && h.categoria === categoria).sort(orden),
    getHerramienta: (categoria: string, slug: string): Herramienta | undefined => datos.herramientas.find((h) => h.categoria === categoria && h.slug === slug),
    getHerramientaPublicada: (categoria: string, slug: string): HerramientaPublicada | undefined => publicadas(categoria).find((h) => h.slug === slug),
    /** Herramientas relacionadas que YA están publicadas (una pendiente simplemente no se muestra). */
    relacionadasPublicadas: (h: Herramienta): HerramientaPublicada[] =>
      h.relacionadas.map((slug) => publicadas().find((x) => x.slug === slug)).filter((x): x is HerramientaPublicada => Boolean(x) && x!.slug !== h.slug),

    articulosPublicados: (categoria?: string): ArticuloPublicado[] =>
      datos.articulos.filter((a): a is ArticuloPublicado => a.estado === "publicada" && categoriaActiva(a.categoria) && (!categoria || a.categoria === categoria)),
    getArticuloPublicado: (categoria: string, slug: string): ArticuloPublicado | undefined =>
      datos.articulos.find((a): a is ArticuloPublicado => a.estado === "publicada" && categoriaActiva(a.categoria) && a.categoria === categoria && a.slug === slug),
    articulosTodos: (): Articulo[] => datos.articulos,

    rutaCategoria: (c: Pick<Categoria, "slug">) => `/${c.slug}`,
    rutaHerramienta: (h: Pick<Herramienta, "categoria" | "slug">) => `/${h.categoria}/${h.slug}`,
    rutaArticulo: (a: Pick<Articulo, "categoria" | "slug">) => `/${a.categoria}/${a.slug}`,
  };
  return api;
}

export type Catalogo = ReturnType<typeof crearCatalogo>;

export const catalogo: Catalogo = crearCatalogo({ categorias: CATEGORIAS, herramientas: HERRAMIENTAS, articulos: ARTICULOS });

export const {
  categorias,
  getCategoria,
  getCategoriaActiva,
  categoriaActiva,
  categoriasActivas,
  herramientasPublicadas,
  herramientasPendientes,
  getHerramienta,
  getHerramientaPublicada,
  relacionadasPublicadas,
  articulosPublicados,
  getArticuloPublicado,
  rutaCategoria,
  rutaHerramienta,
  rutaArticulo,
} = catalogo;
