"use client";

import { useConsent } from "@/hooks/use-consent";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function ConsentBanner() {
  const { decided, acceptAll, rejectAll } = useConsent();

  return (
    <AnimatePresence>
      {!decided && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-50 p-4"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border bg-card/95 p-5 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Usamos cookies propias y de terceros para analizar el tráfico y mostrar publicidad
              relevante. Puedes leer más en nuestra{" "}
              <Link href="/privacidad" className="underline underline-offset-2 hover:text-foreground">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
