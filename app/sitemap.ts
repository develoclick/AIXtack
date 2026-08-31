import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/content/posts";
import { listPublishedTools } from "@/lib/content/tools";
import { listPublishedPrompts } from "@/lib/content/prompts";
import { listCategories } from "@/lib/content/categories";
import { listProfessions } from "@/lib/content/professions";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://guiapromptsia.com";

// Helper robusto para procesar fechas de modificación válidas — acepta
// cualquiera de los tipos de contenido (posts, tools, prompts, categorías,
// profesiones), que no comparten un campo de fecha común.
function getSafeDate(item: unknown): Date {
  const record = item as Record<string, string | Date | null | undefined> | null | undefined;
  const rawDate = record?.updatedAt ?? record?.publishedAt ?? record?.createdAt ?? record?.date;
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

  const now = new Date();

  // 1. URLs estáticas principales
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/herramientas-ia`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/prompts`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/prompts/profesiones`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/comparativas`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/noticias`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/tutoriales`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/guias`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/alternativas`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/sobre-nosotros`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/autores`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/politica-editorial`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terminos-y-condiciones`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/aviso-afiliados`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/creditos-de-imagenes`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
  ];

  // 2. Artículos del Blog
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: getSafeDate(post),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 3. Fichas de Herramientas IA
  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}/herramientas-ia/${tool.slug}`,
    lastModified: getSafeDate(tool),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Prompts por detalle
  const promptEntries: MetadataRoute.Sitemap = prompts.map((prompt) => ({
    url: `${siteUrl}/prompts/${prompt.slug}`,
    lastModified: getSafeDate(prompt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // 5. Categorías
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/categoria/${category.slug}`,
    lastModified: getSafeDate(category),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // 6. Profesiones
  const professionEntries: MetadataRoute.Sitemap = professions.map((profession) => ({
    url: `${siteUrl}/prompts/profesiones/${profession.slug}`,
    lastModified: getSafeDate(profession),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Las páginas de /etiqueta/[slug] son noindex (filtro de navegación sin
  // contenido propio, ver app/(site)/etiqueta/[slug]/page.tsx) — no se listan
  // aquí para no contradecir esa señal ante Google.

  // 7. Alternativas (herramientas con al menos un competidor real en su categoría)
  const toolsByCategory = new Map<string, number>();
  tools.forEach((tool) => {
    const slug = tool.category?.slug;
    if (slug) toolsByCategory.set(slug, (toolsByCategory.get(slug) ?? 0) + 1);
  });
  const alternativeEntries: MetadataRoute.Sitemap = tools
    .filter((tool) => tool.category && (toolsByCategory.get(tool.category.slug) ?? 0) > 1)
    .map((tool) => ({
      url: `${siteUrl}/alternativas/${tool.slug}`,
      lastModified: getSafeDate(tool),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [
    ...staticEntries,
    ...postEntries,
    ...toolEntries,
    ...promptEntries,
    ...categoryEntries,
    ...professionEntries,
    ...alternativeEntries,
  ];
}