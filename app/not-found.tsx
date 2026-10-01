import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Next.js usa este archivo tanto para rutas llamadas con notFound() dentro de un segmento como para CUALQUIER URL que no
// coincida con ninguna ruta (ver node_modules/next/dist/docs/.../not-found.md: "the root app/not-found.js... handle[s] any
// unmatched URLs for your whole application"). Ese 2º caso es el más común en la práctica (enlaces rotos, typos) y NO pasa
// por app/(site)/layout.tsx, así que este archivo arma el menú y el pie a mano para no dejar al visitante sin salida.
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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
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
      </main>
      <Footer />
    </div>
  );
}
