import { JsonLd } from "@/components/seo/json-ld";
import { PaginaComparar, PREGUNTAS_COMPARAR } from "@/components/comparar/pagina-comparar";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "viajes-y-entretenimiento";
const SLUG = "comparar-opciones-de-viaje";

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
          webApplicationJsonLd({ nombre: h.pagina.tituloCorto, descripcion: h.pagina.descripcion, path: ruta, autor, categoria: "TravelApplication" }),
          howToJsonLd({
            nombre: "Cómo comparar opciones de viaje con criterios claros",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Escribe tus opciones y tus criterios", texto: "Agrega de 2 a 5 opciones con su precio y sus datos, reparte 100 puntos entre tus criterios y puntúa cada opción.", ancla: "paso-1" },
              { nombre: "Copia el prompt", texto: "La página ya calculó el costo total ajustado y la puntuación de cada opción; copia el prompt para que la IA agregue valoraciones y preguntas.", ancla: "paso-2" },
              { nombre: "Pega la respuesta", texto: "Revisa la tabla comparativa, los costos a verificar, las ventajas y desventajas, y las preguntas antes de reservar.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_COMPARAR),
        ]}
      />
      <PaginaComparar herramienta={h} />
    </>
  );
}
