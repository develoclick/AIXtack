"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProfessionPromptFilterState {
  query: string;
  tool: string;
  difficulty: string;
}

const tools = ["ChatGPT", "Claude", "Gemini", "Cursor"];
const difficulties = ["Principiante", "Intermedio", "Avanzado"];

export function ProfessionPromptFilters({
  value,
  onChange,
}: {
  value: ProfessionPromptFilterState;
  onChange: (value: ProfessionPromptFilterState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder="Buscar prompts..."
          className="pl-9"
        />
      </div>

      <Select value={value.tool} onValueChange={(tool) => onChange({ ...value, tool: tool ?? "all" })}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Herramienta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las IAs</SelectItem>
          {tools.map((tool) => (
            <SelectItem key={tool} value={tool}>
              {tool}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.difficulty}
        onValueChange={(difficulty) => onChange({ ...value, difficulty: difficulty ?? "all" })}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Dificultad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toda dificultad</SelectItem>
          {difficulties.map((difficulty) => (
            <SelectItem key={difficulty} value={difficulty}>
              {difficulty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
