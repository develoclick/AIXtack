import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
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
  return (
    <Link
      href={`/herramientas-ia/${tool.slug}`}
      className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg"
    >
      <ArrowUpRight className="absolute right-5 top-5 size-4 text-muted-foreground/0 transition-all duration-300 group-hover:text-brand/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted shadow-soft">
          {tool.logoUrl ? (
            <Image
              src={tool.logoUrl}
              alt={tool.name}
              width={48}
              height={48}
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-muted-foreground">{tool.name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 pr-5">
          <h3 className="truncate font-semibold tracking-tight group-hover:text-brand">{tool.name}</h3>
          {tool.category && <p className="truncate text-xs text-muted-foreground">{tool.category.name}</p>}
        </div>
      </div>

      {tool.tagline && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{tool.tagline}</p>}

      <div className="mt-auto flex items-center justify-between border-t pt-4">
        <RatingStars rating={tool.rating} />
        <Badge variant="secondary" className="font-medium">
          {tool.pricingModel === "PAID" || tool.pricingModel === "SUBSCRIPTION"
            ? tool.pricingFrom
              ? `Desde ${formatCurrency(tool.pricingFrom, tool.currency)}`
              : pricingLabel[tool.pricingModel]
            : pricingLabel[tool.pricingModel]}
        </Badge>
      </div>
    </Link>
  );
}
