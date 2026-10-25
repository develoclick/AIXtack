import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { categoriasActivas, herramientasPublicadas, rutaCategoria } from "@/content/catalogo";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { buildMetadata } from "@/lib/seo/metadata";
import { contactEmail, institutionalUpdatedAt, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Sobre nosotros",
  description: `${siteName} reúne herramientas gratuitas en español que hacen los cálculos en tu navegador y arman el prompt para tu asistente de IA.`,
  path: "/sobre-nosotros",
});

const herramientas = (n: number) => `${n} ${n === 1 ? "herramienta" : "herramientas"}`;

export default function AboutPage() {
  const autorDatos = getAuthor(AUTOR_POR_DEFECTO)!;
  const autor = autorDatos.name;
  const editorial = getAuthor(EDITORIAL)!.name;
  const categorias = categoriasActivas();
  const total = herramientasPublicadas().length;

  return (
    <LegalPage
      title={`Sobre ${siteName}`}
      eyebrow="Sobre nosotros"
      updatedAt={institutionalUpdatedAt("/sobre-nosotros")}
    >
      <h2 id="que-es">Qué es {siteName}</h2>
      <p>
        <strong>
          {siteName} reúne {herramientas(total)} gratuitas en español que
          hacen el cálculo en tu navegador y arman el prompt para tu
          asistente de inteligencia artificial.
        </strong>
      </p>
      <p>
        Cada herramienta resuelve una tarea concreta. Llenas un formulario
        con tus datos, la página calcula lo que se puede calcular (márgenes,
        presupuestos, comparaciones, segmentos) y te entrega un prompt ya
        armado para pegarlo en ChatGPT, Gemini, Claude u otro asistente. La
        IA interpreta o redacta; los números no los inventa ella.
      </p>
      <p>Hoy hay herramientas en estas áreas:</p>
      <ul>
        {categorias.map((c) => (
          <li key={c.slug}>
            <Link href={rutaCategoria(c)}>{c.nombre}</Link>:{" "}
            {herramientas(herramientasPublicadas(c.slug).length)}.
          </li>
        ))}
      </ul>
      <p>
        Además hay tres artículos de apoyo sobre cómo armar una hoja de vida.
        Según la herramienta, puedes descargar el resultado en Word, CSV, ZIP o
        PDF, y todas incluyen un ejemplo ficticio y las preguntas más comunes.
      </p>

      <h2 id="como-se-hace">Cómo están hechas las herramientas</h2>
      <ul>
        <li>
          Cada herramienta parte de una tarea concreta y de la información que
          la IA necesita para hacerla bien.
        </li>
        <li>
          Los cálculos los hace la página con fórmulas que se comprueban con
          pruebas automáticas, no la IA.
        </li>
        <li>
          Los prompts piden a la IA que no invente datos y que marque como
          supuesto lo que no puede saber. En las herramientas con
          cifras, la página revisa después la respuesta y avisa si aparece un
          número que no salió de tus datos.
        </li>
        <li>
          Lo que escribes se guarda solo en tu navegador. Nada se envía a un
          servidor de este sitio.
        </li>
        <li>
          Los nombres, negocios, situaciones y cifras de los ejemplos son
          ficticios y se presentan así.
        </li>
        <li>
          Cuando usamos fuentes externas las enlazamos con la fecha de
          consulta. Si una página oficial no se pudo leer, la guía lo dice y no
          cita datos de ella.
        </li>
        <li>
          Las herramientas muestran su fecha de publicación y de última
          actualización.
        </li>
      </ul>
      <p>
        Hoy las herramientas no muestran capturas de respuestas reales de
        asistentes de IA. Si las publicamos, las identificaremos con la fecha y
        el asistente usado. Mientras tanto, trata la respuesta de la IA como un
        borrador que debes revisar.
      </p>

      <h2 id="enfoque">Nuestro enfoque</h2>
      <p>
        Creemos que un buen recurso de inteligencia artificial no debería
        limitarse a mostrar una frase para copiar y pegar. Por eso, cada
        herramienta ayuda a comprender:
      </p>
      <ul>
        <li>Qué información conviene proporcionar.</li>
        <li>Cómo estructurar mejor una solicitud.</li>
        <li>Cómo utilizar el prompt generado.</li>
        <li>Qué partes del resultado deben revisarse.</li>
        <li>Qué errores pueden aparecer.</li>
        <li>Qué limitaciones tiene el uso de inteligencia artificial en cada tarea.</li>
      </ul>
      <p>
        Nuestro propósito es que la persona tenga más control sobre el
        resultado y pueda utilizar la IA como una herramienta de apoyo, no
        como una fuente automática e infalible de respuestas.
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
      {autorDatos.bioLarga?.map((parrafo) => (
        <p key={parrafo}>{parrafo}</p>
      ))}

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
        Si agregamos herramientas o guías, mantendremos el mismo criterio:
        priorizar la utilidad, la claridad y la calidad del contenido
        antes que publicar una gran cantidad de páginas sin suficiente
        valor para el usuario.
      </p>
    </LegalPage>
  );
}
