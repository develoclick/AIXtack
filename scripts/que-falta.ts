import fs from "node:fs";
import path from "node:path";
import { listarTodas } from "../lib/herramientas/registro";
import { contarPalabras, textosEditoriales, validarHerramienta } from "../lib/herramientas/validar";
import { tieneOgPropia } from "../lib/herramientas/seo";
import { buscarArchivo, existeUtilizable, resolverImagenes } from "../lib/herramientas/imagenes";

(async () => {
  const todas = (await listarTodas()).filter((h) => !h.interna);
  const existentes = new Set(todas.map((h) => `${h.meta.area}/${h.meta.slug}`));
  const existeImagen = (s: string) => fs.existsSync(path.join(process.cwd(), "public", s));

  // párrafos repetidos entre páginas (textos de 60+ caracteres idénticos en dos páginas distintas)
  const vistos = new Map<string, Set<string>>();
  for (const h of todas)
    for (const t of textosEditoriales(h)) {
      const k = t.replace(/\s+/g, " ").trim();
      if (k.length < 60) continue;
      (vistos.get(k) ?? vistos.set(k, new Set()).get(k)!).add(h.meta.slug);
    }
  const duplicados = [...vistos.entries()].filter(([, s]) => s.size > 1);

  console.log("| Página | Prueba real (puestas / imágenes obligatorias que faltan) | Palabras editoriales (faltan para 1.500) | og propia | probadoEn / probadoFecha | Otros incumplimientos (validador como si estuviera publicada) |");
  console.log("|---|---|---|---|---|---|");
  for (const h of todas) {
    const resueltas = resolverImagenes(h);
    const reales = resueltas.filter((r) => r.espacio.etiqueta === "Prueba real" && existeUtilizable(r)).length;
    const faltan = resueltas.filter((r) => !existeUtilizable(r) && r.espacio.obligatoria).length;
    const pal = contarPalabras(textosEditoriales(h));
    const r = validarHerramienta({ ...h, publicado: true }, { existeImagen, existentes, publicadas: existentes, buscarImagen: (a) => buscarArchivo(h.meta.area, h.meta.slug, a) });
    const otros = r.errores.filter((e) => !/palabras editoriales|apturas?|Prueba real|probadoEn|og:image|ogImage|imagen obligatoria|Imágenes en el ejemplo/.test(e));
    const dup = duplicados.filter(([, s]) => s.has(h.meta.slug)).length;
    console.log(
      `| ${h.meta.area}/${h.meta.slug} | ${reales} / ${faltan} | ${pal} (${pal >= 1500 ? "ok" : `faltan ${1500 - pal}`}) | ${tieneOgPropia(h) ? "sí" : "no"} | ${h.meta.probadoEn && h.meta.probadoFecha ? "sí" : "no"} | ${otros.length ? otros.map((e) => e.replace(/\|/g, "/")).join("; ") : "ninguno"}${dup ? `; ${dup} texto(s) idéntico(s) a otra página` : ""} |`
    );
  }
  console.log(`\nTextos editoriales (≥ 60 caracteres) idénticos en más de una página: ${duplicados.length}`);
  for (const [t, s] of duplicados.slice(0, 5)) console.log(`  · [${[...s].join(", ")}] ${t.slice(0, 100)}…`);
})();
