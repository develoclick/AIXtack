import type { Metadata } from "next";
import { FormularioPerfil } from "@/components/herramientas/panel-perfil";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { TEXTO_PRIVACIDAD } from "@/lib/herramientas/perfil";

// Página de uso, no de búsqueda: noindex y fuera del sitemap.
export const metadata: Metadata = buildMetadata({
  title: "Mi negocio",
  description: "Completa los datos de tu negocio una vez y se reutilizan en todas las herramientas. Se guardan solo en tu navegador.",
  path: "/mi-negocio",
  noIndex: true,
});

export default function MiNegocioPage() {
  return (
    <div className="herramienta-scope mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Breadcrumbs items={[{ name: "Mi negocio", path: "/mi-negocio" }]} />
      <h1 className="text-balance text-3xl font-semibold tracking-tight text-guide-ink sm:text-4xl">Mi negocio</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Completa estos datos una vez y las herramientas los usarán para escribir con el nombre, el tono y los datos de tu negocio. Todos son opcionales.</p>
      <p className="mt-3 rounded-lg border bg-guide-surface px-4 py-3 text-[0.97rem] font-medium text-guide-ink">{TEXTO_PRIVACIDAD}</p>
      <div className="mt-8">
        <FormularioPerfil />
      </div>
    </div>
  );
}
