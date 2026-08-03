import { Sparkles } from "lucide-react";

const stats = [
  { value: "+2000", label: "prompts profesionales" },
  { value: "+15", label: "profesiones" },
  { value: "3 IAs", label: "Compatible con las mejores IAs" },
];

export function ProfessionHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border">
      <div className="absolute inset-0 -z-20 bg-mesh-glow" />
      <div className="absolute inset-0 -z-10 bg-grid-fade" />

      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-8 sm:py-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-sm text-muted-foreground shadow-soft backdrop-blur">
          <Sparkles className="size-3.5 text-brand" />
          Prompts de IA por profesión
        </div>

        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          Los mejores prompts de IA para{" "}
          <span className="text-gradient-brand">cada profesión</span>
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
          Descubre prompts especializados para ChatGPT, Claude y Gemini diseñados para ayudarte a
          trabajar más rápido, automatizar tareas y mejorar tu productividad.
        </p>

        <dl className="mt-10 grid w-full max-w-xl grid-cols-3 gap-4 rounded-2xl border bg-card/60 p-6 shadow-soft backdrop-blur">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <dd className="text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</dd>
              <dt className="text-xs leading-snug text-muted-foreground sm:text-sm">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
