# Cookies y consentimiento: cómo funciona hoy

## Qué pasa al entrar
1. `ConsentProvider` (providers/consent-provider.tsx) arranca con `ads: denied`, `analytics: denied`, `decided: false` y solo lee de `localStorage` la decisión anterior (clave `aixtack:consent`).
2. Si no hay decisión, `ConsentBanner` (components/consent/consent-banner.tsx, montado en `app/(site)/layout.tsx`) aparece abajo con dos botones: **Rechazar** y **Aceptar todo**. No hay botón de «configurar»: se acepta o se rechaza todo a la vez.
3. **Antes de aceptar no se carga ningún script de terceros**: `AnalyticsLoader` (Google Analytics, `G-H25PR3Y1LL`) solo renderiza si `analytics === "granted"`, y `AdsenseLoader` solo si `ads === "granted"` **y** existe `NEXT_PUBLIC_ADSENSE_CLIENT_ID`. Un test lo comprueba (lib/consent.test.ts). No se usa Consent Mode: no hay ningún `gtag` por defecto.
4. «Aceptar todo» carga Google Analytics (y el script global de AdSense si la variable está definida); «Rechazar» no carga nada. La decisión se guarda en el navegador (`localStorage`) y el banner no vuelve a aparecer; se cambia borrando los datos del sitio.

## Qué NO hace hoy
- No hay ningún anuncio en las páginas: los dos `EspacioAnuncio` están vacíos y ocultos (`empty:hidden`, sin altura ni márgenes, CLS 0).
- No hay CMP (mensaje de consentimiento certificado de Google) ni Consent Mode v2. Si algún día se muestran anuncios personalizados en el EEE/Reino Unido, Google exige una CMP certificada.
- El perfil «Mi negocio» usa otra clave de `localStorage` y no es una cookie ni sale del navegador.

## Interruptor para la CMP de Google
`lib/consent-config.ts` → `BANNER_PROPIO_ACTIVO` (hoy `true`). Ponlo en `false` cuando actives el mensaje de «Privacidad y mensajes» de AdSense, para que no haya dos avisos a la vez. Al apagarlo:
- El banner propio desaparece.
- `AnalyticsLoader` y `AdsenseLoader` **dejan de cargar** (esperan un «granted» que ya nadie da). Hay que decidir entonces cómo se carga el script de AdSense con la CMP (la CMP gestiona el consentimiento) y cómo se sigue midiendo con Analytics. No se ha añadido nada de eso: no hay código de AdSense en las páginas.
- Hay que actualizar `/politica-de-cookies` y `/politica-de-privacidad`, que hoy describen el banner propio.
