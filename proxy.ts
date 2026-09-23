import { NextResponse } from "next/server";

/**
 * Modelo anterior del sitio (directorio de herramientas, prompts sueltos, blog,
 * categorías, alternativas, comparativas, noticias, tutoriales, etiquetas y afiliados).
 * Esas URLs ya no existen y no tienen un equivalente: responden 410 (Gone) para que
 * Google las retire del índice más rápido que con un 404. Las que SÍ tienen una herramienta
 * equivalente se redirigen antes con 301 (content/redirects.ts → next.config.ts), y como
 * las redirecciones de next.config se evalúan antes que este proxy, esas nunca llegan aquí.
 *
 * `matcher` debe ser una lista literal (Next la analiza en el build). Ninguna entrada
 * puede coincidir con una ruta vigente: lib/redirects.test.ts lo comprueba.
 */
export const config = {
  matcher: [
    "/herramientas-ia/:path*",
    "/prompts/:path*",
    "/blog/:path*",
    "/categoria/:path*",
    "/alternativas/:path*",
    "/comparativas/:path*",
    "/noticias/:path*",
    "/tutoriales/:path*",
    "/etiqueta/:path*",
    "/go/:path*",
    "/buscar/:path*",
    "/faq/:path*",
    "/aviso-afiliados/:path*",
    "/creditos-de-imagenes/:path*",
    "/mapa-del-sitio/:path*",
    "/feed.xml",
  ],
};

const BODY = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Contenido retirado</title>
<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.25rem;line-height:1.6;color:#111}a{color:#2563eb}</style>
</head>
<body>
<h1>Este contenido ya no existe</h1>
<p>Esta página formaba parte de una versión anterior del sitio y fue retirada de forma definitiva.</p>
<p><a href="/herramientas">Ver las herramientas de IA para tu negocio</a> · <a href="/">Ir al inicio</a></p>
</body>
</html>`;

export function proxy() {
  return new NextResponse(BODY, {
    status: 410,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
      "cache-control": "public, max-age=3600",
    },
  });
}
