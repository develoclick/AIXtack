import Link from "next/link";
import type { Metadata } from "next";

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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Error 404</p>
      <h1 className="text-4xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="max-w-md text-muted-foreground">Puede que el enlace esté roto o que la página se haya movido. Vuelve al inicio o explora las categorías disponibles.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primario">
          Volver al inicio
        </Link>
        <Link href="/#categorias" className="btn btn-secundario">
          Ver categorías
        </Link>
      </div>
    </div>
  );
}
