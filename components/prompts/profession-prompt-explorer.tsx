"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ProfessionPromptFilters,
  type ProfessionPromptFilterState,
} from "@/components/prompts/profession-prompt-filters";
import { ProfessionPromptCard } from "@/components/prompts/profession-prompt-card";
import type { ProfessionPrompt } from "@/lib/types";

export function ProfessionPromptExplorer({ prompts }: { prompts: ProfessionPrompt[] }) {
  const [filters, setFilters] = useState<ProfessionPromptFilterState>({
    query: "",
    tool: "all",
    difficulty: "all",
  });

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return prompts.filter((prompt) => {
      if (filters.tool !== "all" && !prompt.tools.includes(filters.tool)) return false;
      if (filters.difficulty !== "all" && prompt.difficulty !== filters.difficulty) return false;
      if (query && !prompt.title.toLowerCase().includes(query) && !prompt.description.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [prompts, filters]);

  return (
    <div>
      <ProfessionPromptFilters value={filters} onChange={setFilters} />

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            title="No encontramos prompts"
            description="Prueba con otra búsqueda o cambia los filtros de herramienta y dificultad."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((prompt) => (
                <motion.div
                  key={prompt.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  <ProfessionPromptCard prompt={prompt} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
