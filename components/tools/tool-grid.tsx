import { ToolCard } from "@/components/tools/tool-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ToolSummary } from "@/lib/types";

export function ToolGrid({ tools }: { tools: ToolSummary[] }) {
  if (tools.length === 0) {
    return (
      <EmptyState
        title="No encontramos herramientas"
        description="Prueba con otros filtros o vuelve a intentarlo más tarde."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {tools.map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} priority={index < 3} />
      ))}
    </div>
  );
}
