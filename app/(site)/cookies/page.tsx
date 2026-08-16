import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Política de cookies",
  description: "Qué cookies utiliza Guía Prompts IA y para qué se usan.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1>Política de cookies</h1>
      <p>
        Una cookie es un pequeño archivo de texto que un sitio web guarda en tu navegador cuando lo
        visitas. Sirve para recordar información sobre tu visita, como tu idioma preferido u otras
        configuraciones, lo que puede facilitar tu próxima visita y hacer que el sitio te resulte
        más útil. En guiapromptsia.com utilizamos distintos tipos de cookies para que Guía Prompts
        IA funcione correctamente y, cuando das tu consentimiento, para mostrarte publicidad
        relevante.
      </p>

      <h2>Tipos de cookies que utilizamos</h2>
      <ul>
        <li>
          <strong>Cookies técnicas o necesarias:</strong> imprescindibles para el funcionamiento
          básico del sitio (preferencias de tema claro/oscuro, recordar si ya aceptaste el banner
          de cookies). No requieren consentimiento porque no tratan datos con fines analíticos ni
          publicitarios.
        </li>
        <li>
          <strong>Cookies analíticas:</strong> nos ayudan a entender qué páginas se visitan más y
          cómo navegan los usuarios, de forma agregada, para mejorar el contenido. Solo se activan
          si aceptas el banner de consentimiento.
        </li>
        <li>
          <strong>Cookies publicitarias y de terceros:</strong> utilizadas por Google AdSense y por
          la plataforma DoubleClick de Google para mostrar anuncios relevantes según tu navegación
          y medir su rendimiento. Solo se activan con tu consentimiento explícito.
        </li>
      </ul>

      <h2>Cookies de Google AdSense / DoubleClick</h2>
      <p>
        Cuando aceptas cookies publicitarias, Google y sus socios de la red de DoubleClick pueden
        instalar cookies en tu navegador para personalizar los anuncios que ves en guiapromptsia.com
        y en otros sitios, así como para limitar el número de veces que ves un mismo anuncio.
        Puedes consultar y gestionar estas preferencias directamente en la{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          configuración de anuncios de Google
        </a>
        .
      </p>

      <h2>Cómo gestionar las cookies</h2>
      <p>
        Puedes aceptar, rechazar o modificar tu decisión sobre cookies no esenciales en cualquier
        momento desde el banner de consentimiento que aparece al visitar el sitio. También puedes
        eliminar las cookies ya almacenadas desde la configuración de tu navegador; ten en cuenta
        que si bloqueas todas las cookies, algunas funciones del sitio podrían no funcionar
        correctamente.
      </p>

      <h2>Más información</h2>
      <p>
        Para conocer con más detalle cómo tratamos tus datos personales, consulta nuestra{" "}
        <a href="/privacidad">política de privacidad</a>.
      </p>
    </div>
  );
}
