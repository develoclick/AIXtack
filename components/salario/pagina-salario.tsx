import Link from "next/link";
import { ArrowRight, Calculator, Clock, Download, ListTree, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorSalario } from "./generador-salario";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_SALARIO } from "@/content/ejemplos/salario";
import { formatoDinero, formatoMonto } from "@/lib/presupuesto/calculo";
import { calcularOferta, contextoDe, evaluarCifras } from "@/lib/salario/calculo";
import { leerRespuestaSalario } from "@/lib/salario/lector";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_SALARIO = [
  {
    q: "¿Debo decir primero una cifra?",
    a: "Si te la piden, da un rango apoyado en las referencias que tú encontraste, no un número suelto. También puedes preguntar antes cuál es el rango previsto para el puesto. Si te presionan y no tienes referencias, es razonable pedir un momento para investigar en lugar de improvisar.",
  },
  {
    q: "¿Tengo que decir cuánto gano ahora?",
    a: "No es obligatorio. Puedes redirigir la conversación hacia tu expectativa para el nuevo rol y las responsabilidades del puesto. Lo que no debes hacer es decir una cifra falsa: si la dices, que sea verdadera.",
  },
  {
    q: "¿Cuánto se puede negociar?",
    a: "Depende de la empresa, del puesto y del momento; no hay un porcentaje universal y esta página no lo inventa. Lo que sí puedes hacer es medir el efecto anual de cada cifra que pides, con el cálculo de la herramienta, y negociar también lo que no es salario fijo.",
  },
  {
    q: "¿Por qué no me dan un salario de mercado?",
    a: "Porque no inventamos cifras y esta herramienta no tiene datos de mercado. Te mostramos cómo buscar referencias con fuente y fecha, y las usas tú. Un número de mercado sin fuente, sea de una IA o de un sitio, puede llevarte a pedir de más o de menos.",
  },
  {
    q: "¿Pueden retirar la oferta por negociar?",
    a: "Es poco habitual cuando negocias con respeto y con argumentos, pero es un riesgo que debes valorar según la empresa y tu situación. Por eso conviene tener claro tu mínimo aceptable, y no presionar con ultimátums ni con ofertas que no existen.",
  },
  {
    q: "¿La herramienta calcula mi sueldo neto?",
    a: "No. El neto depende de los impuestos y aportes de tu país y de tu régimen laboral. Si escribes un porcentaje de descuentos estimado, la página muestra un neto aproximado del fijo con tu propio porcentaje, sin verificar y sin calcular impuestos. Para el cálculo real, consulta las fuentes oficiales de tu país.",
  },
  {
    q: "¿Cómo se calcula el valor anual de una oferta?",
    a: "Es el salario fijo mensual por los pagos al año, más el variable (en un escenario conservador y en uno completo), más los beneficios que tú valorices, menos el costo de trabajar presencial. Cada componente muestra su fórmula, y el resultado es bruto: no descuenta impuestos ni aportes.",
  },
  {
    q: "¿Puedo comparar dos ofertas?",
    a: "Sí. Activa «Comparar con una segunda oferta» y registra las dos: la página muestra el valor anual de cada una, una tabla de diferencias (quién conviene en cada fila) y sus condiciones no monetarias, para decidir también según tus prioridades.",
  },
  {
    q: "¿La IA puede inventar cifras?",
    a: "Puede, aunque el prompt se lo prohíbe. Por eso la página marca cualquier monto de la respuesta que no venga de tus datos o de sus cálculos, avisa si afirma datos de mercado o menciona otra oferta, y comprueba que las respuestas preparadas no revelen tu mínimo aceptable.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario, incluido tu salario y tus cifras, se guarda solo en tu navegador, y los cálculos se hacen en tu equipo. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas: desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Asesor de carrera especializado en negociación salarial, con criterio prudente y sin acceso a datos de mercado."],
  ["Objetivo", "Evaluar la oferta y preparar la conversación: revisión, preguntas, coherencia de tus cifras, argumentos, respuestas y una checklist."],
  ["Fuente", "La oferta, los cálculos de la página, tu situación actual y tus referencias, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Puesto, lugar, modalidad, experiencia, competencias comprobables, tus tres cifras con su distancia a la oferta y tus prioridades ordenadas."],
  ["Reglas de contenido", "No inventar estadísticas ni rangos de mercado, no recalcular, no dar asesoría legal ni tributaria, argumentos solo con tu experiencia, no mentir y no revelar tu mínimo."],
  ["Reglas de formato", "Cinco argumentos con su cita, cuatro respuestas con un formato fijo (para convertirlas en tarjetas copiables) y al menos seis preguntas."],
  ["Formato de salida", "Nueve títulos exactos y en orden, para que la página separe la respuesta en paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: nada de cifras de mercado, títulos exactos, cinco argumentos, cuatro respuestas y nada que revele tu mínimo o proponga mentir."],
];

const REVISION = [
  "Verificaste con tu contrato, tu recibo o tu empleador cuáles son los pagos al año y cómo se llaman.",
  "Entiendes qué parte de la oferta es fija y qué parte está condicionada.",
  "Le pusiste precio solo a los beneficios que usarías de verdad.",
  "Calculaste el valor anual en dos escenarios y descontaste el costo de trabajar presencial.",
  "Tus tres cifras cumplen mínimo ≤ objetivo ≤ ancla y se apoyan en referencias con fuente y fecha.",
  "Buscaste el efecto anual de cada cifra que vas a pedir.",
  "Cada argumento se apoya en algo que hiciste y puedes demostrar.",
  "Ninguna respuesta revela tu mínimo aceptable ni contiene algo falso.",
  "Verificaste los impuestos y aportes que afectan tu neto en fuentes oficiales.",
  "Tienes claro qué harás si la respuesta es «no hay margen» (alternativas no salariales o decir que no).",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#bruto-neto", "Salario bruto vs neto"],
  ["#variable", "Fijo, variable y bonos"],
  ["#beneficios", "Beneficios: ponerles precio"],
  ["#valor-anual", "Valor anual real"],
  ["#tres-cifras", "Tus 3 cifras"],
  ["#referencias", "Referencias salariales"],
  ["#preguntas-reclutador", "Qué preguntar al reclutador"],
  ["#expectativa", "Responder la expectativa salarial"],
  ["#sin-mentir", "Negociar sin mentir"],
  ["#ejemplo", "Ejemplo completo"],
  ["#errores", "Errores y checklist"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#revision", "Lista de revisión"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaSalario({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo cálculo que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_SALARIO[0];
  const c = calcularOferta(ej.datos.ofertaA, contextoDe(ej.datos));
  const ev = evaluarCifras(ej.datos, c);
  const lectura = leerRespuestaSalario(ej.respuesta);
  const m = formatoMonto;
  const s = (n: number) => formatoDinero(n, "S/");
  const impacto = (v: number) => (v - 4000) * 14;
  const [vMin, vObj, vAnc] = ev.vsOferta;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Evaluar oferta y negociar salario" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Para negociar tu salario primero hay que saber cuánto vale de verdad la oferta. Registra el salario fijo, el variable y los beneficios: la página calcula el valor anual con sus fórmulas a la vista, te ayuda a definir tus tres cifras con las referencias que tú aportes y la IA prepara argumentos y respuestas sin inventar ninguna cifra de mercado.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Wallet, "Gratis, sin registro"],
              [Calculator, "Valor anual con fórmulas"],
              [Download, "Exporta a CSV"],
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Tema de dinero y trabajo: es una ayuda para preparar tu conversación, no asesoría laboral, legal ni tributaria. Esta guía no fue revisada por un especialista en compensaciones ni en derecho laboral.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Evaluador de ofertas y preparador de negociación">
          <GeneradorSalario />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Una oferta de {s(c.fijoMensual!)} × {c.pagos} pagos vale {s(c.conservador!.bruto)}… o {s(c.completo!.bruto)}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En una oferta ficticia para «Analista de Operaciones», el bono de hasta un sueldo depende de metas que la oferta no define: el valor anual es {s(c.conservador!.bruto)} en el escenario conservador y {s(c.completo!.bruto)} en el completo. Trabajar 3 días a la semana en la oficina cuesta {s(c.costo!)} al año, así que el valor después de costos es {s(c.conservador!.despuesDeCostos)} o {s(c.completo!.despuesDeCostos)}. Las cifras son ilustrativas, no datos de mercado.{" "}
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
              Para saber cómo negociar tu salario hay que partir de un número real: cuánto vale la propuesta completa, no solo el sueldo mensual. La herramienta te lleva de la oferta a la conversación en tres pasos.
            </p>
            <ol>
              <li>
                <strong>Registras la oferta:</strong> salario fijo bruto, pagos al año, variable, beneficios, contrato, jornada y días presenciales. La página calcula el valor anual, con fórmula por componente, y el costo de ir a trabajar. Si tienes dos ofertas, las compara lado a lado.
              </li>
              <li>
                <strong>Defines tus tres cifras</strong> (mínimo, objetivo y ancla) y las contrastas con las referencias salariales que tú aportas, con su fuente y su fecha. Luego copias el prompt y lo pegas en ChatGPT, Gemini, Claude u otro asistente.
              </li>
              <li>
                <strong>Pegas la respuesta.</strong> La página la separa en paneles, convierte las respuestas preparadas en tarjetas que puedes copiar y marca cualquier cifra que no venga de tus datos.
              </li>
            </ol>
            <p>
              Una regla que atraviesa toda la herramienta: <strong>no hay cifras de mercado.</strong> Ni esta página ni la IA saben lo que paga un puesto; lo único que compara son las referencias que tú encontraste.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="bruto-neto">Salario bruto vs neto: por qué la oferta casi siempre está en bruto</h2>
            <p>
              El salario <strong>bruto</strong> es el monto antes de descuentos; el <strong>neto</strong> es lo que llega a tu cuenta. Las ofertas suelen expresarse en bruto, así que comparar ofertas o decidir si te alcanza requiere entender qué se descuenta. Las reglas varían por país. Como ejemplo, en Perú se descuentan aportes al sistema de pensiones (ONP o AFP) y, según el nivel de ingresos, el empleador retiene el impuesto a la renta de quinta categoría; además, en el régimen laboral general se pagan gratificaciones en julio y diciembre (por eso hay quien habla de «14 sueldos»).
            </p>
            <p>
              Verifica siempre las reglas y los porcentajes vigentes en las fuentes oficiales de tu país (ver fuentes); esta guía no da cifras ni porcentajes de descuentos.
            </p>
            <Tabla
              resumen="Conceptos que separan el salario bruto del neto, por qué importan y qué preguntar"
              columnas={["Concepto", "Qué es", "Qué hacer"]}
              primeraColumnaEnNegrita
              filas={[
                ["Bruto", "El monto antes de descuentos.", "Pregunta siempre si la cifra es bruta o neta y mensual o anual."],
                ["Aportes", "Descuentos para pensión y, según el país, salud.", "Pregunta a qué sistema estarás afiliado y confirma los porcentajes en fuentes oficiales."],
                ["Impuestos", "Retenciones sobre el ingreso, según tu país y tu nivel.", "No los estimes de memoria: consulta la autoridad tributaria de tu país."],
                ["Pagos extra", "Gratificaciones y otros pagos al año.", "Pregunta cuántos pagos hay y cuáles son exactamente (ver «pagos al año» en la herramienta)."],
                ["Neto aproximado", "Tu estimación del monto que llega a tu cuenta.", "La herramienta puede mostrarlo con el % de descuentos que tú escribas; es tu estimación, no un cálculo de impuestos."],
              ]}
            />

            <h2 id="variable">Salario fijo, variable y bonos: cómo valorar lo condicionado</h2>
            <p>
              El fijo es lo que cobras sí o sí; el variable depende de algo: metas, resultados de la empresa o decisiones ajenas. Tratar un bono «de hasta X» como si fuera seguro es un error habitual. La herramienta lo evita con dos escenarios: <strong>conservador</strong>, con solo el porcentaje del variable que tú consideras seguro (por defecto 0 %), y <strong>completo</strong>, con el máximo posible.
            </p>
            <Tabla
              resumen="Tipos de variable, cómo se valoran y la pregunta clave para cada uno"
              columnas={["Tipo", "Cómo se valora", "Pregunta clave"]}
              primeraColumnaEnNegrita
              filas={[
                ["Monto anual máximo", "Máximo posible; conservador = máximo × % seguro.", "¿Qué metas lo activan y cuándo se paga?"],
                ["% del fijo anual", "Fijo anual × porcentaje.", "¿Sobre qué base se calcula: fijo anual o algo distinto?"],
                ["Número de sueldos", "Fijo mensual × número de sueldos.", "¿Cuántos sueldos como máximo y con qué condiciones?"],
                ["Sin metas definidas", "Trátalo como 0 en el conservador.", "¿Puedo tener las metas por escrito antes de aceptar?"],
              ]}
            />
            <p>
              Regla práctica: lo condicionado se valora por lo que puedes controlar y demostrar. Si las metas no están definidas, el escenario conservador es el que te sirve para decidir.
            </p>

            <h2 id="beneficios">Beneficios monetarios y no monetarios: cómo ponerles precio</h2>
            <p>
              Un beneficio vale lo que te ahorra de un gasto que ya harías. Valora solo lo que usarías de verdad; un beneficio que no usas no es dinero.
            </p>
            <Tabla
              resumen="Beneficios frecuentes, cómo ponerles precio y qué cuidar"
              columnas={["Beneficio", "Cómo valorarlo", "Cuidado"]}
              primeraColumnaEnNegrita
              filas={[
                ["Seguro de salud o EPS", "Lo que pagarías por un seguro equivalente.", "Pregunta cobertura, exclusiones y cuánto asume el trabajador."],
                ["Alimentación o movilidad", "Lo que gastarías de tu bolsillo en el año.", "Comprueba si es monto fijo o reembolso."],
                ["Capacitación", "Lo que costaría el curso que sí tomarías.", "Si solo se puede usar en cursos que no te interesan, no vale."],
                ["Equipo de trabajo", "No suele sumar: es una herramienta, no un ingreso.", "Confirma si se queda contigo o es de la empresa."],
                ["Días extra o flexibilidad", "No monetario: se lista, pero no se suma.", "Pídelo por escrito si es importante para ti."],
              ]}
            />

            <h2 id="valor-anual">Cómo calcular el valor anual real de una oferta (fórmula paso a paso)</h2>
            <p>Estas son las fórmulas exactas de la herramienta, con los números del ejemplo de más abajo:</p>
            <ol>
              <li>
                <strong>Fijo anual</strong> = salario fijo mensual × pagos al año = {m(c.fijoMensual!)} × {c.pagos} = <strong>{m(c.fijoAnual!)}</strong>.
              </li>
              <li>
                <strong>Variable</strong>: máximo posible ({m(c.variableMaximo)}) y conservador = máximo × % seguro ({m(c.variableMaximo)} × 0 % = {m(c.variableConservador)}).
              </li>
              <li>
                <strong>Beneficios valorizados</strong> = suma de los valores anuales que tú les pusiste ({m(c.beneficios)} en el ejemplo, porque no valorizó ninguno).
              </li>
              <li>
                <strong>Valor anual bruto</strong> = fijo anual + variable + beneficios: {m(c.fijoAnual!)} (conservador) o {m(c.completo!.bruto)} (completo).
              </li>
              <li>
                <strong>Costo de trabajar presencial</strong> = días por semana × semanas al año × (transporte + comida por día) = {c.diasPorSemana} × {c.semanas} × {m(c.costoPorDia)} = <strong>{m(c.costo!)}</strong>.
              </li>
              <li>
                <strong>Valor después de costos</strong> = bruto − costo: {m(c.conservador!.despuesDeCostos)} (conservador) y {m(c.completo!.despuesDeCostos)} (completo).
              </li>
            </ol>
            <p>
              El resultado sigue siendo bruto. Sirve para comparar ofertas entre sí y contra tu situación actual, no para saber cuánto te llegará al banco.
            </p>

            <h2 id="tres-cifras">Tus 3 cifras: mínimo aceptable, objetivo y ancla</h2>
            <p>Antes de negociar, decide tres números. Están expresados como salario fijo mensual bruto y cumplen siempre <strong>mínimo ≤ objetivo ≤ ancla</strong> (la herramienta lo valida).</p>
            <Tabla
              resumen="Las tres cifras de la negociación, qué son, cómo definirlas y el error frecuente"
              columnas={["Cifra", "Qué es", "Cómo definirla", "Error frecuente"]}
              primeraColumnaEnNegrita
              filas={[
                ["Mínimo aceptable (walk-away)", "Por debajo de esto dices que no.", "Con tus gastos, tus alternativas y tus referencias.", "Revelarlo: es tu límite, no una cifra para compartir."],
                ["Objetivo", "Con lo que estarías contento.", "Dentro del rango de tus referencias, apoyado en tu experiencia.", "Ponerlo sin ninguna referencia."],
                ["Ancla", "La cifra ambiciosa con la que empiezas.", "Algo por encima del objetivo que puedas justificar con hechos.", "Una cifra tan alta que suene poco seria."],
              ]}
            />
            <p>
              En el ejemplo, con una oferta de {s(4000)} al mes, el mínimo ({s(vMin.valor)}) está {vMin.porcentaje} % por encima, el objetivo ({s(vObj.valor)}) {vObj.porcentaje} % y el ancla ({s(vAnc.valor)}) {vAnc.porcentaje} %. En 14 pagos, eso significa {s(vMin.impactoAnual!)}, {s(vObj.impactoAnual!)} y {s(vAnc.impactoAnual!)} más al año. Ver el efecto anual ayuda a decidir si vale la pena insistir: obtener el objetivo cambia tu año en {s(vObj.impactoAnual!)}, no solo tu mes en {s(vObj.diferencia)}.
            </p>

            <Anuncio posicion="medio" />

            <h2 id="referencias">Dónde buscar referencias salariales y cómo leerlas</h2>
            <p>
              Una referencia es un dato que tú encuentras, con su fuente. Esta herramienta no las da; te pide que las anotes con monto, fuente y fecha para poder comparar tus cifras. Un número sin fuente ni fecha no es una referencia.
            </p>
            <Tabla
              resumen="Tipos de fuente de referencias salariales, qué aportan y sus límites"
              columnas={["Fuente", "Qué aporta", "Límites"]}
              primeraColumnaEnNegrita
              filas={[
                ["Avisos de empleo con rango publicado", "Un rango real que la empresa declaró.", "Puede ser distinto del que finalmente se paga; revisa el puesto y el nivel."],
                ["Portales de empleo y de salarios", "Muchas observaciones en un solo lugar.", "Suelen mezclar niveles, ciudades y datos declarados sin verificar."],
                ["Informes salariales publicados", "Datos con metodología explicada.", "Pueden estar desactualizados; mira la fecha y la muestra."],
                ["Personas del rubro", "Contexto real del puesto.", "Es un solo dato: pide permiso para citarlo y busca otros."],
                ["Tu propia experiencia", "Lo que ganas o ganaste.", "No es una referencia de mercado: es tu punto de partida."],
              ]}
            />
            <p>Al leer una referencia, comprueba cinco cosas: la <strong>fecha</strong> (¿sigue vigente?), la <strong>muestra</strong> (¿cuántos datos?), la <strong>ubicación</strong> (¿tu ciudad o país?), el <strong>nivel</strong> (¿el mismo?) y si es <strong>bruto o neto</strong>. Con menos de tres referencias completas, el rango es poco confiable.</p>

            <h2 id="preguntas-reclutador">Qué preguntar al reclutador</h2>
            <p>Antes de dar una cifra, aclara lo que falta. Preguntar no te resta: muestra que evalúas con criterio.</p>
            <Tabla
              resumen="Temas sobre los que preguntar al reclutador y por qué"
              columnas={["Tema", "Pregunta", "Por qué"]}
              primeraColumnaEnNegrita
              filas={[
                ["Bruto y neto", "¿La cifra es bruta o neta? ¿Mensual o anual?", "Evita comparar peras con manzanas."],
                ["Pagos al año", "¿Cuántos pagos hay al año y cuáles son?", "Cambia el valor anual."],
                ["Variable", "¿Qué metas lo definen, quién las fija y cuándo se paga?", "Convierte lo condicionado en algo medible."],
                ["Beneficios", "¿Qué cubre el seguro y qué parte asume el trabajador?", "Permite valorarlos."],
                ["Revisión salarial", "¿Hay revisión y cada cuánto?", "Es una alternativa si no hay margen ahora."],
                ["Período de prueba", "¿Qué condiciones tiene?", "Afecta tu estabilidad."],
              ]}
            />

            <h2 id="expectativa">Cómo responder la expectativa salarial sin perder la oferta</h2>
            <p>«¿Cuál es tu expectativa salarial?» es la pregunta más temida. Estas prácticas ayudan:</p>
            <ul>
              <li>
                <strong>Pregunta primero el rango del puesto,</strong> si el momento lo permite. Si ya te lo dan, tienes un dato real.
              </li>
              <li>
                <strong>Da un rango apoyado en tus referencias,</strong> con un límite inferior que no comprometa tu mínimo. Nunca reveles tu mínimo.
              </li>
              <li>
                <strong>Habla del alcance del puesto,</strong> no de tus gastos personales.
              </li>
              <li>
                <strong>Si no quieres decir tu salario actual,</strong> redirige a lo que esperas para el nuevo rol. No digas una cifra falsa.
              </li>
              <li>
                <strong>Usa un tono de colaboración,</strong> no de ultimátum: «¿Hay flexibilidad?» funciona mejor que «Solo acepto si…».
              </li>
            </ul>
            <p>
              Ejemplo ilustrativo de la herramienta: «Por lo que investigué y por el alcance del rol, busco un salario fijo mensual bruto entre {s(4600)} y {s(4900)}. ¿Cómo está estructurado el rango para este puesto?» Fíjate en que no aparece el mínimo ({s(4200)}).
            </p>

            <h2 id="sin-mentir">Negociar sin mentir: qué nunca decir</h2>
            <p>Mentir en una negociación es un riesgo doble: puede descubrirse y, si la oferta se acepta con información falsa, ese problema se queda contigo. Estas son las frases que conviene evitar:</p>
            <Tabla
              resumen="Frases que nunca conviene decir al negociar, por qué y qué decir en su lugar"
              columnas={["Nunca digas", "Por qué", "Alternativa honesta"]}
              primeraColumnaEnNegrita
              filas={[
                ["«Tengo otra oferta»", "Si no existe, puede descubrirse y pierdes credibilidad.", "«Estoy evaluando mis opciones y este puesto me interesa mucho.» (solo si es verdad)"],
                ["Un salario actual falso", "Puede verificarse y es deshonesto.", "«Prefiero enfocarme en lo que espero para este rol.»"],
                ["«Si no es X, no acepto» sin ser cierto", "Un ultimátum falso cierra la conversación.", "«Me gustaría llegar a una cifra cercana a X; ¿hay flexibilidad?»"],
                ["Inventar logros o responsabilidades", "Se revisa en la entrevista y en las referencias.", "Argumentos basados solo en lo que hiciste y puedes demostrar."],
                ["Tu mínimo aceptable", "Regalas tu ventaja: la otra parte se queda con ese piso.", "Un rango de objetivo y ancla, apoyado en tus referencias."],
              ]}
            />

            <h2 id="ejemplo">Ejemplo completo de análisis y negociación</h2>
            <p>
              <strong>Ejemplo ilustrativo (ficticio).</strong> Una analista de operaciones semi senior en Lima recibe una oferta de una empresa ficticia. Ninguna cifra es un dato de mercado. Puedes cargar este ejemplo con «Llenar con datos de ejemplo».
            </p>
            <h3>1. Lo que registra</h3>
            <ul>
              <li>Fijo de {s(4000)} en 14 pagos; bono anual de hasta 1 sueldo sujeto a metas que no se definen; EPS con el 50 % pagado por la empresa; modalidad híbrida de 3 días.</li>
              <li>Gastos: {s(12)} de transporte y {s(8)} de comida por día presencial; 48 semanas al año.</li>
              <li>Dos referencias que ella misma encontró, con fuente y fecha: {s(4300)} (aviso público de un puesto similar) y {s(4800)} (una colega del rubro).</li>
              <li>Sus tres cifras: mínimo {s(4200)}, objetivo {s(4600)} y ancla {s(4900)}.</li>
            </ul>
            <h3>2. Lo que calcula la página</h3>
            <Tabla
              resumen="Cálculo del valor anual de la oferta del ejemplo, con la fórmula de cada componente"
              columnas={["Componente", "Fórmula", "Valor"]}
              primeraColumnaEnNegrita
              filas={c.filas.map((f) => [f.etiqueta, f.formula, m(f.valor)])}
            />
            <p>
              Sus tres cifras frente a la oferta: {s(vMin.valor)} (+{s(vMin.diferencia)} al mes), {s(vObj.valor)} (+{s(vObj.diferencia)}) y {s(vAnc.valor)} (+{s(vAnc.diferencia)}). Frente a sus referencias, el mínimo queda por debajo de la más baja, el objetivo dentro del rango y el ancla por encima de la más alta.
            </p>
            <h3>3. Lo que devuelve la IA (resumen)</h3>
            <ul>
              <li>Una revisión que señala el bono condicionado, la EPS sin detalle y el costo de la presencialidad.</li>
              <li>{lectura.preguntas.length} preguntas al reclutador sobre bruto y neto, metas del bono, cobertura de la EPS y revisión salarial.</li>
              <li>{lectura.argumentos.length} argumentos con evidencia, como «Lideré la migración del inventario a SAP en mi puesto actual», que ella misma escribió.</li>
              <li>{lectura.respuestas.length} respuestas preparadas (expectativa, presupuesto, salario actual y un correo), alternativas si no hay margen y una checklist.</li>
            </ul>
            <h3>4. Cómo lo lee la página y qué decide ella</h3>
            <p>
              La página convierte cada respuesta en una tarjeta copiable, marca que ninguna revele su mínimo y comprueba que no haya cifras que no vengan de sus datos. Ella envía primero las preguntas sobre el bono. Si no hay margen en el fijo, propone {s(4300)} con una revisión salarial a los 6 meses por escrito: sobre el fijo de {s(4000)}, esos {s(300)} más al mes son {s(impacto(4300))} al año.
            </p>

            <h2 id="errores">Errores frecuentes y checklist antes de aceptar</h2>
            <Tabla
              resumen="Errores frecuentes al evaluar una oferta, su problema y cómo corregirlos"
              columnas={["Error", "Problema", "Solución"]}
              primeraColumnaEnNegrita
              filas={[
                ["Comparar salarios mensuales sin ver los pagos al año", "Una oferta de 12 pagos y otra de 14 no se comparan por el mensual.", "Compara el valor anual, en dos escenarios."],
                ["Contar el bono máximo como seguro", "Sobrestimas la oferta.", "Usa el escenario conservador para decidir."],
                ["Ignorar el costo de trabajar presencial", "Un fijo mayor puede valer menos.", "Descuenta transporte y comida por los días presenciales."],
                ["Decir una cifra sin referencias", "Pides de más o de menos sin saberlo.", "Busca referencias con fuente y fecha primero."],
                ["Revelar tu mínimo", "Pierdes tu margen.", "Comparte un rango de objetivo y ancla."],
                ["No pedir nada por escrito", "Lo hablado se olvida.", "Pide la oferta y los acuerdos por correo."],
              ]}
            />
            <p>Antes de aceptar, repasa la checklist de la lista de revisión de abajo y la que devuelve la herramienta. Si aún no tienes un CV a la medida del puesto, empieza por la <Link href="/carrera-y-empleo/crear-cv-ats-formato-harvard">herramienta de CV en formato Harvard</Link>.</p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me ayude a negociar»:</p>
            <Tabla resumen="Bloques del prompt de evaluación de oferta y negociación y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>
              La decisión clave es que la IA no inventa cifras de mercado: recibe tus referencias y los cálculos ya hechos, y tiene prohibido revelar tu mínimo o proponer mentir.
            </p>

            <h2 id="revision">Lista de revisión antes de usar el resultado</h2>
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
                <strong>No hay cifras de mercado.</strong> Ni la página ni la IA saben lo que paga un puesto. Si una respuesta afirma promedios o rangos, no la uses.
              </li>
              <li>
                <strong>No es asesoría laboral, legal ni tributaria.</strong> El neto, los aportes, las gratificaciones y las condiciones de tu contrato dependen de tu país, tu régimen y tu caso: verifícalos en fuentes oficiales y, si tienes dudas, con un profesional. Esta guía no fue revisada por un especialista en compensaciones ni en derecho laboral.
              </li>
              <li>
                <strong>No garantiza resultados.</strong> Ningún guion asegura un aumento ni que la empresa acepte.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe. La página marca cifras ajenas, datos de mercado, ofertas mencionadas sin ser reales y respuestas que revelen tu mínimo, pero la revisión final es tuya.
              </li>
              <li>
                <strong>No recomendamos mentir</strong> sobre otras ofertas ni sobre tu salario actual.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El cálculo, el comparador, la validación de tus cifras, el lector de la respuesta y las verificaciones se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_SALARIO.map((q) => (
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
            <p className="mt-3 text-muted-foreground">Estas páginas oficiales se localizaron el 26 de septiembre de 2026 con una búsqueda; sus servidores no permitieron abrirlas automáticamente, por eso esta guía no cita cifras de ellas. Sirven para que verifiques tú las reglas vigentes de Perú:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://personas.sunat.gob.pe/trabajador-dependiente/rentas-quinta-categoria" target="_blank" rel="noopener noreferrer">
                  SUNAT: Rentas de quinta categoría (trabajadores dependientes)
                </a>
                : sobre el impuesto a la renta del trabajo dependiente y la retención del empleador.
              </li>
              <li>
                <a className="text-brand underline underline-offset-2" href="https://orientacion.sunat.gob.pe/08-tasa-y-calculo-del-aporte-al-snp-onp" target="_blank" rel="noopener noreferrer">
                  SUNAT Orientación: Tasa y cálculo del aporte al SNP - ONP
                </a>
                : sobre el aporte al sistema nacional de pensiones.
              </li>
              <li>
                <a className="text-brand underline underline-offset-2" href="https://www.gob.pe/institucion/mtpe/informes-publicaciones/235223-lo-que-deberemos-saber-sobre-las-gratificaciones" target="_blank" rel="noopener noreferrer">
                  Ministerio de Trabajo y Promoción del Empleo: Lo que deberemos saber sobre las gratificaciones
                </a>
                : sobre las gratificaciones de julio y diciembre.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>En otros países, consulta a su autoridad tributaria, su sistema de pensiones y su ministerio de trabajo.</li>
              <li>Las tablas, las fórmulas del valor anual, la regla de las tres cifras y las frases a evitar son criterio propio de esta herramienta, no un estándar ni una estadística.</li>
              <li>Esta herramienta no contiene cifras de mercado ni datos salariales de ninguna empresa.</li>
              <li>Todos los ejemplos (personas, empresas, ofertas, referencias y cifras) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
