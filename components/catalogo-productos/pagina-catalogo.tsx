import Link from "next/link";
import { ArrowRight, Clock, ListTree, Lock, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorCatalogo } from "./generador-catalogo";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_CATALOGO } from "@/content/ejemplos/catalogo-productos";
import { leerRespuestaCatalogo } from "@/lib/catalogo-productos/lector";
import { preciosSinCoincidir } from "@/lib/catalogo-productos/verificar";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_CATALOGO = [
  {
    q: "¿Mis fotos y mis datos se suben a algún servidor?",
    a: "No. El formulario se guarda solo en tu navegador, y las fotos que subas a las fichas de producto nunca salen de tu navegador: no se suben a este sitio ni se guardan al recargar la página. Tus datos de texto solo salen cuando tú pegas el prompt en la IA que elijas.",
  },
  {
    q: "¿Qué pasa si el precio de la respuesta no coincide con lo que escribí?",
    a: "La descarga queda bloqueada. Esta página compara el precio de cada producto (número por número) contra lo que escribiste en el formulario, y muestra exactamente qué producto no coincide, para que lo corrijas antes de compartir el catálogo con un precio equivocado.",
  },
  {
    q: "¿Cuántas categorías puedo tener?",
    a: "Hasta 8. El prompt se lo pide a la IA; si tu respuesta trae más, esta página te avisa (sin bloquear la descarga) para que le pidas a tu IA que agrupe mejor tus productos.",
  },
  {
    q: "¿Necesito un número de WhatsApp?",
    a: "Solo si quieres el botón «Enlace de WhatsApp» en cada producto. Sin número, el catálogo se genera igual: solo no aparece ese enlace.",
  },
  {
    q: "¿Las plantillas cambian el texto de mi catálogo?",
    a: "No. Cada plantilla (Minimalista, Moda, Alimentos, Ferretería y técnico) solo cambia el color de acento del catálogo, del PDF y de las fichas para redes. El texto de cada producto es siempre el que generó tu IA.",
  },
  {
    q: "¿Puedo editar el catálogo después de generarlo?",
    a: "Sí: vuelve al prompt, ajusta tus datos o tus productos, y pégale a tu IA el prompt actualizado. También puedes editar los productos y volver a pegar la respuesta corregida en el recuadro de esta página.",
  },
  {
    q: "¿En qué se diferencian el PDF, las fichas para redes y el .csv?",
    a: "El PDF trae todo tu catálogo en una sola lista, para imprimir o enviar completo. Las fichas para redes son una imagen por producto (1080×1350), lista para publicar en Instagram o Facebook. El .csv es una tabla editable, para llevar tu catálogo a Excel o a otra herramienta.",
  },
  {
    q: "¿Este catálogo aparece en buscadores como Google?",
    a: "No. Es un documento que generas y descargas en tu navegador (PDF, imágenes o .csv): no se publica en ninguna página web indexable por buscadores.",
  },
  {
    q: "¿Esto reemplaza una tienda en línea?",
    a: "No. Es un catálogo para compartir por WhatsApp, redes o imprimir, no un carrito de compras ni una pasarela de pago. Si necesitas cobrar en línea, esta herramienta no lo hace por ti.",
  },
  {
    q: "¿Puedo usar fotos que no son mías?",
    a: "Solo si tienes derecho a usarlas (fotos propias, compradas con licencia, o de tus proveedores con su autorización). Esta página no verifica el origen de las fotos que subas.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Redactor de catálogos y organizador de productos para pequeños negocios."],
  ["Objetivo", "Redactar la ficha de cada producto, organizarlas en categorías y proponer un llamado a la acción, sin tocar ningún precio."],
  ["Fuente", "Los datos de tu negocio y tus productos, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Empresa, rubro, público objetivo, estilo de marca y la tabla completa de productos (nombre, precio, categoría, sku, notas)."],
  ["Reglas de contenido", "Usar solo tus datos, copiar el precio EXACTO sin recalcularlo, y devolver el nombre original de cada producto sin cambiarlo."],
  ["Reglas de formato", "Un bloque CSV de 10 columnas, con especificaciones y variantes separadas por «;» dentro de la misma celda."],
  ["Formato de salida", "5 títulos exactos y en orden, para que la página arme el catálogo, la lista de faltantes y las sugerencias de fotos."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: el nombre original intacto, el precio idéntico, y un máximo de 8 categorías."],
];

const CHECKLIST = [
  "El precio de cada producto en el catálogo generado coincide con el que escribiste (si no, esta página ya te lo habría bloqueado).",
  "Revisaste la sección «Datos faltantes por producto» y completaste lo importante antes de publicar.",
  "Cada foto que subiste es tuya o tienes derecho a usarla.",
  "Probaste el enlace de WhatsApp de al menos un producto y llega al número correcto.",
  "El catálogo no tiene más de 8 categorías (o le pediste a tu IA que las agrupe mejor).",
  "Revisaste que ninguna ficha prometa envío gratis, stock o plazos que no ofreces de verdad.",
  "Elegiste la plantilla que mejor encaja con tu rubro.",
  "Guardaste una copia en .csv por si necesitas editar el catálogo más adelante.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#por-que-catalogo", "Por qué un catálogo ordenado vende más"],
  ["#que-necesitas", "Qué necesitas antes de empezar"],
  ["#categorias", "Organizar tus productos en categorías"],
  ["#fichas-de-producto", "Qué hace buena una ficha de producto"],
  ["#precios-y-bloqueo", "Precios, promociones y el bloqueo de descarga"],
  ["#fotos-con-celular", "Fotografiar tus productos con el celular"],
  ["#plantillas", "Elegir una plantilla según tu rubro"],
  ["#whatsapp", "El enlace de WhatsApp"],
  ["#formatos", "PDF, fichas para redes y .csv: cuándo usar cada uno"],
  ["#errores-frecuentes", "Errores frecuentes con IA"],
  ["#mantener-actualizado", "Mantener tu catálogo actualizado"],
  ["#ejemplo", "Ejemplo completo"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist antes de publicar"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaCatalogo({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_CATALOGO[0];
  const lecturaEj = leerRespuestaCatalogo(ej.respuesta);
  const productoConOtroPrecio = ej.datos.productos.map((prod, i) => (i === 0 ? { ...prod, precio: "150.00" } : prod));
  const demoBloqueo = preciosSinCoincidir(productoConOtroPrecio, lecturaEj.filas)[0];

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Crear un catálogo de productos" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Escribe o importa tus productos, copia un prompt y esta página arma un catálogo organizado por categorías, con fichas para redes, enlace de WhatsApp por producto y un PDF listo para compartir.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Sparkles, "Gratis, sin registro"],
              [ShieldCheck, "El precio nunca lo calcula la IA"],
              [MessageCircle, "Enlace de WhatsApp por producto"],
              [Lock, "Tus fotos se quedan en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof Sparkles;
              return (
                <li key={texto as string} className="pildora">
                  <I aria-hidden className="size-4 text-brand" />
                  {texto as string}
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">
            Por{" "}
            <Link href="/sobre-nosotros" className="font-semibold text-foreground underline-offset-2 hover:underline">
              {autor.name}
            </Link>{" "}
            · Publicado el <time dateTime={herramienta.fechaPublicacion}>{formatDate(herramienta.fechaPublicacion)}</time> · Actualizado el <time dateTime={herramienta.fechaActualizacion}>{formatDate(herramienta.fechaActualizacion)}</time>
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Esta página no cobra pagos ni reemplaza una tienda en línea. El precio de cada producto lo verifica esta página, nunca la IA: si no coincide con lo que escribiste, la descarga queda bloqueada.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Creador de catálogo de productos con IA">
          <GeneradorCatalogo />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · negocio ficticio</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Así se ve el bloqueo si un precio no coincide
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una prueba ficticia con «{ej.datos.empresa}», si el precio de «{ej.datos.productos[0].nombre}» se escribe como S/ 150.00 en el formulario pero la respuesta de la IA trae S/ {lecturaEj.filas[0].precio}, esta página muestra: <em>«{demoBloqueo?.motivo}»</em> y bloquea el PDF, las fichas y el .csv hasta que se corrija. Esa comparación la hace esta página, nunca la IA.{" "}
            <a href="#ejemplo" className="font-medium text-brand underline underline-offset-2">
              Ver el ejemplo completo
            </a>
            .
          </p>
        </aside>

        <div className="guia-diferida mx-auto mt-16 max-w-3xl">
          <div className="tarjeta p-5">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <ListTree aria-hidden className="size-4 text-brand" /> En esta página
              </span>
              <span className="flex items-center gap-1 font-normal text-muted-foreground tabular">
                <Clock aria-hidden className="size-3.5" /> {p.tiempoLectura} de lectura · última actualización: <time dateTime={herramienta.fechaActualizacion}>{formatDate(herramienta.fechaActualizacion)}</time>
              </span>
            </p>
            <nav aria-label="Índice de la guía">
              <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
                {TOC.map(([href, texto]) => (
                  <li key={href}>
                    <a href={href} className="flex min-h-11 items-center text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                      {texto}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <article className={`${PROSE} mt-8`}>
            <h2 id="como-funciona">Cómo funciona la herramienta</h2>
            <p>Armar un catálogo a mano —redactar cada descripción, decidir categorías, cuidar que ningún precio quede mal escrito— toma horas que un negocio pequeño no siempre tiene. Esta herramienta reparte el trabajo en tres pasos, dejando el precio bajo el control exclusivo del formulario, nunca de la IA.</p>
            <ol>
              <li>
                <strong>Escribes o importas tus productos</strong>: nombre y precio son obligatorios; categoría, SKU y notas son opcionales y ayudan a la IA a redactar mejor. Puedes escribirlos uno por uno o importar un .csv (la plantilla descargable trae el formato exacto).
              </li>
              <li>
                <strong>Copias un prompt</strong> que arma esta página con tus datos: te devuelve la ficha de cada producto (nombre mejorado, descripción, especificaciones, variantes), organizadas en hasta 8 categorías, con un llamado a la acción para WhatsApp.
              </li>
              <li>
                <strong>Pegas la respuesta y revisas tu catálogo</strong>: esta página lo agrupa por categoría, arma el enlace de WhatsApp de cada producto y te deja subir una foto opcional para generar una ficha en PNG lista para redes.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la IA redacta, nunca decide el precio.</strong> El prompt le exige copiar tu precio tal cual, y esta página lo comprueba número por número; si no coincide, bloquea el PDF, las fichas y el .csv hasta que lo corrijas.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="por-que-catalogo">Por qué un catálogo ordenado vende más que fotos sueltas</h2>
            <p>Enviar fotos sueltas por WhatsApp obliga a cada cliente a preguntar el precio, el material y si hay otras tallas o colores: cada pregunta repetida es una venta que se enfría mientras esperas responder. Un catálogo con esa información ya escrita reduce esa fricción y deja tu tiempo para atender lo que sí necesita una respuesta personal.</p>
            <Tabla
              resumen="Fotos sueltas por WhatsApp frente a un catálogo ordenado, en tres puntos"
              columnas={["Situación", "Fotos sueltas", "Catálogo ordenado"]}
              primeraColumnaEnNegrita
              filas={[
                ["Precio", "Cada cliente pregunta por separado", "Ya está escrito junto al producto"],
                ["Comparar productos", "Difícil, sin categorías ni orden", "Agrupados por categoría, uno junto a otro"],
                ["Compartir de nuevo", "Hay que reenviar y explicar cada vez", "Un solo PDF o imagen, listo para reenviar"],
              ]}
            />

            <h2 id="que-necesitas">Qué necesitas antes de empezar</h2>
            <p>Cuanta más información tengas de cada producto, mejor la ficha que redacte la IA: el precio es obligatorio, pero una nota corta con el material, la talla o el contenido evita que la respuesta llegue con huecos que tengas que completar tú después.</p>
            <ul>
              <li>El nombre y el precio de cada producto (obligatorio): sin esto, esa fila no aparece en el catálogo.</li>
              <li>Un precio promocional, si aplica: la página lo muestra tachado junto al precio original.</li>
              <li>Una categoría sugerida, si ya tienes una idea clara de cómo agrupar tus productos.</li>
              <li>Notas por producto (material, talla, contenido, garantía): lo que ya sepas, para que la IA no tenga que adivinarlo.</li>
              <li>Tu número de WhatsApp, si quieres el botón de contacto en cada producto.</li>
              <li>Fotos (opcional, y solo si quieres generar fichas para redes): se suben directamente en el paso 3, nunca en el formulario.</li>
            </ul>

            <h2 id="categorias">Cómo organizar tus productos en categorías</h2>
            <p>La IA organiza tus productos en un máximo de 8 categorías: suficientes para separar lo distinto, pocas para que el catálogo siga siendo fácil de recorrer. Si le diste una categoría a cada producto en el formulario, la IA la respeta; si no, agrupa por tipo de producto de forma razonable, y tú siempre puedes pedirle una respuesta nueva si el agrupamiento no te convence.</p>
            <ul>
              <li>Si vendes menos de 15 productos, entre 2 y 4 categorías suelen bastar.</li>
              <li>Evita categorías con un solo producto: es una señal de que se puede fusionar con otra.</li>
              <li>El orden de las categorías en tu catálogo sigue el orden en que aparecen en la respuesta de la IA: si quieres otro orden, pídeselo explícitamente en tu siguiente mensaje a la IA.</li>
            </ul>

            <h2 id="fichas-de-producto">Qué hace buena una ficha de producto</h2>
            <p>Una ficha de producto vende cuando resuelve, en pocas líneas, las preguntas que un cliente haría antes de comprar: qué es, qué trae, cuánto cuesta y cómo contactar. El prompt de esta herramienta le pide a la IA justamente esas piezas, sin inventar las que no le diste.</p>
            <Tabla
              resumen="Las 5 piezas de una ficha de producto y de dónde sale cada una"
              columnas={["Pieza", "De dónde sale"]}
              primeraColumnaEnNegrita
              filas={[
                ["Nombre mejorado", "La IA redacta a partir del nombre que escribiste, sin inventar datos nuevos."],
                ["Descripción", "1 o 2 frases que la IA arma con lo que sabes del producto y tus notas."],
                ["Especificaciones y variantes", "Lo que escribiste en tus notas; si falta algo importante, aparece en «Datos faltantes por producto»."],
                ["Precio", "Exactamente el que escribiste: la IA lo copia, esta página lo verifica."],
                ["Llamado a la acción", "Una frase corta que invita a escribir por WhatsApp, sin prometer envíos ni descuentos que no diste."],
              ]}
            />

            <h2 id="precios-y-bloqueo">Precios, promociones y por qué esta página bloquea la descarga</h2>
            <p>
              Un catálogo con un precio equivocado es un error caro: o pierdes margen si el precio bajó de más, o pierdes la venta si un cliente reclama un precio que en realidad no ofrecías. Por eso el precio es el único dato de esta herramienta que <strong>nunca queda a criterio de la IA</strong>: el prompt le exige copiarlo tal cual, y esta página compara cada fila de la respuesta contra el producto original, buscándolo por su nombre exacto.
            </p>
            <p>Si un precio no coincide, o si la IA cambió el nombre original de un producto (y por eso esta página no puede encontrarlo), la descarga del PDF, las fichas y el .csv queda bloqueada, y se muestra exactamente qué producto revisar.</p>
            <ul>
              <li>El precio promocional es opcional: si no lo escribiste, la ficha solo muestra el precio normal.</li>
              <li>Si tienes un precio promocional, el catálogo lo muestra en grande junto al precio normal tachado.</li>
              <li>Corregir un bloqueo es simple: ajusta el precio en el formulario, o pídele a tu IA una respuesta nueva, y vuelve a pegarla.</li>
            </ul>

            <Anuncio posicion="medio" />

            <h2 id="fotos-con-celular">Cómo fotografiar tus productos con el celular</h2>
            <p>No necesitas un estudio fotográfico: la respuesta de la IA incluye una sugerencia de foto por producto (ángulo y fondo recomendado), pensada para tomarse con un celular. Algunas reglas generales que se repiten en casi cualquier rubro:</p>
            <ul>
              <li>Luz natural, cerca de una ventana, nunca con flash directo.</li>
              <li>Fondo liso (una pared clara, una tela o cartulina) para que el producto sea el centro de la foto.</li>
              <li>Un ángulo de frente y, si el producto lo amerita, un detalle de cerca (textura, costura, empaque).</li>
              <li>La misma iluminación y el mismo fondo en todos tus productos: un catálogo con fotos consistentes se ve más profesional que uno con estilos mezclados.</li>
            </ul>
            <p>Las fotos que subas se usan solo para generar la ficha PNG en tu navegador: no se guardan al recargar la página ni se suben a ningún servidor.</p>

            <h2 id="plantillas">Elegir una plantilla según tu rubro</h2>
            <Tabla
              resumen="Las 4 plantillas disponibles y para qué rubro suele encajar cada una"
              columnas={["Plantilla", "Encaja bien con"]}
              primeraColumnaEnNegrita
              filas={[
                ["Minimalista", "Cualquier rubro; un acento neutro que no compite con tus fotos."],
                ["Moda", "Ropa, calzado y accesorios: un acento cálido y elegante."],
                ["Alimentos", "Comida, pastelería y bebidas: un acento verde que sugiere frescura."],
                ["Ferretería y técnico", "Herramientas, materiales de construcción y repuestos: un acento directo, sin adornos."],
              ]}
            />
            <p>La plantilla solo cambia el color de acento del catálogo, el PDF y las fichas para redes; el texto de cada producto es siempre el que generó tu IA. Puedes cambiarla en cualquier momento, incluso después de pegar la respuesta.</p>

            <h2 id="whatsapp">El enlace de WhatsApp: cómo funciona y qué evitar</h2>
            <p>Con tu número escrito en el formulario, cada producto del catálogo trae un botón «Enlace de WhatsApp» que abre una conversación con un mensaje ya escrito («Hola, quiero consultar por…»), listo para que el cliente solo pulse enviar. El enlace se arma en tu navegador con el estándar público wa.me: no pasa por ningún servidor de este sitio, y no envía nada hasta que el cliente pulsa «Enviar» en su propia conversación de WhatsApp.</p>
            <p>El prompt le pide a la IA un llamado a la acción breve para cada producto, con una regla explícita: nunca prometer envío gratis, descuentos o plazos que tú no hayas mencionado. Si tu IA lo hace de todas formas, corrígelo en la respuesta antes de compartir el catálogo.</p>

            <h2 id="formatos">PDF, fichas para redes y .csv: cuándo usar cada uno</h2>
            <Tabla
              resumen="Los 3 formatos de descarga, qué contienen y cuándo conviene cada uno"
              columnas={["Formato", "Qué contiene", "Cuándo usarlo"]}
              primeraColumnaEnNegrita
              filas={[
                ["PDF (imprimir o guardar)", "Todo el catálogo, agrupado por categoría, en una sola vista.", "Para enviar por correo, imprimir, o compartir el catálogo completo de una vez."],
                ["Fichas PNG (una por producto)", "Imagen de 1080×1350 con nombre, precio, especificaciones y tu foto opcional.", "Para publicar en Instagram, Facebook o WhatsApp Estados, un producto a la vez."],
                [".csv (tabla editable)", "Cada fila del catálogo generado, en una tabla simple.", "Para llevar tu catálogo a Excel o Google Sheets y seguir editándolo ahí."],
              ]}
            />

            <h2 id="errores-frecuentes">Errores frecuentes al armar un catálogo con IA</h2>
            <Tabla
              resumen="Errores frecuentes al generar un catálogo con IA, por qué ocurren y cómo corregirlos"
              columnas={["Error", "Por qué ocurre", "Corrección"]}
              primeraColumnaEnNegrita
              filas={[
                ["Precio recalculado o redondeado", "Algunos modelos «ayudan» aplicando un descuento o redondeando sin que se lo pidas.", "Esta página lo bloquea automáticamente: corrige el precio o pide una respuesta nueva."],
                ["Materiales o certificaciones inventadas", "La IA generaliza a partir de productos similares que conoce.", "Revisa cada ficha contra lo que realmente sabes del producto antes de publicar."],
                ["Demasiadas categorías", "La IA crea una categoría nueva por cada producto distinto.", "Pídele explícitamente que agrupe en menos categorías, con ejemplos de cómo unir dos."],
                ["Promesas no autorizadas (envío gratis, descuento)", "El modelo redacta un llamado a la acción persuasivo por defecto.", "Corrige el texto en la respuesta antes de compartir el catálogo."],
              ]}
            />

            <h2 id="mantener-actualizado">Cómo mantener tu catálogo actualizado</h2>
            <p>Un catálogo desactualizado (con un producto agotado o un precio antiguo) daña más la confianza que no tener catálogo. Como el formulario se guarda en tu navegador, actualizarlo es simple: cambia el precio o quita el producto, vuelve a copiar el prompt y pégalo en tu IA para obtener una respuesta nueva.</p>
            <ul>
              <li>Guarda tu .csv después de cada actualización: es la forma más rápida de llevar un historial de tus precios.</li>
              <li>Si solo cambió un precio, no hace falta regenerar todo el catálogo desde cero: edítalo en el .csv o en el formulario y vuelve a pegar la respuesta corregida.</li>
              <li>Revisa tu catálogo antes de cada campaña o temporada: es el momento más común para que un precio quede desactualizado.</li>
            </ul>

            <h2 id="ejemplo">Ejemplo completo: casacas y accesorios (negocio ficticio)</h2>
            <p>«{ej.datos.empresa}», ropa de abrigo ficticia, {ej.datos.productos.length} productos en 2 categorías (Casacas y Accesorios), con un precio promocional en 2 de ellos.</p>
            <h3>1. El catálogo generado</h3>
            <Tabla
              resumen="Las 5 filas del catálogo del ejemplo, con su producto original, categoría y precio"
              columnas={["Producto (como lo escribiste)", "Categoría", "Precio"]}
              primeraColumnaEnNegrita
              filas={lecturaEj.filas.map((f) => [f.nombreOriginal, f.categoria, f.precioPromo.trim() ? `S/ ${f.precioPromo} (antes S/ ${f.precio})` : `S/ ${f.precio}`])}
            />
            <h3>2. El nombre original, intacto</h3>
            <p>
              La IA mejoró el nombre de «{lecturaEj.filas[0].nombreOriginal}» a «{lecturaEj.filas[0].nombre}», pero la columna «nombre_original» de la respuesta conserva el nombre exacto que escribió la persona: gracias a esa columna, esta página puede encontrar el producto y comparar su precio, sin importar cuánto haya mejorado la IA la redacción.
            </p>
            <h3>3. El bloqueo en acción</h3>
            <p>{demoBloqueo?.motivo}</p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me arme un catálogo»:</p>
            <Tabla resumen="Bloques del prompt de crear un catálogo de productos y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca decide el precio ni cuántas categorías caben: solo redacta y organiza. El precio lo verifica esta página, número por número, contra lo que tú escribiste.</p>

            <h2 id="checklist">Checklist antes de publicar tu catálogo</h2>
            <ul className="not-prose my-4 space-y-2">
              {CHECKLIST.map((x) => (
                <li key={x} className="tarjeta flex gap-3 p-3 text-sm">
                  <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border border-brand-solid text-xs text-brand">
                    ✓
                  </span>
                  {x}
                </li>
              ))}
            </ul>

            <h2 id="limites">Límites y verificación</h2>
            <ul>
              <li>
                <strong>No es una tienda en línea.</strong> Genera un catálogo para compartir (PDF, imágenes o .csv): no procesa pagos ni pedidos.
              </li>
              <li>
                <strong>No verifica tu stock.</strong> Esta página no sabe si un producto sigue disponible: eso lo confirmas tú antes de publicar.
              </li>
              <li>
                <strong>No revisa el origen de tus fotos.</strong> Sube solo fotos propias o con licencia de uso.
              </li>
              <li>
                <strong>No da asesoría legal ni tributaria.</strong> Para boletas, facturación o registro de marca, consulta a un especialista. Si tienes dudas sobre esta herramienta, puedes <Link href="/contacto">escribirnos</Link>.
              </li>
              <li>
                <strong>Tus datos y tus fotos, siempre en tu navegador.</strong> El formulario y las fotos que subas a las fichas nunca se envían a este sitio; revisa el detalle en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíba: puede inventar una especificación o cambiar levemente un nombre. La revisión final es tuya, y el precio siempre lo comprueba esta página.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El lector de la respuesta, la comparación de precios y el generador de fichas se prueban automáticamente con datos ficticios. La calidad del texto que entregue cada IA no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_CATALOGO.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {q.a}
                  {q.q.includes("suben a algún servidor") && (
                    <>
                      {" "}
                      <Link href="/politica-de-privacidad" className="text-brand underline underline-offset-2">
                        Leer la política de privacidad
                      </Link>
                      .
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>

          <HerramientasRelacionadas categoria={herramienta.categoria} slug={herramienta.slug} />
          {pendientes.length > 0 && (
            <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>Pendientes de publicar (sin enlace): {pendientes.map((h) => h.titulo).join("; ")}.</span>
            </p>
          )}

          {apoyo.length > 0 && (
            <section aria-labelledby="articulos-relacionados" className="mt-12">
              <h2 id="articulos-relacionados" className="text-xl font-semibold">
                Artículos relacionados
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {apoyo.map((a) => (
                  <li key={a.slug}>
                    <Link href={rutaDeArticulo(a)} className="tarjeta tarjeta-enlace flex h-full flex-col p-4">
                      <span className="font-semibold leading-snug">{a.metaTitulo}</span>
                      <span className="mt-2 flex items-center gap-1 text-sm font-medium text-brand">
                        Leer <ArrowRight aria-hidden className="size-4" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="fuentes" className="tarjeta mt-12 p-5 text-sm">
            <h2 id="fuentes" className="text-base font-semibold">
              Fuentes y verificación
            </h2>
            <p className="mt-3 text-muted-foreground">Esta herramienta no cita estadísticas ni normativa externa: sus reglas (precio verificado, máximo de 8 categorías, fichas sin datos inventados) son decisiones propias del diseño de la página, no cifras de una fuente externa.</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>El enlace de WhatsApp usa el estándar público wa.me, documentado por WhatsApp para abrir una conversación con un mensaje prellenado, sin ninguna integración ni costo para quien lo usa.</li>
              <li>Esta herramienta no envía tus fotos ni tus datos a ningún servidor de este sitio: el catálogo, las fichas y el PDF se generan enteramente en tu navegador.</li>
              <li>No usamos el nombre ni el logo de ningún negocio real como ejemplo: los 3 perfiles de esta guía son ficticios y de elaboración propia.</li>
              <li>La comparación de precios (el bloqueo de descarga) se prueba automáticamente con datos ficticios, incluyendo casos donde el precio no coincide a propósito.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
