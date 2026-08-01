import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Términos y condiciones",
  description: "Condiciones de uso del sitio web AIXtack.",
  path: "/terminos-y-condiciones",
});

export default function TermsPage() {
  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1>Términos y condiciones</h1>
      <p>
        Al acceder y utilizar AIXtack aceptas los términos descritos en esta página. Si no estás
        de acuerdo con alguno de ellos, te pedimos que no utilices el sitio.
      </p>

      <h2>1. Descripción del servicio</h2>
      <p>
        AIXtack es un sitio de contenido editorial en español sobre inteligencia artificial:
        directorio de herramientas, biblioteca de prompts, comparativas, tutoriales, guías y
        noticias. El acceso al contenido es gratuito; algunas funciones (como guardar favoritos o
        comentar) pueden requerir una cuenta.
      </p>

      <h2>2. Uso permitido</h2>
      <p>Al usar AIXtack te comprometes a no:</p>
      <ul>
        <li>Extraer contenido de forma masiva y automatizada (scraping) sin autorización previa.</li>
        <li>Intentar vulnerar la seguridad del sitio o acceder a áreas restringidas sin permiso.</li>
        <li>Publicar comentarios difamatorios, spam, o contenido que infrinja derechos de terceros.</li>
        <li>Suplantar la identidad de otra persona o entidad al registrarte o comentar.</li>
      </ul>

      <h2>3. Cuentas de usuario</h2>
      <p>
        Si creas una cuenta, eres responsable de mantener la confidencialidad de tus credenciales y
        de toda la actividad que ocurra bajo tu cuenta. Puedes solicitar la eliminación de tu
        cuenta y tus datos en cualquier momento escribiéndonos a{" "}
        <a href="mailto:contacto@aixtack.com">contacto@aixtack.com</a>.
      </p>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Los textos, gráficos y el diseño de AIXtack son propiedad del sitio o de sus licenciantes,
        salvo que se indique lo contrario. Los nombres, logos y marcas de terceros mencionados
        (herramientas de IA analizadas, marcas comparadas) pertenecen a sus respectivos dueños y se
        usan únicamente con fines informativos y de análisis.
      </p>

      <h2>5. Enlaces a terceros y afiliados</h2>
      <p>
        AIXtack incluye enlaces hacia sitios de terceros, incluyendo enlaces de afiliados (ver
        nuestro <a href="/aviso-afiliados">aviso de afiliados</a>). No controlamos el contenido de
        esos sitios externos ni nos hacemos responsables de sus políticas, precios o disponibilidad,
        que pueden cambiar sin previo aviso por parte del proveedor.
      </p>

      <h2>6. Exención de responsabilidad</h2>
      <p>
        El contenido de AIXtack se ofrece con fines informativos. Aunque revisamos la información
        antes de publicarla (ver nuestra <a href="/politica-editorial">política editorial</a>), no
        garantizamos que esté siempre libre de errores o completamente actualizada. AIXtack no se
        hace responsable de decisiones tomadas exclusivamente en base a este contenido; verifica
        siempre los datos críticos (precios, condiciones de uso) en la fuente oficial de cada
        herramienta.
      </p>

      <h2>7. Publicidad</h2>
      <p>
        Este sitio muestra anuncios de Google AdSense y de sus redes publicitarias asociadas. Más
        información sobre el uso de cookies publicitarias en nuestra{" "}
        <a href="/cookies">política de cookies</a>.
      </p>

      <h2>8. Cambios en estos términos</h2>
      <p>
        Podemos actualizar estos términos en cualquier momento para reflejar cambios legales o del
        servicio. Los cambios entran en vigor al publicarse en esta página; el uso continuado del
        sitio después de una actualización implica su aceptación.
      </p>

      <h2>9. Ley aplicable</h2>
      <p>
        Estos términos se rigen por la legislación aplicable en materia de protección de datos y
        comercio electrónico de la Unión Europea y España, sin perjuicio de la normativa local que
        pueda aplicar según tu país de residencia.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para cualquier duda sobre estos términos, escríbenos a{" "}
        <a href="mailto:contacto@aixtack.com">contacto@aixtack.com</a> o desde nuestra{" "}
        <a href="/contacto">página de contacto</a>.
      </p>
    </div>
  );
}
