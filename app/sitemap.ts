import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/content/posts";
import { listPublishedTools } from "@/lib/content/tools";
import { listPublishedPrompts } from "@/lib/content/prompts";
import { listCategories } from "@/lib/content/categories";
import { listProfessions } from "@/lib/content/professions";
import tagsJson from "@/content/tags.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://guiapromptsia.com";

// Helper robusto para procesar fechas de modificación válidas
function getSafeDate(item: any): Date {
  const rawDate = item?.updatedAt || item?.publishedAt || item?.createdAt || item?.date;
  if (!rawDate) return new Date();
  const parsed = rawDate instanceof Date ? rawDate : new Date(rawDate);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ items: posts }, { items: tools }, { items: prompts }, categories, professions] =
    await Promise.all([
      listPublishedPosts({ pageSize: 5000 }),
      listPublishedTools({ pageSize: 5000 }),
      listPublishedPrompts({ pageSize: 5000 }),
      listCategories(),
      listProfessions(),
    ]);

  const tags = tagsJson as { slug: string; updatedAt?: string }[];
  const now = new Date();

  // 1. URLs estáticas principales
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now },
    { url: `${siteUrl}/herramientas-ia`, lastModified: now },
    { url: `${siteUrl}/prompts`, lastModified: now },
    { url: `${siteUrl}/prompts/profesiones`, lastModified: now },
    { url: `${siteUrl}/comparativas`, lastModified: now },
    { url: `${siteUrl}/noticias`, lastModified: now },
    { url: `${siteUrl}/tutoriales`, lastModified: now },
    { url: `${siteUrl}/guias`, lastModified: now },
    { url: `${siteUrl}/faq`, lastModified: now },
    { url: `${siteUrl}/contacto`, lastModified: now },
    { url: `${siteUrl}/sobre-nosotros`, lastModified: now },
    { url: `${siteUrl}/autores`, lastModified: now },
    { url: `${siteUrl}/politica-editorial`, lastModified: now },
    { url: `${siteUrl}/terminos-y-condiciones`, lastModified: now },
    { url: `${siteUrl}/privacidad`, lastModified: now },
    { url: `${siteUrl}/cookies`, lastModified: now },
    { url: `${siteUrl}/aviso-afiliados`, lastModified: now },
    { url: `${siteUrl}/creditos-de-imagenes`, lastModified: now },
  ];

  // 2. Artículos del Blog
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: getSafeDate(post),
  }));

  // 3. Fichas de Herramientas IA
  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}/herramientas-ia/${tool.slug}`,
    lastModified: getSafeDate(tool),
  }));

  // 4. Prompts por detalle
  const promptEntries: MetadataRoute.Sitemap = prompts.map((prompt) => ({
    url: `${siteUrl}/prompts/${prompt.slug}`,
    lastModified: getSafeDate(prompt),
  }));

  // 5. Categorías
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/categoria/${category.slug}`,
    lastModified: getSafeDate(category),
  }));

  // 6. Profesiones
  const professionEntries: MetadataRoute.Sitemap = professions.map((profession) => ({
    url: `${siteUrl}/prompts/profesiones/${profession.slug}`,
    lastModified: getSafeDate(profession),
  }));

  // 7. Etiquetas / Tags
  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${siteUrl}/etiqueta/${tag.slug}`,
    lastModified: getSafeDate(tag),
  }));

  return [
    ...staticEntries,
    ...postEntries,
    ...toolEntries,
    ...promptEntries,
    ...categoryEntries,
    ...professionEntries,
    ...tagEntries,
  ];
}