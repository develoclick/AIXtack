import { NextResponse } from "next/server";

export async function GET() {
  // 1. Obtiene la variable de entorno o usa tu Publisher ID directo como respaldo
  const rawId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "pub-1950156439970490";

  // 2. Limpia el prefijo "ca-" o "ca-pub-" si viniere en la variable
  const publisherId = rawId.replace(/^ca-pub-|^ca-/, "");

  // 3. Formatea la línea oficial requerida por Google AdSense
  const body = `google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0`;

  // 4. Retorna la respuesta en formato texto plano
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}