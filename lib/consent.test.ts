/**
 * Consentimiento: antes de aceptar no se carga ningún script de terceros, el banner propio tiene su interruptor y el
 * espacio de anuncios no lleva código de AdSense.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdsenseLoader } from "../components/ads/adsense-loader";
import { AnalyticsLoader } from "../components/analytics/analytics-loader";
import { ConsentContext, type ConsentContextValue } from "../providers/consent-provider";
import { BANNER_PROPIO_ACTIVO } from "./consent-config";

const valor = (over: Partial<ConsentContextValue>): ConsentContextValue => ({ ads: "denied", analytics: "denied", decided: false, acceptAll: () => {}, rejectAll: () => {}, ...over });
const html = (el: ReturnType<typeof createElement>, v: ConsentContextValue) => renderToStaticMarkup(createElement(ConsentContext.Provider, { value: v }, el));

test("antes de aceptar (y tras rechazar) no se carga Google Analytics ni AdSense", () => {
  for (const v of [valor({}), valor({ decided: true })]) {
    assert.equal(html(createElement(AnalyticsLoader), v), "");
    assert.equal(html(createElement(AdsenseLoader), v), "");
  }
});

test("el banner propio tiene su interruptor (constante) y está encendido hoy", () => {
  assert.equal(BANNER_PROPIO_ACTIVO, true);
  const banner = fs.readFileSync(path.join(process.cwd(), "components", "consent", "consent-banner.tsx"), "utf8");
  assert.match(banner, /BANNER_PROPIO_ACTIVO/);
  assert.match(banner, /if \(!BANNER_PROPIO_ACTIVO\) return null/);
});

test("la fuente Metropolis carga como máximo 3 pesos con font-display: swap", () => {
  const layout = fs.readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf8");
  assert.equal((layout.match(/metropolis-latin-\d+-normal\.woff2/g) ?? []).length, 3);
  assert.match(layout, /display: "swap"/);
});
