/**
 * Anuncios: el bloque reserva alto y en desarrollo es un recuadro gris (sin cargar AdSense); Consent Mode v2 arranca todo
 * en «denied»; ninguna página institucional ni de error incluye anuncios; el archivo ads.txt sale del ID de editor.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdSlot } from "../components/ads/ad-slot";
import { SCRIPT_CONSENT_MODE } from "../components/consent/consent-mode";
import { ConsentContext, type ConsentContextValue } from "../providers/consent-provider";

const raiz = process.cwd();
const leer = (...p: string[]) => fs.readFileSync(path.join(raiz, ...p), "utf8");
const valor: ConsentContextValue = { ads: "granted", analytics: "granted", decided: true, acceptAll: () => {}, rejectAll: () => {} };
const html = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(ConsentContext.Provider, { value: valor }, el));

test("en desarrollo el bloque de anuncio es un marcador gris con alto reservado y no carga nada de Google", () => {
  const h = html(createElement(AdSlot, { slot: "123", minHeight: 250 }));
  assert.match(h, /espacio reservado/i);
  assert.match(h, /min-height:250px/);
  assert.doesNotMatch(h, /adsbygoogle|googlesyndication|data-ad-client/);
});

test("Consent Mode v2: anuncios, datos de usuario, personalización y analítica arrancan en «denied»", () => {
  for (const clave of ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"]) assert.match(SCRIPT_CONSENT_MODE, new RegExp(`${clave}: 'denied'`));
  assert.match(SCRIPT_CONSENT_MODE, /gtag\('consent', 'default'/);
  assert.match(SCRIPT_CONSENT_MODE, /gtag\('consent', 'update'/);
  assert.match(leer("providers", "consent-provider.tsx"), /gtag\?\.\("consent", "update"/);
});

test("el script de AdSense solo se carga en producción, con ID de editor y con consentimiento, una vez y de forma asíncrona", () => {
  const t = leer("components", "ads", "adsense-loader.tsx");
  assert.match(t, /NODE_ENV !== "production"/);
  assert.match(t, /ads !== "granted"/);
  assert.match(t, /async/);
  assert.equal((leer("app", "layout.tsx").match(/<AdsenseLoader/g) ?? []).length, 1);
});

test("ninguna página institucional, de error o 404 usa anuncios; el componente Anuncio no está pegado a botones de la herramienta", () => {
  for (const f of ["app/(site)/sobre-nosotros/page.tsx", "app/(site)/contacto/page.tsx", "app/(site)/politica-de-privacidad/page.tsx", "app/(site)/politica-de-cookies/page.tsx", "app/(site)/terminos-y-condiciones/page.tsx", "app/not-found.tsx", "app/error.tsx", "app/global-error.tsx", "components/shared/legal-page.tsx"]) {
    assert.doesNotMatch(leer(f), /<Anuncio|<AdSlot/, f);
  }
  const cv = leer("components", "prompts", "cv", "pagina-cv.tsx");
  const anuncios = cv.match(/<Anuncio posicion="(\w+)"/g) ?? [];
  assert.equal(anuncios.length, 3, "3 anuncios: después de la introducción, a mitad y antes del FAQ");
  // Los componentes de la herramienta (formulario, prompt, botones de copiar y descargar) no contienen anuncios.
  for (const f of ["formulario-cv.tsx", "panel-prompt.tsx", "convertir-word.tsx", "generador-cv.tsx"]) assert.doesNotMatch(leer("components", "prompts", "cv", f), /Anuncio|AdSlot/, f);
  // Los anuncios van después de la herramienta: dentro de la guía, nunca antes de #herramienta.
  assert.ok(cv.indexOf("<GeneradorCv") < cv.indexOf("<Anuncio"));
});

test("«Publicidad» etiqueta cada bloque, sin frases que inciten a hacer clic", () => {
  assert.match(leer("components", "ads", "ad-slot.tsx"), /Publicidad/);
  for (const dir of ["app", "components", "content"]) {
    const revisar = (d: string): void => {
      for (const e of fs.readdirSync(path.join(raiz, d), { withFileTypes: true })) {
        const ruta = path.join(d, e.name);
        if (e.isDirectory()) revisar(ruta);
        else if (/\.(tsx?|md)$/.test(e.name)) assert.doesNotMatch(leer(ruta), /haz clic en (los )?anuncios|click (on )?the ads/i, ruta);
      }
    };
    revisar(dir);
  }
});
