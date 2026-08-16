import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Sobre nosotros",
  description: "Qué es Guía Prompts IA, a quién ayuda y cómo se sostiene el proyecto.",
  path: "/sobre-nosotros",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Quiénes somos"
        title="Sobre Guía Prompts IA"
        description="La plataforma en español para entender y aprovechar la inteligencia artificial."
      />

      <div className="prose prose-neutral dark:prose-invert mt-10">
        <h2>Por qué existe Guía Prompts IA</h2>
        <p>
          La mayoría de contenido de calidad sobre IA se publica primero en inglés, y llega tarde
          —o traducido de forma literal— al público hispanohablante. Guía Prompts IA nació para cerrar esa
          brecha: un sitio en español, pensado desde cero para lectores de España y
          Latinoamérica, con un directorio de herramientas, una biblioteca de prompts, tutoriales
          paso a paso y comparativas honestas.
        </p>

        <h2>Qué encontrarás aquí</h2>
        <ul>
          <li>
            <strong>Directorio de herramientas de IA</strong>, con precios, valoraciones y
            alternativas reales.
          </li>
          <li>
            <strong>Biblioteca de prompts</strong> listos para copiar y adaptar.
          </li>
          <li>
            <strong>Comparativas</strong> cara a cara entre las herramientas más populares.
          </li>
          <li>
            <strong>Tutoriales y guías</strong> para aprender a usar IA sin necesitar conocimientos
            técnicos previos.
          </li>
          <li>
            <strong>Noticias</strong> del sector, explicadas sin jerga innecesaria.
          </li>
        </ul>

        <h2>Quién lo hace</h2>
        <p>
          Un equipo editorial pequeño investiga, prueba y redacta cada pieza de contenido; puedes
          conocerlo en nuestra <Link href="/autores">página de autores</Link>, y entender cómo
          trabajamos en nuestra <Link href="/politica-editorial">política editorial</Link>.
        </p>

        <h2>Cómo se sostiene Guía Prompts IA</h2>
        <p>
          El acceso a Guía Prompts IA es gratuito. El proyecto se financia con publicidad (Google AdSense)
          y con enlaces de afiliados hacia algunas de las herramientas que recomendamos —puedes leer
          los detalles en nuestro <Link href="/aviso-afiliados">aviso de afiliados</Link>. Ninguna
          relación comercial cambia lo que recomendamos ni cómo lo valoramos.
        </p>

        <h2>Hablemos</h2>
        <p>
          Si quieres proponernos una herramienta, reportar un error o simplemente saludar, escríbenos
          desde la página de <Link href="/contacto">contacto</Link>.
        </p>
      </div>
    </div>
  );
}
