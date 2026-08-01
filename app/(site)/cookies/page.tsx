import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Política de cookies",
  description: "Qué cookies utiliza AIXtack y para qué se usan.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1>Política de cookies</h1>
      <p>Utilizamos distintos tipos de cookies para que AIXtack funcione correctamente:</p>
      <ul>
        <li>
          <strong>Cookies técnicas:</strong> necesarias para el funcionamiento básico del sitio
          (preferencias de tema, sesión).
        </li>
        <li>
          <strong>Cookies analíticas:</strong> nos ayudan a entender cómo se usa el sitio para
          mejorarlo. Solo se activan con tu consentimiento.
        </li>
        <li>
          <strong>Cookies publicitarias:</strong> usadas por Google AdSense para mostrar anuncios
          relevantes. Solo se activan con tu consentimiento.
        </li>
      </ul>
      <p>
        Puedes cambiar tu decisión en cualquier momento borrando las cookies de tu navegador, lo
        que hará que el banner de consentimiento vuelva a aparecer.
      </p>
    </div>
  );
}
