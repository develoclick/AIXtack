import { ProfessionHero } from "@/components/prompts/profession-hero";
import { ProfessionCard } from "@/components/prompts/profession-card";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { listProfessions } from "@/lib/content/professions";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, professionsItemListJsonLd } from "@/lib/seo/json-ld";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Prompts de IA por profesión | Comunidad IA",
    description:
      "Descubre los mejores prompts de IA para cada profesión. Prompts especializados para ChatGPT, Claude y Gemini que te ayudan a trabajar más rápido.",
    path: "/prompts/profesiones",
  });
}

export default async function ProfessionsHubPage() {
  const professions = await listProfessions();

  const breadcrumbItems = [
    { name: "Prompts", path: "/prompts" },
    { name: "Por profesión", path: "/prompts/profesiones" },
  ];

  const jsonLd = [
    breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems]),
    professionsItemListJsonLd(professions),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <Breadcrumbs items={breadcrumbItems} />

      <ProfessionHero />

      <section className="mt-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {professions.map((profession, index) => (
            <ScrollReveal key={profession.id} delay={Math.min(index, 5) * 0.05}>
              <ProfessionCard profession={profession} />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
