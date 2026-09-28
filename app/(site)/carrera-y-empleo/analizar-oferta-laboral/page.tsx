import { JsonLd } from "@/components/seo/json-ld";
import { PaginaAnalisis, PREGUNTAS_ANALISIS } from "@/components/analisis/pagina-analisis";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "carrera-y-empleo";
const SLUG = "analizar-oferta-laboral";

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
            nombre: "Cómo comparar tu CV con una oferta laboral requisito por requisito",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Pega tu CV y la oferta", texto: "Pega el texto de tu CV y la oferta completa, y opcionalmente ajusta los pesos de obligatorios y deseables, tus años de experiencia y si la oferta distingue ambos tipos.", ancla: "paso-1" },
              { nombre: "Copia el prompt y pégalo en tu IA", texto: "El prompt se arma solo con tus datos. Cópialo y pégalo en ChatGPT, Gemini, Claude u otro asistente: la IA extrae y clasifica los requisitos, pero no calcula el porcentaje.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y decide", texto: "Pega la respuesta: la página lee la tabla, recalcula el porcentaje orientativo con la fórmula a la vista, muestra el semáforo de decisión y tu plan de acción.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_ANALISIS),
        ]}
      />
      <PaginaAnalisis herramienta={h} />
    </>
  );
}
