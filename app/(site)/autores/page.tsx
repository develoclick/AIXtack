import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/section-heading";
import { listAuthors } from "@/lib/content/authors";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Autores",
  description: "Quién produce el contenido de Guía Prompts IA y cómo se organiza el trabajo editorial.",
  path: "/autores",
});

const roleLabel: Record<"ADMIN" | "EDITOR", string> = {
  ADMIN: "Gestión editorial y legal",
  EDITOR: "Producción de contenido",
};

export default async function AuthorsPage() {
  const authors = await listAuthors();
  const totalPosts = authors.reduce((sum, author) => sum + author.publishedPostCount, 0);
  const entityName = authors[0]?.name ?? "Guía Prompts IA";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Equipo"
        title="Quién está detrás de Guía Prompts IA"
        description="El sitio no lo produce una redacción de decenas de periodistas, sino un equipo pequeño que combina desarrollo técnico y redacción especializada. Así se organiza el trabajo."
      />

      <div className="mt-12 flex items-center gap-4 rounded-2xl border bg-card p-6">
        <Avatar className="size-16 shrink-0">
          <AvatarImage src={authors[0]?.image ?? undefined} alt={entityName} />
          <AvatarFallback className="text-lg">{entityName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{entityName}</h2>
          <p className="text-sm text-muted-foreground">
            Empresa responsable de Guía Prompts IA · {totalPosts} {totalPosts === 1 ? "publicación" : "publicaciones"} firmadas
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {authors.map((author) => (
          <div key={author.id} className="rounded-2xl border bg-card p-6">
            <p className="text-sm font-semibold text-brand">{roleLabel[author.role]}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{author.bio}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {author.publishedPostCount} {author.publishedPostCount === 1 ? "publicación firmada" : "publicaciones firmadas"} bajo este rol
            </p>
          </div>
        ))}
      </div>

      <p className="mt-12 border-t pt-8 text-sm text-muted-foreground">
        Todo el contenido pasa por revisión editorial antes de publicarse. Consulta nuestra{" "}
        <a href="/politica-editorial" className="text-brand underline underline-offset-2">
          política editorial
        </a>{" "}
        para saber cómo trabajamos, o escríbenos desde{" "}
        <a href="/contacto" className="text-brand underline underline-offset-2">
          contacto
        </a>{" "}
        si tienes cualquier duda.
      </p>
    </div>
  );
}
