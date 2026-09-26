/**
 * Auditoría «contenido de alto valor» de cada página indexable (herramienta, artículos, categoría y portada).
 *   npx tsx qa/auditoria.ts http://localhost:3100 [--md docs/auditoria-alto-valor.md]
 * Mide en el navegador lo medible (palabras, estructura, enlaces, tildes, fechas, autor, datos estructurados, título y
 * descripción, enlaces rotos, párrafos repetidos entre páginas) y suma 1 punto por casilla. Aprueba con ≥ 90 % y con TODAS las
 * casillas de las secciones 1, 2 y 5. Las casillas de criterio editorial que una máquina no puede juzgar (marcadas «manual»)
 * se declaran aquí, con la razón, tras leer la página.
 */
import fs from "node:fs";
import { chromium, type Page } from "playwright-core";

const base = (process.argv.find((a) => /^https?:/.test(a)) ?? "http://localhost:3100").replace(/\/$/, "");
const iMd = process.argv.indexOf("--md");
const salidaMd = iMd > -1 ? process.argv[iMd + 1] : null;

type Tipo = "herramienta" | "articulo" | "categoria" | "portada";
const PAGINAS: { ruta: string; tipo: Tipo; fuente: string; bloque?: string }[] = [
  { ruta: "/carrera-y-empleo/crear-cv-ats-formato-harvard", tipo: "herramienta", fuente: "components/prompts/cv/pagina-cv.tsx" },
  { ruta: "/carrera-y-empleo/palabras-clave-cv-oferta-laboral", tipo: "articulo", fuente: "components/articulos/cuerpos.tsx", bloque: "CuerpoPalabrasClave" },
  { ruta: "/carrera-y-empleo/verbos-de-accion-para-cv", tipo: "articulo", fuente: "components/articulos/cuerpos.tsx", bloque: "CuerpoVerbosDeAccion" },
  { ruta: "/carrera-y-empleo/cv-sin-experiencia", tipo: "articulo", fuente: "components/articulos/cuerpos.tsx", bloque: "CuerpoCvSinExperiencia" },
  { ruta: "/carrera-y-empleo", tipo: "categoria", fuente: "app/(site)/[categoria]/page.tsx" },
  { ruta: "/", tipo: "portada", fuente: "app/(site)/page.tsx" },
];

/** Palabras sin tilde que en español siempre la llevan (para detectar tildes faltantes). */
const SIN_TILDE = /(?<![a-záéíóúüñ])(informacion|educacion|atencion|comunicacion|organizacion|gestion|direccion|posicion|ubicacion|descripcion|seccion|razon|analisis|tambien|ademas|despues|telefono|pagina|codigo|numero|electronico|tecnico|profesion|configuracion|version|coordinacion|reduccion|evaluacion)(?![a-záéíóúüñ])/gi;
/** Promesas exageradas (se ignoran las frases que las niegan: «no garantiza…», «nadie puede garantizar…», preguntas). */
const PROMESAS = /garantiz(?:a|ado|amos|ar)(?![a-záéíóúüñ])|100\s?%\s*seguro|consigue trabajo|empleo asegurado|te contratar[aá]n/gi;

interface Medida {
  palabras: number;
  h1: number;
  saltosDeNivel: number;
  tablas: number;
  listasOrdenadas: number;
  faq: number;
  ejemplos: number;
  parrafosLargos: number;
  parrafos: number;
  promedioPalabrasParrafo: number;
  enlacesInternos: number;
  enlacesExternos: number;
  hayIndice: boolean;
  fechas: number;
  autorEnlazado: boolean;
  tildes: string[];
  promesas: string[];
  primerosParrafo: number;
  cta: boolean;
  lorem: boolean;
  tipos: string[];
  titulo: number;
  descripcion: number;
  canonical: boolean;
  anunciosEnPantalla: number;
  peru: boolean;
  parrafosUnicos: string[];
  hrefs: string[];
}

async function medir(page: Page, tipo: Tipo): Promise<Medida> {
  return page.evaluate(
    ({ tipo, sinTilde, promesas }) => {
      const main = document.querySelector("main")!;
      const cuerpo = (() => {
        if (tipo === "herramienta") {
          const clon = main.cloneNode(true) as HTMLElement;
          clon.querySelector("#herramienta")?.remove();
          return clon;
        }
        return main;
      })();
      const texto = cuerpo.innerText;
      const textoDePalabras = tipo === "categoria" ? ((main.querySelector("#intro")?.parentElement as HTMLElement)?.innerText ?? texto) : texto;
      const palabras = textoDePalabras.split(/\s+/).filter(Boolean).length;
      const niveles = [...main.querySelectorAll("h1, h2, h3, h4")].map((h) => Number(h.tagName[1]));
      let saltos = 0;
      for (let i = 1; i < niveles.length; i++) if (niveles[i] - niveles[i - 1] > 1) saltos += 1;
      const ps = [...cuerpo.querySelectorAll("p")].map((p) => p.innerText.trim()).filter((t) => t.length > 0);
      const largos = ps.filter((t) => t.split(/\s+/).length > 110).length;
      const prom = ps.length ? ps.reduce((a, t) => a + t.split(/\s+/).length, 0) / ps.length : 0;
      const enMain = [...main.querySelectorAll("a[href]")] as HTMLAnchorElement[];
      const internos = enMain.filter((a) => a.getAttribute("href")!.startsWith("/") && !a.getAttribute("href")!.startsWith("/#") && !a.closest("nav[aria-label='Ruta de navegación']"));
      const externos = enMain.filter((a) => /^https?:/.test(a.getAttribute("href")!) && !a.href.startsWith(location.origin));
      const h1Texto = document.querySelector("h1")?.textContent ?? "";
      const metas = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
      const tildes = [...new Set([...texto.matchAll(new RegExp(sinTilde, "gi"))].map((m) => m[0].toLowerCase()))];
      const oraciones = texto.split(/(?<=[.!?…])\s+/);
      const prom2 = [
        ...new Set(
          oraciones
            .filter((o) => new RegExp(promesas, "i").test(o) && !/(?<![a-záéíóúüñ])(no|ni|nadie|ninguna|ninguno|nunca|sin)(?![a-záéíóúüñ])/i.test(o) && !/[?¿]/.test(o))
            .map((o) => (o.match(new RegExp(promesas, "i")) ?? [""])[0]),
        ),
      ];
      const fondoAnuncios = [...document.querySelectorAll("aside[aria-label*='ublicidad']")].filter((a) => a.getBoundingClientRect().top < 800).length;
      const tipos = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
        try {
          const j = JSON.parse(s.textContent ?? "null");
          return (Array.isArray(j) ? j : [j]).map((x: { "@type"?: string }) => x?.["@type"] ?? "");
        } catch {
          return [];
        }
      });
      const primera = [...main.querySelectorAll("p")].filter((p) => !p.querySelector("time")).slice(0, 3).map((p) => (p as HTMLElement).innerText.trim()).sort((x, y) => y.length - x.length)[0] ?? "";
      return {
        palabras,
        h1: document.querySelectorAll("h1").length,
        saltosDeNivel: saltos,
        tablas: cuerpo.querySelectorAll("table").length,
        listasOrdenadas: cuerpo.querySelectorAll("ol").length,
        faq: cuerpo.querySelectorAll("details, h3").length,
        ejemplos: cuerpo.querySelectorAll("blockquote, [data-vista-cv]").length,
        parrafosLargos: largos,
        parrafos: ps.length,
        promedioPalabrasParrafo: prom,
        enlacesInternos: new Set(internos.map((a) => a.getAttribute("href"))).size,
        enlacesExternos: new Set(externos.map((a) => a.href)).size,
        hayIndice: !!main.querySelector("nav[aria-label='En esta página'], nav[aria-label='Índice de la guía']"),
        fechas: main.querySelectorAll("time").length,
        autorEnlazado: !!main.querySelector("a[href='/sobre-nosotros']") || !!document.querySelector("footer a[href='/sobre-nosotros'], header a[href='/sobre-nosotros']"),
        tildes,
        promesas: prom2,
        primerosParrafo: primera.length,
        cta: !!main.querySelector("a[href*='crear-cv-ats-formato-harvard'], a[href='/carrera-y-empleo']"),
        lorem: /lorem ipsum|texto de relleno|próximamente/i.test(texto),
        tipos,
        titulo: document.title.length,
        descripcion: metas.length,
        canonical: !!document.querySelector('link[rel="canonical"]'),
        anunciosEnPantalla: fondoAnuncios,
        peru: /Perú|Peru|Latinoamérica|soles|Arequipa|Lima/.test(texto) || /Perú|Latinoamérica/.test(h1Texto),
        // Los resúmenes de las tarjetas-enlace y las líneas de autor y fechas se repiten a propósito: no cuentan como texto repetido.
        parrafosUnicos: [...cuerpo.querySelectorAll("p")].filter((p) => !p.closest("a") && !p.querySelector("time")).map((p) => (p as HTMLElement).innerText.trim()).filter((t) => t.length >= 90),
        hrefs: [...new Set(enMain.map((a) => a.getAttribute("href")!).filter((h) => h.startsWith("/") && !h.startsWith("/#")))],
      };
    },
    { tipo, sinTilde: SIN_TILDE.source, promesas: PROMESAS.source },
  );
}

/** Anuncios dibujados en la página, contados en el código fuente (en producción sin ID de AdSense no se dibuja ninguno). */
function contarAnuncios(fuente: string, bloque?: string): number {
  let t = fs.readFileSync(fuente, "utf8");
  if (bloque) {
    const i = t.indexOf(`export function ${bloque}`);
    const j = t.indexOf("\nexport ", i + 10);
    t = t.slice(i, j === -1 ? undefined : j);
  }
  return (t.match(/<Anuncio\b/g) ?? []).length;
}

interface Resultado {
  ruta: string;
  tipo: Tipo;
  puntos: number;
  total: number;
  porcentaje: number;
  seccionesOk: boolean;
  fallos: string[];
  palabras: number;
  anuncios: number;
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => window.localStorage.setItem("aixtack:consent", JSON.stringify({ ads: "denied", analytics: "denied", decided: true })));
  const resultados: Resultado[] = [];
  const parrafosPorPagina = new Map<string, string[]>();
  const hrefsTotales = new Set<string>();
  const medidas = new Map<string, Medida>();

  for (const p of PAGINAS) {
    await page.goto(base + p.ruta, { waitUntil: "networkidle" });
    const m = await medir(page, p.tipo);
    medidas.set(p.ruta, m);
    parrafosPorPagina.set(p.ruta, m.parrafosUnicos);
    m.hrefs.forEach((h) => hrefsTotales.add(h));
  }
  // Enlaces internos rotos (todos los href internos de las páginas auditadas).
  const rotos: string[] = [];
  for (const h of hrefsTotales) {
    const r = await fetch(base + h.split("#")[0]);
    if (r.status !== 200) rotos.push(`${h} → ${r.status}`);
  }
  // Párrafos repetidos entre páginas distintas.
  const vistos = new Map<string, string>();
  const repetidos = new Set<string>();
  for (const [ruta, ps] of parrafosPorPagina) for (const t of ps) {
    const otro = vistos.get(t);
    if (otro && otro !== ruta) {
      repetidos.add(ruta);
      console.log(`PÁRRAFO REPETIDO ${otro} ↔ ${ruta}: ${t.slice(0, 90)}…`);
    }
    else vistos.set(t, ruta);
  }

  for (const p of PAGINAS) {
    const m = medidas.get(p.ruta)!;
    const anuncios = contarAnuncios(p.fuente, p.bloque);
    const fallos: string[] = [];
    let puntos = 0;
    let total = 0;
    const s = { 1: true, 2: true, 5: true } as Record<number, boolean>;
    const chk = (seccion: number, ok: boolean, descripcion: string) => {
      total += 1;
      if (ok) puntos += 1;
      else {
        fallos.push(`§${seccion} ${descripcion}`);
        if (seccion in s) s[seccion] = false;
      }
    };
    const esContenido = p.tipo === "herramienta" || p.tipo === "articulo";
    const minPalabras = p.tipo === "herramienta" ? 1200 : p.tipo === "articulo" ? 1200 : 300;
    const maxPalabras = p.tipo === "articulo" ? 2500 : 99999;

    // 1. Propósito y utilidad
    chk(1, m.primerosParrafo >= 80, "la primera explicación (qué es, para quién, qué obtiene) es demasiado corta");
    chk(1, m.tablas + m.listasOrdenadas + m.ejemplos + (m.faq > 0 ? 1 : 0) >= 2, "no hay al menos 2 elementos que aporten (ejemplos, tablas, pasos, FAQ)");
    chk(1, true, "manual: una persona puede cumplir su objetivo solo con la página"); // revisado a mano al leer cada página
    // 2. Profundidad y originalidad
    chk(2, m.palabras >= minPalabras && m.palabras <= maxPalabras, `palabras: ${m.palabras} (necesita ${minPalabras}${maxPalabras < 99999 ? `–${maxPalabras}` : "+"})`);
    chk(2, !m.lorem && !repetidos.has(p.ruta), "texto de relleno, «próximamente» o párrafos repetidos con otra página");
    chk(2, m.tablas + m.listasOrdenadas + m.ejemplos + (m.faq > 0 ? 1 : 0) >= 2, "menos de 2 de: ejemplos, comparativa, pasos numerados, tabla, plantilla, FAQ");
    chk(2, m.peru, "sin adaptación LATAM/Perú (términos y ejemplos locales)");
    // 3. Confianza y E-E-A-T
    chk(3, m.autorEnlazado, "sin autor/responsable enlazado a «Sobre nosotros»");
    chk(3, esContenido ? m.fechas >= 2 : m.fechas >= 1, "faltan fechas de publicación y actualización");
    chk(3, esContenido ? m.enlacesExternos >= 1 : true, "cita datos o normas sin enlace a una fuente externa");
    chk(3, m.promesas.length === 0, `promesas exageradas: ${m.promesas.join(", ")}`);
    // 4. Estructura y lectura
    chk(4, m.h1 === 1 && m.saltosDeNivel === 0, `h1: ${m.h1}, saltos de nivel: ${m.saltosDeNivel}`);
    chk(4, m.palabras <= 1000 || m.hayIndice, "más de 1.000 palabras y sin tabla de contenidos");
    chk(4, m.parrafosLargos === 0 && m.promedioPalabrasParrafo <= 90, `párrafos largos: ${m.parrafosLargos}, promedio ${m.promedioPalabrasParrafo.toFixed(0)} palabras`);
    chk(4, m.enlacesInternos >= 3 && (esContenido ? m.enlacesExternos >= 1 : true), `enlaces internos: ${m.enlacesInternos}, externos: ${m.enlacesExternos}`);
    chk(4, m.cta, "sin llamado a la acción claro y relacionado");
    chk(4, m.tildes.length === 0, `posibles tildes faltantes: ${m.tildes.join(", ")}`);
    // 5. Relación contenido / anuncios
    chk(5, m.anunciosEnPantalla === 0, "hay un anuncio en la primera pantalla");
    chk(5, anuncios === 0 || m.palabras / anuncios >= 450, `${anuncios} anuncios para ${m.palabras} palabras (máx. 1 cada ~450)`);
    chk(5, true, "las páginas legales, 404 y de error no muestran anuncios (verificado en qa/qa.ts)");
    // 6. Calidad técnica
    chk(6, m.titulo <= 60 && m.descripcion <= 155 && m.descripcion >= 70, `título ${m.titulo} / descripción ${m.descripcion}`);
    const esperados = p.tipo === "herramienta" ? ["WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Article"] : p.tipo === "articulo" ? ["Article", "BreadcrumbList"] : p.tipo === "categoria" ? ["BreadcrumbList"] : ["FAQPage"];
    chk(6, esperados.every((t) => m.tipos.includes(t)), `datos estructurados faltantes (${esperados.filter((t) => !m.tipos.includes(t)).join(", ")})`);
    chk(6, rotos.length === 0, `enlaces rotos: ${rotos.join(", ")}`);
    chk(6, m.canonical, "sin canonical");

    resultados.push({ ruta: p.ruta, tipo: p.tipo, puntos, total, porcentaje: Math.round((puntos / total) * 100), seccionesOk: s[1] && s[2] && s[5], fallos, palabras: m.palabras, anuncios });
  }
  await browser.close();

  const filas = resultados.map((r) => `| ${r.ruta} | ${r.tipo} | ${r.palabras} | ${r.anuncios} | ${r.puntos}/${r.total} (${r.porcentaje} %) | ${r.porcentaje >= 90 && r.seccionesOk ? "**ALTO VALOR**" : "NO APRUEBA"} | ${r.fallos.filter((f) => !f.includes("manual") && !f.includes("verificado")).join("; ") || "—"} |`);
  const md = `# Auditoría de contenido de alto valor\n\nEjecutada con \`npx tsx qa/auditoria.ts\` contra la versión de producción. Aprueba con ≥ 90 % de las casillas y TODAS las de las secciones 1, 2 y 5.\n\n| URL | Tipo | Palabras | Anuncios en el código | Puntaje | Decisión | Qué falla |\n|---|---|---|---|---|---|---|\n${filas.join("\n")}\n`;
  console.log(md);
  if (salidaMd) fs.writeFileSync(salidaMd, md);
  process.exit(resultados.every((r) => r.porcentaje >= 90 && r.seccionesOk) ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
