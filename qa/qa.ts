/**
 * Pruebas de navegador del sitio (Playwright + Chrome) contra un servidor ya en marcha:
 *   npm run build && npx next start -p 3100   (en otra terminal)
 *   npm run qa -- http://localhost:3100 [--capturas ruta/de/salida]
 * A 375 y a 1280 px comprueba: páginas 200 y rutas cerradas 404, sin scroll horizontal, botones y campos de 44 px, etiquetas,
 * título y descripción, JSON-LD, ausencia de anuncios en páginas sin contenido, buscador, cambio de tema y el generador de
 * hoja de vida de punta a punta (ejemplos, deshacer, texto copiado con el mouse, descarga del Word y su contenido, eventos).
 */
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { chromium, type Browser, type Page } from "playwright-core";
import { EJEMPLOS_CV } from "../content/ejemplos/cv-harvard";
import { EJEMPLOS_OPTIMIZAR } from "../content/ejemplos/optimizar-cv";
import { EJEMPLOS_ANALISIS } from "../content/ejemplos/analisis-oferta";
import { EJEMPLOS_ENTREVISTA } from "../content/ejemplos/entrevista";
import { EJEMPLOS_PRESUPUESTO } from "../content/ejemplos/presupuesto-viaje";
import { EJEMPLOS_SALARIO } from "../content/ejemplos/salario";
import { EJEMPLOS_PLAN } from "../content/ejemplos/plan-busqueda";
import { EJEMPLOS_ITINERARIO } from "../content/ejemplos/itinerario";
import { EJEMPLOS_FECHAS } from "../content/ejemplos/fechas";
import { EJEMPLOS_COMPARAR } from "../content/ejemplos/comparar";
import { EJEMPLOS_DESTINOS } from "../content/ejemplos/destinos";
import { EJEMPLOS_LOGO } from "../content/ejemplos/logo";
import { EJEMPLOS_PLAN_NEGOCIO } from "../content/ejemplos/plan-negocio";
import { EJEMPLOS_RENTABILIDAD } from "../content/ejemplos/rentabilidad";
import { EJEMPLOS_NICHOS } from "../content/ejemplos/nichos";
import { EJEMPLOS_CATALOGO } from "../content/ejemplos/catalogo-productos";

const base = (process.argv.find((a) => /^https?:/.test(a)) ?? "http://localhost:3100").replace(/\/$/, "");
const iCap = process.argv.indexOf("--capturas");
const carpetaCapturas = iCap > -1 ? process.argv[iCap + 1] : null;

const RUTA_CV = "/carrera-y-empleo/crear-cv-ats-formato-harvard";
const RUTA_OPT = "/carrera-y-empleo/optimizar-cv";
const RUTA_SAL = "/carrera-y-empleo/calcular-salario-y-negociar-oferta";
const RUTA_PLAN = "/carrera-y-empleo/crear-plan-de-busqueda-de-empleo";
const RUTA_ANA = "/carrera-y-empleo/analizar-oferta-laboral";
const RUTA_ENT = "/carrera-y-empleo/preparar-entrevista-de-trabajo";
const RUTA_PRES = "/viajes-y-entretenimiento/planificar-presupuesto-de-viaje";
const RUTA_ITIN = "/viajes-y-entretenimiento/crear-itinerario-de-viaje";
const RUTA_FECHAS = "/viajes-y-entretenimiento/encontrar-fechas-mas-baratas-para-volar";
const RUTA_CMP = "/viajes-y-entretenimiento/comparar-opciones-de-viaje";
const RUTA_DEST = "/viajes-y-entretenimiento/descubrir-destinos-segun-presupuesto";
const RUTA_LOGO = "/emprendimiento/crear-logo-profesional-para-mi-empresa";
const RUTA_PLANNEG = "/emprendimiento/crear-plan-de-negocio";
const RUTA_RENTAB = "/emprendimiento/calcular-rentabilidad-de-mi-negocio";
const RUTA_NICHOS = "/emprendimiento/identificar-nichos-de-mercado";
const RUTA_CATALOGO = "/emprendimiento/crear-catalogo-de-productos";
/** Categorías sin ninguna herramienta publicada: su URL debe responder 404 y no aparecer en ningún sitio. */
const CERRADAS = ["/analitica-e-informacion", "/finanzas-y-economia", "/marketing-y-ventas"];
/** Herramientas pendientes: 404 y sin enlaces. */
const PENDIENTES = ["/finanzas-y-economia/crear-presupuesto-personal", "/finanzas-y-economia/calcular-interes-compuesto", "/marketing-y-ventas/crear-plan-de-marketing", "/analitica-e-informacion/limpiar-datos"];
const ARTICULOS = ["/carrera-y-empleo/palabras-clave-cv-oferta-laboral", "/carrera-y-empleo/verbos-de-accion-para-cv", "/carrera-y-empleo/cv-sin-experiencia"];
const VIEWPORTS = [
  { nombre: "375", width: 375, height: 800 },
  { nombre: "1280", width: 1280, height: 900 },
] as const;

/** El texto que hoy fallaba: la persona lo selecciona con el mouse y se pierden los marcadores Markdown. */
const SELECCIONADO_CON_MOUSE = `¡Claro! Aquí tienes tu CV:

NOMBRE: Nino Barrios Bellido
CONTACTO: Arequipa, Perú | correo@gmail.com | +51965750922
PERFIL PROFESIONAL
Desarrollador Full Stack junior con experiencia en microservicios.
EXPERIENCIA PROFESIONAL
NB | Arequipa, Perú
Fullstack | 2023 – 2026

* Desarrollé microservicios para soluciones de software.
* Desarrollé componentes reutilizables.

EDUCACIÓN
UCSM | Arequipa, Perú
Ingeniería de Sistemas | 2015 – 2020
HABILIDADES

* Técnicas: SQL, Excel avanzado, Google Analytics.

IDIOMAS

* Inglés: B2.

CERTIFICACIONES
Inteligencia de Negocios
Curso | 2015`;

let total = 0;
let fallos = 0;
function rec(donde: string, prueba: string, ok: boolean, detalle = "") {
  total += 1;
  if (!ok) {
    fallos += 1;
    console.log(`FALLA · ${donde} · ${prueba}${detalle ? ` · ${detalle}` : ""}`);
  }
}

async function captura(page: Page, nombre: string) {
  if (!carpetaCapturas) return;
  fs.mkdirSync(carpetaCapturas, { recursive: true });
  await page.screenshot({ path: path.join(carpetaCapturas, `${nombre}.jpg`), type: "jpeg", quality: 70, fullPage: true });
}

interface Opciones {
  analitica?: boolean;
  tema?: "light" | "dark";
}

async function abrir(browser: Browser, v: (typeof VIEWPORTS)[number], o: Opciones = {}) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write", "microphone"], colorScheme: o.tema ?? "light" });
  const page = await ctx.newPage();
  const errores: string[] = [];
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  page.on("pageerror", (e) => errores.push(String(e)));
  await page.addInitScript(
    ({ analitica }) => {
      // tsx (esbuild) inyecta __name en las funciones que se serializan hacia la página.
      (window as unknown as { __name: (f: unknown) => unknown }).__name = (f) => f;
      try {
        window.localStorage.setItem("aixtack:consent", JSON.stringify({ ads: "denied", analytics: analitica ? "granted" : "denied", decided: true }));
      } catch {}
    },
    { analitica: Boolean(o.analitica) },
  );
  return { ctx, page, errores };
}

async function basicas(page: Page, donde: string) {
  const scrollX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  rec(donde, "sin scroll horizontal", scrollX <= 1, `${scrollX}px de más`);
  const chicos = await page.evaluate(() => {
    const salida: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("main a, main button, main summary, main input:not([type=hidden]), main select, main textarea, header a, header button, footer a")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (el.closest("nav[aria-label='Ruta de navegación']")) continue;
      if (el.matches("input[type=radio], input[type=checkbox], input[type=file]") && el.closest("label")) continue; // el control es la etiqueta completa
      // Enlaces dentro de un texto corrido no cuentan (WCAG: excepción de enlaces en línea).
      if (el.tagName === "A" && el.parentElement && (el.parentElement.textContent ?? "").trim().length > (el.textContent ?? "").trim().length + 3 && el.parentElement.tagName !== "HEADER") continue;
      if (r.height < 43.5) salida.push(`${el.tagName.toLowerCase()} «${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}» ${Math.round(r.height)}px`);
    }
    return salida;
  });
  rec(donde, "botones, enlaces y campos de ≥ 44 px de alto", chicos.length === 0, chicos.slice(0, 5).join(" | "));
  const sinNombre = await page.evaluate(() => [...document.querySelectorAll("input:not([type=hidden]), select, textarea")].filter((e) => !(e as HTMLInputElement).labels?.length && !e.getAttribute("aria-label")).length);
  rec(donde, "todos los campos tienen etiqueta", sinNombre === 0, `${sinNombre} sin etiqueta`);
  const h1 = await page.locator("h1").count();
  rec(donde, "un solo h1", h1 === 1, `${h1}`);
  const imgSinAlt = await page.evaluate(() => [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length);
  rec(donde, "todas las imágenes tienen alt", imgSinAlt === 0);
  const lang = await page.evaluate(() => document.documentElement.lang);
  rec(donde, "html lang=es", lang === "es", lang);
}

async function seo(page: Page, ruta: string, donde: string, tipos: string[], indexable = true) {
  const d = await page.evaluate(() => ({
    titulo: document.title,
    descripcion: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
    canonica: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
    robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
    og: document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "",
    twitter: document.querySelector('meta[name="twitter:card"]')?.getAttribute("content") ?? "",
    tipos: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
      try {
        const j = JSON.parse(s.textContent ?? "null");
        return (Array.isArray(j) ? j : [j]).map((x: { "@type"?: string }) => x?.["@type"] ?? "");
      } catch {
        return ["JSON-INVÁLIDO"];
      }
    }),
  }));
  rec(donde, `título ≤ 60 caracteres`, d.titulo.length > 0 && d.titulo.length <= 60, `${d.titulo.length}: ${d.titulo}`);
  rec(donde, "descripción ≤ 155 caracteres", d.descripcion.length >= 70 && d.descripcion.length <= 155, `${d.descripcion.length}`);
  rec(donde, "canonical correcto", ruta === "/" ? /guiapromptsia\.com\/?$/.test(d.canonica) : d.canonica.endsWith(ruta), d.canonica);
  rec(donde, "Open Graph y Twitter Card", d.og.length > 0 && d.twitter === "summary_large_image");
  rec(donde, indexable ? "indexable" : "noindex", indexable ? !d.robots.includes("noindex") : d.robots.includes("noindex"), d.robots);
  for (const t of tipos) rec(donde, `JSON-LD ${t}`, d.tipos.includes(t), d.tipos.join(","));
  rec(donde, "JSON-LD válido", !d.tipos.includes("JSON-INVÁLIDO"));
}

async function paginas(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const rutas: [string, string, string[], boolean][] = [
    ["/", "home", ["Organization", "WebSite", "FAQPage"], false],
    ["/carrera-y-empleo", "categoria", ["BreadcrumbList"], false],
    [RUTA_CV, "cv", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_OPT, "optimizar", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    ["/viajes-y-entretenimiento", "categoria-viajes", ["BreadcrumbList"], false],
    [RUTA_SAL, "salario", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_PLAN, "plan", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_ANA, "analisis", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_ENT, "entrevista", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_PRES, "presupuesto", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_ITIN, "itinerario", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_FECHAS, "fechas", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_CMP, "comparar", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_DEST, "destinos", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    ["/emprendimiento", "categoria-emprendimiento", ["BreadcrumbList"], false],
    [RUTA_LOGO, "logo", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_PLANNEG, "plan-negocio", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_RENTAB, "rentabilidad", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_NICHOS, "nichos", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [RUTA_CATALOGO, "catalogo", ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"], true],
    [ARTICULOS[0], "art-palabras", ["Article", "BreadcrumbList"], true],
    [ARTICULOS[1], "art-verbos", ["Article", "BreadcrumbList"], true],
    [ARTICULOS[2], "art-sin-exp", ["Article", "BreadcrumbList"], true],
    ["/sobre-nosotros", "sobre", [], false],
    ["/contacto", "contacto", [], false],
    ["/politica-de-privacidad", "privacidad", [], false],
    ["/politica-de-cookies", "cookies", [], false],
    ["/terminos-y-condiciones", "terminos", [], false],
  ];
  const sinAnuncios = new Set(["/sobre-nosotros", "/contacto", "/politica-de-privacidad", "/politica-de-cookies", "/terminos-y-condiciones", "/", "/carrera-y-empleo"]);
  for (const [ruta, nombre, tipos] of rutas) {
    const r = await page.goto(base + ruta, { waitUntil: "networkidle" });
    const donde = `${ruta} @${v.nombre}`;
    rec(donde, "responde 200", r?.status() === 200, `${r?.status()}`);
    await basicas(page, donde);
    await seo(page, ruta, donde, tipos);
    if (sinAnuncios.has(ruta)) rec(donde, "sin anuncios (página institucional, portada o categoría)", (await page.locator("aside[aria-label*='ublicidad'], ins.adsbygoogle").count()) === 0);
    const bloqueaAdsAlLado = await page.evaluate(() => [...document.querySelectorAll("aside[aria-label*='ublicidad']")].filter((a) => a.parentElement?.querySelector("button, textarea, input") && a.previousElementSibling?.matches("button, textarea, input, form")).length);
    rec(donde, "ningún anuncio pegado a un botón o campo", bloqueaAdsAlLado === 0);
    await captura(page, `${nombre}-${v.nombre}`);
  }
  rec(`paginas @${v.nombre}`, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  for (const ruta of ["/herramientas", "/marketing/crear-afiches-con-ia", ...CERRADAS, ...PENDIENTES, "/carrera-y-empleo/no-existe", "/mi-negocio", "/og/finanzas-y-economia"]) {
    const r = await page.goto(base + ruta);
    rec(`${ruta} @${v.nombre}`, "ruta inexistente o cerrada → 404", r?.status() === 404, `${r?.status()}`);
  }
  const r410 = await page.goto(base + "/blog/algo");
  rec(`/blog/algo @${v.nombre}`, "URL antigua → 410", r410?.status() === 410, `${r410?.status()}`);
  await ctx.close();
}

async function sinEnlacesACerradas(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1]);
  for (const ruta of ["/", "/carrera-y-empleo", "/viajes-y-entretenimiento", "/emprendimiento", RUTA_CV, RUTA_OPT, RUTA_ANA, RUTA_ENT, RUTA_SAL, RUTA_PLAN, RUTA_PRES, RUTA_ITIN, RUTA_FECHAS, RUTA_CMP, RUTA_DEST, RUTA_LOGO, RUTA_PLANNEG, RUTA_RENTAB, RUTA_NICHOS, RUTA_CATALOGO, ARTICULOS[0], "/sobre-nosotros", "/politica-de-privacidad"]) {
    await page.goto(base + ruta, { waitUntil: "networkidle" });
    const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? ""));
    const malos = hrefs.filter((h) => [...CERRADAS, ...PENDIENTES].some((c) => h === c || h.startsWith(c + "/") || h.startsWith(c + "#")));
    rec(`enlaces @${ruta}`, "ningún enlace a categorías cerradas ni a herramientas pendientes (menú, pie, portada, hub, relacionadas)", malos.length === 0, malos.join(", "));
  }
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const menu = await page.evaluate(() => [...document.querySelectorAll("header nav a, footer nav a")].map((a) => a.getAttribute("href")));
  rec("menú y pie", "solo enlazan a categorías activas (Carrera y empleo, Viajes y entretenimiento, Emprendimiento)", menu.includes("/carrera-y-empleo") && menu.includes("/viajes-y-entretenimiento") && menu.includes("/emprendimiento") && CERRADAS.every((c) => !menu.includes(c)));
  await ctx.close();
}

async function temaYAnuncios(browser: Browser) {
  const v = VIEWPORTS[1];
  const { ctx, page } = await abrir(browser, v);
  await page.goto(base + RUTA_CV, { waitUntil: "networkidle" });
  const antes = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  await page.getByRole("button", { name: /Cambiar a modo (oscuro|claro)/ }).click();
  await page.waitForTimeout(150);
  const despues = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  rec("tema", "el conmutador cambia claro/oscuro", antes !== despues);
  const guardado = await page.evaluate(() => window.localStorage.getItem("theme"));
  rec("tema", "la elección se recuerda en localStorage", guardado === (despues ? "dark" : "light"), String(guardado));
  await page.reload({ waitUntil: "networkidle" });
  rec("tema", "se mantiene tras recargar", (await page.evaluate(() => document.documentElement.classList.contains("dark"))) === despues);
  const fondo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  rec("tema", "el fondo cambia entre oscuro y claro (blanco)", despues ? fondo === "rgb(8, 22, 34)" : fondo === "rgb(255, 255, 255)", fondo);
  await captura(page, "cv-tema-alternado-1280");
  await ctx.close();

  // Respeta prefers-color-scheme cuando no hay elección guardada.
  const oscuro = await abrir(browser, v, { tema: "dark" });
  await oscuro.page.goto(base + "/", { waitUntil: "networkidle" });
  rec("tema", "respeta prefers-color-scheme: dark", await oscuro.page.evaluate(() => document.documentElement.classList.contains("dark")));
  await oscuro.ctx.close();

  // Consent Mode v2: por defecto todo denegado.
  const cm = await abrir(browser, v);
  await cm.page.addInitScript(() => window.localStorage.removeItem("aixtack:consent"));
  await cm.page.goto(base + "/", { waitUntil: "networkidle" });
  const dl = await cm.page.evaluate(() => JSON.stringify((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []));
  rec("consentimiento", "Consent Mode v2: el valor por defecto deniega anuncios, datos de usuario, personalización y analítica", ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"].every((k) => dl.includes(`"${k}":"denied"`)), dl.slice(0, 200));
  rec("consentimiento", "sin decisión no hay scripts de Google ni cookies de anuncios", (await cm.page.locator("script[src*='googletagmanager'], script[src*='googlesyndication']").count()) === 0);
  rec("consentimiento", "aparece el aviso de cookies", await cm.page.getByRole("region", { name: "Aviso de cookies" }).isVisible());
  await cm.ctx.close();
}

async function buscador(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const cajas = page.getByRole("searchbox", { name: "Buscar prompts" });
  let usada = cajas.first();
  for (let i = 0; i < (await cajas.count()); i++) if (await cajas.nth(i).isVisible()) usada = cajas.nth(i);
  await usada.fill("verbos accion");
  await page.waitForTimeout(150);
  const resultados = page.locator("[aria-live='polite']").filter({ has: page.locator("a") });
  rec(`buscador @${v.nombre}`, "«verbos accion» (sin tildes) encuentra el artículo de verbos", await resultados.locator("a", { hasText: "Verbos de acción" }).first().isVisible());
  await usada.fill("zzzz");
  rec(`buscador @${v.nombre}`, "una búsqueda sin resultados lo dice", await page.getByText("Todavía no hay un prompt para").isVisible());
  await usada.fill("harvard");
  await resultados.locator("a", { hasText: "Harvard" }).first().click();
  await page.waitForURL("**" + RUTA_CV);
  rec(`buscador @${v.nombre}`, "el resultado lleva a la herramienta del CV", page.url().endsWith(RUTA_CV));
  rec(`buscador @${v.nombre}`, "sin errores de consola", errores.length === 0, errores.join(" | "));
  await ctx.close();
}

async function leerDocx(descarga: import("playwright-core").Download) {
  const zip = await JSZip.loadAsync(fs.readFileSync((await descarga.path())!));
  return zip.file("word/document.xml")!.async("string");
}

async function generadorCv(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `generador @${v.nombre}`;
  await page.goto(base + RUTA_CV, { waitUntil: "networkidle" });
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const nombre = page.getByLabel("Nombre completo");
  const respuestaIa = page.getByRole("textbox", { name: "Respuesta de la IA" });
  const descargar = page.getByRole("button", { name: "Descargar mi CV en Word (.docx)" });
  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");

  // Estado inicial
  rec(donde, "el stepper muestra 3 pasos y el 1 está activo", (await pasos.count()) === 3 && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  rec(donde, "el prompt empieza vacío con «(no indicado)»", (await prompt()).includes("(no indicado)"));
  rec(donde, "sin datos, la descarga está desactivada y dice por qué", (await descargar.isDisabled()) && (await page.getByText("Pega la respuesta de tu IA para activar la descarga.").isVisible()));
  rec(donde, "el paso 3 tiene el tip de usar el botón Copiar de la IA", await page.getByText("usa el botón Copiar de tu IA en lugar de seleccionar el texto").isVisible());

  // Ejemplo del paso 1
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  const e0 = EJEMPLOS_CV[0];
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena el formulario (nombre, oferta, estudios, habilidades)", (await nombre.inputValue()) === e0.datos.nombre && (await page.getByLabel("Oferta laboral").inputValue()) === e0.datos.oferta && (await page.getByLabel("Institución").inputValue()) === e0.datos.estudios[0].institucion);
  rec(donde, "el paso 2 se actualiza al instante con el ejemplo", (await prompt()).includes(e0.datos.nombre) && (await prompt()).includes("Practicante de Logística"));
  rec(donde, "aviso visible «Estás viendo datos de ejemplo» con «Limpiar formulario»", (await page.locator("[data-aviso-ejemplo]").isVisible()) && (await page.getByRole("button", { name: "Limpiar formulario" }).isVisible()));
  rec(donde, "los datos de ejemplo NO se guardan como datos de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-cv-datos-v1"))) === null);
  rec(donde, "el paso 1 pasa a «completo» en el stepper", ((await pasos.nth(0).textContent()) ?? "").includes("completo"));
  rec(donde, "sin campos marcados como error", (await page.locator("[aria-invalid='true']").count()) === 0 || (await page.locator("form [aria-invalid='true']").count()) === 0);
  await captura(page, `cv-ejemplo-paso1-${v.nombre}`);

  // Otro ejemplo: rota entre los 4 perfiles
  const vistos = new Set<string>([await nombre.inputValue()]);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Otro ejemplo" }).first().click();
    await page.waitForTimeout(80);
    vistos.add(await nombre.inputValue());
  }
  rec(donde, "«Otro ejemplo» recorre los 4 perfiles distintos", vistos.size === 4 && EJEMPLOS_CV.every((e) => vistos.has(e.datos.nombre)), [...vistos].join(", "));
  const noBorra = await page.evaluate(() => window.localStorage.getItem("gpia-cv-datos-v1"));
  rec(donde, "…y sigue sin guardar nada en el navegador", noBorra === null);

  // Ejemplo del paso 3: respuesta de ejemplo → vista previa → Word
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  rec(donde, "«Limpiar formulario» vacía todo y quita el aviso", (await nombre.inputValue()) === "" && (await page.locator("[data-aviso-ejemplo]").count()) === 0);
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.locator("[data-vista-cv]").first().waitFor();
  const idx = EJEMPLOS_CV.findIndex((e) => e.datos.nombre === "Valeria Quispe Mamani");
  rec(donde, "la respuesta de ejemplo coincide con los datos del paso 1", (await respuestaIa.inputValue()).includes(EJEMPLOS_CV[idx].datos.nombre) && idx === 0);
  const vista = await page.locator("[data-vista-cv]").first().innerText();
  rec(donde, "la vista previa (hoja A4) muestra el CV del ejemplo", vista.includes("Valeria Quispe Mamani") && vista.includes("PROYECTOS Y ACTIVIDADES"));
  const proporcion = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>("[data-vista-cv]")!;
    return el.offsetHeight / el.offsetWidth;
  });
  rec(donde, "la hoja tiene proporción A4 (≥ 297/210)", proporcion >= 297 / 210 - 0.02, proporcion.toFixed(2));
  rec(donde, "sin avisos de secciones faltantes con la respuesta de ejemplo", (await page.getByText("Avisos (no impiden descargar)").count()) === 0);
  rec(donde, "las recomendaciones de la IA están en un panel plegable aparte", (await page.locator("details", { hasText: "Recomendaciones de la IA" }).count()) === 1 && !vista.includes("Brecha"));
  await captura(page, `cv-ejemplo-paso3-${v.nombre}`);
  const [d1] = await Promise.all([page.waitForEvent("download"), descargar.click()]);
  rec(donde, "el ejemplo se descarga como CV-ejemplo-harvard.docx", d1.suggestedFilename() === "CV-ejemplo-harvard.docx", d1.suggestedFilename());
  const xml1 = await leerDocx(d1);
  rec(donde, "el .docx del ejemplo: contenido, viñetas reales, sin tablas ni imágenes ni notas", xml1.includes("Valeria Quispe Mamani") && xml1.includes("w:numPr") && !xml1.includes("<w:tbl>") && !xml1.includes("<w:drawing") && !xml1.includes("txbxContent") && !xml1.includes("Brecha"));
  rec(donde, "el stepper marca los pasos 1 y 3 como completos", ((await pasos.nth(2).textContent()) ?? "").includes("completo"));

  // Copiar prompt
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const p1 = await prompt();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === p1, `${portapapeles.length} vs ${p1.length}`);
  rec(donde, "el prompt pide la respuesta dentro de un único bloque de código", p1.includes("dentro de un único bloque de código") && !p1.includes("sin bloques de código"));
  rec(donde, "aviso «Prompt copiado» (toast) visible", await page.getByText("Prompt copiado. Pégalo en tu IA.").isVisible());

  // Bug de la Fase 1: texto seleccionado con el mouse (sin ## ni ###), con introducción
  await respuestaIa.fill(SELECCIONADO_CON_MOUSE);
  await page.locator("[data-vista-cv]").first().waitFor();
  const vistaBug = await page.locator("[data-vista-cv]").first().innerText();
  rec(donde, "texto seleccionado con el mouse: vista previa inmediata con nombre, secciones y entradas", vistaBug.includes("Nino Barrios Bellido") && vistaBug.includes("EXPERIENCIA PROFESIONAL") && vistaBug.includes("NB") && vistaBug.includes("UCSM") && vistaBug.includes("Inteligencia de Negocios"));
  rec(donde, "…el enlace del correo quedó en texto plano y sin la introducción de la IA", vistaBug.includes("correo@gmail.com") && !vistaBug.includes("[") && !vistaBug.includes("Claro"));
  rec(donde, "…y el botón de descarga está activo", await descargar.isEnabled());
  const [d2] = await Promise.all([page.waitForEvent("download"), descargar.click()]);
  rec(donde, "…se descarga CV-Nino-Barrios-Bellido.docx", d2.suggestedFilename() === "CV-Nino-Barrios-Bellido.docx", d2.suggestedFilename());
  const xml2 = await leerDocx(d2);
  rec(donde, "…con encabezados, viñetas y sin tablas ni imágenes", xml2.includes("PERFIL PROFESIONAL") && xml2.includes("Desarrollé microservicios") && xml2.includes("w:numPr") && !xml2.includes("<w:tbl>") && !xml2.includes("<w:drawing"));

  // Advertencias no bloqueantes y errores en lenguaje simple
  await respuestaIa.fill(SELECCIONADO_CON_MOUSE.replace(/IDIOMAS\n\n\* Inglés: B2\.\n\n/, ""));
  rec(donde, "una sección ausente es solo un aviso: «No detecté la sección IDIOMAS, se omitirá.»", (await page.getByText("No detecté la sección IDIOMAS, se omitirá.").isVisible()) && (await descargar.isEnabled()));
  await respuestaIa.fill("Claro, aquí tienes tu CV. Es muy bueno.");
  rec(donde, "una respuesta sin formato explica exactamente qué falta", (await page.getByText("Todavía no puedo armar tu CV").isVisible()) && (await descargar.isDisabled()));
  rec(donde, "…y el botón desactivado dice por qué", (await page.locator("#motivo-descarga").innerText()).includes("Falta el nombre"));
  await page.getByRole("button", { name: "Copiar mensaje de corrección" }).click();
  rec(donde, "el mensaje de corrección se copia", (await page.evaluate(() => navigator.clipboard.readText())).includes("=== NOTAS ==="));

  // Datos propios: guardado, confirmación antes de reemplazar y «Deshacer»
  await page.getByRole("button", { name: "Borrar mis datos" }).click().catch(() => {});
  await page.goto(base + RUTA_CV, { waitUntil: "networkidle" });
  await nombre.fill("María Prueba");
  await page.getByLabel("Puesto al que postulas").fill("Analista de datos");
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "los datos propios se guardan y siguen tras recargar", (await nombre.inputValue()) === "María Prueba");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  rec(donde, "con datos propios pide confirmación antes de reemplazar", await page.getByText("¿Reemplazar lo que escribiste con datos de ejemplo?").isVisible());
  await page.getByRole("button", { name: "Cancelar" }).click();
  rec(donde, "«Cancelar» conserva lo escrito", (await nombre.inputValue()) === "María Prueba");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("button", { name: "Reemplazar" }).click();
  rec(donde, "«Reemplazar» carga el ejemplo", (await nombre.inputValue()) === EJEMPLOS_CV[0].datos.nombre);
  await page.getByRole("button", { name: "Deshacer" }).click();
  rec(donde, "«Deshacer» devuelve lo que la persona había escrito", (await nombre.inputValue()) === "María Prueba" && (await page.getByLabel("Puesto al que postulas").inputValue()) === "Analista de datos");
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "tras recargar siguen los datos propios (nunca el ejemplo)", (await nombre.inputValue()) === "María Prueba");

  // Borrador sin IA
  await page.getByLabel("Título o carrera").fill("Licenciatura en Estadística");
  await page.getByLabel("Institución").fill("Universidad Ejemplo");
  const [d3] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /borrador con mis datos/ }).click()]);
  rec(donde, "el borrador sin IA se descarga con los datos escritos", (await leerDocx(d3)).includes("María Prueba"));

  await basicas(page, donde);
  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function generadorOptimizar(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `optimizar @${v.nombre}`;
  await page.goto(base + RUTA_OPT, { waitUntil: "networkidle" });
  const diego = EJEMPLOS_OPTIMIZAR[0];
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const cvCaja = page.getByLabel("Tu CV actual, en texto");
  const respuesta = page.getByRole("textbox", { name: "Respuesta de la IA" });
  const descargar = page.getByRole("button", { name: /Descargar CV optimizado en Word/ });
  const tab = (n: string) => page.getByRole("tab", { name: n, exact: true });

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu resultado») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu resultado") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  const p0 = await prompt();
  rec(donde, "el prompt vacío tiene los 8 bloques y «(no indicado)»", ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"].every((b) => p0.includes(b)) && p0.includes("(no indicado)"));
  rec(donde, "sin datos la descarga está desactivada y dice por qué", (await descargar.isDisabled()) && (await page.getByText("Pega la respuesta de tu IA para activar la descarga y la comparación.").isVisible()));
  rec(donde, "el medidor dice «(recomendado: 80 %)»", await page.getByText("(recomendado: 80 %)").isVisible());
  rec(donde, "hay ayuda para copiar el texto de un PDF", (await page.getByText("Cómo copiar el texto de tu PDF sin perder el orden").count()) === 1);

  // Ejemplo del paso 1
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena CV, oferta, intensidad e intocables", (await cvCaja.inputValue()).includes("DIEGO CÁRDENAS MENDOZA") && (await page.getByLabel("La oferta laboral completa").inputValue()).includes("Analista contable") && (await page.getByRole("radio", { name: /Adaptación/ }).isChecked()) && (await page.getByLabel("Elementos que no se pueden tocar").inputValue()).includes("Asistente contable"));
  const p1 = await prompt();
  rec(donde, "el prompt se arma al instante con los datos de ejemplo", p1.includes("DIEGO CÁRDENAS MENDOZA") && p1.includes("<oferta>") && p1.includes("intensidad «Adaptación»") && p1.includes("Conciliaciones bancarias con Excel"));
  rec(donde, "medidor al 100 % y aviso «Estás viendo datos de ejemplo»", (await page.getByText("Datos completados: 100 %").isVisible()) && (await page.locator("[data-aviso-ejemplo]").isVisible()));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-optimizar-datos-v1"))) === null);
  await page.getByRole("radio", { name: /Reestructuración/ }).check();
  rec(donde, "cambiar la intensidad actualiza el prompt", (await prompt()).includes("intensidad «Reestructuración»"));
  await page.getByRole("radio", { name: /Adaptación/ }).check();
  await captura(page, `optimizar-paso1-${v.nombre}`);

  // Copiar prompt
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === (await prompt()));

  // Respuesta de ejemplo: paneles y comparación
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.getByRole("tab", { name: "Resumen" }).waitFor();
  rec(donde, "la respuesta de ejemplo abre los 7 paneles", (await page.getByRole("tab").count()) === 7);
  rec(donde, "Resumen: contadores y «Qué revisar antes de usarlo»", (await page.getByText("Palabras eliminadas", { exact: true }).isVisible()) && (await page.getByText("Qué revisar antes de usarlo", { exact: true }).isVisible()) && (await page.getByText("Viñetas reescritas", { exact: true }).isVisible()));
  await tab("Antes y después").click();
  rec(donde, "Antes y después: se marca lo quitado y lo agregado", (await page.locator("[data-diff=antes] .line-through").count()) > 0 && (await page.locator("[data-diff=despues] .bg-ok-muted").count()) > 0);
  rec(donde, "…y sin datos inventados en el ejemplo (ningún resaltado de advertencia)", (await page.locator("[data-diff=despues] mark").count()) === 0);
  await tab("CV optimizado").click();
  rec(donde, "CV optimizado: vista previa A4 con el nombre", ((await page.locator("[data-vista-cv]").first().innerText()) ?? "").includes("Diego Cárdenas Mendoza"));
  await tab("Diagnóstico").click();
  rec(donde, "Diagnóstico: etiquetas de tipo de problema", (await page.getByText("REPETICIÓN", { exact: true }).count()) >= 1 && (await page.getByText("KEYWORD AUSENTE", { exact: true }).count()) >= 1);
  await tab("Cambios").click();
  rec(donde, "Cambios: Antes → Después → Motivo", (await page.getByText("Realicé conciliaciones bancarias mensuales de 4 cuentas corrientes").count()) >= 1 && (await page.getByText("Motivo:").count()) >= 5);
  await tab("Brechas y preguntas").click();
  rec(donde, "Brechas: SAP como brecha real y preguntas de tipo B", (await page.getByText("Manejo de SAP").count()) >= 1 && (await page.getByText("¿las hacías tú").count()) >= 1);
  await tab("Por verificar").click();
  rec(donde, "Por verificar: afirmaciones y siguiente paso", (await page.getByText("«4 cuentas corrientes»").count()) >= 1 && (await page.getByText("Siguiente paso").count()) >= 1);
  await captura(page, `optimizar-resultado-${v.nombre}`);

  // Teclado en las pestañas
  await tab("Resumen").click();
  await tab("Resumen").focus();
  await page.keyboard.press("ArrowRight");
  rec(donde, "las pestañas se mueven con las flechas del teclado", (await tab("Antes y después").getAttribute("aria-selected")) === "true");

  // Descarga del ejemplo y registro de cambios
  const [d1] = await Promise.all([page.waitForEvent("download"), descargar.click()]);
  rec(donde, "el ejemplo se descarga como CV-optimizado-ejemplo.docx", d1.suggestedFilename() === "CV-optimizado-ejemplo.docx", d1.suggestedFilename());
  const xml1 = await leerDocx(d1);
  rec(donde, "el .docx: nombre, viñetas reales, sin tablas ni imágenes ni notas", xml1.includes("Diego") && xml1.includes("w:numPr") && !xml1.includes("<w:tbl>") && !xml1.includes("<w:drawing") && !xml1.includes("Motivo") && !xml1.includes("Brecha"));
  await page.getByRole("button", { name: "Copiar registro de cambios" }).click();
  const registro = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "«Copiar registro de cambios» copia «Antes: … → Después: … → Motivo: …»", registro.includes("Antes:") && registro.includes("→ Después:") && registro.includes("→ Motivo:") && registro.split("\n").length >= 5);

  // «Otro ejemplo» recorre los 3 perfiles
  const vistos = new Set<string>();
  vistos.add((await cvCaja.inputValue()).split("\n")[0]);
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Otro ejemplo" }).last().click();
    await page.waitForTimeout(80);
    vistos.add((await cvCaja.inputValue()).split("\n")[0]);
  }
  rec(donde, "«Otro ejemplo» recorre los 3 perfiles", vistos.size === 3 && EJEMPLOS_OPTIMIZAR.every((e) => vistos.has(e.datos.cv.split("\n")[0])), [...vistos].join(" | "));

  // Detector de invención: la respuesta agrega SAP y una cifra nueva
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  const inventada = diego.respuesta.replace("- Registré facturas de compra y de venta en Excel.", "- Registré 90 facturas de compra y de venta en SAP.");
  await respuesta.fill(inventada);
  await tab("Resumen").click();
  rec(donde, "Resumen avisa de números y nombres que no estaban en el CV", (await page.getByText("que no están en tu CV original").count()) >= 1);
  await tab("Antes y después").click();
  const marcas = (await page.locator("[data-diff=despues] mark").allInnerTexts()).join(" ");
  rec(donde, "el detector resalta «90» y «SAP» en el CV optimizado", marcas.includes("90") && marcas.includes("SAP"), marcas);
  const [d2] = await Promise.all([page.waitForEvent("download"), descargar.click()]);
  rec(donde, "una respuesta propia se descarga con el nombre de la persona (CV-Diego-Cardenas-Mendoza.docx)", d2.suggestedFilename() === "CV-Diego-Cardenas-Mendoza.docx", d2.suggestedFilename());

  // Cita inventada en el diagnóstico
  await respuesta.fill(diego.respuesta.replace("«Atención telefónica»", "«Lideré un equipo de 30 personas»"));
  await tab("Diagnóstico").click();
  rec(donde, "una cita del diagnóstico que no está en el CV se marca", (await page.getByText("cita no encontrada en tu CV").count()) >= 1);

  // Respuesta sin formato
  await respuesta.fill("Claro, aquí tienes tu CV. Es muy bueno.");
  rec(donde, "sin el formato pedido: mensaje claro, sin comparación y descarga desactivada con motivo", (await page.getByText("Todavía no puedo armar la comparación").isVisible()) && (await descargar.isDisabled()) && (await page.locator("#motivo-descarga-opt").innerText()).includes("CV optimizado") && (await page.getByText("Pega la respuesta completa usando el botón Copiar de tu IA").count()) >= 1);
  rec(donde, "el tip de usar el botón Copiar de la IA está visible", await page.getByText("usa el botón Copiar de tu IA").first().isVisible());

  // Convertir en CV Harvard
  await respuesta.fill(diego.respuesta);
  await page.getByRole("button", { name: "Convertir en CV Harvard" }).click();
  await page.waitForURL("**" + RUTA_CV + "#paso-3");
  await page.locator("[data-importada]").waitFor();
  const vista = await page.locator("[data-vista-cv]").first().innerText();
  rec(donde, "«Convertir en CV Harvard» lleva el resultado al generador, ya pegado y con vista previa", vista.includes("Diego Cárdenas Mendoza") && vista.includes("EXPERIENCIA PROFESIONAL") && (await page.getByText("Traje el CV optimizado desde «Optimizar tu CV»").isVisible()));
  const [d3] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descargar mi CV en Word (.docx)" }).click()]);
  rec(donde, "…y se descarga como Word desde el generador de CV", (await leerDocx(d3)).includes("Diego"));

  // Datos propios y confirmación
  await page.goto(base + RUTA_OPT, { waitUntil: "networkidle" });
  await cvCaja.fill("Mi CV de prueba con suficiente texto.");
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "los datos propios se guardan y siguen tras recargar", (await cvCaja.inputValue()) === "Mi CV de prueba con suficiente texto.");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  rec(donde, "con datos propios pide confirmación antes de reemplazar", await page.getByText("¿Reemplazar lo que escribiste con datos de ejemplo?").isVisible());
  await page.getByRole("button", { name: "Reemplazar" }).click();
  await page.getByRole("button", { name: "Deshacer" }).click();
  rec(donde, "«Deshacer» devuelve lo que la persona había escrito", (await cvCaja.inputValue()) === "Mi CV de prueba con suficiente texto.");

  await basicas(page, donde);
  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function generadorPresupuesto(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `presupuesto @${v.nombre}`;
  await page.goto(base + RUTA_PRES, { waitUntil: "networkidle" });
  const [cusco, paracas, santiago] = EJEMPLOS_PRESUPUESTO;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const respuesta = page.getByRole("textbox", { name: "Respuesta de la IA" });
  const tab = (n: string) => page.getByRole("tab", { name: n, exact: true });
  const lineas = page.locator("[data-linea]");
  const total = () => page.locator("[data-total]").innerText();

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu resultado») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu resultado") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  const p0 = await prompt();
  rec(donde, "el prompt vacío tiene los 8 bloques y «(no indicado)»", ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"].every((b) => p0.includes(b)) && p0.includes("(no indicado)"));
  rec(donde, "el medidor dice «(recomendado: 80 %)» y arranca en 0 %", (await page.getByText("(recomendado: 80 %)").isVisible()) && (await page.getByText("Datos completados: 0 %").isVisible()));
  rec(donde, "arranca con 5 gastos vacíos y un estado vacío amable en el resumen", (await lineas.count()) === 5 && (await page.getByText("Aquí verás tu total").isVisible()));
  rec(donde, "sin datos, exportar está desactivado", (await page.getByRole("button", { name: /Descargar CSV/ }).isDisabled()) && (await page.getByRole("button", { name: /Copiar como tabla/ }).isDisabled()));

  // Ejemplo del paso 1: el caso de la guía (Cusco)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena destino, noches, viajeros y los 6 gastos", (await page.getByRole("textbox", { name: /^Destino/ }).inputValue()).includes("Cusco") && (await page.getByLabel(/^Noches/).inputValue()) === "5" && (await page.getByLabel(/^Adultos/).inputValue()) === "2" && (await lineas.count()) === 6);
  rec(donde, "el total es S/ 3,465.00 y S/ 1,732.50 por persona (recalculado a mano)", (await total()).includes("3,465.00") && (await page.locator("#resumen-movil").innerText()).includes("1,732.50 por persona"));
  rec(donde, "cada gasto muestra su fórmula (150.00 × 5 noches = S/ 750.00)", (await page.locator("[data-formula]").allInnerTexts()).some((t) => t.includes("= S/ 750.00") && t.includes("150.00 × 5 noches")) && (await page.locator("[data-formula]").allInnerTexts()).some((t) => t.includes("60.00 × 2 personas × 6 días")));
  rec(donde, "la barra «conocido vs estimado» dice 62 % conocido y 28.9 % estimado", (await page.locator("#resumen-movil").innerText()).includes("Respaldado por precios reales: 62 %") && (await page.locator("#resumen-movil").innerText()).includes("28.9 %"));
  rec(donde, "medidor al 100 % y aviso «Estás viendo datos de ejemplo»", (await page.getByText("Datos completados: 100 %").isVisible()) && (await page.locator("[data-aviso-ejemplo]").isVisible()));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-presupuesto-datos-v1"))) === null);
  const p1 = await prompt();
  rec(donde, "el prompt se arma con la tabla y los totales calculados por la página", p1.includes("Total con imprevistos: S/ 3,465.00") && p1.includes("Económico: total S/ 2,860.00") && p1.includes("Hostal, habitación doble") && p1.includes("<tabla_de_gastos>"));
  await captura(page, `presupuesto-paso1-${v.nombre}`);

  // Escenarios y gráfico
  const esc = (k: string) => page.locator(`[data-escenario=${k}]`).innerText();
  rec(donde, "los 3 escenarios: 2,860.00 / 3,465.00 / 4,081.00", (await esc("economico")).includes("2,860.00") && (await esc("intermedio")).includes("3,465.00") && (await esc("holgado")).includes("4,081.00"));
  rec(donde, "el gráfico de barras apiladas tiene su tabla de datos", (await page.getByText("Ver los datos del gráfico (tabla)").count()) === 1 && (await page.locator("[role=img][aria-label*='Barras apiladas']").count()) === 1);
  rec(donde, "las fórmulas de la página están visibles", (await page.getByText("Ver las fórmulas que usa la página").count()) === 1);

  // Detector de gastos olvidados y coherencia
  const olvidados = page.locator("[data-olvidados] > li, [data-olvidados-resto] > li");
  const antes = await olvidados.count();
  rec(donde, "el detector sugiere gastos que faltan (seguro, equipaje, propinas…) y ninguno lleva precio", antes >= 6 && (await page.getByRole("button", { name: "Añadir a mi tabla: Seguro de viaje" }).count()) === 1 && !/S\/\s?\d/.test(await page.locator("[data-olvidados]").innerText()));
  await page.getByRole("button", { name: "Añadir a mi tabla: Seguro de viaje" }).click();
  rec(donde, "«Añadir a mi tabla» agrega la línea vacía y la quita de las sugerencias", (await lineas.count()) === 7 && (await olvidados.count()) === antes - 1 && (await page.getByRole("button", { name: "Añadir a mi tabla: Seguro de viaje" }).count()) === 0 && (await total()).includes("3,465.00"));
  await page.getByRole("button", { name: "No aplica a mi viaje: Equipaje de bodega o de mano adicional" }).click();
  rec(donde, "«No aplica» oculta la sugerencia", (await page.getByRole("button", { name: "No aplica a mi viaje: Equipaje de bodega o de mano adicional" }).count()) === 0);
  // Comidas por viaje: el detector de unidades avisa
  const unidadComidas = page.locator("[data-linea]").nth(3).getByLabel("Unidad");
  await unidadComidas.selectOption("viaje");
  rec(donde, "la revisión local avisa de comidas contadas «por viaje»", await page.getByText("Suele ser más fiable calcularlas «por persona y día»").isVisible());
  await unidadComidas.selectOption("persona-dia");
  rec(donde, "…y el aviso desaparece al corregir la unidad", (await page.getByText("Suele ser más fiable calcularlas").count()) === 0);
  // Error junto al campo
  const monto = page.locator("[data-linea]").nth(0).getByLabel(/^Monto/);
  await monto.fill("abc");
  rec(donde, "un monto inválido muestra el error junto al campo", (await monto.getAttribute("aria-invalid")) === "true" && (await page.getByText("Escribe un número, por ejemplo 150 o 150.50.").first().isVisible()));
  await monto.fill("900");

  // Exportar
  const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Descargar CSV/ }).click()]);
  const contenidoCsv = fs.readFileSync((await csv.path())!, "utf8");
  rec(donde, "el CSV de ejemplo se llama presupuesto-de-viaje-EJEMPLO.csv, lleva BOM y los totales", csv.suggestedFilename() === "presupuesto-de-viaje-EJEMPLO.csv" && contenidoCsv.startsWith("﻿") && contenidoCsv.includes("Total con imprevistos,,,,,,,3465"), csv.suggestedFilename());
  await page.getByRole("button", { name: /Copiar como tabla/ }).click();
  const tabla = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "«Copiar como tabla» deja filas separadas por tabuladores", tabla.includes("\t") && tabla.split("\n").length >= 12 && tabla.includes("Total con imprevistos"));
  rec(donde, "la versión para imprimir existe, oculta en pantalla, con la advertencia de ejemplo", (await page.locator("#presupuesto-imprimible").count()) === 1 && !(await page.locator("#presupuesto-imprimible").isVisible()) && ((await page.locator("#presupuesto-imprimible").textContent()) ?? "").includes("EJEMPLO ILUSTRATIVO"));
  await page.evaluate(() => document.body.classList.add("imprimiendo-presupuesto"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve el resumen (la herramienta queda oculta)", (await page.locator("#presupuesto-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-presupuesto"));

  // Copiar prompt
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === (await prompt()));

  // Respuesta de ejemplo: paneles
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.getByRole("tab", { name: "Resumen" }).waitFor();
  rec(donde, "la respuesta de ejemplo abre los 7 paneles", (await page.getByRole("tab").count()) === 7);
  rec(donde, "Resumen: «Qué revisar antes de usarlo» y 0 montos que no vienen de tus datos", (await page.getByText("Qué revisar antes de usarlo", { exact: true }).isVisible()) && (await page.getByText("Montos que no vienen de tus datos", { exact: true }).isVisible()));
  await tab("Gastos que faltan").click();
  rec(donde, "Gastos que faltan: botón «Añadir a mi tabla» en cada uno y sin precios", (await page.locator("[data-faltan] > li").count()) >= 5 && (await page.locator("[data-faltan]").innerText()).includes("Dónde consultarlo"));
  const antesL = await lineas.count();
  await page.locator("[data-faltan]").getByRole("button", { name: "Añadir a mi tabla: Comisión por pagar con tarjeta o retirar en cajero", exact: true }).click();
  rec(donde, "añadir un gasto de la respuesta crea la línea y el botón pasa a «Ya está en tu tabla»", (await lineas.count()) === antesL + 1 && (await page.getByText("Ya está en tu tabla").count()) >= 1);
  await tab("Necesidades y ahorro").click();
  rec(donde, "Necesidades y ahorro: 5 ideas con su categoría", (await page.locator("ol > li").filter({ hasText: "Categoría que afecta" }).count()) === 5 && (await page.getByText("Necesidades", { exact: true }).isVisible()));
  await tab("Margen").click();
  rec(donde, "Margen: veredicto y comparación con la regla de la página", (await page.getByText("Razonable", { exact: true }).isVisible()) && (await page.getByText("Referencia práctica para esa proporción: 10–15 %").isVisible()));
  await tab("Antes de reservar").click();
  rec(donde, "Antes de reservar: lista de tareas", (await page.locator("[role=tabpanel] ol > li").count()) >= 4);
  await tab("Por verificar").click();
  rec(donde, "Por verificar: qué verificar, verificaciones automáticas y siguiente paso", (await page.getByText("Verificaciones automáticas de la página").isVisible()) && (await page.getByText("Siguiente paso", { exact: true }).count()) >= 1);
  await captura(page, `presupuesto-resultado-${v.nombre}`);
  await tab("Resumen").click();
  await tab("Resumen").focus();
  await page.keyboard.press("ArrowRight");
  rec(donde, "las pestañas se mueven con las flechas del teclado", (await tab("Coherencia").getAttribute("aria-selected")) === "true");

  // Detector de montos inventados
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await respuesta.fill(cusco.respuesta.replace("Tu margen es de 10 % del subtotal.", "Reserva unos S/ 4,500 extra y sube a 40 %."));
  await tab("Resumen").click();
  rec(donde, "Resumen avisa de montos y porcentajes que no están en los datos", (await page.getByText("montos que no están en tus datos").count()) >= 1 && (await page.getByText("porcentajes que no están en tus datos").count()) >= 1);

  // Respuesta sin formato
  await respuesta.fill("Claro, tu presupuesto se ve muy bien.");
  rec(donde, "sin el formato pedido: mensaje claro con la solución", (await page.getByText("Todavía no puedo armar los paneles").isVisible()) && (await page.getByText("Pega la respuesta completa usando el botón Copiar de tu IA").count()) >= 1);
  rec(donde, "el tip de usar el botón Copiar de la IA está visible", await page.getByText("usa el botón Copiar de tu IA").first().isVisible());

  // «Otro ejemplo» recorre los 3 perfiles (el último usa dólares)
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  const destinos = new Set<string>([await page.getByRole("textbox", { name: /^Destino/ }).inputValue()]);
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Otro ejemplo" }).first().click();
    await page.waitForTimeout(80);
    destinos.add(await page.getByRole("textbox", { name: /^Destino/ }).inputValue());
  }
  rec(donde, "«Otro ejemplo» recorre los 3 perfiles", destinos.size === 3 && [cusco, paracas, santiago].every((e) => destinos.has(e.datos.destino)), [...destinos].join(" | "));
  rec(donde, "el perfil en dólares convierte con el tipo de cambio: S/ 3,459.40 y ≈ USD 922.51", (await total()).includes("3,459.40") && (await page.locator("#resumen-movil").innerText()).includes("922.51"));

  // Datos propios y confirmación
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  await page.getByRole("textbox", { name: /^Destino/ }).fill("Arequipa (prueba)");
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "los datos propios se guardan y siguen tras recargar", (await page.getByRole("textbox", { name: /^Destino/ }).inputValue()) === "Arequipa (prueba)");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  rec(donde, "con datos propios pide confirmación antes de reemplazar", await page.getByText("¿Reemplazar lo que escribiste con datos de ejemplo?").isVisible());
  await page.getByRole("button", { name: "Reemplazar" }).click();
  await page.getByRole("button", { name: "Deshacer" }).click();
  rec(donde, "«Deshacer» devuelve lo que la persona había escrito", (await page.getByRole("textbox", { name: /^Destino/ }).inputValue()) === "Arequipa (prueba)");

  await basicas(page, donde);
  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosPresupuesto(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_PRES, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Destino/ }).fill("Otro destino");
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Descargar CSV/ }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica presupuesto", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorEntrevista(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `entrevista @${v.nombre}`;
  await page.goto(base + RUTA_ENT, { waitUntil: "networkidle" });
  const [carlos, andrea, marcos] = EJEMPLOS_ENTREVISTA;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const cvCaja = page.getByLabel(/^Tu CV, en texto/);
  const respuesta = page.getByRole("textbox", { name: "Respuesta de la IA" });
  const tab = (n: string) => page.getByRole("tab", { name: n, exact: true });
  const tiempo = () => page.locator("[data-tiempo]").innerText();

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu resultado») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu resultado") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  const p0 = await prompt();
  rec(donde, "el prompt vacío tiene los 8 bloques y «(no indicado)»", ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"].every((b) => p0.includes(b)) && p0.includes("(no indicado)"));
  rec(donde, "el medidor dice «(recomendado: 80 %)» y arranca en 0 %", (await page.getByText("(recomendado: 80 %)").isVisible()) && (await page.getByText("Datos completados: 0 %").isVisible()));

  // Ejemplo del paso 1 (Carlos, técnica, banco)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena CV, oferta, tipo, modo y dificultad", (await cvCaja.inputValue()).includes("CARLOS MENDOZA RIVAS") && (await page.getByLabel(/^La oferta laboral completa/).inputValue()).includes("FinTech Pampa") && (await page.getByRole("radio", { name: /^Técnica/ }).isChecked()) && (await page.getByRole("radio", { name: /Banco de preguntas/ }).isChecked()) && (await page.getByRole("radio", { name: /^Exigente/ }).isChecked()));
  const p1 = await prompt();
  rec(donde, "el prompt se arma con los datos de ejemplo", p1.includes("CARLOS MENDOZA RIVAS") && p1.includes("Tipo de entrevista: Técnica") && p1.includes("<oferta>") && p1.includes("No tengo experiencia con Docker") && p1.includes("## Banco de preguntas"));
  rec(donde, "medidor al 100 % y aviso «Estás viendo datos de ejemplo»", (await page.getByText("Datos completados: 100 %").isVisible()) && (await page.locator("[data-aviso-ejemplo]").isVisible()));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-entrevista-datos-v1"))) === null);
  await page.getByRole("radio", { name: /Simulación en vivo/ }).check();
  const ps = await prompt();
  rec(donde, "el modo simulación cambia el prompt (una pregunta a la vez, sin banco, informe final)", ps.includes("MODO SIMULACIÓN") && ps.includes("UNA pregunta a la vez") && ps.includes("## Informe de simulación") && !ps.includes("## Banco de preguntas"));
  await page.getByRole("radio", { name: /Banco de preguntas/ }).check();
  await captura(page, `entrevista-paso1-${v.nombre}`);

  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === (await prompt()));

  // Respuesta de ejemplo: paneles
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.getByRole("tab", { name: "Resumen" }).first().waitFor();
  rec(donde, "la respuesta de ejemplo abre los paneles del banco (sin «Informe de simulación»)", (await page.locator("[role=tablist][aria-label='Paneles del resultado'] [role=tab]").count()) === 6 && (await tab("Informe de simulación").count()) === 0);
  rec(donde, "Resumen: 12 preguntas probables, 3 riesgos y «Datos que no vienen de los tuyos»", (await page.getByText("Preguntas probables", { exact: true }).isVisible()) && (await page.getByText("Datos que no vienen de los tuyos", { exact: true }).isVisible()) && (await page.getByText("Qué revisar antes de usarlo", { exact: true }).isVisible()));
  await tab("Mapa y riesgos").click();
  rec(donde, "Mapa y riesgos: responsabilidades y el riesgo «Docker»", (await page.getByText("Responsabilidades", { exact: true }).count()) >= 1 && (await page.getByText("REQUISITO NO EVIDENCIADO", { exact: true }).count()) >= 1);
  await tab("Banco de preguntas").click();
  rec(donde, "Banco: 12 tarjetas con qué evalúa, experiencia del CV, estructura y repregunta", (await page.locator("[data-pregunta]").count()) === 12 && (await page.getByText("Qué evalúa:").count()) >= 12 && (await page.getByText("Repregunta probable:").count()) >= 12);
  await page.getByLabel("Categoría", { exact: true }).selectOption("Conductuales");
  rec(donde, "el filtro por categoría muestra solo las conductuales (2)", (await page.locator("[data-pregunta]").count()) === 2);
  await captura(page, `entrevista-banco-${v.nombre}`);

  // «Practicar esta» lleva la pregunta a la práctica cronometrada
  await page.getByRole("button", { name: "Practicar esta: pregunta 6" }).click();
  await page.waitForTimeout(400);
  rec(donde, "«Practicar esta» pone la pregunta en la práctica, con su estructura sugerida", (await page.locator("#pregunta-practica").inputValue()).includes("incidente en producción") && ((await page.locator("[data-guia-pregunta]").innerText()).includes("Situación")));

  // Cronómetro
  rec(donde, "el cronómetro arranca en 2:00", (await tiempo()) === "2:00");
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await page.waitForTimeout(1400);
  const enMarcha = await tiempo();
  rec(donde, "el cronómetro cuenta hacia atrás", enMarcha !== "2:00" && /^1:5\d$/.test(enMarcha), enMarcha);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const pausado = await tiempo();
  await page.waitForTimeout(1100);
  rec(donde, "«Pausar» detiene el tiempo y avisa cuánto llevas", (await tiempo()) === pausado && (await page.getByText(/Pausado\. Llevas/).isVisible()));
  await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
  rec(donde, "«Reiniciar» vuelve a 2:00", (await tiempo()) === "2:00");

  // Grabadora (micrófono falso de Chrome)
  await page.getByRole("button", { name: "Grabar respuesta" }).click();
  await page.getByText("Grabando…").first().waitFor();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Detener" }).click();
  await page.locator("audio[aria-label='Tu grabación']").waitFor();
  const href = await page.getByRole("link", { name: /Descargar grabación/ }).getAttribute("href");
  rec(donde, "la grabadora guarda el audio solo en memoria (blob:) y permite escucharlo y descargarlo", (href ?? "").startsWith("blob:") && (await page.locator("audio[aria-label='Tu grabación']").count()) === 1, String(href));
  await page.getByRole("button", { name: /Descartar/ }).click();
  rec(donde, "«Descartar» elimina la grabación", (await page.locator("audio[aria-label='Tu grabación']").count()) === 0);

  // Notas: contradicciones y guion
  const notas = page.getByLabel("Hoja para anotar");
  await notas.fill("Resolví la caída en 40 minutos con Datadog.");
  rec(donde, "las notas con datos que no están en el CV avisan (40 y Datadog)", (await page.locator("[data-aviso-contradiccion]").innerText()).includes("40") && (await page.locator("[data-aviso-contradiccion]").innerText()).includes("Datadog"));
  await notas.fill("punto clave ".repeat(70));
  rec(donde, "las notas largas avisan de que parecen un guion", await page.locator("[data-aviso-guion]").isVisible());
  await notas.fill("");

  // Historias STAR
  await tab("Mis historias STAR").click();
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(historias STAR/ }).click();
  await page.getByText("Historias de ejemplo cargadas").first().waitFor();
  rec(donde, "las historias de ejemplo (3) se cargan sin guardarse como dato de la persona", (await page.locator("[data-historia]").count()) === 3 && (await page.evaluate(() => window.localStorage.getItem("gpia-entrevista-historias-v1"))) === null);
  rec(donde, "cobertura: 3 historias completas, 7 de las 8 competencias (falta Liderazgo)", (await page.locator("[data-cobertura]").innerText()).includes("Historias completas: 3 de 5–7") && (await page.getByText("Liderazgo (te falta)").count()) === 1 && (await page.locator("[data-cobertura] li:has-text('(cubierta)')").count()) === 7);
  rec(donde, "una historia sin cifra en el resultado sugiere un dato real", (await page.locator("[data-aviso-sin-dato]").count()) >= 1);
  const [wordH] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Exportar a Word/ }).click()]);
  const xmlH = await leerDocx(wordH);
  rec(donde, "«Exportar a Word» descarga historias-STAR-ejemplo.docx con las historias", wordH.suggestedFilename() === "historias-STAR-ejemplo.docx" && xmlH.includes("La caída del servicio de pagos") && xmlH.includes("Situación:"), wordH.suggestedFilename());
  await page.getByRole("button", { name: "Copiar como texto" }).click();
  rec(donde, "«Copiar como texto» copia las historias", (await page.evaluate(() => navigator.clipboard.readText())).includes("1. La caída del servicio de pagos"));
  await page.getByRole("button", { name: "Agregar historia" }).click();
  rec(donde, "«Agregar historia» suma una tarjeta vacía", (await page.locator("[data-historia]").count()) === 4);
  const nueva = page.locator("[data-historia]").nth(3);
  await nueva.getByLabel("Acción").fill("Usé Datadog para monitorear los servicios.");
  rec(donde, "una historia con datos que no están en el CV avisa de la contradicción", (await nueva.locator("[data-aviso-contradiccion]").innerText()).includes("Datadog"));
  await nueva.getByRole("button", { name: /^Quitar la historia 4/ }).click();
  rec(donde, "«Quitar» elimina la historia", (await page.locator("[data-historia]").count()) === 3);

  // Checklist del día previo
  await tab("Checklist del día previo").click();
  const items = page.locator("[role=tabpanel] input[type=checkbox]");
  const total = await items.count();
  rec(donde, "la checklist tiene ítems fijos y de tus datos (tema de prioridad alta sobre Docker)", total >= 12 && (await page.locator("[role=tabpanel]").getByText("Repasé el tema de prioridad alta: Docker").count()) === 1, String(total));
  await items.first().check();
  rec(donde, "marcar un ítem actualiza el avance", (await page.locator("[data-progreso-checklist]").innerText()).startsWith("1 de"));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "Checklist del día previo" }).click();
  rec(donde, "las marcas de la checklist se guardan en el navegador", (await page.locator("[data-progreso-checklist]").innerText()).startsWith("1 de"));
  rec(donde, "existe la checklist imprimible (oculta en pantalla)", (await page.locator("#entrevista-imprimible-checklist").count()) === 1 && !(await page.locator("#entrevista-imprimible-checklist").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-entrevista-checklist"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve la checklist", (await page.locator("#entrevista-imprimible-checklist").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-entrevista-checklist"));

  // Vuelve el ejemplo (tras recargar) y prueba la hoja de estudio
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await tab("Hoja de estudio").click();
  rec(donde, "Hoja de estudio: temas por prioridad, riesgos, preguntas y preguntas al entrevistador", (await page.locator("[data-hoja]").innerText()).includes("Temas a estudiar (por prioridad)") && (await page.locator("[data-hoja]").innerText()).includes("Preguntas para practicar") && (await page.locator("[data-hoja]").innerText()).includes("Preguntas para el entrevistador"));
  const [wordE] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Descargar hoja de estudio/ }).click()]);
  rec(donde, "la hoja del ejemplo se descarga como hoja-de-estudio-ejemplo.docx con los temas", wordE.suggestedFilename() === "hoja-de-estudio-ejemplo.docx" && (await leerDocx(wordE)).includes("Docker"), wordE.suggestedFilename());
  await page.getByRole("button", { name: "Copiar como texto" }).last().click();
  rec(donde, "«Copiar como texto» copia la hoja", (await page.evaluate(() => navigator.clipboard.readText())).includes("TEMAS A ESTUDIAR"));

  // Datos inventados por la IA
  await respuesta.fill(carlos.respuesta.replace("- Herramientas: Docker y RabbitMQ (Kubernetes básico es deseable).", "- Herramientas: Docker, RabbitMQ y Terraform."));
  await tab("Resumen").click();
  rec(donde, "Resumen avisa de nombres o herramientas que no están en tus datos (Terraform)", (await page.getByText("Terraform").count()) >= 1);

  // Respuesta sin formato
  await respuesta.fill("Claro, ¡empecemos! Cuéntame sobre ti.");
  rec(donde, "sin el formato pedido: mensaje claro con la solución", (await page.getByText("Todavía no puedo armar los paneles").isVisible()) && (await page.getByText("Pega la respuesta completa usando el botón Copiar de tu IA").count()) >= 1);
  rec(donde, "el tip de usar el botón Copiar de la IA está visible", await page.getByText("usa el botón Copiar de tu IA").first().isVisible());

  // «Otro ejemplo» recorre los 3 perfiles y el último es una simulación con informe
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  const perfiles = new Set<string>([(await cvCaja.inputValue()).split("\n")[0]]);
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Otro ejemplo" }).first().click();
    await page.waitForTimeout(80);
    perfiles.add((await cvCaja.inputValue()).split("\n")[0]);
  }
  rec(donde, "«Otro ejemplo» recorre los 3 perfiles", perfiles.size === 3 && [carlos, andrea, marcos].every((e) => perfiles.has(e.datos.cv.split("\n")[0])), [...perfiles].join(" | "));
  rec(donde, "el tercer perfil (Marcos) usa el modo simulación con jefe directo", (await page.getByRole("radio", { name: /Simulación en vivo/ }).isChecked()) && (await page.getByRole("radio", { name: /^Con el jefe directo/ }).isChecked()) && (await prompt()).includes("MODO SIMULACIÓN"));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.getByText("¿Reemplazar la respuesta que pegaste con una de ejemplo?").waitFor();
  await page.getByRole("button", { name: "Reemplazar" }).click();
  await page.getByRole("tab", { name: "Informe de simulación" }).waitFor();
  await tab("Informe de simulación").click();
  rec(donde, "Informe: 8 evaluaciones con claridad, evidencia, relación con el puesto y duración", (await page.locator("[data-evaluacion]").count()) === 8 && (await page.getByText("Claridad: Alta").count()) >= 1 && (await page.getByText("Duración: Adecuada").count()) >= 1);
  rec(donde, "Informe: fortalezas, puntos débiles y plan de práctica", (await page.getByRole("heading", { name: "Fortalezas", exact: true }).isVisible()) && (await page.getByRole("heading", { name: "Puntos débiles", exact: true }).isVisible()) && (await page.getByRole("heading", { name: "Plan de práctica", exact: true }).isVisible()));
  await captura(page, `entrevista-informe-${v.nombre}`);

  // Datos propios y confirmación
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  await cvCaja.fill("Mi CV de prueba con suficiente texto.");
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "los datos propios se guardan y siguen tras recargar", (await cvCaja.inputValue()) === "Mi CV de prueba con suficiente texto.");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  rec(donde, "con datos propios pide confirmación antes de reemplazar", await page.getByText("¿Reemplazar lo que escribiste con datos de ejemplo?").isVisible());
  await page.getByRole("button", { name: "Reemplazar" }).click();
  await page.getByRole("button", { name: "Deshacer" }).click();
  rec(donde, "«Deshacer» devuelve lo que la persona había escrito", (await cvCaja.inputValue()) === "Mi CV de prueba con suficiente texto.");

  await basicas(page, donde);
  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosEntrevista(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_ENT, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByLabel(/^Tu CV, en texto/).fill("Otro CV");
  await page.getByRole("tab", { name: "Mis historias STAR" }).click();
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(historias STAR/ }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Exportar a Word/ }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica entrevista", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorAnalisis(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `análisis @${v.nombre}`;
  await page.goto(base + RUTA_ANA, { waitUntil: "networkidle" });
  const [ana] = EJEMPLOS_ANALISIS;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const cvCaja = page.getByLabel(/^Tu CV, en texto/);
  const respuesta = page.getByRole("textbox", { name: "Respuesta de la IA" });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => page.getByRole("tab", { name: n, exact: true });
  const porcentaje = () => paso3.locator("[data-porcentaje]").innerText();

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu resultado») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu resultado") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  const p0 = await prompt();
  rec(donde, "el prompt vacío tiene los 8 bloques y «(no indicado)»", ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"].every((b) => p0.includes(b)) && p0.includes("(no indicado)"));
  rec(donde, "el medidor dice «(recomendado: 80 %)» y arranca en 0 %", (await page.getByText("(recomendado: 80 %)").isVisible()) && (await page.getByText("Datos completados: 0 %").isVisible()));
  rec(donde, "el deslizador arranca en 70 % / 30 %", (await page.getByText("Peso de los requisitos obligatorios: 70 %").isVisible()) && (await page.locator("#paso-1").getByRole("slider").inputValue()) === "70");

  // Ejemplo del paso 1 (Ana)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena CV, oferta, años y «Sí, los distingue»", (await cvCaja.inputValue()).includes("ANA TORRES PAREDES") && (await page.getByLabel(/^La oferta laboral completa/).inputValue()).includes("Agencia Andes Creativa") && (await page.getByLabel("Años de experiencia totales").inputValue()) === "0,7" && (await page.getByRole("radio", { name: "Sí, los distingue" }).isChecked()));
  const p1 = await prompt();
  rec(donde, "el prompt se arma con los datos de ejemplo y los pesos", p1.includes("ANA TORRES PAREDES") && p1.includes("Años de experiencia totales que declara el candidato: 0,7") && p1.includes("obligatorios 70 %, deseables 30 %") && p1.includes("requisito,categoria,tipo,estado,evidencia"));
  rec(donde, "medidor al 100 % y aviso «Estás viendo datos de ejemplo»", (await page.getByText("Datos completados: 100 %").isVisible()) && (await page.locator("[data-aviso-ejemplo]").isVisible()));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-analisis-datos-v1"))) === null);
  await page.locator("#paso-1").getByRole("slider").fill("50");
  rec(donde, "mover el deslizador del formulario actualiza el prompt (50 % / 50 %)", (await prompt()).includes("obligatorios 50 %, deseables 50 %"));
  await page.locator("#paso-1").getByRole("slider").fill("70");
  await page.getByLabel("Años de experiencia totales").fill("abc");
  rec(donde, "unos años que no son un número muestran el error junto al campo", await page.getByText("Escribe un número de años, por ejemplo 3 o 0,7.").isVisible());
  await page.getByLabel("Años de experiencia totales").fill("0,7");
  await captura(page, `analisis-paso1-${v.nombre}`);

  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === (await prompt()));

  // Respuesta de ejemplo: resultado
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.locator("[data-porcentaje]").waitFor();
  rec(donde, "el porcentaje de Ana es 62 %, recalculado por la página", (await porcentaje()) === "62 %");
  rec(donde, "la fórmula se ve con los números: (0.70 × 0.67 + 0.30 × 0.50) ÷ (0.70 + 0.30) = 0.62 → 62 %", (await paso3.locator("[data-formula]").innerText()) === "(0.70 × 0.67 + 0.30 × 0.50) ÷ (0.70 + 0.30) = 0.62 → 62 %");
  rec(donde, "se aclara que no es una probabilidad de contratación", await paso3.getByText("No es tu probabilidad de ser contratado ni garantiza pasar un ATS").isVisible());
  rec(donde, "semáforo: «Postula ajustando» con Google Analytics 4 y el año de experiencia", (await paso3.locator("[data-semaforo=ajustando]").innerText()).includes("Postula ajustando") && (await paso3.locator("[data-semaforo]").innerText()).includes("Google Analytics 4"));
  rec(donde, "la regla del semáforo es visible", await paso3.getByText("Ver la regla del semáforo").isVisible());
  rec(donde, "conteo por estado: 2 cumplen, 2 parciales, 1 no identificado y 1 no evaluable", (await paso3.locator("[data-conteo]").innerText()).replace(/\s+/g, " ").includes("2 Cumple 2 Parcial 1 No identificado 1 No evaluable"));
  await captura(page, `analisis-resultado-${v.nombre}`);
  // Deslizador del resultado: recalcula al instante
  const deslizador = paso3.getByRole("slider");
  await deslizador.fill("100");
  const cien = await porcentaje();
  await deslizador.fill("0");
  const cero = await porcentaje();
  await deslizador.fill("70");
  rec(donde, "el deslizador del resultado recalcula al instante (100 % → 67 %, 0 % → 50 %, 70 % → 62 %)", cien === "67 %" && cero === "50 %" && (await porcentaje()) === "62 %", `${cien} ${cero}`);

  // Tabla filtrable y editable
  await tab("Tabla de requisitos").click();
  const filas = paso3.locator("[data-requisito]");
  rec(donde, "la tabla lista los 6 requisitos con tipo, estado y evidencia", (await filas.count()) === 6 && (await paso3.locator("[data-requisito] td", { hasText: "«Gestioné campañas en Meta Ads para promociones de la cafetería»" }).count()) === 1);
  await paso3.getByLabel("Estado", { exact: true }).selectOption("PARCIAL");
  rec(donde, "el filtro por estado muestra solo los parciales (2)", (await filas.count()) === 2);
  await paso3.getByLabel("Estado", { exact: true }).selectOption("todos");
  await paso3.getByLabel("Categoría", { exact: true }).selectOption("idiomas");
  rec(donde, "el filtro por categoría muestra solo idiomas (1)", (await filas.count()) === 1);
  await paso3.getByLabel("Categoría", { exact: true }).selectOption("todas");
  await paso3.getByLabel("Estado de «Inglés intermedio»").selectOption("CUMPLE");
  rec(donde, "corregir un estado marca la fila como editada", (await paso3.getByText("editado · restablecer").count()) === 1);
  await tab("Resumen").click();
  rec(donde, "…y el porcentaje se recalcula (77 %)", (await porcentaje()) === "77 %", await porcentaje());
  await tab("Tabla de requisitos").click();
  await paso3.getByRole("button", { name: /Restablecer los 1 cambio/ }).click();
  await tab("Resumen").click();
  rec(donde, "«Restablecer» devuelve el 62 %", (await porcentaje()) === "62 %");
  await tab("Tabla de requisitos").click();
  const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Descargar CSV/ }).click()]);
  const contenido = fs.readFileSync((await csv.path())!, "utf8");
  rec(donde, "el CSV del ejemplo (analisis-requisitos-EJEMPLO.csv) lleva BOM, las filas y el 62 %", csv.suggestedFilename() === "analisis-requisitos-EJEMPLO.csv" && contenido.startsWith("﻿") && contenido.includes("Manejo de Meta Ads,herramientas,OBLIGATORIO,CUMPLE") && contenido.includes("62 %"), csv.suggestedFilename());
  await page.getByRole("button", { name: /Copiar como tabla/ }).click();
  const tabla = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "«Copiar como tabla» deja filas separadas por tabuladores", tabla.includes("\t") && tabla.split("\n").length === 8 && tabla.includes("Porcentaje orientativo"));
  await tab("Palabras clave").click();
  rec(donde, "Palabras clave: «Google Analytics 4» con equivalente e «Inglés intermedio» sin equivalente", (await paso3.locator("[data-palabras] > li").count()) === 2 && (await paso3.getByText("sin equivalente en tu CV").count()) === 1);
  await tab("Fortalezas y brechas").click();
  rec(donde, "Fortalezas y brechas", (await paso3.getByRole("heading", { name: "Fortalezas", exact: true }).isVisible()) && (await paso3.getByRole("heading", { name: "Brechas", exact: true }).isVisible()));
  await tab("Plan de acción").click();
  rec(donde, "Plan de acción agrupado en CV, entrevista y aprender", (await paso3.getByRole("heading", { name: /Qué ajustar en tu CV/ }).isVisible()) && (await paso3.getByRole("heading", { name: /Qué preparar para la entrevista/ }).isVisible()) && (await paso3.getByRole("heading", { name: /Qué aprender/ }).isVisible()));
  rec(donde, "con datos de ejemplo no se lleva nada a otras herramientas (botones desactivados y explicados)", (await paso3.getByRole("button", { name: /Llevar a Optimizar CV/ }).isDisabled()) && (await paso3.getByRole("button", { name: /Llevar a Preparar entrevista/ }).isDisabled()) && (await paso3.getByText("Con datos de ejemplo no se lleva nada").isVisible()));
  await tab("Por verificar").click();
  rec(donde, "Por verificar: puntos a verificar, verificaciones automáticas y siguiente paso", (await paso3.getByRole("heading", { name: "A verificar", exact: true }).isVisible()) && (await paso3.getByText("Verificaciones automáticas de la página").isVisible()) && (await paso3.getByRole("heading", { name: "Siguiente paso" }).isVisible()));
  await tab("Resumen").click();
  await tab("Resumen").focus();
  await page.keyboard.press("ArrowRight");
  rec(donde, "las pestañas se mueven con las flechas del teclado", (await tab("Tabla de requisitos").getAttribute("aria-selected")) === "true");

  // «Otro ejemplo»: Renato (sin distinguir) y Lucía (falta SAP)
  await tab("Resumen").click();
  await paso3.getByRole("button", { name: "Otro ejemplo" }).click();
  await paso3.locator("[data-porcentaje]").waitFor();
  rec(donde, "Renato: la oferta no distingue, el porcentaje es 40 % y el deslizador está desactivado", (await porcentaje()) === "40 %" && (await paso3.getByRole("slider").isDisabled()) && (await page.getByRole("radio", { name: "No los distingue" }).isChecked()) && (await paso3.locator("[data-formula]").innerText()).startsWith("0.40"));
  rec(donde, "Renato: «Postula si cumples…» con Power BI e inglés técnico", (await paso3.locator("[data-semaforo=si-cumples]").innerText()).includes("Construir dashboards en Power BI") && (await paso3.locator("[data-semaforo]").innerText()).includes("Inglés técnico"));
  await paso3.getByRole("button", { name: "Otro ejemplo" }).click();
  await page.waitForTimeout(150);
  rec(donde, "Lucía: peso 60 %, porcentaje 55 % y «Postula si cumples…» SAP", (await porcentaje()) === "55 %" && (await paso3.locator("[data-semaforo=si-cumples]").innerText()).includes("Manejo de SAP") && (await page.locator("#paso-1").getByRole("slider").inputValue()) === "60");
  await paso3.getByRole("button", { name: "Otro ejemplo" }).click();
  await page.waitForTimeout(150);
  rec(donde, "«Otro ejemplo» vuelve a Ana (3 perfiles)", (await cvCaja.inputValue()).includes("ANA TORRES PAREDES") && (await porcentaje()) === "62 %");

  // Datos inventados por la IA
  await respuesta.fill(ana.respuesta.replace("«Diseñé piezas gráficas en Canva para redes sociales»", "«Lideré un equipo de 12 diseñadores»").replace("- Ya arma reportes semanales", "- Usa Datadog y ya arma reportes semanales"));
  rec(donde, "Resumen avisa de citas que no están en el CV y de nombres ajenos (Lideré, Datadog)", (await paso3.getByText("Lideré un equipo").count()) >= 1 && (await paso3.getByText("Datadog").count()) >= 1);

  // Respuesta sin formato
  await respuesta.fill("Claro, tu CV encaja bastante bien con la oferta.");
  rec(donde, "sin el formato pedido: mensaje claro con la solución", (await page.getByText("Todavía no puedo leer la tabla").isVisible()) && (await page.getByText("Pega la respuesta completa usando el botón Copiar de tu IA").count()) >= 1);
  rec(donde, "el tip de usar el botón Copiar de la IA está visible", await page.getByText("usa el botón Copiar de tu IA").first().isVisible());

  await basicas(page, donde);
  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

/** Con datos propios: «Llevar a Preparar entrevista» y «Llevar a Optimizar CV» pasan el CV, la oferta y las brechas. */
/** Espera (hasta 4 s) a que una condición asíncrona sea verdadera: los datos guardados se leen tras hidratar la página. */
async function espera(cond: () => Promise<boolean>, ms = 4000): Promise<boolean> {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    if (await cond().catch(() => false)) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return cond().catch(() => false);
}

async function traspasoAnalisis(browser: Browser) {
  const { ctx, page, errores } = await abrir(browser, VIEWPORTS[1]);
  const donde = "análisis · llevar brechas";
  const miCv = "MI CV DE PRUEBA\nEjecutivo de ventas con experiencia en atención de clientes, Excel intermedio y seguimiento de cartera durante varios años.\nInglés B1 certificado en 2024.";
  const miOferta = "Ejecutivo comercial: requisitos indispensables: manejo de SAP, Excel intermedio. Deseable: curso de tributación e inglés.";
  const respuestaPropia = "## Requisitos\nrequisito,categoria,tipo,estado,evidencia\nManejo de SAP,tecnologías,OBLIGATORIO,NO IDENTIFICADO,(sin evidencia)\nExcel intermedio,herramientas,OBLIGATORIO,CUMPLE,«Excel intermedio»\nCurso de tributación,certificaciones,DESEABLE,NO IDENTIFICADO,(sin evidencia)\nInglés,idiomas,DESEABLE,PARCIAL,«Inglés B1 certificado en 2024»\n\n## Plan de acción\n- [CV] Escribe SAP solo si lo usaste.\n- [ENTREVISTA] Prepara una respuesta honesta sobre SAP.";
  await page.goto(base + RUTA_ANA, { waitUntil: "networkidle" });
  await page.getByLabel(/^Tu CV, en texto/).fill(miCv);
  await page.getByLabel(/^La oferta laboral completa/).fill(miOferta);
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "los datos propios se guardan y siguen tras recargar", (await page.getByLabel(/^Tu CV, en texto/).inputValue()) === miCv);
  const irAlPlan = async () => {
    await page.getByRole("textbox", { name: "Respuesta de la IA" }).fill(respuestaPropia);
    await page.getByRole("tab", { name: "Plan de acción", exact: true }).click();
  };
  await irAlPlan();
  const paso3 = page.locator("#paso-3");
  rec(donde, "con datos propios los botones «Llevar…» están activos", (await paso3.getByRole("button", { name: /Llevar a Preparar entrevista/ }).isEnabled()) && (await paso3.getByRole("button", { name: /Llevar a Optimizar CV/ }).isEnabled()));
  // A Preparar entrevista (sin datos previos): navega y llega con el CV, la oferta y las brechas.
  await Promise.all([page.waitForURL("**/preparar-entrevista-de-trabajo#paso-1"), paso3.getByRole("button", { name: /Llevar a Preparar entrevista/ }).click()]);
  await page.getByLabel(/^Tu CV, en texto/).waitFor();
  rec(donde, "«Preparar entrevista» recibe el CV y la oferta", await espera(async () => (await page.getByLabel(/^Tu CV, en texto/).inputValue()) === miCv && (await page.getByLabel(/^La oferta laboral completa/).inputValue()) === miOferta));
  await espera(async () => (await page.getByLabel("Temas que te preocupan").inputValue()) !== "");
  const temas = await page.getByLabel("Temas que te preocupan").inputValue();
  rec(donde, "…y las brechas pasan a «Temas que te preocupan» (obligatorios primero)", temas.startsWith("Requisitos de la oferta que mi CV no evidencia del todo: Manejo de SAP (no identificado, obligatorio)") && temas.includes("Inglés (parcial)"), temas);
  // A Optimizar CV.
  await page.goto(base + RUTA_ANA, { waitUntil: "networkidle" });
  await irAlPlan();
  await Promise.all([page.waitForURL("**/optimizar-cv#paso-1"), paso3.getByRole("button", { name: /Llevar a Optimizar CV/ }).click()]);
  await page.getByLabel(/^Tu CV actual, en texto/).waitFor();
  rec(donde, "«Optimizar CV» recibe el CV y la oferta", await espera(async () => (await page.getByLabel(/^Tu CV actual, en texto/).inputValue()) === miCv && (await page.getByLabel(/^La oferta laboral completa/).inputValue()) === miOferta));
  // Confirmación cuando el destino ya tiene datos.
  await page.goto(base + RUTA_ANA, { waitUntil: "networkidle" });
  await irAlPlan();
  await paso3.getByRole("button", { name: /Llevar a Preparar entrevista/ }).click();
  rec(donde, "si la otra herramienta ya tiene datos, pide confirmación", await paso3.getByText("Esa herramienta ya tiene un CV o una oferta guardados").isVisible());
  await paso3.getByRole("button", { name: "Cancelar" }).click();
  rec(donde, "«Cancelar» no navega ni reemplaza nada", page.url().includes("analizar-oferta-laboral") && !(await paso3.getByText("Esa herramienta ya tiene un CV").count()));
  await paso3.getByRole("button", { name: /Llevar a Preparar entrevista/ }).click();
  await Promise.all([page.waitForURL("**/preparar-entrevista-de-trabajo#paso-1"), paso3.getByRole("button", { name: "Reemplazar y continuar" }).click()]);
  rec(donde, "«Reemplazar y continuar» navega a la otra herramienta", page.url().includes("preparar-entrevista-de-trabajo"));
  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosAnalisis(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_ANA, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByLabel(/^Tu CV, en texto/).fill("Otro CV");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.getByRole("tab", { name: "Tabla de requisitos", exact: true }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Descargar CSV/ }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica análisis", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorSalario(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `salario @${v.nombre}`;
  await page.goto(base + RUTA_SAL, { waitUntil: "networkidle" });
  const [op] = EJEMPLOS_SALARIO;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const cargo = page.getByRole("textbox", { name: /^Cargo/ });
  const respuesta = page.getByRole("textbox", { name: "Respuesta de la IA" });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => page.getByRole("tab", { name: n, exact: true });
  const valor = (k: string) => page.locator(`[data-valor=${k}]`).innerText();

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu resultado») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu resultado") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  const p0 = await prompt();
  rec(donde, "el prompt vacío tiene los 8 bloques y «(no indicado)»", ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"].every((b) => p0.includes(b)) && p0.includes("(no indicado)"));
  rec(donde, "el medidor dice «(recomendado: 80 %)» y arranca en 0 %; el resumen tiene un estado vacío amable", (await page.getByText("(recomendado: 80 %)").isVisible()) && (await page.getByText("Datos completados: 0 %").isVisible()) && (await page.getByText("Aquí verás el valor anual").isVisible()));
  rec(donde, "sin datos, exportar está desactivado", await page.getByRole("button", { name: /Descargar CSV/ }).isDisabled());

  // Ejemplo del paso 1 (Analista de Operaciones)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  const oferta = page.getByRole("group", { name: "La oferta", exact: true });
  rec(donde, "el ejemplo llena cargo, oferta, referencias y cifras", (await cargo.inputValue()) === "Analista de Operaciones" && (await oferta.getByLabel(/^Salario fijo mensual bruto/).inputValue()) === "4000" && (await page.locator("[data-referencias] > li").count()) === 2 && (await page.getByLabel(/^Mínimo aceptable/).inputValue()) === "4200");
  rec(donde, "el valor anual: conservador S/ 53,120.00 y completo S/ 57,120.00 (después de costos)", (await valor("conservador")) === "S/ 53,120.00" && (await valor("completo")) === "S/ 57,120.00", `${await valor("conservador")} ${await valor("completo")}`);
  const formulas = await page.locator("[data-formulas]").first().innerText();
  rec(donde, "las fórmulas son visibles: 4,000.00 × 14 pagos = 56,000.00 y el costo 3 días × 48 semanas × 20.00 = 2,880.00", formulas.includes("4,000.00 × 14 pagos = 56,000.00") && formulas.includes("3 días × 48 semanas × 20.00 por día = 2,880.00") && formulas.includes("60,000.00 − 2,880.00 = 57,120.00"));
  rec(donde, "se avisa de que bruto no es neto y que la herramienta no calcula impuestos", await page.getByText("Bruto no es neto.").isVisible());
  rec(donde, "las cifras frente a la oferta: +S/ 200.00 (+5 %), +S/ 600.00 (+15 %) y +S/ 900.00 (+22.5 %)", (await page.locator("[data-cifras-vs-oferta]").innerText()).includes("+S/ 200.00 al mes (+5 %)") && (await page.locator("[data-cifras-vs-oferta]").innerText()).includes("+S/ 900.00 al mes (+22.5 %)"));
  const resRef = await page.locator("[data-referencias-resumen]").innerText();
  rec(donde, "tus referencias: más baja 4,300.00, mediana 4,550.00 y más alta 4,800.00; el mínimo queda por debajo y el ancla por encima", resRef.includes("2 completas") && resRef.includes("Más baja: S/ 4,300.00") && resRef.includes("mediana: S/ 4,550.00") && resRef.includes("más alta: S/ 4,800.00") && resRef.includes("por debajo de tu referencia más baja") && resRef.includes("por encima de tu referencia más alta"));
  rec(donde, "medidor al 100 % y aviso «Estás viendo datos de ejemplo»", (await page.getByText("Datos completados: 100 %").isVisible()) && (await page.locator("[data-aviso-ejemplo]").isVisible()));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-salario-datos-v1"))) === null);
  const p1 = await prompt();
  rec(donde, "el prompt incluye la oferta, los cálculos, las referencias y las cifras", p1.includes("Salario fijo anual: 4,000.00 × 14 pagos = 56,000.00") && p1.includes("Referencia 1: S/ 4300 mensuales brutos") && p1.includes("Mínimo aceptable: S/ 4,200.00") && p1.includes("No inventes estadísticas, rangos ni promedios de mercado"));
  await captura(page, `salario-paso1-${v.nombre}`);

  // Validación de las tres cifras
  const objetivo = page.getByLabel(/^Objetivo \(/);
  await objetivo.fill("4000");
  rec(donde, "objetivo menor que el mínimo: error junto al campo", (await page.locator("[data-error-cifras]").first().innerText()).includes("El objetivo no puede ser menor que el mínimo aceptable."));
  await objetivo.fill("4600");
  rec(donde, "corregido el orden, el error desaparece", (await page.locator("[data-error-cifras]").count()) === 0);
  // Referencias: una incompleta avisa y no cuenta
  await page.getByRole("button", { name: "Agregar referencia" }).click();
  rec(donde, "una referencia nueva sin datos no avisa todavía; una a medias sí", (await page.locator("[data-referencias] > li").count()) === 3);
  await page.getByLabel(/^Referencia 3: salario mensual bruto/).fill("5000");
  rec(donde, "una referencia sin fuente ni fecha avisa que está incompleta y no cuenta", (await page.getByText("Esta referencia está incompleta").isVisible()) && (await page.locator("[data-referencias-resumen]").innerText()).includes("2 completas"));
  await page.getByRole("button", { name: "Quitar la referencia 3" }).click();
  // Prioridades
  await page.getByRole("button", { name: "Subir «Trabajo remoto»" }).click();
  rec(donde, "reordenar las prioridades cambia el prompt", (await prompt()).includes("Prioridades, en orden: 1. Dinero; 2. Estabilidad; 3. Aprendizaje; 4. Trabajo remoto; 5. Horario"));

  // Copiar prompt
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === (await prompt()));

  // Exportar el cálculo
  const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Descargar CSV/ }).click()]);
  const contenido = fs.readFileSync((await csv.path())!, "utf8");
  rec(donde, "el CSV del ejemplo (valor-anual-oferta-EJEMPLO.csv) lleva BOM, las fórmulas y las cifras", csv.suggestedFilename() === "valor-anual-oferta-EJEMPLO.csv" && contenido.startsWith("﻿") && contenido.includes("56000") && contenido.includes("Mis cifras,Ancla"), csv.suggestedFilename());
  await page.getByRole("button", { name: /Copiar como tabla/ }).click();
  rec(donde, "«Copiar como tabla» deja filas separadas por tabuladores", (await page.evaluate(() => navigator.clipboard.readText())).includes("\t"));

  // Respuesta de ejemplo: paneles
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.getByRole("tab", { name: "Resumen" }).first().waitFor();
  rec(donde, "la respuesta de ejemplo abre los 7 paneles", (await paso3.getByRole("tab").count()) === 7);
  rec(donde, "Resumen: contadores, «Qué revisar antes de usarlo» y aviso de que no es asesoría", (await paso3.getByText("Qué revisar antes de usarlo", { exact: true }).isVisible()) && (await paso3.getByRole("tabpanel").getByText("Respuestas preparadas", { exact: true }).isVisible()) && (await paso3.getByText("no asesoría laboral, legal ni tributaria").isVisible()));
  await tab("Oferta y preguntas").click();
  rec(donde, "Oferta y preguntas: la revisión y 7 preguntas al reclutador", (await paso3.getByText("El bono «de hasta 1 sueldo» está sujeto a metas").count()) >= 1 && (await paso3.getByText("¿Hay revisión salarial y cada cuánto tiempo?").count()) >= 1);
  await tab("Cifras y argumentos").click();
  rec(donde, "Cifras y argumentos: 5 argumentos con su evidencia", (await paso3.locator("[data-argumentos] > li").count()) === 5 && (await paso3.getByText("«Lideré la migración del inventario a SAP en mi puesto actual»").count()) >= 1);
  await tab("Respuestas preparadas").click();
  rec(donde, "Respuestas preparadas: 4 tarjetas copiables", (await paso3.locator("[data-respuesta]").count()) === 4);
  await paso3.getByRole("button", { name: /^Copiar la respuesta 4/ }).click();
  const correo = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "«Copiar respuesta» copia el correo completo, en varias líneas y con «Asunto:»", correo.startsWith("Asunto: Propuesta de contraoferta") && correo.split("\n").length >= 5 && correo.includes("Hola [nombre]:"));
  await captura(page, `salario-resultado-${v.nombre}`);
  await tab("Si no hay margen").click();
  rec(donde, "Si no hay margen: alternativas no salariales", (await paso3.getByText("Revisión salarial a los 6 meses por escrito").count()) >= 1);
  await tab("Checklist").click();
  await paso3.getByRole("checkbox").first().check();
  rec(donde, "la checklist se marca y muestra el avance (1 de 6)", (await paso3.locator("[data-progreso-checklist]").innerText()).startsWith("1 de 6"));
  await tab("Por verificar").click();
  rec(donde, "Por verificar: qué verificar, verificaciones automáticas y siguiente paso", (await paso3.getByRole("heading", { name: "Qué debes verificar" }).isVisible()) && (await paso3.getByText("Verificaciones automáticas de la página").isVisible()) && (await paso3.getByRole("heading", { name: "Siguiente paso" }).isVisible()));
  await tab("Resumen").click();
  await tab("Resumen").focus();
  await page.keyboard.press("ArrowRight");
  rec(donde, "las pestañas se mueven con las flechas del teclado", (await tab("Oferta y preguntas").getAttribute("aria-selected")) === "true");

  // Cifras de mercado inventadas y mínimo revelado
  await respuesta.fill(op.respuesta.replace("- ¿Qué condiciones tiene el período de prueba?", "- ¿Qué condiciones tiene el período de prueba? El mercado paga en promedio S/ 6,000 a este puesto.").replace("Gracias por la transparencia.", "Gracias por la transparencia. Mi mínimo es S/ 4,200."));
  await tab("Resumen").click();
  rec(donde, "Resumen avisa de cifras de mercado y de un mínimo revelado", (await paso3.getByText("6,000").count()) >= 1 && (await paso3.getByText("menciona(n) tu mínimo aceptable").count()) >= 1 && (await paso3.getByText("afirma datos de mercado").count()) >= 1);
  await tab("Respuestas preparadas").click();
  rec(donde, "la tarjeta que revela el mínimo lo marca", (await paso3.getByText("menciona tu mínimo", { exact: true }).count()) === 1);

  // Respuesta sin formato
  await respuesta.fill("Claro, negocia con confianza y pide lo que mereces.");
  rec(donde, "sin el formato pedido: mensaje claro con la solución", (await page.getByText("Todavía no puedo armar los paneles").isVisible()) && (await page.getByText("Pega la respuesta completa usando el botón Copiar de tu IA").count()) >= 1);
  rec(donde, "el tip de usar el botón Copiar de la IA está visible", await page.getByText("usa el botón Copiar de tu IA").first().isVisible());

  // «Otro ejemplo»: comparación de 2 ofertas
  await page.getByRole("button", { name: "Otro ejemplo" }).first().click();
  await page.waitForTimeout(150);
  rec(donde, "segundo ejemplo: aparece el grupo «La oferta B» y el valor de la oferta A (85,500.00 conservador)", (await page.getByRole("group", { name: "La oferta B", exact: true }).isVisible()) && (await valor("conservador")) === "S/ 85,500.00", await valor("conservador"));
  const comparador = page.locator("[data-comparador]");
  const textoComparador = await comparador.innerText();
  rec(donde, "el comparador muestra las diferencias: después de costos −4,300.00 (conservador) y −8,200.00 (completo)", textoComparador.includes("Después de costos (conservador)") && textoComparador.includes("−4,300.00") && textoComparador.includes("−8,200.00") && textoComparador.includes("Condiciones de las dos ofertas") === false);
  rec(donde, "el resumen compara A y B (diferencia B − A: −S/ 4,300.00)", (await page.locator("[data-mini-comparacion]").innerText()).includes("diferencia B − A: −S/ 4,300.00"));
  await captura(page, `salario-comparador-${v.nombre}`);

  // Tercer ejemplo: sin referencias y neto aproximado
  await page.getByRole("button", { name: "Otro ejemplo" }).first().click();
  await page.waitForTimeout(150);
  rec(donde, "tercer ejemplo: sin referencias la herramienta avisa y no compara tus cifras", (await page.locator("[data-sin-referencias]").isVisible()) && (await page.getByText("Datos completados: 85 %").isVisible()));
  rec(donde, "el neto aproximado solo aparece con el % de descuentos que escribiste (S/ 1,476.00)", (await page.locator("[data-formulas]").first().locator("xpath=../..").innerText()).includes("S/ 1,476.00") && (await page.getByText("Es tu estimación, no un cálculo de impuestos.").count()) >= 1);
  rec(donde, "presencial sin días escritos: 5 días × 48 semanas × 16.00 = 3,840.00", (await page.locator("[data-formulas]").first().innerText()).includes("5 días × 48 semanas × 16.00 por día = 3,840.00"));
  await page.getByRole("button", { name: "Otro ejemplo" }).first().click();
  await page.waitForTimeout(150);
  rec(donde, "«Otro ejemplo» vuelve al primero (3 perfiles)", (await cargo.inputValue()) === "Analista de Operaciones");

  // Datos propios
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  await cargo.fill("Cargo de prueba");
  await page.getByRole("textbox", { name: /^País y ciudad/ }).fill("Lima, Perú");
  await page.getByRole("radio", { name: "Remoto" }).check();
  await page.getByRole("group", { name: "La oferta", exact: true }).getByLabel(/^Salario fijo mensual bruto/).fill("3000");
  rec(donde, "con datos propios y modalidad remota, el valor anual es S/ 42,000.00 sin costo de trabajar", (await valor("conservador")) === "S/ 42,000.00" && (await valor("completo")) === "S/ 42,000.00");
  await page.getByRole("group", { name: "La oferta", exact: true }).getByLabel(/^Salario fijo mensual bruto/).fill("abc");
  rec(donde, "un salario que no es un número muestra el error junto al campo", await page.getByText("Escribe un número, por ejemplo 4000 o 4,000.50.").first().isVisible());
  await page.getByRole("group", { name: "La oferta", exact: true }).getByLabel(/^Salario fijo mensual bruto/).fill("3000");
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "los datos propios se guardan y siguen tras recargar", (await cargo.inputValue()) === "Cargo de prueba" && (await page.getByRole("radio", { name: "Remoto" }).isChecked()));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  rec(donde, "con datos propios pide confirmación antes de reemplazar", await page.getByText("¿Reemplazar lo que escribiste con datos de ejemplo?").isVisible());
  await page.getByRole("button", { name: "Reemplazar" }).click();
  await page.getByRole("button", { name: "Deshacer" }).click();
  rec(donde, "«Deshacer» devuelve lo que la persona había escrito", (await cargo.inputValue()) === "Cargo de prueba");

  await basicas(page, donde);
  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function generadorPlan(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `plan @${v.nombre}`;
  await page.goto(base + RUTA_PLAN, { waitUntil: "networkidle" });
  const [rosa] = EJEMPLOS_PLAN;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const puesto = page.getByRole("textbox", { name: /^Puesto objetivo/ });
  const horas = page.getByRole("textbox", { name: /^Horas por semana/ });
  const respuesta = page.getByRole("textbox", { name: "Respuesta de la IA" });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => paso3.getByRole("tab", { name: n, exact: true });

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu plan») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu plan") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  const p0 = await prompt();
  rec(donde, "el prompt vacío tiene los 8 bloques y «(no indicado)»", ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"].every((b) => p0.includes(b)) && p0.includes("(no indicado)"));
  rec(donde, "el medidor dice «(recomendado: 80 %)» y arranca en 0 %; el resumen tiene un estado vacío amable", (await page.getByText("(recomendado: 80 %)").isVisible()) && (await page.getByText("Datos completados: 0 %").isVisible()) && (await page.getByText("Escribe las horas por semana").isVisible()));

  // Ejemplo del paso 1 (Rosa)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena puesto, horas y 3 vacantes", (await puesto.inputValue()) === "Asistente administrativa" && (await horas.inputValue()) === "10" && (await page.locator("[data-vacantes] > li").count()) === 3);
  rec(donde, "el resumen calcula 600 minutos con la fórmula 10 h × 60 = 600 min", ((await page.locator("[data-minutos]").innerText()) === "600 minutos") && (await page.getByText("Fórmula: 10 h × 60 = 600 min (10 h)").isVisible()));
  rec(donde, "medidor al 100 % y aviso «Estás viendo datos de ejemplo»", (await page.getByText("Datos completados: 100 %").isVisible()) && (await page.locator("[data-aviso-ejemplo]").isVisible()));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-plan-datos-v1"))) === null);
  const p1 = await prompt();
  rec(donde, "el prompt incluye el tiempo calculado, las vacantes y la cabecera de la tabla", p1.includes("10 horas por semana = 600 minutos (10 h); lo calculó la página") && p1.includes("Vacante 1: Comercial Aurora (ficticia) — Asistente administrativa") && p1.includes("semana,dia,tarea,entregable,minutos") && p1.includes("No inventes empresas, vacantes"));
  await captura(page, `plan-paso1-${v.nombre}`);

  // Validación de las horas y del máximo de vacantes
  await horas.fill("abc");
  rec(donde, "horas que no son un número: error junto al campo y el prompt no inventa minutos", (await page.getByText("Escribe un número, por ejemplo 10 o 7,5.").first().isVisible()) && (await prompt()).includes("Tiempo disponible: (no indicado)"));
  await horas.fill("70");
  rec(donde, "más de 60 horas: error de máximo", await page.getByText("El máximo es 60.").first().isVisible());
  await horas.fill("10");
  rec(donde, "corregidas las horas, el error desaparece", (await page.getByText("El máximo es 60.").count()) === 0);
  const agregar = page.getByRole("button", { name: /^Agregar vacante/ });
  await agregar.click();
  await agregar.click();
  rec(donde, "con 5 vacantes el botón se desactiva («máximo 5»)", (await page.locator("[data-vacantes] > li").count()) === 5 && (await page.getByRole("button", { name: /Agregar vacante \(máximo 5\)/ }).isDisabled()));
  await page.getByRole("button", { name: "Quitar la vacante 5" }).click();
  await page.getByRole("button", { name: "Quitar la vacante 4" }).click();
  rec(donde, "quitar vacantes vuelve a 3", (await page.locator("[data-vacantes] > li").count()) === 3);

  // Copiar prompt
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === (await prompt()));

  // Paso 3: respuesta de ejemplo
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "la respuesta de ejemplo se lee: 24 tareas, cabe en el tiempo y 3 plantillas", (await paso3.getByText("Tareas en el plan").isVisible()) && (await paso3.getByText("24", { exact: true }).first().isVisible()) && (await paso3.getByText("Sí", { exact: true }).first().isVisible()));
  rec(donde, "el objetivo aparece con sus dos alternativas", ((await paso3.locator("[data-objetivo]").innerText()) ?? "").includes("asistente administrativa") && (await paso3.getByText(/^Alternativa:/).count()) === 2);
  await tab("Plan y calendario").click();
  const s1 = await paso3.locator("[data-semana='1'] [data-suma-semana]").innerText();
  rec(donde, "semana 1: 330 min (5 h 30 min) de 600 disponibles y 270 libres (suma hecha por la página)", s1.includes("330 min (5 h 30 min) de 600 disponibles") && s1.includes("270 min libres"), s1);
  rec(donde, "hay 4 semanas con su tabla", (await paso3.locator("[data-semana]").count()) === 4);
  await captura(page, `plan-resultado-${v.nombre}`);

  // Calendario .ics
  const boton = paso3.getByRole("button", { name: "Descargar calendario (.ics)" });
  rec(donde, "sin fecha de inicio, el botón del calendario está desactivado", await boton.isDisabled());
  await paso3.getByLabel("Lunes de la semana 1").fill("2026-10-06");
  rec(donde, "una fecha que no es lunes muestra el error y no habilita el botón", (await paso3.getByText("Esa fecha no es lunes: elige un lunes.").isVisible()) && (await boton.isDisabled()));
  await paso3.getByLabel("Lunes de la semana 1").fill("2026-10-05");
  await paso3.getByLabel("Hora de inicio de cada día").fill("18:00");
  const [ics] = await Promise.all([page.waitForEvent("download"), boton.click()]);
  const textoIcs = fs.readFileSync((await ics.path())!, "utf8");
  rec(donde, "el .ics se llama plan-busqueda-empleo-EJEMPLO.ics y tiene 24 eventos, la primera fecha y el CRLF", ics.suggestedFilename() === "plan-busqueda-empleo-EJEMPLO.ics" && (textoIcs.match(/BEGIN:VEVENT/g) ?? []).length === 24 && textoIcs.includes("DTSTART:20261005T180000") && textoIcs.includes("DTEND:20261005T190000") && textoIcs.includes("\r\n"));
  const [csvPlan] = await Promise.all([page.waitForEvent("download"), paso3.getByRole("button", { name: "Descargar CSV" }).click()]);
  const textoCsv = fs.readFileSync((await csvPlan.path())!, "utf8");
  rec(donde, "el CSV del plan tiene BOM, encabezado y 24 filas", textoCsv.startsWith("﻿Semana,Día,Tarea,Entregable,Minutos") && textoCsv.trim().split("\r\n").length === 25);

  await tab("Distribución").click();
  const distribucion = await paso3.locator("[data-distribucion]").innerText();
  rec(donde, "la distribución suma 100 % y convierte el 15 % de adaptación del CV en 90 minutos", (await paso3.locator("[data-suma-porcentajes]").innerText()) === "100" && /Adaptación del CV\s+15\s+90/.test(distribucion) && distribucion.includes("Suma 100 %."), distribucion.slice(0, 200));
  await tab("Vacantes y criterios").click();
  rec(donde, "las 3 vacantes vienen con su prioridad y ninguna se marca como ajena", (await paso3.locator("[data-vacantes-priorizadas] > li").count()) === 3 && (await paso3.getByText("Prioridad alta").count()) === 1 && (await paso3.getByText("no es una de tus vacantes").count()) === 0);
  await tab("Plantillas").click();
  rec(donde, "hay 3 plantillas (networking, seguimiento y agradecimiento)", (await paso3.locator("[data-plantilla]").count()) === 3);
  await paso3.getByRole("button", { name: /^Copiar la plantilla 2: Seguimiento/ }).click();
  const plantilla = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "copiar una plantilla deja el mensaje con sus marcadores [Nombre] y [Empresa]", plantilla.includes("[Nombre]") && plantilla.includes("[Empresa]") && plantilla.includes("Asunto: Seguimiento de mi postulación a [Puesto]"));
  await tab("Por verificar").click();
  rec(donde, "«Por verificar» lista lo que pide la IA y la revisión automática no marca nada más", (await paso3.getByRole("tabpanel").getByText("Los requisitos reales y la fecha límite de cada aviso").isVisible()) && ((await paso3.getByRole("tabpanel").innerText()).includes("La IA pide verificar 3 dato(s)")) && !(await paso3.getByRole("tabpanel").innerText()).includes("se pasa por"));

  // Un plan que se pasa del tiempo, estadísticas inventadas y una vacante ajena
  const original = rosa.respuesta;
  const malo = original
    .replace("Lista de seguimientos para la semana siguiente,30", "Lista de seguimientos para la semana siguiente,330")
    .replace("- Si envías varias postulaciones", "- El 80 % de los empleos se consiguen por contactos y así conseguirás un empleo en 3 semanas\n- Si envías varias postulaciones")
    .replace("- Vacante: Distribuidora Sur Andino (ficticia)", "- Vacante: Banco Fantasma — Cajera | Prioridad: Alta | Motivo: x | Antes de postular: y\n- Vacante: Distribuidora Sur Andino (ficticia)");
  await respuesta.fill(malo);
  await tab("Plan y calendario").click();
  rec(donde, "una semana que se pasa muestra «te pasas por 30 min»", (await paso3.locator("[data-semana='1'] [data-suma-semana]").innerText()).includes("te pasas por 30 min"));
  await tab("Por verificar").click();
  const revision = await paso3.getByRole("tabpanel").innerText();
  rec(donde, "la revisión marca el exceso, el dato de mercado, la promesa y la vacante que no escribiste", revision.includes("La semana 1 suma 630 minutos") && revision.includes("datos del mercado laboral") && revision.includes("promete o insinúa") && revision.includes("prioriza vacantes que no aportaste") && revision.includes("Banco Fantasma"));
  await respuesta.fill("Aquí tienes tu plan, ¡mucho éxito!");
  rec(donde, "una respuesta sin los títulos avisa que todavía no puede armar los paneles", await page.getByText("Todavía no puedo armar los paneles").isVisible());
  await respuesta.fill(original.replace("## Plan de 4 semanas\nsemana,dia,tarea,entregable,minutos\n", "## Plan de 4 semanas\n"));
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "una tabla sin cabecera se lee igual y avisa", await page.getByText("no trae la cabecera").isVisible());
  await respuesta.fill("");

  // Registro de postulaciones: ejemplo
  const registro = page.locator("[data-registro]");
  const tabReg = (n: string | RegExp) => registro.getByRole("tab", { name: n });
  rec(donde, "el registro empieza vacío", await registro.getByText("Todavía no anotaste ninguna postulación").isVisible());
  await registro.getByRole("button", { name: /Llenar con datos de ejemplo \(registro/ }).click();
  await page.getByText("Registro llenado con postulaciones de ejemplo.").first().waitFor();
  rec(donde, "el ejemplo del registro trae 14 postulaciones y no se guarda", (await tabReg(/^Registro \(14\)/).isVisible()) && (await page.evaluate(() => window.localStorage.getItem("gpia-plan-registro-v1"))) === null && (await registro.locator("[data-aviso-ejemplo-registro]").isVisible()));
  await tabReg("Embudo").click();
  const embudoTxt = await registro.locator("[data-embudo]").innerText();
  rec(donde, "el embudo de Rosa: 14 enviadas, 1 de 14 (7.1 %) con respuesta y el corte antes de la entrevista", embudoTxt.includes("1 de 14 (7.1 %)") && embudoTxt.includes("Se corta antes de que te respondan") && (await registro.locator("[data-agrupada='Versión']").innerText()).includes("B") , embudoTxt.slice(0, 300));
  const porCv = await registro.locator("[data-agrupada='Versión']").innerText();
  rec(donde, "por versión de CV: A 8 enviadas y 0 respuestas; B 6 y 1", /A\s+8\s+0\s+0\s+0\s+0 %/.test(porCv) && /B\s+6\s+1\s+1\s+0\s+16\.7 %/.test(porCv), porCv);
  await captura(page, `plan-embudo-${v.nombre}`);
  await tabReg("Revisión quincenal").click();
  await registro.locator("#periodo-revision").selectOption("todo");
  const revTodo = await registro.locator("[data-prompt-revision]").innerText();
  rec(donde, "con «Todo el registro»: 14 enviadas, 1 de 14 (7.1 %), versiones A y B y los 8 bloques", revTodo.includes("- Postulaciones enviadas: 14") && revTodo.includes("1 de 14 (7.1 %)") && revTodo.includes("B → 6 enviadas") && ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"].every((b) => revTodo.includes(b)) && revTodo.includes("## Ajustes para las próximas 2 semanas"));
  await registro.getByRole("button", { name: "Copiar prompt de revisión" }).click();
  await page.getByText("Prompt de revisión copiado").first().waitFor();
  const copiadoRev = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt de revisión» deja el prompt completo en el portapapeles", copiadoRev === revTodo.split(String.fromCharCode(13)).join("").trim() || copiadoRev.trim() === revTodo.trim());
  await registro.getByRole("button", { name: "Limpiar registro" }).click();
  rec(donde, "«Limpiar registro» deja el registro vacío", await tabReg(/^Registro \(0\)/).isVisible());

  // Registro propio: alta, persistencia, alertas, CSV
  await tabReg(/^Registro \(0\)/).click();
  const nueva = registro.locator("[data-nueva-postulacion]");
  const agregarReg = nueva.getByRole("button", { name: "Agregar al registro" });
  rec(donde, "sin empresa, puesto y fecha, «Agregar al registro» está desactivado", await agregarReg.isDisabled());
  const hace = (dias: number) => {
    const d = new Date(Date.now() - dias * 86_400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  await nueva.getByLabel(/^Empresa/).fill("Empresa QA (ficticia)");
  await nueva.getByLabel(/^Puesto/).fill("Puesto QA");
  await nueva.getByLabel(/^Fecha de postulación/).fill(hace(30));
  await nueva.getByLabel(/^Versión de CV/).fill("A");
  await agregarReg.click();
  rec(donde, "la postulación propia se agrega y aparece en la lista", (await tabReg(/^Registro \(1\)/).isVisible()) && (await registro.locator("[data-postulacion]").count()) === 1);
  rec(donde, "se guarda en el navegador (localStorage)", ((await page.evaluate(() => window.localStorage.getItem("gpia-plan-registro-v1"))) ?? "").includes("Empresa QA"));
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "al recargar la página, la postulación sigue ahí", await registro.getByRole("tab", { name: /^Registro \(1\)/ }).isVisible());
  await registro.getByLabel(/^Estado de Empresa QA/).selectOption("entrevista-rrhh");
  await registro.getByRole("tab", { name: "Embudo", exact: true }).click();
  rec(donde, "cambiar el estado a «Entrevista con RR. HH.» actualiza el embudo (1 de 1 con respuesta)", (await registro.locator("[data-embudo]").innerText()).includes("1 de 1 (100 %)"));
  await registro.getByRole("tab", { name: /^Registro/ }).click();
  await registro.getByLabel(/^Estado de Empresa QA/).selectOption("enviada");
  await registro.getByRole("tab", { name: /^Seguimientos/ }).click();
  rec(donde, "una postulación «Enviada» de hace 30 días genera la alerta «Sin respuesta tras 30 días»", (await registro.locator("[data-alerta]").count()) === 1 && (await registro.locator("[data-alerta]").innerText()).includes("Sin respuesta tras 30 días"));
  await registro.getByRole("button", { name: /^Copiar mensaje de seguimiento/ }).click();
  const seg = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "el mensaje de seguimiento trae puesto, empresa y marcadores", seg.includes("Seguimiento de mi postulación a Puesto QA") && seg.includes("Empresa QA (ficticia)") && seg.includes("[Tu nombre]"));
  await registro.getByRole("button", { name: /Marcar «Sin respuesta»/ }).click();
  rec(donde, "«Marcar sin respuesta» quita la alerta", (await registro.locator("[data-alerta]").count()) === 0);
  await registro.getByRole("tab", { name: /^Registro/ }).click();
  const [csvReg] = await Promise.all([page.waitForEvent("download"), registro.getByRole("button", { name: "Descargar CSV" }).click()]);
  const textoReg = fs.readFileSync((await csvReg.path())!, "utf8");
  rec(donde, "el CSV del registro tiene BOM, encabezado y la postulación", csvReg.suggestedFilename() === "postulaciones.csv" && textoReg.startsWith("﻿Empresa,Puesto,Fecha,Canal,Versión de CV,Estado") && textoReg.includes("Empresa QA (ficticia)"));
  const csvImportar = ["Empresa,Puesto,Fecha,Canal,Estado", "Comercial Uno (ficticia),Asistente,2026-09-01,LinkedIn,Enviada", "Comercial Dos (ficticia),Auxiliar,05/09/2026,Referido,Rechazo", "Comercial Tres (ficticia),Cajera,2026-13-45,Portal de empleo,Enviada", "Empresa QA (ficticia),Puesto QA," + hace(30) + ",Portal de empleo,Enviada"].join("\n");
  await registro.getByLabel("Elegir un archivo CSV de postulaciones para importar").setInputFiles({ name: "postulaciones.csv", mimeType: "text/csv", buffer: Buffer.from(csvImportar, "utf8") });
  await registro.locator("[data-importacion]").waitFor();
  const msg = await registro.locator("[data-importacion]").innerText();
  rec(donde, "la importación agrega 2, omite 1 repetida y explica la fila con fecha inválida", msg.includes("Importé 2 postulación(es)") && msg.includes("omití 1 repetida(s)") && msg.includes("1 fila(s) con problemas") && msg.includes("fecha no válida"), msg);
  rec(donde, "tras importar hay 3 postulaciones", await registro.getByRole("tab", { name: /^Registro \(3\)/ }).isVisible());
  await registro.getByLabel("Elegir un archivo CSV de postulaciones para importar").setInputFiles({ name: "malo.csv", mimeType: "text/csv", buffer: Buffer.from("nombre,edad\nAna,3", "utf8") });
  rec(donde, "un CSV sin las columnas esperadas se rechaza con un mensaje claro", await espera(async () => (await registro.locator("[data-importacion]").innerText()).includes("No reconocí las columnas")));
  // Quitar con «Deshacer»
  await registro.locator("[data-postulacion] summary").first().click();
  await registro.getByRole("button", { name: /^Quitar la postulación/ }).first().click();
  rec(donde, "quitar una postulación ofrece «Deshacer» y lo recupera", (await registro.getByRole("tab", { name: /^Registro \(2\)/ }).isVisible()) && (await page.getByRole("button", { name: "Deshacer" }).isVisible()));
  await page.getByRole("button", { name: "Deshacer" }).click();
  rec(donde, "«Deshacer» recupera la postulación", await registro.getByRole("tab", { name: /^Registro \(3\)/ }).isVisible());
  await captura(page, `plan-registro-${v.nombre}`);
  await page.evaluate(() => window.localStorage.removeItem("gpia-plan-registro-v1"));

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosPlan(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_PLAN, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Puesto objetivo/ }).fill("Otro puesto");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.locator("#paso-3").getByRole("tab", { name: "Plan y calendario", exact: true }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#paso-3").getByRole("button", { name: "Descargar CSV" }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica plan", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function eventosSalario(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_SAL, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Cargo/ }).fill("Otro cargo");
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Descargar CSV/ }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica salario", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function eventos(browser: Browser) {
  const v = VIEWPORTS[1];
  const { ctx, page } = await abrir(browser, v, { analitica: true });
  const donde = "analítica";
  await page.goto(base + RUTA_CV, { waitUntil: "networkidle" });
  // Los eventos de gtag('event', …) quedan en dataLayer (GA no se carga en la prueba).
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByLabel("Nombre completo").fill("Otra Persona");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descargar mi CV en Word (.docx)" }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec(donde, `evento ${n}`, e.includes(n), e.join(","));
  rec(donde, "datos_propios_iniciados se envía una sola vez por ejemplo", e.filter((x) => x === "datos_propios_iniciados").length === 1);
  await ctx.close();

  // Sin consentimiento de analítica no se envía nada.
  const sin = await abrir(browser, v);
  await sin.page.goto(base + RUTA_CV, { waitUntil: "networkidle" });
  await sin.page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  rec(donde, "sin consentimiento no se registra ningún evento", (await sin.page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").length)) === 0);
  await sin.ctx.close();
}

async function teclado(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1]);
  await page.goto(base + RUTA_CV, { waitUntil: "networkidle" });
  // Con solo el teclado: llegar al botón de ejemplo, activarlo con Enter y ver el resultado.
  const boton = page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ });
  await boton.focus();
  const anillo = await boton.evaluate((el) => getComputedStyle(el).boxShadow);
  rec("teclado", "el botón enfocado muestra un anillo de foco visible", anillo !== "none" && anillo.length > 4, anillo);
  await page.keyboard.press("Enter");
  rec("teclado", "Enter activa «Llenar con datos de ejemplo»", (await page.getByLabel("Nombre completo").inputValue()) === EJEMPLOS_CV[0].datos.nombre);
  await page.keyboard.press("Tab");
  const enfocado = await page.evaluate(() => document.activeElement?.tagName);
  rec("teclado", "Tab avanza al siguiente control", enfocado !== "BODY", String(enfocado));
  const regiones = await page.evaluate(() => [...document.querySelectorAll("[role='status'][aria-live='polite']")].length);
  rec("teclado", "hay regiones aria-live para los avisos", regiones >= 1, String(regiones));
  await ctx.close();
}

async function generadorItinerario(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `itinerario @${v.nombre}`;
  await page.goto(base + RUTA_ITIN, { waitUntil: "networkidle" });
  const [arequipa] = EJEMPLOS_ITINERARIO;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const destino = page.getByRole("textbox", { name: /^Destino/ });
  const respuesta = page.getByRole("textbox", { name: "Respuesta de la IA" });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => paso3.getByRole("tab", { name: n, exact: true });

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu itinerario») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu itinerario") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  const p0 = await prompt();
  rec(donde, "el prompt vacío tiene los 8 bloques y «(no indicado)»", ["### ROL", "### OBJETIVO", "### FUENTE", "### DATOS DEL USUARIO", "### REGLAS DE CONTENIDO", "### REGLAS DE FORMATO", "### FORMATO DE SALIDA", "### AUTOVERIFICACIÓN"].every((b) => p0.includes(b)) && p0.includes("(no indicado)"));
  rec(donde, "el medidor dice «(recomendado: 80 %)» y arranca en 0 %; el resumen tiene un estado vacío amable", (await page.getByText("(recomendado: 80 %)").isVisible()) && (await page.getByText("Datos completados: 0 %").isVisible()) && (await page.getByText("Escribe las fechas de inicio y fin").isVisible()));

  // Ejemplo del paso 1 (Arequipa)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena destino, fechas y 6 lugares", (await destino.inputValue()) === "Arequipa, Perú" && (await page.locator("[data-lugares] > li").count()) === 6);
  rec(donde, "el resumen calcula 4 días con las fechas del viaje", (await page.locator("[data-dias]").first().innerText()).includes("4 días"));
  rec(donde, "medidor al 100 % y aviso «Estás viendo datos de ejemplo»", (await page.getByText("Datos completados: 100 %").isVisible()) && (await page.locator("[data-aviso-ejemplo]").isVisible()));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-itinerario-datos-v1"))) === null);
  const p1 = await prompt();
  rec(donde, "el prompt incluye las fechas calculadas, el ritmo y los lugares", p1.includes("2026-11-10 a 2026-11-13 (4 días; lo calculó la página)") && p1.includes("Ritmo: Equilibrado (máximo 3 actividades principales por día") && p1.includes("Lugar 4: Tour al Cañón del Colca") && p1.includes("dia,fecha,zona,hora_inicio,hora_fin,actividad,tipo,lugar,nota,verificado"));
  await captura(page, `itinerario-paso1-${v.nombre}`);

  // Copiar prompt
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === (await prompt()));

  // Paso 3: respuesta de ejemplo
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "la respuesta de ejemplo se lee: bloques totales, y sin avisos de horarios cruzados ni de días sobrecargados", (await paso3.getByText("Bloques en el itinerario").isVisible()) && !(await paso3.getByText("se cruza en el horario").count()) && !(await paso3.getByText("actividades principales y tu ritmo permite").count()));
  await captura(page, `itinerario-resultado-${v.nombre}`);

  await tab("Itinerario por día").click();
  const dia1 = paso3.locator("[data-dia='1']");
  rec(donde, "el día 1 muestra sus bloques con hora, actividad y tipo", (await dia1.locator("[data-bloque]").count()) >= 5);
  const primerBloque = await dia1.locator("[data-bloque]").first().innerText();
  const segundoBloqueAntes = await dia1.locator("[data-bloque]").nth(1).innerText();
  await dia1.locator("[data-bloque]").nth(1).getByRole("button", { name: /^Subir/ }).click();
  rec(donde, "las flechas reordenan los bloques del día (sin tocar sus horarios)", (await dia1.locator("[data-bloque]").first().innerText()) === segundoBloqueAntes && (await dia1.locator("[data-bloque]").nth(1).innerText()) === primerBloque);
  const enlaceMaps = await dia1.getByRole("link", { name: /Ver ruta en Maps/ }).getAttribute("href");
  rec(donde, "el enlace a Maps encadena los lugares del día 1", (enlaceMaps ?? "").startsWith("https://www.google.com/maps/dir/") && (enlaceMaps ?? "").includes(encodeURIComponent("Monasterio de Santa Catalina")));
  const enlaceWa = await dia1.getByRole("link", { name: /Compartir por WhatsApp/ }).getAttribute("href");
  rec(donde, "el enlace de WhatsApp lleva el texto del día codificado", (enlaceWa ?? "").startsWith("https://wa.me/?text="));

  await tab("Por qué y planes B").click();
  rec(donde, "«Por qué y planes B» trae una entrada por día para ambas secciones", (await paso3.getByText(/^Día 1/).count()) >= 2);

  // Exportar: calendario .ics
  const [ics] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Calendario (.ics)" }).click()]);
  const textoIcs = fs.readFileSync((await ics.path())!, "utf8");
  rec(donde, "el .ics se llama itinerario-de-viaje-EJEMPLO.ics y trae un evento por bloque, con CRLF", ics.suggestedFilename() === "itinerario-de-viaje-EJEMPLO.ics" && (textoIcs.match(/BEGIN:VEVENT/g) ?? []).length === 23 && textoIcs.includes("DTSTART:20261110T110000") && textoIcs.includes("\r\n"), ics.suggestedFilename());

  // Exportar: CSV
  const [csvIt] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "CSV", exact: true }).click()]);
  const textoCsv = fs.readFileSync((await csvIt.path())!, "utf8");
  rec(donde, "el CSV del itinerario tiene BOM y el encabezado de la tabla", textoCsv.startsWith("﻿Día,Fecha,Zona,Inicio,Fin,Actividad,Tipo,Lugar,Nota,Verificado"));

  // Copiar como tabla
  await page.getByRole("button", { name: "Copiar tabla" }).click();
  const tablaCopiada = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar tabla» deja filas separadas por tabuladores", tablaCopiada.includes("\t") && tablaCopiada.split("\n")[0] === "Día\tFecha\tZona\tInicio\tFin\tActividad\tTipo\tLugar\tNota\tVerificado");

  // Imprimir
  rec(donde, "la versión para imprimir existe, oculta en pantalla, con la advertencia de ejemplo", (await page.locator("#itinerario-imprimible").count()) === 1 && !(await page.locator("#itinerario-imprimible").isVisible()) && ((await page.locator("#itinerario-imprimible").textContent()) ?? "").includes("EJEMPLO ILUSTRATIVO"));
  await page.evaluate(() => document.body.classList.add("imprimiendo-itinerario"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve el resumen (la herramienta queda oculta)", (await page.locator("#itinerario-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-itinerario"));

  // Una respuesta con un horario cruzado y un lugar inventado
  const filaMonasterio = "1,2026-11-10,Centro,15:45,17:00,Recorrer el Monasterio de Santa Catalina,imprescindible,Monasterio de Santa Catalina,Confirma el horario de cierre antes de ir,no";
  const filaPlazaDia4 = "4,2026-11-13,Centro,10:15,11:15,Última caminata y compras finales,opcional,Plaza de Armas de Arequipa,,si";
  const filaBarInventado = "4,2026-11-13,Centro,15:00,16:00,Bar secreto,opcional,Bar Secreto Inventado,,no";
  const malo = arequipa.respuesta.replace(filaMonasterio, filaMonasterio.replace("15:45", "14:45")).replace(filaPlazaDia4, `${filaPlazaDia4}\n${filaBarInventado}`);
  await respuesta.fill(malo);
  await tab("Por verificar").click();
  const revisionTxt = await paso3.getByRole("tabpanel").innerText();
  rec(donde, "la revisión detecta el cruce de horario y el lugar que no escribió el usuario", revisionTxt.includes("se cruza en el horario") && revisionTxt.includes("no aportaste"));
  await respuesta.fill("Aquí tienes tu itinerario, ¡buen viaje!");
  rec(donde, "una respuesta sin los títulos avisa que todavía no puede armar la línea de tiempo", await page.getByText("Todavía no puedo armar la línea de tiempo").isVisible());
  await respuesta.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosItinerario(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_ITIN, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Destino/ }).fill("Otro destino");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#paso-3").getByRole("button", { name: "CSV", exact: true }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica itinerario", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorFechas(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `fechas @${v.nombre}`;
  await page.goto(base + RUTA_FECHAS, { waitUntil: "networkidle" });
  const [, arequipa] = EJEMPLOS_FECHAS;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const origen = page.getByRole("textbox", { name: /^Origen/ });
  const respuesta = page.getByRole("textbox", { name: /Precios \(respuesta de la IA/ });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => paso3.getByRole("tab", { name: n, exact: true });

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tus precios») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tus precios") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  rec(donde, "el aviso de que la página no consulta precios en tiempo real está visible desde el inicio", await page.getByText("Esta página no consulta precios en tiempo real.").isVisible());
  rec(donde, "el resumen tiene un estado vacío amable", await page.getByText("Escribe el período (fecha inicial y final)").isVisible());

  // Ejemplo del paso 1 (Lima–Cusco)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena origen, destino y duraciones", (await origen.inputValue()) === "Lima, Perú (LIM)" && (await page.getByRole("textbox", { name: /^Destino/ }).inputValue()) === "Cusco, Perú (CUZ)");
  rec(donde, "el resumen calcula 72 combinaciones (25 + 24 + 23)", (await page.locator("[data-total-combinaciones]").innerText()) === "72");
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-fechas-datos-v1"))) === null);
  await captura(page, `fechas-paso1-${v.nombre}`);

  // Paso 2: método B (con IA)
  await page.getByRole("tab", { name: "B · Con IA" }).click();
  const p1 = await prompt();
  rec(donde, "el prompt incluye las 72 combinaciones generadas y el aviso de no inventar precios", p1.includes("72 combinaciones") && p1.includes("2026-11-01,2026-11-06,5") && p1.includes("Nunca completes una combinación con un precio estimado"));
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === p1);
  await page.getByRole("tab", { name: "A · Guiado" }).click();
  rec(donde, "el método guiado explica los pasos con el buscador de vuelos, sin nombrar ninguna marca", (await page.getByText("Abre un buscador de vuelos").isVisible()) && (await page.locator("body").innerText()).includes("No recomendamos un buscador en particular"));

  // Paso 3: respuesta de ejemplo (18 de 72, más barata resaltada)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "el resumen muestra 18 combinaciones con precio de 72 generadas, y la más barata resaltada", (await paso3.getByText("de 72 generadas").isVisible()) && (await paso3.getByText(/Más barata encontrada en esta búsqueda: 2026-11-11 → 2026-11-16 \(5 noches\), S\/ 1280/).isVisible()));
  await captura(page, `fechas-resultado-${v.nombre}`);

  await tab("Tabla de precios").click();
  const filas = paso3.locator("[data-fila-precio]");
  rec(donde, "la tabla trae 18 filas, ordenadas por precio, con la más barata primero", (await filas.count()) === 18 && (await filas.first().locator("th").innerText()) === "2026-11-11");
  await page.getByRole("checkbox", { name: /Incluir equipaje y traslados/ }).check();
  rec(donde, "al incluir el equipaje de bodega, la combinación del 4 de noviembre pasa a ser la más barata", (await filas.first().locator("th").innerText()) === "2026-11-04");
  await page.getByRole("checkbox", { name: /Incluir equipaje y traslados/ }).uncheck();

  await tab("Mapa de calor").click();
  rec(donde, "el mapa de calor lista los 3 días de duración como columnas", (await paso3.getByRole("columnheader", { name: "5 noches" }).isVisible()) && (await paso3.getByRole("columnheader", { name: "7 noches" }).isVisible()));

  await tab("Patrones y costos").click();
  rec(donde, "«Patrones y costos» trae los patrones observados y los costos no incluidos", (await paso3.getByText("martes y miércoles").count()) > 0 && (await paso3.getByText("selección de asiento").count()) > 0);

  await tab("Pendientes").click();
  rec(donde, "quedan 54 combinaciones sin precio (72 − 18) y se pueden copiar", await paso3.getByText("54 de 72 combinaciones sin consultar").isVisible());
  await paso3.getByRole("button", { name: "Copiar lista" }).click();
  const pendientesCopiadas = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "la lista de pendientes copiada trae flechas entre ida y vuelta", pendientesCopiadas.includes("→"));

  await tab("Por verificar").click();
  rec(donde, "«Por verificar» lista lo que pide la IA", await paso3.getByRole("tabpanel", { name: "Por verificar" }).getByText("Cada precio de la tabla, directamente en la aerolínea").isVisible());

  // Exportar CSV y copiar tabla
  const [csvF] = await Promise.all([page.waitForEvent("download"), paso3.getByRole("button", { name: "CSV", exact: true }).click()]);
  const textoCsv = fs.readFileSync((await csvF.path())!, "utf8");
  rec(donde, "el CSV se llama fechas-mas-baratas-EJEMPLO.csv, con BOM y encabezado", csvF.suggestedFilename() === "fechas-mas-baratas-EJEMPLO.csv" && textoCsv.startsWith("﻿Ida,Día,Vuelta,Noches,Precio total"));
  await paso3.getByRole("button", { name: "Copiar tabla" }).click();
  const tablaCopiada = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar tabla» deja filas separadas por tabuladores", tablaCopiada.includes("\t") && tablaCopiada.split("\n")[0].split("\t")[0] === "Ida");

  // Imprimir
  rec(donde, "la versión para imprimir existe, oculta en pantalla", (await page.locator("#fechas-imprimible").count()) === 1 && !(await page.locator("#fechas-imprimible").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-fechas"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve la tabla de precios (la herramienta queda oculta)", (await page.locator("#fechas-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-fechas"));

  // Ejemplo sin acceso a datos en tiempo real (Lima–Arequipa)
  await paso3.getByRole("button", { name: /^Otro ejemplo/ }).click();
  await page.getByText("Respuesta de ejemplo pegada").first().waitFor();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "el segundo ejemplo (sin acceso a datos en tiempo real) llena el formulario con su propio destino", (await page.getByRole("textbox", { name: /^Destino/ }).inputValue()) === arequipa.datos.destino);
  await tab("Resumen").click();
  rec(donde, "el aviso de «sin acceso a datos en tiempo real» se muestra en rojo", await paso3.getByText("La IA declaró que no tiene acceso a datos en tiempo real.").isVisible());

  // Una respuesta sin los títulos esperados
  await respuesta.fill("Lo siento, no puedo ayudarte con eso.");
  rec(donde, "una respuesta sin los títulos avisa que todavía no puede armar la tabla", await page.getByText("Todavía no puedo armar la tabla").isVisible());
  await respuesta.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosFechas(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_FECHAS, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Origen/ }).fill("Otro origen");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#paso-3").getByRole("button", { name: "CSV", exact: true }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica fechas", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorComparar(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `comparar @${v.nombre}`;
  await page.goto(base + RUTA_CMP, { waitUntil: "networkidle" });
  const [, cusco] = EJEMPLOS_COMPARAR;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const primerNombre = page.getByRole("textbox", { name: /^Nombre de la opción/ }).first();
  const respuesta = page.getByRole("textbox", { name: /^Respuesta de la IA/ });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => paso3.getByRole("tab", { name: n, exact: true });

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu resultado») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu resultado") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  rec(donde, "el formulario empieza con 2 opciones", (await page.getByRole("textbox", { name: /^Nombre de la opción/ }).count()) === 2);

  // Ejemplo del paso 1 (Miraflores, 3 opciones)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena las 3 opciones", (await page.getByRole("textbox", { name: /^Nombre de la opción/ }).count()) === 3 && (await primerNombre.inputValue()) === "Hotel Casa Andina Miraflores");
  rec(donde, "el resumen en vivo calcula la mejor puntuada (78/100) y la más barata (S/ 692.50)", (await page.locator("[data-mejor-puntuada]").innerText()).includes("Hotel Casa Andina Miraflores") && (await page.locator("[data-mas-barata]").innerText()).includes("Hostal Kaminu Miraflores"));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-comparar-datos-v1"))) === null);
  await captura(page, `comparar-paso1-${v.nombre}`);

  // Paso 2: el prompt
  const p1 = await prompt();
  rec(donde, "el prompt incluye las opciones, los criterios y los cálculos ya hechos por la página", p1.includes("Hotel Casa Andina Miraflores") && p1.includes("Precio: 25 de 100 puntos") && p1.includes("puntuación ponderada 78/100"));
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === p1);

  // Paso 3: respuesta de ejemplo
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "el resumen muestra la mejor puntuada y, si difiere, la más barata", await paso3.getByText(/Mejor puntuada: Hotel Casa Andina Miraflores/).isVisible());
  await captura(page, `comparar-resultado-${v.nombre}`);

  await tab("Tabla comparativa").click();
  const panelTabla = paso3.getByRole("tabpanel", { name: "Tabla comparativa" });
  rec(donde, "la tabla comparativa marca las celdas de valoración", (await panelTabla.getByText("valoración").first().isVisible()) && (await panelTabla.getByText("Muy cómodo").isVisible()));

  await tab("Costos y diferencias").click();
  rec(donde, "«Costos y diferencias» trae los costos a verificar y las diferencias que importan", (await paso3.getByText("depósito de garantía").count()) > 0 && (await paso3.getByText(/S\/ 680 frente a los S\/ 1,850/).count()) > 0);

  await tab("Ventajas y prioridades").click();
  rec(donde, "«Ventajas y prioridades» lista ventajas y cómo cambian las prioridades", (await paso3.getByText("Hostal Kaminu Miraflores").count()) > 0);

  await tab("Preguntas y verificación").click();
  rec(donde, "«Preguntas y verificación» lista preguntas antes de reservar", await paso3.getByRole("tabpanel", { name: "Preguntas y verificación" }).getByText("depósito de garantía del hostal se devuelve").isVisible());

  // Exportar CSV y copiar tabla
  const [csvF] = await Promise.all([page.waitForEvent("download"), paso3.getByRole("button", { name: "CSV", exact: true }).click()]);
  const textoCsv = fs.readFileSync((await csvF.path())!, "utf8");
  rec(donde, "el CSV se llama comparar-opciones-EJEMPLO.csv, con BOM y la cabecera esperada", csvF.suggestedFilename() === "comparar-opciones-EJEMPLO.csv" && textoCsv.startsWith("﻿Opción,Precio,Moneda,"));
  await paso3.getByRole("button", { name: "Copiar tabla" }).click();
  const tablaCopiada = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar tabla» deja filas separadas por tabuladores, con el costo total ajustado", tablaCopiada.startsWith("Opción\tCosto total ajustado") && tablaCopiada.includes("\t"));

  // Imprimir
  rec(donde, "la versión para imprimir existe, oculta en pantalla", (await page.locator("#comparar-imprimible").count()) === 1 && !(await page.locator("#comparar-imprimible").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-comparar"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve la tabla comparativa (la herramienta queda oculta)", (await page.locator("#comparar-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-comparar"));

  // Otro ejemplo (Máncora)
  await paso3.getByRole("button", { name: /^Otro ejemplo/ }).click();
  await page.getByText("Respuesta de ejemplo pegada").first().waitFor();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "el siguiente ejemplo llena el formulario con sus propias opciones", (await primerNombre.inputValue()) === cusco.datos.opciones[0].nombre);

  // Una respuesta sin los títulos esperados
  await respuesta.fill("Lo siento, no puedo ayudarte con eso.");
  rec(donde, "una respuesta sin los títulos avisa que todavía no puede leerla", await page.getByText("Todavía no puedo leer esta respuesta").isVisible());
  await respuesta.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosComparar(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_CMP, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Nombre de la opción/ }).first().fill("Otro nombre");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#paso-3").getByRole("button", { name: "CSV", exact: true }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica comparar", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorDestinos(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `destinos @${v.nombre}`;
  await page.goto(base + RUTA_DEST, { waitUntil: "networkidle" });
  const [, internacional] = EJEMPLOS_DESTINOS;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const presupuesto = page.getByRole("textbox", { name: /^Presupuesto total/ });
  const origen = page.getByRole("textbox", { name: /^Origen/ });
  const respuesta = page.getByRole("textbox", { name: /^Destinos \(respuesta/ });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => paso3.getByRole("tab", { name: n, exact: true });

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tus destinos») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tus destinos") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  rec(donde, "el aviso de que la página no conoce precios en tiempo real está visible desde el inicio", await page.getByText("Esta página no conoce precios de pasajes ni de alojamiento en tiempo real.").isVisible());

  // Ejemplo del paso 1 (Cusco, Máncora, Arequipa)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena presupuesto y origen", (await presupuesto.inputValue()) === "2500" && (await origen.inputValue()) === "Lima, Perú");
  rec(donde, "el reparto calcula el máximo para pasajes y alojamiento (S/ 1,410.00) con la fórmula visible", (await page.locator("[data-formula-reparto]").innerText()).includes("1,410.00"));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-destinos-datos-v1"))) === null);
  await captura(page, `destinos-paso1-${v.nombre}`);

  // Paso 2: método B (con IA)
  await page.getByRole("tab", { name: "B · Con IA" }).click();
  const p1 = await prompt();
  rec(donde, "el prompt incluye el reparto calculado por la página y el máximo de 8 destinos", p1.includes("1,410.00") && p1.includes("hasta 8"));
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === p1);
  await page.getByRole("tab", { name: "A · Guiado" }).click();
  rec(donde, "el método guiado explica los pasos con un buscador de vuelos, sin nombrar ninguna marca", (await page.getByText("Abre un buscador de vuelos").isVisible()) && (await page.locator("body").innerText()).includes("No recomendamos un buscador en particular"));

  // Paso 3: respuesta de ejemplo (3 destinos, 2 viables a 5 noches)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "el resumen muestra 3 destinos leídos y 2 viables con 5 noches", (await paso3.getByText("3", { exact: true }).count()) > 0 && (await paso3.getByText("Viables con 5").isVisible()));
  await captura(page, `destinos-resultado-${v.nombre}`);

  await tab("Tabla de destinos").click();
  const filas = paso3.locator("[data-fila-destino]");
  rec(donde, "la tabla trae 3 filas, ordenadas por restante, con Arequipa primero", (await filas.count()) === 3 && (await filas.first().locator("th").innerText()).includes("Arequipa"));
  rec(donde, "Máncora queda marcada «no entra», con el pasaje más barato de los tres", (await paso3.locator("[data-fila-destino]", { hasText: "Máncora" }).innerText()).includes("no entra"));

  await tab("Gastos y ahorro").click();
  rec(donde, "«Gastos y ahorro» trae los gastos que podrían encarecer y las recomendaciones", (await paso3.getByText("Boleto Turístico").count()) > 0 && (await paso3.getByText("entre semana").count()) > 0);

  await tab("Por verificar").click();
  rec(donde, "«Por verificar» lista lo que pide la IA", await paso3.getByRole("tabpanel", { name: "Por verificar" }).getByText("Confirma el precio final de cada pasaje").isVisible());

  // Exportar CSV y copiar tabla
  const [csvF] = await Promise.all([page.waitForEvent("download"), paso3.getByRole("button", { name: "CSV", exact: true }).click()]);
  const textoCsv = fs.readFileSync((await csvF.path())!, "utf8");
  rec(donde, "el CSV se llama destinos-EJEMPLO.csv, con BOM y la cabecera esperada", csvF.suggestedFilename() === "destinos-EJEMPLO.csv" && textoCsv.startsWith("﻿Destino,Fechas,Noches,Pasaje por persona"));
  await paso3.getByRole("button", { name: "Copiar tabla" }).click();
  const tablaCopiada = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar tabla» deja filas separadas por tabuladores", tablaCopiada.includes("\t") && tablaCopiada.split("\n")[0].split("\t")[0] === "Destino");

  // Imprimir
  rec(donde, "la versión para imprimir existe, oculta en pantalla", (await page.locator("#destinos-imprimible").count()) === 1 && !(await page.locator("#destinos-imprimible").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-destinos"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve la tabla de destinos (la herramienta queda oculta)", (await page.locator("#destinos-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-destinos"));

  // Otro ejemplo (viaje internacional, con una fila «sin dato»)
  await paso3.getByRole("button", { name: /^Otro ejemplo/ }).click();
  await page.getByText("Respuesta de ejemplo pegada").first().waitFor();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "el segundo ejemplo llena el formulario con su propio origen y presupuesto", (await presupuesto.inputValue()) === internacional.datos.presupuesto);
  await tab("Tabla de destinos").click();
  rec(donde, "la fila «sin dato» (Bogotá) se muestra sin costo total calculado", (await paso3.locator("[data-fila-destino]", { hasText: "Bogotá" }).innerText()).includes("sin dato"));

  // Una respuesta sin los títulos esperados
  await respuesta.fill("Lo siento, no puedo ayudarte con eso.");
  rec(donde, "una respuesta sin títulos ni tabla avisa que todavía no puede armar la tabla", await page.getByText("Todavía no puedo armar la tabla").isVisible());
  await respuesta.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosDestinos(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_DEST, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Origen/ }).fill("Otro origen");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#paso-3").getByRole("button", { name: "CSV", exact: true }).click()]);
  void d;
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica destinos", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorLogo(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `logo @${v.nombre}`;
  await page.goto(base + RUTA_LOGO, { waitUntil: "networkidle" });
  const [, tech] = EJEMPLOS_LOGO;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const nombreEmpresa = page.getByRole("textbox", { name: /^Nombre de la empresa/ });
  const respuesta = page.getByRole("textbox", { name: /^Respuesta de la IA/ });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => paso3.getByRole("tab", { name: n, exact: true });

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu resultado») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu resultado") && (await pasos.nth(0).getAttribute("aria-current")) === "step");
  rec(donde, "el aviso de que la página no genera imágenes está visible desde el inicio", await page.getByText("Esta página no genera imágenes.").isVisible());

  // Ejemplo del paso 1 (Masa Madre Rímac)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena el nombre de la empresa y mueve los deslizadores de personalidad", (await nombreEmpresa.inputValue()) === "Masa Madre Rímac" && (await page.locator('input[data-deslizador="serioCercano"]').inputValue()) === "80");
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-logo-datos-v1"))) === null);
  await captura(page, `logo-paso1-${v.nombre}`);

  // Paso 2: el prompt
  const p1 = await prompt();
  rec(donde, "el prompt incluye la empresa y exige exactamente 3 conceptos y 8 variantes", p1.includes("Masa Madre Rímac") && p1.includes("exactamente 3 conceptos") && p1.includes("8 variantes"));
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === p1);

  // Paso 3: respuesta de ejemplo
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  const panelBrief = paso3.getByRole("tabpanel", { name: "Brief y conceptos" });
  rec(donde, "el panel «Brief y conceptos» trae los 3 conceptos", (await panelBrief.getByText("Conceptos (3 de 3)").isVisible()) && (await panelBrief.getByText("Espiga-M").isVisible()));
  await captura(page, `logo-resultado-${v.nombre}`);

  await tab("Especificaciones").click();
  const panelEsp = paso3.getByRole("tabpanel", { name: "Especificaciones" });
  rec(donde, "la paleta muestra el contraste AA calculado por la página, no por la IA", (await panelEsp.getByText("AA", { exact: true }).count()) === 3);
  rec(donde, "una tipografía sin licencia confirmada se marca «verificar licencia»", await panelEsp.getByText("verificar licencia").isVisible());

  await tab("Prompts de imagen").click();
  const panelPrompts = paso3.getByRole("tabpanel", { name: "Prompts de imagen" });
  rec(donde, "hay un prompt en inglés y otro en español para las 8 variantes", (await panelPrompts.getByText(/^EN:/).count()) === 8 && (await panelPrompts.getByText(/^ES:/).count()) === 8);
  await panelPrompts.getByRole("button", { name: "Copiar EN" }).first().click();
  const promptCopiado = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "copiar un prompt de imagen deja su texto en inglés en el portapapeles", promptCopiado.startsWith("flat vector logo"));

  // Laboratorio: sube una imagen real y genera los favicons
  await tab("Laboratorio").click();
  const panelLab = paso3.getByRole("tabpanel", { name: "Laboratorio" });
  await panelLab.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "public", "logo.png"));
  await panelLab.getByText("Vista previa").waitFor();
  rec(donde, "al subir una imagen aparece la vista previa en fondo claro y oscuro", (await panelLab.getByText("Fondo claro").isVisible()) && (await panelLab.getByText("Fondo oscuro").isVisible()));
  await panelLab.getByRole("button", { name: "Generar tamaños" }).click();
  await panelLab.getByRole("button", { name: "Descargar .zip" }).waitFor({ timeout: 10000 });
  rec(donde, "«Generar tamaños» crea los 4 favicons (16, 32, 180 y 512 px)", (await panelLab.getByText("16 px").count()) >= 1 && (await panelLab.getByText("512 px").count()) >= 1);
  const [zip] = await Promise.all([page.waitForEvent("download"), panelLab.getByRole("button", { name: "Descargar .zip" }).click()]);
  const rutaZip = await zip.path();
  rec(donde, "el .zip de favicons se descarga con 4 archivos PNG", zip.suggestedFilename().endsWith("-favicons.zip") && rutaZip !== null && (await new JSZip().loadAsync(fs.readFileSync(rutaZip!))).file(/\.png$/).length === 4);

  await tab("Revisión").click();
  const panelRevision = paso3.getByRole("tabpanel", { name: "Revisión" });
  rec(donde, "«Revisión» lista las aplicaciones y los riesgos de la respuesta", (await panelRevision.getByText("Tarjeta de presentación").count()) > 0 && (await panelRevision.getByText("espiga-M no se parezca").count()) > 0);

  // Imprimir el mini manual
  rec(donde, "la versión para imprimir existe, oculta en pantalla", (await page.locator("#logo-imprimible").count()) === 1 && !(await page.locator("#logo-imprimible").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-logo"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve el mini manual de marca (la herramienta queda oculta)", (await page.locator("#logo-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-logo"));

  // Otro ejemplo (Nimbus Data)
  await paso3.getByRole("button", { name: /^Otro ejemplo/ }).click();
  await page.getByText("Respuesta de ejemplo pegada").first().waitFor();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "el siguiente ejemplo llena el formulario con su propia empresa", (await nombreEmpresa.inputValue()) === tech.datos.nombreEmpresa);

  // Una respuesta sin los títulos esperados
  await respuesta.fill("Lo siento, no puedo ayudarte con eso.");
  rec(donde, "una respuesta sin títulos avisa que todavía no puede leerla", await page.getByText("Todavía no puedo leer esta respuesta").isVisible());
  await respuesta.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosLogo(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_LOGO, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Nombre de la empresa/ }).fill("Otra empresa");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.locator("#paso-3").getByRole("button", { name: "Imprimir o guardar manual en PDF" }).click();
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica logo", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorPlanNegocio(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `plan-negocio @${v.nombre}`;
  await page.goto(base + RUTA_PLANNEG, { waitUntil: "networkidle" });
  const [, velas] = EJEMPLOS_PLAN_NEGOCIO;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const nombreEmpresa = page.getByRole("textbox", { name: /^Nombre de la empresa/ });
  const respuesta = page.getByRole("textbox", { name: /^Respuesta de la IA/ });
  const respuestasFaseA = page.getByRole("textbox", { name: /^(Cuando la IA te responda|Tus respuestas a las preguntas de la Fase A)/ });
  const paso3 = page.locator("#paso-3");
  const tab = (n: string) => paso3.getByRole("tab", { name: n, exact: true });

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu plan») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu plan") && (await pasos.nth(0).getAttribute("aria-current")) === "step");

  // Ejemplo del paso 1 (Lavandería Express Surquillo)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "el ejemplo llena el nombre de la empresa y las respuestas de la Fase A", (await nombreEmpresa.inputValue()) === "Lavandería Express Surquillo" && (await respuestasFaseA.inputValue()).length > 0);
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-plan-negocio-datos-v1"))) === null);
  rec(donde, "el resumen en vivo calcula el punto de equilibrio del ejemplo (1500 u/mes)", await page.getByText("1500 u/mes").isVisible());
  await captura(page, `plan-negocio-paso1-${v.nombre}`);

  // Paso 2: el prompt en 2 fases
  const p1 = await prompt();
  rec(donde, "con las respuestas de la Fase A ya cargadas, el prompt muestra la Fase B (19 títulos)", p1.includes("Lavandería Express Surquillo") && p1.includes("## Resumen ejecutivo") && p1.includes("## Siguiente paso"));
  await respuestasFaseA.fill("");
  const pFaseA = await prompt();
  rec(donde, "al borrar las respuestas, el prompt vuelve a la Fase A (diagnóstico)", pFaseA.includes("## Datos faltantes") && pFaseA.includes("## Preguntas") && !pFaseA.includes("## Resumen ejecutivo"));
  await respuestasFaseA.fill("El local todavía no está alquilado.");
  const pFaseB = await prompt();
  rec(donde, "al escribir algo, el mismo botón vuelve a mostrar la Fase B", pFaseB.includes("## Resumen ejecutivo"));
  await page.getByRole("button", { name: /^Copiar prompt/ }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === pFaseB);

  // Paso 3: respuesta de ejemplo
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  const panelResumen = paso3.getByRole("tabpanel", { name: "Resumen y negocio" });
  rec(donde, "el panel «Resumen y negocio» trae el resumen ejecutivo con cifras etiquetadas", (await panelResumen.getByText("[CÁLCULO]").count()) > 0);
  await captura(page, `plan-negocio-resultado-${v.nombre}`);

  await tab("Mercado y competencia").click();
  const panelMercado = paso3.getByRole("tabpanel", { name: "Mercado y competencia" });
  rec(donde, "la tabla de competencia trae los 2 competidores del ejemplo", (await panelMercado.getByRole("cell", { name: "Lavandería Don Pepe" }).isVisible()) && (await panelMercado.getByRole("cell", { name: "QuickWash Surco (cadena)" }).isVisible()));

  await tab("Números").click();
  const panelNumeros = paso3.getByRole("tabpanel", { name: "Números" });
  rec(donde, "la tabla de proyección trae los 3 escenarios", (await panelNumeros.getByRole("cell", { name: "Pesimista" }).isVisible()) && (await panelNumeros.getByRole("cell", { name: "Optimista" }).isVisible()));
  rec(donde, "el conteo de etiquetas se muestra", await panelNumeros.getByText("Etiquetas encontradas:").isVisible());

  await tab("Riesgos y siguiente paso").click();
  const panelRiesgos = paso3.getByRole("tabpanel", { name: "Riesgos y siguiente paso" });
  rec(donde, "«Riesgos y siguiente paso» no marca cifras inventadas en la respuesta del ejemplo", await panelRiesgos.getByText("No detecté cifras sin respaldo").isVisible());

  // Imprimir el resumen
  rec(donde, "la versión para imprimir existe, oculta en pantalla", (await page.locator("#plan-negocio-imprimible").count()) === 1 && !(await page.locator("#plan-negocio-imprimible").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-plan-negocio"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve el resumen del plan (la herramienta queda oculta)", (await page.locator("#plan-negocio-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-plan-negocio"));

  // Descarga en Word
  const [word] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descargar el plan en Word (.docx)" }).click()]);
  const xml = await leerDocx(word);
  rec(donde, "el plan se descarga en Word con el nombre de la empresa y sin recalcular el punto de equilibrio", word.suggestedFilename() === "Plan-de-negocio-Lavanderia-Express-Surquillo.docx" && xml.includes("Lavandería Express Surquillo") && xml.includes("1500 kg/mes"), word.suggestedFilename());

  // Exportar el proyecto (.json), antes de cambiar de ejemplo o tocar el formulario
  const [json] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Guardar copia del proyecto (.json)" }).click()]);
  const rutaJson = (await json.path())!;
  const proyecto = JSON.parse(fs.readFileSync(rutaJson, "utf8")) as { herramienta: string; datos: { nombreEmpresa: string } };
  rec(donde, "el .json exportado trae la herramienta y el nombre de la empresa", proyecto.herramienta === "crear-plan-de-negocio" && proyecto.datos.nombreEmpresa === "Lavandería Express Surquillo");

  // Otro ejemplo (Velas Aromáticas Kaypacha): todavía en modo ejemplo, así que también rellena el formulario
  await paso3.getByRole("button", { name: /^Otro ejemplo/ }).click();
  await page.getByText("Respuesta de ejemplo pegada").first().waitFor();
  await paso3.getByRole("tablist", { name: "Paneles del resultado" }).waitFor();
  rec(donde, "el siguiente ejemplo llena el formulario con su propio negocio", (await nombreEmpresa.inputValue()) === velas.datos.nombreEmpresa);

  // Importar el proyecto exportado (Lavandería): reemplaza el formulario, aunque estaba en modo ejemplo
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  rec(donde, "«Limpiar formulario» borra el nombre de la empresa", (await nombreEmpresa.inputValue()) === "");
  await page.locator('input[type="file"]').setInputFiles(rutaJson);
  await page.getByText("Proyecto importado").first().waitFor();
  rec(donde, "importar el .json exportado devuelve el mismo nombre de empresa", (await nombreEmpresa.inputValue()) === "Lavandería Express Surquillo");

  // Una respuesta sin los títulos esperados
  await respuesta.fill("Lo siento, no puedo ayudarte con eso.");
  rec(donde, "una respuesta sin títulos avisa que todavía no puede leerla", await page.getByText("Todavía no puedo leer esta respuesta").isVisible());
  await respuesta.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosPlanNegocio(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_PLANNEG, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Nombre de la empresa/ }).fill("Otra empresa");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.locator("#paso-3").getByRole("button", { name: "Guardar copia del proyecto (.json)" }).click();
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica plan-negocio", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorRentabilidad(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `rentabilidad @${v.nombre}`;
  await page.goto(base + RUTA_RENTAB, { waitUntil: "networkidle" });
  const [, velas] = EJEMPLOS_RENTABILIDAD;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const respuesta = page.getByRole("textbox", { name: /^Respuesta de la IA/ });
  const paso3 = page.locator("#paso-3");

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu análisis») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu análisis") && (await pasos.nth(0).getAttribute("aria-current")) === "step");

  // Ejemplo del paso 1 (Pastelería)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  const primerNombre = page.getByRole("textbox", { name: "Nombre", exact: true }).first();
  rec(donde, "el ejemplo llena el primer producto (Tortas)", (await primerNombre.inputValue()) === "Tortas");
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-rentabilidad-datos-v1"))) === null);
  rec(donde, "el resumen en vivo calcula la utilidad operativa del ejemplo (S/ 430.00)", await page.getByText("S/ 430.00").first().isVisible());
  await captura(page, `rentabilidad-paso1-${v.nombre}`);

  // Importar productos desde un .csv
  const rutaCsv = path.join(process.cwd(), "rentabilidad-prueba.csv");
  fs.writeFileSync(rutaCsv, "unidades;nombre;costo;precio\n50;Producto importado;10;20\n");
  try {
    await page.locator('input[type="file"][accept*="csv"]').setInputFiles(rutaCsv);
    let valorImportado = "";
    for (let i = 0; i < 20 && valorImportado !== "Producto importado"; i++) {
      await page.waitForTimeout(100);
      valorImportado = await primerNombre.inputValue();
    }
    rec(donde, "importar un .csv reemplaza los productos del formulario", valorImportado === "Producto importado", valorImportado);
  } finally {
    fs.rmSync(rutaCsv, { force: true });
  }

  // Volver al ejemplo para el resto de la prueba (seguimos en modo ejemplo: recarga sin pedir confirmación)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  rec(donde, "tras importar un .csv, volver a «Llenar con ejemplo» restaura el producto del ejemplo", (await primerNombre.inputValue()) === "Tortas");

  // Paso 2: el prompt
  const p1 = await prompt();
  rec(donde, "el prompt incluye los productos, los cálculos ya resueltos y los 7 títulos de salida", p1.includes("Tortas") && p1.includes("Unidades totales vendidas: 1580") && p1.includes("## Resumen") && p1.includes("## Siguiente paso"));
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === p1);

  // Paso 3: respuesta de ejemplo
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await paso3.getByRole("heading", { name: "Rentabilidad por producto" }).waitFor();
  rec(donde, "el análisis trae el resumen y al menos una cifra etiquetada «[HIPÓTESIS]»", (await paso3.getByText("[HIPÓTESIS]").count()) > 0);
  rec(donde, "el tornado de sensibilidad muestra las 4 variables ordenadas por impacto (precio primero)", (await paso3.getByText("Precio de venta").count()) > 0);
  rec(donde, "«Riesgos»/avisos: no marca cifras inventadas en la respuesta del ejemplo", await paso3.getByText("No detecté cifras sin respaldo").isVisible());
  await captura(page, `rentabilidad-resultado-${v.nombre}`);

  // Descarga del informe .csv
  const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descargar el informe (.csv)" }).click()]);
  const rutaDescarga = (await csv.path())!;
  const contenidoCsv = fs.readFileSync(rutaDescarga, "utf8");
  rec(donde, "el informe se descarga en .csv con el detalle por producto y el resultado del período", csv.suggestedFilename() === "informe-de-rentabilidad.csv" && contenidoCsv.includes("Tortas") && contenidoCsv.includes("Utilidad operativa"));

  // Imprimir el resumen
  rec(donde, "la versión para imprimir existe, oculta en pantalla", (await page.locator("#rentabilidad-imprimible").count()) === 1 && !(await page.locator("#rentabilidad-imprimible").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-rentabilidad"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve el resumen (la herramienta queda oculta)", (await page.locator("#rentabilidad-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-rentabilidad"));

  // Otro ejemplo (Taller de Costura)
  await paso3.getByRole("button", { name: /^Otro ejemplo/ }).click();
  await page.getByText("Respuesta de ejemplo pegada").first().waitFor();
  rec(donde, "el siguiente ejemplo llena el formulario con su propio negocio", (await primerNombre.inputValue()) === velas.datos.productos[0].nombre);

  // Una respuesta sin los títulos esperados
  await respuesta.fill("Lo siento, no puedo ayudarte con eso.");
  rec(donde, "una respuesta sin títulos avisa que todavía no puede leerla", await page.getByText("Todavía no puedo leer esta respuesta").isVisible());
  await respuesta.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosRentabilidad(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_RENTAB, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: "Nombre", exact: true }).first().fill("Otro producto");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
  await page.locator("#paso-3").getByRole("button", { name: "Descargar el informe (.csv)" }).click();
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica rentabilidad", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorNichos(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `nichos @${v.nombre}`;
  await page.goto(base + RUTA_NICHOS, { waitUntil: "networkidle" });
  const [, costura] = EJEMPLOS_NICHOS;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const respuestaNichos = page.getByRole("textbox", { name: /^Respuesta del Prompt 1/ });
  const paso3 = page.locator("#paso-3");

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tus nichos») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tus nichos") && (await pasos.nth(0).getAttribute("aria-current")) === "step");

  // Ejemplo del paso 1 (Profesora de inglés corporativo)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  const conocimientos = page.getByRole("textbox", { name: /^Conocimientos y experiencia/ });
  rec(donde, "el ejemplo llena los conocimientos y la oferta", (await conocimientos.inputValue()).includes("8 años dando clases de inglés"));
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-nichos-datos-v1"))) === null);
  await captura(page, `nichos-paso1-${v.nombre}`);

  // Paso 2: el Prompt 1 (todavía sin nichos)
  const p1 = await prompt();
  rec(donde, "sin nichos pegados, el prompt es el Prompt 1 (genera nichos) e incluye el inventario", p1.includes("8 años dando clases de inglés") && p1.includes("## Nichos") && p1.includes("entre 8 y 10 nichos"));
  await page.getByRole("button", { name: /^Copiar prompt/ }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles1 = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el Prompt 1 completo en el portapapeles", portapapeles1 === p1);

  // Paso 3: respuesta de ejemplo del Prompt 1 (8 nichos)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3: nichos\)/ }).click();
  await paso3.getByRole("heading", { name: /Matriz de evaluación \(8 nichos\)/ }).waitFor();
  rec(donde, "la matriz muestra el nicho mejor puntuado primero, con su puntuación calculada por la página", await paso3.getByText("#1 · Inglés para entrevistas de trabajo").isVisible());
  await captura(page, `nichos-matriz-${v.nombre}`);

  // Descarga de la matriz .csv
  const [csv] = await Promise.all([page.waitForEvent("download"), paso3.getByRole("button", { name: "Descargar la matriz (.csv)" }).click()]);
  const contenidoCsv = fs.readFileSync((await csv.path())!, "utf8");
  rec(donde, "la matriz se descarga en .csv con el ranking calculado por la página", csv.suggestedFilename() === "matriz-de-nichos.csv" && contenidoCsv.includes("Inglés para entrevistas de trabajo"));

  // Elegir los 2 favoritos (los mejor puntuados, con pesos iguales)
  await paso3.getByRole("button", { name: "Elegir" }).first().click();
  await paso3.getByRole("button", { name: "Elegir" }).first().click();
  rec(donde, "al elegir 2 favoritos aparece el aviso para copiar el Prompt 2", await paso3.getByText("Ya elegiste tus 2 favoritos.").isVisible());

  // Paso 2 (otra vez): ahora debe mostrar el Prompt 2
  const p2 = await prompt();
  rec(donde, "con 2 favoritos elegidos, el mismo panel cambia solo al Prompt 2 (validación), con los 2 nichos embebidos", p2.includes("## Plan de validación: Nicho 1") && p2.includes("Nicho 1 elegido: Inglés para entrevistas"));

  // Paso 4: respuesta de ejemplo del Prompt 2
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 4: validación\)/ }).click();
  await paso3.getByRole("heading", { name: "Plan de validación: Nicho 1" }).waitFor();
  rec(donde, "el plan de validación no marca ninguna cifra sin respaldo (0 avisos)", await paso3.getByText("Las hipótesis sobre tus clientes están etiquetadas como corresponde.").isVisible());

  // Registro de validación: agrega una entrada y verifica el resumen
  const nicho1Nombre = "Inglés para entrevistas de trabajo en empresas de TI, para desarrolladores peruanos con nivel intermedio";
  await paso3.getByRole("combobox", { name: "Nicho" }).selectOption({ label: nicho1Nombre });
  await paso3.getByRole("textbox", { name: "Resultado" }).fill("5 entrevistas hechas, 2 muy interesadas");
  await paso3.getByRole("button", { name: "Cumplió" }).first().click();
  await paso3.getByRole("button", { name: "Agregar al registro" }).click();
  rec(donde, "el registro de validación guarda la entrada y actualiza el resumen (1 cumplió)", (await paso3.getByText("5 entrevistas hechas, 2 muy interesadas").isVisible()) && (await paso3.locator("text=Cumplieron").locator("xpath=following-sibling::p").first().textContent()) === "1");

  // Imprimir
  rec(donde, "la versión para imprimir existe, oculta en pantalla", (await page.locator("#nichos-imprimible").count()) === 1 && !(await page.locator("#nichos-imprimible").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-nichos"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve la matriz (la herramienta queda oculta)", (await page.locator("#nichos-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-nichos"));

  // Otro ejemplo (contador especializado en costos)
  await paso3.getByRole("button", { name: /^Otro ejemplo/ }).click();
  await page.getByText("Otro ejemplo cargado").first().waitFor();
  rec(donde, "el siguiente ejemplo llena el formulario con su propio perfil", (await conocimientos.inputValue()) === costura.datos.conocimientos);

  // Una respuesta sin la sección «## Nichos»
  await respuestaNichos.fill("Lo siento, no puedo ayudarte con eso.");
  rec(donde, "una respuesta sin «## Nichos» avisa que todavía no puede leerla", await page.getByText("Todavía no puedo leer esta respuesta").isVisible());
  await respuestaNichos.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosNichos(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_NICHOS, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Sectores que te interesan/ }).fill("Otro sector");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3: nichos\)/ }).click();
  await page.locator("#paso-3").getByRole("button", { name: "Descargar la matriz (.csv)" }).click();
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica nichos", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function generadorCatalogo(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `catalogo @${v.nombre}`;
  await page.goto(base + RUTA_CATALOGO, { waitUntil: "networkidle" });
  const [, pasteleria] = EJEMPLOS_CATALOGO;
  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const respuesta = page.getByRole("textbox", { name: /^Respuesta de la IA/ });
  const paso3 = page.locator("#paso-3");

  const pasos = page.locator("nav[aria-label='Pasos de la herramienta'] li");
  rec(donde, "el stepper muestra 3 pasos (el tercero es «Tu catálogo») y el 1 está activo", (await pasos.count()) === 3 && ((await pasos.nth(2).textContent()) ?? "").includes("Tu catálogo") && (await pasos.nth(0).getAttribute("aria-current")) === "step");

  // Ejemplo del paso 1 (Casacas Lima)
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByText("Formulario llenado con datos de ejemplo").first().waitFor();
  const empresa = page.getByRole("textbox", { name: /^Nombre de la empresa/ });
  rec(donde, "el ejemplo llena la empresa y los productos", (await empresa.inputValue()) === "Casacas Lima");
  rec(donde, "el ejemplo NO se guarda como dato de la persona", (await page.evaluate(() => window.localStorage.getItem("gpia-catalogo-productos-datos-v1"))) === null);
  await captura(page, `catalogo-paso1-${v.nombre}`);

  // Paso 2: el prompt incluye la empresa, los productos y los 5 títulos de salida
  const p = await prompt();
  rec(donde, "el prompt incluye la empresa, el CSV de productos y «## Catálogo»", p.includes("Casacas Lima") && p.includes("129.90,99.90,Casacas,CAS-001") && p.includes("## Catálogo") && p.includes("nombre_original"));
  await page.getByRole("button", { name: /^Copiar prompt/ }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = (await page.evaluate(() => navigator.clipboard.readText())).split(String.fromCharCode(13)).join("");
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles === p);

  // Paso 3: respuesta de ejemplo
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3: resultado\)/ }).click();
  await paso3.getByRole("heading", { name: /^Casacas/ }).waitFor();
  rec(donde, "el catálogo agrupa los productos por categoría, en el orden de la respuesta", await paso3.getByRole("heading", { name: /^Casacas/ }).isVisible());
  rec(donde, "cada producto trae su enlace de WhatsApp, armado con el número del formulario", (await paso3.getByRole("link", { name: /^Enlace de WhatsApp/ }).count()) > 0);
  await captura(page, `catalogo-resultado-${v.nombre}`);

  // Descarga del .csv
  const [csv] = await Promise.all([page.waitForEvent("download"), paso3.getByRole("button", { name: "Descargar .csv" }).click()]);
  const contenidoCsv = fs.readFileSync((await csv.path())!, "utf8");
  rec(donde, "el catálogo se descarga en .csv con las columnas generadas", csv.suggestedFilename().endsWith("-catalogo.csv") && contenidoCsv.includes("Casaca impermeable con forro polar"));

  // Fichas para redes: descarga de una ficha PNG (sin foto, con fondo de color)
  await paso3.getByRole("tab", { name: "Fichas para redes" }).click();
  const [png] = await Promise.all([page.waitForEvent("download"), paso3.getByRole("button", { name: "Descargar ficha PNG" }).first().click()]);
  rec(donde, "cada producto genera una ficha PNG en el navegador (sin foto, con fondo de color)", (png.suggestedFilename() ?? "").endsWith(".png"));

  // Revisión: datos faltantes y sugerencias de fotos
  await paso3.getByRole("tab", { name: "Revisión" }).click();
  rec(donde, "la pestaña de revisión muestra los datos faltantes y las sugerencias de fotos de la respuesta", await paso3.getByRole("tabpanel", { name: "Revisión" }).getByText("no indicaste los colores disponibles").isVisible());

  // Precio que no coincide: bloquea la descarga con un mensaje claro
  await paso3.getByRole("tab", { name: "Catálogo" }).click();
  const original = await respuesta.inputValue();
  await respuesta.fill(original.replace("129.90,99.90", "150.00,99.90"));
  rec(donde, "un precio que no coincide con el formulario bloquea la descarga y explica cuál producto revisar", await paso3.getByText("Descarga bloqueada: 1 precio(s) no coinciden").isVisible());
  rec(donde, "con la descarga bloqueada, el botón de PDF y el de .csv quedan deshabilitados", (await paso3.getByRole("button", { name: "Descargar catálogo en PDF" }).isDisabled()) && (await paso3.getByRole("button", { name: "Descargar .csv" }).isDisabled()));
  await respuesta.fill(original);
  rec(donde, "al corregir el precio, la descarga se desbloquea sola", !(await paso3.getByRole("button", { name: "Descargar .csv" }).isDisabled()));

  // Imprimir
  rec(donde, "la versión para imprimir existe, oculta en pantalla", (await page.locator("#catalogo-imprimible").count()) === 1 && !(await page.locator("#catalogo-imprimible").isVisible()));
  await page.evaluate(() => document.body.classList.add("imprimiendo-catalogo"));
  await page.emulateMedia({ media: "print" });
  rec(donde, "al imprimir solo se ve el catálogo por categorías (la herramienta queda oculta)", (await page.locator("#catalogo-imprimible").isVisible()) && !(await page.locator("#paso-1").isVisible()));
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => document.body.classList.remove("imprimiendo-catalogo"));

  // Otro ejemplo (Dulce Trigo)
  await paso3.getByRole("button", { name: /^Otro ejemplo/ }).click();
  await paso3.getByRole("heading", { name: /^Tortas/ }).waitFor();
  rec(donde, `el siguiente ejemplo (${pasteleria.datos.empresa}) pega su propia respuesta, con sus propias categorías`, await paso3.getByRole("heading", { name: /^Tortas/ }).isVisible());

  // Una respuesta sin la sección «## Catálogo»
  await respuesta.fill("Lo siento, no puedo ayudarte con eso.");
  rec(donde, "una respuesta sin «## Catálogo» avisa que todavía no puede leerla", await page.getByText("Todavía no puedo leer esta respuesta").isVisible());
  await respuesta.fill("");

  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  await ctx.close();
}

async function eventosCatalogo(browser: Browser) {
  const { ctx, page } = await abrir(browser, VIEWPORTS[1], { analitica: true });
  await page.goto(base + RUTA_CATALOGO, { waitUntil: "networkidle" });
  const registro = () => page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).filter((e) => e[0] === "event").map((e) => String(e[1])));
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
  await page.getByRole("textbox", { name: /^Rubro/ }).fill("Otro rubro");
  await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3: resultado\)/ }).click();
  await page.locator("#paso-3").getByRole("button", { name: "Descargar .csv" }).click();
  await page.getByRole("button", { name: "Limpiar formulario" }).click();
  const e = await registro();
  for (const n of ["ejemplo_rellenado", "datos_propios_iniciados", "ejemplo_descargado", "ejemplo_limpiado"]) rec("analítica catalogo", `evento ${n}`, e.includes(n), e.join(","));
  await ctx.close();
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    for (const v of VIEWPORTS) {
      console.log(`— ${v.nombre} px —`);
      await paginas(browser, v);
      await buscador(browser, v);
      await generadorCv(browser, v);
      await generadorOptimizar(browser, v);
      await generadorPresupuesto(browser, v);
      await generadorEntrevista(browser, v);
      await generadorAnalisis(browser, v);
      await generadorSalario(browser, v);
      await generadorPlan(browser, v);
      await generadorItinerario(browser, v);
      await generadorFechas(browser, v);
      await generadorComparar(browser, v);
      await generadorDestinos(browser, v);
      await generadorLogo(browser, v);
      await generadorPlanNegocio(browser, v);
      await generadorRentabilidad(browser, v);
      await generadorNichos(browser, v);
      await generadorCatalogo(browser, v);
    }
    await sinEnlacesACerradas(browser);
    await temaYAnuncios(browser);
    await eventos(browser);
    await eventosPresupuesto(browser);
    await eventosEntrevista(browser);
    await eventosAnalisis(browser);
    await eventosSalario(browser);
    await eventosPlan(browser);
    await eventosItinerario(browser);
    await eventosFechas(browser);
    await eventosComparar(browser);
    await eventosDestinos(browser);
    await eventosLogo(browser);
    await eventosPlanNegocio(browser);
    await eventosRentabilidad(browser);
    await eventosNichos(browser);
    await eventosCatalogo(browser);
    await traspasoAnalisis(browser);
    await teclado(browser);
    const s = await fetch(base + "/sitemap.xml").then((r) => r.text());
    rec("sitemap", "lista la herramienta de optimizar CV", s.includes(`${RUTA_OPT}</loc>`));
    const og = await fetch(base + "/og/carrera-y-empleo/optimizar-cv");
    rec("og", "la herramienta publicada tiene imagen Open Graph propia (PNG)", og.status === 200 && (og.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de plan de búsqueda de empleo", s.includes(`${RUTA_PLAN}</loc>`));
    const ogPl = await fetch(base + "/og/carrera-y-empleo/crear-plan-de-busqueda-de-empleo");
    rec("og", "la herramienta de plan de búsqueda tiene imagen Open Graph propia (PNG)", ogPl.status === 200 && (ogPl.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de evaluar oferta y negociar salario", s.includes(`${RUTA_SAL}</loc>`));
    const ogS = await fetch(base + "/og/carrera-y-empleo/calcular-salario-y-negociar-oferta");
    rec("og", "la herramienta de salario tiene imagen Open Graph propia (PNG)", ogS.status === 200 && (ogS.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de comparar CV con oferta", s.includes(`${RUTA_ANA}</loc>`));
    const ogA = await fetch(base + "/og/carrera-y-empleo/analizar-oferta-laboral");
    rec("og", "la herramienta de análisis tiene imagen Open Graph propia (PNG)", ogA.status === 200 && (ogA.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de preparar entrevista", s.includes(`${RUTA_ENT}</loc>`));
    const ogE = await fetch(base + "/og/carrera-y-empleo/preparar-entrevista-de-trabajo");
    rec("og", "la herramienta de entrevista tiene imagen Open Graph propia (PNG)", ogE.status === 200 && (ogE.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista el hub de Viajes y la herramienta de presupuesto", s.includes("/viajes-y-entretenimiento</loc>") && s.includes(`${RUTA_PRES}</loc>`));
    const ogp = await fetch(base + "/og/viajes-y-entretenimiento/planificar-presupuesto-de-viaje");
    rec("og", "el presupuesto de viaje tiene imagen Open Graph propia (PNG)", ogp.status === 200 && (ogp.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de crear itinerario de viaje", s.includes(`${RUTA_ITIN}</loc>`));
    const ogIt = await fetch(base + "/og/viajes-y-entretenimiento/crear-itinerario-de-viaje");
    rec("og", "la herramienta de itinerario tiene imagen Open Graph propia (PNG)", ogIt.status === 200 && (ogIt.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de fechas más baratas para volar", s.includes(`${RUTA_FECHAS}</loc>`));
    const ogF = await fetch(base + "/og/viajes-y-entretenimiento/encontrar-fechas-mas-baratas-para-volar");
    rec("og", "la herramienta de fechas tiene imagen Open Graph propia (PNG)", ogF.status === 200 && (ogF.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de comparar opciones de viaje", s.includes(`${RUTA_CMP}</loc>`));
    const ogCmp = await fetch(base + "/og/viajes-y-entretenimiento/comparar-opciones-de-viaje");
    rec("og", "la herramienta de comparar tiene imagen Open Graph propia (PNG)", ogCmp.status === 200 && (ogCmp.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de descubrir destinos según presupuesto", s.includes(`${RUTA_DEST}</loc>`));
    const ogDest = await fetch(base + "/og/viajes-y-entretenimiento/descubrir-destinos-segun-presupuesto");
    rec("og", "la herramienta de destinos tiene imagen Open Graph propia (PNG)", ogDest.status === 200 && (ogDest.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista el hub de Emprendimiento y la herramienta de crear un logo", s.includes("/emprendimiento</loc>") && s.includes(`${RUTA_LOGO}</loc>`));
    const ogLogo = await fetch(base + "/og/emprendimiento/crear-logo-profesional-para-mi-empresa");
    rec("og", "la herramienta de logo tiene imagen Open Graph propia (PNG)", ogLogo.status === 200 && (ogLogo.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de crear un plan de negocio", s.includes(`${RUTA_PLANNEG}</loc>`));
    const ogPlanNeg = await fetch(base + "/og/emprendimiento/crear-plan-de-negocio");
    rec("og", "la herramienta de plan de negocio tiene imagen Open Graph propia (PNG)", ogPlanNeg.status === 200 && (ogPlanNeg.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de calcular la rentabilidad de un negocio", s.includes(`${RUTA_RENTAB}</loc>`));
    const ogRentab = await fetch(base + "/og/emprendimiento/calcular-rentabilidad-de-mi-negocio");
    rec("og", "la herramienta de rentabilidad tiene imagen Open Graph propia (PNG)", ogRentab.status === 200 && (ogRentab.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de identificar nichos de mercado", s.includes(`${RUTA_NICHOS}</loc>`));
    const ogNichos = await fetch(base + "/og/emprendimiento/identificar-nichos-de-mercado");
    rec("og", "la herramienta de nichos tiene imagen Open Graph propia (PNG)", ogNichos.status === 200 && (ogNichos.headers.get("content-type") ?? "").includes("image/png"));
    rec("sitemap", "lista la herramienta de crear un catálogo de productos", s.includes(`${RUTA_CATALOGO}</loc>`));
    const ogCatalogo = await fetch(base + "/og/emprendimiento/crear-catalogo-de-productos");
    rec("og", "la herramienta de catálogo tiene imagen Open Graph propia (PNG)", ogCatalogo.status === 200 && (ogCatalogo.headers.get("content-type") ?? "").includes("image/png"));
    rec("og", "una herramienta pendiente no tiene imagen (404)", (await fetch(base + "/og/finanzas-y-economia/crear-presupuesto-personal")).status === 404);
    rec("sitemap", "lista portada, categoría, herramienta, artículos y páginas legales", [`/</loc>`, `/carrera-y-empleo</loc>`, `${RUTA_CV}</loc>`, ...ARTICULOS.map((a) => `${a}</loc>`), `/politica-de-privacidad</loc>`].every((t) => s.includes(t)));
    rec("sitemap", "no lista categorías cerradas ni herramientas pendientes", !s.includes("/herramientas") && [...CERRADAS, ...PENDIENTES].every((r) => !s.includes(r)));
    const r = await fetch(base + "/robots.txt").then((x) => x.text());
    rec("robots", "apunta al sitemap y no bloquea nada", r.includes("sitemap.xml") && !/Disallow:\s*\S/.test(r));
    const ads = await fetch(base + "/ads.txt");
    rec("ads.txt", "responde 200 con la línea de Google", ads.status === 200 && /^google\.com, pub-\d+, DIRECT, f08c47fec0942fa0$/.test((await ads.text()).trim()));
  } finally {
    await browser.close();
  }
  console.log(`\n${total} pruebas: ${total - fallos} OK, ${fallos} FALLA`);
  process.exit(fallos ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
