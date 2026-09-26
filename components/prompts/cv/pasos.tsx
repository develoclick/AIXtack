import { Check } from "lucide-react";

export type EstadoPaso = "pendiente" | "activo" | "completo";

const PASOS = [
  { id: "paso-1", titulo: "Tus datos", ayuda: "Escribe o usa un ejemplo" },
  { id: "paso-2", titulo: "Tu prompt", ayuda: "Cópialo y pégalo en tu IA" },
  { id: "paso-3", titulo: "Tu Word", ayuda: "Pega la respuesta y descarga" },
] as const;

/** Indicador de los 3 pasos con el estado de cada uno (pendiente, activo, completo). Cada paso es un enlace a su sección. */
export function Pasos({ estados }: { estados: [EstadoPaso, EstadoPaso, EstadoPaso] }) {
  return (
    <nav aria-label="Pasos de la herramienta">
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {PASOS.map((p, i) => {
          const estado = estados[i];
          return (
            <li key={p.id} aria-current={estado === "activo" ? "step" : undefined}>
              <a
                href={`#${p.id}`}
                className={`tarjeta group flex min-h-16 flex-col items-start gap-2 p-3 transition-colors sm:flex-row sm:items-center sm:gap-3 sm:p-4 ${estado === "activo" ? "border-brand-solid ring-1 ring-brand-solid/30" : ""}`}
              >
                <span
                  aria-hidden
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular ${
                    estado === "completo" ? "bg-ok text-background" : estado === "activo" ? "bg-brand-solid text-white" : "border bg-surface text-muted-foreground"
                  }`}
                >
                  {estado === "completo" ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">
                    {p.titulo}
                    <span className="sr-only">
                      {" "}
                      — {estado === "completo" ? "completo" : estado === "activo" ? "paso actual" : "pendiente"}
                    </span>
                  </span>
                  <span className="mt-0.5 hidden text-xs leading-snug text-muted-foreground sm:block">{p.ayuda}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
