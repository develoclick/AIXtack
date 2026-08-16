import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { flagshipCategoryImages } from "@/lib/images";
import type { CategorySummary } from "@/lib/types";

function resolveIcon(icon: string | null) {
  const Icon = icon && icon in Icons ? (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] : Icons.Layers;
  return Icon ?? Icons.Layers;
}

export function FeaturedCategories({ categories }: { categories: CategorySummary[] }) {
  if (categories.length === 0) return null;
  const items = categories.slice(0, 6);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2 lg:gap-5">
      {items.map((category, index) => {
        const Icon = resolveIcon(category.icon);
        const illustration = flagshipCategoryImages[category.slug];
        const featured = index === 0;

        return (
          <Link
            key={category.id}
            href={`/categoria/${category.slug}`}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg",
              featured
                ? "col-span-2 row-span-2 items-start gap-8 bg-gradient-to-br from-brand-muted/50 to-card sm:p-8"
                : "items-center gap-4 text-center sm:items-start sm:text-left"
            )}
          >
            {!illustration && (
              <div
                aria-hidden
                className={cn(
                  "absolute -right-6 -top-6 rounded-full bg-brand-muted/60 transition-transform duration-500 group-hover:scale-110",
                  featured ? "size-32" : "size-20"
                )}
              />
            )}

            {illustration ? (
              <Image
                src={illustration.src}
                alt=""
                width={112}
                height={112}
                className={cn(
                  "relative z-10 transition-transform duration-500 group-hover:scale-105",
                  featured ? "size-24" : "size-14 mx-auto sm:mx-0"
                )}
              />
            ) : (
              <span
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-xl bg-brand-muted text-brand",
                  featured ? "size-14" : "size-11 mx-auto sm:mx-0"
                )}
              >
                <Icon className={featured ? "size-7" : "size-5"} />
              </span>
            )}

            <div className="relative z-10 flex w-full items-end justify-between gap-2">
              <span className={cn("font-medium group-hover:text-brand", featured ? "text-2xl font-semibold tracking-tight" : "text-sm")}>
                {category.name}
              </span>
              {featured && (
                <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
