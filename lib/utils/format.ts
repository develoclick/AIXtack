const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return dateFormatter.format(toDate(date));
}

export function toDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

const WORDS_PER_MINUTE = 200;

/** Minutos de lectura estimados a partir del recuento real de palabras del HTML del artículo. */
export function calculateReadingTime(html: string): number {
  const wordCount = html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
