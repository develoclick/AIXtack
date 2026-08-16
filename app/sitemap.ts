import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/content/posts";
import { listPublishedTools } from "@/lib/content/tools";
import { listPublishedPrompts } from "@/lib/content/prompts";
import { listCategories } from "@/lib/content/categories";
import { listProfessions } from "@/lib/content/professions";
import tagsJson from "@/content/tags.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://guiapromptsia.com";

// Helper con 'any' para aceptar cualquier interfaz/tipo sin requerir firma de índice
function getSafeDate(item: any): Date | undefined {
  const rawDate = item?.updatedAt || item?.publishedAt || item?.createdAt || item?.date;
  if (!rawDate) return undefined;
  return rawDate instanceof Date ? rawDate : new Date(rawDate);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ items: posts }, { items: tools }, { items: prompts }, categories, professions] = await Promise.all([
    listPublishedPosts({ pageSize: 1000 }),
    listPublishedTools({ pageSize: 1000 }),
    listPublishedPrompts({ pageSize: 1000 }),
    listCategories(),
    listProfessions(),
  ]);
  const tags = tagsJson as { slug: string }[];

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/herramientas-ia`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/prompts`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/prompts/profesiones`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/comparativas`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/noticias`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/tutoriales`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/guias`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contacto`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/sobre-nosotros`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/autores`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/politica-editorial`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/mapa-del-sitio`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/terminos-y-condiciones`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/cookies`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/aviso-afiliados`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticEntries,
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: getSafeDate(post),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...tools.map((tool) => ({
      url: `${siteUrl}/herramientas-ia/${tool.slug}`,
      lastModified: getSafeDate(tool),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...prompts.map((prompt) => ({
      url: `${siteUrl}/prompts/${prompt.slug}`,
      lastModified: getSafeDate(prompt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/categoria/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...professions.map((profession) => ({
      url: `${siteUrl}/prompts/profesiones/${profession.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: `${siteUrl}/etiqueta/${tag.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}