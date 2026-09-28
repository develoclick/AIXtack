import { ImageResponse } from "next/og";
import { getCategoria, herramientasPublicadas } from "@/content/catalogo";
import { siteName } from "@/lib/site";

// Imagen Open Graph (1200×630) propia de cada herramienta PUBLICADA, generada al compilar (404 si está pendiente).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return herramientasPublicadas().map((h) => ({ categoria: h.categoria, slug: h.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ categoria: string; slug: string }> }) {
  const { categoria, slug } = await params;
  const h = herramientasPublicadas(categoria).find((x) => x.slug === slug);
  if (!h) return new Response("No encontrada", { status: 404 });
  const c = getCategoria(categoria);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#081622", color: "#ffffff", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 34, color: "#00c492", fontWeight: 700 }}>{siteName}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#a9bbd0", marginBottom: 20 }}>{c?.nombre}</div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>{h.pagina.h1}</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a9bbd0" }}>Herramienta gratis · sin registro · en español</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
