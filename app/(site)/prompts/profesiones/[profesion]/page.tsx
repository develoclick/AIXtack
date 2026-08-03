import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProfessionPromptExplorer } from "@/components/prompts/profession-prompt-explorer";
import { getProfessionBySlug, listProfessionPrompts, listProfessions } from "@/lib/content/professions";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, professionCollectionPageJsonLd } from "@/lib/seo/json-ld";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ profesion: string }>;
}

export async function generateStaticParams() {
  const professions = await listProfessions();
  return professions.map((profession) => ({ profesion: profession.slug }));
}

function resolveIcon(icon: string) {
  const Icon = icon in Icons ? (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] : Icons.Sparkles;
  return Icon ?? Icons.Sparkles;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { profesion } = await params;
  const profession = await getProfessionBySlug(profesion);
  if (!profession) return {};

  return buildMetadata({
    title: `Prompts de IA para ${profession.name} | Comunidad IA`,
    description: profession.seoDescription,
    path: `/prompts/profesiones/${profession.slug}`,
  });
}

export default async function ProfessionPage({ params }: PageProps) {
  const { profesion } = await params;
  const profession = await getProfessionBySlug(profesion);
  if (!profession) notFound();

  const prompts = await listProfessionPrompts(profession.slug);
  const Icon = resolveIcon(profession.icon);

  const breadcrumbItems = [
    { name: "Prompts", path: "/prompts" },
    { name: "Por profesión", path: "/prompts/profesiones" },
    { name: profession.name, path: `/prompts/profesiones/${profession.slug}` },
  ];

  const jsonLd = [
    breadcrumbJsonLd([{ name: "Inicio", path: "/" }, ...breadcrumbItems]),
    professionCollectionPageJsonLd(profession),
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

      <div className="flex items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand">
          <Icon className="size-7" />
        </span>
        <SectionHeading
          eyebrow={`${profession.promptCount} prompts`}
          title={`Prompts de IA para ${profession.name}`}
          description={profession.description}
        />
      </div>

      <div className="mt-10">
        <ProfessionPromptExplorer prompts={prompts} />
      </div>

      <p className="mt-14 border-t pt-8 text-center text-sm text-muted-foreground">
        Explora prompts de{" "}
        <Link href="/prompts/profesiones" className="text-brand underline underline-offset-2">
          otras profesiones
        </Link>{" "}
        o vuelve a la{" "}
        <Link href="/prompts" className="text-brand underline underline-offset-2">
          biblioteca general de prompts
        </Link>
        .
      </p>
    </div>
  );
}
