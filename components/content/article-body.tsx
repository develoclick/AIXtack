/**
 * El contenido (`content`) proviene únicamente de autores/administradores
 * de confianza (no de usuarios finales), por lo que se renderiza como HTML
 * de forma directa. Si en el futuro se acepta HTML generado por usuarios,
 * debe sanitizarse (p.ej. con `sanitize-html`) antes de llegar aquí.
 */
export function ArticleBody({ html }: { html: string }) {
  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
