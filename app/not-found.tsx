import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-brand">Error 404</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Página no encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        Puede que el enlace esté roto o que la página se haya movido. Vuelve al inicio para seguir
        explorando.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-4" })}>
        Volver al inicio
      </Link>
    </div>
  );
}
