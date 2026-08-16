import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { professionImages } from "@/lib/images";
import type { ProfessionSummary } from "@/lib/types";

function resolveIcon(icon: string) {
  const Icon = icon in Icons ? (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] : Icons.Sparkles;
  return Icon ?? Icons.Sparkles;
}

export function ProfessionCard({ profession }: { profession: ProfessionSummary }) {
  const Icon = resolveIcon(profession.icon);
  const illustration = professionImages[profession.slug];

  return (
    <Link
      href={`/prompts/profesiones/${profession.slug}`}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg"
    >
      {!illustration && (
        <div
          aria-hidden
          className="absolute -right-8 -top-8 size-28 rounded-full bg-brand-muted/50 transition-transform duration-500 group-hover:scale-110"
        />
      )}

      {illustration ? (
        <Image
          src={illustration.src}
          alt=""
          width={112}
          height={112}
          className="relative z-10 size-16 transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-brand-muted text-brand">
          <Icon className="size-6" />
        </span>
      )}

      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold tracking-tight group-hover:text-brand">{profession.name}</h3>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {profession.promptCount}+ prompts
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{profession.description}</p>
      </div>

      <div className="relative z-10 mt-auto flex items-center gap-1.5 border-t pt-4 text-sm font-medium text-brand">
        Explorar
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
