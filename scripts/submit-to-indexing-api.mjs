#!/usr/bin/env node
/**
 * Envía URLs a la Google Indexing API para acelerar el redescubrimiento
 * (horas en vez de días/semanas de espera al rastreo orgánico de Googlebot).
 *
 * Requiere una cuenta de servicio de Google Cloud con acceso a la Indexing
 * API — esto es una configuración que SOLO el propietario del proyecto de
 * Google Cloud / Search Console puede crear, no algo que pueda generarse
 * automáticamente. Pasos (una vez):
 *
 *   1. https://console.cloud.google.com → crear/seleccionar proyecto.
 *   2. Habilitar "Web Search Indexing API".
 *   3. IAM y administración → Cuentas de servicio → crear una, generar
 *      una clave JSON y descargarla.
 *   4. En Search Console (search.google.com/search-console), añadir el
 *      email de la cuenta de servicio (algo@proyecto.iam.gserviceaccount.com)
 *      como propietario de la propiedad guiapromptsia.com.
 *   5. Guardar el JSON descargado como `google-service-account.json` en la
 *      raíz del proyecto (ya está en .gitignore — NUNCA lo subas al repo)
 *      o exportar su contenido completo en la variable de entorno
 *      GOOGLE_SERVICE_ACCOUNT_JSON.
 *
 * Uso:
 *   node scripts/submit-to-indexing-api.mjs                     → envía hasta 180 URLs, priorizando lo nuevo
 *   node scripts/submit-to-indexing-api.mjs --url=/blog/mi-post → envía una sola URL (ignora caché y prioridad)
 *   node scripts/submit-to-indexing-api.mjs --limit=50          → limita el nº de URLs por ejecución
 *   node scripts/submit-to-indexing-api.mjs --force             → ignora la caché de 14 días y reenvía igualmente
 *
 * Cuota por defecto de la API: 200 solicitudes/día por proyecto de Google
 * Cloud. El límite por defecto de este script (180) deja margen para no
 * agotarla en una sola ejecución si hay otros procesos usando la misma cuota.
 *
 * Prioridad de envío: dentro del límite por ejecución, las URLs se ordenan
 * primero por "sección nueva" (/alternativas/, /comparativas, posts de
 * comparativa) y, dentro de cada grupo, por fecha de última modificación
 * (más reciente primero) según el <lastmod> del sitemap. Las páginas
 * estáticas ya indexadas (legal, FAQ, etc.) quedan al final.
 *
 * Caché: cada envío exitoso se registra en .indexing-cache.json (no se
 * versiona) con la fecha de envío. Una URL ya notificada en los últimos 14
 * días se salta automáticamente, para no gastar cuota en repetir avisos
 * sobre páginas que Google ya procesó recientemente.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createSign } from "node:crypto";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://guiapromptsia.com").replace(/\/$/, "");
const SCOPE = "https://www.googleapis.com/auth/indexing";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const PUBLISH_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const DEFAULT_LIMIT = 180;
const CACHE_TTL_DAYS = 14;
const CACHE_PATH = new URL("../.indexing-cache.json", import.meta.url);

// Prefijos/patrones de secciones "nuevas" que deben priorizarse frente al
// resto del sitemap. Se evalúan en orden — el primero que haga match define
// el tier (0 = máxima prioridad). Amplía esta lista cuando lances una
// sección nueva que quieras indexar rápido.
const PRIORITY_PATTERNS = [/\/alternativas\//, /\/comparativas(\/|$)/, /\/blog\/[^/]*-vs-[^/]*/];

function loadServiceAccount() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
  const localPath = new URL("../google-service-account.json", import.meta.url);
  if (existsSync(localPath)) {
    return JSON.parse(readFileSync(localPath, "utf-8"));
  }
  return null;
}

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function buildSignedJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: serviceAccount.client_email,
    scope: SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${unsigned}.${signature}`;
}

async function getAccessToken(serviceAccount) {
  const assertion = buildSignedJwt(serviceAccount);
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`No se pudo obtener el token OAuth2: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

/** @returns {{ ok: boolean, quotaExceeded: boolean }} */
async function submitUrl(accessToken, url, type = "URL_UPDATED") {
  const res = await fetch(PUBLISH_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, type }),
  });
  const ok = res.ok;
  console.log(`[indexing] ${ok ? "OK " : "ERR"} ${res.status} — ${url}`);
  if (!ok) console.log("           ", (await res.text()).slice(0, 200));
  return { ok, quotaExceeded: res.status === 429 };
}

/** Lee el sitemap y devuelve [{ url, lastmod: Date|null }]. */
async function fetchSitemapEntries() {
  const res = await fetch(`${siteUrl}/sitemap.xml`);
  if (!res.ok) throw new Error(`No se pudo leer ${siteUrl}/sitemap.xml (${res.status})`);
  const xml = await res.text();
  const entries = [];
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block[1].match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc) continue;
    const lastmodRaw = block[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    const lastmod = lastmodRaw ? new Date(lastmodRaw) : null;
    entries.push({ url: loc, lastmod: lastmod && !Number.isNaN(lastmod.getTime()) ? lastmod : null });
  }
  return entries;
}

function priorityTier(url) {
  const index = PRIORITY_PATTERNS.findIndex((pattern) => pattern.test(url));
  return index === -1 ? PRIORITY_PATTERNS.length : index;
}

/** Ordena por tier de prioridad asc., y dentro de cada tier por lastmod desc. */
function sortByPriority(entries) {
  return [...entries].sort((a, b) => {
    const tierDiff = priorityTier(a.url) - priorityTier(b.url);
    if (tierDiff !== 0) return tierDiff;
    const timeA = a.lastmod ? a.lastmod.getTime() : 0;
    const timeB = b.lastmod ? b.lastmod.getTime() : 0;
    return timeB - timeA;
  });
}

function loadCache() {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    console.warn("[cache] .indexing-cache.json ilegible, se empieza de cero.");
    return {};
  }
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf-8");
}

function wasSubmittedRecently(cache, url) {
  const submittedAt = cache[url];
  if (!submittedAt) return false;
  const ageMs = Date.now() - new Date(submittedAt).getTime();
  return ageMs < CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
}

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, value] = arg.replace(/^--/, "").split("=");
      return [key, value ?? true];
    })
  );
  return {
    url: args.url,
    limit: args.limit ? Number(args.limit) : DEFAULT_LIMIT,
    force: Boolean(args.force),
  };
}

async function main() {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.error(
      "No se encontró una cuenta de servicio de Google. Configura GOOGLE_SERVICE_ACCOUNT_JSON o " +
        "guarda google-service-account.json en la raíz del proyecto. Ver el comentario al inicio de este " +
        "script para los pasos de configuración (requiere acceso a Google Cloud Console y Search Console)."
    );
    process.exit(1);
  }

  const { url, limit, force } = parseArgs();
  const accessToken = await getAccessToken(serviceAccount);
  const cache = loadCache();

  let targets;
  if (url) {
    // Envío puntual de una sola URL: se hace siempre, ignorando caché y orden.
    targets = [url.startsWith("http") ? url : `${siteUrl}${url}`];
  } else {
    const entries = await fetchSitemapEntries();
    const prioritized = sortByPriority(entries);
    const pending = force ? prioritized : prioritized.filter((e) => !wasSubmittedRecently(cache, e.url));
    const skipped = prioritized.length - pending.length;
    if (skipped > 0) {
      console.log(`[cache] ${skipped} URL(s) omitidas — ya notificadas en los últimos ${CACHE_TTL_DAYS} días.`);
    }
    targets = pending.slice(0, limit).map((e) => e.url);
  }

  console.log(`Enviando ${targets.length} URL(s) a la Indexing API (límite: ${limit})...`);

  let okCount = 0;
  let quotaHit = false;
  try {
    for (const target of targets) {
      const { ok, quotaExceeded } = await submitUrl(accessToken, target);
      if (ok) {
        okCount++;
        cache[target] = new Date().toISOString();
      }
      if (quotaExceeded) {
        quotaHit = true;
        console.error("[indexing] Cuota diaria agotada (429) — deteniendo el resto de esta ejecución.");
        break;
      }
      // Espaciar las peticiones para no saturar la cuota en ráfaga.
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  } finally {
    // Se guarda siempre, incluso si el bucle se corta por 429 o por un error,
    // para no perder el registro de lo que sí se notificó con éxito.
    saveCache(cache);
  }

  console.log(`Completado: ${okCount}/${targets.length} URLs notificadas correctamente.`);
  if (quotaHit) {
    console.log("Vuelve a ejecutar el script mañana — la caché ya recuerda lo enviado hoy.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
