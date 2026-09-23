/**
 * Las redirecciones 301 (content/redirects.ts) llevan siempre a una página que existe, sin cadenas ni bucles,
 * cubren las 26 URLs antiguas de la sección 5 del plan y nunca chocan con las rutas vigentes del sitio.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { categories } from "../content/categorias";
import { nextRedirects, redirects } from "../content/redirects";
import { listarTodas, rutaHerramienta } from "./herramientas/registro";
import { institutionalPages } from "./site";
import { config as proxyConfig } from "../proxy";

const GUIAS_ANTIGUAS: Record<string, string[]> = {
  marketing: [
    "crear-anuncios-con-ia",
    "crear-promociones-con-ia",
    "crear-afiches-con-ia",
    "crear-publicaciones-para-redes-sociales-con-ia",
    "calendario-de-contenido-con-ia",
    "ideas-de-contenido-para-tu-negocio-con-ia",
    "crear-campanas-promocionales-con-ia",
  ],
  ventas: ["crear-descripciones-de-productos-con-ia", "crear-cotizaciones-y-propuestas-con-ia", "definir-precios-y-margenes-con-ia"],
  clientes: ["responder-consultas-de-clientes-con-ia", "responder-reclamos-con-ia", "analizar-opiniones-de-clientes-con-ia"],
  analisis: ["analizar-ventas-con-ia", "analizar-ofertas-de-proveedores-con-ia", "investigar-competidores-con-ia", "ideas-de-nuevos-productos-con-ia"],
  negocio: ["organizar-tareas-del-negocio-con-ia", "sistema-diario-de-trabajo-con-ia", "documentar-procesos-con-ia"],
};

async function rutasVigentes(): Promise<Set<string>> {
  const rutas = new Set<string>(["/", "/herramientas", "/como-probamos", "/mi-negocio"]);
  for (const c of categories) rutas.add(`/${c.slug}`);
  for (const p of institutionalPages) rutas.add(p.path);
  for (const h of await listarTodas()) if (!h.interna) rutas.add(rutaHerramienta(h.meta));
  return rutas;
}

test("cubre las 6 URLs de biblioteca/áreas y las 20 URLs de guías antiguas", () => {
  const origenes = new Set(redirects.map((r) => r.from));
  assert.ok(origenes.has("/guias"));
  for (const c of categories) assert.ok(origenes.has(`/${c.slug}/guias`), `/${c.slug}/guias`);
  let total = 0;
  for (const [area, slugs] of Object.entries(GUIAS_ANTIGUAS)) {
    for (const slug of slugs) {
      total++;
      assert.ok(origenes.has(`/${area}/guias/${slug}`), `falta /${area}/guias/${slug}`);
    }
  }
  assert.equal(total, 20);
});

test("todo destino existe hoy, sin cadenas, sin bucles y sin orígenes duplicados", async () => {
  const vigentes = await rutasVigentes();
  const origenes = redirects.map((r) => r.from);
  assert.equal(new Set(origenes).size, origenes.length, "origen duplicado");
  for (const r of redirects) {
    assert.ok(vigentes.has(r.to), `${r.from} → ${r.to}: el destino no existe`);
    assert.notEqual(r.from, r.to);
    assert.ok(!origenes.includes(r.to), `${r.from} → ${r.to}: el destino es a su vez un origen (cadena)`);
    assert.ok(!vigentes.has(r.from), `${r.from} sigue siendo una ruta vigente: la redirección la taparía`);
  }
});

test("son 301 explícitas (no 308) y sin comodines", () => {
  for (const rule of nextRedirects()) {
    assert.equal(rule.statusCode, 301);
    assert.ok(!/[:*(){}]/.test(rule.source), rule.source);
  }
});

test("el proxy que responde 410 no captura ninguna ruta vigente ni ningún destino", async () => {
  const prefijos = proxyConfig.matcher.map((m) => m.replace(/\/:path\*$/, ""));
  for (const ruta of await rutasVigentes()) {
    for (const p of prefijos) assert.ok(ruta !== p && !ruta.startsWith(`${p}/`), `${ruta} coincide con el matcher ${p}`);
  }
});
