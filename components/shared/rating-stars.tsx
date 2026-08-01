import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);

  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`Valoración ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < rounded ? "fill-brand text-brand" : "fill-transparent text-muted-foreground"
          )}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}
