import { listPublishedPosts } from "@/lib/content/posts";
import { toDate } from "@/lib/utils/format";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "AIXtack";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { items } = await listPublishedPosts({ pageSize: 50 });

  const feedItems = items
    .filter((post) => post.publishedAt)
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = toDate(post.publishedAt!).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ""}
      ${post.categories.map((category) => `<category>${escapeXml(category.name)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>Herramientas, prompts, comparativas, tutoriales y noticias de Inteligencia Artificial en español.</description>
    <language>es</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${feedItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
