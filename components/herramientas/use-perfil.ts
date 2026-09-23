"use client";

import { useMemo, useSyncExternalStore } from "react";
import { leerPerfilCrudo, parsearPerfil, suscribirPerfil } from "@/lib/herramientas/perfil";
import type { Perfil } from "@/lib/herramientas/tipos";

/**
 * El perfil «Mi negocio» guardado en este navegador. En el servidor (y en la primera pintura) vale `{}`:
 * así no hay desajustes de hidratación y todo funciona igual sin perfil.
 */
export function usePerfil(): Perfil {
  const crudo = useSyncExternalStore(suscribirPerfil, leerPerfilCrudo, () => null);
  return useMemo(() => parsearPerfil(crudo), [crudo]);
}
