"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-brand">Error inesperado</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Algo ha ido mal</h1>
      <p className="max-w-md text-muted-foreground">
        Ha ocurrido un error al cargar esta página. Puedes intentarlo de nuevo o volver al inicio.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => reset()} className={buttonVariants({ variant: "outline" })}>
          Reintentar
        </button>
        <Link href="/" className={buttonVariants({})}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
