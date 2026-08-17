import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo/metadata";
import { flagshipCategoryImages, professionImages } from "@/lib/images";
import toolsJson from "@/content/tools.json";
import postsJson from "@/content/posts.json";
import type { ImageCredit } from "@/lib/types";

export const metadata = buildMetadata({
  title: "Créditos de imágenes",
  description: "Atribución de las fotografías de Unsplash utilizadas en Guía Prompts IA.",
  path: "/creditos-de-imagenes",
});

interface ToolRaw {
  name: string;
  logoCredit?: ImageCredit | null;
}

interface PostRaw {
  title: string;
  coverImageCredit?: ImageCredit | null;
}

function collectCredits() {
  const seen = new Map<string, { credit: ImageCredit; usedBy: Set<string> }>();

  function add(credit: ImageCredit | null | undefined, usedBy: string) {
    if (!credit) return;
    const key = credit.photoPageUrl;
    const entry = seen.get(key);
    if (entry) entry.usedBy.add(usedBy);
    else seen.set(key, { credit, usedBy: new Set([usedBy]) });
  }

  (toolsJson as ToolRaw[]).forEach((t) => add(t.logoCredit, t.name));
  (postsJson as PostRaw[]).forEach((p) => add(p.coverImageCredit, p.title));
  Object.values(flagshipCategoryImages).forEach((c) => add(c.credit, c.alt));
  Object.values(professionImages).forEach((p) => add(p.credit, p.alt));

  return [...seen.values()].sort((a, b) => a.credit.photographerName.localeCompare(b.credit.photographerName));
}

export default function ImageCreditsPage() {
  const credits = collectCredits();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Atribución"
        title="Créditos de imágenes"
        description="Las fotografías que ilustran las herramientas, artículos, categorías y profesiones de este sitio provienen de Unsplash. Gracias a cada fotógrafo por compartir su trabajo."
      />

      {credits.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Todavía no hay fotografías con atribución registrada.</p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {credits.map(({ credit, usedBy }) => (
            <li key={credit.photoPageUrl} className="rounded-xl border bg-card p-4 text-sm">
              <a
                href={`${credit.photographerUrl}?utm_source=guia-prompts-ia&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand underline underline-offset-2"
              >
                {credit.photographerName}
              </a>{" "}
              <span className="text-muted-foreground">en Unsplash</span>
              <p className="mt-1 truncate text-xs text-muted-foreground" title={[...usedBy].join(", ")}>
                Usada en: {[...usedBy].slice(0, 2).join(", ")}
                {usedBy.size > 2 ? ` y ${usedBy.size - 2} más` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 border-t pt-8 text-sm text-muted-foreground">
        Todas las fotografías se sirven directamente desde el CDN de Unsplash (images.unsplash.com), tal y como exige
        su licencia. Puedes ver el catálogo completo en{" "}
        <a
          href="https://unsplash.com/?utm_source=guia-prompts-ia&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline underline-offset-2"
        >
          unsplash.com
        </a>
        .
      </p>
    </div>
  );
}
