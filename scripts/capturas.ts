/**
 * Estado de las capturas de cada herramienta:
 *
 *   npm run capturas
 *
 * Por página: capturas puestas (archivo existente), pendientes, si tiene og:image propia (si no, usa el respaldo /og-default.webp) y archivos
 * mencionados en los datos que NO existen en public/.
 * Después, la lista de capturas pendientes con el nombre de archivo, el tamaño recomendado y lo que debe mostrar cada una.
 * Solo informa: siempre sale con código 0 (el validador bloquea las páginas publicadas que tengan pendientes).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Herramienta } from "../lib/herramientas/tipos";

const raiz = process.cwd();
const carpeta = path.join(raiz, "content", "herramientas");
const existe = (src: string) => fs.existsSync(path.join(raiz, "public", src.replace(/^\//, "")));
const TAMANO = "≥ 1.200 px de ancho, .webp";

async function main() {
  const filas: string[] = [];
  const detalle: string[] = [];
  let totales = { puestas: 0, pendientes: 0, faltan: 0 };
  let ogPendientes = 0;

  for (const area of fs.readdirSync(carpeta, { withFileTypes: true })) {
    if (!area.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(carpeta, area.name)).sort()) {
      if (!f.endsWith(".ts") || f.endsWith(".test.ts") || f.startsWith("_")) continue;
      const h = (await import(pathToFileURL(path.join(carpeta, area.name, f)).href)).default as Herramienta;
      const ruta = `/${h.meta.area}/${h.meta.slug}`;
      const declaradas = [...h.ejemplo.capturas, ...(h.metodoCompleto?.capturas ?? [])];
      const puestas = declaradas.filter((c) => existe(c.src));
      const reales = puestas.filter((c) => c.etiqueta === "Prueba real").length;
      const mencionados = declaradas.map((c) => c.src);
      const ogPropia = Boolean(h.meta.ogImage && existe(h.meta.ogImage));
      if (!ogPropia) ogPendientes++;
      const faltan = [...new Set(mencionados)].filter((s) => !existe(s));
      const pendientes = h.capturasPendientes ?? [];
      totales = { puestas: totales.puestas + puestas.length, pendientes: totales.pendientes + pendientes.length, faltan: totales.faltan + faltan.length };
      filas.push(`| ${ruta} | ${h.publicado ? "sí" : "no"} | ${puestas.length} de ${declaradas.length} (${reales} «Prueba real») | ${pendientes.length} | ${ogPropia ? "sí" : "pendiente (usa /og-default.webp)"} | ${faltan.length ? faltan.map((s) => s.split("/").pop()).join(", ") : "—"} |`);
      for (const p of pendientes) detalle.push(`| ${ruta} | \`${p.archivo}\` | ${p.etiqueta} | ${TAMANO} | ${p.muestra} |`);
    }
  }

  console.log("| Página | Publicado | Capturas puestas | Pendientes | og propia | Archivos mencionados que no existen |");
  console.log("|---|---|---|---|---|---|");
  console.log(filas.join("\n"));
  console.log(`\nTotal: ${totales.puestas} capturas puestas, ${totales.pendientes} pendientes, ${totales.faltan} archivos mencionados que no existen; ${ogPendientes} og propias pendientes (esas páginas usan el respaldo /og-default.webp).`);
  console.log("\n### Capturas pendientes\n");
  console.log("| Página | Archivo esperado | Etiqueta | Tamaño recomendado | Qué debe mostrar |");
  console.log("|---|---|---|---|---|");
  console.log(detalle.join("\n"));
  console.log("\nCarpeta de cada página: public/img/{área}/{slug}/. Los recuadros grises solo se ven con `next dev` o MOSTRAR_BORRADORES=true.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
