import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqEntry } from "@/lib/types";

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  return (
    <Accordion className="w-full overflow-hidden rounded-2xl border bg-card shadow-soft">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="not-last:border-b px-5">
          <AccordionTrigger className="py-4 text-left text-base font-medium">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
