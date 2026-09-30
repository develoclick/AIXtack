/**
 * Catálogo central: integridad de los datos (6 categorías, 34 herramientas), activación automática de categorías, hub dirigido
 * por datos, sitemap, menú y pie leídos del catálogo, y protección del contenido ya publicado de «Carrera y empleo».
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sitemap from "../app/sitemap";
import { HubCategoria } from "../components/categorias/hub-categoria";
import { ConsentContext, type ConsentContextValue } from "../providers/consent-provider";
import { ALIAS_DE_CATEGORIA, catalogo, categoriaReal, crearCatalogo, type Herramienta, type HerramientaPublicada } from "../content/catalogo";
import { articulos } from "../content/articulos";
import { prompts, RUTA_CV } from "../content/prompts";
import { footerNav, primaryNav } from "./nav-config";
import { siteUrl } from "./site";

const raiz = process.cwd();
const palabras = (t: string) => t.split(/\s+/).filter(Boolean).length;
const sha = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const consent: ConsentContextValue = { ads: "denied", analytics: "denied", decided: true, acceptAll: () => {}, rejectAll: () => {} };

const { categorias, datos } = catalogo;
const CONTEOS: Record<string, number> = { "carrera-y-empleo": 6, "viajes-y-entretenimiento": 5, emprendimiento: 5, "analitica-e-informacion": 5, "finanzas-y-economia": 6, "marketing-y-ventas": 7 };

/** Copia del catálogo con una herramienta pendiente convertida en publicada (para simular la activación de su categoría). */
function conPublicada(slug: string) {
  const herramientas = datos.herramientas.map((h): Herramienta => {
    if (h.slug !== slug || h.estado === "publicada") return h;
    const publicada: HerramientaPublicada = {
      ...h,
      estado: "publicada",
      fechaPublicacion: "2026-10-01",
      fechaActualizacion: "2026-10-02",
      pagina: { h1: `${h.titulo} (H1)`, tituloCorto: h.titulo, metaTitulo: h.titulo.slice(0, 55), descripcion: h.descripcionCorta, tipo: "pagina-propia", tiempo: "5 min", tiempoLectura: "4 min", secciones: [] },
    };
    return publicada;
  });
  return crearCatalogo({ ...datos, herramientas });
}

const hubHtml = (api: ReturnType<typeof crearCatalogo>, slug: string) =>
  renderToStaticMarkup(createElement(ConsentContext.Provider, { value: consent }, createElement(HubCategoria, { categoria: api.getCategoria(slug)!, items: [], catalogo: api })));

test("hay 6 categorías en el orden pedido y 34 herramientas repartidas como se definió", () => {
  assert.deepEqual(categorias.map((c) => c.slug), ["carrera-y-empleo", "viajes-y-entretenimiento", "emprendimiento", "analitica-e-informacion", "finanzas-y-economia", "marketing-y-ventas"]);
  assert.equal(datos.herramientas.length, 34);
  for (const c of categorias) assert.equal(datos.herramientas.filter((h) => h.categoria === c.slug).length, CONTEOS[c.slug], c.slug);
});

test("integridad: slugs únicos, lotes válidos, relacionadas existentes, fechas solo en las publicadas y artículos coherentes", () => {
  const slugs = datos.herramientas.map((h) => h.slug);
  assert.equal(new Set(slugs).size, slugs.length, "slug de herramienta repetido");
  for (const h of datos.herramientas) {
    assert.match(h.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, h.slug);
    assert.ok(categorias.some((c) => c.slug === h.categoria), `${h.slug}: categoría inexistente`);
    assert.ok([1, 2, 3].includes(h.lote), `${h.slug}: lote`);
    assert.ok(h.titulo.length > 10 && h.descripcionCorta.length > 30, `${h.slug}: título o descripción vacíos`);
    assert.ok(h.relacionadas.length >= 2, `${h.slug}: necesita relacionadas`);
    for (const r of h.relacionadas) {
      assert.ok(slugs.includes(r), `${h.slug}: relacionada inexistente «${r}»`);
      assert.notEqual(r, h.slug, `${h.slug}: se relaciona consigo misma`);
    }
    if (h.estado === "publicada") {
      assert.match(h.fechaPublicacion, /^\d{4}-\d{2}-\d{2}$/, h.slug);
      assert.match(h.fechaActualizacion, /^\d{4}-\d{2}-\d{2}$/, h.slug);
      assert.ok(h.fechaActualizacion >= h.fechaPublicacion, h.slug);
      assert.ok(h.pagina.metaTitulo.length <= 60 && h.pagina.descripcion.length <= 155, `${h.slug}: SEO`);
    } else assert.ok(!h.fechaPublicacion && !h.fechaActualizacion, `${h.slug}: una pendiente no lleva fechas`);
  }
  for (const a of datos.articulos) {
    assert.ok(datos.herramientas.some((h) => h.slug === a.herramientaPrincipal && h.categoria === a.categoria), `${a.slug}: herramienta principal`);
    if (a.estado === "publicada") assert.ok(a.metaTitulo.length <= 60 && a.descripcion.length <= 155, `${a.slug}: SEO`);
  }
});

test("las categorías tienen título ≤ 60, meta ≤ 155, un H1, palabra clave y preguntas frecuentes", () => {
  for (const c of categorias) {
    assert.ok(c.seo.title.length <= 60 && c.seo.title.length >= 20, `${c.slug}: título de ${c.seo.title.length}`);
    assert.ok(c.seo.description.length <= 155 && c.seo.description.length >= 100, `${c.slug}: meta de ${c.seo.description.length}`);
    assert.ok(c.h1.length > 10 && c.keywordPrincipal.length > 5, c.slug);
    assert.ok(c.faqs.length >= 3, c.slug);
    assert.equal(c.intro.length >= 2, true, c.slug);
  }
  assert.deepEqual(categorias.map((c) => c.orden), [1, 2, 3, 4, 5, 6]);
});

test("los hubs de las 5 categorías nuevas tienen 700+ palabras útiles, guía de 3–4 secciones y tabla de situaciones", () => {
  for (const c of categorias.filter((x) => x.slug !== "carrera-y-empleo")) {
    const texto = [...c.intro, ...(c.contenido.guia?.secciones.flatMap((s) => [s.titulo, ...s.parrafos]) ?? []), ...c.faqs.flatMap((f) => [f.q, f.a])].join(" ");
    assert.ok(palabras(texto) >= 700, `${c.slug}: ${palabras(texto)} palabras`);
    const n = c.contenido.guia?.secciones.length ?? 0;
    assert.ok(n >= 3 && n <= 4, `${c.slug}: ${n} secciones de guía`);
    assert.ok((c.contenido.situaciones ?? []).length >= 4, `${c.slug}: situaciones`);
    for (const s of c.contenido.situaciones ?? []) assert.ok(datos.herramientas.some((h) => h.slug === s.herramienta && h.categoria === c.slug), `${c.slug}: situación → «${s.herramienta}»`);
    assert.equal(c.contenido.mostrarProximamente ?? false, false, `${c.slug}: «Próximamente» apagado por defecto`);
  }
  const finanzas = catalogo.getCategoria("finanzas-y-economia")!;
  assert.match(finanzas.contenido.aviso ?? "", /orientativa y no sustituye asesoría profesional/);
});

test("«Carrera y empleo» conserva exactamente lo publicado: URL, título, meta, H1 y textos", () => {
  const c = catalogo.getCategoria("carrera-y-empleo")!;
  assert.equal(c.seo.title, "Prompts para carrera y empleo · Guía Prompts IA");
  assert.equal(c.seo.description, "Herramientas y guías para preparar tu hoja de vida y tu búsqueda de empleo: formato ATS, palabras clave, verbos de acción y CV sin experiencia.");
  assert.equal(c.h1, "Prompts para carrera y empleo");
  assert.equal(sha(c.intro), "e1dc27972d885757eb7417cce2efecc5918dcc154a55cd9dd94679a6827307fc");
  assert.equal(sha(c.faqs.map((f) => ({ q: f.q, a: f.a }))), "f68ddfb449cb6dc225b3318d2b6fed419da0bde439fa7e79110030aa1929bf26");
  assert.equal(c.contenido.comoUsar?.pasos.length, 3);
  assert.equal(c.contenido.anuncios, false);
  assert.equal(RUTA_CV, "/carrera-y-empleo/crear-cv-ats-formato-harvard");
  const cv = catalogo.getHerramientaPublicada("carrera-y-empleo", "crear-cv-ats-formato-harvard")!;
  assert.equal(cv.pagina.h1, "Crea tu CV desde cero en formato Harvard y que pase los filtros ATS");
  assert.equal(cv.pagina.metaTitulo, "CV formato Harvard para ATS: crea y descarga en Word");
  assert.equal(cv.pagina.etiquetaBoton, "Abrir");
  assert.deepEqual(articulos.map((a) => a.slug), ["palabras-clave-cv-oferta-laboral", "verbos-de-accion-para-cv", "cv-sin-experiencia"]);
});

const ACTIVAS = ["carrera-y-empleo", "viajes-y-entretenimiento", "emprendimiento"];

test("con el registro actual solo están activas «Carrera y empleo», «Viajes y entretenimiento» y «Emprendimiento»; las otras 3 no existen para el resto del sitio", () => {
  assert.deepEqual(catalogo.categoriasActivas().map((c) => c.slug), ACTIVAS);
  assert.deepEqual(prompts.map((p) => p.slug), ["crear-cv-ats-formato-harvard", "optimizar-cv", "preparar-entrevista-de-trabajo", "analizar-oferta-laboral", "planificar-presupuesto-de-viaje", "crear-itinerario-de-viaje", "crear-plan-de-negocio", "calcular-rentabilidad-de-mi-negocio", "calcular-salario-y-negociar-oferta", "crear-plan-de-busqueda-de-empleo", "encontrar-fechas-mas-baratas-para-volar", "descubrir-destinos-segun-presupuesto", "crear-logo-profesional-para-mi-empresa", "identificar-nichos-de-mercado", "crear-catalogo-de-productos", "comparar-opciones-de-viaje"]);
  for (const c of categorias.filter((x) => !ACTIVAS.includes(x.slug))) {
    assert.equal(catalogo.categoriaActiva(c.slug), false, c.slug);
    assert.equal(catalogo.getCategoriaActiva(c.slug), undefined, c.slug);
    assert.equal(catalogo.herramientasPublicadas(c.slug).length, 0, c.slug);
  }
  // Menú y pie
  const hrefs = [...primaryNav, ...footerNav.flatMap((g) => g.links)].map((l) => l.href);
  for (const c of categorias.filter((x) => !ACTIVAS.includes(x.slug))) assert.ok(!hrefs.includes(`/${c.slug}`), `${c.slug} en menú o pie`);
  for (const a of ACTIVAS) assert.ok(hrefs.includes(`/${a}`), `${a} falta en el menú o el pie`);
  // Sitemap
  const urls = sitemap().map((e) => e.url.replace(siteUrl, ""));
  assert.ok(urls.includes("/carrera-y-empleo") && urls.includes(RUTA_CV) && urls.includes("/viajes-y-entretenimiento") && urls.includes("/viajes-y-entretenimiento/planificar-presupuesto-de-viaje"));
  for (const h of datos.herramientas.filter((x) => x.estado === "pendiente")) assert.ok(!urls.includes(`/${h.categoria}/${h.slug}`), `sitemap lista la pendiente ${h.slug}`);
  for (const c of categorias.filter((x) => !ACTIVAS.includes(x.slug))) assert.ok(!urls.includes(`/${c.slug}`), `sitemap lista ${c.slug}`);
  assert.equal(new Set(urls).size, urls.length);
});

test("ninguna herramienta pendiente aparece en el buscador, el hub de Carrera ni los enlaces relacionados", async () => {
  const { itemsBuscables } = await import("./buscable");
  const rutas = new Set(itemsBuscables().map((i) => i.ruta));
  const html = hubHtml(catalogo, "carrera-y-empleo");
  for (const h of datos.herramientas.filter((x) => x.estado === "pendiente")) {
    assert.ok(!rutas.has(`/${h.categoria}/${h.slug}`), `buscador: ${h.slug}`);
    assert.ok(!html.includes(`/${h.categoria}/${h.slug}`), `hub: enlace a ${h.slug}`);
    assert.ok(!html.includes(h.titulo), `hub: muestra el título de la pendiente ${h.slug}`);
  }
  const cv = catalogo.getHerramienta("carrera-y-empleo", "crear-cv-ats-formato-harvard")!;
  assert.deepEqual(catalogo.relacionadasPublicadas(cv).map((h) => h.slug), ["optimizar-cv", "analizar-oferta-laboral", "preparar-entrevista-de-trabajo"], "solo se muestran sus relacionadas ya publicadas");
  assert.ok(!html.includes("Próximamente"));
});

test("ACTIVACIÓN AUTOMÁTICA: publicar una herramienta de Finanzas activa su categoría en menú, pie, portada, hub, sitemap y buscador; al volver a «pendiente» desaparece", () => {
  const api = conPublicada("calcular-interes-compuesto");
  assert.deepEqual(api.categoriasActivas().map((c) => c.slug).sort(), [...ACTIVAS, "finanzas-y-economia"].sort());
  assert.equal(api.getCategoriaActiva("finanzas-y-economia")?.nombre, "Finanzas y economía");
  assert.deepEqual(api.herramientasPublicadas("finanzas-y-economia").map((h) => h.slug), ["calcular-interes-compuesto"]);
  const html = hubHtml(api, "finanzas-y-economia");
  assert.match(html, /<h1[^>]*>Calculadoras y herramientas de finanzas con IA<\/h1>/);
  assert.ok(html.includes("/finanzas-y-economia/calcular-interes-compuesto"), "tarjeta con enlace a la herramienta publicada");
  assert.ok(html.includes("Usar herramienta"), "botón por defecto");
  assert.ok(html.includes("La información es orientativa y no sustituye asesoría profesional."));
  assert.ok(html.includes("Guía breve: usar la IA con tu dinero sin equivocarte"));
  assert.ok(html.includes("Preguntas frecuentes") && html.includes('"@type":"CollectionPage"') && html.includes('"@type":"ItemList"') && html.includes('"@type":"FAQPage"'));
  assert.ok(html.includes("/carrera-y-empleo") && html.includes("Otras categorías"), "enlaza a las otras categorías activas");
  assert.ok(!html.includes("¿Qué herramienta necesito?"), "la tabla de situaciones necesita al menos 2 herramientas publicadas");
  // Ninguna pendiente de Finanzas se enlaza ni se nombra.
  for (const h of api.herramientasPendientes("finanzas-y-economia")) assert.ok(!html.includes(`/${h.categoria}/${h.slug}`) && !html.includes(h.titulo), h.slug);
  // Con una segunda herramienta publicada aparece la tabla «¿Qué herramienta necesito?».
  const dos = crearCatalogo({ ...api.datos, herramientas: conPublicada("calcular-precio-de-venta").datos.herramientas.map((h) => (h.slug === "calcular-interes-compuesto" ? api.datos.herramientas.find((x) => x.slug === h.slug)! : h)) });
  assert.deepEqual(dos.herramientasPublicadas("finanzas-y-economia").map((h) => h.slug).sort(), ["calcular-interes-compuesto", "calcular-precio-de-venta"]);
  assert.ok(hubHtml(dos, "finanzas-y-economia").includes("¿Qué herramienta necesito?"));
  // Artículos: un artículo publicado de una categoría inactiva NO es visible; en una activa sí.
  const conArticulo = crearCatalogo({ ...datos, articulos: [...datos.articulos, { slug: "prueba", categoria: "finanzas-y-economia", titulo: "Prueba", estado: "publicada", herramientaPrincipal: "calcular-interes-compuesto", metaTitulo: "Prueba", descripcion: "d", resumen: "r", cta: "c", fechaPublicacion: "2026-10-01", fechaActualizacion: "2026-10-01", tiempoLectura: "1 min", secciones: [] }] });
  assert.equal(conArticulo.articulosPublicados("finanzas-y-economia").length, 0, "categoría inactiva: artículo oculto");
  // Volver a «pendiente»: el catálogo real no cambió y la categoría sigue oculta.
  assert.equal(catalogo.categoriaActiva("finanzas-y-economia"), false);
  assert.deepEqual(catalogo.categoriasActivas().map((c) => c.slug), ACTIVAS);
});

test("cada categoría se activa sola con cualquiera de sus herramientas y no arrastra a las demás", () => {
  for (const h of datos.herramientas.filter((x) => x.estado === "pendiente")) {
    const api = conPublicada(h.slug);
    assert.ok(api.categoriaActiva(h.categoria), h.slug);
    assert.deepEqual(api.categoriasActivas().map((c) => c.slug).sort(), [...new Set([...ACTIVAS, h.categoria])].sort(), h.slug);
    assert.ok(hubHtml(api, h.categoria).includes(`/${h.categoria}/${h.slug}`), `${h.slug}: el hub no muestra su tarjeta`);
  }
});

test("las relacionadas solo muestran herramientas publicadas", () => {
  const slugs = (api: typeof catalogo, categoria: string, slug: string) => api.relacionadasPublicadas(api.getHerramienta(categoria, slug)!).map((h) => h.slug).sort();
  // Registro real: solo las publicadas; las pendientes (por ejemplo, el presupuesto personal) no aparecen.
  assert.deepEqual(slugs(catalogo, "carrera-y-empleo", "analizar-oferta-laboral"), ["crear-cv-ats-formato-harvard", "crear-plan-de-busqueda-de-empleo", "optimizar-cv", "preparar-entrevista-de-trabajo"]);
  assert.deepEqual(slugs(catalogo, "carrera-y-empleo", "preparar-entrevista-de-trabajo"), ["analizar-oferta-laboral", "calcular-salario-y-negociar-oferta", "crear-cv-ats-formato-harvard", "optimizar-cv"]);
  // «Evaluar oferta y negociar salario» enlaza a una pendiente (presupuesto personal): no se muestra.
  assert.deepEqual(slugs(catalogo, "carrera-y-empleo", "calcular-salario-y-negociar-oferta"), ["analizar-oferta-laboral", "crear-plan-de-busqueda-de-empleo", "preparar-entrevista-de-trabajo"]);
  assert.deepEqual(slugs(catalogo, "carrera-y-empleo", "crear-cv-ats-formato-harvard"), ["analizar-oferta-laboral", "optimizar-cv", "preparar-entrevista-de-trabajo"]);
  // Al publicar una pendiente relacionada, aparece sola.
  const api = conPublicada("crear-presupuesto-personal");
  assert.deepEqual(slugs(api, "carrera-y-empleo", "calcular-salario-y-negociar-oferta"), ["analizar-oferta-laboral", "crear-plan-de-busqueda-de-empleo", "crear-presupuesto-personal", "preparar-entrevista-de-trabajo"]);
});

test("el alias de las rutas de trabajo «empleabilidad-y-trabajo» apunta a «carrera-y-empleo»", () => {
  assert.deepEqual(ALIAS_DE_CATEGORIA, { "empleabilidad-y-trabajo": "carrera-y-empleo" });
  assert.equal(categoriaReal("empleabilidad-y-trabajo"), "carrera-y-empleo");
  assert.equal(categoriaReal("finanzas-y-economia"), "finanzas-y-economia");
});

test("toda página de herramienta con carpeta propia usa exigirPublicada y muestra las relacionadas; el menú y el sitemap no llevan listas a mano", () => {
  const base = path.join(raiz, "app", "(site)");
  for (const c of categorias) {
    const dir = path.join(base, c.slug);
    if (!fs.existsSync(dir)) continue;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const pagina = path.join(dir, e.name, "page.tsx");
      if (!e.isDirectory() || !fs.existsSync(pagina)) continue;
      const t = fs.readFileSync(pagina, "utf8");
      assert.match(t, /exigirPublicada\(/, `${c.slug}/${e.name}: falta exigirPublicada (404 mientras esté pendiente)`);
      // El bloque puede estar en la propia página o en un componente que ella importa.
      const importados = [...t.matchAll(/from "@\/(components\/[^"]+)"/g)].map((m) => path.join(raiz, `${m[1]}.tsx`)).filter((f) => fs.existsSync(f));
      assert.ok(/HerramientasRelacionadas/.test(t) || importados.some((f) => /HerramientasRelacionadas/.test(fs.readFileSync(f, "utf8"))), `${c.slug}/${e.name}: falta el bloque de herramientas relacionadas`);
    }
  }
  const leer = (...p: string[]) => fs.readFileSync(path.join(raiz, ...p), "utf8");
  for (const f of [["lib", "nav-config.ts"], ["app", "sitemap.ts"], ["components", "home", "sidebar-categorias.tsx"]]) {
    const t = leer(...f);
    assert.match(t, /categoriasActivas|herramientasPublicadas/, f.join("/"));
    for (const c of categorias) assert.ok(!t.includes(`"/${c.slug}"`) && !t.includes(`"${c.slug}"`), `${f.join("/")}: slug escrito a mano (${c.slug})`);
  }
});
