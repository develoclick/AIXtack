"use client";

import { Printer } from "lucide-react";
import { almacenChecklist } from "./almacenes";
import type { GrupoChecklist } from "@/lib/entrevista/estudio";

/** Imprime solo el bloque indicado (ver las reglas @media print de globals.css). */
export function imprimirBloque(clase: "imprimiendo-entrevista-checklist" | "imprimiendo-entrevista-hoja", alImprimir?: () => void) {
  document.body.classList.add(clase);
  const quitar = () => {
    document.body.classList.remove(clase);
    window.removeEventListener("afterprint", quitar);
  };
  window.addEventListener("afterprint", quitar);
  alImprimir?.();
  window.print();
}

/** Checklist del día previo: ítems fijos y los que salen de tus datos y de la respuesta de la IA. Las marcas se guardan en tu navegador. */
export function ChecklistDiaPrevio({ grupos }: { grupos: GrupoChecklist[] }) {
  const { marcados } = almacenChecklist.useDatos();
  const todos = grupos.flatMap((g) => g.items);
  const hechos = todos.filter((i) => marcados.includes(i.id)).length;
  const alternar = (id: string) => almacenChecklist.guardar({ marcados: marcados.includes(id) ? marcados.filter((m) => m !== id) : [...marcados, id] });

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">Repásala el día anterior. Los ítems marcados se guardan en tu navegador; si cambian tus datos o pegas otra respuesta, se actualizan los ítems de contenido.</p>
      <p className="text-sm font-semibold tabular" data-progreso-checklist>
        {hechos} de {todos.length} listos
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-surface" aria-hidden>
        <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${todos.length ? (hechos / todos.length) * 100 : 0}%` }} />
      </div>
      {grupos.map((g) => (
        <fieldset key={g.titulo} className="rounded-lg border p-4">
          <legend className="px-1 text-sm font-semibold">{g.titulo}</legend>
          <ul className="space-y-1">
            {g.items.map((i) => (
              <li key={i.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md py-2 text-sm leading-snug hover:bg-surface">
                  <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" checked={marcados.includes(i.id)} onChange={() => alternar(i.id)} />
                  <span className={marcados.includes(i.id) ? "text-muted-foreground line-through" : ""}>{i.texto}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secundario" onClick={() => imprimirBloque("imprimiendo-entrevista-checklist")}>
          <Printer aria-hidden className="size-4" /> Imprimir checklist
        </button>
        {marcados.length > 0 && (
          <button type="button" className="btn btn-texto" onClick={() => almacenChecklist.borrar()}>
            Desmarcar todo
          </button>
        )}
      </div>
    </div>
  );
}
