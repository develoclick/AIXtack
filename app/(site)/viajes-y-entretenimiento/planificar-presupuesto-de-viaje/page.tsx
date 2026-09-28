import { JsonLd } from "@/components/seo/json-ld";
import { PaginaPresupuesto, PREGUNTAS_PRESUPUESTO } from "@/components/presupuesto/pagina-presupuesto";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "viajes-y-entretenimiento";
const SLUG = "planificar-presupuesto-de-viaje";

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
            nombre: "Cómo calcular el presupuesto de un viaje",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Escribe tu viaje y tus gastos", texto: "Anota destino, noches, viajeros y moneda, y un gasto por línea con su unidad (por viaje, por noche, por persona o por persona y día) y su tipo (conocido, estimado u opcional).", ancla: "paso-1" },
              { nombre: "Revisa los cálculos y copia el prompt", texto: "Compara los tres escenarios, mira los gastos que quizá olvidaste y copia el prompt para que una IA revise tu presupuesto sin inventar precios.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y añade lo que falta", texto: "Pega la respuesta de la IA, añade a tu tabla los gastos que faltan y comprueba los montos que la página marca como no provenientes de tus datos.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_PRESUPUESTO),
        ]}
      />
      <PaginaPresupuesto herramienta={h} />
    </>
  );
}
