import { BarChart3, Briefcase, Megaphone, Plane, Rocket, Wallet, type LucideIcon } from "lucide-react";
import type { IconoCategoria } from "@/content/catalogo";

const ICONOS: Record<IconoCategoria, LucideIcon> = {
  briefcase: Briefcase,
  plane: Plane,
  rocket: Rocket,
  chart: BarChart3,
  wallet: Wallet,
  megaphone: Megaphone,
};

export function IconoDeCategoria({ icono, className }: { icono: IconoCategoria; className?: string }) {
  const Icono = ICONOS[icono];
  return <Icono aria-hidden className={className} />;
}
