import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Política de privacidad",
  description: "Cómo tratamos tus datos personales en Guía Prompts IA.",
  path: "/privacidad",
});

export default function PrivacyPage() {
  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1>Política de privacidad</h1>
      <p>
        En Guía Prompts IA respetamos tu privacidad. Esta página explica qué datos recogemos, con qué
        finalidad, y qué papel tienen los proveedores de publicidad como Google en ese
        tratamiento.
      </p>

      <h2>Responsable del tratamiento</h2>
      <p>
        Guía Prompts IA es el responsable del tratamiento de los datos recogidos a través de este sitio.
        Para cualquier consulta sobre esta política, puedes escribirnos a{" "}
        <a href="mailto:contacto@guiapromptsia.com">contacto@guiapromptsia.com</a>.
      </p>

      <h2>Datos que recogemos</h2>
      <ul>
        <li>Email, si te suscribes a la newsletter o nos contactas por el formulario.</li>
        <li>Datos de cuenta si te registras (nombre, email, foto de perfil).</li>
        <li>
          Datos de navegación (páginas vistas, dispositivo, ubicación aproximada) recogidos con
          fines analíticos y publicitarios, solo con tu consentimiento previo.
        </li>
      </ul>

      <h2>Cookies y publicidad de Google</h2>
      <p>
        Usamos Google AdSense para mostrar anuncios en guiapromptsia.com. Google y sus proveedores
        de tecnología publicitaria, incluido DoubleClick (la plataforma de anuncios de Google), son
        proveedores externos que utilizan cookies —como la cookie DART de DoubleClick, entre
        otras— para mostrar anuncios basados en tus visitas anteriores a este sitio o a otros
        sitios en internet. El uso de estas cookies permite a Google, a DoubleClick y a sus socios
        publicitarios mostrar anuncios relevantes según tu navegación.
      </p>
      <p>
        Estos terceros pueden recopilar datos técnicos (dirección IP aproximada, tipo de
        dispositivo, navegador, páginas visitadas) para medir el rendimiento de los anuncios y
        evitar mostrarte el mismo anuncio repetidamente. Guía Prompts IA no vende estos datos ni
        los combina con información que te identifique directamente.
      </p>
      <p>
        Puedes inhabilitar el uso de la cookie de publicidad de Google visitando la{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          configuración de anuncios de Google
        </a>
        . También puedes visitar{" "}
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
          www.aboutads.info/choices
        </a>{" "}
        para inhabilitar el uso de cookies de otros proveedores de publicidad de terceros. Más
        información sobre cómo Google usa los datos en{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          policies.google.com/technologies/partner-sites
        </a>
        .
      </p>
      <p>
        Todas las cookies no esenciales (analíticas y publicitarias) están desactivadas por
        defecto y solo se activan si aceptas el banner de consentimiento. Puedes cambiar tu
        decisión en cualquier momento; más detalles en nuestra{" "}
        <a href="/cookies">política de cookies</a>.
      </p>

      <h2>Menores de edad</h2>
      <p>
        Guía Prompts IA no está dirigido a menores de 16 años y no recogemos conscientemente datos
        personales de menores de esa edad. Si crees que un menor nos ha proporcionado datos
        personales, contáctanos para eliminarlos.
      </p>

      <h2>Conservación de datos</h2>
      <p>
        Conservamos los datos de tu cuenta mientras esté activa, y los datos de contacto o
        newsletter hasta que solicites su eliminación o te des de baja. Los datos analíticos
        agregados se conservan de forma anonimizada.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar el acceso, rectificación, portabilidad o eliminación de tus datos, así
        como oponerte a su tratamiento, escribiéndonos a{" "}
        <a href="mailto:contacto@guiapromptsia.com">contacto@guiapromptsia.com</a>. Responderemos en el plazo
        que establece la normativa de protección de datos aplicable.
      </p>

      <h2>Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios legales o en nuestros proveedores.
        Cualquier cambio relevante se publicará en esta misma página.
      </p>
    </div>
  );
}
