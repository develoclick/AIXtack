
import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { RUTA_CV } from "@/content/prompts";
import { buildMetadata } from "@/lib/seo/metadata";
import { contactEmail, institutionalUpdatedAt, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Sobre nosotros",
  description: `${siteName} es una biblioteca gratuita de herramientas, guías y prompts en español para aprovechar la inteligencia artificial de forma práctica.`,
  path: "/sobre-nosotros",
});

export default function AboutPage() {
  const autorDatos = getAuthor(AUTOR_POR_DEFECTO)!;
  const autor = autorDatos.name;
  const editorial = getAuthor(EDITORIAL)!.name;

  return (
    <LegalPage
      title={`Sobre ${siteName}`}
      eyebrow="Sobre nosotros"
      updatedAt={institutionalUpdatedAt("/sobre-nosotros")}
    >
      <h2 id="que-es">Qué es {siteName}</h2>
      <p>
        <strong>
          {siteName} es una biblioteca gratuita de recursos, herramientas y
          prompts en español creada para ayudar a las personas a utilizar la
          inteligencia artificial de forma más práctica, clara y útil.
        </strong>
      </p>
      <p>
        El sitio está orientado a distintos tipos de tareas, como productividad,
        trabajo, estudios, creación de contenido, organización, aprendizaje,
        negocios, tecnología y otras situaciones en las que la inteligencia
        artificial puede servir como apoyo.
      </p>
      <p>
        Nuestro objetivo es facilitar el uso de asistentes como ChatGPT,
        Gemini, Claude y otras herramientas de inteligencia artificial,
        incluso para personas que no tienen experiencia creando prompts.
      </p>
      <p>
        En muchas de nuestras guías puedes completar información mediante
        formularios o seguir instrucciones paso a paso para generar un prompt
        adaptado a una necesidad concreta.
      </p>
      <p>
        Cada recurso busca ofrecer algo más que un texto para copiar y pegar.
        Siempre que es posible, incluimos explicaciones, ejemplos,
        recomendaciones, advertencias, criterios de revisión y orientación
        sobre cómo aprovechar mejor el resultado generado por la IA.
      </p>
      <p>
        La biblioteca se amplía progresivamente con nuevas categorías,
        guías y herramientas.
      </p>

      <h2 id="como-se-hace">Cómo creamos nuestros contenidos</h2>
      <p>
        Cada guía de {siteName} parte de una tarea, problema o necesidad
        concreta. Antes de publicar un recurso:
      </p>
      <ul>
        <li>
          Analizamos qué información necesita la inteligencia artificial
          para realizar la tarea.
        </li>
        <li>
          Organizamos las instrucciones para que sean claras y fáciles
          de utilizar.
        </li>
        <li>
          Evitamos pedir a la IA que invente datos que el usuario no
          haya proporcionado.
        </li>
        <li>Probamos diferentes versiones del prompt.</li>
        <li>Revisamos y comparamos los resultados.</li>
        <li>
          Ajustamos las instrucciones cuando encontramos posibles mejoras.
        </li>
        <li>
          Añadimos recomendaciones para que el usuario pueda revisar
          el resultado por su cuenta.
        </li>
      </ul>
      <p>
        Cuando utilizamos información procedente de fuentes externas,
        procuramos identificar y enlazar las fuentes correspondientes.
        Los nombres, empresas, situaciones o datos inventados utilizados
        con fines demostrativos se presentan como ejemplos ficticios.
      </p>

      <h2 id="enfoque">Nuestro enfoque</h2>
      <p>
        Creemos que un buen recurso de inteligencia artificial no debería
        limitarse a mostrar una frase para copiar y pegar.
      </p>
      <p>Por eso, nuestras guías buscan ayudar al usuario a comprender:</p>
      <ul>
        <li>Qué información conviene proporcionar.</li>
        <li>Cómo estructurar mejor una solicitud.</li>
        <li>Qué instrucciones puede entender mejor una IA.</li>
        <li>Cómo utilizar el prompt generado.</li>
        <li>Qué partes del resultado deben revisarse.</li>
        <li>Qué errores pueden aparecer.</li>
        <li>Qué limitaciones tiene el uso de inteligencia artificial en cada tarea.</li>
      </ul>
      <p>
        Nuestro propósito es que la persona tenga más control sobre el
        resultado y pueda utilizar la IA como una herramienta de apoyo,
        no como una fuente automática e infalible de respuestas.
      </p>

      <h2 id="limitaciones">La inteligencia artificial puede equivocarse</h2>
      <p>
        Los asistentes de inteligencia artificial pueden generar respuestas
        incorrectas, incompletas, desactualizadas o inventadas.
      </p>
      <p>
        Por este motivo, los contenidos y prompts de {siteName} deben
        utilizarse como herramientas de apoyo y no como una garantía de
        obtener un resultado determinado. El usuario debe revisar, adaptar
        y verificar cualquier información importante antes de utilizarla.
      </p>
      <p>
        En temas médicos, legales, financieros, profesionales o cualquier
        otro ámbito sensible, recomendamos verificar la información mediante
        fuentes fiables y consultar a un profesional cualificado cuando
        corresponda.
      </p>

      <h2 id="quien-esta-detras">Quién está detrás de {siteName}</h2>
      <p>
        Mi nombre es Nicolas y soy el creador de {siteName}.
      </p>
      <p>
        Trabajo desde Perú desarrollando soluciones relacionadas con
        inteligencia artificial, automatización y uso práctico de
        herramientas digitales.
      </p>
      <p>
        Durante los últimos años he trabajado ayudando a pequeños negocios
        a incorporar herramientas digitales, inteligencia artificial y
        automatizaciones en distintas tareas de su operación diaria.
      </p>
      <p>
        Creé {siteName} para acercar estas herramientas a personas que
        quieren aprovechar la inteligencia artificial sin necesidad de
        tener conocimientos técnicos ni experiencia previa creando prompts.
      </p>
      <p>
        Los contenidos del sitio son revisados antes de publicarse y pueden
        actualizarse cuando encontramos errores, cambios relevantes o nuevas
        formas de mejorar una guía.
      </p>

      <h2 id="recursos">Qué puedes encontrar en el sitio</h2>
      <p>
        {siteName} está organizada en distintas categorías y tipos de
        recursos. Dependiendo de la temática, puedes encontrar:
      </p>
      <ul>
        <li>Generadores de prompts.</li>
        <li>Formularios interactivos.</li>
        <li>Guías paso a paso.</li>
        <li>Ejemplos prácticos.</li>
        <li>Plantillas reutilizables.</li>
        <li>Explicaciones sobre cómo utilizar herramientas de IA.</li>
        <li>Recomendaciones para mejorar resultados.</li>
        <li>Recursos relacionados con productividad y automatización.</li>
      </ul>
      <p>
        Por ejemplo, puedes utilizar nuestra{" "}
        <Link href={RUTA_CV}>
          herramienta para crear una hoja de vida en formato Harvard
        </Link>
        . No todos los contenidos utilizan exactamente el mismo formato.
        El objetivo es utilizar el tipo de recurso que resulte más útil
        para cada tarea.
      </p>

      <h2 id="independencia-editorial">Independencia editorial</h2>
      <p>
        Los contenidos de {siteName} se crean con el objetivo de aportar
        información y herramientas útiles a los usuarios.
      </p>
      <p>
        Las opiniones, recomendaciones y explicaciones publicadas en el
        sitio no están condicionadas por anunciantes.
      </p>
      <p>
        Si en algún momento se publica contenido patrocinado, colaboraciones
        comerciales o enlaces de afiliados, se identificarán de forma clara.
      </p>

      <h2 id="responsable">Responsable del sitio</h2>
      <p>
        {siteName} es un proyecto de {editorial}. {editorial} es el nombre
        utilizado para este proyecto y no corresponde actualmente a una
        empresa constituida.
      </p>
      <p>
        El responsable editorial del sitio es {autor}, persona natural
        con domicilio en Perú.
      </p>
      <p>
        Si encuentras información incorrecta, detectas un problema,
        quieres proponer una nueva guía o tienes alguna consulta,
        puedes comunicarte mediante nuestra{" "}
        <Link href="/contacto">página de contacto</Link> o escribir a{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2 id="financiacion">Cómo se financia {siteName}</h2>
      <p>
        El acceso a los contenidos y herramientas de {siteName} es
        gratuito y no requiere crear una cuenta.
      </p>
      <p>
        El sitio puede financiarse mediante publicidad. Los anuncios,
        cuando estén presentes, se mostrarán separados del contenido
        editorial y podrán ser gestionados por plataformas publicitarias
        externas.
      </p>
      <p>
        Actualmente no publicamos contenido patrocinado ni utilizamos
        enlaces de afiliados. Si esto cambia en el futuro, se informará
        de manera clara en los contenidos correspondientes.
      </p>
      <p>
        Puedes consultar más información en nuestra{" "}
        <Link href="/politica-de-privacidad">
          Política de privacidad
        </Link>{" "}
        y en nuestros{" "}
        <Link href="/terminos-y-condiciones">
          Términos y condiciones
        </Link>.
      </p>

      <h2 id="compromiso">Nuestro compromiso</h2>
      <p>
        Nuestro objetivo es crear recursos útiles, comprensibles y
        prácticos relacionados con el uso de inteligencia artificial.
      </p>
      <p>
        A medida que {siteName} crece, continuaremos incorporando nuevas
        categorías, herramientas y guías manteniendo el mismo criterio:
        priorizar la utilidad, la claridad y la calidad del contenido
        antes que publicar una gran cantidad de páginas sin suficiente
        valor para el usuario.
      </p>
    </LegalPage>
  );
}
