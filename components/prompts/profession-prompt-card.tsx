"use client";

import { Lock, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CopyPromptButton } from "@/components/prompts/copy-prompt-button";
import type { ProfessionPrompt } from "@/lib/types";

const difficultyVariant: Record<string, "secondary" | "outline" | "default"> = {
  Principiante: "secondary",
  Intermedio: "outline",
  Avanzado: "default",
};

export function ProfessionPromptCard({ prompt }: { prompt: ProfessionPrompt }) {
  return (
    <Dialog>
      <DialogTrigger className="group relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg">
        <Quote
          aria-hidden
          className="absolute -right-2 -top-2 size-16 -rotate-6 text-brand-muted transition-transform duration-300 group-hover:scale-110"
        />

        <div className="relative flex items-start justify-between gap-2">
          <h3 className="font-semibold tracking-tight group-hover:text-brand">{prompt.title}</h3>
          {prompt.premium && (
            <Badge variant="outline" className="shrink-0 gap-1 bg-background">
              <Lock className="size-3" /> Premium
            </Badge>
          )}
        </div>

        <p className="relative line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {prompt.description}
        </p>

        <div className="relative mt-auto flex flex-wrap gap-1.5 border-t pt-4">
          <Badge variant={difficultyVariant[prompt.difficulty] ?? "secondary"} className="text-xs">
            {prompt.difficulty}
          </Badge>
          {prompt.tools.slice(0, 3).map((tool) => (
            <Badge key={tool} variant="secondary" className="text-xs">
              {tool}
            </Badge>
          ))}
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {prompt.category}
            </Badge>
            <Badge variant={difficultyVariant[prompt.difficulty] ?? "secondary"} className="text-xs">
              {prompt.difficulty}
            </Badge>
            {prompt.premium && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Lock className="size-3" /> Premium
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg">{prompt.title}</DialogTitle>
          <DialogDescription>{prompt.description}</DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border bg-muted/30">
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed">
            {prompt.content}
          </pre>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {prompt.tools.map((tool) => (
            <Badge key={tool} variant="outline" className="text-xs">
              {tool}
            </Badge>
          ))}
        </div>

        <DialogFooter>
          <CopyPromptButton content={prompt.content} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
