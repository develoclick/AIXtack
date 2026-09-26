import { BarChart3, Briefcase, Clapperboard, GraduationCap, PenLine, Rocket, Sprout, Stethoscope, type LucideIcon } from "lucide-react";
import type { IconoCategoria } from "@/content/categorias";

const ICONOS: Record<IconoCategoria, LucideIcon> = {
  briefcase: Briefcase,
  pen: PenLine,
  sprout: Sprout,
  clapperboard: Clapperboard,
  chart: BarChart3,
  graduation: GraduationCap,
  rocket: Rocket,
  stethoscope: Stethoscope,
};

export function IconoDeCategoria({ icono, className }: { icono: IconoCategoria; className?: string }) {
  const Icono = ICONOS[icono];
  return <Icono aria-hidden className={className} />;
}
