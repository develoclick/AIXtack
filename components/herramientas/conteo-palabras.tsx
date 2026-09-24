import type { EstadoPreproceso } from "@/lib/herramientas/preprocesos";

/**
 * Conteo en vivo de las palabras del texto que irá en la pieza (afiche…). Lo cuenta la página con `contarPalabras()`, no la IA.
 * Si se pasa del máximo, es un aviso: no bloquea nada (se puede copiar el prompt igualmente).
 */
export function ConteoPalabras({ estado, maximo }: { estado: EstadoPreproceso; maximo: number }) {
  const total = estado.resultados.find((r) => r.id === "total")?.valor ?? 0;
  const niveles = estado.resultados.filter((r) => r.id.startsWith("nivel:"));
  const sobran = total - maximo;

  return (
    <section aria-labelledby="conteo-palabras-titulo" className="rounded-xl border bg-guide-surface p-4 sm:p-5">
      <h3 id="conteo-palabras-titulo" className="sr-only">
        Conteo de palabras de tus datos
      </h3>
      <p role="status" aria-live="polite" data-conteo-palabras className="text-[1.02rem] text-guide-ink">
        Tus datos suman <strong className="tabular-nums">{total}</strong> {total === 1 ? "palabra" : "palabras"} (máximo {maximo}).
      </p>
      {total > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          {niveles.map((n) => `${n.etiqueta}: ${n.valor}`).join(" · ")}. Las cuenta esta página, no la IA.
        </p>
      )}
      {sobran > 0 && (
        <p data-aviso-palabras className="mt-2 text-sm font-medium text-risk">
          Pasas del máximo por {sobran} {sobran === 1 ? "palabra" : "palabras"}. Puedes copiar el prompt igualmente, pero un afiche con menos texto se lee mejor: acorta tus datos si puedes.
        </p>
      )}
    </section>
  );
}
