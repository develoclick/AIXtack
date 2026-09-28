"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCopy, ExternalLink } from "lucide-react";
import { copiarTexto } from "@/components/prompts/cv/copiar";
import { almacenPlan } from "./almacen";
import { construirPromptRevision, diasParaAlerta, filtrarPeriodo, type DatosRegistro } from "@/lib/plan/registro";

const ASISTENTES = [
  { nombre: "ChatGPT", href: "https://chatgpt.com/" },
  { nombre: "Gemini", href: "https://gemini.google.com/" },
  { nombre: "Claude", href: "https://claude.ai/" },
];

const PERIODOS: { valor: string; etiqueta: string; dias: number | null }[] = [
  { valor: "14", etiqueta: "Últimos 14 días", dias: 14 },
  { valor: "30", etiqueta: "Últimos 30 días", dias: 30 },
  { valor: "todo", etiqueta: "Todo el registro", dias: null },
];

/** Prompt de la revisión quincenal: se rellena solo con las métricas del registro (calculadas en tu navegador) y con tu objetivo. */
export function RevisionQuincenal({ registro, hoy, alCopiar }: { registro: DatosRegistro; hoy: string; alCopiar: () => void }) {
  const plan = almacenPlan.useDatos();
  const [periodo, setPeriodo] = useState("14");
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState(false);
  const p = PERIODOS.find((x) => x.valor === periodo)!;
  const dias = diasParaAlerta(registro);
  const items = useMemo(() => filtrarPeriodo(registro.items, p.dias, hoy), [registro.items, p.dias, hoy]);
  const prompt = useMemo(() => construirPromptRevision(plan, items, hoy, dias, p.dias === null ? "todo el registro" : `últimos ${p.dias} días`), [plan, items, hoy, dias, p]);

  async function copiar() {
    const ok = await copiarTexto(prompt);
    setError(!ok);
    setCopiado(ok);
    if (ok) alCopiar();
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <div className="space-y-4" data-revision>
      <p className="text-sm text-muted-foreground">Cada dos semanas, copia este prompt en tu asistente de IA. Ya trae tus métricas (calculadas aquí, en tu navegador), la lista de postulaciones del periodo y tu objetivo: no tienes que escribir nada. Pide un diagnóstico como hipótesis y tres a cinco ajustes para las siguientes dos semanas.</p>

      <div className="max-w-xs">
        <label htmlFor="periodo-revision" className="mb-1.5 block text-sm font-semibold">
          Periodo a revisar
        </label>
        <select id="periodo-revision" className="campo" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          {PERIODOS.map((x) => (
            <option key={x.valor} value={x.valor}>
              {x.etiqueta}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-muted-foreground" aria-live="polite">
          {items.length} postulación(es) en este periodo.
        </p>
      </div>

      <pre tabIndex={0} aria-label="Texto del prompt de revisión" data-prompt-revision className="max-h-[24rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-surface p-4 font-mono text-[0.8125rem] leading-relaxed">
        {prompt}
      </pre>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={copiar} className="btn btn-primario sm:flex-1" disabled={items.length === 0}>
          {copiado ? <Check aria-hidden className="size-4" /> : <ClipboardCopy aria-hidden className="size-4" />}
          {copiado ? "¡Prompt copiado!" : "Copiar prompt de revisión"}
        </button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">No hay postulaciones en este periodo: registra al menos una para copiar el prompt.</p>}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          No se pudo copiar automáticamente: selecciona el texto del recuadro y cópialo con Ctrl+C (o Cmd+C).
        </p>
      )}

      <div className="border-t pt-4">
        <p className="text-sm font-semibold">Abre tu asistente y pega el prompt:</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {ASISTENTES.map((a) => (
            <li key={a.nombre}>
              <a href={a.href} target="_blank" rel="noopener noreferrer" className="btn btn-secundario text-sm">
                {a.nombre} <ExternalLink aria-hidden className="size-3.5" />
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Este prompt incluye los nombres de las empresas y puestos que anotaste. Se envían a ese servicio solo cuando tú lo pegas, y se rigen por su política de privacidad. Este sitio no los recibe.</p>
      </div>
    </div>
  );
}
