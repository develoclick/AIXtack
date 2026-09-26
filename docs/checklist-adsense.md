# Checklist manual antes de pedir la revisión de AdSense

Nadie puede garantizar la aprobación: AdSense decide con sus propios criterios. Esto es lo que solo puedes hacer tú.

## 1. Datos reales
- [ ] **ID de AdSense.** En Vercel → Settings → Environment Variables agrega `NEXT_PUBLIC_ADSENSE_CLIENT_ID` (`ca-pub-…`) y vuelve a desplegar. `/ads.txt` ya usa el ID de editor que estaba en el proyecto (`pub-1950156439970490`): compruébalo en AdSense → Sitios → ads.txt.
- [ ] **Bloques de anuncios.** Crea 3 bloques «in-article» en AdSense y pon sus IDs en `NEXT_PUBLIC_ADSENSE_SLOT_INTRO`, `NEXT_PUBLIC_ADSENSE_SLOT_MEDIO` y `NEXT_PUBLIC_ADSENSE_SLOT_FINAL`.
- [ ] **Sobre nosotros** (`app/(site)/sobre-nosotros/page.tsx` y `content/autores.ts`): revisa que la biografía y los datos sean reales. Quité de la biografía la frase «Cada herramienta muestra una prueba real…» porque ya no era cierta.
- [ ] **Contacto:** comprueba que `contacto@guiapromptsia.com` recibe correo y lo lees.
- [ ] **Política de privacidad, cookies y términos:** léelas una vez; están escritas para una persona natural en Perú (Ley N.° 29733). Si un abogado puede revisarlas, mejor.
- [ ] **Logotipo** (`public/logo.png`): sigue siendo el de antes (verde); no coincide con el nuevo acento índigo. Cámbialo si quieres.

## 2. Google Search Console
- [ ] Verifica el dominio (`https://www.guiapromptsia.com`). El sitio ya trae la etiqueta de verificación en `app/layout.tsx`.
- [ ] Envía `https://www.guiapromptsia.com/sitemap.xml`.
- [ ] Solicita la indexación de la portada, la categoría, la herramienta y los 3 artículos (Inspección de URL).
- [ ] Revisa «Páginas» y «Experiencia» a las 2–4 semanas: las URL antiguas (`/herramientas`, `/marketing/…`) responden 404 o 410, es normal.

## 3. Antes de solicitar la revisión
- [ ] Publica tú mismo/a la herramienta con la IA real y anota qué salió: los prompts se prueban automáticamente, pero **no se han probado con una IA real**. Corrige el prompt si algo falla.
- [ ] Deja pasar un tiempo de tráfico y más contenido: hoy hay 5 páginas con contenido sustancial (1 herramienta, 3 artículos y la categoría). AdSense suele pedir más volumen y trayectoria del sitio.
- [ ] Comprueba en `https://www.guiapromptsia.com/ads.txt` que responde con tu línea.
- [ ] Activa AdSense → Privacidad y mensajes solo si vas a usar la CMP de Google: en ese caso pon `BANNER_PROPIO_ACTIVO = false` en `lib/consent-config.ts` para no mostrar dos avisos.
- [ ] Solicita la revisión en AdSense → Sitios.

## 4. Mantenimiento
- [ ] Cada vez que edites una página institucional, actualiza su fecha en `lib/site.ts`; en herramientas y artículos, la de `content/…`.
- [ ] Ejecuta `npm run auditoria` después de agregar contenido: cada página debe seguir en «ALTO VALOR».
