import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Aviso de afiliados",
  description: "Cómo funcionan los enlaces de afiliados en AIXtack.",
  path: "/aviso-afiliados",
});

export default function AffiliateDisclosurePage() {
  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1>Aviso de afiliados</h1>
      <p>
        Algunos de los enlaces hacia herramientas de terceros que aparecen en AIXtack son enlaces
        de afiliados. Esto significa que, si haces clic y realizas una compra o te suscribes a
        través de ellos, podemos recibir una comisión, sin ningún coste adicional para ti.
      </p>
      <p>
        Esto nos ayuda a mantener la plataforma gratuita y seguir creando contenido en español
        sobre inteligencia artificial. Nuestras recomendaciones y valoraciones son siempre
        independientes y se basan en el análisis real de cada herramienta.
      </p>
    </div>
  );
}
