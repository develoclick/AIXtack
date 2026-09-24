/**
 * Busca párrafos casi idénticos entre páginas (estándar 18: sin párrafos duplicados entre páginas).
 *
 *   npm run duplicados
 *
 * Compara todos los textos editoriales de 40+ caracteres de cada página con los de las demás usando grupos de 4 palabras
 * (similitud de Jaccard y contención). Sale con código 1 si encuentra alguno por encima del umbral: lo usa el test de contenido.
 */
import { listarTodas } from "../lib/herramientas/registro";
import { textosEditoriales } from "../lib/herramientas/validar";

export interface Duplicado {
  a: string;
  b: string;
  similitud: number;
  textoA: string;
  textoB: string;
}

const normal = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
const grupos = (palabras: string[], n = 4) => {
  const s = new Set<string>();
  for (let i = 0; i + n <= palabras.length; i++) s.add(palabras.slice(i, i + n).join(" "));
  return s;
};

export async function buscarDuplicados(umbral = 0.4): Promise<Duplicado[]> {
  const paginas = (await listarTodas()).filter((h) => !h.interna);
  const items = paginas.flatMap((h) =>
    textosEditoriales(h)
      .map((t) => t.replace(/\s+/g, " ").trim())
      .filter((t) => t.length >= 40)
      .map((t) => ({ pagina: `${h.meta.area}/${h.meta.slug}`, texto: t, g: grupos(normal(t)) }))
  );
  const salida: Duplicado[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i].pagina === items[j].pagina) continue;
      const [x, y] = [items[i].g, items[j].g];
      const minimo = Math.min(x.size, y.size);
      if (minimo < 3) continue;
      let comunes = 0;
      for (const g of x) if (y.has(g)) comunes++;
      const jaccard = comunes / (x.size + y.size - comunes);
      const contencion = comunes / minimo;
      const sim = Math.max(jaccard, contencion >= 0.6 ? contencion : 0);
      if (sim >= umbral) salida.push({ a: items[i].pagina, b: items[j].pagina, similitud: sim, textoA: items[i].texto, textoB: items[j].texto });
    }
  }
  return salida.sort((p, q) => q.similitud - p.similitud);
}

if (process.argv[1]?.endsWith("duplicados.ts")) {
  buscarDuplicados().then((d) => {
    console.log(d.length ? `${d.length} pares de textos casi idénticos entre páginas:\n` : "Sin textos casi idénticos entre páginas.");
    for (const x of d) console.log(`· ${x.a}  ↔  ${x.b}  (${Math.round(x.similitud * 100)} %)\n    A: ${x.textoA.slice(0, 150)}\n    B: ${x.textoB.slice(0, 150)}\n`);
    process.exit(d.length ? 1 : 0);
  });
}
