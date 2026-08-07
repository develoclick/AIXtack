import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Lock, Quote } from "lucide-react";
import type { PromptSummary } from "@/lib/types";

export function PromptCard({ prompt }: { prompt: PromptSummary }) {
  return (
    <Link
      href={`/prompts/${prompt.slug}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg"
    >
    
      <div className="relative flex items-start justify-between gap-2">
        <h3 className="font-semibold tracking-tight group-hover:text-brand">{prompt.title}</h3>
        {prompt.isPremium && (
          <Badge variant="outline" className="shrink-0 gap-1 bg-background">
            <Lock className="size-3" /> Premium
          </Badge>
        )}
      </div>

      {prompt.description && (
        <p className="relative line-clamp-3 text-sm leading-relaxed text-muted-foreground">{prompt.description}</p>
      )}

      {prompt.targetModels.length > 0 && (
        <div className="relative mt-auto flex flex-wrap gap-1.5 border-t pt-4">
          {prompt.targetModels.map((model) => (
            <Badge key={model} variant="secondary" className="text-xs">
              {model}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
