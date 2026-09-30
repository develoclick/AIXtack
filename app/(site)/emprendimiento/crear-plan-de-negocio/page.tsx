import { JsonLd } from "@/components/seo/json-ld";
import { PaginaPlanNegocio, PREGUNTAS_PLAN_NEGOCIO } from "@/components/plan-negocio/pagina-plan-negocio";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "emprendimiento";
const SLUG = "crear-plan-de-negocio";

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
            nombre: "Cómo crear un plan de negocio con IA",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Cuenta tu negocio y tus números", texto: "Escribe tu producto, tu cliente, tu competencia, tu equipo, tu inversión, tus gastos fijos, tu precio de venta y tu costo variable.", ancla: "paso-1" },
              { nombre: "Copia el prompt", texto: "Pégalo en un asistente de IA de texto: primero te hace un diagnóstico y preguntas; con tus respuestas, redacta el plan completo de 19 secciones.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y descarga tu plan", texto: "La página arma los paneles, revisa las cifras sin respaldo y te deja descargar el plan en Word, con cada cifra identificada.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_PLAN_NEGOCIO),
        ]}
      />
      <PaginaPlanNegocio herramienta={h} />
    </>
  );
}
