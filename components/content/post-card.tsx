import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDate, toDate } from "@/lib/utils/format";
import type { PostSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const typeLabel: Record<PostSummary["type"], string> = {
  ARTICLE: "Artículo",
  NEWS: "Noticia",
  TUTORIAL: "Tutorial",
  GUIDE: "Guía",
  REVIEW: "Análisis",
  COMPARISON: "Comparativa",
};

export function PostCard({
  post,
  className,
  priority = false,
}: {
  post: PostSummary;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg",
        className
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {post.coverImageUrl ? (
          <>
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt ?? post.title}
              fill
              sizes="(min-width: 1024px) 360px, 100vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-brand-muted text-sm text-muted-foreground">
            AIXtack
          </div>
        )}
        <Badge className="absolute left-3 top-3 shadow-soft" variant="secondary">
          {typeLabel[post.type]}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.publishedAt && (
            <time dateTime={toDate(post.publishedAt).toISOString()}>{formatDate(post.publishedAt)}</time>
          )}
          {post.readingTimeMin && (
            <>
              <span aria-hidden>·</span>
              <span>{post.readingTimeMin} min de lectura</span>
            </>
          )}
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight group-hover:text-brand">
          {post.title}
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
