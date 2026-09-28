import Link from "next/link";
import { ArrowRight, Clock, ListTree, Lock, Mic, ShieldCheck, Timer, Wallet } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorEntrevista } from "./generador-entrevista";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_ENTREVISTA } from "@/content/ejemplos/entrevista";
import { RUTA_CV } from "@/content/prompts";
import { COMPETENCIAS } from "@/lib/entrevista/tipos";
import { leerRespuestaEntrevista } from "@/lib/entrevista/lector";
import { PREGUNTAS_SIMULACION } from "@/lib/entrevista/prompt";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_ENTREVISTA = [
  {
    q: "¿Cuántas preguntas debo practicar?",
    a: "Menos de las que crees. Es mejor tener entre 5 y 7 historias sólidas de tu experiencia real, que puedas adaptar a muchas preguntas, que 50 respuestas memorizadas. El banco te da preguntas probables para practicar el método; lo importante son tus historias.",
  },
  {
    q: "¿La IA sabe qué preguntará la empresa?",
    a: "No. La IA no conoce el proceso interno de ninguna empresa. Genera preguntas probables a partir de la oferta, de tu CV y del tipo de entrevista que elegiste. Sirven para practicar, no para adivinar lo que te preguntarán.",
  },
  {
    q: "¿Qué es el método STAR?",
    a: "Es una forma de estructurar respuestas sobre situaciones pasadas: Situación (el contexto), Tarea (tu responsabilidad), Acción (lo que hiciste tú) y Resultado (lo que cambió). Algunas guías lo resumen en tres pasos (situación, acción y resultado); la idea es la misma.",
  },
  {
    q: "¿Cómo respondo «¿cuál es tu mayor debilidad?»?",
    a: "Con un área real que no sea imprescindible para el puesto, lo que haces para mejorarla y una evidencia de avance. Evita los clichés («soy perfeccionista») y las debilidades disfrazadas de virtudes: los entrevistadores suelen reconocerlas.",
  },
  {
    q: "¿Sirve para entrevistas en inglés?",
    a: "Sí. Elige «Inglés» como idioma de la práctica: las preguntas y la simulación saldrán en inglés, mientras los títulos de la respuesta se mantienen en español para que la página los lea. Practica en voz alta con el cronómetro y la grabadora.",
  },
  {
    q: "¿Puedo practicar con ChatGPT, Gemini o Claude?",
    a: "Sí: el prompt está pensado para cualquiera de los tres. Una petición improvisada (por ejemplo, «hazme preguntas de entrevista») suele dar preguntas genéricas; este prompt usa tu CV, la oferta y tus temas sensibles, y le prohíbe inventar tu experiencia.",
  },
  {
    q: "¿Cuánto debe durar una respuesta?",
    a: "Depende del entrevistador y de la pregunta. Como referencia de práctica, el cronómetro de esta página usa 2 minutos: te obliga a ir al punto. Una respuesta larga sin resultado suele ser peor que una breve con un dato concreto.",
  },
  {
    q: "¿La grabación de mi voz se sube a algún sitio?",
    a: "No. La grabación se hace con tu navegador, vive solo en la memoria de la página y se pierde al cerrarla, salvo que la descargues tú. Este sitio no recibe tu audio.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario, tus notas, tus historias y la checklist se guardan solo en tu navegador, y la lectura de la respuesta se hace en tu equipo. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas: desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
  {
    q: "¿Esto garantiza que me contraten?",
    a: "No. Nadie puede garantizarlo: la decisión depende de muchos factores, entre ellos tu experiencia real y los demás candidatos. La herramienta te ayuda a llegar más preparado y a contar mejor lo que de verdad hiciste.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Entrevistador experto en el tipo de entrevista que elegiste (Recursos Humanos, técnica, jefe directo, panel o caso) para el puesto de la oferta."],
  ["Objetivo", "Una frase: en el modo banco, preparar al candidato con un mapa del puesto, riesgos, preguntas y temas; en el modo simulación, entrevistarlo una pregunta a la vez y entregar un informe."],
  ["Fuente", "Tu CV, la oferta y lo que sabes de la empresa, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Tipo de entrevista, modo, dificultad, duración, idioma, experiencias a destacar y temas que te preocupan. Lo vacío aparece como «(no indicado)»."],
  ["Reglas de contenido", "Usar solo tus datos, no inventar logros ni datos de la empresa, dar el esqueleto con huecos «[completar con tu dato]» en lugar de respuestas hechas, y reconocer «(sin evidencia en el CV)»."],
  ["Reglas de formato", "Viñetas y campos fijos («Pregunta N [Categoría]: …») para que la página pueda separarlas en tarjetas con «Practicar esta»."],
  ["Formato de salida", "Títulos exactos según el modo: siete en el banco y tres en el informe de la simulación."],
  ["Autoverificación", "Lista que la IA revisa antes de responder: nada fuera de la fuente, títulos exactos, cantidad de preguntas, ningún guion completo y lo dudoso señalado."],
];

const CATEGORIAS_GUIA = [
  ["Presentación", "Síntesis y relación entre tu trayectoria y el puesto.", "Prepara un resumen de un minuto: presente, pasado y por qué esta oferta."],
  ["Trayectoria", "Coherencia de tus decisiones, motivos de los cambios y crecimiento.", "Ten una razón breve y honesta para cada cambio de trabajo y para cada hueco."],
  ["Experiencia relacionada", "Si lo que hiciste se parece a lo que hará el puesto.", "Relaciona cada requisito de la oferta con una línea real de tu CV."],
  ["Técnicas", "Conocimientos y criterio, más honestidad sobre lo que no sabes.", "Repasa lo que pide la oferta y prepara cómo explicar cada herramienta con un caso propio."],
  ["Conductuales", "Cómo actuaste en situaciones reales (competencias).", "Usa el método STAR con tus historias; una historia sirve para varias preguntas."],
  ["Situacionales", "Cómo razonarías ante un caso hipotético del puesto.", "Piensa en voz alta: qué revisarías primero, cómo lo confirmarías y a quién avisarías."],
  ["Proyectos", "Capacidad de explicar con orden y de señalar tu aporte.", "Prepara un proyecto en dos minutos: contexto, tu rol, una decisión y el resultado."],
  ["Fortalezas", "Autoconocimiento y evidencia.", "Elige una fortaleza que el puesto necesite y respáldala con un hecho."],
  ["Áreas de mejora", "Honestidad y capacidad de mejorar.", "Una debilidad real, lo que haces al respecto y una evidencia de avance."],
  ["Específicas de la oferta", "Si leíste la oferta y cómo te preparas para lo que aún no dominas.", "Elige los dos requisitos que menos evidencia tienen en tu CV y prepara cómo los cerrarías."],
];

const REVISION = [
  "Puedes explicar cada línea de tu CV con un ejemplo real y sin contradecirte.",
  "Tienes entre 5 y 7 historias STAR completas, con un dato real en el resultado cuando existe.",
  "Preparaste una respuesta honesta para cada riesgo de tu CV (vacíos, tecnologías que no dominas).",
  "Practicaste en voz alta con el cronómetro y te escuchaste al menos una vez.",
  "Tus respuestas son puntos clave, no un guion memorizado.",
  "Todo dato de la empresa que vas a mencionar lo verificaste en fuentes oficiales.",
  "Tienes tus preguntas para el entrevistador.",
  "Completaste cada hueco «[completar con tu dato]» con información verdadera.",
  "Sabes cuándo, dónde y con quién es la entrevista, y cómo llegar o conectarte.",
  "Repasaste la checklist del día previo y descansarás.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#investigar", "Investigar la oferta y la empresa"],
  ["#tipos", "Tipos de preguntas"],
  ["#star", "Método STAR con 3 ejemplos"],
  ["#proyecto", "Explicar un proyecto técnico"],
  ["#fortalezas", "Fortalezas y áreas de mejora"],
  ["#tecnologia", "Cuando no conoces una tecnología"],
  ["#delicados", "Temas delicados"],
  ["#contradicciones", "Detectar contradicciones"],
  ["#ejercicios", "Ejercicios prácticos"],
  ["#memorizar", "Practicar sin memorizar"],
  ["#checklist", "Checklist 24 horas antes"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#ejemplo", "Ejemplo completo"],
  ["#revision", "Lista de revisión"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaEntrevista({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo completo de la guía: sus cifras salen de la misma lectura que usa la herramienta.
  const carlos = EJEMPLOS_ENTREVISTA[0];
  const lc = leerRespuestaEntrevista(carlos.respuesta);
  const p5 = lc.preguntas.find((x) => x.numero === 5)!;
  const p6 = lc.preguntas.find((x) => x.numero === 6)!;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Preparar entrevista" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Para preparar una entrevista de trabajo no basta con una lista de preguntas: hay que practicar con tu propia experiencia. Pega tu CV y la oferta y recibe un plan de práctica con simulación, repreguntas y temas que debes estudiar, más un cronómetro, una grabadora y tu banco de historias.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Wallet, "Gratis, sin registro"],
              [Mic, "Simulación en vivo"],
              [Timer, "Cronómetro de 2 minutos"],
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
        <section id="herramienta" aria-label="Entrenador de entrevistas">
          <GeneradorEntrevista />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Un requisito que el CV no evidencia: Docker
          </h2>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <p className="rounded-lg border bg-card p-3">
              <span className="font-semibold text-destructive">Riesgo detectado:</span> la oferta pide Docker y el CV de Carlos, desarrollador backend con Node.js, no lo menciona. Pregunta probable: «¿Cómo desplegabas tus servicios?»
            </p>
            <p className="rounded-lg border bg-card p-3">
              <span className="font-semibold text-ok">Estructura sugerida:</span> explicar su forma real de despliegue, lo que sabe de Docker y cómo lo aprendería, sin afirmar experiencia productiva.
            </p>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Las preguntas son probables, no reales.{" "}
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
              Preparar una entrevista de trabajo con IA funciona cuando la IA trabaja con tus datos reales. Esta herramienta convierte tu CV y la oferta en un entrenamiento: qué puede preguntarte cada tipo de entrevistador, qué riesgos tiene tu CV y cómo responder sin inventar nada.
            </p>
            <ol>
              <li>
                <strong>Pegas tu CV y la oferta</strong>, eliges el tipo de entrevista (Recursos Humanos, técnica, jefe directo, panel o caso), el nivel de dificultad y el modo: banco de preguntas o simulación en vivo.
              </li>
              <li>
                <strong>Copias el prompt</strong> y lo pegas en ChatGPT, Gemini, Claude u otro asistente. En modo banco recibes todo de una vez; en modo simulación la IA te pregunta una a una, evalúa cada respuesta y te lanza una repregunta.
              </li>
              <li>
                <strong>Pegas la respuesta (o el informe final).</strong> La página crea tu hoja de estudio, convierte el banco en tarjetas con «Practicar esta» y marca lo que no viene de tus datos. Debajo tienes un cronómetro de 2 minutos, una grabadora, tus historias STAR y la checklist del día previo.
              </li>
            </ol>
            <p>
              Un detalle importante: las preguntas son probables, no reales. Nadie fuera de la empresa sabe qué te preguntarán; lo que sí puedes controlar es llegar con historias verdaderas y bien contadas.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="investigar">Cómo investigar la oferta y la empresa en 30 minutos</h2>
            <p>
              Investigar no es leer todo internet: es reunir lo que te permita responder «¿por qué esta empresa y este puesto?» con hechos. La guía de entrevistas del centro de carreras de Harvard College recomienda leer el sitio del empleador, revisar contenido en línea relevante y seguir sus redes sociales (ver fuentes). Un plan de 30 minutos, que es una propuesta de esta página:
            </p>
            <Tabla
              resumen="Plan de 30 minutos para investigar la oferta y la empresa"
              columnas={["Minutos", "Qué hacer", "Qué anotar"]}
              primeraColumnaEnNegrita
              filas={[
                ["0 a 10", "Leer la oferta subrayando funciones, requisitos y palabras que se repiten.", "Los 5 requisitos que más pesan y cuáles cubre tu CV."],
                ["10 a 20", "Leer la web oficial de la empresa: a qué se dedica, sus servicios y su forma de contar lo que hace.", "Dos datos verificables que puedas mencionar."],
                ["20 a 25", "Revisar sus canales públicos y noticias recientes, si las hay.", "Una novedad o un tema del que puedas preguntar."],
                ["25 a 30", "Escribir tus preguntas para el entrevistador y tus temas a estudiar.", "Tres preguntas y los temas de prioridad alta."],
              ]}
            />
            <p>
              Anota solo lo que verificaste en fuentes oficiales. Si algo lo leíste en un comentario, márcalo como «por confirmar»: es mejor decir «vi que…» que afirmar un dato falso. Para leer la oferta con más detalle, mira <Link href="/carrera-y-empleo/palabras-clave-cv-oferta-laboral">cómo encontrar las palabras clave de una oferta laboral</Link>.
            </p>

            <h2 id="tipos">Tipos de preguntas y qué busca el entrevistador en cada una</h2>
            <p>
              Cada pregunta busca comprobar algo concreto. Cuando sabes qué evalúa, dejas de responder al azar. El banco de la herramienta cubre estas diez categorías y te dice, para cada pregunta, qué evalúa:
            </p>
            <Tabla resumen="Las diez categorías de preguntas, qué evalúa cada una y cómo prepararte" columnas={["Categoría", "Qué evalúa", "Cómo prepararte"]} primeraColumnaEnNegrita filas={CATEGORIAS_GUIA} />

            <h2 id="star">Método STAR con 3 ejemplos (bueno, regular y malo, explicado)</h2>
            <p>
              STAR significa Situación, Tarea, Acción y Resultado. Sirve sobre todo para las preguntas conductuales («cuéntame de una vez que…»), que buscan comprobar cómo actuaste en el pasado. La guía de Harvard citada abajo lo enumera como marco para las entrevistas conductuales, en las que los empleadores evalúan competencias como la resolución de problemas, el trabajo en equipo y el liderazgo.
            </p>
            <p>
              <strong>Ejemplo ilustrativo (ficticio).</strong> Pregunta: «Cuéntame de una vez que resolviste un problema con un cliente». Tres respuestas de una asistente administrativa ficticia:
            </p>
            <Tabla
              resumen="Tres respuestas a una pregunta conductual: buena, regular y mala, con la explicación de cada una"
              columnas={["Respuesta", "Por qué"]}
              primeraColumnaEnNegrita
              filas={[
                [
                  "Buena: «En mi puesto anterior un cliente reclamó porque su factura tenía un monto distinto al acordado. Me tocaba aclararlo esa misma semana. Revisé la cotización y la factura, encontré la diferencia, la expliqué al cliente por correo y coordiné con contabilidad la corrección. El cliente recibió la factura corregida y siguió comprando con nosotros.»",
                  "Tiene las cuatro partes, dice qué hizo ella (no el equipo), es breve y termina con un resultado verificable. Un dato (por ejemplo, en cuánto tiempo) la mejoraría, pero solo si es real.",
                ],
                [
                  "Regular: «Una vez un cliente se molestó por una factura. Lo solucionamos entre varias personas y todo quedó bien.»",
                  "Tiene situación y resultado, pero «lo solucionamos» no dice qué hizo ella ni cómo. El entrevistador no puede evaluar su aporte y probablemente repregunte.",
                ],
                [
                  "Mala: «Yo siempre soy muy buena con los clientes y nunca tengo problemas. Soy una persona responsable y comprometida.»",
                  "No cuenta ninguna situación real: son adjetivos sin evidencia. Además, «nunca tengo problemas» pierde credibilidad. No responde lo que se preguntó.",
                ],
              ]}
            />
            <p>
              Fíjate en lo que separa la buena de la regular: la parte de <strong>Acción</strong> en primera persona. Si tus verbos de acción son pobres, revisa la <Link href="/carrera-y-empleo/verbos-de-accion-para-cv">lista de verbos de acción por área</Link>.
            </p>

            <h2 id="proyecto">Cómo explicar un proyecto técnico en 2 minutos</h2>
            <p>
              Explicar un proyecto es una prueba de claridad: el entrevistador quiere saber qué hiciste tú y por qué tomaste tus decisiones, no la lista de tecnologías. Reparte los 120 segundos así:
            </p>
            <Tabla
              resumen="Reparto de los dos minutos al explicar un proyecto técnico"
              columnas={["Parte", "Segundos", "Qué decir"]}
              primeraColumnaEnNegrita
              filas={[
                ["Contexto", "20", "Para qué existía el proyecto y quién lo usaba."],
                ["Tu rol", "20", "Qué parte era tuya y qué parte de otras personas."],
                ["Una decisión técnica", "40", "Qué alternativas había, por qué elegiste una y qué sacrificaste."],
                ["Resultado", "20", "Qué cambió, con un dato real si lo tienes."],
                ["Aprendizaje", "20", "Qué harías distinto hoy."],
              ]}
            />
            <p>
              Los tiempos suman 120 segundos, el mismo tope del cronómetro de la herramienta. Practica con la grabadora: si el contexto te toma un minuto, estás contando la historia del proyecto en lugar de tu aporte.
            </p>

            <h2 id="fortalezas">Fortalezas y áreas de mejora sin clichés</h2>
            <p>Estas dos preguntas no piden un adjetivo, piden evidencia. Un cliché no es falso, pero no dice nada de ti:</p>
            <Tabla
              resumen="Clichés frecuentes al hablar de fortalezas y debilidades, por qué fallan y una alternativa"
              columnas={["Cliché", "Por qué falla", "Alternativa"]}
              primeraColumnaEnNegrita
              filas={[
                ["«Soy muy responsable»", "Todos lo dicen y no se puede comprobar.", "«En mi puesto actual me encargo de cerrar el archivo cada mes; nunca lo dejé sin terminar.» (solo si es cierto)"],
                ["«Soy perfeccionista»", "Es una virtud disfrazada de debilidad.", "Una debilidad real, por ejemplo tardar en delegar, con lo que haces para mejorarla."],
                ["«Trabajo bien bajo presión»", "No muestra cómo.", "Una historia STAR de una fecha límite real."],
                ["«No tengo debilidades»", "Suena poco honesto o poco reflexivo.", "Un área real, no crítica para el puesto, con una evidencia de avance."],
                ["«Aprendo rápido»", "Es una afirmación sin prueba.", "«Aprendí X en Y tiempo y lo apliqué en Z.» (con datos reales)"],
              ]}
            />

            <Anuncio posicion="medio" />

            <h2 id="tecnologia">Qué responder cuando no conoces una tecnología solicitada</h2>
            <p>
              Casi todo candidato se topa con un requisito que no domina. Lo peor es fingir: una pregunta más profunda lo deja en evidencia y daña la confianza en el resto de tus respuestas. La estructura honesta tiene tres partes:
            </p>
            <ol>
              <li>
                <strong>Lo que sí has hecho</strong> en un terreno cercano (por ejemplo, cómo despliegas hoy tus servicios).
              </li>
              <li>
                <strong>Lo que sabes de la tecnología,</strong> aunque sea teoría, sin presentarlo como experiencia productiva.
              </li>
              <li>
                <strong>Cómo la aprenderías</strong> y, si es cierto, qué has empezado a hacer (un curso, un proyecto personal en curso).
              </li>
            </ol>
            <Tabla
              resumen="Qué decir y qué evitar cuando no conoces una tecnología de la oferta"
              columnas={["Sí decir", "No decir"]}
              primeraColumnaEnNegrita
              filas={[
                ["«No la he usado en producción; hoy despliego con otra herramienta y estoy aprendiendo lo básico.»", "«Sí, la conozco» cuando no la has usado."],
                ["«Entiendo la idea y sé en qué se diferencia de lo que uso.»", "Una lista de términos que no puedes explicar."],
                ["«Mi plan para ponerme al día es este.» (verdadero)", "«Lo aprendo en un día», si no puedes sostenerlo."],
              ]}
            />

            <h2 id="delicados">Temas delicados: vacíos laborales, despidos, cambios de carrera</h2>
            <p>
              Son las preguntas que más nervios generan y las que mejor se preparan, porque puedes prever que aparecerán. La regla común: hechos breves, sin culpar a nadie, y volver al futuro. No des más detalles personales de los que quieras compartir.
            </p>
            <Tabla
              resumen="Temas delicados, el principio para responder, una estructura y qué evitar"
              columnas={["Tema", "Estructura sugerida", "Evita"]}
              primeraColumnaEnNegrita
              filas={[
                ["Vacío laboral", "El hecho, en una frase; qué hiciste en ese tiempo (lo que realmente hiciste); por qué estás listo ahora.", "Inventar actividades o disculparte demasiado."],
                ["Despido", "El hecho, sin culpar; qué aprendiste; qué cambiaste desde entonces.", "Hablar mal del empleador o dar una versión que puedan contradecir."],
                ["Renuncia sin otro trabajo", "El motivo real y breve; lo que buscas ahora.", "Un motivo distinto al que dirían tus referencias."],
                ["Cambio de carrera", "Qué te llevó al cambio; qué habilidades se trasladan; qué has hecho para prepararte.", "Presentarte como experto en lo que recién empiezas."],
              ]}
            />
            <p>
              Si tu CV tiene poca experiencia, la guía <Link href="/carrera-y-empleo/cv-sin-experiencia">de CV sin experiencia</Link> te ayuda a ordenar lo que sí tienes.
            </p>

            <h2 id="contradicciones">Cómo detectar contradicciones entre tu CV y tus respuestas</h2>
            <p>
              Un entrevistador tiene tu CV delante y va comparando. Las contradicciones casi nunca son mentiras: son descuidos (una fecha, una cifra redondeada, un alcance exagerado). Antes de la entrevista, contrasta cuatro cosas:
            </p>
            <Tabla
              resumen="Cuatro comprobaciones para detectar contradicciones entre tu CV y tus respuestas"
              columnas={["Comprueba", "Pregunta que debes hacerte", "Ejemplo de descuido"]}
              primeraColumnaEnNegrita
              filas={[
                ["Fechas", "¿Las fechas de mis respuestas coinciden con las del CV?", "Dices que estuviste tres años y el CV marca dos."],
                ["Cifras", "¿Cada número que menciono está en el CV o puedo demostrarlo?", "En el CV dice 3 horas y en la entrevista dices que fueron casi seis."],
                ["Herramientas", "¿Menciono solo herramientas que usé de verdad?", "Nombras una tecnología que no aparece en el CV ni usaste."],
                ["Rol y alcance", "¿Cuento lo que hice yo o lo que hizo el equipo?", "Dices «lideré» cuando el CV dice «participé»."],
              ]}
            />
            <p>
              La herramienta te ayuda con una parte: en tus notas y en tus historias STAR marca los números y los nombres que no aparecen en tu CV. No detecta contradicciones de significado (por ejemplo, exagerar tu rol), así que la revisión final es tuya.
            </p>

            <h2 id="ejercicios">Ejercicios prácticos: banco de historias y simulación cronometrada</h2>
            <p>Una práctica eficaz combina estos tres ejercicios:</p>
            <ol>
              <li>
                <strong>Arma tu banco de historias.</strong> Escribe entre 5 y 7 historias reales con el formato STAR. La herramienta comprueba que cubran las ocho competencias que enumera la guía de Harvard: {COMPETENCIAS.map((c) => c.nombre.toLowerCase()).join(", ")}. Con una sola historia puedes cubrir varias competencias.
              </li>
              <li>
                <strong>Practica con el cronómetro.</strong> Elige una pregunta con «Practicar esta», responde en voz alta durante 2 minutos como máximo y anota los puntos clave, no un guion.
              </li>
              <li>
                <strong>Haz una simulación completa.</strong> En modo simulación la IA te hace {PREGUNTAS_SIMULACION} preguntas: con 2 minutos por respuesta son {PREGUNTAS_SIMULACION * 2} minutos de respuestas, más el tiempo de las repreguntas y de leer la retroalimentación.
              </li>
            </ol>
            <p>
              Al final, pide el informe y pégalo en la herramienta: verás una evaluación por pregunta (claridad, evidencia, relación con el puesto y duración), tus fortalezas, tus puntos débiles y un plan de práctica. La «duración» del informe es una estimación por la extensión del texto: para medir el tiempo real usa el cronómetro.
            </p>

            <h2 id="memorizar">Practicar sin memorizar respuestas artificiales</h2>
            <p>
              Un guion memorizado se olvida en cuanto te interrumpen y suena artificial. Una respuesta escrita por una IA, además, puede contar hechos que no viviste. Por eso la herramienta hace lo contrario: te da esqueletos con huecos «[completar con tu dato]» y marca las estructuras que parecen respuestas ya redactadas. Para practicar mejor:
            </p>
            <ul>
              <li>
                <strong>Anota puntos clave,</strong> no frases completas. Si tus notas superan las 120 palabras, la página te avisa de que ya parecen un guion.
              </li>
              <li>
                <strong>Cuenta la misma historia de formas distintas,</strong> según la pregunta. Si solo puedes contarla de una manera, todavía la estás recitando.
              </li>
              <li>
                <strong>Grábate y escúchate.</strong> Notarás muletillas, silencios y partes que se alargan.
              </li>
              <li>
                <strong>Practica las repreguntas.</strong> Suelen mostrar si entiendes lo que hiciste.
              </li>
            </ul>

            <h2 id="checklist">Checklist 24 horas antes</h2>
            <p>La herramienta genera una checklist imprimible, con ítems fijos y otros que salen de tus datos y de la respuesta de la IA. Estos son sus tres grupos:</p>
            <Tabla
              resumen="Grupos de la checklist del día previo y ejemplos de ítems"
              columnas={["Grupo", "Ejemplos de ítems"]}
              primeraColumnaEnNegrita
              filas={[
                ["Logística", "Confirmar día, hora y lugar o enlace; planificar la ruta o probar la conexión; llevar el CV, un documento de identidad y una libreta; en entrevistas virtuales, probar cámara y micrófono."],
                ["Contenido", "Releer el CV y la oferta; repasar tus historias STAR; repasar los temas de prioridad alta; preparar una respuesta honesta para cada riesgo; elegir tus preguntas para el entrevistador."],
                ["Descanso y actitud", "Dejar lista la ropa; acostarte a una hora razonable; no memorizar guiones a última hora."],
              ]}
            />

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques, que cambian un poco según el modo. Cada uno resuelve un riesgo típico de pedirle a una IA que «me haga preguntas de entrevista»:</p>
            <Tabla resumen="Bloques del prompt de preparación de entrevista y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>
              La decisión más importante es que la IA no escribe tus respuestas: da el esqueleto y tú lo completas con datos verdaderos. Así evitas el riesgo de contar en la entrevista algo que no hiciste.
            </p>

            <h2 id="ejemplo">Ejemplo completo paso a paso</h2>
            <p>
              <strong>Ejemplo ilustrativo (ficticio).</strong> Carlos Mendoza Rivas es desarrollador backend en Lima y postula a una oferta de una empresa ficticia que pide Node.js, Docker y colas de mensajes (RabbitMQ). Va a tener una entrevista técnica de 45 minutos, con dificultad exigente. Puedes cargar este ejemplo con «Llenar con datos de ejemplo».
            </p>
            <h3>1. Lo que pega Carlos</h3>
            <ul>
              <li>Su CV: APIs REST con Node.js y Express, RabbitMQ, despliegue con PM2 en servidores Linux y la resolución de la caída del servicio de pagos, restablecido en 3 horas.</li>
              <li>La oferta completa y lo que sabe de la empresa (que procesa pagos digitales para comercios pequeños, dato por verificar).</li>
              <li>Su tema que le preocupa: «No tengo experiencia con Docker».</li>
            </ul>
            <h3>2. Lo que devuelve la IA (resumen)</h3>
            <ul>
              <li>
                <strong>Mapa del puesto</strong> con responsabilidades, herramientas y experiencia exigida, y <strong>{lc.riesgos.length} riesgos</strong>: Docker no está en el CV, el «restablecí en 3 horas» generará repreguntas y los 3 años de Node.js hay que sostenerlos con fechas.
              </li>
              <li>
                <strong>Banco de {lc.preguntas.length} preguntas</strong> (una por categoría, como mínimo), cada una con qué evalúa, la experiencia real del CV, la estructura sugerida y una repregunta.
              </li>
              <li>
                <strong>Temas a estudiar</strong> priorizados y <strong>{lc.entrevistador.length} preguntas para el entrevistador</strong>.
              </li>
            </ul>
            <h3>3. Dos preguntas, en detalle</h3>
            <Tabla
              resumen="Dos preguntas del banco de Carlos con qué evalúa cada una y la estructura sugerida"
              columnas={["Pregunta", "Qué evalúa", "Estructura sugerida"]}
              primeraColumnaEnNegrita
              filas={[
                [`«${p5.texto}»`, p5.evalua, p5.estructura],
                [`«${p6.texto}»`, p6.evalua, p6.estructura],
              ]}
            />
            <h3>4. Cómo lo lee la página y qué hace Carlos</h3>
            <p>
              La página muestra cada pregunta como una tarjeta con «Practicar esta», comprueba que las citas del CV existan y que no aparezcan cifras ni nombres que no estén en sus datos. Carlos completa cada hueco con datos reales, guarda la historia del incidente en su banco STAR (su resultado, «3 horas», ya está en el CV) y practica la pregunta del despliegue con el cronómetro, preparando una respuesta honesta sobre Docker.
            </p>

            <h2 id="revision">Lista de revisión antes de la entrevista</h2>
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
                <strong>Las preguntas son probables, no reales.</strong> La herramienta no conoce el proceso de ninguna empresa.
              </li>
              <li>
                <strong>No inventes.</strong> Cada respuesta debe salir de tu experiencia real. Las cifras, los nombres y las fechas deben coincidir con tu CV.
              </li>
              <li>
                <strong>No memorices guiones,</strong> ni los de una IA ni los tuyos: usa esqueletos y puntos clave.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe. La página marca lo que no viene de tus datos, pero la revisión final es tuya.
              </li>
              <li>
                <strong>No garantiza resultados</strong> ni sustituye la asesoría de un profesional de carrera. No da consejos legales; ante una situación laboral concreta, consulta a quien corresponda.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El armado del prompt, el lector de la respuesta, las verificaciones, la checklist y los archivos Word se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>. Si aún no tienes CV, empieza con la <Link href={RUTA_CV}>herramienta de CV en formato Harvard</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_ENTREVISTA.map((q) => (
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
                <a className="text-brand underline underline-offset-2" href="https://careerservices.fas.harvard.edu/resources/interviewing/" target="_blank" rel="noopener noreferrer">
                  Interviewing – Harvard FAS | Mignone Center for Career Success
                </a>{" "}
                (Harvard College). Consultada el 26 de septiembre de 2026. De aquí salen la recomendación de investigar al empleador (su sitio web, contenido en línea y redes sociales), la explicación de las entrevistas conductuales y sus competencias (pensamiento crítico, orientación al aprendizaje, liderazgo, resolución de problemas, trabajo en equipo, comunicación, habilidades técnicas y profesionalismo) y la idea de preparar historias con un marco (Situación, Acción y Resultado) que esta página amplía con la Tarea.
              </li>
              <li>La forma de responder cada tema delicado, el plan de 30 minutos, el reparto de los 2 minutos y las tablas de la guía son criterio propio de esta herramienta, no un estándar ni una estadística.</li>
              <li>Las preguntas que genera la IA son probables, no las reales de una empresa.</li>
              <li>Todos los ejemplos (personas, empresas, ofertas, CV y cifras) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
