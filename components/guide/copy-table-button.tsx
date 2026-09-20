"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Table2 } from "lucide-react";
import type { TableData } from "@/lib/guides/model";

/** Plano con tabuladores: al pegarlo en una hoja de cálculo cada valor cae en su celda. */
function toTsv(table: TableData): string {
  const clean = (cell: string) => cell.replace(/[\t\r\n]+/g, " ").replace(/\*\*|`/g, "");
  return [table.columns, ...table.rows].map((row) => row.map(clean).join("\t")).join("\n");
}

/** «Copiar como tabla»: copia la tabla lista para pegar en una hoja de cálculo (todo en el navegador). */
export function CopyTableButton({ table }: { table: TableData }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(toTsv(table));
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2400);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="guide-focus inline-flex min-h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold text-guide-ink transition-colors hover:bg-guide-surface"
      >
        {state === "copied" ? <Check className="size-4 text-ok" aria-hidden /> : <Table2 className="size-4" aria-hidden />}
        <span>{state === "copied" ? "Copiado ✓" : state === "failed" ? "No se pudo copiar" : "Copiar como tabla"}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Tabla copiada: pégala en tu hoja de cálculo" : state === "failed" ? "No se pudo copiar la tabla" : ""}
      </span>
    </>
  );
}
