import { JsonLd } from "@/components/seo/json-ld";
import { PaginaCatalogo, PREGUNTAS_CATALOGO } from "@/components/catalogo-productos/pagina-catalogo";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "emprendimiento";
const SLUG = "crear-catalogo-de-productos";

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
          webApplicationJsonLd({ nombre: h.pagina.tituloCorto, descripcion: h.pagina.descripcion, path: ruta, autor, categoria: "BusinessApplication" }),
          howToJsonLd({
            nombre: "Cómo crear un catálogo de productos con IA",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Escribe o importa tus productos", texto: "Agrega tus productos uno por uno o importa un .csv, con nombre y precio como datos obligatorios.", ancla: "paso-1" },
              { nombre: "Copia el prompt", texto: "Pégalo en un asistente de IA para obtener la ficha de cada producto, organizada en categorías.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y descarga tu catálogo", texto: "Revisa tu catálogo por categoría, sube fotos opcionales y descarga el PDF, las fichas para redes o el .csv.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_CATALOGO),
        ]}
      />
      <PaginaCatalogo herramienta={h} />
    </>
  );
}
