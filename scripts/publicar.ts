/**
 * Publica una herramienta cuando ya tienes su prueba real:
 *
 *   npm run publicar -- {area}/{slug} --ia "ChatGPT" --fecha AAAA-MM-DD --corregi "línea 1" "línea 2" "línea 3"
 *
 * Qué hace (docs/como-publicar.md):
 *  1. comprueba que existen en public/img/{area}/{slug}/ los archivos de `capturasPendientes`;
 *  2. lee su ancho y alto reales y las pasa a `capturas` con la etiqueta prevista, más un alt y una leyenda que puedes editar;
 *  3. rellena probadoEn, probadoFecha, actualizado y «Qué corregí yo»;
 *  4. ejecuta validador, tests, build y `npm run qa` de esa página;
 *  5. SOLO si todo pasa, pone `publicado: true` y hace un commit (sin push). Si algo falla, deja el archivo como estaba y te
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

/** Ancho y alto reales de un .webp (VP8, VP8L o VP8X). */
export function tamanoWebp(buf: Buffer): { ancho: number; alto: number } {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") throw new Error("no es un archivo .webp válido");
  const tipo = buf.toString("ascii", 12, 16);
  if (tipo === "VP8 ") return { ancho: buf.readUInt16LE(26) & 0x3fff, alto: buf.readUInt16LE(28) & 0x3fff };
  if (tipo === "VP8X") return { ancho: 1 + buf.readUIntLE(24, 3), alto: 1 + buf.readUIntLE(27, 3) };
  if (tipo === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { ancho: 1 + (bits & 0x3fff), alto: 1 + ((bits >> 14) & 0x3fff) };
  }
  throw new Error(`tipo de .webp desconocido (${tipo})`);
}

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

export interface CapturaNueva {
  src: string;
  alt: string;
  etiqueta: string;
  leyenda: string;
  ancho: number;
  alto: number;
}

const objeto = (c: CapturaNueva, sangria: string) =>
  [`${sangria}{`, `${sangria}  src: ${JSON.stringify(c.src)},`, `${sangria}  alt: ${JSON.stringify(c.alt)},`, `${sangria}  etiqueta: ${JSON.stringify(c.etiqueta)},`, `${sangria}  ancho: ${c.ancho},`, `${sangria}  alto: ${c.alto},`, `${sangria}  leyenda: ${JSON.stringify(c.leyenda)},`, `${sangria}},`].join("\n");

/** Reemplaza el valor de la propiedad `nombre: [...]` que empieza en la primera aparición tras `desde`. */
function reemplazarArray(s: string, nombre: string, desde: number, nuevoTexto: string): { texto: string; fin: number } {
  const clave = `\n    ${nombre}: [`;
  const i = s.indexOf(clave, desde);
  if (i < 0) throw new Error(`no encuentro «${nombre}» en el archivo de datos`);
  const abre = i + clave.length - 1;
  let cierra = encontrarCierre(s, abre);
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
  capturas: CapturaNueva[];
}

/** Aplica al texto del archivo de datos: capturas, pendientes, probadoEn/Fecha, actualizado, «Qué corregí yo» y publicado. */
export function aplicarCambios({ fuente, ia, fecha, hoy, corregi, capturas }: CambiosPagina): string {
  let s = fuente;
  const ejemplo = s.indexOf("\n  ejemplo: {");
  if (ejemplo < 0) throw new Error("no encuentro el bloque «ejemplo» en el archivo de datos");

  // 1) capturas: las nuevas van primero; en el ejemplo caben 2, el resto de las anteriores pasa al «método completo»
  const claveCap = "\n    capturas: [";
  const iCap = s.indexOf(claveCap, ejemplo);
  const abre = iCap + claveCap.length - 1;
  const actual = objetosDeArray(s.slice(abre, encontrarCierre(s, abre) + 1));
  const anteriores = actual;
  const nuevas = capturas.map((c) => objeto(c, "      "));
  const enEjemplo = [...nuevas, ...anteriores.map((o) => "      " + o + ",")];
  const quedan = enEjemplo.slice(0, 2);
  const sobran = enEjemplo.slice(2);
  s = reemplazarArray(s, "capturas", ejemplo, quedan.length ? `[\n${quedan.join("\n")}\n    ]` : "[]").texto;
  if (sobran.length) {
    const mc = s.indexOf("\n  metodoCompleto: {");
    if (mc < 0) throw new Error("hay más de 2 capturas para el ejemplo y esta página no tiene «método completo» donde guardar las anteriores: reduce las capturas a mano");
    const iMc = s.indexOf(claveCap, mc);
    if (iMc < 0) throw new Error("hay más de 2 capturas para el ejemplo y el «método completo» no tiene lista de capturas: añádela a mano");
    const abreMc = iMc + claveCap.length - 1;
    const existentes = objetosDeArray(s.slice(abreMc, encontrarCierre(s, abreMc) + 1)).map((o) => "      " + o + ",");
    s = reemplazarArray(s, "capturas", mc, `[\n${[...sobran, ...existentes].join("\n")}\n    ]`).texto;
  }

  // 2) «Qué corregí yo»
  s = reemplazarArray(s, "queCorregi", ejemplo, `[\n${corregi.map((l) => `      ${JSON.stringify(l)},`).join("\n")}\n    ]`).texto;

  // 3) pendientes → vacío (con su comentario)
  const cp = s.indexOf("\n  capturasPendientes: [");
  if (cp < 0) throw new Error("no encuentro «capturasPendientes»");
  const cierre = encontrarCierre(s, cp + "\n  capturasPendientes: ".length);
  const finProp = s[cierre + 1] === "," ? cierre + 2 : cierre + 1;
  s = s.slice(0, cp) + "\n  capturasPendientes: []," + s.slice(finProp);

  // 4) prueba real y fechas
  const linea = (nombre: string, valor: string) => {
    const re = new RegExp(`^(\\s+)${nombre}: [^\\n]*$`, "m");
    if (!re.test(s)) throw new Error(`no encuentro «${nombre}» en meta`);
    s = s.replace(re, `$1${nombre}: ${valor},`);
  };
  linea("probadoEn", JSON.stringify(ia));
  linea("probadoFecha", JSON.stringify(fecha));
  linea("actualizado", JSON.stringify(fecha > hoy ? fecha : hoy));

  // 5) publicado
  if (!/^  publicado: false,/m.test(s)) throw new Error("la página ya está publicada o «publicado» no está en la primera línea de datos");
  s = s.replace(/^  publicado: false,/m, "  publicado: true,");
  return s;
}

export function capturaDesdePendiente(p: { archivo: string; etiqueta: string; muestra: string }, ruta: string, ia: string, fecha: string, tam: { ancho: number; alto: number }): CapturaNueva {
  const que = p.muestra.replace(/^Chat nuevo:\s*/i, "").replace(/^Mismo chat:\s*/i, "");
  const esChat = p.etiqueta === "Prueba real";
  return {
    src: `/img/${ruta}/${p.archivo}`,
    alt: esChat ? `Captura de la conversación con ${ia}: ${que}` : `Imagen final del ejemplo: ${que}`,
    etiqueta: p.etiqueta,
    leyenda: esChat ? `Prueba real con ${ia} el ${fecha}: la respuesta al prompt de esta página, sin editar.` : `${p.etiqueta} (${ia}, ${fecha}).`,
    ancho: tam.ancho,
    alto: tam.alto,
  };
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

  // 1) archivos de las capturas pendientes
  const faltan: string[] = [];
  const capturas: CapturaNueva[] = [];
  for (const p of datos.capturasPendientes as { archivo: string; etiqueta: string; muestra: string }[]) {
    const f = path.join(carpeta, p.archivo);
    if (!fs.existsSync(f)) {
      faltan.push(`public/img/${args.ruta}/${p.archivo}  ←  ${p.etiqueta}: ${p.muestra}`);
      continue;
    }
    try {
      capturas.push(capturaDesdePendiente(p, args.ruta, args.ia, args.fecha, tamanoWebp(fs.readFileSync(f))));
    } catch (e) {
      faltan.push(`public/img/${args.ruta}/${p.archivo}: ${(e as Error).message}`);
    }
  }
  if (faltan.length) {
    console.error(`No se puede publicar ${args.ruta}. Faltan estos archivos (o no son .webp válidos):\n- ${faltan.join("\n- ")}\n\nNo se ha cambiado nada.`);
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
    nuevo = aplicarCambios({ fuente: original, ia: args.ia, fecha: args.fecha, hoy, corregi: args.corregi, capturas });
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
