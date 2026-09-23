/**
 * Valida las páginas de content/herramientas/ (npm run herramientas:validar; también en `prebuild`).
 * Comprueba estructura, calculadoras (casos de prueba), relacionadas y, para las `publicado: true`, los
 * estándares de calidad (palabras, prueba real, imágenes, descripciones…). Sale con código 1 si hay errores.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { validarHerramienta } from "../lib/herramientas/validar";
import type { Herramienta } from "../lib/herramientas/tipos";

const raiz = process.cwd();
const carpeta = path.join(raiz, "content", "herramientas");

async function main() {
  const paginas: { archivo: string; datos: Herramienta }[] = [];
  if (fs.existsSync(carpeta)) {
    for (const area of fs.readdirSync(carpeta, { withFileTypes: true })) {
      if (!area.isDirectory()) continue;
      for (const f of fs.readdirSync(path.join(carpeta, area.name))) {
        if (!f.endsWith(".ts") || f.endsWith(".test.ts")) continue;
        const modulo = await import(pathToFileURL(path.join(carpeta, area.name, f)).href);
        paginas.push({ archivo: `${area.name}/${f}`, datos: modulo.default as Herramienta });
      }
    }
  }

  const existentes = new Set(paginas.map((p) => `${p.datos.meta.area}/${p.datos.meta.slug}`));
  const publicadas = new Set(paginas.filter((p) => p.datos.publicado && !p.archivo.includes("/_")).map((p) => `${p.datos.meta.area}/${p.datos.meta.slug}`));
  const existeImagen = (src: string) => src.startsWith("/") && !src.includes("..") && fs.existsSync(path.join(raiz, "public", src));

  let errores = 0;
  let avisos = 0;
  for (const { archivo, datos } of paginas) {
    const r = validarHerramienta(datos, { existeImagen, existentes, publicadas });
    const estado = datos.publicado ? "publicada" : "borrador";
    const nota = archivo.includes("/_") ? ", interna" : "";
    console.log(`${r.errores.length ? "✖" : "✔"} ${archivo} (${estado}${nota}, ${r.palabras} palabras)`);
    for (const e of r.errores) console.log(`   ✖ ${e}`);
    for (const a of r.avisos) console.log(`   ⚠ ${a}`);
    errores += r.errores.length;
    avisos += r.avisos.length;
  }
  console.log(`\n${errores === 0 ? "✔" : "✖"} Herramientas: ${paginas.length} páginas, ${errores} errores, ${avisos} avisos.`);
  if (errores > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
