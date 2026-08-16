import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { SectionHeading } from "@/components/shared/section-heading";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { PostGrid } from "@/components/content/post-grid";
import { ToolGrid } from "@/components/tools/tool-grid";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { buttonVariants } from "@/components/ui/button";
import { TopBannerAd } from "@/components/ads/top-banner-ad";
import { MultiplexAd } from "@/components/ads/multiplex-ad";
import { listCategories } from "@/lib/content/categories";
import { listPublishedPosts } from "@/lib/content/posts";
import { listPublishedTools } from "@/lib/content/tools";
import { listPublishedPrompts } from "@/lib/content/prompts";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Guía Prompts IA — Herramientas, prompts y noticias de Inteligencia Artificial en español",
  description:
    "Descubre las mejores herramientas de IA, una biblioteca de prompts, comparativas, tutoriales, guías y noticias — todo en español.",
  path: "/",
});

export default async function HomePage() {
  const [categories, latestPosts, tools, prompts] = await Promise.all([
    listCategories(),
    listPublishedPosts({ pageSize: 6 }),
    listPublishedTools({ pageSize: 6 }),
    listPublishedPrompts({ pageSize: 6 }),
  ]);

  return (
    <>
      <Hero />

{/* 
<section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
  <TopBannerAd slotId="1000000002" />
</section> 
*/}

      <section className="relative overflow-hidden bg-muted/20 py-16 sm:py-20">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid-fade opacity-50" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Explora por categoría"
              title="Encuentra justo lo que necesitas"
              description="Navega por categorías temáticas: generación de imágenes, escritura, productividad, código y mucho más."
            />
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="mt-10">
            <FeaturedCategories categories={categories} />
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Directorio" title="Herramientas de IA destacadas" />
            <Link href="/herramientas-ia" className={buttonVariants({ variant: "ghost", className: "gap-1" })}>
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="mt-10">
          <ToolGrid tools={tools.items} />
        </ScrollReveal>
      </section>

      <section className="relative overflow-hidden bg-muted/20 py-16 sm:py-20">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid-fade opacity-50" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Biblioteca" title="Prompts listos para copiar" />
              <Link href="/prompts" className={buttonVariants({ variant: "ghost", className: "gap-1" })}>
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="mt-10">
            <PromptGrid prompts={prompts.items} />
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Contenido" title="Últimas publicaciones" />
            <Link href="/noticias" className={buttonVariants({ variant: "ghost", className: "gap-1" })}>
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="mt-10">
          <PostGrid posts={latestPosts.items} />
        </ScrollReveal>
      </section>

    
{/*
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <ScrollReveal>
          <NewsletterCta />
        </ScrollReveal>
      </section>*/}
    </>
  );
}
