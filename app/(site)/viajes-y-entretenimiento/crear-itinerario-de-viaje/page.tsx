import { JsonLd } from "@/components/seo/json-ld";
import { PaginaItinerario, PREGUNTAS_ITINERARIO } from "@/components/itinerario/pagina-itinerario";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "viajes-y-entretenimiento";
const SLUG = "crear-itinerario-de-viaje";

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
            nombre: "Cómo crear un itinerario de viaje día por día",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Cuéntanos tu viaje", texto: "Escribe el destino, las fechas, las horas de llegada y salida, los viajeros, el ritmo y los intereses; agrega los lugares que ya tienes en mente, con su prioridad, su horario conocido y su reserva.", ancla: "paso-1" },
              { nombre: "Copia el prompt y pégalo en tu IA", texto: "Copia el prompt en ChatGPT, Gemini, Claude u otro asistente, idealmente uno con búsqueda web, para obtener un itinerario día por día.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y revisa tu itinerario", texto: "Pega la respuesta: la página arma la línea de tiempo de cada día, avisa de horarios cruzados o días sobrecargados, y te deja exportar a tu calendario, a una hoja de cálculo o a papel.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_ITINERARIO),
        ]}
      />
      <PaginaItinerario herramienta={h} />
    </>
  );
}
