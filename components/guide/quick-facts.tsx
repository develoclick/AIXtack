import { Clock, PackageCheck, Target, Wallet } from "lucide-react";
import type { QuickFactsData } from "@/lib/guides/model";
import { formatDate } from "@/lib/utils/format";
import { Inline } from "./rich-text";
import { ui } from "./ui";

/** Ficha rápida al inicio: tiempo, qué necesitas, qué te llevas y, si se verificó, el costo. */
export function QuickFacts({ data }: { data: QuickFactsData }) {
  return (
    <aside aria-label="Ficha rápida de la guía" className="not-prose relative mb-10 overflow-hidden rounded-[1.75rem] border-2 border-dashed border-brand/35 bg-brand-muted/25 p-6 sm:p-8">
      <span aria-hidden className="glow-brand pointer-events-none absolute -right-16 -top-16 size-56 opacity-50" />
      <p className={ui.eyebrow}>Antes de empezar</p>
      <dl className="mt-4 grid gap-x-8 gap-y-5 @container sm:grid-cols-2">
        <div className="flex gap-3">
          <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Tiempo aproximado</dt>
            <dd className="mt-0.5 text-[0.95rem] font-semibold leading-snug text-guide-ink">{data.time}</dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Target className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Al terminar tendrás</dt>
            <dd className="mt-0.5 text-[0.95rem] font-semibold leading-snug text-guide-ink">
              <Inline text={data.result} />
            </dd>
          </div>
        </div>
        <div className="flex gap-3 sm:col-span-2">
          <PackageCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Qué necesitas</dt>
            <dd className="mt-0.5">
              <ul className="flex flex-wrap gap-2">
                {data.needs.map((need) => (
                  <li key={need} className={ui.chip}>
                    {need}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </div>
        {data.cost && (
          <div className="flex gap-3 sm:col-span-2">
            <Wallet className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Costo aproximado</dt>
              <dd className="mt-0.5 text-[0.93rem] leading-snug text-foreground/90">
                <Inline text={data.cost} />
                {data.costVerifiedAt && <span className="text-muted-foreground"> (verificado el {formatDate(data.costVerifiedAt)})</span>}
              </dd>
            </div>
          </div>
        )}
      </dl>
    </aside>
  );
}
