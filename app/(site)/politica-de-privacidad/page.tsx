import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { contactEmail, institutionalUpdatedAt, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Política de privacidad",
  description: `Qué datos trata ${siteName}, con qué finalidad y qué control tienes sobre ellos.`,
  path: "/politica-de-privacidad",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Política de privacidad" updatedAt={institutionalUpdatedAt("/politica-de-privacidad")}>
      <p>
        En {siteName} respetamos tu privacidad. Esta página explica qué datos se tratan cuando visitas el sitio, con qué
        finalidad y qué control tienes sobre ellos.
      </p>

      <h2>Responsable del tratamiento</h2>
      <p>
        {siteName} lo publica {getAuthor(EDITORIAL)!.name}, responsable del tratamiento de los datos recogidos a través de
        este sitio, y lo escribe y prueba {getAuthor(AUTOR_POR_DEFECTO)!.name}. Para cualquier consulta sobre esta política puedes escribirnos a{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2>Datos que tratamos</h2>
      <p>
        El sitio no tiene cuentas de usuario ni formularios que envíen datos a nuestros servidores: se navega sin
        registro, y el contacto se hace por correo electrónico desde tu propio programa de correo. Los únicos datos que
        se tratan son:
      </p>
      <ul>
        <li>
          <strong>Datos de navegación</strong> (páginas vistas, tipo de dispositivo, ubicación aproximada), a través de
          Google Analytics, <strong>solo si aceptas las cookies analíticas</strong>. Si las rechazas, el script de
          Google Analytics no se carga.
        </li>
        <li>
          <strong>El contenido de los correos</strong> que nos envíes voluntariamente a {contactEmail}. Quedan en
          nuestra bandeja de correo, como cualquier correo recibido, y no en una base de datos del sitio.
        </li>
        <li>
          <strong>Tu elección sobre las cookies</strong>, que se guarda en el almacenamiento local de tu navegador para
          no volver a preguntarte en cada visita.
        </li>
        <li>
          <strong>Los datos de tu negocio que decidas guardar en las herramientas</strong>, que permanecen solo en tu
          navegador (ver más abajo).
        </li>
      </ul>

      <h2>Los datos de tu negocio en las herramientas</h2>
      <p>
        Las herramientas de este sitio te piden algunos datos de tu negocio (nombre, rubro, tono, moneda y similares) para
        armar el prompt. Si los guardas en «Mi negocio», <strong>se almacenan solo en este navegador</strong> (en el
        almacenamiento local de tu dispositivo): no se envían a nuestros servidores y no los vemos. Puedes borrarlos en
        cualquier momento desde la propia página o limpiando los datos del sitio en tu navegador. Si tu navegador bloquea el
        almacenamiento local, las herramientas siguen funcionando, pero no recordarán tus datos.
      </p>

      <h2>Lo que pegas en una herramienta de IA</h2>
      <p>
        Las herramientas generan instrucciones (prompts) que copias y pegas en el asistente de inteligencia artificial que tú
        elijas: <strong>no recibimos ni almacenamos lo que escribas en él</strong>. Cada asistente tiene su propia política de
        privacidad, y te recomendamos no compartir con la IA datos personales de tus clientes ni información confidencial que no
        sea necesaria.
      </p>

      <h2>Publicidad de Google AdSense</h2>
      <p>
        El sitio está preparado para mostrar anuncios de Google AdSense. Actualmente no se muestra ninguna publicidad.
        Si aceptas las cookies publicitarias, se carga el script de Google AdSense; Google y sus proveedores de
        tecnología publicitaria, incluido DoubleClick, pueden utilizar cookies para mostrar anuncios basados en tus
        visitas anteriores a este y a otros sitios web. Puedes inhabilitar la publicidad personalizada en la{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          configuración de anuncios de Google
        </a>{" "}
        o en{" "}
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
          www.aboutads.info/choices
        </a>
        . Más información sobre cómo Google usa los datos en{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          policies.google.com/technologies/partner-sites
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        Las cookies analíticas y publicitarias están desactivadas por defecto y solo se activan si las aceptas en el
        aviso que aparece al entrar. Puedes cambiar tu decisión en cualquier momento borrando los datos del sitio en tu
        navegador. Consulta el detalle en la <Link href="/politica-de-cookies">política de cookies</Link>.
      </p>

      <h2>Menores de edad</h2>
      <p>
        {siteName} no está dirigido a menores de 16 años y no recogemos conscientemente datos personales de menores. Si
        crees que un menor nos ha enviado datos personales, escríbenos para eliminarlos.
      </p>

      <h2>Conservación de los datos</h2>
      <p>
        Los datos de tu negocio guardados en las herramientas dependen de tu navegador: se conservan hasta que los borres. Al
        no existir cuentas ni formularios, no mantenemos una base de datos de contactos: los correos que nos envíes
        quedan en nuestra bandeja hasta que nos pidas eliminarlos. Los datos de analítica los conserva Google Analytics
        según su propia configuración de retención.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar el acceso, la rectificación, la portabilidad o la eliminación de tus datos, así como oponerte
        a su tratamiento, escribiéndonos a <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Responderemos en el
        plazo que establece la normativa de protección de datos aplicable.
      </p>

      <h2>Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios legales o del sitio. Cualquier cambio relevante se
        publicará en esta misma página y se reflejará en la fecha de última actualización.
      </p>
    </LegalPage>
  );
}
