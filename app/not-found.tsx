import Link from "next/link";
import type { Metadata } from "next";
import { RUTA_CV } from "@/content/prompts";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscas no existe o se ha movido.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Error 404</p>
      <h1 className="text-4xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="max-w-md text-muted-foreground">Puede que el enlace esté roto o que la página se haya movido. Vuelve al inicio para seguir explorando.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primario">
          Volver al inicio
        </Link>
        <Link href={RUTA_CV} className="btn btn-secundario">
          Crear mi CV
        </Link>
      </div>
    </div>
  );
}
