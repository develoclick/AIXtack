import Link from "next/link";
import { EditorialHero } from "@/components/visual/editorial-hero";
import { FloatingIllustration } from "@/components/visual/floating-illustration";
import { buildMetadata } from "@/lib/seo/metadata";
import { contactEmail, institutionalUpdatedAt, siteName } from "@/lib/site";
import { formatDate } from "@/lib/utils/format";

export const metadata = buildMetadata({
  title: "Sobre nosotros",
  description: `Qué es ${siteName}, para quién es, cómo se hace cada guía y quién está detrás del proyecto.`,
  path: "/sobre-nosotros",
});

const method = [
  "El problema real que enfrenta un emprendedor",
  "Qué información necesita reunir antes de usar la IA",
  "Cómo suele plantearse mal la tarea (ANTES)",
  "El prompt, diseñado para esa tarea",
  "Una explicación del prompt parte por parte",
  "Cómo cambia el resultado con un buen pedido (DESPUÉS)",
  "Cómo pedirle a la IA que mejore el resultado",
  "Los errores más comunes",
  "Cómo adaptarlo a tu negocio",
  "Qué debes revisar antes de usarlo",
  "Cómo aplicarlo en tu negocio",
];

const toc: [string, string][] = [
  ["que-es", "Qué es este sitio"],
  ["para-quien", "Para quién es"],
  ["que-no-es", "Qué no es"],
  ["como-esta-hecha", "Cómo está hecha cada guía"],
  ["como-trabajamos", "Cómo trabajamos"],
  ["quien-esta-detras", "Quién está detrás"],
  ["como-se-financia", "Cómo se financia"],
];

export default function AboutPage() {
  const updatedAt = institutionalUpdatedAt("/sobre-nosotros");

  return (
    <>
      <EditorialHero
        eyebrow="Sobre nosotros"
        title={`Sobre ${siteName}`}
        description="Una biblioteca práctica de inteligencia artificial para microempresas y emprendedores."
        aside={
          <FloatingIllustration
            file="sobre-cabecera.png"
            width={1200}
            height={900}
            speed={0.05}
            className="relative ml-auto w-full max-w-md"
            purpose="Cuaderno abierto con una casilla marcada, lápiz, lupa y una planta (ver docs/rediseno/PLAN.md, imagen-11)."
          />
        }
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:py-16">
        <nav aria-label="En esta página" className="hidden lg:block">
          <ol className="sticky top-28 space-y-1 border-l">
            {toc.map(([id, label], index) => (
              <li key={id}>
                <a href={`#${id}`} className="guide-focus flex items-baseline gap-2.5 py-1.5 pl-4 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <span aria-hidden className="font-mono text-[0.66rem] tabular-nums text-brand">{String(index + 1).padStart(2, "0")}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0">
      <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:text-brand prose-h2:tracking-tight prose-h2:scroll-mt-28">
        <h2 id="que-es">Qué es este sitio</h2>
        <p>
          {siteName} reúne guías para resolver con inteligencia artificial tareas concretas de un pequeño negocio: crear
          un anuncio, diseñar una promoción, preparar un afiche, responder a un cliente o a un reclamo, preparar una
          cotización, analizar ventas o proveedores, o poner en orden las tareas del día. No enseña la IA de manera
          teórica: cada guía parte de un problema real y termina en algo que puedes aplicar.
        </p>

        <h2 id="para-quien">Para quién es</h2>
        <p>
          Para quien dirige un negocio pequeño: una tienda, un restaurante, un comercio electrónico, un negocio de
          servicios, un emprendimiento, un negocio familiar o una actividad independiente. No hace falta ningún
          conocimiento técnico previo.
        </p>

        <h2 id="que-no-es">Qué no es</h2>
        <p>
          No es un directorio de herramientas, ni un portal de noticias de IA, ni una colección de prompts sueltos. Un
          prompt, por sí solo, sirve de poco: por eso cada uno aparece dentro de una guía que explica cuándo usarlo,
          por qué funciona y cómo comprobar el resultado.
        </p>

        <h2 id="como-esta-hecha">Cómo está hecha cada guía</h2>
        <p>Todas las guías siguen el mismo recorrido, para que sepas siempre dónde encontrar cada cosa:</p>
        <ol>
          {method.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>
          La estructura es la misma en todas las guías; el contenido no: cada una tiene sus propios ejemplos, prompts y
          advertencias, escritos para esa tarea.
        </p>

        <h2 id="como-trabajamos">Cómo trabajamos</h2>
        <ul>
          <li>
            <strong>Los ejemplos son ficticios y están marcados como tales.</strong> Usamos negocios inventados
            (una cafetería, una ferretería, una tienda de ropa…) para mostrar el método. No publicamos testimonios,
            casos de éxito, estadísticas ni resultados que no existan.
          </li>
          <li>
            <strong>La IA no es infalible.</strong> Puede equivocarse e inventar información. Cada guía indica qué debes
            revisar antes de usar el resultado.
          </li>
          <li>
            <strong>Los cálculos no se delegan a la IA.</strong> Cuando una guía trabaja con precios, márgenes o ventas,
            separa qué se calcula (y se verifica en una hoja de cálculo), qué puede interpretar la IA y qué decides tú.
          </li>
          <li>
            <strong>La información externa lleva su fuente.</strong> Cuando hace falta investigar (por ejemplo, a la
            competencia), los datos los aportas tú con su fuente; la IA los ordena, no los inventa.
          </li>
          <li>
            <strong>Podemos apoyarnos en herramientas de IA para redactar, pero ninguna guía se publica sin revisión
            humana.</strong> Las fechas de publicación y actualización son las reales.
          </li>
        </ul>

        <h2 id="quien-esta-detras">Quién está detrás</h2>
        <p>
          {siteName} es un proyecto de DeveloClick, responsable editorial y legal del sitio. Si encuentras un error,
          quieres proponer una tarea que te gustaría ver resuelta o tienes cualquier duda, escríbenos desde la{" "}
          <Link href="/contacto">página de contacto</Link> o a <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>

        <h2 id="como-se-financia">Cómo se financia</h2>
        <p>
          El acceso a las guías es gratuito. El sitio puede mostrar publicidad de Google AdSense (ahora mismo no muestra
          ninguna). No hay enlaces de afiliados ni contenido patrocinado. Puedes leer más en la{" "}
          <Link href="/politica-de-privacidad">política de privacidad</Link> y los{" "}
          <Link href="/terminos-y-condiciones">términos y condiciones</Link>.
        </p>
      </div>

      <p className="mt-10 border-t pt-6 font-mono text-xs text-muted-foreground">
        Última actualización: <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
      </p>
        </div>
      </div>
    </>
  );
}
