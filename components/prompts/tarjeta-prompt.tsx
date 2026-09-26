import Link from "next/link";
import { ArrowRight, Clock, FileDown } from "lucide-react";
import { getCategoria } from "@/content/categorias";
import { rutaDePrompt, type PromptMeta } from "@/content/prompts";

export function TarjetaPrompt({ prompt, destacada = false }: { prompt: PromptMeta; destacada?: boolean }) {
  const categoria = getCategoria(prompt.categoria);
  return (
    <Link
      href={rutaDePrompt(prompt)}
      className={`tarjeta tarjeta-enlace group flex h-full flex-col p-5 ${destacada ? "sm:p-7" : ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">{categoria?.nombre}</p>
      <h3 className={`mt-2 font-semibold leading-snug tracking-tight ${destacada ? "text-2xl" : "text-lg"}`}>{prompt.tituloCorto}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{prompt.resumen}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden className="size-4" />
          {prompt.tiempo}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileDown aria-hidden className="size-4" />
          Descarga en Word
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-foreground">
          Abrir <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
