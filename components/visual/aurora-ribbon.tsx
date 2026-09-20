import { cn } from "@/lib/utils";

/** Cinta diagonal de degradado y brillos. Decorativa (`aria-hidden`); se coloca con `className`. */
export function AuroraRibbon({ className, soft = false }: { className?: string; soft?: boolean }) {
  return <div aria-hidden className={cn(soft ? "aurora-ribbon-soft" : "aurora-ribbon", className)} />;
}
