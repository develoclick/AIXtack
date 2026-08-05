"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Wrench, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchContent } from "@/lib/content/search-index";
import type { SearchResultItem } from "@/lib/types";
import { cn } from "@/lib/utils";

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

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Índice de contenido estático: sin backend, el filtrado ocurre
  // localmente en el navegador sobre el bundle ya cargado.
  const results = useMemo(() => searchContent(query, 20), [query]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full max-w-xs items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:border-brand/40 hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar</span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="sr-only">Buscar en AIXtack</DialogTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busca herramientas, prompts, tutoriales..."
                className="border-0 shadow-none focus-visible:ring-0 px-0"
              />
            </div>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto p-2">
            {query.trim().length < 2 && (
              <p className="p-4 text-sm text-muted-foreground">
                Escribe al menos 2 caracteres para buscar.
              </p>
            )}

            {query.trim().length >= 2 && results.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                No encontramos resultados para “{query}”.
              </p>
            )}

            <ul className="flex flex-col gap-0.5">
              {results.map((result) => {
                const Icon = kindIcon[result.kind];
                return (
                  <li key={`${result.kind}-${result.slug}`}>
                    <button
                      type="button"
                      onClick={() => goTo(result.href)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                        "hover:bg-accent"
                      )}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex flex-col">
                        <span className="font-medium">{result.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {kindLabel[result.kind]}
                          {result.excerpt ? ` · ${result.excerpt.slice(0, 80)}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
