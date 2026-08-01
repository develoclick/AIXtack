import { SectionHeading } from "@/components/shared/section-heading";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { EmptyState } from "@/components/shared/empty-state";
import { listFaq } from "@/lib/content/faq";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd } from "@/lib/seo/json-ld";

export const metadata = buildMetadata({
  title: "Preguntas frecuentes",
  description: "Resolvemos las dudas más habituales sobre AIXtack, nuestras herramientas y contenidos.",
  path: "/faq",
});

export default async function FaqPage() {
  const items = await listFaq();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(items)) }}
        />
      )}

      <SectionHeading
        eyebrow="Ayuda"
        title="Preguntas frecuentes"
        description="Todo lo que necesitas saber sobre AIXtack."
        align="center"
      />

      <div className="mt-12">
        {items.length > 0 ? (
          <FaqAccordion items={items} />
        ) : (
          <EmptyState title="Sin preguntas todavía" description="Vuelve pronto." />
        )}
      </div>
    </div>
  );
}
