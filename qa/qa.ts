/**
 * Pruebas de navegador del sitio (Playwright + Chrome) contra un servidor ya en marcha:
 *   npm run build && npx next start -p 3100   (en otra terminal)
 *   npm run qa -- http://localhost:3100 [--capturas ruta/de/salida]
 * Comprueba, a 375 y a 1280 px: páginas que responden 200 y rutas retiradas que dan 404, ausencia de scroll horizontal,
 * botones y campos de 44 px, errores de consola, buscador, y el generador de hoja de vida de punta a punta (formulario →
 * prompt en vivo → copiar → pegar respuesta → vista previa → descarga del Word y comprobación de su contenido).
 */
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { chromium, type Browser, type Page } from "playwright-core";
import { CV_EJEMPLO_RESPUESTA } from "../content/prompts/cv-ejemplo";

const base = (process.argv.find((a) => /^https?:/.test(a)) ?? "http://localhost:3100").replace(/\/$/, "");
const iCap = process.argv.indexOf("--capturas");
const carpetaCapturas = iCap > -1 ? process.argv[iCap + 1] : null;

const RUTA_CV = "/carrera-y-empleo/crear-cv-ats-formato-harvard";
const VIEWPORTS = [
  { nombre: "375", width: 375, height: 800 },
  { nombre: "1280", width: 1280, height: 900 },
] as const;

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

async function abrir(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"], colorScheme: "light" });
  const page = await ctx.newPage();
  const errores: string[] = [];
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  page.on("pageerror", (e) => errores.push(String(e)));
  // Sin banner de cookies: la elección ya está guardada.
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("aixtack:consent", JSON.stringify({ ads: "denied", analytics: "denied", decided: true }));
    } catch {}
  });
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
      // Enlaces dentro de un párrafo de texto no cuentan (WCAG: excepción de enlaces en línea).
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
}

async function paginas(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const rutas: [string, string][] = [
    ["/", "home"],
    ["/carrera-y-empleo", "categoria"],
    [RUTA_CV, "cv"],
    ["/sobre-nosotros", "sobre"],
    ["/contacto", "contacto"],
    ["/politica-de-privacidad", "privacidad"],
    ["/politica-de-cookies", "cookies"],
    ["/terminos-y-condiciones", "terminos"],
  ];
  for (const [ruta, nombre] of rutas) {
    const r = await page.goto(base + ruta, { waitUntil: "networkidle" });
    const donde = `${ruta} @${v.nombre}`;
    rec(donde, "responde 200", r?.status() === 200, `${r?.status()}`);
    await basicas(page, donde);
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

async function buscador(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const caja = page.getByRole("searchbox", { name: "Buscar prompts" }).first();
  const visible = page.getByRole("searchbox", { name: "Buscar prompts" });
  const n = await visible.count();
  let usada = caja;
  for (let i = 0; i < n; i++) if (await visible.nth(i).isVisible()) usada = visible.nth(i);
  await usada.fill("curriculum ats");
  await page.waitForTimeout(150);
  const enlace = page.locator("a", { hasText: "Crear un CV en formato Harvard" }).first();
  rec(`buscador @${v.nombre}`, "«curriculum ats» encuentra el prompt del CV (sin tildes)", await enlace.isVisible());
  await usada.fill("zzzz");
  rec(`buscador @${v.nombre}`, "una búsqueda sin resultados lo dice", await page.getByText("Todavía no hay un prompt para").isVisible());
  await usada.fill("cv");
  await page.locator("a", { hasText: "Crear un CV en formato Harvard" }).first().click();
  await page.waitForURL("**" + RUTA_CV);
  rec(`buscador @${v.nombre}`, "el resultado lleva a la página del CV", page.url().endsWith(RUTA_CV));
  rec(`buscador @${v.nombre}`, "sin errores de consola", errores.length === 0, errores.join(" | "));
  await ctx.close();
}

async function generadorCv(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const { ctx, page, errores } = await abrir(browser, v);
  const donde = `generador @${v.nombre}`;
  await page.goto(base + RUTA_CV, { waitUntil: "networkidle" });

  const prompt = () => page.locator("[data-prompt]").textContent().then((t) => t ?? "");
  const p0 = await prompt();
  rec(donde, "el prompt empieza vacío con «(no indicado)»", p0.includes("(no indicado)") && p0.includes("### AUTOVERIFICACIÓN"));
  rec(donde, "avance 0 de 8", await page.getByText("Datos completados: 0 de 8").isVisible());

  await page.getByLabel("Puesto al que postulas").fill("Analista de marketing digital");
  await page.getByLabel("Oferta laboral").fill("Buscamos analista con SEO y Google Analytics.");
  await page.getByLabel("Nombre completo").fill("Camila Rojas");
  await page.getByLabel("Correo electrónico").fill("camila@example.com");
  await page.getByLabel("Teléfono").fill("+51 900 000 000");
  await page.getByLabel("Ciudad y país").first().fill("Lima, Perú");
  await page.getByLabel("Cargo").first().fill("Analista de marketing");
  await page.getByLabel("Empresa").first().fill("Tienda Ejemplo");
  await page.getByLabel("Lo que hiciste y lograste").first().fill("Armé reportes mensuales en Google Analytics\nPubliqué 12 artículos SEO");
  await page.getByLabel("Título o carrera").fill("Licenciatura en Marketing");
  await page.getByLabel("Institución").fill("Universidad Ejemplo");
  await page.getByLabel("Habilidades y herramientas").fill("SEO\nGoogle Analytics");
  await page.getByLabel("Tu nivel de experiencia").selectOption("semi-senior");

  const p1 = await prompt();
  for (const t of ["Camila Rojas", "camila@example.com", "Tienda Ejemplo", "Armé reportes mensuales en Google Analytics", "Buscamos analista con SEO", "EXPERIENCIA PROFESIONAL → EDUCACIÓN"]) rec(donde, `el prompt se actualiza en vivo con «${t}»`, p1.includes(t));
  rec(donde, "avance 8 de 8", await page.getByText("Datos completados: 8 de 8").isVisible());

  // Filas repetibles
  await page.getByRole("button", { name: "Agregar otro trabajo" }).click();
  rec(donde, "se puede agregar otro trabajo", (await page.getByText("Trabajo 2").count()) === 1);
  await page.getByRole("button", { name: "Quitar el trabajo 2" }).click();
  rec(donde, "se puede quitar un trabajo", (await page.getByText("Trabajo 2").count()) === 0);

  // Copiar
  await page.getByRole("button", { name: "Copiar prompt" }).click();
  await page.getByText("¡Prompt copiado!").waitFor();
  const portapapeles = await page.evaluate(() => navigator.clipboard.readText());
  rec(donde, "«Copiar prompt» deja el prompt completo en el portapapeles", portapapeles.split(String.fromCharCode(13)).join("") === p1, `${portapapeles.length} vs ${p1.length} caracteres`);

  // Persistencia
  await page.reload({ waitUntil: "networkidle" });
  rec(donde, "los datos siguen ahí tras recargar (guardados en el navegador)", (await page.getByLabel("Nombre completo").inputValue()) === "Camila Rojas");

  // Respuesta mal formateada
  await page.getByRole("textbox", { name: "Respuesta de la IA" }).fill("Claro, aquí tienes tu CV. Es muy bueno.");
  rec(donde, "una respuesta sin formato muestra el aviso", await page.getByText("La respuesta no tiene el formato esperado").isVisible());
  rec(donde, "…y el botón de descarga queda desactivado", await page.getByRole("button", { name: "Descargar mi CV en Word (.docx)" }).isDisabled());
  await page.getByRole("button", { name: "Copiar mensaje de corrección" }).click();
  rec(donde, "el mensaje de corrección se copia", (await page.evaluate(() => navigator.clipboard.readText())).includes("=== NOTAS ==="));

  // Respuesta buena
  await page.getByRole("textbox", { name: "Respuesta de la IA" }).fill(CV_EJEMPLO_RESPUESTA);
  await page.locator("[data-vista-cv]").first().waitFor();
  const vista = await page.locator("[data-vista-cv]").first().innerText();
  rec(donde, "la vista previa muestra el CV leído", vista.includes("Camila Rojas") && vista.includes("EXPERIENCIA PROFESIONAL") && vista.includes("Tienda Ejemplo S.A.C."));
  rec(donde, "las notas de la IA se muestran aparte y no dentro de la hoja", !vista.includes("Brecha") && (await page.getByText("Notas de la IA para ti").isVisible()));
  const scrollX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  rec(donde, "sin scroll horizontal con la vista previa", scrollX <= 1, `${scrollX}px`);
  await captura(page, `cv-con-respuesta-${v.nombre}`);

  // Descarga del Word
  const [descarga] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descargar mi CV en Word (.docx)" }).click()]);
  rec(donde, "el archivo se llama CV-Camila-Rojas.docx", descarga.suggestedFilename() === "CV-Camila-Rojas.docx", descarga.suggestedFilename());
  const ruta = await descarga.path();
  const zip = await JSZip.loadAsync(fs.readFileSync(ruta));
  const xml = await zip.file("word/document.xml")!.async("string");
  rec(donde, "el .docx contiene el nombre, las secciones y las viñetas", xml.includes("Camila Rojas") && xml.includes("EXPERIENCIA PROFESIONAL") && xml.includes("Elaboré reportes mensuales") && xml.includes("w:numPr"));
  rec(donde, "el .docx no tiene tablas, imágenes ni cuadros de texto", !xml.includes("<w:tbl>") && !xml.includes("<w:drawing") && !xml.includes("txbxContent"));
  rec(donde, "el .docx no contiene las notas de la IA", !xml.includes("Brecha") && !xml.includes("=== NOTAS"));

  // Borrador sin IA
  const [descarga2] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /borrador con mis datos/ }).click()]);
  const zip2 = await JSZip.loadAsync(fs.readFileSync((await descarga2.path())!));
  const xml2 = await zip2.file("word/document.xml")!.async("string");
  rec(donde, "el borrador sin IA se descarga con los datos escritos", xml2.includes("Camila Rojas") && xml2.includes("Armé reportes mensuales en Google Analytics"));

  // Borrar datos
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Borrar mis datos" }).click();
  rec(donde, "«Borrar mis datos» vacía el formulario", (await page.getByLabel("Nombre completo").inputValue()) === "");

  await basicas(page, donde);
  rec(donde, "sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));
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
    const s = await fetch(base + "/sitemap.xml").then((r) => r.text());
    rec("sitemap", "lista portada, categoría, prompt y páginas legales", [`/</loc>`, `/carrera-y-empleo</loc>`, `${RUTA_CV}</loc>`, `/politica-de-privacidad</loc>`].every((t) => s.includes(t)));
    rec("sitemap", "no lista rutas cerradas", !s.includes("/herramientas") && !s.includes("creatividad-y-contenido"));
    const r = await fetch(base + "/robots.txt").then((x) => x.text());
    rec("robots", "apunta al sitemap", r.includes("sitemap.xml"));
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
