"use client";

import { useState } from "react";

/** Bloque 7: casillas marcables (5). El avance es solo visual y no se guarda. */
export function ChecklistRevision({ items }: { items: string[] }) {
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set());

  return (
    <div>
      <ul className="grid gap-2">
        {items.map((texto, i) => {
          const id = `revision-${i}`;
          return (
            <li key={texto}>
              <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-foreground/50 bg-background px-3 py-2.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-guide-ink">
                <input
                  id={id}
                  type="checkbox"
                  checked={marcadas.has(i)}
                  onChange={(e) =>
                    setMarcadas((prev) => {
                      const siguiente = new Set(prev);
                      if (e.target.checked) siguiente.add(i);
                      else siguiente.delete(i);
                      return siguiente;
                    })
                  }
                  className="mt-1 size-5 shrink-0 accent-[var(--brand)]"
                />
                <span className={marcadas.has(i) ? "text-muted-foreground line-through decoration-1" : "text-foreground"}>{texto}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
        {marcadas.size} de {items.length} comprobaciones marcadas.
      </p>
    </div>
  );
}
