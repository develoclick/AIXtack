import fs from "node:fs";
import path from "node:path";
import { listarTodas } from "../lib/herramientas/registro";
import { contarPalabras, textosEditoriales, validarHerramienta } from "../lib/herramientas/validar";
import { tieneOgPropia } from "../lib/herramientas/seo";

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

  console.log("| Página | Prueba real (puestas/pendientes) | Palabras editoriales (faltan para 1.500) | og propia | probadoEn / probadoFecha | Otros incumplimientos (validador como si estuviera publicada) |");
  console.log("|---|---|---|---|---|---|");
  for (const h of todas) {
    const reales = [...h.ejemplo.capturas, ...(h.metodoCompleto?.capturas ?? [])].filter((c) => c.etiqueta === "Prueba real" && existeImagen(c.src)).length;
    const pal = contarPalabras(textosEditoriales(h));
    const r = validarHerramienta({ ...h, publicado: true }, { existeImagen, existentes, publicadas: existentes });
    const otros = r.errores.filter((e) => !/palabras editoriales|apturas?|Prueba real|probadoEn|og:image|ogImage/.test(e));
    const dup = duplicados.filter(([, s]) => s.has(h.meta.slug)).length;
    console.log(
      `| ${h.meta.area}/${h.meta.slug} | ${reales} / ${h.capturasPendientes.length} | ${pal} (${pal >= 1500 ? "ok" : `faltan ${1500 - pal}`}) | ${tieneOgPropia(h) ? "sí" : "no"} | ${h.meta.probadoEn && h.meta.probadoFecha ? "sí" : "no"} | ${otros.length ? otros.map((e) => e.replace(/\|/g, "/")).join("; ") : "ninguno"}${dup ? `; ${dup} texto(s) idéntico(s) a otra página` : ""} |`
    );
  }
  console.log(`\nTextos editoriales (≥ 60 caracteres) idénticos en más de una página: ${duplicados.length}`);
  for (const [t, s] of duplicados.slice(0, 5)) console.log(`  · [${[...s].join(", ")}] ${t.slice(0, 100)}…`);
})();
