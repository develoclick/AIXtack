# Checklist de lanzamiento (antes de postular a AdSense)

- [ ] Quitar `MOSTRAR_BORRADORES` en Vercel antes de postular a AdSense (con la variable, los listados enseñan borradores).
- [x] `/ads.txt` (ruta `app/ads.txt/route.ts`) responde 200, texto plano y `google.com, pub-1950156439970490, DIRECT, f08c47fec0942fa0`; el ID es del dueño del sitio y no se cambia (verificado en producción el 2026-09-24 y con `lib/ads-txt.test.ts`). **Ojo:** si en Vercel se define `NEXT_PUBLIC_ADSENSE_CLIENT_ID` con otro ID, esa variable manda sobre el ID de respaldo; no la definas o pon el mismo ID. No crear además `public/ads.txt` (chocaría con la ruta).
- [ ] Decidir el banner de cookies: si se activa la CMP de Google («Privacidad y mensajes»), poner `BANNER_PROPIO_ACTIVO = false` en `lib/consent-config.ts` y actualizar las políticas de cookies y privacidad (ver docs/consentimiento-cookies.md).
- [ ] Publicar herramientas solo con `npm run publicar` (prueba real, captura, IA y fecha) y comprobar que `/herramientas` y las áreas dejan de ser noindex solo cuando hay al menos una publicada.
- [ ] Unas 19 herramientas o más en el formato nuevo, todas con prueba real (referencia práctica, no una regla oficial).
- [x] Biografía de Nicolas escrita y visible en «Sobre nosotros» (y bajo «Probado por…» en cada herramienta).
- [ ] Sitio estable unas semanas y sin enlaces rotos (`npm run sitio:verificar`), y `npm run qa` en verde.
- [ ] Revisar las políticas vigentes del programa en la ayuda oficial de AdSense (support.google.com/adsense) antes de postular.
- [ ] Enviar el sitemap en Search Console y revisar la cobertura una semana después.
