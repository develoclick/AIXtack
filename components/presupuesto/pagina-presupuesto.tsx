import Link from "next/link";
import { ArrowRight, BarChart3, Clock, Download, ListTree, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { BarraReparto } from "./barra-reparto";
import { GeneradorPresupuesto } from "./generador-presupuesto";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { DATOS_PAREJA_CUSCO } from "@/content/ejemplos/presupuesto-viaje-datos";
import { calcular, formatoDinero, formatoEnteroLocal, formatoPorcentaje } from "@/lib/presupuesto/calculo";
import { GASTOS_OLVIDADOS } from "@/lib/presupuesto/olvidados";
import { CATEGORIAS_GASTO, UNIDADES } from "@/lib/presupuesto/tipos";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_PRESUPUESTO = [
  {
    q: "¿Cuánto debo reservar para imprevistos?",
    a: "Un 10–15 % del subtotal es una referencia habitual; más si gran parte de tu presupuesto es estimado y menos si casi todo tiene precio real. No es una norma: ajústalo a tu tolerancia al riesgo, a si viajas con niños y a lo bien que conoces el destino.",
  },
  {
    q: "¿Por qué no muestran precios del destino?",
    a: "Porque cambian constantemente y esta herramienta no está conectada a aerolíneas, hoteles ni servicios. Mostrar precios sería inventarlos. Tú consultas los que te interesan, los escribes con su fecha y la página los organiza, los suma y detecta lo que falta.",
  },
  {
    q: "¿Cómo calculo la comida por persona?",
    a: "Elige un gasto diario por persona, y la unidad «por persona y día» hace el resto: gasto diario × personas × días. Con 60 por persona y día, 2 personas y 6 días, son 720. Recuerda que 5 noches son 6 días si llegas el primero y sales el último.",
  },
  {
    q: "¿Incluyo las compras?",
    a: "Sí, pero como línea opcional con un tope que tú decidas. Así no se mezclan con los gastos necesarios y el escenario económico las deja fuera automáticamente.",
  },
  {
    q: "¿Puedo usarla para viajes internacionales?",
    a: "Sí. Elige la moneda de tu presupuesto, agrega una moneda alterna (por ejemplo USD) y escribe el tipo de cambio que te dé tu banco o casa de cambio. La página no consulta ningún tipo de cambio: usa el que tú escribes.",
  },
  {
    q: "¿Qué diferencia hay entre un gasto conocido y uno estimado?",
    a: "Conocido es un precio real que viste en su fuente, con fecha. Estimado es un cálculo tuyo todavía sin precio real. Separarlos muestra qué parte de tu total está respaldada por precios reales y cuánto conviene reservar de margen.",
  },
  {
    q: "¿La IA calcula el total?",
    a: "No. Los totales, los porcentajes y los escenarios los calcula esta página en tu navegador y se los entrega a la IA ya hechos. La IA revisa la coherencia, señala lo que falta y propone ideas; le pedimos que no recalcule ni invente precios, y la página marca los montos que no vengan de tus datos.",
  },
  {
    q: "¿Puedo pasar el presupuesto a Excel o imprimirlo?",
    a: "Sí. «Descargar CSV» genera un archivo que abren Excel y Google Sheets, «Copiar como tabla» se pega directo en una hoja de cálculo e «Imprimir o guardar en PDF» prepara una versión para papel, sin botones ni anuncios.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario se guarda solo en tu navegador y los cálculos, la revisión de coherencia y las exportaciones se hacen en tu equipo. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas: desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Planificador de viajes especializado en presupuestos, con criterio prudente y sin acceso a precios en tiempo real. Un rol concreto evita respuestas genéricas."],
  ["Objetivo", "Revisar tu presupuesto: coherencia, gastos que faltan, necesidades frente a extras, cinco ideas de ahorro, margen de imprevistos y tareas antes de reservar."],
  ["Fuente", "Tu tabla de gastos, los totales y los escenarios que calculó esta página, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Destino, fechas, duración, viajeros, moneda, tipo de cambio y margen elegido. Lo que dejas vacío aparece como «(no indicado)»."],
  ["Reglas de contenido", "No inventar precios, tasas ni requisitos; no recalcular totales; proponer gastos que faltan sin precio, indicando dónde consultarlos; marcar [ESTIMACIÓN], [SUPUESTO] o [HIPÓTESIS]."],
  ["Reglas de formato", "Viñetas y campos separados por «|» en «Gastos que faltan» para poder añadirlos a tu tabla; exactamente cinco ideas de ahorro; un veredicto claro sobre el margen."],
  ["Formato de salida", "Ocho títulos exactos y en orden. Gracias a ellos la página separa la respuesta en paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: nada inventado, títulos exactos, totales iguales a los de la página, cinco ideas y lo dudoso señalado."],
];

const REVISION = [
  "Cada gasto tiene la unidad correcta (comidas por persona y día, hotel por noche, pasajes por persona).",
  "Las noches y los días coinciden con tus fechas: 5 noches son 6 días.",
  "Cada gasto «conocido» tiene fuente y fecha de consulta, y el precio sigue vigente.",
  "Lo que solo calculaste está marcado como «estimado», no como «conocido».",
  "Añadiste, o descartaste a propósito, los gastos que sugirió el detector de olvidados.",
  "Leíste las condiciones de cancelación y de equipaje de cada reserva.",
  "Comprobaste visados, tasas y requisitos de entrada en fuentes oficiales del destino.",
  "Tu margen de imprevistos es coherente con la parte estimada del presupuesto.",
  "Sabes qué tipo de cambio usaste y cuándo lo actualizaste.",
  "Exportaste o guardaste el presupuesto y anotaste qué falta confirmar antes de pagar.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#siete-pasos", "Presupuesto de viaje en 7 pasos"],
  ["#categorias", "Las categorías, una por una"],
  ["#tipos-de-gasto", "Conocidos, estimados y opcionales"],
  ["#olvidados", "Los 15 gastos que casi todos olvidan"],
  ["#fijos-variables", "Gastos fijos vs variables"],
  ["#imprevistos", "Cuánto reservar para imprevistos"],
  ["#ejemplo", "Ejemplo numérico completo"],
  ["#ahorro", "Cómo reducir costos"],
  ["#extranjero", "Pagar en el extranjero"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#revision", "Lista de revisión"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

const IDEAS_DE_AHORRO = [
  ["Comparar fechas y días de la semana, si eres flexible", "Transporte principal y alojamiento", "Menos libertad para elegir cuándo viajas", "Compara con las mismas condiciones (equipaje, cambios, cancelación)."],
  ["Elegir un alojamiento con desayuno o con cocina", "Alojamiento y comidas", "Puede cambiar la ubicación o las comodidades", "Comprueba qué incluye realmente antes de reservar."],
  ["Hacer una comida principal al día y otra más sencilla", "Comidas", "Cambia el ritmo de las comidas, no el destino", "No recortes por debajo de lo que necesitas."],
  ["Priorizar dos o tres actividades de pago y completar con opciones gratuitas", "Actividades y entradas", "Se visitan menos lugares de pago", "Consulta en la página oficial de cada lugar sus precios y sus días de cierre."],
  ["Caminar los tramos cortos y usar transporte público", "Transporte local", "Requiere más tiempo", "Ten en cuenta la seguridad y los horarios nocturnos."],
  ["Comparar el traslado del aeropuerto antes de llegar", "Traslados", "Hay que coordinarlo con anticipación", "No aceptes servicios sin una tarifa clara."],
  ["Fijar un tope para compras y recuerdos", "Compras y recuerdos", "Menos souvenirs", "Márcalo como opcional para verlo separado."],
  ["Usar una tarjeta sin comisión en el extranjero, si tu banco la ofrece, y retirar efectivo pocas veces", "Comisiones bancarias y de cambio", "Ninguno, si las condiciones de tu banco lo permiten", "Consulta el tarifario de tu banco antes de viajar."],
];

const s = (n: number) => `S/ ${formatoEnteroLocal(n)}`;

export function PaginaPresupuesto({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: los números salen del mismo cálculo que usa la herramienta, así que nunca se desalinean.
  const ej = DATOS_PAREJA_CUSCO;
  const c = calcular(ej);
  const i = c.escenarios.intermedio;
  const fijosPct = (c.fijos / i.subtotal) * 100;
  const estimadoSobreSubtotal = (c.reparto.estimado / i.subtotal) * 100;
  const conMargen15 = Math.round(i.subtotal * 0.15 * 100) / 100;
  const total15 = i.subtotal + conMargen15;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Presupuesto de viaje" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Un presupuesto de viaje fiable separa lo que ya sabes de lo que estimas. Escribe tus gastos por categoría, marca cuáles tienen precio real y la página calcula el total, el costo por persona, el margen para imprevistos y tres escenarios, con los precios que tú encuentres.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Wallet, "Gratis, sin registro"],
              [BarChart3, "Tres escenarios y gráfico"],
              [Download, "Exporta a CSV o imprime"],
              [Lock, "Tus datos se quedan en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof Wallet;
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
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Calculadora de presupuesto de viaje">
          <GeneradorPresupuesto />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Dos personas, cinco noches en Cusco: {formatoDinero(i.total, "S/")} en total
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Un subtotal de {s(i.subtotal)} más {formatoPorcentaje(c.pctImprevistos)} de imprevistos ({s(i.imprevistos)}) da {formatoDinero(i.total, "S/")}, es decir, {formatoDinero(i.porPersona!, "S/")} por persona. Cerca del 29 % del total es estimado (comidas, traslados y transporte local): conviene confirmarlo antes de reservar. Las cifras son ilustrativas, no precios reales.{" "}
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
            <p>
              Un presupuesto de viaje es la suma de todo lo que esperas gastar, ordenada por categorías y con una etiqueta que dice qué tan seguro es cada monto. La herramienta te ayuda a construirlo sin errores de multiplicación y a detectar lo que falta antes de reservar.
            </p>
            <ol>
              <li>
                <strong>Escribes los datos base y un gasto por línea.</strong> Cada línea lleva su unidad (por viaje, por noche, por persona o por persona y día) y su tipo: conocido, estimado u opcional.
              </li>
              <li>
                <strong>La página calcula en tu navegador</strong> el total, el costo por persona, los gastos fijos y variables, la parte respaldada por precios reales y tres escenarios. También sugiere gastos que quizá olvidaste y revisa las unidades mal aplicadas.
              </li>
              <li>
                <strong>Si quieres una segunda opinión, copias el prompt</strong> y lo pegas en tu IA. Le das tu tabla y los totales ya calculados; ella revisa, señala huecos y propone ahorros sin inventar precios. Al pegar su respuesta, puedes añadir a tu tabla los gastos que faltan.
              </li>
            </ol>
            <p>
              Los precios los pones tú. La herramienta no consulta aerolíneas ni hoteles: esos precios cambian a diario y una calculadora sin conexión a ellos solo podría inventarlos. Si estás empezando a planificar, en la categoría <Link href={`/${categoria.slug}`}>{categoria.nombre}</Link> hay una guía breve para no llegar a la reserva con sorpresas.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="siete-pasos">Cómo construir un presupuesto de viaje desde cero en 7 pasos</h2>
            <ol>
              <li>
                <strong>Fija lo que no cambia:</strong> destino, noches (o fechas) y cuántas personas viajan. De ahí salen todas las multiplicaciones.
              </li>
              <li>
                <strong>Elige tu moneda de trabajo.</strong> Si algunos precios están en otra moneda, anota cuál es y el tipo de cambio que vas a usar.
              </li>
              <li>
                <strong>Escribe una línea por gasto,</strong> no un total suelto: «alojamiento» y «comidas» por separado te dejan ver de dónde sale el dinero.
              </li>
              <li>
                <strong>Elige la unidad de cada línea</strong> con la tabla de abajo. Es el paso donde más se falla.
              </li>
              <li>
                <strong>Marca cada línea como conocida, estimada u opcional</strong> y anota la fuente y la fecha de los precios reales.
              </li>
              <li>
                <strong>Suma un margen de imprevistos</strong> proporcional a cuánto de tu presupuesto es solo estimación.
              </li>
              <li>
                <strong>Compara escenarios</strong> (económico, intermedio y holgado) y decide qué confirmar o ajustar antes de reservar.
              </li>
            </ol>
            <Tabla
              resumen="Qué unidad elegir para cada tipo de gasto, por cuánto se multiplica y el error más frecuente"
              columnas={["Unidad", "Se multiplica por", "Úsala para", "Error frecuente"]}
              primeraColumnaEnNegrita
              filas={[
                ["Por viaje", "1", "Traslados, propinas, compras con tope, el total de una cotización", "Poner aquí las comidas, que dependen de cuántas personas y días son."],
                ["Por noche", "Las noches", "La habitación del alojamiento", "Usar el precio por persona cuando la habitación ya es para todos."],
                ["Por persona", "Los viajeros", "Pasajes, entradas, seguro, equipaje", "Olvidar contar a los niños o a quien viaja contigo."],
                ["Por persona y día", "Viajeros × días", "Comidas y transporte local", "Contar noches en lugar de días: 5 noches son 6 días."],
              ]}
            />

            <h2 id="categorias">Las categorías de gasto, una por una</h2>
            <p>
              Ordenar por categorías sirve para no olvidar nada y para comparar con otros viajes. La herramienta trae catorce; el margen de imprevistos no es una categoría: se calcula como porcentaje del subtotal. Cada categoría propone la unidad con la que suele calcularse, que puedes cambiar.
            </p>
            <Tabla
              resumen="Las catorce categorías de gasto de la herramienta, qué incluyen, su unidad habitual y si son fijas o variables"
              columnas={["Categoría", "Qué incluye", "Unidad habitual", "Tipo de gasto"]}
              primeraColumnaEnNegrita
              filas={CATEGORIAS_GASTO.map((cat) => [cat.nombre, cat.incluye, UNIDADES.find((u) => u.valor === cat.unidad)!.etiqueta, cat.naturaleza === "fijo" ? "Fijo" : "Variable"])}
            />

            <h2 id="tipos-de-gasto">Gastos conocidos, estimados y opcionales: por qué separarlos</h2>
            <p>
              Separar los tipos evita el error más común: tratar una estimación como si fuera un precio. Un vuelo que ya cotizaste y unas comidas que «calculas en unos S/ 60 al día» no tienen la misma certeza, y el presupuesto debe mostrarlo.
            </p>
            <Tabla
              resumen="Los tres tipos de gasto: qué significan, un ejemplo ficticio y qué hacer con cada uno"
              columnas={["Tipo", "Qué significa", "Ejemplo (ficticio)", "Qué hacer"]}
              primeraColumnaEnNegrita
              filas={[
                ["Conocido", "Precio real que encontraste en su fuente, con fecha.", "Vuelos cotizados por S/ 900", "Anota la fuente y la fecha, y vuelve a comprobarlo antes de pagar."],
                ["Estimado", "Cálculo tuyo, todavía sin precio real.", "Comidas: S/ 60 por persona y día", "Conviértelo en conocido cuando puedas; mientras tanto, cubre el riesgo con margen."],
                ["Opcional", "Extra que podrías no hacer.", "Compras y recuerdos, con tope", "Ponle un tope; el escenario económico lo deja fuera."],
              ]}
            />
            <p>
              La barra «conocido vs estimado» resume esta diferencia: qué parte del total, con imprevistos incluidos, está respaldada por precios reales. No hay un porcentaje «correcto»; lo razonable es que suba a medida que te acercas a reservar. Cuando la parte estimada es grande, conviene un margen mayor (lo vemos más abajo).
            </p>

            <h2 id="olvidados">Los 15 gastos que casi todos olvidan</h2>
            <p>
              Casi todos los presupuestos fallan por lo mismo: faltan líneas, no sobran. Esta es la lista que usa el detector de la herramienta. No damos precios porque cambian; te decimos dónde consultarlos, y si algo no aplica a tu viaje, márcalo como «No aplica».
            </p>
            <Tabla
              resumen="Quince gastos que suelen olvidarse, por qué se olvidan y dónde consultar su precio"
              columnas={["Gasto", "Por qué se olvida", "Dónde consultar el precio"]}
              primeraColumnaEnNegrita
              filas={GASTOS_OLVIDADOS.map((g) => [g.concepto, g.porQue, g.dondeConsultar])}
            />

            <Anuncio posicion="medio" />

            <h2 id="fijos-variables">Gastos fijos vs variables en un viaje</h2>
            <p>
              Un gasto <strong>fijo</strong> queda decidido cuando reservas; uno <strong>variable</strong> depende de lo que decidas cada día. Distinguirlos te dice dónde puedes ahorrar antes de salir y dónde tendrás que controlarte durante el viaje.
            </p>
            <Tabla
              resumen="Diferencias entre gastos fijos y variables en un viaje"
              columnas={["Aspecto", "Fijos", "Variables"]}
              primeraColumnaEnNegrita
              filas={[
                ["Cuándo se deciden", "Al reservar.", "Durante el viaje, día a día."],
                ["Cómo bajarlos", "Comparando antes de reservar.", "Con un tope diario."],
                ["Riesgo típico", "Olvidar cargos extra de la reserva.", "Subestimar el gasto diario."],
                ["Categorías", CATEGORIAS_GASTO.filter((x) => x.naturaleza === "fijo").map((x) => x.nombre).join(", "), CATEGORIAS_GASTO.filter((x) => x.naturaleza === "variable").map((x) => x.nombre).join(", ")],
              ]}
            />
            <p>
              En el ejemplo de más abajo, {s(c.fijos)} son fijos ({formatoPorcentaje(fijosPct)} del subtotal) y {s(c.variables)} variables ({formatoPorcentaje(100 - fijosPct)}). Lo fijo se asegura reservando (leyendo antes las condiciones de cancelación); lo variable se cuida con un tope por persona y día.
            </p>

            <h2 id="imprevistos">Cuánto reservar para imprevistos y cómo calcularlo</h2>
            <p>
              El margen de imprevistos es un porcentaje que se suma al subtotal para cubrir lo que no previste: un taxi extra, un cambio de reserva, un precio que subió entre que lo estimaste y lo pagaste. No es dinero para más compras: si lo gastas en eso, deja de ser un colchón.
            </p>
            <ul>
              <li>
                <strong>Imprevistos</strong> = subtotal × porcentaje ÷ 100.
              </li>
              <li>
                <strong>Total</strong> = subtotal + imprevistos.
              </li>
            </ul>
            <p>
              La herramienta propone 10 %. Como guía, cuanto mayor sea la parte estimada, más margen conviene:
            </p>
            <Tabla
              resumen="Regla práctica del margen de imprevistos según la parte estimada del subtotal"
              columnas={["Parte estimada del subtotal", "Margen de referencia", "Por qué"]}
              primeraColumnaEnNegrita
              filas={[
                ["Hasta 25 %", "Alrededor de 10 %", "Casi todo tiene precio real: queda poco por descubrir."],
                ["Entre 25 % y 50 %", "10–15 %", "Una parte importante puede cambiar al confirmarla."],
                ["Más de 50 %", "15 % o más", "La mayor parte del presupuesto es una suposición."],
              ]}
            />
            <p>
              Es una regla práctica de esta página, no un estándar ni una estadística. Ajústala a tu tolerancia al riesgo y a factores como viajar con niños, con horarios justos o a un lugar que no conoces. En el ejemplo, los gastos estimados son el {formatoPorcentaje(estimadoSobreSubtotal)} del subtotal: la referencia es 10–15 % y el 10 % elegido está en el mínimo. Con 15 %, los imprevistos serían {formatoDinero(conMargen15, "S/")}, el total {formatoDinero(total15, "S/")} y {formatoDinero(total15 / 2, "S/")} por persona.
            </p>

            <h2 id="ejemplo">Ejemplo numérico completo explicado línea por línea</h2>
            <p>
              <strong>Ejemplo ilustrativo (ficticio).</strong> Dos adultos viajan de Lima a Cusco durante 5 noches (6 días). Las cifras no son precios reales: sirven para mostrar el cálculo. Puedes cargarlo con «Llenar con datos de ejemplo».
            </p>
            <h3>1. Lo que escribe la pareja</h3>
            <Tabla
              resumen="Los seis gastos del ejemplo con su unidad, su tipo, el cálculo y el total de cada uno"
              columnas={["Gasto", "Unidad", "Tipo", "Cálculo", "Total"]}
              primeraColumnaEnNegrita
              filas={ej.lineas.map((l, k) => {
                const cl = c.lineas[k];
                const unidad = UNIDADES.find((u) => u.valor === l.unidad)!.corta;
                const tipo = l.tipo === "conocido" ? "Conocido" : l.tipo === "estimado" ? "Estimado" : "Opcional";
                const calculo = `${formatoEnteroLocal(Number(l.monto))} × ${l.unidad === "viaje" ? "1" : l.unidad === "noche" ? `${c.noches} noches` : `${c.personas} personas × ${c.dias} días`}`;
                return [l.concepto, unidad, tipo, calculo, s(cl.total!)];
              })}
            />
            <h3>2. Lo que calcula la página</h3>
            <Tabla
              resumen="Subtotal, imprevistos, total y costo por persona del ejemplo, con su fórmula"
              columnas={["Concepto", "Fórmula", "Resultado"]}
              primeraColumnaEnNegrita
              filas={[
                ["Subtotal", c.lineas.map((l) => formatoEnteroLocal(l.total!)).join(" + "), s(i.subtotal)],
                ["Imprevistos", `${formatoEnteroLocal(i.subtotal)} × ${c.pctImprevistos} ÷ 100`, s(i.imprevistos)],
                ["Total", `${formatoEnteroLocal(i.subtotal)} + ${formatoEnteroLocal(i.imprevistos)}`, s(i.total)],
                ["Por persona", `${formatoEnteroLocal(i.total)} ÷ ${c.personas}`, formatoDinero(i.porPersona!, "S/")],
              ]}
            />
            <p>
              De ese total, {s(c.reparto.conocido)} son conocidos ({formatoPorcentaje(c.porcentajes.conocido)}), {s(c.reparto.estimado)} estimados ({formatoPorcentaje(c.porcentajes.estimado)}, cerca del 29 %) y {s(c.reparto.imprevistos)} son el margen ({formatoPorcentaje(c.porcentajes.imprevistos)}):
            </p>
            <div className="not-prose my-4 rounded-xl border bg-surface p-4">
              <BarraReparto porcentajes={c.porcentajes} />
            </div>
            <Tabla
              resumen="Los tres escenarios del ejemplo con su total y su costo por persona"
              columnas={["Escenario", "Qué usa", "Total", "Por persona"]}
              primeraColumnaEnNegrita
              filas={[
                ["Económico", "Mínimos ficticios y sin opcionales", s(c.escenarios.economico.total), formatoDinero(c.escenarios.economico.porPersona!, "S/")],
                ["Intermedio", "Los montos escritos", s(i.total), formatoDinero(i.porPersona!, "S/")],
                ["Holgado", "Máximos ficticios", s(c.escenarios.holgado.total), formatoDinero(c.escenarios.holgado.porPersona!, "S/")],
              ]}
            />
            <h3>3. Lo que revisa la IA (resumen)</h3>
            <ul>
              <li>Las comidas están bien calculadas por persona y día; los vuelos y las entradas «por viaje» conviene confirmarlos como totales de las dos personas.</li>
              <li>Faltan seguro, equipaje, propinas, conectividad y comisiones bancarias, cada uno con su «dónde consultarlo» y sin precio.</li>
              <li>Vuelos, alojamiento y comidas son necesidades; parte de las entradas y las compras son extras.</li>
              <li>Cinco ideas de ahorro, cada una con la categoría que afecta, y un margen «razonable» pero en el mínimo.</li>
            </ul>
            <h3>4. Cómo lo lee la página y qué decide la pareja</h3>
            <p>
              La página separa la respuesta en paneles, ofrece «Añadir a mi tabla» en cada gasto que falta y comprueba que la IA no haya escrito montos que no salgan de los datos. La pareja añade las líneas de seguro y equipaje, confirma con precios reales los tres gastos estimados y vuelve a calcular. Si no logra confirmarlos, sube el margen.
            </p>

            <h2 id="ahorro">Cómo reducir costos sin arruinar el viaje</h2>
            <p>
              Ahorrar bien es recortar donde menos se nota. Cada idea afecta una categoría concreta; así sabes cuánto puedes ajustar en la tabla y qué renuncias.
            </p>
            <Tabla resumen="Ideas para reducir costos, la categoría que afecta, qué cambia y qué cuidar" columnas={["Idea", "Categoría que afecta", "Qué cambia", "Cuidado"]} primeraColumnaEnNegrita filas={IDEAS_DE_AHORRO} />
            <p>
              Lo que conviene no recortar: el seguro de viaje, el margen de imprevistos y los traslados en horarios o lugares poco seguros. Ahorrar en eso no reduce el gasto; lo traslada a un momento peor.
            </p>

            <h2 id="extranjero">Pagar en el extranjero: comisiones y tipo de cambio</h2>
            <p>
              Fuera de tu país aparecen costos que no están en el precio de los servicios: la conversión de moneda, las comisiones de tu banco o tu tarjeta y, a veces, el cobro en una moneda distinta a la del comercio.
            </p>
            <Tabla
              resumen="Situaciones de pago en el extranjero, qué puede costar y cómo reflejarlo en el presupuesto"
              columnas={["Situación", "Qué puede costarte", "Cómo reflejarlo"]}
              primeraColumnaEnNegrita
              filas={[
                ["Pagar con tarjeta en moneda extranjera", "Una comisión o un diferencial que fija tu banco.", "Línea «Comisiones bancarias y de cambio», por viaje y estimada."],
                ["Retirar en cajeros", "La comisión de tu banco y, a veces, la del cajero.", "La misma línea; piensa cuántas veces retirarás."],
                ["Cambiar efectivo", "La diferencia entre el tipo de compra y el de venta.", "Usa el tipo de cambio que te ofrecen, no el de un buscador."],
                ["Que el comercio cobre en tu moneda", "Un tipo de cambio propio del comercio.", "Pregunta el importe final antes de aceptar y compáralo con lo que cobraría tu banco."],
              ]}
            />
            <p>
              En la herramienta escribes la moneda alterna (por ejemplo USD) y cuántos soles equivalen a 1 USD; las líneas marcadas en esa moneda se convierten con ese valor. Con un ejemplo ficticio: un vuelo de USD 310 con un tipo de cambio de S/ 3.75 son S/ 1,162.50 (310 × 3.75). La página no consulta ningún tipo de cambio: lo escribes tú y conviene actualizarlo el día en que pagues. Como el tipo de cambio varía, un margen algo mayor cubre la diferencia entre hoy y ese día. Para comparar las comisiones de tu banco, el Portal del Usuario de la SBS tiene una sección «Compara comisiones» (ver fuentes).
            </p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo típico de pedirle a una IA que «revise un presupuesto»:</p>
            <Tabla resumen="Bloques del prompt de presupuesto de viaje y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>
              La decisión más importante es que la IA no suma: recibe los totales que ya calculó esta página. Un asistente de chat puede equivocarse al multiplicar, y una revisión con números mal calculados es peor que no tenerla.
            </p>

            <h2 id="revision">Lista de revisión antes de reservar</h2>
            <ul className="not-prose my-4 space-y-2">
              {REVISION.map((x) => (
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
                <strong>No conocemos los precios.</strong> La herramienta calcula con lo que tú escribes; un presupuesto es una estimación y no garantiza lo que costará el viaje.
              </li>
              <li>
                <strong>Verifica los requisitos.</strong> Visados, tasas, vacunas y normas de entrada dependen de tu nacionalidad y del destino: consúltalos solo en fuentes oficiales.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe. Por eso la página calcula los totales y marca cualquier monto que no venga de tus datos.
              </li>
              <li>
                <strong>No es asesoría</strong> financiera, fiscal, legal ni de una agencia de viajes. Es una ayuda para ordenar tus decisiones.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> Los cálculos, el lector de la respuesta, el detector de gastos olvidados y las exportaciones se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link> y cómo tratamos tus datos en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_PRESUPUESTO.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {q.a}
                  {q.q.includes("Mis datos") && (
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
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://www.sbs.gob.pe/usuarios/informate-y-compara/compara-productos-financieros/compara-comisiones" target="_blank" rel="noopener noreferrer">
                  Portal del Usuario de la SBS: «Compara comisiones»
                </a>{" "}
                (Superintendencia de Banca, Seguros y AFP del Perú). Enlace localizado el 26 de septiembre de 2026; es solo una referencia para comparar las comisiones de tu banco y no respalda ninguna cifra de esta página.
              </li>
              <li>Los requisitos de entrada, tasas y vacunas de cada destino se consultan solo en las páginas oficiales de migraciones, consulados o autoridades de salud; esta página no los afirma.</li>
              <li>La escala del margen de imprevistos es un criterio propio de esta herramienta, no un estándar ni una estadística.</li>
              <li>Todos los ejemplos (viajeros, destinos, precios, fuentes y tipos de cambio) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
