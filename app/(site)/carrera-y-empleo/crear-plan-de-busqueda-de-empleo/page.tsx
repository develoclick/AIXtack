import { JsonLd } from "@/components/seo/json-ld";
import { PaginaPlan, PREGUNTAS_PLAN } from "@/components/plan/pagina-plan";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "carrera-y-empleo";
const SLUG = "crear-plan-de-busqueda-de-empleo";

export const generateMetadata = () => metadataDeHerramienta(CATEGORIA, SLUG);

export default function Page() {
  // 404 mientras la herramienta esté «pendiente» en el catálogo (content/catalogo/herramientas.ts).
  const h = exigirPublicada(CATEGORIA, SLUG);
  const ruta = rutaHerramienta(h);
  const autor = getAuthor(AUTOR_POR_DEFECTO)!.name;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: getCategoria(CATEGORIA)!.nombre, path: `/${CATEGORIA}` }, { name: h.pagina.tituloCorto, path: ruta }]),
          webApplicationJsonLd({ nombre: h.pagina.tituloCorto, descripcion: h.pagina.descripcion, path: ruta, autor }),
          howToJsonLd({
            nombre: "Cómo crear un plan de búsqueda de empleo y medir qué está funcionando",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Define tu objetivo y tu tiempo", texto: "Escribe el puesto, el nivel, el lugar y la modalidad, las horas por semana que puedes dedicar y, si quieres, hasta cinco vacantes para priorizar.", ancla: "paso-1" },
              { nombre: "Copia el prompt y pégalo en tu IA", texto: "Copia el prompt en ChatGPT, Gemini, Claude u otro asistente para obtener un plan de 4 semanas que quepa en tus horas.", ancla: "paso-2" },
              { nombre: "Pega el plan y llévalo a tu calendario", texto: "Pega la respuesta: la página suma los minutos de cada semana, separa la distribución, las vacantes y las plantillas, y exporta el calendario en formato .ics.", ancla: "paso-3" },
              { nombre: "Registra tus postulaciones y revisa tu embudo", texto: "Anota cada postulación con su canal, su versión de CV y su estado; la página calcula tus tasas por etapa y te avisa de los seguimientos pendientes.", ancla: "registro" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_PLAN),
        ]}
      />
      <PaginaPlan herramienta={h} />
    </>
  );
}
