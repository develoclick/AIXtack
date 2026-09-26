import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { contactEmail, institutionalUpdatedAt, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Política de cookies",
  description: `Qué cookies y almacenamiento local utiliza ${siteName}, para qué se usan y cómo gestionarlos.`,
  path: "/politica-de-cookies",
});

export default function CookiesPolicyPage() {
  return (
    <LegalPage title="Política de cookies" updatedAt={institutionalUpdatedAt("/politica-de-cookies")}>
      <p>
        Una cookie es un pequeño archivo que un sitio web guarda en tu navegador. En {siteName} distinguimos entre lo
        estrictamente necesario para que el sitio funcione, que no requiere consentimiento, y lo que solo se activa si
        lo aceptas.
      </p>

      <h2>Qué usamos</h2>
      <ul>
        <li>
          <strong>Almacenamiento local necesario:</strong> tu preferencia de tema claro u oscuro, tu elección sobre las
          cookies y, si decides guardarlos, los datos que escribes en los formularios de las herramientas. Se guardan en el almacenamiento local del navegador, no se envían a ningún servidor y no requieren
          consentimiento porque sin ellos el sitio no puede recordar tus preferencias.
        </li>
        <li>
          <strong>Cookies analíticas (Google Analytics):</strong> nos permiten saber, de forma agregada, qué páginas se visitan más y cómo se navega por el sitio, para mejorar el contenido. <strong>Solo se cargan si aceptas.</strong>{" "}
          Si las rechazas, el script de Google Analytics no se carga.
        </li>
        <li>
          <strong>Cookies publicitarias (Google AdSense / DoubleClick):</strong> el sitio está preparado para mostrar
          anuncios, aunque actualmente no muestra ninguno. Si aceptas las cookies publicitarias se carga el script de
          Google AdSense; en ese caso Google y sus socios pueden utilizar cookies para mostrar anuncios relevantes y
          limitar las veces que ves un mismo anuncio. <strong>Solo se cargan si aceptas.</strong>
        </li>
      </ul>

      <h2>Cómo gestionar tu decisión</h2>
      <p>
        Al entrar por primera vez verás un aviso con las opciones «Rechazar» y «Aceptar todo». Si quieres cambiar tu
        decisión más adelante, borra los datos del sitio (cookies y almacenamiento local) desde la configuración de tu
        navegador y el aviso volverá a aparecer. Ten en cuenta que, si bloqueas todo el almacenamiento, el sitio no
        podrá recordar tus preferencias.
      </p>
      <p>
        Puedes gestionar la publicidad personalizada de Google en su{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          configuración de anuncios
        </a>
        .
      </p>

      <h2>Responsable</h2>
      <p>
        El responsable de este sitio y del tratamiento de los datos descritos aquí es {getAuthor(AUTOR_POR_DEFECTO)!.name}, persona
        natural con domicilio en {getAuthor(AUTOR_POR_DEFECTO)!.pais}. Correo de contacto:{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Estas cookies se rigen por las leyes de la República del Perú
        (Ley N.° 29733, de Protección de Datos Personales).
      </p>

      <h2>Más información</h2>
      <p>
        Para saber cómo tratamos tus datos personales, consulta la{" "}
        <Link href="/politica-de-privacidad">política de privacidad</Link>.
      </p>
    </LegalPage>
  );
}
