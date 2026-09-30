import { JsonLd } from "@/components/seo/json-ld";
import { PaginaDestinos, PREGUNTAS_DESTINOS } from "@/components/destinos/pagina-destinos";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "viajes-y-entretenimiento";
const SLUG = "descubrir-destinos-segun-presupuesto";

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
            nombre: "Cómo descubrir a qué destinos puedes viajar con tu presupuesto",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Indica tu presupuesto y tu viaje", texto: "Escribe presupuesto, origen, viajeros, gasto diario y un rango de noches; la página reparte tu presupuesto al instante.", ancla: "paso-1" },
              { nombre: "Obtén destinos candidatos", texto: "Explora tú mismo con un buscador de vuelos, o copia el prompt para que una IA con búsqueda web proponga hasta 8 destinos.", ancla: "paso-2" },
              { nombre: "Pega o escribe los destinos", texto: "La página recalcula el costo total de cada uno, marca cuáles entran en tu presupuesto y cuántas noches máximas son viables.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_DESTINOS),
        ]}
      />
      <PaginaDestinos herramienta={h} />
    </>
  );
}
