import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Nivel del encabezado: h1 en páginas cuyo título principal es este bloque. */
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-px w-6 bg-brand/50" aria-hidden />
          {eyebrow}
        </span>
      )}
      <Tag className="text-display-md text-balance">
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
