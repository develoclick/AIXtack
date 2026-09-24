"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/hooks/use-consent";
import { BANNER_PROPIO_ACTIVO } from "@/lib/consent-config";

/**
 * Banner de cookies propio. La entrada es una animación CSS (clase `consent-entrada`, sin JavaScript de animación):
 * antes usaba framer-motion, que añadía decenas de KB a todas las páginas solo para mover este aviso.
 */
export function ConsentBanner() {
  const { decided, acceptAll, rejectAll } = useConsent();

  // Interruptor en lib/consent-config.ts: se apaga cuando se activa la CMP de Google, para no mostrar dos avisos.
  if (!BANNER_PROPIO_ACTIVO) return null;
  if (decided) return null;

  return (
    <div role="region" aria-label="Aviso de cookies" className="consent-entrada fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border bg-card/95 p-5 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Usamos cookies para medir el tráfico del sitio y, más adelante, mostrar publicidad. Solo se activan si aceptas. Más información en la{" "}
          <Link href="/politica-de-cookies" className="underline underline-offset-2 hover:text-foreground">
            política de cookies
          </Link>{" "}
          y la{" "}
          <Link href="/politica-de-privacidad" className="underline underline-offset-2 hover:text-foreground">
            política de privacidad
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={rejectAll}>
            Rechazar
          </Button>
          <Button size="sm" onClick={acceptAll}>
            Aceptar todo
          </Button>
        </div>
      </div>
    </div>
  );
}
