/** Capturas de pantalla de zonas concretas del generador (solo para revisar el diseño): npx tsx qa/vistas.ts http://localhost:3100 carpeta */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { CV_EJEMPLO_RESPUESTA } from "../content/prompts/cv-ejemplo";

const base = process.argv[2] ?? "http://localhost:3100";
const salida = process.argv[3] ?? ".";
fs.mkdirSync(salida, { recursive: true });

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  for (const [nombre, width, height] of [["1280", 1280, 900], ["375", 375, 800]] as const) {
    const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: "light" });
    const page = await ctx.newPage();
    await page.addInitScript(() => window.localStorage.setItem("aixtack:consent", JSON.stringify({ ads: "denied", analytics: "denied", decided: true })));
    await page.goto(`${base}/carrera-y-empleo/crear-cv-ats-formato-harvard`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(salida, `v-cv-arriba-${nombre}.png`) });
    await page.getByLabel("Nombre completo").fill("Camila Rojas");
    await page.getByLabel("Puesto al que postulas").fill("Analista de marketing digital");
    await page.locator("#herramienta").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.querySelector("#herramienta")!.getBoundingClientRect().top + window.scrollY - 70));
    await page.screenshot({ path: path.join(salida, `v-cv-herramienta-${nombre}.png`) });
    await page.getByRole("textbox", { name: "Respuesta de la IA" }).fill(CV_EJEMPLO_RESPUESTA);
    await page.evaluate(() => window.scrollTo(0, document.querySelector("#word")!.getBoundingClientRect().top + window.scrollY - 70));
    await page.screenshot({ path: path.join(salida, `v-cv-word-${nombre}.png`) });
    await page.evaluate(() => window.scrollTo(0, document.querySelector("#ejemplo")!.getBoundingClientRect().top + window.scrollY - 70));
    await page.screenshot({ path: path.join(salida, `v-cv-ejemplo-${nombre}.png`) });
    await ctx.close();
  }
  await browser.close();
}
main();
