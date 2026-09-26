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

const base = (process.argv.find((a) => /^https?:/.test(a)) ?? "http://localhost:3100").replace(/\/$/, "");
const iCap = process.argv.indexOf("--capturas");
const carpetaCapturas = iCap > -1 ? process.argv[iCap + 1] : null;

const RUTA_CV = "/carrera-y-empleo/crear-cv-ats-formato-harvard";
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
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"], colorScheme: o.tema ?? "light" });
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
  for (const ruta of ["/herramientas", "/marketing/crear-afiches-con-ia", "/creatividad-y-contenido", "/carrera-y-empleo/no-existe", "/mi-negocio"]) {
    const r = await page.goto(base + ruta);
    rec(`${ruta} @${v.nombre}`, "ruta inexistente o cerrada → 404", r?.status() === 404, `${r?.status()}`);
  }
  const r410 = await page.goto(base + "/blog/algo");
  rec(`/blog/algo @${v.nombre}`, "URL antigua → 410", r410?.status() === 410, `${r410?.status()}`);
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
  rec("tema", "el fondo oscuro es #0a2540 (o el claro es blanco)", despues ? fondo === "rgb(10, 37, 64)" : fondo === "rgb(255, 255, 255)", fondo);
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

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const v of VIEWPORTS) {
      console.log(`— ${v.nombre} px —`);
      await paginas(browser, v);
      await buscador(browser, v);
      await generadorCv(browser, v);
    }
    await temaYAnuncios(browser);
    await eventos(browser);
    await teclado(browser);
    const s = await fetch(base + "/sitemap.xml").then((r) => r.text());
    rec("sitemap", "lista portada, categoría, herramienta, artículos y páginas legales", [`/</loc>`, `/carrera-y-empleo</loc>`, `${RUTA_CV}</loc>`, ...ARTICULOS.map((a) => `${a}</loc>`), `/politica-de-privacidad</loc>`].every((t) => s.includes(t)));
    rec("sitemap", "no lista rutas cerradas", !s.includes("/herramientas") && !s.includes("creatividad-y-contenido"));
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
