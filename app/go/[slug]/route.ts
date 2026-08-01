import { NextResponse, type NextRequest } from "next/server";
import { getToolBySlug } from "@/lib/content/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Enlace de afiliado cloaqueado: resuelve el slug contra el contenido
 * estático y redirige a la web real de la herramienta con parámetros UTM.
 * Sin base de datos ni registro de clics — si en el futuro se necesita
 * analítica de clics, se añade con un evento de cliente (p. ej. gtag)
 * antes del salto, no aquí.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    return NextResponse.redirect(new URL("/herramientas-ia", siteUrl));
  }

  const url = new URL(tool.websiteUrl);
  url.searchParams.set("utm_source", "aixtack");
  url.searchParams.set("utm_medium", "affiliate");

  return NextResponse.redirect(url.toString(), { status: 302 });
}
