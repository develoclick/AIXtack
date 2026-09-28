/**
 * Contraste de color WCAG AA (≥ 4,5:1 para texto normal) de los pares de colores del sistema de diseño, en modo claro y oscuro,
 * leídos directamente de app/globals.css (así, cambiar un token sin revisar el contraste hace fallar este test).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const css = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

function bloque(selector: string): Record<string, string> {
  const i = css.indexOf(`${selector} {`);
  const cuerpo = css.slice(i, css.indexOf("\n}", i));
  const salida: Record<string, string> = {};
  for (const m of cuerpo.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) salida[m[1]] = m[2];
  return salida;
}

function luminancia(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const PARES: [string, string, string][] = [
  ["foreground", "background", "texto principal"],
  ["foreground", "surface", "texto principal sobre superficie"],
  ["foreground", "card", "texto principal sobre tarjeta"],
  ["foreground-2", "background", "texto secundario"],
  ["foreground-2", "surface", "texto secundario sobre superficie"],
  ["foreground-2", "card", "texto secundario sobre tarjeta"],
  ["placeholder", "card", "texto de ayuda de los campos"],
  ["accent-text", "background", "enlaces"],
  ["accent-text", "surface", "enlaces sobre superficie"],
  ["accent-text", "card", "enlaces sobre tarjeta"],
  ["accent-text", "accent-soft", "enlaces sobre fondo suave"],
  ["foreground", "accent-soft", "texto sobre fondo suave"],
  ["accent-foreground", "accent", "texto de los botones primarios"],
  ["danger", "background", "mensajes de error"],
  ["ok", "ok-soft", "estado correcto"],
  ["warn", "warn-soft", "avisos"],
  ["foreground", "warn-soft", "texto sobre aviso"],
  ["footer-foreground", "footer", "texto del pie de página"],
  ["footer-accent", "footer", "títulos del pie de página"],
];

/**
 * Pares que NO cumplen AA con la paleta verde elegida por el dueño del sitio (#00ba88 en modo claro y #00c492 en modo oscuro):
 * texto y enlaces verdes sobre fondo claro y texto blanco sobre botones verdes. No se cambiaron sus colores; se dejan como
 * pendiente visible (todo) hasta que decida oscurecer el verde de los textos y de los botones (por ejemplo #007a5a, ≈ 5:1).
 */
const PENDIENTES_DE_PALETA = new Set(["claro|enlaces", "claro|enlaces sobre superficie", "claro|enlaces sobre tarjeta", "claro|enlaces sobre fondo suave", "claro|texto de los botones primarios", "oscuro|texto de los botones primarios"]);

for (const [tema, selector] of [["claro", ":root"], ["oscuro", ".dark"]] as const) {
  test(`contraste AA (≥ 4,5:1) de los pares de colores en modo ${tema} (salvo los pendientes de la paleta verde)`, () => {
    const t = bloque(selector);
    for (const [a, b, nombre] of PARES) {
      if (PENDIENTES_DE_PALETA.has(`${tema}|${nombre}`)) continue;
      assert.ok(t[a] && t[b], `falta el token ${a} o ${b} en ${selector}`);
      const r = contraste(t[a], t[b]);
      assert.ok(r >= 4.5, `${nombre} (${a} ${t[a]} sobre ${b} ${t[b]}) = ${r.toFixed(2)}:1 (mínimo 4,5:1)`);
    }
  });
}

test("PENDIENTE: los textos y botones verdes cumplen AA (hoy ≈ 2,3–2,5:1; decide el dueño de la paleta)", { todo: "paleta verde elegida por el dueño: oscurecer --accent-text y --accent (o usar texto oscuro sobre el botón)" }, () => {
  for (const [tema, selector] of [["claro", ":root"], ["oscuro", ".dark"]] as const) {
    const t = bloque(selector);
    for (const [a, b, nombre] of PARES) if (PENDIENTES_DE_PALETA.has(`${tema}|${nombre}`)) assert.ok(contraste(t[a], t[b]) >= 4.5, `${tema}: ${nombre} = ${contraste(t[a], t[b]).toFixed(2)}:1`);
  }
});

test("los tokens base del sistema de diseño están definidos (fondo, superficie, borde y texto en claro; fondo oscuro)", () => {
  const c = bloque(":root");
  assert.equal(c.background, "#ffffff");
  assert.equal(c.surface, "#f6f9fc");
  assert.equal(c.border, "#e3e8ee");
  assert.equal(c.foreground, "#0a2540");
  assert.equal(c["foreground-2"], "#425466");
  assert.match(c.accent, /^#[0-9a-f]{6}$/);
  assert.match(bloque(".dark").background, /^#[0-9a-f]{6}$/);
});
