/**
 * Genera las og:image propias (public/img/{area}/{slug}/og.webp, 1200×630) de las herramientas: gráfico con el H1, el área y la
 * marca sobre el color de marca (sin capturas ni imitaciones de chat). Usa Pillow (scripts/generar-og.py).
 *
 *   npm run og                 (todas)
 *   npm run og -- area/slug    (una)
 */
import { spawnSync } from "node:child_process";
import { getCategory } from "../content/categorias";
import { listarTodas } from "../lib/herramientas/registro";
import { siteName } from "../lib/site";

async function main() {
  const solo = process.argv[2];
  const items = (await listarTodas())
    .filter((h) => !h.interna && (!solo || `${h.meta.area}/${h.meta.slug}` === solo))
    .map((h) => ({ area_id: h.meta.area, slug: h.meta.slug, area: getCategory(h.meta.area)?.name ?? h.meta.area, titulo: h.meta.titulo, sitio: siteName }));
  if (items.length === 0) throw new Error(`No hay herramienta «${solo}».`);
  for (const python of ["python", "python3", "py"]) {
    const r = spawnSync(python, ["scripts/generar-og.py"], { input: JSON.stringify(items), encoding: "utf8" });
    if (r.error) continue;
    process.stdout.write(r.stdout);
    if (r.status !== 0) {
      process.stderr.write(r.stderr);
      process.exit(r.status ?? 1);
    }
    return;
  }
  throw new Error("Hace falta Python con Pillow (pip install pillow).");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
