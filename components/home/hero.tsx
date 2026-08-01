import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const stats = [
  { value: "500+", label: "Herramientas de IA" },
  { value: "1.200+", label: "Prompts listos" },
  { value: "100%", label: "En español" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 -z-20 bg-mesh-glow" />
      <div className="absolute inset-0 -z-10 bg-grid-fade" />

      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-32 lg:px-8">
        {/* Columna editorial: texto principal, alineado a la izquierda en escritorio */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-sm text-muted-foreground shadow-soft backdrop-blur">
            <Sparkles className="size-3.5 text-brand" />
            La comunidad de IA en español más completa
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Descubre, aprende y domina la{" "}
            <span className="text-gradient-brand">Inteligencia Artificial</span>
          </h1>

          <p className="mt-7 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
            Herramientas, prompts, comparativas, tutoriales y noticias — todo curado y explicado en
            español, para que aproveches la IA sin perderte en la jerga técnica.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/herramientas-ia"
              className={buttonVariants({ size: "lg", className: "gap-2 shadow-brand-glow" })}
            >
              Explorar herramientas
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/prompts"
              className={buttonVariants({ size: "lg", variant: "outline", className: "bg-background/60 backdrop-blur" })}
            >
              Ver biblioteca de prompts
            </Link>
          </div>
        </div>

        {/* Columna visual: panel flotante con las estadísticas, en capas para
            romper la simetría típica de un hero centrado. */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <div
            aria-hidden
            className="absolute -inset-x-6 -inset-y-8 -z-10 rounded-[2.5rem] border border-brand/10 bg-brand-muted/40 [mask-image:radial-gradient(closest-side,black,transparent)]"
          />

          <div className="glass-panel relative rounded-3xl border p-2 shadow-soft-lg">
            <div className="rounded-[1.35rem] border bg-card/60 p-6 sm:p-8">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand text-brand-foreground">
                <Sparkles className="size-4" />
              </span>

              <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between gap-4 border-t pt-5 first:border-t-0 first:pt-0 sm:flex-col sm:items-start sm:gap-1 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-5 sm:first:border-l-0 sm:first:pl-0 lg:flex-row lg:items-center lg:justify-between lg:border-l-0 lg:border-t lg:pl-0 lg:pt-5 lg:first:border-t-0 lg:first:pt-0"
                  >
                    <dd className="text-3xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
                      {stat.value}
                    </dd>
                    <dt className="text-sm text-muted-foreground sm:text-xs lg:text-sm">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Acento decorativo: capa visual pura (sin texto) para reforzar
              la profundidad de la composición. */}
          <div
            aria-hidden
            className="absolute -bottom-6 -left-6 -z-10 hidden size-28 rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/20 to-transparent shadow-soft-lg sm:block lg:-left-10"
          />
          <div
            aria-hidden
            className="absolute -top-8 -right-4 -z-10 hidden size-20 rounded-full border border-brand/20 bg-gradient-to-br from-brand/25 to-transparent sm:block"
          />
        </div>
      </div>
    </section>
  );
}
