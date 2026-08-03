import professionsJson from "@/content/professions.json";
import professionPromptsJson from "@/content/profession-prompts.json";
import type { ProfessionPrompt, ProfessionSummary } from "@/lib/types";

interface ProfessionRaw {
  id: string;
  slug: string;
  name: string;
  icon: string;
  order: number;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

const professions = professionsJson as ProfessionRaw[];
const professionPrompts = professionPromptsJson as ProfessionPrompt[];

const promptCountBySlug = new Map<string, number>();
for (const prompt of professionPrompts) {
  promptCountBySlug.set(prompt.professionSlug, (promptCountBySlug.get(prompt.professionSlug) ?? 0) + 1);
}

function toSummary(profession: ProfessionRaw): ProfessionSummary {
  return {
    id: profession.id,
    slug: profession.slug,
    name: profession.name,
    icon: profession.icon,
    description: profession.description,
    seoTitle: profession.seoTitle,
    seoDescription: profession.seoDescription,
    promptCount: promptCountBySlug.get(profession.slug) ?? 0,
  };
}

const professionsSorted: ProfessionSummary[] = [...professions]
  .sort((a, b) => a.order - b.order)
  .map(toSummary);

export async function listProfessions(): Promise<ProfessionSummary[]> {
  return professionsSorted;
}

export async function getProfessionBySlug(slug: string): Promise<ProfessionSummary | null> {
  return professionsSorted.find((p) => p.slug === slug) ?? null;
}

export interface ListProfessionPromptsOptions {
  tool?: string;
  difficulty?: string;
  query?: string;
}

export async function listProfessionPrompts(
  professionSlug: string,
  options: ListProfessionPromptsOptions = {}
): Promise<ProfessionPrompt[]> {
  let filtered = professionPrompts.filter((p) => p.professionSlug === professionSlug);

  if (options.tool) {
    filtered = filtered.filter((p) => p.tools.includes(options.tool!));
  }

  if (options.difficulty) {
    filtered = filtered.filter((p) => p.difficulty === options.difficulty);
  }

  const query = options.query?.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }

  return filtered;
}

export async function getProfessionPromptById(id: string): Promise<ProfessionPrompt | null> {
  return professionPrompts.find((p) => p.id === id) ?? null;
}
