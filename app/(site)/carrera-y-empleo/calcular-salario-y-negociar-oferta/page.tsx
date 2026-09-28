import { JsonLd } from "@/components/seo/json-ld";
import { PaginaSalario, PREGUNTAS_SALARIO } from "@/components/salario/pagina-salario";
import { AUTOR_POR_DEFECTO, EDITORIAL, getAuthor } from "@/content/autores";
import { getCategoria, rutaHerramienta } from "@/content/catalogo";
import { exigirPublicada, metadataDeHerramienta } from "@/lib/catalogo-paginas";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, webApplicationJsonLd } from "@/lib/seo/json-ld";

const CATEGORIA = "carrera-y-empleo";
const SLUG = "calcular-salario-y-negociar-oferta";

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
          webApplicationJsonLd({ nombre: h.pagina.tituloCorto, descripcion: h.pagina.descripcion, path: ruta, autor, categoria: "FinanceApplication" }),
          howToJsonLd({
            nombre: "Cómo evaluar una oferta de trabajo y preparar la negociación de tu salario",
            descripcion: h.pagina.descripcion,
            path: ruta,
            pasos: [
              { nombre: "Registra la oferta y tus datos", texto: "Anota el salario fijo mensual bruto, los pagos al año, el variable, los beneficios, tus referencias salariales con fuente y fecha, el costo de ir a trabajar y tus tres cifras (mínimo, objetivo y ancla).", ancla: "paso-1" },
              { nombre: "Revisa los cálculos y copia el prompt", texto: "Mira el valor anual de la oferta con la fórmula de cada componente, compara dos ofertas si tienes y copia el prompt en ChatGPT, Gemini, Claude u otro asistente.", ancla: "paso-2" },
              { nombre: "Pega la respuesta y prepara la conversación", texto: "Pega la respuesta: la página separa la revisión de la oferta, las preguntas al reclutador, tus argumentos y unas respuestas preparadas que puedes copiar, y marca las cifras que no vengan de tus datos.", ancla: "paso-3" },
            ],
          }),
          articleJsonLd({ titulo: h.pagina.h1, descripcion: h.pagina.descripcion, path: ruta, publicado: h.fechaPublicacion, actualizado: h.fechaActualizacion, autor, editorial: getAuthor(EDITORIAL)!.name }),
          faqJsonLd(PREGUNTAS_SALARIO),
        ]}
      />
      <PaginaSalario herramienta={h} />
    </>
  );
}
