import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function NewsletterCta() {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-foreground px-6 py-16 text-background shadow-soft-lg sm:px-16 sm:py-20">
      <div className="absolute inset-0 bg-hero-glow opacity-40" />
      <div className="absolute inset-0 bg-grid-fade opacity-20 invert" />
      <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-background/10 shadow-soft">
          <Mail className="size-5" />
        </span>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          No te pierdas ninguna novedad de IA
        </h2>
        <p className="mt-3 text-background/70">
          Un resumen semanal con las mejores herramientas, prompts y noticias, directo a tu email.
        </p>
        <div className="mt-8 w-full max-w-sm [&_input]:bg-background/10 [&_input]:text-background [&_input]:placeholder:text-background/50 [&_p]:text-background/60">
          <NewsletterForm source="home" />
        </div>
      </div>
    </div>
  );
}
