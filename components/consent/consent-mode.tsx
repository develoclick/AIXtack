/**
 * Google Consent Mode v2: antes de cargar cualquier etiqueta de Google, todo el almacenamiento (anuncios, datos de usuario para
 * anuncios, personalización de anuncios y analítica) queda en «denied». Si la persona ya había aceptado en una visita anterior,
 * se actualiza a «granted» en el mismo instante. El banner de cookies (providers/consent-provider.tsx) envía el «update» cuando
 * la persona decide. Este script no carga nada de terceros: solo prepara `dataLayer` y `gtag`.
 *
 * Si algún día se usa una CMP certificada por Google, se apaga BANNER_PROPIO_ACTIVO (lib/consent-config.ts) y la CMP se
 * encarga de estas mismas señales.
 */
export const SCRIPT_CONSENT_MODE = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });
try {
  var c = JSON.parse(localStorage.getItem('aixtack:consent') || 'null');
  if (c && c.decided) {
    gtag('consent', 'update', {
      ad_storage: c.ads === 'granted' ? 'granted' : 'denied',
      ad_user_data: c.ads === 'granted' ? 'granted' : 'denied',
      ad_personalization: c.ads === 'granted' ? 'granted' : 'denied',
      analytics_storage: c.analytics === 'granted' ? 'granted' : 'denied'
    });
  }
} catch (e) {}
`;

export function ConsentMode() {
  // Script en línea, síncrono y sin cargar nada externo: se ejecuta antes que cualquier etiqueta de Google.
  return <script id="consent-mode-v2" dangerouslySetInnerHTML={{ __html: SCRIPT_CONSENT_MODE }} />;
}
