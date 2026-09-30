import { JsonLd } from "@/components/seo/json-ld";
import { PaginaFechas, PREGUNTAS_FECHAS } from "@/components/fechas/pagina-fechas";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "viajes-y-entretenimiento";
const SLUG = "encontrar-fechas-mas-baratas-para-volar";

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
            nombre: "Cómo encontrar las fechas más baratas para volar",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Indica tu período y duraciones", texto: "Escribe origen, destino, el período de fechas y las duraciones en noches; la página genera todas las combinaciones válidas.", ancla: "paso-1" },
              { nombre: "Obtén los precios", texto: "Sigue el método guiado con un buscador de vuelos, o copia el prompt para que una IA con búsqueda web consulte los precios.", ancla: "paso-2" },
              { nombre: "Pega o escribe los precios", texto: "La página ordena las combinaciones, resalta la más barata encontrada, arma el mapa de calor y lista las combinaciones que aún no tienen precio.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_FECHAS),
        ]}
      />
      <PaginaFechas herramienta={h} />
    </>
  );
}
