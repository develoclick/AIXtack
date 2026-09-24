/**
 * Interruptor del banner de cookies PROPIO (components/consent/consent-banner.tsx).
 *
 * `true` (hoy): el sitio muestra su banner («Rechazar» / «Aceptar todo»). Antes de aceptar no se carga NINGÚN script de
 * terceros: ni Google Analytics ni AdSense (ver docs/consentimiento-cookies.md).
 *
 * Pon `false` el día que actives en AdSense el mensaje de consentimiento de Google («Privacidad y mensajes» → CMP), para que
 * no haya dos avisos a la vez. Ojo: con `false` el banner desaparece y este sitio ya no recibe consentimiento propio, así que
 * AnalyticsLoader y AdsenseLoader (que esperan «granted») no cargarán nada por sí solos: al activar la CMP hay que decidir
 * cómo se carga el script de AdSense y actualizar la política de cookies y la de privacidad (checklist de lanzamiento).
 */
export const BANNER_PROPIO_ACTIVO = true;
