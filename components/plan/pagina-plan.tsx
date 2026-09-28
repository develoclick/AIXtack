import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Download, ListTree, Lock, ShieldCheck, Target } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorPlan } from "./generador-plan";
import { DescargarPlantillaRegistro, PlantillasCopiables } from "./recursos-guia";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_PLAN } from "@/content/ejemplos/plan-busqueda";
import { formatoDuracion, minutosDisponibles, sumasPorSemana } from "@/lib/plan/calculo";
import { leerRespuestaPlan } from "@/lib/plan/lector";
import { formatoPorcentaje } from "@/lib/presupuesto/calculo";
import { agrupar, embudo, tasa, textoTasa } from "@/lib/plan/registro";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_PLAN = [
  {
    q: "¿Cuántas postulaciones por semana debo hacer?",
    a: "No existe una cifra que garantice resultados, y esta página no inventa una. Lo útil es partir de tus horas reales: reparte el tiempo entre elegir vacantes, adaptar el CV, postular, hacer seguimiento y practicar. Después mira tu embudo: si postulas mucho y casi nadie responde, el problema no se arregla con más envíos, sino con mejores vacantes o un CV mejor ajustado.",
  },
  {
    q: "¿Cuándo hago seguimiento a una postulación?",
    a: "Como criterio práctico, entre 7 y 10 días hábiles después de postular, si no hubo respuesta y tienes un contacto al que escribirle. Que sea un solo mensaje, breve y cordial. La página te avisa a partir de los días que tú elijas (10 por defecto) o en la fecha de seguimiento que hayas fijado. No es una regla oficial: es una pauta para no olvidarte de ninguna.",
  },
  {
    q: "¿Dónde se guardan mis postulaciones?",
    a: "Solo en tu navegador, en este dispositivo. Este sitio no las recibe. Por eso conviene descargar el CSV de vez en cuando como copia de seguridad: si borras los datos del sitio o cambias de equipo, el registro no se recupera. Puedes volver a importar ese CSV en cualquier momento.",
  },
  {
    q: "¿Qué hago si nadie me responde?",
    a: "Primero mira cuántas postulaciones llevas: con menos de 10, un silencio no permite concluir nada. Con más, revisa tres cosas en este orden: si postulas a avisos donde cumples los requisitos obligatorios, si tu CV está ajustado a cada aviso y si el canal que usas es el que más respuestas te da en tu registro. Cambia una cosa a la vez para saber qué funcionó.",
  },
  {
    q: "¿Sirve si busco mi primer empleo?",
    a: "Sí. Elige «Conseguir mi primer empleo» en tu situación y escribe tus estudios, prácticas o proyectos como competencias. La IA propone tareas más centradas en networking y en cerrar brechas. Si aún no tienes CV, empieza por la guía de CV sin experiencia y por la herramienta de CV en formato Harvard, y vuelve aquí para organizar la búsqueda.",
  },
  {
    q: "¿La IA busca vacantes por mí?",
    a: "No. La IA no tiene acceso a internet ni a ofertas reales. Solo ordena la búsqueda con los datos que le das y prioriza únicamente las vacantes que tú escribes. Si una respuesta menciona empresas o avisos que no escribiste, la página lo marca como posible invención.",
  },
  {
    q: "¿Por qué la página suma los minutos y no la IA?",
    a: "Porque las sumas son el tipo de cuenta en el que una IA de texto puede equivocarse. La herramienta suma los minutos de cada semana con su propio código, los compara con tu tiempo disponible (horas por 60) y te avisa cuánto te pasas o cuánto queda libre.",
  },
  {
    q: "¿Cómo llevo el plan a mi calendario?",
    a: "Elige el lunes de la semana 1 y la hora de inicio, y descarga el archivo .ics. En Google Calendar, Outlook o Apple Calendar, usa la opción de importar un calendario o un archivo. Las horas se muestran en la zona horaria de tu calendario; las tareas de un mismo día se ponen una después de otra.",
  },
  {
    q: "¿Puedo usar el registro sin la IA?",
    a: "Sí. El registro, el embudo, las alertas de seguimiento y la exportación a CSV funcionan sin pegar nada en un asistente. La IA solo interviene para el plan de 4 semanas y para la revisión quincenal, y en ambos casos eres tú quien copia el prompt.",
  },
  {
    q: "¿Se envían mis datos a algún servidor de este sitio?",
    a: "No. El formulario y el registro se guardan en tu navegador y los cálculos se hacen en tu equipo. Tus datos salen únicamente cuando tú pegas un prompt en la IA que elijas, y desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Coach de búsqueda de empleo orientado a métricas, prudente y sin acceso a internet ni a datos del mercado laboral."],
  ["Objetivo", "Un plan de 4 semanas que quepa en tus horas: objetivo, distribución del tiempo, calendario, criterios, plantillas y lectura de métricas."],
  ["Fuente", "Tu CV y tus vacantes, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Puesto, nivel, lugar, modalidad, contrato, sectores, competencias, salario opcional, situación y tus minutos por semana ya calculados."],
  ["Reglas de contenido", "No inventar empresas ni estadísticas, no superar tus minutos, no prometer empleo ni una cifra de postulaciones, y nunca fingir un referido."],
  ["Reglas de formato", "Tabla CSV con cabecera fija para el calendario, viñetas con separadores para cada sección y tres plantillas con marcadores."],
  ["Formato de salida", "Nueve títulos exactos y en orden, para que la página separe la respuesta en paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: minutos que caben, porcentajes que suman 100, títulos exactos y nada inventado."],
];

const REVISION = [
  "Tu puesto objetivo cabe en una frase concreta y no dice «cualquier cosa».",
  "Las horas que escribiste son las que de verdad puedes dedicar.",
  "Ninguna semana del plan se pasa de tus minutos disponibles.",
  "Comprobaste en cada aviso original los requisitos y la fecha límite.",
  "Las versiones de tu CV solo contienen experiencia verdadera.",
  "Las plantillas tienen los marcadores completos y no fingen un referido ni una relación previa.",
  "Registraste cada postulación el mismo día, con su versión de CV.",
  "Esperas a tener al menos 10 postulaciones antes de sacar conclusiones de un porcentaje.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#objetivo", "Definir un puesto objetivo"],
  ["#donde-buscar", "Dónde buscar ofertas"],
  ["#matriz", "Matriz para elegir vacantes"],
  ["#cv", "Adaptar el CV sin perder horas"],
  ["#registro-columnas", "Qué columnas importan"],
  ["#seguimiento", "Cuándo y cómo hacer seguimiento"],
  ["#embudo", "Leer tu embudo"],
  ["#rechazos", "Rechazos y entrevistas"],
  ["#ejemplo", "Una semana completa"],
  ["#plantillas", "Plantillas"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#revision", "Lista de revisión"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaPlan({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_PLAN[0];
  const lectura = leerRespuestaPlan(ej.respuesta);
  const disponibles = minutosDisponibles(ej.datos)!;
  const semanas = sumasPorSemana(lectura.plan, disponibles);
  const s1 = semanas[0];
  const filasSemana1 = lectura.plan.filter((f) => f.semana === 1);
  const e = embudo(ej.postulaciones);
  const porCv = agrupar(ej.postulaciones, "cv");
  const cvA = porCv.find((f) => f.clave === "A")!;
  const cvB = porCv.find((f) => f.clave === "B")!;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Plan de búsqueda de empleo" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Objetivo claro, calendario semanal según tus horas reales y un registro de postulaciones que te dice dónde se atasca tu proceso. Escribes tu puesto y tu tiempo, la IA propone un plan de 4 semanas, la página comprueba que cabe en tu semana y lo lleva a tu calendario. Después anotas cada postulación y ves tu embudo.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Target, "Gratis, sin registro"],
              [CalendarDays, "Exporta a tu calendario (.ics)"],
              [Download, "Registro con CSV"],
              [Lock, "Tus datos se quedan en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof Target;
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Es una ayuda para organizarte, no una garantía de empleo ni asesoría laboral. Esta guía no fue revisada por un especialista en orientación laboral ni en reclutamiento.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Planificador de búsqueda de empleo y registro de postulaciones">
          <GeneradorPlan />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            {e.enviadas} postulaciones, {e.respuestas} respuesta: el embudo dice dónde mirar
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En un caso ficticio, Rosa busca un puesto de asistente administrativa con {ej.datos.horas} horas por semana ({disponibles} minutos). Tras tres semanas anotó {e.enviadas} postulaciones y recibió {e.respuestas} respuesta ({textoTasa(e.respuestas, e.enviadas)}). Como el corte ocurre antes de la entrevista, revisa su CV y sus vacantes, no su forma de entrevistar.{" "}
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
            <p>Buscar trabajo sin un método suele convertirse en postular a lo que aparece y esperar. Esta herramienta lo ordena en cinco pasos, y solo dos necesitan una IA.</p>
            <ol>
              <li>
                <strong>Defines tu objetivo:</strong> puesto, nivel, lugar, modalidad y, si quieres, sectores, salario y competencias.
              </li>
              <li>
                <strong>Dices cuánto tiempo tienes:</strong> las horas por semana se convierten en minutos, y hasta cinco vacantes opcionales para priorizar.
              </li>
              <li>
                <strong>Copias el prompt</strong> y pegas la respuesta: la página separa el plan en paneles, suma los minutos de cada semana y lo exporta a tu calendario.
              </li>
              <li>
                <strong>Registras cada postulación</strong> en un tracker que se guarda en tu navegador. El embudo calcula tus tasas por etapa, por canal y por versión de CV.
              </li>
              <li>
                <strong>Cada dos semanas</strong> copias un segundo prompt que ya viene relleno con las métricas de tu registro.
              </li>
            </ol>
            <p>
              La regla que atraviesa todo: <strong>ni la página ni la IA conocen el mercado laboral.</strong> No hay porcentajes de éxito ni tiempos promedio; solo tus horas, tus vacantes y tus números.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="objetivo">Cómo definir un puesto objetivo (y por qué «cualquier cosa» no funciona)</h2>
            <p>
              Un objetivo vago produce una búsqueda dispersa. Si dices que aceptas cualquier trabajo, no sabes qué palabras poner en el CV, qué avisos descartar ni a quién pedir ayuda. Un puesto concreto permite decidir rápido: esta vacante sí, esta no.
            </p>
            <p>Una buena definición cabe en una frase con cuatro datos: el puesto, el nivel, el lugar y la modalidad. Por ejemplo: «asistente administrativa, nivel junior, en Arequipa, híbrido».</p>
            <p>
              Si dudas entre dos puestos, no los mezcles. Elige uno como principal y guarda el otro como alternativa: el plan te propone justamente un objetivo y dos alternativas. Cada alternativa es un puesto vecino, con competencias parecidas, que podrías aceptar si el principal tarda.
            </p>
            <p>
              Escribe también tus competencias clave, solo las que puedas demostrar. Servirán para adaptar el CV y para elegir vacantes. Si aún no las tienes claras, la herramienta de{" "}
              <Link href="/carrera-y-empleo/analizar-oferta-laboral">comparar tu CV con una oferta</Link> te muestra qué piden los avisos y qué evidencia tu CV.
            </p>

            <h2 id="donde-buscar">Dónde buscar ofertas de forma eficiente</h2>
            <p>
              No hay un canal mejor para todos. Lo que sí puedes hacer es probar varios y medir cuál te responde más, para dedicar tu tiempo a lo que funciona en tu caso. Por eso el registro pide el canal de cada postulación.
            </p>
            <Tabla
              resumen="Canales de búsqueda, para qué sirven y qué cuidar en cada uno"
              columnas={["Canal", "Sirve para", "Qué cuidar"]}
              primeraColumnaEnNegrita
              filas={[
                ["Portales de empleo", "Ver muchos avisos y comparar requisitos.", "Suelen recibir muchas postulaciones: elige solo donde cumplas lo obligatorio."],
                ["Web de la empresa", "Postular directamente a empresas que te interesan.", "Confirma que el aviso siga vigente y la fecha límite."],
                ["LinkedIn y redes profesionales", "Ver avisos y contactar personas del rubro.", "Perfil coherente con tu CV; mensajes breves y verdaderos."],
                ["Referidos y contactos", "Que alguien conozca tu trabajo antes del proceso.", "Pide orientación, no un favor; nunca finjas un referido."],
                ["Instituciones y bolsas de trabajo", "Convocatorias de tu instituto, universidad o municipio.", "Revisa con frecuencia: algunas convocatorias cierran rápido."],
              ]}
            />
            <p>
              Lo eficiente no es mirar más sitios, sino mirar menos y con criterio. Fija dos o tres canales, dedica una sesión fija a la semana a buscar y anota lo que encuentres antes de decidir a qué postular. Ese orden evita postular por impulso.
            </p>

            <h2 id="matriz">Cómo decidir a qué vacantes postular: matriz de criterios</h2>
            <p>
              Postular con calidad exige descartar. La matriz siguiente es un criterio propio de esta herramienta, no un estándar: sirve para decidir en minutos y para explicar por qué descartaste un aviso. Puntúa cada criterio con sí, parcial o no.
            </p>
            <Tabla
              resumen="Criterios de la matriz para decidir a qué vacantes postular, qué mirar y cómo usarlo"
              columnas={["Criterio", "Qué mirar", "Cómo usarlo"]}
              primeraColumnaEnNegrita
              filas={[
                ["Requisitos obligatorios", "¿Cumples los que el aviso marca como imprescindibles?", "Si no cumples varios, la prioridad baja mucho."],
                ["Modalidad y lugar", "¿Coincide con lo que buscas y con lo que puedes?", "Un aviso presencial lejano puede no valer tu tiempo."],
                ["Fecha límite", "¿Te deja tiempo para adaptar el CV?", "Si vence pronto, decide primero esa."],
                ["Esfuerzo de adaptación", "¿Puedes ajustar el CV con datos verdaderos en una sesión?", "Si necesitas inventar, descarta."],
                ["Claridad del aviso", "¿Describe funciones, horario y condiciones?", "Un aviso confuso merece preguntas antes de postular."],
                ["Contacto interno", "¿Conoces a alguien que pueda orientarte?", "Un contacto real puede mejorar tu postulación."],
              ]}
            />
            <p>
              En la herramienta puedes marcar, para cada vacante, si cumples los requisitos obligatorios. La IA usa esa marca y el texto del aviso para proponer una prioridad alta, media o baja, con un motivo y algo que hacer antes de postular. Compruébalo siempre con el aviso original.
            </p>

            <Anuncio posicion="medio" />

            <h2 id="cv">Adaptar el CV sin perder horas: versión base + ajustes</h2>
            <p>
              Reescribir el CV para cada aviso consume las horas que necesitas para postular. La alternativa es mantener una versión base y ajustar solo lo que cambia: el resumen, el orden de las competencias y los logros que más se parecen al aviso.
            </p>
            <p>
              Ponle una letra a cada versión (A, B, C). Cuando postules, anota cuál enviaste. Es la única forma de saber, semanas después, si una versión recibe más respuestas que otra. Sin ese dato, cambias el CV a ciegas.
            </p>
            <p>
              Ajusta con datos verdaderos. Si el aviso pide una herramienta que no dominas, no la agregues: aprende lo básico y decláralo cuando sea cierto. Para el formato usa la herramienta de{" "}
              <Link href="/carrera-y-empleo/crear-cv-ats-formato-harvard">CV en formato Harvard</Link> y, para ajustar el contenido a un aviso concreto, <Link href="/carrera-y-empleo/optimizar-cv">optimizar tu CV para una oferta</Link>.
            </p>

            <h2 id="registro-columnas">El registro de postulaciones: qué columnas importan</h2>
            <p>Un registro útil es corto. Cada columna existe porque alimenta una decisión o una métrica. Estas son las que usa el tracker y para qué sirven:</p>
            <Tabla
              resumen="Columnas del registro de postulaciones y para qué sirve cada una"
              columnas={["Columna", "Para qué sirve"]}
              primeraColumnaEnNegrita
              filas={[
                ["Empresa y puesto", "Identificar la postulación y evitar duplicados."],
                ["Fecha de postulación", "Calcular los días sin respuesta y filtrar por periodo."],
                ["Canal", "Comparar qué canal responde más (portal, referido, web, LinkedIn)."],
                ["Versión de CV", "Comparar qué versión recibe más respuestas."],
                ["Estado", "Enviada, en revisión, entrevistas, oferta, rechazo o sin respuesta: alimenta el embudo."],
                ["Llegó hasta", "Si hubo rechazo, hasta qué etapa llegó, para contar bien tus entrevistas."],
                ["Fecha de seguimiento", "Avisarte cuándo volver a escribir."],
                ["Resultado y observaciones", "Guardar lo aprendido: qué destacaste y qué te dijeron."],
              ]}
            />
            <p>
              Si prefieres empezar en una hoja de cálculo, descarga la plantilla vacía y luego impórtala con el botón «Importar CSV» del registro. Las fórmulas que empiecen con =, +, - o @ se neutralizan al exportar para que la hoja no las ejecute.
            </p>
            <DescargarPlantillaRegistro />

            <h2 id="seguimiento">Cuándo y cómo hacer seguimiento</h2>
            <p>
              Un seguimiento es un mensaje breve para confirmar que tu postulación llegó y reiterar tu interés. Como pauta práctica, hazlo entre 7 y 10 días hábiles después de postular, siempre que tengas un contacto al que escribirle. No es una regla oficial: cada empresa tiene su ritmo.
            </p>
            <p>
              Envía uno solo. Un segundo mensaje sin respuesta rara vez ayuda, y varios pueden jugar en tu contra. Si no tienes a quién escribirle, no insistas: pasa a la siguiente vacante y marca la postulación como «sin respuesta».
            </p>
            <p>
              El tracker te avisa por ti. Si fijas una fecha de seguimiento, te avisa cuando llegue; si no, cuenta los días desde que postulaste y te avisa al pasar el límite que elijas. Desde el aviso puedes copiar un mensaje de seguimiento con marcadores para completar.
            </p>

            <h2 id="embudo">Leer tu embudo: diagnóstico según dónde se corta</h2>
            <p>
              El embudo tiene cuatro etapas: enviadas, con respuesta, entrevistas y ofertas. Cada tasa es una fracción de la etapa anterior. Lo importante no es el número en sí, sino en qué paso se pierde la mayor parte de las candidaturas.
            </p>
            <Tabla
              resumen="Dónde se corta el embudo, qué puede indicar (como hipótesis) y qué probar"
              columnas={["Dónde se corta", "Qué puede indicar (hipótesis)", "Qué probar"]}
              primeraColumnaEnNegrita
              filas={[
                ["Enviadas → respuesta", "El CV no se ajusta a los avisos, la selección de vacantes es amplia o el canal no rinde.", "Revisar el CV frente a cada aviso, priorizar donde cumples lo obligatorio y comparar canales."],
                ["Respuesta → entrevista", "Algo de la primera conversación no convence: disponibilidad, expectativas o motivación.", "Preparar cómo respondes al primer contacto y confirmar que el puesto coincide con tu objetivo."],
                ["Entrevista → oferta", "Las respuestas no muestran tu valor o falta seguimiento posterior.", "Practicar con historias concretas, pedir retroalimentación y agradecer después de cada entrevista."],
              ]}
            />
            <p>
              La herramienta señala la etapa con menor tasa entre las que tienen al menos 3 casos. Es un criterio propio, no un estándar. Y con menos de 10 postulaciones no concluye nada, porque un solo caso mueve el porcentaje demasiado.
            </p>
            <p>
              Trata cada diagnóstico como una hipótesis que pruebas cambiando una cosa a la vez durante dos semanas. Si el corte está antes de la entrevista, te sirve <Link href="/carrera-y-empleo/optimizar-cv">optimizar el CV</Link>; si está en la entrevista, <Link href="/carrera-y-empleo/preparar-entrevista-de-trabajo">preparar la entrevista</Link>.
            </p>

            <h2 id="rechazos">Rechazos y entrevistas como información</h2>
            <p>
              Un rechazo duele, pero también es un dato. Anótalo con la etapa a la que llegaste: no es lo mismo un rechazo automático a los dos días que uno después de dos entrevistas. Esa diferencia cambia lo que debes ajustar.
            </p>
            <p>
              Después de cada entrevista escribe tres líneas: qué preguntaron, qué respondiste bien y qué harías distinto. Si te dan retroalimentación, guárdala en observaciones. En unas semanas verás patrones que ninguna estadística general te puede dar.
            </p>
            <p>
              Cuidado con dos trampas. La primera es leer un rechazo como un juicio sobre tu valor: suele depender de muchos factores que no ves. La segunda es cambiar todo tras cada rechazo; sin un cambio a la vez, no sabes qué funcionó.
            </p>
            <p>
              Cuando llegue una oferta, evalúala con números antes de aceptar. La herramienta de <Link href="/carrera-y-empleo/calcular-salario-y-negociar-oferta">evaluar una oferta y negociar tu salario</Link> calcula su valor anual y te ayuda a preparar la conversación.
            </p>

            <h2 id="ejemplo">Ejemplo: una semana completa de búsqueda</h2>
            <p>
              Rosa es un caso ficticio: técnica en administración, busca un puesto de asistente administrativa híbrido en Arequipa y tiene {ej.datos.horas} horas por semana, es decir, {disponibles} minutos. Sus tres vacantes son ficticias.
            </p>
            <h3>1. La semana 1 del plan</h3>
            <Tabla
              resumen="Tareas de la semana 1 del plan de Rosa, con su entregable y sus minutos"
              columnas={["Día", "Tarea", "Entregable", "Minutos"]}
              primeraColumnaEnNegrita
              filas={filasSemana1.map((f, i) => [`${f.dia}${i > 0 && filasSemana1[i - 1].dia === f.dia ? " (2)" : ""}`, f.tarea, f.entregable, String(f.minutos)])}
            />
            <p>
              La suma de la semana es <strong>{s1.minutos} minutos ({formatoDuracion(s1.minutos)})</strong>, de los {disponibles} disponibles. Quedan <strong>{s1.libres} minutos libres</strong>: la IA dejó una reserva para imprevistos y para responder a quien le escriba. Si Rosa quisiera usar todas sus horas, pediría un plan más denso.
            </p>
            <h3>2. Tras tres semanas de registro</h3>
            <p>
              Rosa anotó {e.enviadas} postulaciones y recibió {e.respuestas} respuesta: {textoTasa(e.respuestas, e.enviadas)}. El registro muestra lo que hizo, que no siempre coincide con el plan: 3, 6 y 5 postulaciones en cada una de las tres semanas.
            </p>
            <Tabla
              resumen="Postulaciones de Rosa por versión de CV: enviadas, con respuesta y porcentaje"
              columnas={["Versión de CV", "Enviadas", "Con respuesta", "Porcentaje"]}
              primeraColumnaEnNegrita
              filas={[
                ["A", String(cvA.enviadas), String(cvA.respuestas), formatoPorcentaje(tasa(cvA.respuestas, cvA.enviadas)!)],
                ["B", String(cvB.enviadas), String(cvB.respuestas), formatoPorcentaje(tasa(cvB.respuestas, cvB.enviadas)!)],
              ]}
            />
            <p>
              El diagnóstico del embudo es que el corte ocurre antes de la entrevista: {e.respuestas} de {e.enviadas}. La única respuesta llegó con la versión B, que destacaba facturación y Excel. Con tan pocos casos no puede afirmar que B sea mejor, pero sí es una hipótesis razonable para la semana siguiente: usar B como base y comprobarlo con más postulaciones.
            </p>

            <h2 id="plantillas">Plantillas de mensajes</h2>
            <p>
              Tres mensajes cubren la mayor parte de la comunicación de una búsqueda: pedir orientación a alguien del rubro, hacer seguimiento y agradecer tras una entrevista. Los marcadores entre corchetes son datos que solo tú conoces; complétalos antes de enviar.
            </p>
            <PlantillasCopiables plantillas={lectura.plantillas} />
            <p>
              Un principio que también recomienda el centro de carreras de Harvard para los correos de networking es la brevedad: al terminar, quien lo lee debería saber quién eres, qué tienen en común y qué le pides (ver fuentes). Adapta las plantillas con tus palabras y nunca afirmes lo que no sea cierto.
            </p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo de pedirle a una IA que «me arme un plan para buscar trabajo»:</p>
            <Tabla resumen="Bloques del prompt del plan de búsqueda de empleo y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>
              La decisión clave es que la IA no calcula: recibe tus minutos ya convertidos, y la página comprueba después que cada semana cabe. Además tiene prohibido inventar vacantes, prometer resultados o fingir un referido. El segundo prompt, el de la revisión quincenal, sigue los mismos ocho bloques y lleva tus métricas ya calculadas.
            </p>

            <h2 id="revision">Lista de revisión antes de usar el plan</h2>
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
                <strong>No hay datos del mercado laboral.</strong> Ni la página ni la IA saben cuánto tarda una búsqueda ni qué porcentaje de postulaciones recibe respuesta. Si una respuesta afirma cifras así, no las uses.
              </li>
              <li>
                <strong>No garantiza empleo ni plazos.</strong> Un plan ordena tu esfuerzo; no controla lo que decidan las empresas.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe. La página marca cifras ajenas, promesas, vacantes que no escribiste y semanas que no caben, pero la revisión final es tuya.
              </li>
              <li>
                <strong>Tu registro vive en tu navegador.</strong> No hay cuenta ni copia en un servidor: descarga el CSV para no perderlo.
              </li>
              <li>
                <strong>No es asesoría laboral ni legal.</strong> Verifica los requisitos y las condiciones de cada aviso y de tu contrato en fuentes oficiales.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El lector del plan, la suma de minutos, el archivo del calendario, el embudo, las alertas y la importación del CSV se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_PLAN.map((q) => (
              <details key={q.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {q.a}
                  {q.q.includes("Se envían mis datos") && (
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
                <a className="text-brand underline underline-offset-2" href="https://careerservices.fas.harvard.edu/blog/2026/04/13/2-email-templates-for-networking-template-toolbox/" target="_blank" rel="noopener noreferrer">
                  Harvard FAS Mignone Center for Career Success: 2 Email Templates for Networking
                </a>
                : sobre la brevedad de los correos de networking y qué debe quedar claro al final (consultada el 26 de septiembre de 2026). No usamos otras páginas de esa institución para plazos de envío porque la que abrimos sobre agradecimientos no los detalla.
              </li>
              <li>La matriz de criterios, los 7 a 10 días hábiles para el seguimiento, la exigencia de al menos 3 casos por etapa y el mínimo de 10 postulaciones para leer porcentajes son criterio propio de esta herramienta, no estándares ni estadísticas.</li>
              <li>Esta herramienta no contiene datos del mercado laboral ni cifras de éxito de ninguna búsqueda.</li>
              <li>Todos los ejemplos (personas, empresas, avisos, fechas y resultados) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
