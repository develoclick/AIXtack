#!/usr/bin/env node
/**
 * Notifica a los motores de búsqueda que el sitemap ha cambiado, tras cada
 * deploy. Solo Bing sigue soportando el endpoint clásico de ping — Google
 * lo desactivó en junio de 2023 y ahora exige pasar por Search Console
 * (manual) o por la Indexing API autenticada (ver submit-to-indexing-api.mjs).
 *
 * Uso: node scripts/ping-sitemap.mjs
 * Recomendado como parte del pipeline de deploy, después del build.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://guiapromptsia.com";
const sitemapUrl = `${siteUrl.replace(/\/$/, "")}/sitemap.xml`;

async function pingBing() {
  const url = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  const res = await fetch(url);
  console.log(`[bing] ${res.status} ${res.statusText} — ${sitemapUrl}`);
  return res.ok;
}

async function main() {
  console.log(`Notificando sitemap: ${sitemapUrl}`);
  try {
    await pingBing();
  } catch (error) {
    console.error("[bing] error al hacer ping:", error.message);
  }
  console.log(
    "Nota: Google ya no acepta ping directo de sitemap. Envía la URL una vez desde Search Console " +
      "(Sitemaps → Añadir sitemap) o usa `npm run submit:indexing` para notificar URLs individuales vía API."
  );
}

main();
