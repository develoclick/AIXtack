import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { contactEmail, institutionalUpdatedAt, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Términos y condiciones",
  description: `Condiciones de uso del sitio web ${siteName}.`,
  path: "/terminos-y-condiciones",
});

const responsable = getAuthor(AUTOR_POR_DEFECTO)!;

export default function TermsPage() {
  return (
    <LegalPage title="Términos y condiciones" updatedAt={institutionalUpdatedAt("/terminos-y-condiciones")}>
      <p>
        Al acceder y utilizar {siteName} aceptas los términos descritos en esta página. Si no estás de acuerdo con
        alguno de ellos, te pedimos que no utilices el sitio.
      </p>

      <h2>1. Descripción del servicio</h2>
      <p>
        {siteName} es un sitio de contenido educativo en español con herramientas y guías cortas para usar inteligencia artificial
        en tareas de microempresas y emprendedores. El acceso al contenido es gratuito, no requiere registro y no
        existen cuentas de usuario.
      </p>

      <h2>2. Responsable del sitio</h2>
      <p>
        El responsable del sitio es {responsable.name}, persona natural con domicilio en {responsable.pais}, que lo escribe y
        prueba. {siteName} es un proyecto de {getAuthor(EDITORIAL)!.name}, nombre del proyecto que no corresponde a una empresa
        registrada. Correo de contacto: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2>3. Naturaleza informativa del contenido</h2>
      <p>
        Las herramientas y sus guías tienen carácter informativo y educativo. No constituyen asesoramiento financiero, contable, legal ni
        profesional de ningún tipo. Los ejemplos que aparecen en ellas utilizan negocios ficticios y se identifican
        como tales; ilustran un método y no representan resultados reales ni garantizados.
      </p>

      <h2>4. Uso de la inteligencia artificial y responsabilidad del usuario</h2>
      <p>
        Los resultados que genera una herramienta de inteligencia artificial pueden contener errores, omisiones o
        información inventada. Cada herramienta indica qué debe verificar una persona antes de utilizar el resultado. Eres
        responsable de revisar precios, fechas, condiciones comerciales, cálculos, datos de clientes y cualquier
        información legal o financiera antes de aplicarla en tu negocio, así como de las decisiones que tomes a partir
        de ella.
      </p>

      <h2>5. Uso permitido</h2>
      <p>Al usar {siteName} te comprometes a no:</p>
      <ul>
        <li>Extraer contenido de forma masiva y automatizada (scraping) sin autorización previa.</li>
        <li>Intentar vulnerar la seguridad del sitio o acceder a áreas restringidas sin permiso.</li>
        <li>Reproducir o redistribuir el contenido del sitio como propio sin autorización.</li>
      </ul>

      <h2>6. Propiedad intelectual</h2>
      <p>
        Los textos, los prompts, los ejemplos y el diseño de {siteName} son propiedad del sitio o de sus licenciantes,
        salvo que se indique lo contrario. Puedes copiar los prompts para usarlos en tu propio negocio. Los nombres y
        marcas de terceros que se mencionen (por ejemplo, herramientas de IA) pertenecen a sus respectivos dueños y se
        usan solo con fines informativos.
      </p>

      <h2>7. Enlaces a terceros</h2>
      <p>
        El sitio puede incluir enlaces a páginas de terceros. No controlamos su contenido ni nos hacemos responsables
        de sus políticas, precios o disponibilidad, que pueden cambiar sin previo aviso.
      </p>

      <h2>8. Exención de responsabilidad</h2>
      <p>
        Aunque revisamos el contenido antes de publicarlo (consulta <Link href="/sobre-nosotros">Sobre nosotros</Link>),
        no garantizamos que esté siempre libre de errores o completamente actualizado: las herramientas de IA cambian
        con frecuencia. {siteName} no se hace responsable de las decisiones tomadas exclusivamente a partir de este
        contenido.
      </p>

      <h2>9. Publicidad</h2>
      <p>
        El sitio puede mostrar anuncios de Google AdSense. Actualmente no se muestra publicidad. Más información sobre
        las cookies publicitarias en la <Link href="/politica-de-cookies">política de cookies</Link>.
      </p>

      <h2>10. Cambios en estos términos</h2>
      <p>
        Podemos actualizar estos términos para reflejar cambios legales o del servicio. Los cambios entran en vigor al
        publicarse en esta página; el uso continuado del sitio después de una actualización implica su aceptación.
      </p>

      <h2>11. Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia que surja del uso del sitio se
        someterá a los jueces y tribunales competentes de la República del Perú, sin perjuicio de los derechos que la normativa
        de protección al consumidor de tu país de residencia te reconozca como usuario.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Para cualquier duda sobre estos términos, escríbenos a <a href={`mailto:${contactEmail}`}>{contactEmail}</a> o
        desde la <Link href="/contacto">página de contacto</Link>.
      </p>
    </LegalPage>
  );
}
