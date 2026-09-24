const dateFormatter = new Intl.DateTimeFormat("es-419", {
  day: "numeric",
  month: "long",
  year: "numeric",
  // Las fechas del sitio son fechas de calendario (AAAA-MM-DD): se formatean en UTC
  // para que no cambien de día según la zona horaria del servidor o del lector.
  timeZone: "UTC",
});

/** Formatea una fecha AAAA-MM-DD (o Date) como "18 de septiembre de 2026". */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return dateFormatter.format(typeof date === "string" ? new Date(`${date.slice(0, 10)}T00:00:00Z`) : date);
}
