import { JsonLd } from "@/components/seo/json-ld";
import { PaginaEntrevista, PREGUNTAS_ENTREVISTA } from "@/components/entrevista/pagina-entrevista";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "carrera-y-empleo";
const SLUG = "preparar-entrevista-de-trabajo";

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
          webApplicationJsonLd({ nombre: h.pagina.tituloCorto, descripcion: h.pagina.descripcion, path: ruta, autor, categoria: "EducationalApplication" }),
          howToJsonLd({
            nombre: "Cómo preparar una entrevista de trabajo con tu CV y la oferta",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Pega tu CV y la oferta", texto: "Pega el texto de tu CV y la oferta completa, elige el tipo de entrevista, el nivel de dificultad y el modo de práctica (banco de preguntas o simulación en vivo).", ancla: "paso-1" },
              { nombre: "Copia el prompt y pégalo en tu IA", texto: "El prompt se arma solo con tus datos. Cópialo y pégalo en ChatGPT, Gemini, Claude u otro asistente; en modo simulación responde una pregunta a la vez.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y practica", texto: "Pega la respuesta o el informe final, revisa tu hoja de estudio y practica con el cronómetro de 2 minutos, la grabadora, tus historias STAR y la checklist del día previo.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_ENTREVISTA),
        ]}
      />
      <PaginaEntrevista herramienta={h} />
    </>
  );
}
