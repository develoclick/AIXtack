/**
 * Verificación del sitio ya construido (Fase 5). Se ejecuta contra `next start`:
 *
 *   npm run build && npx next start -p 3100     (en otra terminal)
 *   npm run sitio:verificar -- http://localhost:3100
 *
 * Comprueba: (1) cada URL antigua → 301 con el destino esperado; (2) cada URL nueva → 200, un solo canonical,
 * un solo H1, robots (noindex si no está publicada), un Article y un BreadcrumbList en las herramientas;
 * (3) los enlaces internos de todas las páginas: 0 rotos y ninguno apunta a una URL redirigida ni a /guias;
 * (4) el sitemap: solo URLs nuevas, sin /mi-negocio, sin noindex; (5) las URLs del modelo anterior → 410.
 * Sale con código 1 si algo falla y escribe la tabla en Markdown.
 */
import { categories } from "../content/categorias";
import { redirects } from "../content/redirects";
import { listarTodas, rutaHerramienta } from "../lib/herramientas/registro";
import { institutionalPages, siteUrl } from "../lib/site";

const base = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
const fallos: string[] = [];
const fallo = (m: string) => fallos.push(m);

async function pedir(ruta: string, seguir = false) {
  return fetch(base + ruta, { redirect: seguir ? "follow" : "manual" });
}

const cuenta = (html: string, re: RegExp) => (html.match(re) ?? []).length;

async function main() {
  const filas: string[] = [];

  // 1) URLs antiguas
  filas.push("### URLs antiguas\n", "| URL antigua | Código | Destino (Location) | ¿Correcto? |", "|---|---|---|---|");
  for (const r of redirects) {
    const res = await pedir(r.from);
    const loc = res.headers.get("location") ?? "";
    const destino = loc.replace(base, "");
    const bien = res.status === 301 && destino === r.to;
    if (!bien) fallo(`Redirección ${r.from}: ${res.status} → ${loc} (esperado 301 → ${r.to})`);
    filas.push(`| ${r.from} | ${res.status} | ${destino} | ${bien ? "sí" : "NO"} |`);
  }

  // 2) URLs nuevas
  const todas = (await listarTodas()).filter((h) => !h.interna);
  const nuevas: { ruta: string; publicada: boolean | null; tipo: "herramienta" | "otra" }[] = [
    { ruta: "/", publicada: null, tipo: "otra" },
    { ruta: "/herramientas", publicada: null, tipo: "otra" },
    { ruta: "/como-probamos", publicada: null, tipo: "otra" },
    { ruta: "/mi-negocio", publicada: false, tipo: "otra" },
    ...categories.map((c) => ({ ruta: `/${c.slug}`, publicada: null, tipo: "otra" as const })),
    ...institutionalPages.filter((p) => p.path !== "/como-probamos").map((p) => ({ ruta: p.path, publicada: null, tipo: "otra" as const })),
    ...todas.map((h) => ({ ruta: rutaHerramienta(h.meta), publicada: h.publicado, tipo: "herramienta" as const })),
  ];
  filas.push("\n### URLs nuevas (página → canonical)\n", "| URL | Código | Canonical | og:url | Robots | Publicada |", "|---|---|---|---|---|---|");
  const htmlPorRuta = new Map<string, string>();
  for (const n of nuevas) {
    const res = await pedir(n.ruta);
    const html = await res.text();
    htmlPorRuta.set(n.ruta, html);
    const canon = [...html.matchAll(/<link[^>]+rel="canonical"[^>]*>/g)].map((m) => /href="([^"]+)"/.exec(m[0])?.[1] ?? "");
    const robots = /<meta[^>]+name="robots"[^>]+content="([^"]+)"/.exec(html)?.[1] ?? "index (por defecto)";
    if (res.status !== 200) fallo(`${n.ruta}: código ${res.status}`);
    if (canon.length !== 1) fallo(`${n.ruta}: ${canon.length} canonical`);
    else if (canon[0].replace(/\/$/, "") !== siteUrl + (n.ruta === "/" ? "" : n.ruta)) fallo(`${n.ruta}: canonical ${canon[0]} (esperado ${siteUrl}${n.ruta})`);
    const ogUrl = /<meta[^>]+property="og:url"[^>]+content="([^"]+)"/.exec(html)?.[1] ?? "";
    if (ogUrl.replace(/\/$/, "") !== siteUrl + (n.ruta === "/" ? "" : n.ruta)) fallo(`${n.ruta}: og:url «${ogUrl}»`);
    // Ninguna URL absoluta del sitio sin «www» en todo el HTML (canonical, og, JSON-LD url/@id/breadcrumbs, enlaces…).
    const sinWww = [...new Set(html.match(/https?:\/\/guiapromptsia\.com[^"'\s<>\\]*/g) ?? [])];
    if (sinWww.length) fallo(`${n.ruta}: URLs sin www en el HTML: ${sinWww.join(", ")}`);
    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    for (const j of jsonLd) for (const u of j.match(/https?:\/\/[^"\\]+/g) ?? []) if (/guiapromptsia\.com/.test(u) && !u.startsWith(siteUrl)) fallo(`${n.ruta}: JSON-LD con URL fuera de ${siteUrl}: ${u}`);
    // og:image y twitter:image: la imagen debe existir (200, tipo imagen).
    for (const propiedad of ["og:image", "twitter:image"]) {
      const img = new RegExp(`<meta[^>]+(?:property|name)="${propiedad}"[^>]+content="([^"]+)"`).exec(html)?.[1];
      if (!img) fallo(`${n.ruta}: falta ${propiedad}`);
      else {
        const r = await fetch(base + new URL(img).pathname);
        if (r.status !== 200 || !(r.headers.get("content-type") ?? "").startsWith("image/")) fallo(`${n.ruta}: ${propiedad} ${img} → ${r.status}`);
      }
    }
    if (cuenta(html, /<h1[\s>]/g) !== 1) fallo(`${n.ruta}: ${cuenta(html, /<h1[\s>]/g)} H1`);
    if (n.tipo === "herramienta") {
      if (cuenta(html, /"@type":"Article"/g) !== 1) fallo(`${n.ruta}: Article JSON-LD ≠ 1`);
      if (cuenta(html, /"@type":"BreadcrumbList"/g) !== 1) fallo(`${n.ruta}: BreadcrumbList JSON-LD ≠ 1`);
      const noindex = /noindex/.test(robots);
      if (n.publicada === false && !noindex) fallo(`${n.ruta}: no publicada pero indexable`);
      if (n.publicada === true && noindex) fallo(`${n.ruta}: publicada pero noindex`);
    }
    filas.push(`| ${n.ruta} | ${res.status} | ${canon[0] ?? "—"} | ${ogUrl || "—"} | ${robots} | ${n.publicada === null ? "n/a" : n.publicada ? "sí" : "no"} |`);
  }

  // 3) enlaces internos
  const origenes = new Set(redirects.map((r) => r.from));
  const vistos = new Map<string, string[]>();
  for (const [ruta, html] of htmlPorRuta) {
    for (const m of html.matchAll(/href="(\/[^"#?]*)[^"]*"/g)) {
      const destino = m[1].replace(/\/$/, "") || "/";
      if (/^\/(_next|img|images|favicon|logo|manifest|sitemap|robots|ads)/.test(destino) || /\.[a-z0-9]{2,5}$/i.test(destino)) continue;
      vistos.set(destino, [...(vistos.get(destino) ?? []), ruta]);
    }
  }
  let rotos = 0;
  for (const [destino, desde] of vistos) {
    if (destino === "/guias" || destino.includes("/guias/") || origenes.has(destino)) {
      fallo(`Enlace a URL retirada/redirigida ${destino} desde ${[...new Set(desde)].join(", ")}`);
      rotos++;
      continue;
    }
    const res = await pedir(destino);
    if (res.status !== 200) {
      fallo(`Enlace roto ${destino} (${res.status}) desde ${[...new Set(desde)].join(", ")}`);
      rotos++;
    }
  }
  filas.push(`\n### Enlaces internos\n\n${vistos.size} destinos distintos revisados en ${htmlPorRuta.size} páginas; rotos o hacia URLs retiradas: ${rotos}.`);

  // 4) sitemap
  const sm = await (await pedir("/sitemap.xml")).text();
  for (const u of sm.match(/<loc>[^<]+<\/loc>/g) ?? []) if (!u.startsWith(`<loc>${siteUrl}`)) fallo(`Sitemap: ${u} no usa ${siteUrl}`);
  for (const u of sm.match(/<image:loc>[^<]+<\/image:loc>/g) ?? []) if (!u.startsWith(`<image:loc>${siteUrl}`)) fallo(`Sitemap: ${u} no usa ${siteUrl}`);
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, "") || "/");
  filas.push(`\n### Sitemap\n\n${urls.length} URLs: ${urls.join(", ") || "(ninguna)"}`);
  for (const u of urls) {
    if (u === "/mi-negocio" || u.includes("/guias") || origenes.has(u)) fallo(`Sitemap contiene ${u}`);
    const pagina = htmlPorRuta.get(u.replace(/\/$/, "") || "/");
    if (pagina && /name="robots"[^>]+noindex/.test(pagina)) fallo(`Sitemap contiene una página noindex: ${u}`);
  }

  // 5) modelo anterior sin equivalente → 410
  filas.push("\n### Modelo anterior sin equivalente\n", "| URL | Código |", "|---|---|");
  for (const u of ["/herramientas-ia/x", "/prompts/no-existe", "/blog/no-existe", "/categoria/x", "/etiqueta/x", "/feed.xml"]) {
    const res = await pedir(u);
    if (res.status !== 410) fallo(`${u}: se esperaba 410 y llegó ${res.status}`);
    filas.push(`| ${u} | ${res.status} |`);
  }
  const robotsTxt = await (await pedir("/robots.txt")).text();
  if (!robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) fallo(`robots.txt no apunta a ${siteUrl}/sitemap.xml`);
  filas.push(`\n### robots.txt\n\n\`\`\`\n${robotsTxt.trim()}\n\`\`\``);

  console.log(filas.join("\n"));
  console.log(fallos.length ? `\nFALLOS (${fallos.length}):\n- ${fallos.join("\n- ")}` : "\nSIN FALLOS.");
  process.exit(fallos.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
