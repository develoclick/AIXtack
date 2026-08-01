import Link from "next/link";
import { FileText, Search, Sparkles, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { searchContent } from "@/lib/content/search-index";
import { buildMetadata } from "@/lib/seo/metadata";
import type { SearchResultItem } from "@/lib/types";

export const metadata = buildMetadata({
  title: "Buscar",
  description: "Busca herramientas de IA, prompts y artículos en AIXtack.",
  path: "/buscar",
  noIndex: true,
});

const kindIcon: Record<SearchResultItem["kind"], typeof FileText> = {
  post: FileText,
  tool: Wrench,
  prompt: Sparkles,
};

const kindLabel: Record<SearchResultItem["kind"], string> = {
  post: "Artículo",
  tool: "Herramienta",
  prompt: "Prompt",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query.length >= 2 ? searchContent(query, 30) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Buscar en AIXtack</h1>

      <form method="get" className="mt-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={query} placeholder="Herramientas, prompts, artículos..." className="pl-9" />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      <div className="mt-10">
        {query.length < 2 && (
          <p className="text-sm text-muted-foreground">Escribe al menos 2 caracteres para buscar.</p>
        )}

        {query.length >= 2 && results.length === 0 && (
          <EmptyState title={`Sin resultados para “${query}”`} description="Prueba con otros términos." />
        )}

        <ul className="flex flex-col divide-y">
          {results.map((result) => {
            const Icon = kindIcon[result.kind];
            return (
              <li key={`${result.kind}-${result.slug}`}>
                <Link href={result.href} className="flex items-start gap-3 py-4 hover:bg-accent/50">
                  <Icon className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{result.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {kindLabel[result.kind]}
                      {result.excerpt ? ` · ${result.excerpt}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
