import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/shared/rating-stars";
import type { ToolSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

const pricingLabel: Record<ToolSummary["pricingModel"], string> = {
  FREE: "Gratis",
  FREEMIUM: "Freemium",
  PAID: "De pago",
  SUBSCRIPTION: "Suscripción",
};

export function ToolCard({ tool, priority = false }: { tool: ToolSummary; priority?: boolean }) {
  const pricing =
    (tool.pricingModel === "PAID" || tool.pricingModel === "SUBSCRIPTION") && tool.pricingFrom
      ? `Desde ${formatCurrency(tool.pricingFrom, tool.currency)}`
      : pricingLabel[tool.pricingModel];

  return (
    <Link
      href={`/herramientas-ia/${tool.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {tool.logoUrl ? (
          <>
            <Image
              src={tool.logoUrl}
              alt={tool.name}
              fill
              sizes="(min-width: 1024px) 360px, 100vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-brand-muted text-4xl font-semibold text-muted-foreground">
            {tool.name.charAt(0)}
          </div>
        )}
        <Badge className="absolute left-3 top-3 shadow-soft" variant="secondary">
          {pricing}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold tracking-tight group-hover:text-brand">{tool.name}</h3>
          <RatingStars rating={tool.rating} />
        </div>
        {tool.category && <p className="truncate text-xs text-muted-foreground">{tool.category.name}</p>}
        {tool.tagline && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{tool.tagline}</p>}
      </div>
    </Link>
  );
}
