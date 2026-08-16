import { SectionHeading } from "@/components/shared/section-heading";
import { PostGrid } from "@/components/content/post-grid";
import { Pagination } from "@/components/shared/pagination";
import { TopBannerAd } from "@/components/ads/top-banner-ad";
import { MultiplexAd } from "@/components/ads/multiplex-ad";
import { listPublishedPosts } from "@/lib/content/posts";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import type { PostType } from "@/lib/types";

export async function PostTypeListing({
  type,
  basePath,
  eyebrow,
  title,
  description,
  page,
  topBannerSlotId,
  multiplexSlotId,
  image,
}: {
  type: PostType;
  basePath: string;
  eyebrow: string;
  title: string;
  description: string;
  page: number;
  topBannerSlotId: string;
  multiplexSlotId: string;
  image?: { src: string; alt: string };
}) {
  const { items, totalPages } = await listPublishedPosts({ type, page, pageSize: 12 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Inicio", path: "/" },
              { name: title, path: basePath },
            ])
          ),
        }}
      />

      <SectionHeading eyebrow={eyebrow} title={title} description={description} image={image} />
{/*
      <div className="mt-8">
        <TopBannerAd slotId={topBannerSlotId} />
      </div>
*/}
      <div className="mt-8">
        <PostGrid posts={items} />
      </div>

      {/* Solo en la primera página: en páginas siguientes el bloque quedaría
          repetido sin aportar valor nuevo al usuario. */}
      {page === 1 && items.length > 0 && (
        <div className="mt-10">
          <MultiplexAd slotId={multiplexSlotId} />
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={basePath} />
    </div>
  );
}
