import { ui } from "@/components/guide/ui";
import { cn } from "@/lib/utils";

/**
 * Componentes SOLO de esta guía (marketing/crear-promociones-con-ia). Son HTML con texto real y
 * accesible, nunca una imagen que finja ser una captura. La pastilla «Ilustración» y «Caso ficticio»
 * dejan claro que no es una prueba real. Ninguno inventa datos: las cifras salen de `data.ts`.
 */

const badge = "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

function Tag({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "brand" }) {
  return <span className={cn(badge, tone === "brand" && "border-brand/40 bg-brand-muted text-brand")}>{children}</span>;
}

interface Cuenta {
  titulo: string;
  cuenta: string;
  ventas: string;
}

/** «Ilustración: el error más frecuente»: el mismo dato, con el 15 % aplicado al margen y al precio. */
export function ErrorFrecuente({ incorrecto, correcto, nota }: { incorrecto: Cuenta; correcto: Cuenta; nota: string }) {
  return (
    <figure className={cn(ui.block, "not-prose overflow-hidden rounded-2xl border bg-background")}>
      <figcaption className="flex flex-wrap items-center gap-2 border-b bg-guide-surface px-5 py-3">
        <Tag tone="brand">Ilustración: el error más frecuente</Tag>
        <Tag>Caso ficticio</Tag>
      </figcaption>
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-xl border border-risk/40 bg-risk-muted/40 p-4">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-risk">Incorrecto</p>
          <p className="mt-2 text-[0.95rem] font-semibold leading-snug text-guide-ink">{incorrecto.titulo}</p>
          <p className="mt-2 font-mono text-[0.9rem] text-guide-ink line-through decoration-risk/60">{incorrecto.cuenta}</p>
          <p className="mt-1 text-sm text-muted-foreground">Ventas necesarias: {incorrecto.ventas}</p>
        </div>
        <div className="rounded-xl border border-ok/40 bg-ok-muted/40 p-4">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ok">Correcto</p>
          <p className="mt-2 text-[0.95rem] font-semibold leading-snug text-guide-ink">{correcto.titulo}</p>
          <p className="mt-2 font-mono text-[0.9rem] text-guide-ink">{correcto.cuenta}</p>
          <p className="mt-1 text-sm text-muted-foreground">Ventas necesarias: {correcto.ventas}</p>
        </div>
      </div>
      <p className="border-t px-5 py-3.5 text-sm leading-relaxed text-foreground/90 sm:px-6">
        Aplicar el 15 % al margen en lugar de al precio da {incorrecto.cuenta}; lo correcto es {correcto.cuenta}, y las ventas necesarias pasan de {incorrecto.ventas} a {correcto.ventas}. {nota}
      </p>
    </figure>
  );
}
