import Link from "next/link";
import { ArrowRight, Calculator, Clock, FileDown, ListTree, Lock } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorRentabilidad } from "./generador-rentabilidad";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_RENTABILIDAD } from "@/content/ejemplos/rentabilidad";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import { calcularProductos, calcularResultado } from "@/lib/rentabilidad/calculo";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_RENTABILIDAD = [
  {
    q: "¿Qué diferencia hay entre margen y markup?",
    a: "El margen se calcula sobre el precio de venta; el markup, sobre el costo. Un markup de 50 % (cobras 50 % más de lo que te costó) equivale a un margen de 33,3 % (la ganancia es el 33,3 % del precio final). Son 2 formas distintas de mirar el mismo número, y confundirlas hace que fijes precios más bajos de lo que crees.",
  },
  {
    q: "¿Debo incluir mi propio sueldo como costo?",
    a: "Sí, si trabajas en el negocio. Si no te pagas un sueldo y no lo cuentas como costo, la «utilidad» que calculas en realidad incluye el pago por tu propio trabajo, no solo la ganancia real del negocio.",
  },
  {
    q: "¿Esta herramienta sirve para un negocio de servicios, no solo de productos?",
    a: "Sí. El costo directo de un servicio suele ser horas × costo por hora (tu sueldo o el de quien lo presta, prorrateado), en vez de un insumo físico. El resto del cálculo (margen, punto de equilibrio, sensibilidad) funciona igual.",
  },
  {
    q: "¿Por qué la herramienta me advierte que faltan datos?",
    a: "Porque una rentabilidad calculada sin costos completos (sueldo del dueño, mermas, depreciación) parece mejor de lo que es en realidad. La página revisa una lista de costos que casi todos olvidan y te avisa cuáles no detectó en tu formulario.",
  },
  {
    q: "¿La IA calcula mi rentabilidad?",
    a: "No. Todos los cálculos oficiales (ingresos, márgenes, punto de equilibrio, sensibilidad) los hace esta página con tus propios números. El prompt le entrega esos cálculos ya resueltos a la IA para que los interprete y te sugiera acciones, no para que los recalcule.",
  },
  {
    q: "¿Qué significa la etiqueta «[HIPÓTESIS]»?",
    a: "Marca cualquier afirmación que dependa de cómo reaccionen tus clientes (por ejemplo, si subir el precio reduce las ventas). La IA no puede saber eso con tus datos: son hipótesis a probar, no hechos calculados.",
  },
  {
    q: "¿Puedo importar mis productos desde Excel?",
    a: "Sí, guardando tu archivo como .csv primero (en Excel: Archivo → Guardar como → CSV). La página lee una fila de encabezado con las columnas nombre, precio, costo y unidades, en cualquier orden.",
  },
  {
    q: "¿Esto reemplaza a mi contador?",
    a: "No. Es una herramienta de análisis de gestión para que entiendas dónde ganas y dónde pierdes margen. No calcula impuestos, no hace tu contabilidad formal y no sustituye la revisión de un contador o asesor financiero.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Analista financiero de pequeñas empresas."],
  ["Objetivo", "Interpretar los resultados que ya calculó la página (no recalcularlos) y proponer acciones concretas."],
  ["Fuente", "Tus productos, tus costos y los cálculos ya hechos por la página, entre etiquetas y declarados como información."],
  ["Datos del usuario", "Productos o servicios, costos variables y fijos, si tu sueldo está incluido, impuestos que conoces y tu objetivo de utilidad."],
  ["Reglas de contenido", "Usar solo tus datos, citar los cálculos de la página tal cual (nunca recalcularlos) y marcar con «[HIPÓTESIS]» todo lo que dependa de tus clientes."],
  ["Reglas de formato", "Texto plano, viñetas, sin símbolos # fuera de los títulos; las fórmulas de sensibilidad se muestran con los valores, no solo la conclusión."],
  ["Formato de salida", "7 títulos exactos y en orden, para que la página arme los paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: ningún número recalculado, cada hipótesis etiquetada, los títulos exactos, y la aclaración de que no es asesoría financiera."],
];

const CHECKLIST = [
  "Revisaste si tu propio sueldo está incluido en los costos fijos: si no, tu utilidad real es menor a la calculada.",
  "El costo directo de cada producto incluye todos sus insumos (o todas sus horas, si es un servicio), no solo el principal.",
  "Los costos fijos incluyen todo lo que pagas aunque no vendas nada ese período (alquiler, sueldos, servicios).",
  "Consideraste si tu negocio tiene mermas, depreciación o mantenimiento que todavía no registraste.",
  "Entiendes cuál de tus productos aporta más contribución total, no solo cuál tiene mejor margen porcentual.",
  "Revisaste la sensibilidad: sabes qué variable (precio, volumen, costo o fijos) mueve más tu resultado.",
  "Cada afirmación sobre el comportamiento de tus clientes en la respuesta de la IA está marcada «[HIPÓTESIS]».",
  "No vas a usar este análisis como sustituto de tu declaración de impuestos ni de la revisión de un contador.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#ingresos-utilidad-flujo", "Ingresos, utilidad y flujo de caja"],
  ["#fijos-vs-variables", "Costos fijos vs variables"],
  ["#costo-real-producto", "Cómo calcular el costo real de un producto"],
  ["#margenes", "Margen bruto, operativo y neto"],
  ["#markup-vs-margen", "Markup vs margen"],
  ["#contribucion-y-equilibrio", "Margen de contribución y punto de equilibrio"],
  ["#caso-completo", "Caso completo: una pastelería"],
  ["#variables-que-mueven", "Qué variables mueven más tu resultado"],
  ["#errores-frecuentes", "Errores frecuentes al medir la rentabilidad"],
  ["#cuando-contador", "Cuándo acudir a un contador"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist antes de decidir"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaRentabilidad({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_RENTABILIDAD[0];
  const productos = calcularProductos(ej.datos);
  const r = calcularResultado(ej.datos)!;
  const galletas = productos.find((x) => x.nombre === "Cajas de galletas")!;
  const cupcakes = productos.find((x) => x.nombre === "Cupcakes")!;
  const tortas = productos.find((x) => x.nombre === "Tortas")!;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Calcular la rentabilidad de tu negocio" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Rentabilidad total y por producto, punto de equilibrio y escenarios. Los números se calculan en la página; la IA te ayuda a interpretarlos.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Calculator, "Cálculos hechos por la página, no por la IA"],
              [FileDown, "Importa CSV y exporta tu informe"],
              [Lock, "Tus datos, en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof Calculator;
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Este análisis se genera con ayuda de IA y no es una auditoría contable ni asesoría financiera o tributaria. Revísalo antes de tomar decisiones de precio o de inversión.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Calculadora de rentabilidad de negocio con IA">
          <GeneradorRentabilidad />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · negocio ficticio</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Esta pastelería vende S/ {formatoMonto(r.ingresosTotal)} al mes, pero le queda solo S/ {formatoMonto(r.utilidadOperativa)}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Las cajas de galletas generan más ingresos (S/ {formatoMonto(galletas.ingresos)}) pero tienen el margen más bajo (23 %); los cupcakes son el producto más rentable, con 58 % de margen. Esa diferencia entre vender mucho y ganar mucho la calcula esta página, nunca la IA.{" "}
            <a href="#caso-completo" className="font-medium text-brand underline underline-offset-2">
              Ver el caso completo
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
            <p>Preguntarle a una IA «¿es rentable mi negocio?» sin darle una estructura suele devolver una respuesta genérica, porque no tiene tus números reales ni sabe qué fórmula usar. Esta herramienta separa lo que puede calcular una hoja de cálculo de lo que solo puede interpretar una IA, en 3 pasos.</p>
            <ol>
              <li>
                <strong>Cargas tus productos y tus costos</strong>: precio, costo directo y unidades vendidas de cada producto o servicio, más tus costos variables por venta y tus costos fijos del período. Puedes escribirlos a mano o importar un .csv.
              </li>
              <li>
                <strong>Copias un prompt que ya trae tu cálculo resuelto</strong>: ingresos, márgenes, punto de equilibrio y sensibilidad, para que la IA los interprete y te sugiera acciones, sin inventar ni un solo número.
              </li>
              <li>
                <strong>Pegas la respuesta</strong> y la página arma los paneles de rentabilidad por producto, sensibilidad, costos posiblemente omitidos y acciones a probar, con un detector de cifras que no vienen de tus datos.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la IA nunca calcula tus ingresos, tu margen ni tu punto de equilibrio.</strong> Esta página los calcula con tus propios números y se los entrega ya resueltos, para que los cite en vez de inventarlos.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="ingresos-utilidad-flujo">Ingresos, facturación, utilidad y flujo de caja: no son lo mismo</h2>
            <p>Es fácil confundir estos 4 conceptos porque todos «suenan a dinero», pero responden preguntas distintas:</p>
            <Tabla
              resumen="4 conceptos financieros que se confunden y qué pregunta responde cada uno"
              columnas={["Concepto", "Qué pregunta responde"]}
              primeraColumnaEnNegrita
              filas={[
                ["Ingresos o facturación", "¿Cuánto vendiste? (precio × unidades, antes de restar ningún costo)."],
                ["Utilidad", "¿Cuánto te queda después de restar tus costos? Puede ser bruta u operativa, según qué costos restes."],
                ["Flujo de caja", "¿Cuánto dinero entró y salió de tu cuenta en el período? Una venta a crédito suma a los ingresos, pero no entra en caja hasta que te pagan."],
              ]}
            />
            <p>Un negocio puede tener una buena utilidad «en papel» y quedarse sin efectivo si sus clientes pagan tarde o si compró mucho inventario por adelantado. Esta herramienta calcula ingresos y utilidad (lo que vendiste y lo que ganaste), no flujo de caja (cuándo entró el dinero): para eso necesitas llevar el registro de cobros y pagos por fecha.</p>

            <h2 id="fijos-vs-variables">Costos fijos vs variables (con ejemplos por tipo de negocio)</h2>
            <p>Un costo es <strong>fijo</strong> si lo pagas aunque no vendas nada ese período (alquiler, sueldos, servicios). Es <strong>variable</strong> si depende de cuánto vendes (insumos, comisiones, envíos). La misma categoría puede ser fija en un negocio y variable en otro:</p>
            <Tabla
              resumen="Ejemplos de costos fijos y variables según el tipo de negocio"
              columnas={["Tipo de negocio", "Costos fijos típicos", "Costos variables típicos"]}
              primeraColumnaEnNegrita
              filas={[
                ["Tienda o restaurante", "Alquiler, sueldos, luz, internet", "Insumos, comisión de apps de delivery, empaque"],
                ["Servicio profesional (consultoría, diseño)", "Oficina, software con suscripción, sueldo de un asistente", "Horas de un colaborador externo por proyecto, comisión de la pasarela de pago"],
                ["Comercio con tienda en línea", "Plataforma de venta, hosting, sueldo del equipo", "Comisión de la plataforma, pasarela de pago, envío"],
                ["Manufactura pequeña", "Alquiler del taller, sueldos, depreciación de máquinas", "Materia prima, energía por unidad producida, mermas"],
              ]}
            />
            <p>Esta herramienta te pide los costos fijos como una lista (uno por concepto) y los costos variables por venta como un solo % o monto del período, porque en la mayoría de negocios pequeños esas comisiones se calculan así (por ejemplo, «la app de delivery cobra 5 % de cada venta»).</p>

            <h2 id="costo-real-producto">Cómo calcular el costo real de un producto</h2>
            <p>El costo directo de un producto es todo lo que gastas específicamente para producir <strong>esa</strong> unidad, sin incluir los costos fijos del negocio (esos se restan aparte, una sola vez, no por producto). Para un producto físico, suele ser la suma de sus insumos:</p>
            <ul>
              <li>Materia prima o ingredientes usados en esa unidad.</li>
              <li>Empaque o embalaje de esa unidad.</li>
              <li>Comisión que se paga específicamente por esa venta (si no la metes en «costos variables por venta»).</li>
            </ul>
            <p>Para un servicio, el costo directo suele ser <strong>horas × costo por hora</strong>: si te toma 2 horas hacer un corte de cabello con coloración y tu hora (sueldo prorrateado) cuesta S/ 14, el costo directo de ese servicio es S/ 28. Súmale cualquier insumo (tinte, productos) para llegar al costo directo completo.</p>

            <h2 id="margenes">Margen bruto, margen operativo y margen neto</h2>
            <p>Los 3 términos miden «cuánto te queda», pero en etapas distintas del cálculo:</p>
            <Tabla
              resumen="Diferencia entre margen bruto, operativo y neto"
              columnas={["Margen", "Qué resta", "Lo calcula esta herramienta"]}
              primeraColumnaEnNegrita
              filas={[
                ["Margen bruto", "Solo el costo directo de lo vendido.", "Sí"],
                ["Margen operativo", "El costo directo, más los costos variables adicionales y los costos fijos del período.", "Sí"],
                ["Margen neto", "Todo lo anterior, más impuestos y gastos financieros (intereses de préstamos).", "No: los impuestos varían por régimen tributario y país; consulta a un contador para ese cálculo."],
              ]}
            />
            <p>Esta herramienta se detiene en el margen operativo a propósito: es el que puedes calcular con datos de tu propio negocio, sin necesitar asesoría tributaria para estimarlo.</p>

            <Anuncio posicion="medio" />

            <h2 id="markup-vs-margen">Markup vs margen: la confusión que hace perder dinero</h2>
            <p>El <strong>margen</strong> se calcula sobre el precio de venta: contribución ÷ precio. El <strong>markup</strong> se calcula sobre el costo: contribución ÷ costo. Son 2 números distintos para la misma situación, y confundirlos lleva a fijar precios más bajos de lo que crees:</p>
            <Tabla
              resumen="Tabla de conversión entre markup (sobre el costo) y margen (sobre el precio)"
              columnas={["Markup (sobre el costo)", "Margen equivalente (sobre el precio)"]}
              primeraColumnaEnNegrita
              filas={[
                ["10 %", "9,1 %"],
                ["25 %", "20,0 %"],
                ["50 %", "33,3 %"],
                ["100 %", "50,0 %"],
                ["150 %", "60,0 %"],
                ["200 %", "66,7 %"],
              ]}
            />
            <p>Ejemplo: si un producto te cuesta S/ 10 y le aplicas un markup de 50 % (lo vendes en S/ 15), tu margen real no es 50 %, es 33,3 % (S/ 5 de ganancia ÷ S/ 15 de precio). Si crees que tu margen es 50 % cuando en realidad es 33,3 %, puedes estar cobrando de menos frente a lo que planeaste. Esta herramienta siempre reporta margen (sobre el precio), no markup, para evitar esa confusión.</p>

            <h2 id="contribucion-y-equilibrio">Margen de contribución y punto de equilibrio</h2>
            <p>El <strong>margen de contribución</strong> es lo que te queda de cada sol vendido después de restar los costos que varían con la venta (costo directo y costos variables adicionales). El <strong>punto de equilibrio</strong> es cuánto necesitas vender para que ese margen cubra exactamente tus costos fijos, sin ganar ni perder:</p>
            <ul>
              <li>
                <strong>Margen de contribución (%)</strong> = (ingresos − costo directo − costos variables adicionales) ÷ ingresos.
              </li>
              <li>
                <strong>Punto de equilibrio (S/)</strong> = costos fijos ÷ margen de contribución (%).
              </li>
            </ul>
            <p>Con varios productos de distinto margen, el punto de equilibrio usa el margen de contribución <em>ponderado</em> (el de la mezcla de ventas actual), y el número de unidades equivalentes se calcula dividiendo ese monto entre el precio promedio de venta. Si cambias qué tanto vendes de cada producto, tu punto de equilibrio real cambia con la mezcla, aunque el monto en soles parezca el mismo.</p>

            <h2 id="caso-completo">Caso completo: una pastelería que vende mucho y gana poco</h2>
            <p>Pastelería ficticia, un mes. Vende 3 productos: tortas (S/ {formatoMonto(tortas.precio)} c/u, costo S/ {formatoMonto(tortas.costo)}, {tortas.unidades} unidades), cupcakes (S/ {formatoMonto(cupcakes.precio)} c/u, costo S/ {formatoMonto(cupcakes.costo)}, {cupcakes.unidades} unidades) y cajas de galletas (S/ {formatoMonto(galletas.precio)} c/u, costo S/ {formatoMonto(galletas.costo)}, {galletas.unidades} unidades). Paga 5 % de comisión a las apps de delivery y S/ {formatoMonto(r.fijos)} de costos fijos al mes.</p>
            <h3>1. El resultado del período</h3>
            <Tabla
              resumen="Resultado del período de la pastelería del ejemplo"
              columnas={["Concepto", "Monto"]}
              primeraColumnaEnNegrita
              filas={[
                ["Ingresos totales", `S/ ${formatoMonto(r.ingresosTotal)}`],
                ["Costo directo total", `S/ ${formatoMonto(r.costoDirectoTotal)}`],
                ["Utilidad bruta", `S/ ${formatoMonto(r.utilidadBruta)} (${r.margenBrutoPct} %)`],
                ["Comisiones de delivery (5 %)", `S/ ${formatoMonto(r.variablesAdicionales)}`],
                ["Costos fijos", `S/ ${formatoMonto(r.fijos)}`],
                ["Utilidad operativa", `S/ ${formatoMonto(r.utilidadOperativa)} (${r.margenOperativoPct} %)`],
              ]}
            />
            <h3>2. Por qué «vender mucho» no es lo mismo que «ganar mucho»</h3>
            <p>
              Las cajas de galletas generan más ingresos que cualquier otro producto (S/ {formatoMonto(galletas.ingresos)}, el {Math.round((galletas.ingresos / r.ingresosTotal) * 100)} % del total) pero tienen el margen más bajo de los 3 ({galletas.margenPct} %). Los cupcakes, con un precio mucho menor, tienen el mejor margen ({cupcakes.margenPct} %) y la mayor contribución total (S/ {formatoMonto(cupcakes.contribucionTotal)}). Mirar solo los ingresos por producto habría llevado a la conclusión equivocada de que las galletas son «el producto estrella»: en realidad son el que menos aporta a la utilidad por cada sol vendido.
            </p>
            <h3>3. Lo que reveló el punto de equilibrio</h3>
            <p>Con un margen de contribución ponderado de {r.margenContribucionPct} %, el punto de equilibrio de este negocio es S/ {formatoMonto(r.puntoEquilibrioMonto!)} al mes. Como hoy vende S/ {formatoMonto(r.ingresosTotal)}, está apenas por encima: un mes flojo, o una comisión de delivery más alta, puede convertir la utilidad en pérdida.</p>

            <h2 id="variables-que-mueven">Qué variables mueven más tu resultado</h2>
            <p>La herramienta prueba, una por una, cuánto cambia tu utilidad si el precio, el volumen, el costo variable o los costos fijos suben o bajan 5 % y 10 % (manteniendo todo lo demás igual). En la mayoría de negocios pequeños, el orden de sensibilidad suele ser:</p>
            <ol>
              <li>
                <strong>Precio de venta:</strong> normalmente la variable más sensible, porque un cambio de precio afecta a todas las unidades vendidas, sin cambiar el costo.
              </li>
              <li>
                <strong>Costo variable:</strong> un aumento de precio de tus insumos también golpea a todas las unidades, y suele ser la segunda variable más sensible.
              </li>
              <li>
                <strong>Volumen de ventas:</strong> mueve menos de lo que parece cuando el margen por unidad ya es bajo, porque cada unidad extra solo aporta ese margen reducido.
              </li>
              <li>
                <strong>Costos fijos:</strong> suelen ser los más fáciles de negociar o recortar, pero también los que menos impacto porcentual tienen sobre la utilidad en un solo período.
              </li>
            </ol>
            <p>Esta orden no es una regla fija: depende de tu estructura de costos. Por eso la herramienta calcula la sensibilidad con tus propios números, en vez de darte un consejo genérico.</p>

            <h2 id="errores-frecuentes">Errores frecuentes al medir la rentabilidad</h2>
            <Tabla
              resumen="Errores frecuentes al medir la rentabilidad de un negocio, por qué ocurren y cómo corregirlos"
              columnas={["Error", "Por qué ocurre", "Corrección"]}
              primeraColumnaEnNegrita
              filas={[
                ["Confundir ingresos con utilidad", "Ver «vendí S/ 10.000» y sentir que el negocio va bien, sin restar ningún costo.", "Siempre revisa la utilidad operativa, no solo el total vendido."],
                ["No incluir el sueldo del dueño", "Si el dueño trabaja «gratis», ese costo no aparece en ningún lado.", "Agrega un costo fijo con tu sueldo, aunque no te lo pagues todavía en efectivo."],
                ["Mirar solo el margen %, no la contribución total", "Un producto con 70 % de margen pero pocas ventas puede aportar menos que uno con 30 % de margen y mucho volumen.", "Compara siempre la contribución total (margen × unidades), no solo el porcentaje."],
                ["Ignorar mermas y depreciación", "Son costos que no se pagan en efectivo cada mes, así que se olvidan.", "Estímalos aunque sea de forma aproximada y agrégalos como costo fijo."],
                ["Usar markup cuando se quiere decir margen", "Un markup de 50 % suena igual a un margen de 50 %, pero no lo es (ver la tabla de conversión).", "Verifica siempre si el número que estás mirando es margen (sobre el precio) o markup (sobre el costo)."],
              ]}
            />

            <h2 id="cuando-contador">Cuándo acudir a un contador</h2>
            <p>Esta herramienta te ayuda a entender la rentabilidad de gestión de tu negocio: qué producto conviene más, dónde se va tu margen, qué tan sensible es tu resultado. No sustituye a un contador en estos casos:</p>
            <ul>
              <li>Para calcular impuestos exactos (el régimen tributario y las tasas varían por país y por tipo de negocio).</li>
              <li>Para preparar estados financieros formales o declaraciones ante la autoridad tributaria.</li>
              <li>Para decidir la estructura legal de tu negocio o temas de formalización.</li>
              <li>Para planificar depreciación contable exacta de tus activos (aquí solo se sugiere estimarla).</li>
            </ul>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que evalúe la rentabilidad de tu negocio:</p>
            <Tabla resumen="Bloques del prompt de calcular la rentabilidad y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca calcula tus ingresos, tu margen, tu punto de equilibrio ni tu sensibilidad: solo los cita, ya resueltos por esta página, y los usa para redactar su interpretación.</p>

            <h2 id="checklist">Checklist antes de decidir con este análisis</h2>
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
                <strong>No es una auditoría contable ni asesoría financiera o tributaria.</strong> Es una herramienta de análisis de gestión, para entender tu negocio, no para reemplazar a un profesional.
              </li>
              <li>
                <strong>No calcula impuestos.</strong> El campo de «impuestos que conoces» solo sirve para que la IA los mencione en su análisis; la página nunca los resta del resultado.
              </li>
              <li>
                <strong>No calcula flujo de caja.</strong> Mide ingresos y utilidad del período, no cuándo entra o sale el dinero de tu cuenta.
              </li>
              <li>
                <strong>Tus datos, siempre en tu navegador.</strong> El formulario nunca se envía a este sitio; revisa el detalle en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíba: puede olvidar marcar una hipótesis o repetir una sugerencia genérica. La revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> Las fórmulas de margen, punto de equilibrio y sensibilidad, el importador de CSV y el detector de cifras sin respaldo se prueban automáticamente contra datos ficticios verificados con código, no a mano. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>, o <Link href="/contacto">escríbenos</Link> si encuentras un error.
              </li>
            </ul>
            <p>
              Si además necesitas ordenar tu idea de negocio completa, esta herramienta se complementa con{" "}
              <Link href="/emprendimiento/crear-plan-de-negocio" className="text-brand underline underline-offset-2">
                crear un plan de negocio con IA
              </Link>
              . Revisa el resto de herramientas para emprendedores en{" "}
              <Link href="/emprendimiento" className="text-brand underline underline-offset-2">
                Emprendimiento
              </Link>
              .
            </p>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_RENTABILIDAD.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">{q.a}</p>
              </details>
            ))}
          </div>

          <HerramientasRelacionadas categoria={herramienta.categoria} slug={herramienta.slug} />
          {pendientes.length > 0 && (
            <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
              <ArrowRight aria-hidden className="mt-0.5 size-4 shrink-0" />
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
            <p className="mt-3 text-muted-foreground">Las fórmulas de esta guía son estándares de contabilidad de gestión, no una interpretación de la IA: se aplican con el código de esta página, verificado con pruebas automáticas.</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://www.gob.pe/producemas" target="_blank" rel="noopener noreferrer">
                  Produce Más (Ministerio de la Producción): plataforma de orientación y servicios para emprendedores y MYPE
                </a>
                : consultada el 30 de septiembre de 2026. Esta página oficial peruana bloquea la lectura automatizada, por eso esta guía no cita ningún dato exacto de ella; úsala para verificar formalización, financiamiento y asesoría gratuita en tu caso concreto.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Esta herramienta no calcula impuestos, licencias ni trámites de formalización: para eso, consulta a SUNAT o a la entidad correspondiente en tu país.</li>
              <li>No usamos el nombre de ninguna marca, plataforma de delivery ni pasarela de pago real como parte de la herramienta ni de sus ejemplos.</li>
              <li>Todos los ejemplos (negocios, productos y cifras) son ficticios y de elaboración propia; sus cálculos se recalculan con el mismo código de la herramienta, nunca a mano.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
