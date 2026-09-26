import { LegalPage } from "@/components/shared/legal-page";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { buildMetadata } from "@/lib/seo/metadata";
import { contactEmail, institutionalUpdatedAt, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Contacto",
  description: "Escríbenos para reportar un error, hacer una consulta o proponer un prompt que te gustaría ver en el sitio.",
  path: "/contacto",
});

export default function ContactPage() {
  return (
    <LegalPage title="Contacto" eyebrow="Contacto" updatedAt={institutionalUpdatedAt("/contacto")}>
      <p>
        ¿Tienes una duda, encontraste un error o hay un prompt que te gustaría ver en {siteName}? Escríbenos directamente.
      </p>
      <h2>Correo electrónico</h2>
      <p>
        <a href={`mailto:${contactEmail}`} className="inline-flex min-h-11 items-center text-lg font-semibold">
          {contactEmail}
        </a>
      </p>
      <p>
        No usamos un formulario de contacto: el mensaje sale desde tu propio programa de correo y llega a nuestra bandeja. El correo lo lee {getAuthor(AUTOR_POR_DEFECTO)!.name}, responsable de {siteName}, un proyecto de {getAuthor(EDITORIAL)!.name}.
      </p>
      <h2>Qué puedes contarnos</h2>
      <ul>
        <li>Un error o algo que no se entiende en una página.</li>
        <li>Un prompt o una tarea que te gustaría ver resuelta: cuéntanos qué necesitas lograr y qué te lo impide hoy.</li>
        <li>Una consulta sobre privacidad o sobre tus datos (ver la política de privacidad).</li>
      </ul>
      <p>No podemos revisar hojas de vida individuales ni dar asesoría profesional o legal por correo.</p>
    </LegalPage>
  );
}
