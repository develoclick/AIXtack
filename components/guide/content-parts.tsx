import type { ContentPart } from "@/lib/guides/model";
import { DataTable } from "./comparison-table";
import { ImageBlock } from "./image-block";
import { Inline, RichText } from "./rich-text";

/** Renderiza las piezas de contenido de un resultado o de un bloque antes/después. */
export function ContentParts({ parts }: { parts: ContentPart[] }) {
  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        switch (part.type) {
          case "text":
            return (
              <div key={index}>
                <RichText text={part.text} className="text-[0.97rem] leading-[1.7] text-foreground/90 [&:not(:first-child)]:mt-3" />
              </div>
            );
          case "list": {
            const List = part.ordered ? "ol" : "ul";
            return (
              <List key={index} className={`space-y-1.5 pl-5 text-[0.97rem] leading-[1.65] text-foreground/90 ${part.ordered ? "list-decimal" : "list-disc"}`}>
                {part.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1 marker:text-muted-foreground">
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "code":
            return (
              <pre
                key={index}
                className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border bg-background p-4 font-mono text-[0.84rem] leading-relaxed text-guide-ink"
              >
                <code>{part.code}</code>
              </pre>
            );
          case "table":
            return <DataTable key={index} table={part.table} />;
          case "image":
            return <ImageBlock key={index} image={part.image} />;
        }
      })}
    </div>
  );
}
