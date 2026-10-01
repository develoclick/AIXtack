import Link from "next/link";
import { ArrowRight, Clock, Database, ListTree, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorAnalisisVentas } from "./generador-analisis-ventas";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_ANALISIS_VENTAS } from "@/content/ejemplos/analizar-ventas";
import { armarResumenAnalisis, filasVentaDesdeMapeo } from "@/lib/analizar-ventas/calculo";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_ANALIZAR_VENTAS = [
  {
    q: "¿Qué columnas necesita mi archivo?",
    a: "Como mínimo, fecha e importe. Con producto y cantidad, el análisis es mucho más completo: puedes ver top de productos, categorías y la descomposición de una variación. Vendedor, cliente, sucursal y canal son opcionales y habilitan más participaciones en el dashboard.",
  },
  {
    q: "¿Mis datos se suben a esta web?",
    a: "No. El archivo se lee en tu navegador, con canvas y JavaScript; nunca se envía a este sitio. Si eliges «adjuntar el archivo» al copiar el prompt, eres tú quien lo sube a tu IA por fuera de esta página: esa parte se rige por la política de privacidad de ese servicio.",
  },
  {
    q: "¿Qué es el ticket promedio?",
    a: "Ventas totales divididas entre número de operaciones (filas con importe). Si sube el ticket promedio pero bajan las operaciones, significa que compraron menos veces, pero cada compra fue mayor.",
  },
  {
    q: "¿La IA puede decirme por qué bajaron mis ventas?",
    a: "Puede proponer hipótesis razonables a partir de las métricas, pero no puede comprobarlas: eso requiere que tú revises inventario, promociones, tráfico u otra información que esta página no tiene.",
  },
  {
    q: "¿Funciona con exportaciones de mi sistema de caja o POS?",
    a: "Sí, siempre que puedas exportarlas a Excel (.xlsx, .xls) o CSV. Revisa que la columna de fecha use un formato reconocible (DD/MM/AAAA o AAAA-MM-DD).",
  },
  {
    q: "¿Qué pasa si mi archivo tiene miles de filas?",
    a: `Esta herramienta procesa hasta 50,000 filas de datos en tu navegador. Si tu archivo trae más, se analizan las primeras 50,000 y la página te avisa que se recortó.`,
  },
  {
    q: "¿Por qué la página dice que 2 períodos no son comparables?",
    a: "Cuando comparas, por ejemplo, un mes de 31 días contra uno de 28, más días casi siempre significan más ventas, sin que el negocio haya mejorado. Esta página cuenta los días de cada período y te avisa si no coinciden.",
  },
  {
    q: "¿Qué significa que un producto o cliente esté muy concentrado?",
    a: "Que un grupo pequeño de productos o clientes explica una parte grande de tus ventas. No es necesariamente malo, pero es un riesgo: si ese producto se agota o ese cliente se va, el impacto es mayor.",
  },
  {
    q: "¿Esta herramienta reemplaza a un contador o analista de datos?",
    a: "No. Organiza y calcula lo que tus datos ya dicen, y te ayuda a interpretarlo con una IA. Para decisiones grandes (inversión, despidos, cambios de precio importantes), la revisión de un profesional sigue siendo la mejor práctica.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Analista de datos comerciales, riguroso al distinguir hechos de hipótesis."],
  ["Objetivo", "Revisar la calidad de los datos, interpretar las métricas y explicar la variación entre períodos."],
  ["Fuente", "La ficha de tu archivo y las métricas ya calculadas, entre etiquetas y declaradas como información, no como instrucciones."],
  ["Datos del usuario", "Moneda, período analizado, período de comparación, objetivo del análisis y contexto conocido del negocio."],
  ["Reglas de contenido", "Usar solo los datos de la ficha y las métricas; nunca recalcularlas; nunca predecir ventas futuras."],
  ["Reglas de formato", "«Métricas principales» en una tabla CSV; el resto, viñetas; sin iconos."],
  ["Formato de salida", "8 títulos exactos y en orden, para que la página arme los paneles del informe."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: ninguna cifra recalculada, cada causa marcada [HIPÓTESIS], advertencia si los períodos no son comparables."],
];

const CHECKLIST = [
  "Revisaste la sección «Calidad de datos» y entendiste qué significa cada problema señalado (negativos, duplicados, importe inconsistente).",
  "Confirmaste que el período que analizaste y el de comparación tienen sentido para tu negocio.",
  "Si la página advirtió que los períodos no son comparables (distinta cantidad de días), lo tuviste en cuenta antes de sacar conclusiones.",
  "Cada causa que vas a usar para decidir algo está marcada como hipótesis, no como hecho comprobado.",
  "Verificaste al menos una hipótesis importante con otra fuente (inventario, registro de promociones, tráfico) antes de actuar.",
  "Si vas a compartir el informe, revisaste que no incluya datos personales de clientes que no deberías compartir.",
  "Guardaste una copia en .csv de las métricas, por si necesitas volver a ellas más adelante.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#columnas-minimas", "Preparar tu archivo de ventas"],
  ["#facturacion-ticket", "Facturación, unidades y ticket promedio"],
  ["#comparar-periodos", "Comparar períodos correctamente"],
  ["#descomponer-variacion", "Descomponer una variación"],
  ["#patrones-productos", "Productos que requieren atención"],
  ["#tendencia-no-es-causalidad", "Tendencia no es causalidad"],
  ["#calidad-de-datos", "Calidad de datos"],
  ["#privacidad", "Privacidad: qué se envía y qué no"],
  ["#ejemplo", "Ejemplo completo"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist antes de actuar"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaAnalizarVentas({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_ANALISIS_VENTAS[0];
  const hojaEj = { nombre: ej.nombreArchivo, filas: ej.filasCrudas, truncado: false };
  const filasEj = filasVentaDesdeMapeo(hojaEj, ej.datos.mapeo);
  const resumenEj = armarResumenAnalisis(filasEj, ej.datos.mapeo, { desde: ej.datos.periodoDesde, hasta: ej.datos.periodoHasta }, { desde: ej.datos.comparacionDesde, hasta: ej.datos.comparacionHasta });
  const cmp = resumenEj.comparacion!;
  const monto = (n: number) => `S/ ${formatoMonto(n)}`;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Analizar ventas en Excel" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Dashboard inmediato en tu navegador (ventas, ticket promedio, evolución, productos clave) y un prompt que guía a tu IA para un análisis riguroso: hechos, variaciones y preguntas a investigar.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Sparkles, "Gratis, sin registro"],
              [Database, "Lee Excel y CSV"],
              [ShieldCheck, "Las métricas nunca las calcula la IA"],
              [Lock, "Tu archivo nunca sale de tu navegador"],
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Esta página no sustituye a un contador ni a un analista de datos. Las métricas las calcula esta página; los hallazgos y las hipótesis los redacta tu IA y siempre requieren tu revisión.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Analizador de ventas en Excel con IA">
          <GeneradorAnalisisVentas />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · negocio ficticio</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            La caída de junio se explica sobre todo por vender menos veces, no por vender montos más pequeños
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una ferretería ficticia, las ventas bajaron de {monto(cmp.ventasA)} en mayo a {monto(cmp.ventasB)} en junio ({cmp.variacionPct} %). El efecto de tener menos operaciones fue de {monto(cmp.efectoOperaciones)}; el del ticket promedio, que en realidad subió, fue de {monto(cmp.efectoTicket)} a favor. Esa descomposición la calcula esta página, nunca la IA.{" "}
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
            <p>Pegarle una hoja de cálculo entera a una IA de chat no funciona bien: los modelos de lenguaje pueden equivocarse al sumar miles de filas, y tú no tienes forma de comprobarlo. Esta herramienta separa el cálculo (que hace tu navegador, siempre verificable) de la interpretación (que hace tu IA, con las cifras ya resueltas).</p>
            <ol>
              <li>
                <strong>Subes tu archivo</strong> (.xlsx, .xls o .csv): tu navegador lo lee con JavaScript, arma una «ficha del dataset» (columnas, tipos, valores únicos, % de vacíos) y te sugiere qué columna corresponde a fecha, producto, importe, etc.
              </li>
              <li>
                <strong>Revisas el mapeo y ves tu dashboard al instante</strong>: ventas, operaciones, ticket promedio, evolución mensual y tus productos principales, calculados en tu navegador, sin esperar a ninguna IA.
              </li>
              <li>
                <strong>Copias un prompt</strong> que lleva la ficha de tu archivo y esas métricas ya calculadas: le pides a tu IA que las interprete (calidad de datos, hallazgos, hipótesis), nunca que las recalcule.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la IA nunca ve tus filas de ventas, una por una, dentro del texto del prompt.</strong> Solo recibe la ficha del archivo y las métricas agregadas; si decides adjuntar el archivo original a tu conversación, esa parte la haces tú, fuera de esta página.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="columnas-minimas">Cómo preparar tu archivo de ventas (columnas mínimas)</h2>
            <p>No necesitas una hoja perfecta. Como mínimo, esta herramienta necesita 2 columnas para funcionar; el resto son opcionales y suman más vistas al dashboard.</p>
            <Tabla
              resumen="Columnas que reconoce la herramienta, si son obligatorias y qué habilitan"
              columnas={["Columna", "¿Obligatoria?", "Qué habilita"]}
              primeraColumnaEnNegrita
              filas={[
                ["Fecha", "Sí", "La evolución mensual y la comparación de períodos."],
                ["Importe", "Sí", "Las ventas totales, el ticket promedio y casi todo el resto del dashboard."],
                ["Producto", "No", "El top de productos y la concentración de ventas por producto."],
                ["Categoría", "No", "La participación por categoría."],
                ["Cantidad", "No", "Las unidades vendidas y el precio medio por unidad."],
                ["Precio unitario", "No", "El cálculo del importe si tu archivo no trae una columna de importe, y la revisión de importe ≠ cantidad × precio."],
                ["Vendedor, cliente, sucursal, canal", "No", "Participaciones adicionales y la concentración por cliente."],
              ]}
            />
            <p>La página sugiere el mapeo automáticamente por el nombre de cada columna («Fecha», «Total», «Cliente»…); si tu archivo usa otros nombres, corrígelo tú mismo en un par de clics.</p>

            <h2 id="facturacion-ticket">Facturación, unidades y ticket promedio: qué cuenta cada uno</h2>
            <Tabla
              resumen="Las 5 métricas principales del dashboard y cómo se calculan"
              columnas={["Métrica", "Cómo se calcula"]}
              primeraColumnaEnNegrita
              filas={[
                ["Ventas totales", "Suma del importe de todas las filas del período."],
                ["Operaciones", "Número de filas con un importe (cada fila es una venta o transacción)."],
                ["Unidades", "Suma de la columna cantidad, si la mapeaste."],
                ["Ticket promedio", "Ventas totales ÷ operaciones: cuánto deja, en promedio, cada venta."],
                ["Precio medio por unidad", "Ventas totales ÷ unidades: distinto del ticket promedio si una venta trae varias unidades."],
              ]}
            />
            <p>El ticket promedio y el precio medio por unidad suelen confundirse. Si vendes cuadernos a S/ 6.50 cada uno pero casi siempre en paquetes de 5, tu precio medio por unidad ronda S/ 6.50, pero tu ticket promedio (por venta) ronda S/ 32.50.</p>

            <h2 id="comparar-periodos">Cómo comparar períodos correctamente (días, estacionalidad, festivos)</h2>
            <p>El error más común al comparar 2 meses es no fijarse en cuántos días tiene cada uno. Un mes de 31 días casi siempre vende más que uno de 28, sin que el negocio haya mejorado en nada. Por eso esta herramienta cuenta los días exactos de cada período que elijas y te avisa cuando no coinciden.</p>
            <ul>
              <li>Compara meses completos contra meses completos cuando puedas, no un mes completo contra uno a medias.</li>
              <li>Si tu negocio tiene estacionalidad (útiles escolares en marzo, regalos en diciembre), compara contra el mismo mes del año anterior, no solo contra el mes previo.</li>
              <li>Si un período incluye un feriado largo o un cierre y el otro no, anótalo en el campo «Contexto conocido del negocio» del formulario: así tu IA no inventa una causa que tú ya conoces.</li>
            </ul>

            <h2 id="descomponer-variacion">Descomponer una variación: ¿más clientes o compras más grandes?</h2>
            <p>Cuando las ventas cambian, hay 2 explicaciones posibles (o una mezcla de ambas): cambió el número de operaciones (vendiste más o menos veces) o cambió el ticket promedio (cada venta dejó más o menos dinero). Esta herramienta separa exactamente cuánto aporta cada efecto, con una fórmula simple:</p>
            <ul>
              <li>
                <strong>Efecto de operaciones</strong>: (operaciones del período nuevo − operaciones del período anterior) × ticket promedio del período anterior.
              </li>
              <li>
                <strong>Efecto de ticket</strong>: (ticket promedio del período nuevo − ticket promedio del período anterior) × operaciones del período nuevo.
              </li>
            </ul>
            <p>Los 2 efectos suman exactamente la diferencia entre las ventas de ambos períodos: no sobra ni falta nada. Saber cuál de los 2 domina cambia la acción a tomar: si cae por operaciones, el problema probablemente es tráfico o stock; si cae por ticket, probablemente es mezcla de productos o precio.</p>

            <Anuncio posicion="medio" />

            <h2 id="patrones-productos">Productos que requieren atención: 4 patrones</h2>
            <Tabla
              resumen="4 patrones de productos que vale la pena revisar, y qué sugieren"
              columnas={["Patrón", "Qué sugiere"]}
              primeraColumnaEnNegrita
              filas={[
                ["Un producto concentra una parte muy grande de las ventas", "Riesgo: si se agota o deja de venderse, el impacto en tus ventas totales es grande."],
                ["Un producto cae de participación mes a mes", "Vale la pena revisar stock, precio o si apareció un sustituto más barato."],
                ["Pocos clientes explican la mayoría de las ventas", "Riesgo de dependencia: perder a uno de esos clientes pesa mucho en el total."],
                ["Un canal o sucursal se queda atrás de los demás", "Puede ser un problema local (personal, horario, stock) más que del negocio completo."],
              ]}
            />
            <p>Esta herramienta calcula la concentración (qué % de las ventas explica el 20 % de tus productos o clientes con más ventas) para que no tengas que adivinarlo mirando una tabla larga.</p>
            <p>
              Esta herramienta mide cuánto vendes de cada producto, no cuánto ganas: si un producto vende mucho pero deja poco margen, revísalo con{" "}
              <Link href="/emprendimiento/calcular-rentabilidad-de-mi-negocio">nuestra calculadora de rentabilidad por producto</Link>.
            </p>

            <h2 id="tendencia-no-es-causalidad">Tendencia no es causalidad</h2>
            <p>Que las ventas hayan subido después de un cambio (una promoción, un nuevo producto, un cambio de precio) no prueba que ese cambio sea la causa: pudo influir el mes, el clima, un competidor cerrado temporalmente, o pura coincidencia. Por eso el prompt de esta herramienta le exige a la IA marcar toda posible causa como <strong>[HIPÓTESIS]</strong>, nunca como un hecho comprobado, y proponer cómo comprobarla con otra información (inventario, registro de promociones, tráfico).</p>

            <h2 id="calidad-de-datos">Calidad de datos: qué revisa esta página</h2>
            <Tabla
              resumen="Los 4 problemas de calidad que revisa esta página, y qué significan"
              columnas={["Problema", "Qué significa"]}
              primeraColumnaEnNegrita
              filas={[
                ["Importe negativo", "Probablemente una devolución. La página no la descarta: la cuenta y te avisa para que la confirmes."],
                ["Fecha fuera de rango", "Una fecha anterior al año 2000 o en el futuro lejano: suele ser un error de formato al exportar el archivo."],
                ["Filas duplicadas", "2 o más filas con exactamente los mismos datos: puede ser una venta real repetida o un error al copiar."],
                ["Importe ≠ cantidad × precio", "El importe no cuadra con cantidad × precio: puede ser una devolución, un descuento, o un error de digitación."],
              ]}
            />
            <p>Esta página nunca elimina ninguna fila por su cuenta: solo cuenta los problemas y te los muestra, para que decidas tú cómo tratarlos.</p>

            <h2 id="privacidad">Privacidad: qué se envía y qué no</h2>
            <p>Tu archivo se lee enteramente en tu navegador (con JavaScript y, para Excel, una librería que corre ahí mismo): nunca se sube a ningún servidor de este sitio. El prompt que copias tampoco incluye tus filas de ventas una por una: solo la ficha del archivo (nombres de columnas, tipos, una muestra de valores) y las métricas ya calculadas.</p>
            <p>Si eliges el modo «Adjuntaré el archivo original», la decisión de subirlo a tu IA es tuya, y ocurre fuera de esta página: revisa la política de privacidad de la IA que uses antes de adjuntar datos de clientes reales.</p>

            <h2 id="ejemplo">Ejemplo completo: ferretería ficticia, enero a junio</h2>
            <p>«Ferretería El Tornillo», negocio ficticio con 2 sucursales y 2 canales de venta, 134 registros de enero a junio.</p>
            <h3>1. Las métricas de junio</h3>
            <Tabla
              resumen="Métricas principales de junio en el ejemplo"
              columnas={["Métrica", "Valor"]}
              primeraColumnaEnNegrita
              filas={[
                ["Ventas totales", monto(resumenEj.metricas.ventas)],
                ["Operaciones", String(resumenEj.metricas.operaciones)],
                ["Unidades", String(resumenEj.metricas.unidades)],
                ["Ticket promedio", monto(resumenEj.metricas.ticketPromedio)],
              ]}
            />
            <h3>2. La descomposición de la caída</h3>
            <p>
              Entre mayo ({monto(cmp.ventasA)}, {cmp.operacionesA} operaciones, ticket {monto(cmp.ticketA)}) y junio ({monto(cmp.ventasB)}, {cmp.operacionesB} operaciones, ticket {monto(cmp.ticketB)}), las ventas variaron {cmp.variacionPct} %. El efecto de tener menos operaciones fue de {monto(cmp.efectoOperaciones)}; el efecto del ticket promedio, que en realidad subió, fue de {monto(cmp.efectoTicket)} a favor.
            </p>
            <h3>3. La hipótesis, no el hecho</h3>
            <p>La respuesta de la IA no afirma «las ventas bajaron por falta de stock»: lo marca como [HIPÓTESIS] y sugiere revisar el inventario de esas fechas, porque esta página no tiene forma de comprobarlo con los datos que recibió.</p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «analice mis ventas»:</p>
            <Tabla resumen="Bloques del prompt de analizar ventas en Excel y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca recalcula ninguna métrica ni ve tus filas una por una: solo interpreta lo que ya calculó esta página. Eso hace que un error de aritmética del modelo (posible en cualquier IA de chat) no pueda colarse en tus cifras.</p>

            <h2 id="checklist">Checklist antes de actuar sobre tus datos</h2>
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
                <strong>No predice ventas futuras.</strong> Analiza lo que ya pasó; el prompt le prohíbe explícitamente proyectar tendencias.
              </li>
              <li>
                <strong>No sustituye a un contador ni a un analista de datos.</strong> Para decisiones grandes, la revisión de un profesional sigue siendo la mejor práctica.
              </li>
              <li>
                <strong>Procesa hasta 50,000 filas</strong> en tu navegador; archivos más grandes se recortan, con aviso.
              </li>
              <li>
                <strong>No verifica el origen de tus datos.</strong> Si tu sistema de caja exporta mal una columna, esta página no puede saberlo: siempre revisa la ficha del archivo al subirlo.
              </li>
              <li>
                <strong>No da asesoría legal ni tributaria.</strong> Si tienes dudas sobre esta herramienta, puedes <Link href="/contacto">escribirnos</Link>.
              </li>
              <li>
                <strong>Tu archivo, siempre en tu navegador.</strong> Nunca se envía a este sitio; revisa el detalle en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíba: puede mezclar una hipótesis con un hecho, o no advertir una comparación injusta entre períodos. La revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El lector de la respuesta, la descomposición de la variación y los cálculos de calidad de datos se prueban automáticamente con datos ficticios, incluyendo casos donde los períodos no son comparables. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_ANALIZAR_VENTAS.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {q.a}
                  {q.q.includes("se suben a esta web") && (
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
            <p className="mt-3 text-muted-foreground">Esta herramienta no cita estadísticas de ventas de terceros: sus reglas (calidad de datos, descomposición de variación, comparación justa de períodos) son fórmulas propias de esta página, verificadas con pruebas automáticas. Sí se apoya en un estándar técnico real para procesar tu archivo sin subirlo a ningún servidor:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Tu archivo se lee con la{" "}
                <a className="text-brand underline underline-offset-2" href="https://developer.mozilla.org/es/docs/Web/API/File_API" target="_blank" rel="noopener noreferrer">
                  File API del navegador
                </a>{" "}
                (documentada por MDN Web Docs, consultada el 30 de septiembre de 2026): un estándar web que permite leer un archivo local sin enviarlo a ningún servidor.
              </li>
              <li>Esta herramienta no envía tu archivo a ningún servidor de este sitio: se lee y se calcula enteramente en tu navegador.</li>
              <li>La descomposición de la variación (efecto de operaciones + efecto de ticket = diferencia exacta de ventas) es una fórmula matemática verificable, no una estimación de la IA.</li>
              <li>No usamos el nombre de ningún negocio real como ejemplo: los 2 perfiles de esta guía (una ferretería y un bazar escolar, ambos de Lima, Perú) son ficticios y de elaboración propia, con todas sus cifras recalculadas.</li>
              <li>El lector de la respuesta y el detector de cifras inventadas se prueban automáticamente, incluyendo casos donde la IA cita un monto que no está en los datos.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
