import { JsonLd } from "@/components/seo/json-ld";
import { PaginaOptimizar, PREGUNTAS_OPTIMIZAR } from "@/components/optimizar/pagina-optimizar";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "carrera-y-empleo";
const SLUG = "optimizar-cv";

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
            nombre: "Cómo optimizar tu CV para una oferta laboral",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Pega tu CV y la oferta", texto: "Pega el texto de tu CV actual y la oferta completa, elige la intensidad (retoque, adaptación o reestructuración) y anota lo que no se puede tocar.", ancla: "paso-1" },
              { nombre: "Copia el prompt y pégalo en tu IA", texto: "El prompt se arma solo con tus datos. Cópialo y pégalo en ChatGPT, Gemini, Claude u otro asistente.", ancla: "paso-2" },
              { nombre: "Pega la respuesta, compara y descarga", texto: "Pega la respuesta de la IA, compara tu CV antes y después, revisa lo que debes verificar y descarga el CV optimizado en Word.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_OPTIMIZAR),
        ]}
      />
      <PaginaOptimizar herramienta={h} />
    </>
  );
}
