import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCategory } from "@/content/categorias";
import { guidePath } from "@/lib/guides/constants";
import { mediaExists } from "@/lib/guides/media";
import type { GuideSummary } from "@/lib/guides/types";
import { ui } from "./ui";

/** Imagen hero de la guía por convención de carpeta; solo si el archivo existe (nada se inventa). */
function heroSrcOf(guide: GuideSummary): string | null {
  const src = `/images/guias/${guide.category}/${guide.slug}/hero.webp`;
  return mediaExists(src) ? src : null;
}

type Variant = "card" | "row" | "feature";

/**
 * Guía en listados. Tres composiciones: `card` (relacionadas), `row` (filas editoriales de la
 * biblioteca y los hubs) y `feature` (pieza destacada, oscura, con la imagen hero si existe).
 */
export function GuideCard({
  guide,
  showCategory = true,
  variant = "card",
  index,
}: {
  guide: GuideSummary;
  showCategory?: boolean;
  variant?: Variant;
  /** Número de orden que se muestra en las filas. */
  index?: number;
}) {
  const category = getCategory(guide.category);
  const hero = heroSrcOf(guide);
  const label = showCategory ? (category?.name ?? guide.category) : guide.difficulty;
  const meta = `${guide.readingMinutes} min de lectura${showCategory ? ` · ${guide.difficulty}` : ""}`;

  if (variant === "row") {
    return (
      <Link
        href={guidePath(guide)}
        className="guide-focus group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-4 border-b py-5 transition-colors first:border-t hover:bg-muted/40 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-6 sm:px-2 sm:py-6"
      >
        <span className="pt-1.5 font-mono text-xs tabular-nums text-muted-foreground">{index !== undefined ? String(index).padStart(2, "0") : "—"}</span>
        <div className="min-w-0">
          <p className={ui.eyebrow}>{label}</p>
          <h3 className="mt-1.5 text-balance text-lg font-semibold leading-snug tracking-tight text-guide-ink transition-colors group-hover:text-brand sm:text-xl">
            {guide.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{guide.description}</p>
          <p className="mt-2 text-xs text-muted-foreground sm:hidden">{meta}</p>
        </div>
        <span className="hidden items-center gap-3 pt-1.5 text-xs text-muted-foreground sm:flex">
          <span className="whitespace-nowrap">{meta}</span>
          <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand motion-reduce:transition-none" aria-hidden />
        </span>
      </Link>
    );
  }

  if (variant === "feature") {
    // Contenedor: en un hueco ancho (guías relacionadas) la imagen va al lado del texto; en uno estrecho, encima.
    return (
      <div className="@container h-full">
        <Link
          href={guidePath(guide)}
          className="guide-focus group dark relative isolate flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[2rem] bg-ink text-foreground @3xl:flex-row"
        >
          <span aria-hidden className="glow-brand absolute -right-24 -top-24 -z-10 size-[26rem] opacity-70 transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none" />
          <span aria-hidden className="glow-cool absolute -bottom-32 -left-16 -z-10 size-[22rem] opacity-60" />
          {hero && (
            
            <span className="relative m-3 block aspect-video shrink-0 overflow-hidden rounded-[1.4rem] ring-1 ring-white/10 @3xl:aspect-auto @3xl:min-h-72 @3xl:w-[46%]">
              <Image
                src={hero}
                alt=""
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </span>
          )}
          <div className="flex flex-1 flex-col justify-end p-7 pt-6 sm:p-9 sm:pt-7 @3xl:pl-6">
            <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-brand">{label}</p>
            <h3 className="mt-3 max-w-xl text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl">{guide.title}</h3>
            <p className="mt-4 line-clamp-3 max-w-lg text-[0.97rem] leading-relaxed text-foreground/75">{guide.description}</p>
            <p className="mt-7 flex items-center justify-between gap-3 border-t border-white/15 pt-4 text-xs text-foreground/70">
              <span>{meta}</span>
              <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
            </p>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={guidePath(guide)}
      className="guide-focus guide-lift group flex h-full flex-col overflow-hidden rounded-2xl border bg-background hover:border-brand/50"
    >
      {hero && (
        <span className="relative block aspect-video w-full overflow-hidden border-b bg-muted">
          <Image src={hero} alt="" fill sizes="(min-width: 640px) 26rem, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
        </span>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className={ui.eyebrow}>{label}</p>
          {guide.status === "draft" && <span className={ui.tagNeutral}>Borrador</span>}
        </div>
        <h3 className="mt-2.5 text-balance text-[1.05rem] font-semibold leading-snug tracking-tight text-guide-ink group-hover:text-brand">{guide.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{guide.description}</p>
        <p className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
          <span>{meta}</span>
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
        </p>
      </div>
    </Link>
  );
}
