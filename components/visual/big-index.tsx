import { cn } from "@/lib/utils";

/** Numeral gigante decorativo (01, 02…). Solo contorno o tenue: nunca compite con el texto. */
export function BigIndex({ value, variant = "outline", className }: { value: number | string; variant?: "outline" | "soft"; className?: string }) {
  const text = typeof value === "number" ? String(value).padStart(2, "0") : value;
  return (
    <span aria-hidden className={cn("block select-none", variant === "outline" ? "numeral-outline" : "numeral-soft", className)}>
      {text}
    </span>
  );
}
