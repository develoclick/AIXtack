"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { GuideSectionInfo } from "@/lib/guides/types";
import { cn } from "@/lib/utils";

/**
 * Índice de contenidos. Escritorio: lista fija (sticky) a un lado con la sección actual
 * resaltada (scroll spy). Móvil: desplegable nativo que muestra en qué sección estás.
 * Los enlaces son anclas normales: funcionan sin JavaScript y respetan reduced-motion.
 */
interface TocEntry {
  /** Ancla de la primera sección de la entrada. */
  id: string;
  label: string;
  /** Ids de todas las secciones que agrupa (una sola si el índice no usa partes). */
  sectionIds: string[];
}

/** Con `part` declarado, el índice lista partes (cada una enlaza a su primera sección); si no, secciones. */
function buildEntries(items: GuideSectionInfo[]): TocEntry[] {
  if (!items.some((item) => item.part)) return items.map((item) => ({ id: item.id, label: item.label, sectionIds: [item.id] }));
  const entries: TocEntry[] = [];
  for (const item of items) {
    const label = item.part ?? item.label;
    const last = entries[entries.length - 1];
    if (last && last.label === label) last.sectionIds.push(item.id);
    else entries.push({ id: item.id, label, sectionIds: [item.id] });
  }
  return entries;
}

export function GuideToc({ items }: { items: GuideSectionInfo[] }) {
  const entries = buildEntries(items);
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");
  const activeId = entries.find((entry) => entry.sectionIds.includes(activeSection))?.id ?? entries[0]?.id ?? "";
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const entry of records) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = items.find((item) => visible.has(item.id));
        if (first) setActiveSection(first.id);
      },
      { rootMargin: "-100px 0px -62% 0px" }
    );
    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [items]);

  const active = entries.find((entry) => entry.id === activeId) ?? entries[0];

  const list = (
    <ol>
      {entries.map((item, position) => {
        const isActive = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={() => {
                setActiveSection(item.id);
                if (detailsRef.current) detailsRef.current.open = false;
              }}
              className={cn(
                "guide-focus flex items-baseline gap-2.5 border-l-2 py-2 pl-3.5 text-[0.86rem] leading-snug transition-colors motion-reduce:transition-none",
                isActive
                  ? "border-brand font-semibold text-guide-ink"
                  : "border-border/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              <span aria-hidden className={cn("font-mono text-[0.66rem] tabular-nums", isActive ? "text-brand" : "opacity-60")}>
                {String(position + 1).padStart(2, "0")}
              </span>
              <span>{item.label}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <nav aria-label="Contenido de la guía" className="hidden lg:block">
        <p className="mb-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">En esta guía</p>
        {list}
      </nav>

      <nav aria-label="Contenido de la guía" className="lg:hidden">
        <details ref={detailsRef} className="group rounded-xl border bg-guide-surface">
          <summary className="guide-focus flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="min-w-0">
              <span className="block font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">En esta guía</span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-guide-ink">{active?.label}</span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
          </summary>
          <div className="border-t px-4 py-3">{list}</div>
        </details>
      </nav>
    </>
  );
}
