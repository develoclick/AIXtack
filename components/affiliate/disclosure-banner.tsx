import { Info } from "lucide-react";

export function DisclosureBanner() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <p>
        Algunos enlaces de esta página son de afiliados. Si compras a través de ellos, podemos
        recibir una comisión sin coste adicional para ti.{" "}
        <a href="/aviso-afiliados" className="underline underline-offset-2 hover:text-foreground">
          Más información
        </a>
        .
      </p>
    </div>
  );
}
