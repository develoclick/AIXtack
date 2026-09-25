/**
 * Estado de los espacios de imagen de cada herramienta:
 *
 *   npm run capturas
 *
 * Por página, cada espacio de imagen con su archivo esperado, su etiqueta, dónde va y su estado:
 *   · puesta (con su tamaño real en píxeles), falta una obligatoria o falta una opcional;
 *   · avisos: mide menos de 1.200 px de ancho (1.080 si es vertical), o hay más de un archivo con el mismo nombre.
 * Y por página, un resumen con su og:image propia. Añadir una imagen es guardar el archivo con su nombre en public/img/{área}/{slug}/:
 * no hay que tocar los datos. Solo informa: siempre sale con código 0 (el validador bloquea las páginas publicadas a las que
 * les falte una imagen obligatoria).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ANCHO_MINIMO_RECOMENDADO, resolverImagenes } from "../lib/herramientas/imagenes";
import { ubicacionesDe, type Herramienta } from "../lib/herramientas/tipos";

const raiz = process.cwd();
const carpeta = path.join(raiz, "content", "herramientas");
const existe = (src: string) => fs.existsSync(path.join(raiz, "public", src.replace(/^\//, "")));
/** Ancho mínimo recomendado: 1.200 px (1.080 px si la imagen es vertical, como un estado 9:16). */
const minimoDe = (proporcion?: string) => {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(proporcion ?? "");
  return m && Number(m[1]) < Number(m[2]) ? 1080 : ANCHO_MINIMO_RECOMENDADO;
};
const miles = (n: number) => n.toLocaleString("es-ES");

async function main() {
  const resumen: string[] = [];
  const bloques: string[] = [];
  const total = { puestas: 0, faltanObligatorias: 0, faltanOpcionales: 0, avisos: 0 };
  let ogPendientes = 0;

  for (const area of fs.readdirSync(carpeta, { withFileTypes: true })) {
    if (!area.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(carpeta, area.name)).sort()) {
      if (!f.endsWith(".ts") || f.endsWith(".test.ts") || f.startsWith("_")) continue;
      const h = (await import(pathToFileURL(path.join(carpeta, area.name, f)).href)).default as Herramienta;
      const ruta = `/${h.meta.area}/${h.meta.slug}`;
      const filas: string[] = [];
      const c = { puestas: 0, faltanObligatorias: 0, faltanOpcionales: 0, avisos: 0 };
      for (const r of resolverImagenes(h)) {
        const e = r.espacio;
        let estado: string;
        if (r.archivo && !r.archivo.error) {
          c.puestas++;
          const avisos: string[] = [];
          if (r.archivo.ancho < minimoDe(e.proporcion)) avisos.push(`mide ${miles(r.archivo.ancho)} px de ancho (recomendado ≥ ${miles(minimoDe(e.proporcion))})`);
          if (r.archivo.duplicadas.length) avisos.push(`hay también .${r.archivo.duplicadas.join(", .")}: se usa .${r.archivo.extension}`);
          c.avisos += avisos.length;
          estado = `puesta · ${miles(r.archivo.ancho)}×${miles(r.archivo.alto)} px (.${r.archivo.extension})${avisos.length ? ` · ⚠ ${avisos.join("; ")}` : ""}`;
        } else if (r.archivo?.error) {
          c.avisos++;
          estado = `⚠ el archivo .${r.archivo.extension} no se puede leer: ${r.archivo.error}`;
        } else if (e.obligatoria) {
          c.faltanObligatorias++;
          estado = "FALTA (obligatoria)";
        } else {
          c.faltanOpcionales++;
          estado = "falta (opcional)";
        }
        filas.push(`| ${e.id} | \`${e.archivo}\` | ${e.etiqueta} | ${ubicacionesDe(e).join(" + ")} | ${e.obligatoria ? "sí" : "no"} | ${estado} |`);
      }
      const ogPropia = Boolean(h.meta.ogImage && existe(h.meta.ogImage));
      if (!ogPropia) ogPendientes++;
      total.puestas += c.puestas;
      total.faltanObligatorias += c.faltanObligatorias;
      total.faltanOpcionales += c.faltanOpcionales;
      total.avisos += c.avisos;
      resumen.push(`| ${ruta} | ${h.publicado ? "sí" : "no"} | ${c.puestas} de ${h.imagenes.length} | ${c.faltanObligatorias} | ${c.faltanOpcionales} | ${c.avisos || "—"} | ${ogPropia ? "sí" : "pendiente (usa /og-default.webp)"} |`);
      bloques.push(`### ${ruta} (${h.publicado ? "publicada" : "borrador"}) → public/img/${h.meta.area}/${h.meta.slug}/\n`, "| Espacio | Archivo (sin extensión) | Etiqueta | Dónde va | Obligatoria | Estado |", "|---|---|---|---|---|---|", ...(filas.length ? filas : ["| — | — | — | — | — | esta página no lleva imágenes |"]), "");
    }
  }

  console.log("| Página | Publicada | Imágenes puestas | Faltan obligatorias | Faltan opcionales | Avisos | og propia |");
  console.log("|---|---|---|---|---|---|---|");
  console.log(resumen.join("\n"));
  console.log(`\nTotal: ${total.puestas} imágenes puestas, ${total.faltanObligatorias} obligatorias por poner, ${total.faltanOpcionales} opcionales por poner, ${total.avisos} avisos; ${ogPendientes} og propias pendientes (esas páginas usan el respaldo /og-default.webp).`);
  console.log("\n## Espacios de imagen por página\n");
  console.log(bloques.join("\n"));
  console.log("Guarda cada imagen (.webp, .png o .jpg; si hay varias con el mismo nombre gana .webp) en la carpeta de su página con el nombre de la columna «Archivo»: aparece sola, sin tocar los datos. Los recuadros punteados solo se ven en borradores con `next dev` o MOSTRAR_BORRADORES=true.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
