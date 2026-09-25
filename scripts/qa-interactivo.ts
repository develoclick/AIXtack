/**
 * Recorrido interactivo automático (Playwright + Chrome del sistema) sobre el build de producción.
 *
 *   npm run build && npx next start -p 3100        (otra terminal)
 *   npm run qa -- http://localhost:3100
 *
 * Recorre a 375 px y a 1280 px: la portada, /mi-negocio y las 15 herramientas. Comprueba formulario, «Probar con un ejemplo»,
 * «Empezar de cero», «Ver el prompt completo», «Copiar prompt» (portapapeles permitido, API bloqueada con método antiguo y
 * todo bloqueado → texto para copiar a mano), perfil (guardar, autocompletar en otra herramienta, borrar, localStorage
 * bloqueado), calculadoras (todos sus casos de prueba: esperado frente a obtenido), pre-procesos de los analizadores,
 * scroll horizontal, tamaño de los botones (≥ 44 px), foco visible y errores de consola. Guarda capturas en docs/qa/ (nunca
 * en public/) y la tabla en docs/qa/resultados.md. Sale con código 1 si algo falla.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium, type Browser, type Page } from "playwright-core";
import { calcular, formatear } from "../lib/herramientas/calculadora";
import { ejecutarPreproceso } from "../lib/herramientas/preprocesos";
import { listarTodas, rutaHerramienta, type HerramientaCargada } from "../lib/herramientas/registro";
import { pasosDelProceso } from "../lib/herramientas/tipos";
import { renderPlantilla } from "../lib/herramientas/plantillas";
import { TEXTO_PRIVACIDAD } from "../lib/herramientas/perfil";

const base = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
// `--solo /area/slug`: recorre solo esa herramienta (lo usa `npm run publicar`); las capturas y el resultado van a una carpeta temporal.
const soloIdx = process.argv.indexOf("--solo");
const solo = soloIdx >= 0 ? process.argv[soloIdx + 1] : undefined;
const salida = solo ? path.join(os.tmpdir(), "qa-solo") : path.join(process.cwd(), "docs", "qa");
const VIEWPORTS = [
  { nombre: "375", ancho: 375, alto: 812, movil: true },
  { nombre: "1280", ancho: 1280, alto: 800, movil: false },
];
const PROHIBIDO = /\{\{|\}\}|\bundefined\b|\bnull\b|\bNaN\b|\[object/;

interface Fila {
  pagina: string;
  vista: string;
  prueba: string;
  ok: boolean;
  detalle: string;
}
const filas: Fila[] = [];
const rec = (pagina: string, vista: string, prueba: string, ok: boolean, detalle = "") => {
  filas.push({ pagina, vista, prueba, ok, detalle });
  if (!ok) console.log(`FALLA · ${pagina} @${vista} · ${prueba} · ${detalle}`);
};
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ───────────── utilidades de página ───────────── */

async function contexto(browser: Browser, v: (typeof VIEWPORTS)[number], opciones: { portapapeles?: boolean; almacenBloqueado?: boolean; copiaBloqueada?: "api" | "todo" } = {}) {
  const ctx = await browser.newContext({ viewport: { width: v.ancho, height: v.alto }, hasTouch: v.movil, isMobile: v.movil, deviceScaleFactor: 1 });
  // tsx/esbuild inserta `__name` en las funciones que se envían al navegador: se define para que page.evaluate funcione.
  await ctx.addInitScript("window.__name = (f) => f;");
  ctx.setDefaultTimeout(8000);
  if (opciones.portapapeles) await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
  if (opciones.almacenBloqueado) {
    await ctx.addInitScript(() => {
      const fallo = () => {
        throw new DOMException("bloqueado por la prueba", "SecurityError");
      };
      Storage.prototype.getItem = fallo;
      Storage.prototype.setItem = fallo;
      Storage.prototype.removeItem = fallo;
    });
  }
  if (opciones.copiaBloqueada) {
    const todo = opciones.copiaBloqueada === "todo";
    await ctx.addInitScript((bloquearTodo) => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("bloqueado por la prueba")), readText: () => Promise.reject(new Error("bloqueado")) }, configurable: true });
      if (bloquearTodo) document.execCommand = () => false;
    }, todo);
  }
  return ctx;
}

function vigilar(page: Page) {
  const errores: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errores.push(`console: ${m.text().slice(0, 160)}`);
  });
  page.on("pageerror", (e) => errores.push(`excepción: ${String(e.message).slice(0, 160)}`));
  page.on("requestfailed", (r) => errores.push(`petición fallida: ${r.url().slice(0, 100)}`));
  return errores;
}

async function abrir(page: Page, ruta: string) {
  await page.goto(base + ruta, { waitUntil: "networkidle" });
  const rechazar = page.getByRole("button", { name: "Rechazar" });
  if (await rechazar.count()) await rechazar.first().click().catch(() => {});
  // Hidratación: esperar a que React haya enlazado algún botón.
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => Object.keys(b).some((k) => k.startsWith("__react"))), null, { timeout: 15000 });
}

const SEL_HERR = "section[aria-labelledby='herramienta-titulo']";
const SEL_PROCESO = "section[aria-labelledby='proceso-titulo']";
/** El primer prompt de la página: en una herramienta simple, el del bloque de la herramienta; en un proceso, el del paso 2. */
const promptTexto = (page: Page, panel = SEL_HERR) => page.locator(`${panel} pre`).first().evaluate((e) => e.textContent ?? "");
const idDeEtiqueta = (page: Page, texto: string) =>
  page.evaluate((t) => {
    const re = new RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( \\(.{1,6}\\))?( ?\\(obligatorio\\))?$`);
    const l = [...document.querySelectorAll("section[aria-labelledby='herramienta-titulo'] label")].find((x) => re.test((x.textContent ?? "").trim()));
    return (l as HTMLLabelElement | undefined)?.htmlFor ?? null;
  }, texto);
const control = (page: Page, id: string) => page.locator(`[id="${id}"]`);

async function llenar(page: Page, etiqueta: string, valor: string) {
  const id = await idDeEtiqueta(page, etiqueta);
  if (!id) throw new Error(`no encuentro el campo «${etiqueta}»`);
  const c = control(page, id);
  if ((await c.evaluate((e) => e.tagName)) === "SELECT") await c.selectOption({ label: valor }).catch(() => c.selectOption(valor));
  else await c.fill(valor);
}

async function sinDesbordeHorizontal(page: Page) {
  return page.evaluate(() => ({ ancho: document.documentElement.scrollWidth, ventana: window.innerWidth }));
}

/** Botones, resúmenes y controles de formulario de <main>: alto ≥ 44 px (y ancho ≥ 44 px en botones). */
async function objetivosPequenos(page: Page) {
  return page.evaluate(() => {
    const salida: string[] = [];
    const visibles = (e: Element) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && !(e as HTMLElement).closest("[aria-hidden='true']") && !(e as HTMLElement).closest(".sr-only");
    };
    const candidatos = [...document.querySelectorAll("main button, main summary, main select, main input:not([type=checkbox]):not([type=hidden]), main textarea, header button")];
    for (const e of candidatos) {
      if (!visibles(e)) continue;
      const r = e.getBoundingClientRect();
      const esBoton = e.tagName === "BUTTON" || e.tagName === "SUMMARY";
      if (r.height < 43.5 || (esBoton && r.width < 43.5)) salida.push(`${e.tagName.toLowerCase()} «${(e.textContent ?? "").trim().slice(0, 30)}» ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    for (const c of document.querySelectorAll("main input[type=checkbox]")) {
      if (!visibles(c) && !c.closest("label")) continue;
      const caja = (c.closest("label") ?? c).getBoundingClientRect();
      if (caja.height < 43.5) salida.push(`casilla «${(c.closest("label")?.textContent ?? "").trim().slice(0, 30)}» ${Math.round(caja.width)}×${Math.round(caja.height)}`);
    }
    return salida;
  });
}

/** Recorre con Tab los controles de <main> y comprueba que cada uno muestra un contorno de foco. */
async function focoVisible(page: Page, maxPasos = 45) {
  // Las transiciones de color (150–300 ms) harían medir un color intermedio: se apagan solo para medir.
  await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press("Tab");
  const malos: string[] = [];
  let vistos = 0;
  for (let i = 0; i < maxPasos; i++) {
    const info = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement | null;
      if (!e || e === document.body) return null;
      // Cualquier color CSS (rgb, lab, oklab, oklch…) → [r,g,b,a] en sRGB, convertido por el propio navegador con un lienzo.
      const lienzo = document.createElement("canvas");
      lienzo.width = lienzo.height = 1;
      const cx = lienzo.getContext("2d", { willReadFrequently: true })!;
      const parsear = (txt: string): number[] | null => {
        cx.clearRect(0, 0, 1, 1);
        cx.fillStyle = "#000";
        cx.fillStyle = txt;
        cx.fillRect(0, 0, 1, 1);
        const d = cx.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], d[3] / 255];
      };
      const lum = (c: number[]) => {
        const f = (v: number) => {
          const x = Math.min(Math.max(v, 0), 255) / 255;
          return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      };
      const fondoDe = (el: Element): number[] => {
        let capa: number[] = [255, 255, 255];
        const cadena: Element[] = [];
        for (let x: Element | null = el; x; x = x.parentElement) cadena.push(x);
        for (const x of cadena.reverse()) {
          const c = parsear(getComputedStyle(x).backgroundColor);
          if (c && c[3] > 0) capa = [0, 1, 2].map((k) => c[k] * c[3] + capa[k] * (1 - c[3]));
        }
        return capa;
      };
      const contraste = (color: string, el: Element) => {
        const c = parsear(color);
        if (!c) return 0;
        const f = fondoDe(el.parentElement ?? el); // el contorno (con separación) o la sombra se dibujan fuera del elemento: sobre el fondo de su contenedor
        const mezcla = [0, 1, 2].map((k) => c[k] * c[3] + f[k] * (1 - c[3]));
        const a = lum(mezcla), b = lum(f);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };
      const evaluar = (el: Element) => {
        const s = getComputedStyle(el);
        if (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) {
          const ancho = s.outlineStyle === "auto" ? Math.max(parseFloat(s.outlineWidth), 2) : parseFloat(s.outlineWidth);
          return { visible: ancho >= 2, ratio: contraste(s.outlineColor, el), origen: `contorno ${s.outlineStyle} ${s.outlineWidth}` };
        }
        const col = /(?:rgba?|oklab|oklch|lab|lch|color)\([^)]+\)/.exec(s.boxShadow.replace(/rgba\(0, 0, 0, 0\)/g, ""))?.[0];
        if (s.boxShadow !== "none" && col) return { visible: true, ratio: contraste(col, el), origen: "sombra" };
        return { visible: false, ratio: 0, origen: "sin contorno" };
      };
      let ev = evaluar(e);
      const etiqueta = e.closest("label");
      if (etiqueta && !(ev.visible && ev.ratio >= 3)) {
        const evL = evaluar(etiqueta);
        if (evL.visible && evL.ratio >= 3) ev = { ...evL, origen: `etiqueta: ${evL.origen}` };
      }
      const r = e.getBoundingClientRect();
      return {
        etiqueta: `${e.tagName.toLowerCase()} «${(e.textContent || (e as HTMLInputElement).ariaLabel || e.getAttribute("aria-label") || e.id || "").trim().slice(0, 25)}» (${ev.origen}, contraste ${ev.ratio.toFixed(1)}:1)`,
        enMain: Boolean(e.closest("main, header, footer")),
        visible: r.width > 0 && r.height > 0,
        contorno: ev.visible && ev.ratio >= 3,
        sombra: false,
      };
    });
    if (info?.enMain && info.visible) {
      vistos++;
      if (!info.contorno) malos.push(info.etiqueta);
    }
    await page.keyboard.press("Tab");
  }
  return { vistos, malos };
}

async function captura(page: Page, vista: string, nombre: string, selector = "section[aria-labelledby='herramienta-titulo']") {
  const dir = path.join(salida, vista);
  fs.mkdirSync(dir, { recursive: true });
  const el = page.locator(selector).first();
  if (await el.count()) await el.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(dir, `${nombre}.jpg`), type: "jpeg", quality: 60 });
}

/* ───────────── pruebas por herramienta ───────────── */

async function pruebasHerramienta(browser: Browser, h: HerramientaCargada, v: (typeof VIEWPORTS)[number]) {
  const ruta = rutaHerramienta(h.meta);
  const pag = ruta;
  const proceso = pasosDelProceso(h);
  const ctx = await contexto(browser, v, { portapapeles: true });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const errores = vigilar(page);
  try {
    await abrir(page, ruta);

    // layout
    const d = await sinDesbordeHorizontal(page);
    rec(pag, v.nombre, "sin scroll horizontal", d.ancho <= d.ventana, `ancho de contenido ${d.ancho} · ventana ${d.ventana}`);
    const chicos = await objetivosPequenos(page);
    rec(pag, v.nombre, "botones y controles ≥ 44 px", chicos.length === 0, chicos.join(" | "));
    const foco = await focoVisible(page);
    rec(pag, v.nombre, "foco visible con Tab", foco.malos.length === 0 && foco.vistos > 0, `${foco.vistos} controles; sin contorno: ${foco.malos.join(", ") || "ninguno"}`);

    // formulario + ejemplo
    // Los campos cuyo ejemplo es una cadena vacía (opcionales sin ejemplo) no se cuentan como «llenos».
    const panel = proceso ? SEL_PROCESO : SEL_HERR;
    const botonCopiar = (p: Page) => (proceso ? p.getByRole("button", { name: /^Copiar prompt del paso 2/ }) : p.getByRole("button", { name: "Copiar prompt" }));
    const campos = h.campos.filter((c) => c.ejemplo !== "").length + (h.calculadora?.entradas.filter((e) => String(e.ejemplo) !== "").length ?? 0);
    const btnEjemplo = page.getByRole("button", { name: "Probar con un ejemplo" });
    const btnCero = page.getByRole("button", { name: "Empezar de cero" });
    await btnCero.click();
    const vacio = await promptTexto(page, panel);
    const requeridos = h.campos.filter((c) => c.requerido);
    rec(pag, v.nombre, "«Empezar de cero»: formulario vacío y el prompt marca [FALTA]", requeridos.length === 0 || /\[FALTA\]/.test(vacio), `${requeridos.length} obligatorios`);
    await btnEjemplo.click();
    await page.waitForTimeout(250);
    const rellenos = await page.locator("section[aria-labelledby='herramienta-titulo'] input:not([type=checkbox]), section[aria-labelledby='herramienta-titulo'] textarea, section[aria-labelledby='herramienta-titulo'] select").evaluateAll((els) => els.filter((e) => (e as HTMLInputElement).value !== "").length);
    // Cada grupo de casillas con alguna marcada cuenta como un control lleno.
    const gruposMarcados = await page.locator(`${SEL_HERR} fieldset:has(input:checked)`).count();
    rec(pag, v.nombre, "«Probar con un ejemplo» llena el formulario", rellenos + gruposMarcados >= campos, `${rellenos + gruposMarcados} controles con valor, ${campos} esperados`);
    let bien = 0;
    for (const c of h.campos) {
      if (c.tipo === "casillas") {
        // Las casillas: las marcadas (en el orden de las opciones) deben ser exactamente las del ejemplo.
        const marcadas = await page.locator(`${SEL_HERR} fieldset`, { hasText: c.label }).first().locator("label:has(input:checked)").allInnerTexts();
        if (marcadas.map((t) => t.trim()).join("; ") === c.ejemplo) bien++;
        continue;
      }
      const id = await idDeEtiqueta(page, c.label);
      if (id && (await control(page, id).inputValue()) === c.ejemplo) bien++;
    }
    rec(pag, v.nombre, "cada campo recibe su valor de ejemplo", bien === h.campos.length, `${bien} de ${h.campos.length}`);

    // prompt
    const textoPrompt = await promptTexto(page, panel);
    const datos = textoPrompt.slice(textoPrompt.indexOf("DATOS DE ESTA TAREA"));
    rec(pag, v.nombre, "prompt del ejemplo sin {{ }}, undefined, null ni NaN", !PROHIBIDO.test(textoPrompt), (PROHIBIDO.exec(textoPrompt) ?? [""])[0]);
    rec(pag, v.nombre, "prompt del ejemplo sin [FALTA] en los datos", !/: \[FALTA\]/.test(datos), `${(datos.match(/: \[FALTA\]/g) ?? []).length} [FALTA]`);
    await page.locator(`${panel} details summary`, { hasText: "Ver el prompt completo" }).first().click();
    const pre = page.locator(`${panel} pre`).first();
    rec(pag, v.nombre, "«Ver el prompt completo» muestra el prompt", (await pre.isVisible()) && (await pre.evaluate((e) => (e.textContent ?? "").length)) > 500, "");

    // copiar con permisos
    await botonCopiar(page).click();
    await page.getByText("Copiado ✓").first().waitFor({ timeout: 4000 }).catch(() => {});
    const copiado = await page.evaluate(() => navigator.clipboard.readText()).catch(() => "");
    const igual = (t: string) => t.split("\r\n").join("\n"); // Windows guarda los saltos de línea como \r\n
    rec(pag, v.nombre, "«Copiar prompt» (portapapeles permitido): «Copiado ✓» y el portapapeles = el prompt", igual(copiado) === textoPrompt.trim() || igual(copiado) === textoPrompt, `${copiado.length} caracteres copiados`);
    rec(pag, v.nombre, "el prompt copiado sin {{ }}, undefined, null ni NaN", copiado.length > 0 && !PROHIBIDO.test(copiado), (PROHIBIDO.exec(copiado) ?? [""])[0]);
    await captura(page, v.nombre, h.meta.slug);
    if (proceso) {
      await pruebasProceso(page, h, v);
      await kitConAlmacenBloqueado(browser, h, v);
    }

    // calculadoras
    if (h.calculadora) await calculadoras(page, h, v);
    if (h.preproceso) await preprocesos(page, h, v);

    rec(pag, v.nombre, "0 errores en consola", errores.length === 0, errores.slice(0, 3).join(" | "));
  } catch (e) {
    rec(pag, v.nombre, "recorrido completo", false, String((e as Error).message).slice(0, 200));
  } finally {
    await ctx.close();
  }

  // portapapeles con la API bloqueada (método antiguo) y con todo bloqueado (texto a mano)
  for (const modo of ["api", "todo"] as const) {
    const c2 = await contexto(browser, v, { copiaBloqueada: modo });
    const p2 = await c2.newPage();
    const e2 = vigilar(p2);
    try {
      await abrir(p2, ruta);
      await p2.getByRole("button", { name: "Probar con un ejemplo" }).click();
      await (proceso ? p2.getByRole("button", { name: /^Copiar prompt del paso 2/ }) : p2.getByRole("button", { name: "Copiar prompt" })).click();
      if (modo === "api") {
        const copiado = await p2.getByText("Copiado ✓").first().waitFor({ timeout: 3000 }).then(() => true).catch(() => false);
        // Con execCommand disponible, la alternativa debe funcionar; si el navegador la rechaza, debe caer al texto manual.
        const manual = await p2.getByLabel("Texto para copiar a mano").isVisible().catch(() => false);
        rec(pag, v.nombre, "portapapeles API bloqueado: alternativa (execCommand) o texto a mano", copiado || manual, copiado ? "copiado con execCommand" : "texto a mano");
      } else {
        await p2.getByLabel("Texto para copiar a mano").waitFor({ timeout: 4000 });
        const t = await p2.getByLabel("Texto para copiar a mano").inputValue();
        const pr = await promptTexto(p2, proceso ? SEL_PROCESO : SEL_HERR);
        rec(pag, v.nombre, "portapapeles totalmente bloqueado: aparece el texto para copiar a mano con el prompt completo", t === pr && !PROHIBIDO.test(t), `${t.length} caracteres`);
        if (h.meta.slug === "crear-afiches-con-ia") await captura(p2, v.nombre, `${h.meta.slug}-copia-a-mano`, proceso ? `${SEL_PROCESO} [data-paso='2']` : SEL_HERR);
      }
      rec(pag, v.nombre, `0 errores de consola con el portapapeles ${modo === "api" ? "sin API" : "bloqueado"}`, e2.filter((x) => !/bloqueado por la prueba/.test(x)).length === 0, e2.slice(0, 2).join(" | "));
    } catch (e) {
      rec(pag, v.nombre, `portapapeles ${modo}`, false, String((e as Error).message).slice(0, 160));
    } finally {
      await c2.close();
    }
  }
}

/** Cadena `aria-label` → texto del prompt que muestra el mismo paso (el `pre` del bloque de ese botón). */
async function promptsDelProceso(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("button[aria-label^='Copiar prompt del paso']")).map((b) => {
      const bloque = b.closest("div.mt-4") as HTMLElement | null;
      return { nombre: b.getAttribute("aria-label") ?? "", texto: bloque?.querySelector("pre")?.textContent ?? "" };
    })
  );
}

/**
 * Recorrido de una página de PROCESO: bloques y pasos, opciones que siguen a los datos (dónde harás el afiche, foto real,
 * formatos), cada botón Copiar copia su prompt sin llaves, el kit final (marcar, recordar y con el almacenamiento bloqueado).
 */
async function pruebasProceso(page: Page, h: HerramientaCargada, v: (typeof VIEWPORTS)[number]) {
  const pag = rutaHerramienta(h.meta);
  const pasos = pasosDelProceso(h)!;
  const ejemplo = Object.fromEntries(h.campos.map((c) => [c.id, c.ejemplo]));
  try {
    await abrir(page, pag);
    await page.getByRole("button", { name: "Probar con un ejemplo" }).click();
    await page.waitForTimeout(250);

    // estructura
    const bloques = await page.evaluate(() => Array.from(document.querySelectorAll("main section[aria-labelledby$='-titulo']")).map((s) => s.getAttribute("aria-labelledby")!.replace(/-titulo$/, "")).filter((id) => id !== "conteo-palabras"));
    const esperados = ["resultado", "problema", "necesitas", "herramienta", "proceso", "kit", "ejemplo", "revision", "por-que-funciona", "rubros", "errores", "faq"];
    rec(pag, v.nombre, "proceso: los bloques salen en el orden de la plantilla", esperados.every((id, i) => bloques[i] === id), bloques.join(" › "));
    const etiquetas = await page.locator("article header ul[aria-label='Datos de la herramienta'] li").allInnerTexts();
    rec(pag, v.nombre, "proceso: etiquetas «15 min · Gratis · ChatGPT, Gemini o Claude + Canva»", etiquetas.map((t) => t.trim()).join(" | ") === `${h.meta.tiempo} | Gratis | ChatGPT, Gemini o Claude + ${h.meta.herramientasExtra}`, etiquetas.join(" | "));
    const numeros = await page.locator("[data-paso] > p").first().innerText();
    const pasosVisibles = await page.locator("[data-paso]").count();
    rec(pag, v.nombre, `proceso: ${pasos.length} pasos numerados («Paso 1 de ${pasos.length}») con su tiempo`, pasosVisibles === pasos.length && numeros.replace(/\s+/g, " ").toLowerCase().includes(`paso 1 de ${pasos.length}`), numeros);
    const pendientes = await page.locator("[data-capturas-pendientes], .border-dashed").count();
    rec(pag, v.nombre, "proceso: ningún recuadro de captura pendiente en producción", pendientes === 0, String(pendientes));

    // opciones del paso 3 según «¿Dónde harás el afiche?»
    const orden = async () => page.locator("[data-paso='3'] [data-opcion]").evaluateAll((els) => els.map((e) => e.getAttribute("data-opcion")));
    rec(pag, v.nombre, "paso 3: con «Canva» va primero Canva", JSON.stringify(await orden()) === JSON.stringify(["canva", "ia-imagen"]), JSON.stringify(await orden()));
    await llenar(page, "¿Dónde harás el afiche?", "IA de imagen");
    rec(pag, v.nombre, "paso 3: con «IA de imagen» va primero la IA de imagen", JSON.stringify(await orden()) === JSON.stringify(["ia-imagen", "canva"]), JSON.stringify(await orden()));
    await llenar(page, "¿Dónde harás el afiche?", "Aún no sé");
    const recomendada = await page.locator("[data-paso='3'] [data-opcion='canva']").innerText();
    rec(pag, v.nombre, "paso 3: con «Aún no sé» va primero Canva y se recomienda como la más segura", JSON.stringify(await orden()) === JSON.stringify(["canva", "ia-imagen"]) && /más segura/.test(recomendada), recomendada.slice(0, 80));
    await llenar(page, "¿Dónde harás el afiche?", "Canva");

    // foto real
    const promptImagen = async () => page.locator("[data-paso='3'] [data-opcion='ia-imagen'] pre").evaluate((e) => e.textContent ?? "");
    const conNo = await promptImagen();
    await llenar(page, "¿Tienes una foto real de tu producto?", "Sí");
    const conSi = await promptImagen();
    rec(pag, v.nombre, "foto real: «Sí» → «usa la foto que adjunto, sin alterar el producto»; «No» → imagen de apoyo generada", /Usa la foto que adjunto como imagen principal, sin alterar el producto/.test(conSi) && /Imagen de apoyo: /.test(conNo) && !/Imagen de apoyo/.test(conSi), "");
    const avisoIA = await page.locator("[data-paso='3']").innerText();
    rec(pag, v.nombre, "foto real «Sí»: desaparece el aviso de imagen generada con IA", !/indica que es una imagen generada con IA/.test(avisoIA), "");
    await llenar(page, "¿Tienes una foto real de tu producto?", "No");
    rec(pag, v.nombre, "foto real «No»: el paso 3 avisa que se indique que es generada con IA", /indica que es una imagen generada con IA/.test(await page.locator("[data-paso='3']").innerText()), "");

    // formatos del paso 5
    const salidas = async () => page.locator("[data-paso='5'] [data-opcion]").evaluateAll((els) => els.map((e) => e.getAttribute("data-opcion")));
    rec(pag, v.nombre, "paso 5: con A4 + 9:16 solo salen imprimir, mockup, 9:16 y el mensaje", JSON.stringify(await salidas()) === JSON.stringify(["imprimir", "mockup", "vertical", "mensaje"]), JSON.stringify(await salidas()));
    const grupo = page.locator(`${SEL_HERR} fieldset`, { hasText: "¿Qué formatos necesitas?" });
    await grupo.getByLabel("A4 impreso").uncheck();
    await grupo.getByLabel("Estado de WhatsApp o historia (9:16)").uncheck();
    rec(pag, v.nombre, "paso 5: sin formatos marcados no hay salidas y se pide marcar uno", (await salidas()).length === 0 && /Marca al menos un formato/.test(await page.locator("[data-paso='5']").innerText()), "");
    await grupo.getByLabel("Post cuadrado (1:1)").check();
    rec(pag, v.nombre, "paso 5: con 1:1 salen la versión cuadrada y el mensaje", JSON.stringify(await salidas()) === JSON.stringify(["cuadrado", "mensaje"]), JSON.stringify(await salidas()));
    await grupo.getByLabel("Post cuadrado (1:1)").uncheck();
    await grupo.getByLabel("A4 impreso").check();
    await grupo.getByLabel("Estado de WhatsApp o historia (9:16)").check();
    // el estado de «Probar con un ejemplo» vuelve tal cual
    rec(pag, v.nombre, "formatos: el ejemplo vuelve a A4 + 9:16", JSON.stringify(await salidas()) === JSON.stringify(["imprimir", "mockup", "vertical", "mensaje"]), "");

    // cada botón Copiar copia su prompt, sin llaves
    const lista = await promptsDelProceso(page);
    let bienCopiados = 0;
    const problemas: string[] = [];
    for (const p of lista) {
      await page.getByRole("button", { name: p.nombre, exact: true }).click();
      const copiado = (await page.evaluate(() => navigator.clipboard.readText()).catch(() => "")).split("\r\n").join("\n");
      if (copiado === p.texto && copiado.length > 20 && !PROHIBIDO.test(copiado)) bienCopiados++;
      else problemas.push(`${p.nombre}: ${copiado.length} car.`);
    }
    rec(pag, v.nombre, `cada botón Copiar (${lista.length}) copia exactamente su prompt, sin {{ }}, undefined, null ni NaN`, lista.length >= 5 && bienCopiados === lista.length, problemas.join(" | ") || `${lista.length} prompts`);
    const nombresUnicos = new Set(lista.map((p) => p.nombre)).size === lista.length;
    rec(pag, v.nombre, "los botones Copiar tienen nombres accesibles distintos", nombresUnicos, lista.map((p) => p.nombre).join(" | "));
    // El prompt del paso 3B es el pedido, con el texto de los cuatro niveles y los colores.
    const b = lista.find((p) => /paso 3: B\)/.test(p.nombre));
    const opcionB = pasos.find((p) => p.numero === 3)!.opciones!.find((o) => o.id === "ia-imagen")!;
    const esperado = renderPlantilla(opcionB.prompt!, { campos: h.campos, valores: ejemplo, perfil: {}, variables: { n1: "Combo de fin de semana: 6 panes y 1 pan dulce por $6", n2: "Sábado y domingo, de 7:00 a 13:00", n3: "Entrar a comprar el combo · Panadería La Espiga, Av. Ejemplo 123", n4: "Hasta agotar existencias. Máximo 2 combos por persona." } });
    rec(pag, v.nombre, "paso 3B: el prompt de la IA de imagen lleva los cuatro niveles exactos", Boolean(b) && b!.texto === esperado, (b?.texto ?? "sin prompt").slice(0, 100));

    // lista de comprobación del paso 4
    const revision = await page.locator("[data-paso='4']").innerText();
    rec(pag, v.nombre, "paso 4: la lista trae el precio, los días, el lugar y las condiciones tal como los escribiste", ["$6", "Sábado y domingo, de 7:00 a 13:00", "Panadería La Espiga, Av. Ejemplo 123", "Hasta agotar existencias."].every((t) => revision.includes(t)), "");
    const siFalla = page.locator("[data-paso='2'] details", { hasText: "Si algo falla" });
    await siFalla.locator("summary").click();
    rec(pag, v.nombre, "«Si algo falla» es plegable y se abre", await siFalla.locator("li").first().isVisible(), "");

    // kit final: marcar y recordar
    const kit = page.locator("section[aria-labelledby='kit-titulo']");
    await kit.getByLabel(/Texto verificado/).check();
    rec(pag, v.nombre, "kit final: marcar un ítem actualiza «N de M listos»", /1 de \d+ listos/.test(await kit.innerText()), (await kit.innerText()).slice(-60));
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Probar con un ejemplo" }).click();
    rec(pag, v.nombre, "kit final: lo marcado se recuerda al recargar (solo en este navegador)", await page.locator("section[aria-labelledby='kit-titulo']").getByLabel(/Texto verificado/).isChecked(), "");
    await page.evaluate(() => localStorage.removeItem("guiapromptsia:kit:marketing/crear-afiches-con-ia:v1"));
    if (v.nombre === "1280") await captura(page, v.nombre, `${h.meta.slug}-proceso`, SEL_PROCESO);
    else await captura(page, v.nombre, `${h.meta.slug}-proceso`, SEL_PROCESO);
    // página completa (para revisar el diseño de todos los bloques)
    const dir = path.join(salida, v.nombre);
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, `${h.meta.slug}-pagina-completa.jpg`), type: "jpeg", quality: 45, fullPage: true });
  } catch (e) {
    rec(pag, v.nombre, "recorrido del proceso", false, String((e as Error).message).slice(0, 200));
  }
}

/** Kit final con el almacenamiento bloqueado: marcar sigue funcionando (en memoria) y no hay errores de consola. */
async function kitConAlmacenBloqueado(browser: Browser, h: HerramientaCargada, v: (typeof VIEWPORTS)[number]) {
  const pag = rutaHerramienta(h.meta);
  const ctx = await contexto(browser, v, { almacenBloqueado: true });
  const page = await ctx.newPage();
  const errores = vigilar(page);
  try {
    await abrir(page, pag);
    const kit = page.locator("section[aria-labelledby='kit-titulo']");
    await kit.getByLabel(/Texto verificado/).check();
    rec(pag, v.nombre, "kit final con localStorage bloqueado: se puede marcar y no hay errores", (await kit.getByLabel(/Texto verificado/).isChecked()) && errores.length === 0, errores.slice(0, 2).join(" | "));
  } catch (e) {
    rec(pag, v.nombre, "kit final con localStorage bloqueado", false, String((e as Error).message).slice(0, 160));
  } finally {
    await ctx.close();
  }
}

async function calculadoras(page: Page, h: HerramientaCargada, v: (typeof VIEWPORTS)[number]) {
  const calc = h.calculadora!;
  const pag = rutaHerramienta(h.meta);
  for (const caso of calc.casosDePrueba) {
    try {
      await page.getByRole("button", { name: "Empezar de cero" }).click();
      for (const e of calc.entradas) {
        if (caso.entradas[e.id] === undefined) continue;
        const suf = e.unidad === "moneda" ? "\\$" : e.unidad === "porcentaje" ? "%" : "";
        const id = await page.evaluate(
          ([texto, sufijo]) => {
            const re = new RegExp(`^${texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( \\(${sufijo || ".{1,6}"}\\))?( ?\\(obligatorio\\))?$`);
            const l = [...document.querySelectorAll("section[aria-labelledby='herramienta-titulo'] label")].find((x) => re.test((x.textContent ?? "").trim()));
            return (l as HTMLLabelElement | undefined)?.htmlFor ?? null;
          },
          [e.label, suf] as [string, string]
        );
        if (!id) throw new Error(`no encuentro la entrada «${e.label}»`);
        await control(page, id).fill(String(caso.entradas[e.id]));
      }
      await page.waitForTimeout(150);
      const nodo = calcular(calc, caso.entradas);
      const fallos: string[] = [];
      let comparados = 0;
      for (const [salidaId, esperado] of Object.entries(caso.esperado)) {
        const s = calc.salidas.find((x) => x.id === salidaId)!;
        const obtenido = ((await page.locator("section[aria-labelledby='herramienta-titulo'] dl dt", { hasText: new RegExp(`^${esc(s.etiqueta)}$`) }).first().locator("xpath=following-sibling::dd[1]").innerText()) ?? "").replace(/\s+/g, " ").replace(/ sin calcular$/, "").trim();
        const esperadoTexto = typeof esperado === "number" ? formatear(esperado, s.formato, s.decimales) : String(esperado);
        const textoNodo = nodo.resultados.find((r) => r.id === salidaId)?.texto ?? "";
        comparados++;
        if (obtenido !== esperadoTexto && !(typeof esperado === "number" && obtenido === textoNodo && Math.abs((nodo.resultados.find((r) => r.id === salidaId)?.valor ?? NaN) - esperado) <= (caso.tolerancia ?? 0.01))) fallos.push(`${s.etiqueta}: esperado ${esperadoTexto} · obtenido ${obtenido}`);
      }
      rec(pag, v.nombre, `calculadora · ${caso.nombre}`, fallos.length === 0 && comparados > 0, fallos.length ? fallos.join(" | ") : `${comparados} resultados coinciden`);
    } catch (e) {
      rec(pag, v.nombre, `calculadora · ${caso.nombre}`, false, String((e as Error).message).slice(0, 160));
    }
  }
}

async function preprocesos(page: Page, h: HerramientaCargada, v: (typeof VIEWPORTS)[number]) {
  const pre = h.preproceso!;
  const pag = rutaHerramienta(h.meta);
  for (const caso of pre.casosDePrueba) {
    try {
      await page.getByRole("button", { name: "Empezar de cero" }).click();
      for (const [campoId, valor] of Object.entries(caso.valores)) {
        const campo = h.campos.find((c) => c.id === campoId);
        if (!campo) throw new Error(`campo ${campoId} desconocido`);
        await llenar(page, campo.label, valor);
      }
      await page.waitForTimeout(200);
      const nodo = ejecutarPreproceso(pre, caso.valores);
      if (pre.tipo === "conteo-palabras") {
        // Conteo de palabras: «Tus datos suman X palabras (máximo N).», aviso solo si se pasa (no bloquea) y el prompt con el total.
        const total = nodo.resultados.find((r) => r.id === "total")!.valor!;
        const max = pre.palabras!.maximo;
        const linea = ((await page.locator("[data-conteo-palabras]").innerText()) ?? "").replace(/\s+/g, " ").trim();
        const hayAviso = (await page.locator("[data-aviso-palabras]").count()) > 0;
        const enPrompt = await page.evaluate(() => Array.from(document.querySelectorAll("pre")).map((p) => p.textContent ?? "").find((t) => t.includes("TAREA")) ?? "");
        const okLinea = linea === `Tus datos suman ${total} ${total === 1 ? "palabra" : "palabras"} (máximo ${max}).`;
        const okAviso = hayAviso === total > max;
        const okPrompt = enPrompt.includes(`La página contó ${total} palabras en tus datos. No vuelvas a contarlas.`);
        rec(pag, v.nombre, `conteo de palabras · ${caso.nombre}`, okLinea && okAviso && okPrompt, okLinea && okAviso && okPrompt ? `«${linea}»${hayAviso ? " + aviso (no bloquea)" : ""}; el prompt trae el total` : `línea: «${linea}», aviso: ${hayAviso}, prompt con total: ${okPrompt}`);
        continue;
      }
      const esperados = nodo.resultados.map((r) => `${r.etiqueta}: ${r.texto ?? "—"}`);
      const dom = await page.locator("section[aria-labelledby='resultados-previo'] dl > div").evaluateAll((els) => els.map((e) => `${e.querySelector("dt")?.textContent?.trim()}: ${e.querySelector("dd")?.textContent?.trim()}`));
      if (!nodo.completo) {
        const avisos = await page.locator("section[aria-labelledby='resultados-previo'] ul li").allInnerTexts();
        const ok = nodo.errores.length > 0 && nodo.errores.every((e) => avisos.includes(e)) && dom.length === 0;
        rec(pag, v.nombre, `conteo de la página · ${caso.nombre}`, ok, ok ? "con datos que no se entienden, la página muestra el aviso y no ofrece conteos (ni los envía al prompt)" : `avisos en pantalla: ${avisos.join(" | ")}`);
        continue;
      }
      const faltan = esperados.filter((x) => !dom.includes(x));
      rec(pag, v.nombre, `conteo de la página · ${caso.nombre}`, nodo.completo && faltan.length === 0 && dom.length > 0, faltan.length ? `faltan en pantalla: ${faltan.slice(0, 3).join(" | ")}` : `${dom.length} conteos coinciden con la lógica probada`);
    } catch (e) {
      rec(pag, v.nombre, `conteo de la página · ${caso.nombre}`, false, String((e as Error).message).slice(0, 160));
    }
  }
}

/* ───────────── perfil ───────────── */

async function pruebasPerfil(browser: Browser, todas: HerramientaCargada[], v: (typeof VIEWPORTS)[number]) {
  const conNombre = todas.filter((h) => h.usaPerfil.includes("nombre"));
  const [a, b] = conNombre;
  const nombreQa = "Negocio de Prueba QA";
  const pag = `perfil (${rutaHerramienta(a.meta)} → ${rutaHerramienta(b.meta)})`;

  // guardar, autocompletar en otra herramienta, borrar
  const ctx = await contexto(browser, v, { portapapeles: true });
  const page = await ctx.newPage();
  const errores = vigilar(page);
  try {
    await abrir(page, rutaHerramienta(a.meta));
    await page.locator("section[aria-labelledby='herramienta-titulo'] details", { hasText: "Mi negocio" }).first().locator("summary").click();
    const panel = page.locator("section[aria-labelledby='herramienta-titulo'] details", { hasText: "Mi negocio" }).first();
    await panel.getByLabel("Nombre del negocio").fill(nombreQa);
    if (a.usaPerfil.includes("moneda")) await panel.getByLabel("Moneda").fill("S/");
    await panel.getByRole("button", { name: "Guardar mis datos" }).click();
    rec(pag, v.nombre, "perfil: guardar muestra «Guardado en este navegador ✓»", await page.getByText("Guardado en este navegador ✓").first().isVisible(), "");
    const guardado = await page.evaluate(() => localStorage.getItem("guiapromptsia:mi-negocio:v1"));
    rec(pag, v.nombre, "perfil: queda en localStorage (solo en el navegador)", Boolean(guardado && guardado.includes(nombreQa)), guardado ? "" : "vacío");
    rec(pag, v.nombre, "perfil: aparece el texto «Tus datos se guardan solo en este navegador»", await page.getByText(TEXTO_PRIVACIDAD).first().isVisible(), "");
    await page.getByRole("button", { name: "Probar con un ejemplo" }).click();
    rec(pag, v.nombre, "perfil: el nombre viaja en el prompt de la misma herramienta", (await promptTexto(page)).includes(`Nombre del negocio: ${nombreQa}`), "");

    await abrir(page, rutaHerramienta(b.meta));
    await page.locator("section[aria-labelledby='herramienta-titulo'] details", { hasText: "Mi negocio" }).first().locator("summary").click();
    const valor = await page.locator("section[aria-labelledby='herramienta-titulo'] details", { hasText: "Mi negocio" }).first().getByLabel("Nombre del negocio").inputValue();
    rec(pag, v.nombre, "perfil: se autocompleta en otra herramienta", valor === nombreQa, `valor: «${valor}»`);
    await page.getByRole("button", { name: "Probar con un ejemplo" }).click();
    rec(pag, v.nombre, "perfil: el prompt de la otra herramienta lleva el nombre guardado", (await promptTexto(page)).includes(`Nombre del negocio: ${nombreQa}`), "");

    await page.locator("section[aria-labelledby='herramienta-titulo'] details", { hasText: "Mi negocio" }).first().getByRole("button", { name: "Borrar mis datos" }).click();
    const tras = await page.evaluate(() => localStorage.getItem("guiapromptsia:mi-negocio:v1"));
    const vacio = await page.locator("section[aria-labelledby='herramienta-titulo'] details", { hasText: "Mi negocio" }).first().getByLabel("Nombre del negocio").inputValue();
    rec(pag, v.nombre, "perfil: «Borrar mis datos» vacía el formulario y el almacenamiento", vacio === "" && (tras === null || !tras.includes(nombreQa)), `almacenamiento: ${tras}`);
    rec(pag, v.nombre, "perfil: 0 errores en consola", errores.length === 0, errores.slice(0, 2).join(" | "));
  } catch (e) {
    rec(pag, v.nombre, "perfil: recorrido", false, String((e as Error).message).slice(0, 200));
  } finally {
    await ctx.close();
  }

  // localStorage bloqueado
  const bloq = await contexto(browser, v, { almacenBloqueado: true, portapapeles: true });
  const p2 = await bloq.newPage();
  const e2 = vigilar(p2);
  try {
    await abrir(p2, rutaHerramienta(a.meta));
    await p2.getByRole("button", { name: "Probar con un ejemplo" }).click();
    await p2.locator("section[aria-labelledby='herramienta-titulo'] details", { hasText: "Mi negocio" }).first().locator("summary").click();
    const panel = p2.locator("section[aria-labelledby='herramienta-titulo'] details", { hasText: "Mi negocio" }).first();
    await panel.getByLabel("Nombre del negocio").fill(nombreQa);
    await panel.getByRole("button", { name: "Guardar mis datos" }).click();
    rec(pag, v.nombre, "localStorage bloqueado: guardar no rompe y avisa", await p2.getByText("Guardado en este navegador ✓").first().isVisible(), "");
    rec(pag, v.nombre, "localStorage bloqueado: el perfil vive en memoria y llega al prompt", (await promptTexto(p2)).includes(`Nombre del negocio: ${nombreQa}`), "");
    await p2.getByRole("button", { name: "Copiar prompt" }).click();
    rec(pag, v.nombre, "localStorage bloqueado: «Copiar prompt» funciona", await p2.getByText("Copiado ✓").first().waitFor({ timeout: 3000 }).then(() => true).catch(() => false), "");
    rec(pag, v.nombre, "localStorage bloqueado: 0 errores en consola", e2.length === 0, e2.slice(0, 2).join(" | "));
    await captura(p2, v.nombre, "perfil-localstorage-bloqueado", "section[aria-labelledby='herramienta-titulo']");
  } catch (e) {
    rec(pag, v.nombre, "localStorage bloqueado", false, String((e as Error).message).slice(0, 200));
  } finally {
    await bloq.close();
  }
}

async function pruebasMiNegocio(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const pag = "/mi-negocio";
  const ctx = await contexto(browser, v);
  const page = await ctx.newPage();
  const errores = vigilar(page);
  try {
    await abrir(page, pag);
    const d = await sinDesbordeHorizontal(page);
    rec(pag, v.nombre, "sin scroll horizontal", d.ancho <= d.ventana, `${d.ancho}/${d.ventana}`);
    const chicos = await objetivosPequenos(page);
    rec(pag, v.nombre, "botones y controles ≥ 44 px", chicos.length === 0, chicos.join(" | "));
    const foco = await focoVisible(page, 30);
    rec(pag, v.nombre, "foco visible con Tab", foco.malos.length === 0 && foco.vistos > 0, `${foco.vistos} controles; sin contorno: ${foco.malos.join(", ") || "ninguno"}`);
    await page.getByLabel("Nombre del negocio").fill("Negocio de Prueba QA");
    await page.getByLabel("Rubro").fill("Panadería");
    await page.getByLabel("Moneda").fill("S/");
    await page.getByRole("button", { name: "Guardar mis datos" }).click();
    rec(pag, v.nombre, "guardar el perfil completo", await page.getByText("Guardado en este navegador ✓").first().isVisible(), "");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => Object.keys(b).some((k) => k.startsWith("__react"))));
    rec(pag, v.nombre, "el perfil persiste al recargar", (await page.getByLabel("Nombre del negocio").inputValue()) === "Negocio de Prueba QA" && (await page.getByLabel("Moneda").inputValue()) === "S/", "");
    await captura(page, v.nombre, "mi-negocio", "main");
    await page.getByRole("button", { name: "Borrar mis datos" }).click();
    rec(pag, v.nombre, "borrar el perfil", (await page.getByLabel("Nombre del negocio").inputValue()) === "" && (await page.evaluate(() => localStorage.getItem("guiapromptsia:mi-negocio:v1"))) === null, "");
    rec(pag, v.nombre, "0 errores en consola", errores.length === 0, errores.slice(0, 2).join(" | "));
  } catch (e) {
    rec(pag, v.nombre, "recorrido completo", false, String((e as Error).message).slice(0, 200));
  } finally {
    await ctx.close();
  }
}

async function pruebasPortada(browser: Browser, v: (typeof VIEWPORTS)[number]) {
  const ctx = await contexto(browser, v);
  const page = await ctx.newPage();
  const errores = vigilar(page);
  try {
    await abrir(page, "/");
    const d = await sinDesbordeHorizontal(page);
    rec("/", v.nombre, "sin scroll horizontal", d.ancho <= d.ventana, `${d.ancho}/${d.ventana}`);
    const chicos = await objetivosPequenos(page);
    rec("/", v.nombre, "botones y controles ≥ 44 px", chicos.length === 0, chicos.join(" | "));
    const foco = await focoVisible(page, 25);
    rec("/", v.nombre, "foco visible con Tab", foco.malos.length === 0 && foco.vistos > 0, `${foco.vistos} controles; sin contorno: ${foco.malos.join(", ") || "ninguno"}`);
    const h1 = await page.locator("h1").allInnerTexts();
    rec("/", v.nombre, "mensaje directo en el H1 y sin «min de lectura»", h1.length === 1 && /Elige la tarea/.test(h1[0]) && !/min de lectura/.test(await page.content()), h1.join(" | "));
    await captura(page, v.nombre, "portada", "h1");
    await page.getByRole("link", { name: /Ver las herramientas/ }).first().click();
    await page.waitForURL("**/herramientas");
    const resp = { status: () => (page.url().endsWith("/herramientas") ? 200 : 0) };
    rec("/", v.nombre, "«Ver las herramientas» lleva a /herramientas (200)", resp.status() === 200, "");
    rec("/", v.nombre, "0 errores en consola", errores.length === 0, errores.slice(0, 2).join(" | "));
  } catch (e) {
    rec("/", v.nombre, "recorrido completo", false, String((e as Error).message).slice(0, 200));
  } finally {
    await ctx.close();
  }
}

async function main() {
  fs.rmSync(salida, { recursive: true, force: true });
  fs.mkdirSync(salida, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const todas = (await listarTodas()).filter((h) => !h.interna);
  if (solo && !todas.some((h) => rutaHerramienta(h.meta) === solo)) throw new Error(`No existe la herramienta ${solo}`);
  for (const v of VIEWPORTS) {
    console.log(`— ${v.nombre} px —`);
    if (!solo) {
      await pruebasPortada(browser, v);
      await pruebasMiNegocio(browser, v);
      await pruebasPerfil(browser, todas, v);
    }
    for (const h of todas.filter((x) => !solo || rutaHerramienta(x.meta) === solo)) {
      console.log(`  ${rutaHerramienta(h.meta)}`);
      await pruebasHerramienta(browser, h, v);
    }
  }
  await browser.close();

  const total = filas.length;
  const fallos = filas.filter((f) => !f.ok);
  const md = [
    "# Recorrido interactivo (Playwright, build de producción)",
    "",
    `Generado con \`npm run qa\` contra ${base} (Chrome ${process.version.startsWith("v") ? "del sistema" : ""}, 375 px y 1280 px). ${total} pruebas: ${total - fallos.length} OK, ${fallos.length} FALLA.`,
    "",
    "| Página | Vista (px) | Prueba | Resultado | Detalle |",
    "|---|---|---|---|---|",
    ...filas.map((f) => `| ${f.pagina} | ${f.vista} | ${f.prueba} | ${f.ok ? "OK" : "**FALLA**"} | ${f.detalle.replace(/\|/g, "/")} |`),
    "",
  ].join("\n");
  fs.writeFileSync(path.join(salida, "resultados.md"), md);
  console.log(`\n${total} pruebas: ${total - fallos.length} OK, ${fallos.length} FALLA`);
  process.exit(fallos.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
