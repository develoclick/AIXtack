import type { ImageCredit } from "@/lib/types";

export function PhotoCredit({ credit, className }: { credit: ImageCredit | null | undefined; className?: string }) {
  if (!credit) return null;

  return (
    <p className={className ?? "mt-2 text-xs text-muted-foreground"}>
      Foto de{" "}
      <a
        href={`${credit.photographerUrl}?utm_source=guia-prompts-ia&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        {credit.photographerName}
      </a>{" "}
      en{" "}
      <a
        href="https://unsplash.com/?utm_source=guia-prompts-ia&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        Unsplash
      </a>
    </p>
  );
}
