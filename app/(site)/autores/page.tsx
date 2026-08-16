import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/section-heading";
import { listAuthors } from "@/lib/content/authors";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Autores",
  description: "Conoce al equipo editorial detrás del contenido de Guía Prompts IA.",
  path: "/autores",
});

const roleLabel: Record<"ADMIN" | "EDITOR", string> = {
  ADMIN: "Fundadora y editora en jefe",
  EDITOR: "Editor de contenido",
};

export default async function AuthorsPage() {
  const authors = await listAuthors();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Equipo"
        title="Autores"
        description="Las personas que investigan, prueban y redactan cada herramienta, comparativa y guía publicada en Guía Prompts IA."
      />

      <div className="mt-12 flex flex-col gap-10">
        {authors.map((author) => (
          <div key={author.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row">
            <Avatar className="size-16 shrink-0">
              <AvatarImage src={author.image ?? undefined} alt={author.name ?? ""} />
              <AvatarFallback className="text-lg">{author.name?.charAt(0) ?? "A"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{author.name}</h2>
              <p className="text-sm font-medium text-brand">{roleLabel[author.role]}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{author.bio}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {author.publishedPostCount}{" "}
                {author.publishedPostCount === 1 ? "publicación" : "publicaciones"} en Guía Prompts IA
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 border-t pt-8 text-sm text-muted-foreground">
        Todo el contenido pasa por revisión editorial antes de publicarse. Consulta nuestra{" "}
        <a href="/politica-editorial" className="text-brand underline underline-offset-2">
          política editorial
        </a>{" "}
        para saber cómo trabajamos.
      </p>
    </div>
  );
}
