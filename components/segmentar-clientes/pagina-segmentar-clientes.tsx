import Link from "next/link";
import { ArrowRight, BarChart3, Clock, ListTree, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorSegmentarClientes } from "./generador-segmentar-clientes";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_SEGMENTAR_CLIENTES } from "@/content/ejemplos/segmentar-clientes";
import { agregarTransacciones, calcularRFM, resumenSegmentos, segmentosRFMParaResumen } from "@/lib/segmentar-clientes/motor";
import { CLAVES_SEGMENTO_RFM } from "@/lib/segmentar-clientes/tipos";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_SEGMENTAR_CLIENTES = [
  {
    q: "¿Qué es el análisis RFM?",
    a: "Una segmentación basada en 3 preguntas por cliente: ¿cuándo compró por última vez? (recencia), ¿cuántas veces compra? (frecuencia) y ¿cuánto gasta en total? (valor monetario). Esta página calcula las 3 y arma los segmentos sola.",
  },
  {
    q: "¿Cuántos clientes necesito para que RFM funcione bien?",
    a: "Funciona mejor con unos cientos de clientes o más: con pocos, las franjas de 1 a 5 quedan con muy pocos clientes cada una. Con menos de 50 clientes, prueba el método de reglas personalizadas en su lugar.",
  },
  {
    q: "¿Puedo usar un archivo de ventas (transacciones) en vez de uno de clientes?",
    a: "Sí. Elige «Una fila por COMPRA» y la página agrega automáticamente, por cliente, su última compra, su número de pedidos y su gasto total, antes de calcular los segmentos.",
  },
  {
    q: "¿Los segmentos predicen lo que hará un cliente en el futuro?",
    a: "No. RFM describe el comportamiento pasado de cada cliente, no predice el futuro. Un «Campeón» de hoy puede dejar de comprar mañana: por eso conviene recalcular la segmentación cada cierto tiempo.",
  },
  {
    q: "¿Es legal usar los datos de mis clientes para esto?",
    a: "Usa solo datos que hayas obtenido de forma legítima (tus propias ventas) y respeta la normativa de protección de datos personales de tu país. Esta página no sustituye asesoría legal.",
  },
  {
    q: "¿Mis datos de clientes se envían a algún servidor o a la IA?",
    a: "Tu archivo se procesa enteramente en tu navegador: nunca se sube a este sitio. El prompt que copias tampoco incluye un ID, nombre ni dato de ningún cliente individual: solo la ficha de columnas y la tabla ya calculada de segmentos.",
  },
  {
    q: "¿Qué significa que un cliente tenga «R5 F3»?",
    a: "Que está en la franja 5 (la más alta) de recencia —compró muy recientemente— y en la franja 3 (intermedia) de frecuencia —compra con una regularidad media—. Cada franja va de 1 (más bajo) a 5 (más alto).",
  },
  {
    q: "¿Puedo cambiarle el nombre a los segmentos?",
    a: "Sí, con el método RFM puedes escribir el nombre que prefieras para cada uno de los 6 segmentos (por ejemplo, «Campeones» en vez de «Clientes de oro»), y con reglas personalizadas tú eliges el nombre desde el inicio.",
  },
  {
    q: "¿Qué pasa si un cliente no tiene fecha de última compra?",
    a: "Queda en la franja de recencia más baja (la página no inventa una fecha) y la calidad de ese dato se puede revisar en la ficha de tu archivo antes de confiar en el segmento.",
  },
  {
    q: "¿Esta herramienta reemplaza a un analista de datos o a un CRM?",
    a: "No. Te ayuda a llegar rápido a una primera segmentación razonable y a entenderla, pero las decisiones grandes (una campaña cara, un cambio de estrategia) siguen necesitando tu criterio o el de un profesional, y un CRM sigue siendo útil para ejecutar y medir las acciones.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Analista de CRM, que interpreta una segmentación ya calculada sin inventar intenciones del cliente."],
  ["Objetivo", "Describir cada segmento con sus cifras, evaluar su utilidad y proponer qué probar."],
  ["Fuente", "La ficha de tu archivo y la tabla de segmentos ya calculada, nunca un cliente individual."],
  ["Datos del usuario", "El tipo de negocio y el método (RFM o reglas) que elegiste."],
  ["Reglas de contenido", "Usar solo los segmentos y cifras de la tabla; nunca mencionar un ID, nombre o dato de un cliente; nunca suponer edad, género o ingresos."],
  ["Reglas de formato", "Una viñeta por elemento; cada perfil de «Perfiles» con la etiqueta «[INTERPRETACIÓN]»."],
  ["Formato de salida", "7 títulos exactos y en orden, para que la página arme cada panel."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: cifras exactas de la tabla, ningún dato de un cliente individual, perfiles etiquetados, sin datos sensibles ni supuestos."],
];

const CHECKLIST = [
  "La fecha de referencia que usaste tiene sentido (no cae justo en una campaña o feriado atípico).",
  "Revisaste si algún segmento queda por debajo de tu tamaño mínimo, antes de diseñarle una campaña propia.",
  "Si usaste reglas personalizadas, revisaste qué tan grande quedó «Sin segmento»: si es muy grande, te está diciendo algo.",
  "Ninguna «Perfiles [INTERPRETACIÓN]» de la respuesta afirma una edad, género o nivel de ingresos que no esté en tus datos.",
  "Antes de adjuntar tu archivo original a una IA (modo A), revisaste si puedes anonimizar o quitar la columna de ID de cliente.",
  "La acción que vas a probar primero tiene una métrica de éxito clara, no solo una idea.",
  "Si vas a compartir el informe fuera de tu equipo, revisaste que no incluya datos personales que no deberías mostrar.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#que-es-segmentar", "Qué es segmentar"],
  ["#variables", "Qué variables usar"],
  ["#rfm-explicado", "RFM explicado"],
  ["#rfm-en-excel", "RFM en Excel, paso a paso"],
  ["#nombres-segmentos", "Nombres y lectura de segmentos"],
  ["#segmentos-chicos", "Segmentos chicos o inútiles"],
  ["#trato-distinto", "Un trato distinto por segmento"],
  ["#ejemplo", "Ejemplo: 500 clientes"],
  ["#privacidad", "Privacidad"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

const MATRIZ_NOMBRES: [string, string, string, string, string, string][] = [
  ["F \\ R", "R 1-2 (hace tiempo)", "R 3 (medio)", "R 4-5 (reciente)", "", ""],
  ["F 4-5 (compra seguido)", "En riesgo", "Leales", "Campeones", "", ""],
  ["F 3 (medio)", "Perdidos / Regulares", "Leales", "Campeones / Leales", "", ""],
  ["F 1-2 (compra poco)", "Perdidos", "Regulares", "Nuevos", "", ""],
];

export function PaginaSegmentarClientes({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_SEGMENTAR_CLIENTES[0];
  const hojaEj = { nombre: ej.nombreOrigen, filas: ej.filasCrudas, truncado: false };
  const clientesEj = agregarTransacciones(hojaEj, ej.datos.mapeo);
  const rfmEj = calcularRFM(clientesEj, ej.datos.fechaReferencia);
  const resumenEj = resumenSegmentos(segmentosRFMParaResumen(rfmEj, ej.datos.nombresRfm), CLAVES_SEGMENTO_RFM.map((c) => ej.datos.nombresRfm[c]));
  const campeonesEj = resumenEj.find((s) => s.nombre === ej.datos.nombresRfm.campeones)!;

  // Ejemplo narrativo de la guía (500 clientes ficticios): cifras reales, calculadas con el mismo motor, verificadas con un
  // script antes de publicar (ver README de la auditoría). No se usan en la herramienta por su tamaño: solo ilustran el texto.
  const EJEMPLO_500 = {
    total: 500,
    campeones: { cantidad: 118, pctBase: 23.6, pctIngresos: 46.49 },
    enRiesgo: { cantidad: 45, pctBase: 9, pctIngresos: 15.58 },
    leales: { cantidad: 100, pctBase: 20, pctIngresos: 20.24 },
    nuevos: { cantidad: 70, pctBase: 14, pctIngresos: 4.93 },
    perdidos: { cantidad: 118, pctBase: 23.6, pctIngresos: 6.71 },
    regulares: { cantidad: 49, pctBase: 9.8, pctIngresos: 6.04 },
  };

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Segmentar clientes" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">RFM calculado en tu navegador o segmentos por tus propias reglas, con la explicación exacta de cómo se formó cada grupo.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Sparkles, "Gratis, sin registro"],
              [BarChart3, "RFM o reglas propias"],
              [ShieldCheck, "Nunca envía un ID de cliente a la IA"],
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Esta página no sustituye a un analista de datos ni a un CRM. Los segmentos los calcula esta página con tus datos reales; los perfiles y acciones los redacta tu IA y siempre requieren tu revisión.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Segmentador de clientes con IA (RFM o reglas propias)">
          <GeneradorSegmentarClientes />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · negocio ficticio</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            10 clientes generan más de un tercio de los ingresos de esta tienda ficticia
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una tienda de bicicletas ficticia de 70 clientes, el método RFM encuentra que «{campeonesEj.nombre}» son solo {campeonesEj.cantidad} clientes ({campeonesEj.pctBase}% de la base), pero generan el {campeonesEj.pctIngresos}% de los ingresos del período. Son los que compraron más recientemente, con más frecuencia y con el mayor gasto: por eso valen un trato distinto al resto.{" "}
            <a href="#ejemplo" className="font-medium text-brand underline underline-offset-2">
              Ver el ejemplo de 500 clientes
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
            <p>Pedirle a una IA «segméntame estos clientes» tiene un problema de origen: para hacerlo bien, la IA tendría que ver los datos de cada cliente, uno por uno. Esta herramienta separa el cálculo (siempre en tu navegador, con tus datos reales) de la interpretación (la IA, que nunca ve un cliente individual, solo el resumen de cada grupo).</p>
            <ol>
              <li>
                <strong>Subes tu archivo</strong> (clientes ya resumidos, o transacciones: la página agrega por cliente si hace falta) y mapeas el ID de cliente, la fecha y el importe.
              </li>
              <li>
                <strong>Eliges el método</strong>: RFM (recencia, frecuencia, valor, calculado por quintiles) o tus propias reglas (por ejemplo, «gasto mayor a S/ 1,000 y última compra hace menos de 90 días»). Ves la tabla de segmentos y el mapa de calor al instante.
              </li>
              <li>
                <strong>Copias un prompt</strong> que le pide a tu IA describir cada segmento, evaluar si la segmentación es útil y proponer qué probar: ella nunca calcula ni ve un cliente por su nombre o ID.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la IA nunca ve un cliente individual.</strong> Solo recibe la ficha de tus columnas (sin ejemplos de la columna de ID) y la tabla ya calculada de segmentos.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="que-es-segmentar">Qué es segmentar (y por qué no es lo mismo que etiquetar clientes)</h2>
            <p>Segmentar es agrupar a tus clientes según un comportamiento medible (cuándo compraron, cuántas veces, cuánto gastaron), no según una impresión subjetiva («este cliente parece fiel»). La diferencia importa: una etiqueta puesta a ojo no se puede recalcular ni comparar entre meses, mientras que un segmento basado en datos sí.</p>
            <p>Segmentar tampoco es simplemente ordenar a tus clientes de mayor a menor gasto. Un cliente que gastó mucho hace 2 años y no ha vuelto es un caso muy distinto de uno que gasta lo mismo cada mes: por eso RFM combina 3 variables, no solo 1.</p>

            <h2 id="variables">Qué variables sirven para segmentar</h2>
            <Tabla
              resumen="Variables típicas para segmentar clientes, qué miden y si esta herramienta las usa"
              columnas={["Variable", "Qué mide", "¿Esta herramienta la usa?"]}
              primeraColumnaEnNegrita
              filas={[
                ["Recencia", "Hace cuántos días fue la última compra", "Sí, siempre (RFM y reglas)"],
                ["Frecuencia", "Cuántas veces compró (o cuántos pedidos hizo)", "Sí, siempre (RFM y reglas)"],
                ["Valor monetario", "Cuánto gastó en total", "Sí, siempre (RFM y reglas)"],
                ["Categoría o canal preferido", "Qué compra y por dónde", "Se agrega al archivo exportado, pero no entra en el cálculo del segmento"],
                ["Ubicación", "Dónde vive o compra el cliente", "Igual que categoría: queda en el archivo exportado, no en el cálculo"],
                ["Edad, género, ingresos", "Datos demográficos", "No: esta herramienta nunca los supone ni los usa"],
              ]}
            />
            <p>Puedes agregar columnas de ubicación, canal o categoría a tu archivo: viajan en la lista de clientes exportable, útiles para una campaña, aunque no cambien el cálculo del segmento.</p>

            <h2 id="rfm-explicado">RFM explicado: recencia, frecuencia y valor monetario</h2>
            <p>RFM califica a cada cliente con 3 números del 1 al 5 (quintiles: el 20% con el peor valor de esa variable va a la franja 1, el siguiente 20% a la franja 2, y así hasta la franja 5 para el mejor 20%):</p>
            <ul>
              <li>
                <strong>R (recencia):</strong> franja 5 = compró hace muy poco; franja 1 = su última compra fue hace mucho.
              </li>
              <li>
                <strong>F (frecuencia):</strong> franja 5 = compra muy seguido (más pedidos); franja 1 = compra poco.
              </li>
              <li>
                <strong>M (valor monetario):</strong> franja 5 = gastó más en total; franja 1 = gastó menos.
              </li>
            </ul>
            <p>Esta página calcula las 3 franjas por quintiles, en tu navegador, para cada cliente de tu archivo: nunca se lo pide a la IA.</p>

            <Anuncio posicion="medio" />

            <h2 id="rfm-en-excel">Cómo calcular RFM en Excel paso a paso (fórmulas)</h2>
            <p>Si quieres entender (o replicar) el cálculo a mano, estas son las fórmulas, con una columna por cliente ya resumida. Supongamos que tu tabla de transacciones tiene las columnas <code>cliente</code>, <code>fecha</code> e <code>importe</code>, y quieres armar una tabla con 1 fila por cliente:</p>
            <Tabla
              resumen="Fórmulas de Excel/Sheets para calcular recencia, frecuencia y valor monetario por cliente"
              columnas={["Qué calcula", "Fórmula (español / inglés)"]}
              primeraColumnaEnNegrita
              filas={[
                ["Última compra del cliente", "=MAXIFS(fecha; cliente; A2) — en inglés, la misma función: MAXIFS"],
                ["Recencia (días)", "=fecha_referencia − [última compra del cliente]"],
                ["Frecuencia (nº de compras)", "=CONTAR.SI(cliente; A2) — en inglés: COUNTIF(cliente, A2)"],
                ["Valor monetario (gasto total)", "=SUMAR.SI(cliente; A2; importe) — en inglés: SUMIF(cliente, A2, importe)"],
                ["Franja 1-5 (quintil)", "=REDONDEAR.MAS(JERARQUIA.EQV(B2;$B$2:$B$100;1)/CONTARA($B$2:$B$100)*5;0) — en inglés: ROUNDUP(RANK.EQ(B2,$B$2:$B$100,1)/COUNTA($B$2:$B$100)*5,0)"],
              ]}
            />
            <p>La fórmula del quintil ordena a todos los clientes por esa columna (de menor a mayor con el 3er argumento en 1) y la convierte en una posición relativa de 1 a 5. Es la parte más fácil de equivocarse a mano: por eso esta herramienta la calcula por ti, sobre los mismos datos.</p>

            <h2 id="nombres-segmentos">Nombres y lectura de segmentos RFM</h2>
            <p>Esta página nombra cada combinación de R y F (el valor monetario queda como un dato del segmento, no como parte de su nombre) con una regla simple y editable:</p>
            <Tabla resumen="Nombre del segmento según la combinación de recencia (R) y frecuencia (F)" columnas={MATRIZ_NOMBRES[0]} filas={MATRIZ_NOMBRES.slice(1)} />
            <p>Puedes renombrar cualquiera de los 6 segmentos en el formulario (por ejemplo, cambiar «Campeones» por el nombre que uses en tu equipo): el cálculo no cambia, solo la etiqueta.</p>

            <h2 id="segmentos-chicos">Segmentos demasiado pequeños o inútiles: cómo evitarlos</h2>
            <p>Un segmento de 3 clientes rara vez justifica una campaña propia: el esfuerzo de diseñarla no se recupera. Por eso defines un «tamaño mínimo de segmento», y esta página avisa (sin fusionar nada por su cuenta) cuándo un segmento queda por debajo.</p>
            <ul>
              <li>Si un segmento RFM queda chico, prueba agrupar franjas vecinas (por ejemplo, unir R4 y R5) en vez de tratar cada combinación como un segmento aparte.</li>
              <li>Si una regla personalizada genera un segmento chico, revisa si sus condiciones son demasiado estrictas (un rango de gasto muy angosto, por ejemplo).</li>
              <li>Un segmento «Sin segmento» muy grande (en el método de reglas) es una señal de que te faltan reglas, no de que esos clientes no importen.</li>
            </ul>

            <h2 id="trato-distinto">Por qué cada segmento necesita un trato distinto</h2>
            <p>Tratar a todos los clientes igual desperdicia 2 oportunidades: ofrecerle un descuento a quien de todas formas iba a comprar (dinero perdido) y no hacer nada por quien está a punto de irse (cliente perdido). Un objetivo y una acción por segmento, con su propia métrica de éxito, evita ambos errores.</p>
            <Tabla
              resumen="Ejemplo de objetivo y riesgo típico por tipo de segmento"
              columnas={["Tipo de segmento", "Objetivo típico", "Riesgo si lo tratas igual que a los demás"]}
              primeraColumnaEnNegrita
              filas={[
                ["Campeones / alto valor", "Retener, no regalar descuentos", "Gastar presupuesto en quien ya iba a comprar"],
                ["En riesgo", "Reactivar antes de perderlo", "Esperar demasiado y que se vaya a la competencia"],
                ["Nuevos", "Convertir en recurrentes", "Pedirles lealtad antes de que prueben el producto"],
                ["Perdidos / bajo valor", "Decidir si vale la pena reactivar", "Invertir en una campaña cara para quien no va a volver"],
              ]}
            />

            <h2 id="ejemplo">Ejemplo práctico: 500 clientes ficticios de una tienda online</h2>
            <p>Tienda de bicicletas ficticia con sede en Lima, Perú, con {EJEMPLO_500.total} clientes y fecha de referencia 30 de junio, con precios en soles (S/). Esta tabla sale de simular {EJEMPLO_500.total} clientes con comportamientos típicos y calcularlos con el mismo motor que usa esta herramienta (no son clientes reales).</p>
            <Tabla
              resumen="Segmentos RFM de la tienda ficticia de 500 clientes: tamaño, % de la base y % de los ingresos"
              columnas={["Segmento", "Clientes", "% de la base", "% de los ingresos"]}
              primeraColumnaEnNegrita
              filas={[
                ["Campeones", `${EJEMPLO_500.campeones.cantidad}`, `${EJEMPLO_500.campeones.pctBase}%`, `${EJEMPLO_500.campeones.pctIngresos}%`],
                ["Clientes leales", `${EJEMPLO_500.leales.cantidad}`, `${EJEMPLO_500.leales.pctBase}%`, `${EJEMPLO_500.leales.pctIngresos}%`],
                ["En riesgo", `${EJEMPLO_500.enRiesgo.cantidad}`, `${EJEMPLO_500.enRiesgo.pctBase}%`, `${EJEMPLO_500.enRiesgo.pctIngresos}%`],
                ["Nuevos", `${EJEMPLO_500.nuevos.cantidad}`, `${EJEMPLO_500.nuevos.pctBase}%`, `${EJEMPLO_500.nuevos.pctIngresos}%`],
                ["Regulares", `${EJEMPLO_500.regulares.cantidad}`, `${EJEMPLO_500.regulares.pctBase}%`, `${EJEMPLO_500.regulares.pctIngresos}%`],
                ["Perdidos", `${EJEMPLO_500.perdidos.cantidad}`, `${EJEMPLO_500.perdidos.pctBase}%`, `${EJEMPLO_500.perdidos.pctIngresos}%`],
              ]}
            />
            <p>
              Con quintiles, «Campeones» no es un grupo diminuto de clientes perfectos: son los que caen en la franja alta de recencia Y frecuencia a la vez, aquí casi 1 de cada 4 clientes, pero igual concentran casi la mitad de los ingresos ({EJEMPLO_500.campeones.pctIngresos}%). «En riesgo» es más chico ({EJEMPLO_500.enRiesgo.cantidad} clientes) pero representa un {EJEMPLO_500.enRiesgo.pctIngresos}% de los ingresos: perder a ese grupo pesaría más de lo que su tamaño sugiere. Si quieres un «Campeones» más exclusivo, puedes ajustar tus propias reglas en vez de usar RFM.
            </p>

            <h2 id="privacidad">Privacidad y uso responsable de datos de clientes</h2>
            <ul>
              <li>
                Esta página lee tu archivo con la{" "}
                <a href="https://developer.mozilla.org/es/docs/Web/API/File_API" target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2">
                  File API del navegador
                </a>{" "}
                (MDN Web Docs, consultada el 30 de septiembre de 2026): nunca se sube a un servidor.
              </li>
              <li>El prompt nunca incluye un ID, nombre, correo ni ningún dato de un cliente individual: solo la ficha de columnas (sin ejemplos de la columna de ID) y la tabla ya calculada de segmentos.</li>
              <li>Si eliges adjuntar tu archivo original a la IA (modo A), considera quitar o anonimizar la columna de ID antes: esa parte la decides y la subes tú, no esta página.</li>
              <li>No uses esta herramienta con datos sensibles (salud, religión, orientación, afiliación política) ni le pidas a la IA que suponga edad, género o nivel de ingresos: el prompt se lo prohíbe explícitamente.</li>
              <li>Respeta la normativa de protección de datos personales de tu país antes de usar y conservar datos de clientes.</li>
            </ul>
          </article>

          <article className={PROSE}>
            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «segmente a mis clientes»:</p>
            <Tabla resumen="Bloques del prompt de segmentar clientes y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca ve un cliente individual: solo recibe el resumen agregado de cada segmento (tamaño, % de la base, % de los ingresos, medias). Eso hace imposible que invente un dato de una persona concreta, porque nunca tuvo esos datos.</p>

            <h2 id="checklist">Checklist antes de actuar sobre tus segmentos</h2>
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
                <strong>No sustituye a un analista de datos ni a un CRM.</strong> Calcula los segmentos correctamente, pero las decisiones de negocio siguen siendo tuyas.
              </li>
              <li>
                <strong>Los segmentos describen el pasado,</strong> no predicen el futuro: conviene recalcularlos cada cierto tiempo.
              </li>
              <li>
                <strong>Procesa hasta 50,000 filas</strong> en tu navegador; archivos más grandes se recortan, con aviso.
              </li>
              <li>
                <strong>No da asesoría legal</strong> sobre protección de datos personales. Si tienes dudas, <Link href="/contacto">escríbenos</Link> o consulta a un profesional.
              </li>
              <li>
                <strong>Tu archivo, siempre en tu navegador.</strong> Nunca se envía a este sitio; revisa el detalle en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíba: podría, por ejemplo, citar una cifra que no está en la tabla. Esta página lo detecta y te avisa.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El cálculo de RFM, las reglas personalizadas y el detector de cifras inventadas se prueban automáticamente con datos ficticios. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_SEGMENTAR_CLIENTES.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {q.a}
                  {q.q.includes("se envían a algún servidor o a la IA") && (
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
              <span>Todavía no publicadas, sin enlace activo: {pendientes.map((h) => h.titulo).join("; ")}.</span>
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
            <p className="mt-3 text-muted-foreground">RFM es una técnica de segmentación de uso general en marketing y análisis de datos, no propiedad de ninguna empresa: las reglas de nombrado de segmentos y los umbrales de esta guía son propios del sitio, verificados con pruebas automáticas, no cifras de una fuente externa. Sí se apoya en un estándar técnico real para leer tu archivo sin subirlo a ningún servidor:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Tu archivo se lee con la{" "}
                <a className="text-brand underline underline-offset-2" href="https://developer.mozilla.org/es/docs/Web/API/File_API" target="_blank" rel="noopener noreferrer">
                  File API del navegador
                </a>{" "}
                (documentada por MDN Web Docs, consultada el 30 de septiembre de 2026): un estándar web que permite leer un archivo local sin enviarlo a ningún servidor.
              </li>
              <li>El cálculo de quintiles (franjas 1 a 5) es un método estadístico estándar, calculado por esta página, no por la IA.</li>
              <li>Los 2 ejemplos de esta guía (la tienda de bicicletas y la librería) son ficticios y de elaboración propia; el ejemplo de 500 clientes también es una simulación propia, con todas sus cifras recalculadas por el mismo código que usa la herramienta.</li>
              <li>El lector de la respuesta y el detector de cifras inventadas se prueban automáticamente, incluyendo casos donde la IA cita un monto que no está en la tabla de segmentos.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
