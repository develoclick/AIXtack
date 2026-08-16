import Image from "next/image";
import { cn } from "@/lib/utils";

function HeadingText({
  eyebrow,
  title,
  description,
  align,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align: "left" | "center";
}) {
  return (
    <>
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-px w-6 bg-brand/50" aria-hidden />
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
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
    </>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  image,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Ilustración contextual opcional — solo se usa en secciones donde aporta valor real. */
  image?: { src: string; alt: string };
}) {
  if (!image) {
    return (
      <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
        <HeadingText eyebrow={eyebrow} title={title} description={description} align={align} />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col-reverse items-center gap-8 sm:flex-row sm:justify-between", className)}>
      <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center")}>
        <HeadingText eyebrow={eyebrow} title={title} description={description} align={align} />
      </div>
      <Image
        src={image.src}
        alt={image.alt}
        width={112}
        height={112}
        className="size-24 shrink-0 sm:size-28"
      />
    </div>
  );
}
