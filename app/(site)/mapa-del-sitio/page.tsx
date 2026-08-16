import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { listCategories } from "@/lib/content/categories";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Mapa del sitio",
  description: "Todas las secciones y categorías de Guía Prompts IA en un solo lugar.",
  path: "/mapa-del-sitio",
});

const mainSections = [
  { label: "Herramientas de IA", href: "/herramientas-ia" },
  { label: "Prompts", href: "/prompts" },
  { label: "Comparativas", href: "/comparativas" },
  { label: "Tutoriales", href: "/tutoriales" },
  { label: "Guías", href: "/guias" },
  { label: "Noticias", href: "/noticias" },
  { label: "Buscar", href: "/buscar" },
  { label: "Preguntas frecuentes", href: "/faq" },
];

const companySections = [
  { label: "Sobre nosotros", href: "/sobre-nosotros" },
  { label: "Autores", href: "/autores" },
  { label: "Política editorial", href: "/politica-editorial" },
  { label: "Contacto", href: "/contacto" },
];

const legalSections = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Política de cookies", href: "/cookies" },
  { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
  { label: "Aviso de afiliados", href: "/aviso-afiliados" },
];

function LinkList({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="text-sm text-muted-foreground hover:text-brand">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function SitemapPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Navegación"
        title="Mapa del sitio"
        description="Todas las páginas y categorías de Guía Prompts IA organizadas en un solo lugar."
      />

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <h2 className="text-sm font-semibold">Contenido</h2>
          <LinkList items={mainSections} />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Compañía</h2>
          <LinkList items={companySections} />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Legal</h2>
          <LinkList items={legalSections} />
        </div>
      </div>

      <div className="mt-14 border-t pt-10">
        <h2 className="text-sm font-semibold">Categorías ({categories.length})</h2>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categoria/${category.slug}`}
              className="truncate text-sm text-muted-foreground hover:text-brand"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">
        ¿Buscas el sitemap XML para motores de búsqueda?{" "}
        <a href="/sitemap.xml" className="underline underline-offset-2">
          Consúltalo aquí
        </a>
        .
      </p>
    </div>
  );
}
