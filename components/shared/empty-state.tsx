import Image from "next/image";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  title = "No hay resultados",
  description = "Prueba a cambiar los filtros o vuelve más tarde.",
  icon: Icon,
}: {
  title?: string;
  description?: string;
  /** Icono de lucide-react opcional para casos puntuales; por defecto se usa la ilustración compartida. */
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
      {Icon ? (
        <Icon className="size-8 text-muted-foreground" />
      ) : (
        <Image src="/images/illustrations/empty-state.svg" alt="" width={112} height={112} className="size-20" />
      )}
      <p className="font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
