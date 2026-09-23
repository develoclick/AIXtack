import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { EditorialHero } from "@/components/visual/editorial-hero";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { institutionalUpdatedAt, siteName } from "@/lib/site";
import { formatDate } from "@/lib/utils/format";

export const metadata = buildMetadata({
  title: "Cómo probamos cada herramienta",
  description: `Cómo se prueba, revisa y publica cada herramienta de ${siteName}: qué es una prueba real, qué calcula la página, qué revisa una persona y qué nunca prometemos.`,
  path: "/como-probamos",
});

const etiquetas: [string, string][] = [
  ["Prueba real", "Captura de una conversación real con un asistente de IA, tal como salió, sin retocar el texto de la respuesta. Es la única imagen que lleva esta etiqueta."],
  ["Captura de hoja", "Captura de una hoja de cálculo real en la que se comprobaron las cifras."],
  ["Ilustración", "Un dibujo o esquema que explica una idea. No muestra ningún resultado real."],
  ["Simulación", "Un ejemplo construido por nosotros para enseñar la forma de una respuesta. No es una respuesta real de ninguna IA."],
];

export default function ComoProbamosPage() {
  const updatedAt = institutionalUpdatedAt("/como-probamos");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Cómo probamos", path: "/como-probamos" },
        ])}
      />
      <EditorialHero
        eyebrow="Metodología"
        title="Cómo probamos cada herramienta"
        description="Lo que hacemos antes de publicar una herramienta, lo que hace la página y lo que te toca revisar a ti."
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:text-brand prose-h2:tracking-tight prose-h2:scroll-mt-28">
          <h2 id="regla-principal">La regla principal</h2>
          <p>
            Una herramienta solo se publica cuando su prompt se ha probado en un asistente de IA real y tiene la captura de esa prueba. Mientras falte cualquiera de las dos cosas, la página no aparece en la biblioteca, en las áreas ni en el mapa del sitio.
          </p>

          <h2 id="que-probamos">Qué probamos</h2>
          <ol>
            <li>
              <strong>El prompt completo, con datos de ejemplo.</strong> Llenamos la herramienta con los datos de un negocio ficticio, copiamos el prompt que genera y lo pegamos en un asistente de IA.
            </li>
            <li>
              <strong>La respuesta.</strong> Guardamos la captura de la conversación y la comparamos con lo que la página dice que debería ocurrir. El texto de cada página tiene que coincidir con lo que muestra la captura.
            </li>
            <li>
              <strong>Lo que hubo que corregir.</strong> Si la respuesta tenía fallos, los anotamos en «Qué corregí yo» y ajustamos el prompt. Si no anotamos nada, no inventamos correcciones.
            </li>
            <li>
              <strong>Los cálculos.</strong> Las calculadoras se comprueban con casos de prueba automáticos antes de cada publicación (ver más abajo).
            </li>
          </ol>

          <h2 id="quien-hace-que">Quién hace qué</h2>
          <ul>
            <li>
              <strong>La página calcula.</strong> Precios, márgenes, puntos de equilibrio, totales y porcentajes los resuelve la propia página con fórmulas fijas. A la IA se le entregan los resultados ya hechos y se le pide que no los recalcule.
            </li>
            <li>
              <strong>La IA redacta, ordena e interpreta.</strong> Escribe el borrador, propone opciones y explica lo que ve en tus datos. Puede equivocarse o inventar detalles.
            </li>
            <li>
              <strong>Tú revisas y decides.</strong> Cada herramienta trae una lista de revisión con lo que debes comprobar antes de usar el resultado.
            </li>
          </ul>

          <h2 id="etiquetas-de-imagenes">Cómo etiquetamos las imágenes</h2>
          <p>Cada imagen dice qué es. Estas son las etiquetas que usamos y su significado:</p>
          <dl>
            {etiquetas.map(([nombre, texto]) => (
              <div key={nombre} className="mb-3">
                <dt className="font-semibold">{nombre}</dt>
                <dd className="ml-0">{texto}</dd>
              </div>
            ))}
          </dl>

          <h2 id="probado-por">Cuándo aparece «Probado por»</h2>
          <p>
            Cada herramienta publicada indica quién la probó, en qué asistente de IA y en qué fecha. Esa línea solo existe si la prueba existe: no la escribimos por adelantado ni la repetimos en páginas que no se han probado.
          </p>

          <h2 id="calculos">Cómo comprobamos los cálculos</h2>
          <p>
            Cada fórmula de una calculadora tiene al menos tres casos de prueba con el resultado esperado calculado aparte. Si un caso no da el resultado esperado, la herramienta no se compila y no se puede publicar. Los porcentajes se tratan como porcentajes y las divisiones entre cero se muestran como datos que faltan, no como un número inventado.
          </p>

          <h2 id="ejemplos">Ejemplos y negocios ficticios</h2>
          <p>
            Los negocios que usamos para los ejemplos son inventados y llevan la marca «(ficticio)». No publicamos testimonios, estadísticas ni resultados de clientes que no existan.
          </p>

          <h2 id="lo-que-no-prometemos">Lo que no prometemos</h2>
          <ul>
            <li>Que la IA responda igual cada vez: dos pruebas del mismo prompt pueden dar textos distintos.</li>
            <li>Que el resultado sirva sin revisarlo: siempre debes comprobar nombres, precios, plazos y datos de contacto.</li>
            <li>Ventas, clientes, posicionamiento o ingresos como consecuencia de usar una herramienta.</li>
            <li>Que un prompt probado en un asistente funcione igual en otro.</li>
          </ul>

          <h2 id="tus-datos">Tus datos</h2>
          <p>
            Los datos de tu negocio que escribes en «Mi negocio» o en una herramienta se guardan solo en este navegador. No se envían a nuestros servidores. Lo que pegues después en un asistente de IA queda sujeto a las condiciones de ese asistente; puedes usar datos genéricos si prefieres no compartir información real. Más detalles en la{" "}
            <Link href="/politica-de-privacidad">política de privacidad</Link>.
          </p>

          <h2 id="errores">Si encuentras un error</h2>
          <p>
            Escríbenos desde la <Link href="/contacto">página de contacto</Link>. Cuando corregimos una herramienta, actualizamos su fecha de modificación con la fecha real del cambio.
          </p>

          <p>
            Puedes ver las herramientas disponibles en la <Link href="/herramientas">biblioteca</Link>.
          </p>
        </div>

        <p className="mt-10 border-t pt-6 font-mono text-xs text-muted-foreground">
          Última actualización: <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </p>
      </div>
    </>
  );
}
