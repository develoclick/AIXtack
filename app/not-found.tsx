import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AuroraRibbon } from "@/components/visual/aurora-ribbon";
import { FloatingIllustration } from "@/components/visual/floating-illustration";
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
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden px-4 text-center">
      <div aria-hidden className="bg-lines absolute inset-0 -z-10 opacity-60" />
      <AuroraRibbon soft className="-left-[10%] bottom-[-6rem] -z-10 h-[22rem] w-[80%]" />
      <span aria-hidden className="numeral-outline absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none text-[clamp(9rem,34vw,28rem)] text-foreground/40">
        404
      </span>
      <FloatingIllustration
        file="error-404.png"
        width={900}
        height={900}
        speed={0.05}
        sizes="20rem"
        className="absolute bottom-10 right-[8%] w-64"
        purpose="Asistente con una lupa mirando un mapa doblado (ver docs/rediseno/PLAN.md, imagen-14)."
      />
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-brand">Error 404</p>
      <h1 className="text-display-md text-balance">Página no encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        Puede que el enlace esté roto o que la página se haya movido. Vuelve al inicio para seguir
        explorando.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-4 h-11 rounded-full px-6" })}>
        Volver al inicio
      </Link>
    </div>
  );
}
