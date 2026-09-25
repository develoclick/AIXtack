/**
 * Publica una herramienta cuando ya tienes su prueba real:
 *
 *   npm run publicar -- {area}/{slug} --ia "ChatGPT" --fecha AAAA-MM-DD --corregi "línea 1" "línea 2" "línea 3"
 *
 * Qué hace (docs/como-publicar.md):
 *  1. comprueba que están las imágenes obligatorias (los espacios de `imagenes` con `obligatoria: true`) en public/img/{area}/{slug}/
 *     (.webp, .png o .jpg) y, en una página de proceso, que `ejemplo.pasos` y `ejemplo.tiempoTotal` están rellenos. Las imágenes ya no
 *     se registran: aparecen solas al guardar el archivo con su nombre;
 *  2. rellena probadoEn, probadoFecha, actualizado y «Qué corregí yo»;
 *  3. ejecuta validador, tests, build y `npm run qa` de esa página;
 *  4. SOLO si todo pasa, pone `publicado: true` y hace un commit (sin push). Si algo falla, deja el archivo como estaba y te
 *     dice exactamente qué falta.
 *
 * Opciones: `--comprobar` (hace todo, incluido el build y el QA, pero no deja ningún cambio ni hace commit) y `--sin-qa` (omite el
 * build y el recorrido interactivo; solo para depurar: no se permite con commit).
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { leerDimensiones } from "../lib/imagenes/dimensiones";
import { existeUtilizable, resolverImagenes, type ImagenResuelta } from "../lib/herramientas/imagenes";
import { pasosDelProceso, type Herramienta } from "../lib/herramientas/tipos";

const raiz = process.cwd();
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

/* ───────────────────────── utilidades puras (con tests) ───────────────────────── */

export interface Argumentos {
  ruta: string;
  ia: string;
  fecha: string;
  corregi: string[];
  comprobar: boolean;
  sinQa: boolean;
}

export function leerArgumentos(argv: string[]): { args?: Argumentos; errores: string[] } {
  const errores: string[] = [];
  const [ruta, ...resto] = argv;
  const valor = (flag: string) => {
    const i = resto.indexOf(flag);
    return i >= 0 ? resto[i + 1] : undefined;
  };
  const i = resto.indexOf("--corregi");
  const corregi: string[] = [];
  if (i >= 0) for (const x of resto.slice(i + 1)) { if (x.startsWith("--")) break; corregi.push(x.trim()); }

  if (!ruta || !/^[a-z]+\/[a-z0-9-]+$/.test(ruta)) errores.push("Indica la herramienta como {area}/{slug}, por ejemplo marketing/crear-afiches-con-ia.");
  const ia = valor("--ia")?.trim();
  if (!ia || ia.startsWith("--")) errores.push('Falta --ia "ChatGPT" (la IA con la que hiciste la prueba).');
  const fecha = valor("--fecha")?.trim();
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha))) errores.push("Falta --fecha AAAA-MM-DD (la fecha real de la prueba).");
  else if (Date.parse(fecha) > Date.now() + 24 * 3600 * 1000) errores.push(`--fecha ${fecha} está en el futuro: escribe la fecha real de la prueba.`);
  if (corregi.length !== 3 || corregi.some((c) => c.length < 10)) errores.push('Faltan las tres líneas de «Qué corregí yo»: --corregi "línea 1" "línea 2" "línea 3" (cada una, con algo real que corregiste).');
  if (errores.length) return { errores };
  return { errores, args: { ruta, ia: ia!, fecha: fecha!, corregi, comprobar: resto.includes("--comprobar"), sinQa: resto.includes("--sin-qa") } };
}

/** Ancho y alto reales de una imagen (.webp, .png o .jpg). */
export const tamanoWebp = leerDimensiones;

/** Índice del carácter que cierra el «[» o «{» que abre en `i`, saltando cadenas de texto y comentarios. */
export function encontrarCierre(s: string, i: number): number {
  const abre = s[i];
  const cierra = abre === "[" ? "]" : "}";
  let profundidad = 0;
  for (let k = i; k < s.length; k++) {
    const c = s[k];
    if (c === '"' || c === "'" || c === "`") {
      const comilla = c;
      for (k++; k < s.length && s[k] !== comilla; k++) if (s[k] === "\\") k++;
      continue;
    }
    if (c === "/" && s[k + 1] === "/") { k = s.indexOf("\n", k); if (k < 0) break; continue; }
    if (c === abre) profundidad++;
    else if (c === cierra && --profundidad === 0) return k;
  }
  throw new Error("no encuentro el cierre de " + abre);
}

/** Elementos de primer nivel de un array de objetos escrito como texto TypeScript. */
export function objetosDeArray(textoArray: string): string[] {
  const salida: string[] = [];
  for (let k = textoArray.indexOf("[") + 1; k < textoArray.length; k++) {
    if (textoArray[k] === "{") {
      const fin = encontrarCierre(textoArray, k);
      salida.push(textoArray.slice(k, fin + 1));
      k = fin;
    }
  }
  return salida;
}

/** Reemplaza el valor de la propiedad `nombre: [...]` que empieza en la primera aparición tras `desde`. */
function reemplazarArray(s: string, nombre: string, desde: number, nuevoTexto: string): { texto: string; fin: number } {
  const clave = `\n    ${nombre}: [`;
  const i = s.indexOf(clave, desde);
  if (i < 0) throw new Error(`no encuentro «${nombre}» en el archivo de datos`);
  const abre = i + clave.length - 1;
  const cierra = encontrarCierre(s, abre);
  let despues = cierra + 1;
  if (s[despues] === ",") despues++;
  // comentario TODO en la misma línea
  const finLinea = s.indexOf("\n", despues);
  if (/^\s*\/\//.test(s.slice(despues, finLinea))) despues = finLinea;
  return { texto: s.slice(0, i) + `\n    ${nombre}: ${nuevoTexto},` + s.slice(despues), fin: i };
}

export interface CambiosPagina {
  fuente: string;
  ia: string;
  fecha: string;
  hoy: string;
  corregi: string[];
}

/** Aplica al texto del archivo de datos: probadoEn/Fecha, actualizado, «Qué corregí yo» y publicado. Las imágenes no se tocan. */
export function aplicarCambios({ fuente, ia, fecha, hoy, corregi }: CambiosPagina): string {
  let s = fuente;
  const ejemplo = s.indexOf("\n  ejemplo: {");
  if (ejemplo < 0) throw new Error("no encuentro el bloque «ejemplo» en el archivo de datos");

  // 1) «Qué corregí yo»
  s = reemplazarArray(s, "queCorregi", ejemplo, `[\n${corregi.map((l) => `      ${JSON.stringify(l)},`).join("\n")}\n    ]`).texto;

  // 2) prueba real y fechas
  const linea = (nombre: string, valor: string) => {
    const re = new RegExp(`^(\\s+)${nombre}: [^\\n]*$`, "m");
    if (!re.test(s)) throw new Error(`no encuentro «${nombre}» en meta`);
    s = s.replace(re, `$1${nombre}: ${valor},`);
  };
  linea("probadoEn", JSON.stringify(ia));
  linea("probadoFecha", JSON.stringify(fecha));
  linea("actualizado", JSON.stringify(fecha > hoy ? fecha : hoy));

  // 3) publicado
  if (!/^  publicado: false,/m.test(s)) throw new Error("la página ya está publicada o «publicado» no está en la primera línea de datos");
  s = s.replace(/^  publicado: false,/m, "  publicado: true,");
  return s;
}

/**
 * Lo que falta para poder publicar (lista vacía = todo listo): imágenes obligatorias que no están o no se pueden leer y, en una página
 * de proceso, «ejemplo.pasos» y «ejemplo.tiempoTotal» (el registro de la prueba real que solo puede escribir su autor).
 */
export function faltaParaPublicar(h: Pick<Herramienta, "meta" | "ejemplo" | "pasos">, imagenes: ImagenResuelta[]): string[] {
  const faltan: string[] = [];
  const carpeta = `public/img/${h.meta.area}/${h.meta.slug}`;
  for (const r of imagenes) {
    const e = r.espacio;
    if (r.archivo?.error) faltan.push(`${carpeta}/${e.archivo}.${r.archivo.extension}: no se puede leer como imagen (${r.archivo.error}).`);
    else if (!existeUtilizable(r) && e.obligatoria) faltan.push(`${carpeta}/${e.archivo}.webp (o .png, o .jpg)  ←  ${e.etiqueta}: ${e.titulo ?? e.alt}`);
  }
  if (pasosDelProceso(h)) {
    const filas = (h.ejemplo.pasos ?? []).filter((f) => f.hizoLaIA?.trim() && f.hiceYo?.trim() && f.tiempo?.trim());
    if (filas.length === 0) faltan.push("ejemplo.pasos (en el archivo de datos): una fila por paso con { paso, hizoLaIA, hiceYo, tiempo } de tu prueba real.");
    if (!h.ejemplo.tiempoTotal?.trim()) faltan.push("ejemplo.tiempoTotal (en el archivo de datos): el tiempo total real de tu prueba, por ejemplo «14 min».");
  }
  return faltan;
}

/* ───────────────────────── ejecución ───────────────────────── */

function paso(nombre: string, cmd: string, args: string[], opciones: { entorno?: Record<string, string> } = {}) {
  process.stdout.write(`\n▶ ${nombre}\n`);
  const r = spawnSync(cmd, args, { cwd: raiz, encoding: "utf8", shell: process.platform === "win32", env: { ...process.env, ...opciones.entorno } });
  const salida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  if (r.status !== 0) return { ok: false, salida };
  process.stdout.write("  ✔ correcto\n");
  return { ok: true, salida };
}

/** Solo las líneas que dicen qué falla (el resto de la salida es ruido); si no hay ninguna, la salida completa. */
export function lineasQueFallan(salida: string, patron: RegExp): string {
  const lineas = salida.split("\n").filter((l) => patron.test(l)).slice(0, 30);
  return lineas.length ? lineas.join("\n") : salida;
}

function puertoLibre(): Promise<number> {
  return new Promise((res, rej) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => res(port));
    });
    srv.on("error", rej);
  });
}

async function esperar(url: string, ms = 60000) {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    try {
      if ((await fetch(url)).status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function matar(p: ChildProcess) {
  try {
    if (process.platform === "win32" && p.pid) spawnSync("taskkill", ["/pid", String(p.pid), "/T", "/F"]);
    else p.kill("SIGTERM");
  } catch {}
}

function git(...a: string[]) {
  return spawnSync("git", a, { cwd: raiz, encoding: "utf8" });
}

async function main() {
  const { args, errores } = leerArgumentos(process.argv.slice(2));
  if (!args) {
    console.error("No se puede publicar:\n- " + errores.join("\n- "));
    process.exit(1);
  }
  const [area, slug] = args.ruta.split("/");
  const archivoDatos = path.join(raiz, "content", "herramientas", area, `${slug}.ts`);
  if (!fs.existsSync(archivoDatos)) {
    console.error(`No existe content/herramientas/${args.ruta}.ts`);
    process.exit(1);
  }
  const datos = (await import(pathToFileURL(archivoDatos).href)).default;
  if (datos.publicado) {
    console.error(`${args.ruta} ya está publicada. Nada que hacer.`);
    process.exit(1);
  }
  const carpeta = path.join(raiz, "public", "img", area, slug);

  // 1) imágenes obligatorias (se detectan solas por su nombre) y registro de la prueba real
  const faltan = faltaParaPublicar(datos as Herramienta, resolverImagenes(datos as Herramienta));
  if (faltan.length) {
    console.error(`No se puede publicar ${args.ruta}. Falta:\n- ${faltan.join("\n- ")}\n\nNo se ha cambiado nada.`);
    process.exit(1);
  }
  const og = path.join(carpeta, "og.webp");
  if (!fs.existsSync(og)) {
    console.error(`No se puede publicar ${args.ruta}: falta ${path.relative(raiz, og)} (ejecuta «npm run og -- ${args.ruta}»). No se ha cambiado nada.`);
    process.exit(1);
  }

  // el árbol de trabajo debe estar limpio (salvo las imágenes de esta herramienta), para que el commit solo lleve la publicación
  if (!args.comprobar) {
    const sucio = git("status", "--porcelain").stdout.split("\n").filter(Boolean).filter((l) => !l.slice(3).replace(/\\/g, "/").startsWith(`public/img/${area}/${slug}/`));
    if (sucio.length) {
      console.error(`Hay cambios sin confirmar que no son de esta herramienta; confírmalos o guárdalos antes:\n${sucio.join("\n")}`);
      process.exit(1);
    }
  }

  const original = fs.readFileSync(archivoDatos, "utf8");
  const hoy = new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD en la zona horaria local
  let nuevo: string;
  try {
    nuevo = aplicarCambios({ fuente: original, ia: args.ia, fecha: args.fecha, hoy, corregi: args.corregi });
  } catch (e) {
    console.error(`No se pudo preparar el archivo de datos: ${(e as Error).message}\nNo se ha cambiado nada.`);
    process.exit(1);
  }

  const revertir = () => fs.writeFileSync(archivoDatos, original);
  fs.writeFileSync(archivoDatos, nuevo);
  const fallo = (nombre: string, salida: string) => {
    revertir();
    console.error(`\n✖ ${nombre} ha fallado. ${args.ruta} sigue con publicado:false y el archivo de datos quedó como estaba.\n\nLo que falta o falla:\n${salida.trim().split("\n").slice(-40).join("\n")}`);
    process.exit(1);
  };

  // 2) validador y tests
  let r = paso("Validador de herramientas (como página publicada)", npm, ["run", "herramientas:validar"]);
  if (!r.ok) fallo("El validador", lineasQueFallan(r.salida, /^\s*✖/));
  r = paso("Tests", npm, ["test"]);
  if (!r.ok) fallo("Los tests", lineasQueFallan(r.salida, /^\s*✖|AssertionError|Error:/));

  // 3) build + QA de esta página
  if (!args.sinQa) {
    r = paso("Build de producción", npm, ["run", "build"]);
    if (!r.ok) fallo("El build", r.salida);
    const puerto = await puertoLibre();
    const servidor = spawn(npx, ["next", "start", "-p", String(puerto)], { cwd: raiz, shell: process.platform === "win32", stdio: "ignore" });
    try {
      if (!(await esperar(`http://localhost:${puerto}/`))) fallo("El servidor de producción", "no arrancó en 60 s");
      r = paso(`Recorrido interactivo de /${args.ruta} (375 y 1280 px)`, npx, ["tsx", "scripts/qa-interactivo.ts", `http://localhost:${puerto}`, "--solo", `/${args.ruta}`]);
      if (!r.ok) fallo("El recorrido interactivo (npm run qa)", r.salida);
    } finally {
      matar(servidor);
    }
  } else if (!args.comprobar) {
    revertir();
    console.error("--sin-qa solo se permite junto con --comprobar (no se publica sin build ni QA).");
    process.exit(1);
  }

  if (args.comprobar) {
    revertir();
    console.log(`\n✔ Todo pasa para ${args.ruta}. Modo --comprobar: no se ha cambiado nada ni se ha hecho commit. Quita --comprobar para publicar.`);
    return;
  }

  // 4) commit (sin push)
  git("add", path.relative(raiz, archivoDatos), path.join("public", "img", area, slug));
  const c = git("commit", "-m", `Publica ${args.ruta}: probado por Nicolas en ${args.ia} el ${args.fecha}`);
  if (c.status !== 0) fallo("El commit", c.stdout + c.stderr);
  console.log(`\n✔ ${args.ruta} publicada (publicado:true) y confirmada en un commit local. No se ha hecho push: revisa con «git show» y sube cuando quieras.`);
}

if (process.argv[1]?.endsWith("publicar.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
