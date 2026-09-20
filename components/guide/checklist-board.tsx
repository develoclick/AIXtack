"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { RotateCcw } from "lucide-react";
import { Inline } from "./rich-text";

export interface ChecklistBoardItem {
  id: string;
  label: string;
  detail?: string;
}

interface ChecklistBoardProps {
  items: ChecklistBoardItem[];
  /** Con clave, el progreso se guarda SOLO en este navegador (localStorage). Sin clave no se guarda nada. */
  storageKey?: string;
  /** Texto que acompaña al contador: «completadas», «verificadas»… */
  doneLabel?: string;
  legend: string;
}

const CHANGE_EVENT = "guia-checklist-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // sin almacenamiento: la lista funciona igual, solo que sin memoria
  }
}

function writeStored(key: string, ids: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignorado a propósito */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function parseStored(raw: string | null, valid: Set<string>): Set<string> {
  if (!raw) return new Set();
  try {
    const saved: unknown = JSON.parse(raw);
    return new Set(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string" && valid.has(id)) : []);
  } catch {
    return new Set();
  }
}

/**
 * Lista de comprobación interactiva con casillas reales, contador («6 / 8 completadas») y
 * barra de avance. No hay servidor: el estado vive en el navegador y, si se pide, en localStorage
 * (leído con useSyncExternalStore: sin desajustes de hidratación).
 */
export function ChecklistBoard({ items, storageKey, doneLabel = "completadas", legend }: ChecklistBoardProps) {
  const groupId = useId();
  const key = storageKey ? `guia-checklist:${storageKey}` : null;
  const valid = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const [localChecked, setLocalChecked] = useState<ReadonlySet<string>>(new Set());
  const stored = useSyncExternalStore(
    subscribe,
    () => (key ? readStored(key) : null),
    () => null
  );
  const checked = useMemo<ReadonlySet<string>>(() => (key ? parseStored(stored, valid) : localChecked), [key, stored, valid, localChecked]);

  function commit(next: Set<string>) {
    if (key) writeStored(key, [...next]);
    else setLocalChecked(next);
  }

  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    commit(next);
  }

  const total = items.length;
  const done = checked.size;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <fieldset className="min-w-0 rounded-2xl border bg-background p-0">
      <legend className="sr-only">{legend}</legend>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-5 py-3.5">
        <p className="font-mono text-[0.8rem] font-semibold tabular-nums text-guide-ink" role="status" aria-live="polite">
          {done} / {total} {doneLabel}
        </p>
        <button
          type="button"
          onClick={() => commit(new Set())}
          disabled={done === 0}
          className="guide-focus inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reiniciar
        </button>
      </div>

      <div className="h-1 w-full bg-muted" aria-hidden>
        <div className="h-full bg-brand transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>

      <ul className="divide-y">
        {items.map((item) => {
          const inputId = `${groupId}-${item.id}`;
          const isChecked = checked.has(item.id);
          return (
            <li key={item.id}>
              <label htmlFor={inputId} className="flex cursor-pointer gap-3.5 px-5 py-3.5 transition-colors hover:bg-guide-surface has-[:focus-visible]:bg-guide-surface">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                  className="mt-[0.2rem] size-[1.15rem] shrink-0 cursor-pointer accent-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                />
                <span className="min-w-0">
                  <span className={`block text-[0.95rem] font-medium leading-snug ${isChecked ? "text-muted-foreground line-through decoration-1" : "text-guide-ink"}`}>
                    <Inline text={item.label} />
                  </span>
                  {item.detail && (
                    <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                      <Inline text={item.detail} />
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
