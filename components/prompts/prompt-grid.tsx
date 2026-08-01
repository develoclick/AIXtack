import { PromptCard } from "@/components/prompts/prompt-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { PromptSummary } from "@/lib/types";

export function PromptGrid({ prompts }: { prompts: PromptSummary[] }) {
  if (prompts.length === 0) {
    return (
      <EmptyState
        title="No encontramos prompts"
        description="Prueba con otra categoría o búsqueda."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
