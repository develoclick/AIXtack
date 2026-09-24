/**
 * Cuenta las palabras EDITORIALES visibles de cada herramienta (sin formulario, sin prompt) y las compara con el
 * rango de los estándares (1.500–2.500). También muestra el recuento más amplio que usa el validador.
 *
 *   npm run contar-palabras
 *
 * Solo informa: no modifica nada y siempre sale con código 0 (el validador es quien bloquea las páginas publicadas).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { contarPalabras, PALABRAS_MAX, PALABRAS_MIN, textosEditoriales, textosVisibles } from "../lib/herramientas/validar";
import type { Herramienta } from "../lib/herramientas/tipos";

const carpeta = path.join(process.cwd(), "content", "herramientas");

async function main() {
  const filas: { ruta: string; publicado: boolean; editorial: number; validador: number }[] = [];
  for (const area of fs.readdirSync(carpeta, { withFileTypes: true })) {
    if (!area.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(carpeta, area.name)).sort()) {
      if (!f.endsWith(".ts") || f.endsWith(".test.ts") || f.startsWith("_")) continue;
      const h = (await import(pathToFileURL(path.join(carpeta, area.name, f)).href)).default as Herramienta;
      filas.push({ ruta: `/${h.meta.area}/${h.meta.slug}`, publicado: h.publicado, editorial: contarPalabras(textosEditoriales(h)), validador: contarPalabras(textosVisibles(h)) });
    }
  }

  const estado = (n: number) => (n < PALABRAS_MIN ? `FALTAN ${PALABRAS_MIN - n}` : n > PALABRAS_MAX ? `SOBRAN ${n - PALABRAS_MAX}` : "dentro");
  console.log(`| Página | Publicado | Palabras editoriales | Rango ${PALABRAS_MIN.toLocaleString("es")}–${PALABRAS_MAX.toLocaleString("es")} | Recuento del validador (con formulario y «mejoras») |`);
  console.log("|---|---|---|---|---|");
  for (const f of filas) console.log(`| ${f.ruta} | ${f.publicado ? "sí" : "no"} | ${f.editorial} | ${estado(f.editorial)} | ${f.validador} (${estado(f.validador)}) |`);
  const fuera = filas.filter((f) => f.editorial < PALABRAS_MIN || f.editorial > PALABRAS_MAX).length;
  console.log(`\n${filas.length} páginas; ${filas.length - fuera} dentro del rango con el recuento editorial, ${fuera} fuera.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
