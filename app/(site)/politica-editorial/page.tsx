import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Política editorial",
  description: "Cómo investigamos, redactamos y revisamos el contenido de AIXtack.",
  path: "/politica-editorial",
});

export default function EditorialPolicyPage() {
  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1>Política editorial</h1>
      <p>
        Esta página explica cómo se produce el contenido de AIXtack: de dónde sale, quién lo
        revisa y qué estándares sigue antes de publicarse.
      </p>

      <h2>Cómo investigamos cada herramienta</h2>
      <p>
        Antes de publicar una ficha de herramienta, comparativa o tutorial, revisamos la web
        oficial del producto, su documentación, su modelo de precios y, siempre que es posible, la
        probamos directamente. Las valoraciones (ventajas, desventajas y puntuación) reflejan
        nuestro análisis, no la opinión del fabricante.
      </p>

      <h2>Uso de inteligencia artificial en la redacción</h2>
      <p>
        Usamos herramientas de IA como apoyo para redactar borradores iniciales, especialmente en
        contenido de referencia (fichas de herramientas, prompts, comparativas). Ningún contenido
        se publica sin revisión editorial humana: verificamos datos, corregimos imprecisiones y
        ajustamos el texto antes de que salga a producción. Si en algún momento cambiamos este
        proceso de forma sustancial, actualizaremos esta página.
      </p>

      <h2>Independencia editorial</h2>
      <p>
        Algunos enlaces del sitio son enlaces de afiliados (ver nuestro{" "}
        <a href="/aviso-afiliados">aviso de afiliados</a>), y mostramos publicidad de Google
        AdSense. Ninguna relación comercial influye en qué herramientas recomendamos ni en las
        valoraciones que publicamos: una herramienta con programa de afiliados no recibe mejor
        puntuación por ello.
      </p>

      <h2>Correcciones</h2>
      <p>
        Si encuentras un error factual, un precio desactualizado o una función que ya no existe,
        escríbenos a{" "}
        <a href="mailto:contacto@aixtack.com">contacto@aixtack.com</a> o desde el{" "}
        <a href="/contacto">formulario de contacto</a>. Corregimos los errores confirmados lo antes
        posible y, en cambios relevantes, indicamos la fecha de la última actualización del
        artículo.
      </p>

      <h2>Actualización de contenido</h2>
      <p>
        El sector de la IA cambia con rapidez: precios, funciones y disponibilidad de las
        herramientas pueden variar después de la publicación. Revisamos periódicamente el
        contenido más visitado para mantenerlo al día, pero recomendamos verificar siempre el dato
        concreto (precio, límites de uso) en la web oficial de cada herramienta antes de contratar
        nada.
      </p>
    </div>
  );
}
