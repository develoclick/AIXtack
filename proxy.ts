import { NextResponse, type NextRequest } from "next/server";
import tagsJson from "@/content/tags.json";

const validTagSlugs = new Set((tagsJson as { slug: string }[]).map((tag) => tag.slug));

// /etiqueta/[slug] usa searchParams (paginación), lo que fuerza un render
// dinámico con streaming: si el slug no existe, notFound() no puede fijar el
// status HTTP a 404 porque las cabeceras ya se enviaron como 200 (ver
// node_modules/next/dist/docs/.../loading.md, sección "Status Codes").
// Se valida aquí, antes del streaming, para devolver un 404 real.
export const config = {
  matcher: "/etiqueta/:slug",
};

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.replace(/^\/etiqueta\//, "");
  if (!validTagSlugs.has(slug)) {
    return new NextResponse(
      "<!doctype html><meta name=\"robots\" content=\"noindex\"><title>Página no encontrada</title><p>Página no encontrada. <a href=\"/\">Volver al inicio</a>.",
      { status: 404, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }
}
