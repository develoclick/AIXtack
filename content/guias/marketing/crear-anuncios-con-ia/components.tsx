import { ArrowRight } from "lucide-react";
import { Term } from "@/components/guide/glossary";
import { Inline } from "@/components/guide/rich-text";
import { ui } from "@/components/guide/ui";
import { cn } from "@/lib/utils";

/**
 * Componentes SOLO de esta guía (marketing/crear-anuncios-con-ia). Sustituyen a las ilustraciones
 * rasterizadas que tenía la guía (rubrica-aplicada.webp, dos-enfoques.webp, persuasion-con-respaldo.webp,
 * canales.webp): son HTML/CSS con texto real y accesible, nunca una imagen que finja ser una captura.
 * Cada uno lleva la pastilla «Ilustración» y, cuando el caso es ficticio, «Caso ficticio».
 *
 * Ninguno inventa datos nuevos: cada texto sale de la ficha del caso (`data.ts`) o de una captura
 * real transcrita en docs/crear-anuncios/transcripciones.md.
 */

const badge = "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

function Tag({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "brand" }) {
  return <span className={cn(badge, tone === "brand" && "border-brand/40 bg-brand-muted text-brand")}>{children}</span>;
}

/* ─────────────────────────── 1. Rúbrica aplicada a las dos versiones ─────────────────────────── */

const SCORE_STYLE: Record<0 | 1 | 2, string> = {
  2: "bg-ok-muted text-ok",
  1: "bg-warn-muted text-warn",
  0: "bg-risk-muted text-risk",
};

export interface RubricaVersion {
  label: string;
  scores: Record<string, 0 | 1 | 2>;
  /** Nota corta solo para los criterios que no sacaron el máximo. */
  notes?: Record<string, string>;
  verdict: string;
}

export function RubricaAplicada({
  criteria,
  versions,
  max,
  rule,
}: {
  criteria: { id: string; label: string }[];
  versions: RubricaVersion[];
  max: number;
  rule: string;
}) {
  return (
    <figure className={cn(ui.block, "not-prose overflow-hidden rounded-2xl border bg-background")}>
      <figcaption className="flex flex-wrap items-center gap-2 border-b bg-guide-surface px-5 py-3">
        <Tag tone="brand">Ilustración</Tag>
        <Tag>Caso ficticio</Tag>
        <span className="text-sm font-semibold text-guide-ink">Rúbrica aplicada a las dos versiones</span>
      </figcaption>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-[0.92rem]">
          <thead>
            <tr className="border-b bg-guide-surface/60">
              <th scope="col" className="px-4 py-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Criterio
              </th>
              {versions.map((v) => (
                <th key={v.label} scope="col" className="px-4 py-3 text-center font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {v.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0">
                <th scope="row" className="px-4 py-3 align-top font-semibold text-guide-ink">
                  {c.label}
                </th>
                {versions.map((v) => (
                  <td key={v.label} className="px-4 py-3 align-top text-center">
                    <span className={cn("inline-flex size-7 items-center justify-center rounded-full font-mono text-sm font-bold tabular-nums", SCORE_STYLE[v.scores[c.id]])}>
                      {v.scores[c.id]}
                    </span>
                    {v.notes?.[c.id] && <p className="mt-1.5 max-w-[10rem] text-left text-xs leading-snug text-muted-foreground">{v.notes[c.id]}</p>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-guide-surface/60">
              <th scope="row" className="px-4 py-3 font-semibold text-guide-ink">
                Total
              </th>
              {versions.map((v) => (
                <td key={v.label} className="px-4 py-3 text-center">
                  <p className="font-mono text-base font-bold tabular-nums text-guide-ink">
                    {Object.values(v.scores).reduce((a: number, b) => a + b, 0)} / {max}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{v.verdict}</p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="border-t bg-background px-5 py-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-guide-ink">Regla de corte: </span>
        {rule}
      </p>
    </figure>
  );
}

/* ─────────────────────────── 2. El error más frecuente ─────────────────────────── */

export function ErrorFrecuente({ ficha, error, nota }: { ficha: string; error: string; nota: string }) {
  return (
    <figure className={cn(ui.block, "not-prose overflow-hidden rounded-2xl border bg-background")}>
      <figcaption className="flex flex-wrap items-center gap-2 border-b bg-guide-surface px-5 py-3">
        <Tag tone="brand">Ilustración: el error más frecuente</Tag>
        <Tag>Caso ficticio</Tag>
      </figcaption>
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-xl border bg-guide-surface p-4">
          <p className={ui.eyebrow}>La ficha dice</p>
          <p className="mt-2 text-[0.95rem] leading-snug text-guide-ink">“{ficha}”</p>
        </div>
        <div className="rounded-xl border border-risk/40 bg-risk-muted/40 p-4">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-risk">Un anuncio que exagera diría</p>
          <p className="mt-2 text-[0.95rem] leading-snug text-guide-ink line-through decoration-risk/60">“{error}”</p>
        </div>
      </div>
      <p className="border-t px-5 py-3.5 text-sm leading-relaxed text-foreground/90 sm:px-6">{nota}</p>
    </figure>
  );
}

/* ─────────────────────────── 3. Trazabilidad del refuerzo ─────────────────────────── */

export function TrazabilidadRefuerzo({
  antes,
  despues,
  respaldos,
}: {
  antes: string;
  despues: string;
  respaldos: { campo: string; valor: string }[];
}) {
  return (
    <figure className={cn(ui.block, "not-prose overflow-hidden rounded-2xl border bg-background")}>
      <figcaption className="flex flex-wrap items-center gap-2 border-b bg-guide-surface px-5 py-3">
        <Tag tone="brand">Ilustración</Tag>
        <Tag>Caso ficticio</Tag>
        <span className="text-sm font-semibold text-guide-ink">De dónde sale cada frase nueva</span>
      </figcaption>
      <div className="grid gap-5 p-5 @2xl:grid-cols-[1fr_auto_1fr] @2xl:items-center sm:p-6">
        <div className="rounded-xl border bg-guide-surface p-4">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Antes</p>
          <p className="mt-2 text-[0.97rem] leading-snug text-guide-ink">{antes}</p>
        </div>
        <ArrowRight className="mx-auto hidden size-5 shrink-0 text-brand @2xl:block" aria-hidden />
        <div className="rounded-xl border border-brand/40 bg-brand-muted/50 p-4">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-brand">Después · urgencia real</p>
          <p className="mt-2 text-[0.97rem] font-medium leading-snug text-guide-ink">{despues}</p>
        </div>
      </div>
      <ul className="grid gap-2 border-t bg-guide-surface/50 px-5 py-4 @lg:grid-cols-2 sm:px-6">
        {respaldos.map((r) => (
          <li key={r.campo} className="rounded-lg border bg-background px-3.5 py-2.5 text-sm leading-snug">
            <span className="font-semibold text-guide-ink">{r.campo}: </span>
            <span className="text-foreground/85">{r.valor}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/* ─────────────────────────── 4. Las tres piezas por canal ─────────────────────────── */

export interface CanalPieza {
  canal: string;
  texto: string;
  datosConservados: string[];
  noCabe: string;
}

export function CanalesPiezas({ piezas }: { piezas: CanalPieza[] }) {
  return (
    <div className={cn(ui.block, "not-prose")}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Tag tone="brand">Ilustración</Tag>
        <Tag>Caso ficticio</Tag>
        <span className="text-sm font-semibold text-guide-ink">Un anuncio, tres piezas</span>
      </div>
      <div className="grid gap-4 @2xl:grid-cols-3">
        {piezas.map((p) => (
          <div key={p.canal} className="flex flex-col overflow-hidden rounded-2xl border bg-background">
            <p className="border-b bg-guide-surface px-4 py-2.5 text-sm font-semibold text-guide-ink">{p.canal}</p>
            <p className="whitespace-pre-line px-4 py-3.5 text-[0.88rem] leading-relaxed text-foreground/90">{p.texto}</p>
            <div className="mt-auto space-y-2 border-t bg-guide-surface/50 px-4 py-3">
              <div>
                <p className="font-mono text-[0.63rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Datos conservados</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.datosConservados.map((c) => (
                    <span key={c} className="rounded-full border border-brand/30 bg-brand-muted px-2 py-0.5 text-[0.72rem] font-medium text-brand">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[0.78rem] leading-snug text-muted-foreground">
                <span className="font-semibold text-guide-ink">No cabe: </span>
                {p.noCabe}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── 5. Qué corregimos ─────────────────────────── */

export interface Correccion {
  pieza: string;
  antes?: string;
  despues?: string;
  nota?: string;
}

export function CorreccionAntesDespues({ items }: { items: Correccion[] }) {
  return (
    <div className={cn(ui.block, "not-prose")}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Tag tone="brand">Ilustración</Tag>
        <Tag>Caso ficticio</Tag>
        <span className="text-sm font-semibold text-guide-ink">Qué corregimos</span>
      </div>
      <ul className="divide-y rounded-2xl border bg-background">
        {items.map((item, index) => (
          <li key={`${item.pieza}-${index}`} className="grid gap-2 px-5 py-4 @lg:grid-cols-[9rem_minmax(0,1fr)] @lg:gap-5">
            <p className="text-sm font-semibold text-guide-ink">{item.pieza}</p>
            {item.antes && item.despues ? (
              <div className="flex flex-wrap items-center gap-2 text-[0.92rem] leading-snug">
                <span className="rounded-md bg-risk-muted px-2 py-1 text-risk line-through decoration-risk/60">{item.antes}</span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="rounded-md bg-ok-muted px-2 py-1 font-medium text-ok">{item.despues}</span>
              </div>
            ) : (
              <p className="text-[0.92rem] leading-relaxed text-foreground/90">
                <Inline text={item.nota ?? ""} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────── 6. Hero: ficha + anuncio final ─────────────────────────── */

export function HeroArt({
  ficha,
  gancho,
  resto,
  destacados,
}: {
  ficha: { campo: string; valor: string; id: string }[];
  gancho: string;
  resto: string;
  /** ids de `ficha` que se conectan visualmente con el gancho (oferta y condiciones). */
  destacados: string[];
}) {
  return (
    <div className="not-prose dark relative isolate grid gap-4 overflow-hidden rounded-[1.75rem] border bg-ink p-4 text-foreground @xl:grid-cols-[1fr_1fr] @xl:p-6" role="img" aria-label={`Ficha del anuncio y el anuncio final: ${gancho}`}>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand">La ficha</p>
        <dl className="mt-3 space-y-2.5">
          {ficha.map((f) => (
            <div key={f.id} className={cn("rounded-lg px-2.5 py-2 text-xs leading-snug transition-colors", destacados.includes(f.id) ? "bg-brand/15 ring-1 ring-brand/40" : "bg-white/[0.03]")}>
              <dt className="font-semibold text-foreground">{f.campo}</dt>
              <dd className="mt-0.5 text-foreground/70">{f.valor}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand">El anuncio final</p>
        <p className="mt-3 text-balance text-xl font-semibold leading-snug text-foreground @sm:text-2xl">{gancho}</p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">{resto}</p>
      </div>
    </div>
  );
}
