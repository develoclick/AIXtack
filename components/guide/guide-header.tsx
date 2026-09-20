import Link from "next/link";
import { ArrowDown, Clock, Gauge, PlayCircle, RefreshCw, User } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { AuroraRibbon } from "@/components/visual/aurora-ribbon";
import { getAuthor } from "@/content/autores";
import { getCategory } from "@/content/categorias";
import { guidePath } from "@/lib/guides/constants";
import { heroImageOf } from "@/lib/guides/images";
import { mediaExists } from "@/lib/guides/media";
import type { Guide } from "@/lib/guides/types";
import { formatDate } from "@/lib/utils/format";
import { ImageBlock } from "./image-block";
import { ui } from "./ui";

const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_IMAGE_SLOTS === "true";

/**
 * Cabecera de la guía: ruta de navegación, categoría, H1, subtítulo, ficha (autoría, fecha,
 * lectura, nivel), accesos e imagen hero. Todo sale de los datos.
 *
 * Es una franja a sangre con cinta de degradado y retícula. Con imagen hero, en escritorio la
 * imagen ocupa la columna derecha y se sale del contenedor por la derecha. Sin el archivo de la
 * imagen (producción) la composición sigue completa: el nombre del área en contorno ocupa su lugar.
 */
export function GuideHeader({ guide }: { guide: Guide }) {
  const { data } = guide;
  const category = getCategory(guide.category);
  const author = getAuthor(data.metadata.author);
  const video = data.video;
  const hasVideoSection = guide.sections.some((section) => section.id === "video");
  const firstSection = guide.sections[0]?.id;
  const hero = heroImageOf(data);
  const showHero = Boolean(hero) && (isDev || mediaExists(hero!.src));

  return (
    <header className="not-prose relative isolate border-b">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-lines absolute inset-x-0 top-0 h-full opacity-60" />
        <AuroraRibbon className="-right-[14%] top-[2%] hidden h-[22rem] w-[58%] lg:block" />
        <AuroraRibbon soft className="-left-[20%] bottom-[-8rem] h-[18rem] w-[55%] !opacity-20" />
        {!showHero && category && (
          <span className="numeral-outline absolute -bottom-4 right-0 hidden select-none whitespace-nowrap text-[clamp(5rem,14vw,12rem)] text-foreground/50 xl:block">{category.name}</span>
        )}
      </div>

      <div className="mx-auto max-w-[80rem] px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
        <Breadcrumbs
          items={[
            ...(category ? [{ name: category.name, path: `/${category.slug}` }] : []),
            { name: guide.title, path: guidePath(guide) },
          ]}
        />

        <div className={showHero ? "lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-14" : ""}>
          <div className="min-w-0">
            {category && (
              <p className={ui.eyebrow}>
                <Link href={`/${category.slug}`} className="guide-focus hover:underline">
                  {category.name}
                </Link>
              </p>
            )}

            <h1 className="mt-4 max-w-4xl text-balance text-[2.15rem] font-semibold leading-[1.05] tracking-[-0.035em] text-guide-ink sm:text-5xl lg:text-[3.7rem]">
              {guide.title}
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed">{data.hero.subtitle}</p>

            <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t pt-5 font-mono text-[0.78rem] text-muted-foreground">
              {author && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Autoría</dt>
                  <User className="size-4" aria-hidden />
                  <dd>{author.name}</dd>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Última actualización</dt>
                <RefreshCw className="size-4" aria-hidden />
                <dd>
                  Actualizada el <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt)}</time>
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Tiempo de lectura</dt>
                <Clock className="size-4" aria-hidden />
                <dd>{guide.readingMinutes} min de lectura</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Nivel</dt>
                <Gauge className="size-4" aria-hidden />
                <dd>Nivel {guide.difficulty.toLowerCase()}</dd>
              </div>
            </dl>

            {data.hero.tools && data.hero.tools.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Necesitas:</span>
                {data.hero.tools.map((tool) => (
                  <span key={tool} className={ui.chip}>
                    {tool}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {firstSection && (
                <a
                  href={`#${firstSection}`}
                  className="guide-focus inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-brand-glow"
                >
                  Empezar la guía
                  <ArrowDown className="size-4" aria-hidden />
                </a>
              )}
              {hasVideoSection && video?.status === "published" && (
                <a
                  href="#video"
                  className="guide-focus inline-flex min-h-12 items-center gap-2 rounded-full border bg-background/70 px-6 text-sm font-semibold text-guide-ink backdrop-blur transition-colors hover:bg-guide-surface"
                >
                  <PlayCircle className="size-4" aria-hidden />
                  Ver el video
                </a>
              )}
              {hasVideoSection && video?.status === "upcoming" && <span className={ui.tagNeutral}>Video próximamente</span>}
            </div>
          </div>

          {showHero && hero && (
            <ImageBlock
              image={{ ...hero, priority: true, aspectRatio: hero.aspectRatio ?? "16/9" }}
              sizes="(min-width: 1280px) 560px, (min-width: 1024px) 40vw, 100vw"
              className="mt-10 lg:-mr-10 lg:mt-0 xl:-mr-24 [&_img]:rounded-[1.75rem] [&>div]:rounded-[1.75rem] [&>div]:shadow-soft-lg"
            />
          )}
        </div>
      </div>
    </header>
  );
}
