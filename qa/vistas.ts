/** Capturas de pantalla de zonas concretas (solo para revisar el diseño): npx tsx qa/vistas.ts http://localhost:3100 carpeta */
import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3100";
const salida = process.argv[3] ?? ".";
fs.mkdirSync(salida, { recursive: true });
const CV = "/carrera-y-empleo/crear-cv-ats-formato-harvard";

async function a(page: Page, sel: string, nombre: string) {
  await page.evaluate((s) => window.scrollTo(0, document.querySelector(s)!.getBoundingClientRect().top + window.scrollY - 80), sel);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(salida, `${nombre}.png`) });
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  for (const [tema, ancho, alto] of [["light", 1280, 860], ["dark", 1280, 860], ["light", 375, 800]] as const) {
    const ctx = await browser.newContext({ viewport: { width: ancho, height: alto }, colorScheme: tema });
    const page = await ctx.newPage();
    await page.addInitScript(() => window.localStorage.setItem("aixtack:consent", JSON.stringify({ ads: "denied", analytics: "denied", decided: true })));
    const n = `${tema}-${ancho}`;
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(salida, `home-${n}.png`) });
    await page.goto(base + CV, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(salida, `cv-arriba-${n}.png`) });
    await a(page, "nav[aria-label='Pasos de la herramienta']", `cv-paso1-${n}`);
    await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 1/ }).click();
    await page.waitForTimeout(300);
    await a(page, "nav[aria-label='Pasos de la herramienta']", `cv-paso1-ejemplo-${n}`);
    await page.getByRole("button", { name: /Llenar con datos de ejemplo \(paso 3/ }).click();
    await page.waitForTimeout(300);
    await a(page, "#paso-3", `cv-paso3-${n}`);
    if (ancho === 1280 && tema === "light") {
      await a(page, "#ats", `cv-guia-${n}`);
      await page.goto(base + "/carrera-y-empleo/verbos-de-accion-para-cv", { waitUntil: "networkidle" });
      await page.screenshot({ path: path.join(salida, `articulo-${n}.png`) });
      await page.goto(base + "/carrera-y-empleo", { waitUntil: "networkidle" });
      await page.screenshot({ path: path.join(salida, `categoria-${n}.png`) });
    }
    await ctx.close();
  }
  await browser.close();
}
main();
