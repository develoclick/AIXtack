import { Fragment, type ReactNode } from "react";

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

/** Texto en línea con **negrita** y `código`. Nada más: el contenido vive en los datos, sin HTML. */
export function Inline({ text }: { text: string }): ReactNode {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.86em] text-guide-ink">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

/** Uno o varios párrafos (separados por línea en blanco) con formato en línea. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={className ?? "max-w-[var(--guide-measure)] text-[1rem] leading-[1.75] text-foreground/90 [&:not(:first-child)]:mt-4"}>
          <Inline text={paragraph} />
        </p>
      ))}
    </>
  );
}
