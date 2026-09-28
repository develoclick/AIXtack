import { ImageResponse } from "next/og";
import { categoriasActivas, getCategoriaActiva } from "@/content/catalogo";
import { siteName } from "@/lib/site";

// Imagen Open Graph (1200×630) propia de cada categoría ACTIVA, generada al compilar. Una categoría inactiva no tiene imagen (404).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return categoriasActivas().map((c) => ({ categoria: c.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const c = getCategoriaActiva(categoria);
  if (!c) return new Response("No encontrada", { status: 404 });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a2540", color: "#ffffff", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, color: "#00ba88", fontWeight: 700 }}>{siteName}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#a9bbd0", marginBottom: 20 }}>{c.nombre}</div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>{c.h1}</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a9bbd0" }}>Gratis · sin registro · en español</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
