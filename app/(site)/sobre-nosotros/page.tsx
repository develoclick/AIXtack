import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { RUTA_CV } from "@/content/prompts";
import { buildMetadata } from "@/lib/seo/metadata";
import { contactEmail, institutionalUpdatedAt, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Sobre nosotros",
  description: `Qué es ${siteName}, cómo se hace cada prompt y quién está detrás del proyecto.`,
  path: "/sobre-nosotros",
});

export default function AboutPage() {
  const autorDatos = getAuthor(AUTOR_POR_DEFECTO)!;
  const autor = autorDatos.name;
  const editorial = getAuthor(EDITORIAL)!.name;

  return (
    <LegalPage title={`Sobre ${siteName}`} eyebrow="Sobre nosotros" updatedAt={institutionalUpdatedAt("/sobre-nosotros")}>
      <h2 id="que-es">Qué es este sitio</h2>
      <p>
        {siteName} es una biblioteca gratuita de prompts en español para ChatGPT, Gemini, Claude y otros asistentes de inteligencia artificial. La idea es simple: eliges una tarea, llenas un formulario corto y el prompt se arma solo con tus datos, listo para copiar.
      </p>
      <p>
        Estamos construyendo la biblioteca de una categoría a la vez y de un prompt a la vez, para que cada página esté completa antes de publicar la siguiente. Hoy la primera ruta es la <Link href={RUTA_CV}>creación de una hoja de vida en formato Harvard</Link>, pensada para los filtros ATS.
      </p>

      <h2 id="como-se-hace">Cómo se hace cada prompt</h2>
      <ul>
        <li>Parte de un problema real (por ejemplo, un CV que no pasa los filtros de selección).</li>
        <li>El prompt define un rol, usa solo los datos que tú entregas, prohíbe inventar información y pide a la IA que se autoverifique antes de responder.</li>
        <li>Cada página explica cómo está hecho el prompt, qué revisar en el resultado y cuáles son sus límites.</li>
        <li>Cuando una página cita una fuente, la enlaza y dice cuándo se consultó. Los ejemplos ficticios se marcan como ficticios.</li>
      </ul>

      <h2 id="ia">La IA no es infalible</h2>
      <p>
        Un asistente de IA puede equivocarse e inventar información. Ninguna página de este sitio promete resultados garantizados (por ejemplo, conseguir una entrevista): los prompts son una ayuda para preparar mejor tu trabajo, y la revisión final es siempre tuya.
      </p>

      <h2 id="quien-esta-detras">Quién está detrás de {siteName}</h2>
      {autorDatos.bioLarga?.map((parrafo) => <p key={parrafo}>{parrafo}</p>)}
      <p>
        {siteName} es un proyecto de {editorial}. El responsable editorial y legal del sitio es {autor}, persona natural con domicilio en {autorDatos.pais}; {editorial} es el nombre del proyecto, no una empresa registrada. Si encuentras un error, quieres proponer un prompt o tienes cualquier duda, escríbenos desde la <Link href="/contacto">página de contacto</Link> o a <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2 id="como-se-financia">Cómo se financia</h2>
      <p>
        El acceso al sitio es gratuito y no pide registro. El sitio puede mostrar publicidad de Google AdSense (ahora mismo no muestra ninguna). No hay enlaces de afiliados ni contenido patrocinado. Puedes leer más en la <Link href="/politica-de-privacidad">política de privacidad</Link> y en los <Link href="/terminos-y-condiciones">términos y condiciones</Link>.
      </p>
    </LegalPage>
  );
}
