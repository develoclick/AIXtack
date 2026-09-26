import { ArrowDown, Download, FileCheck2, Lock, Wallet } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FormularioCv } from "./formulario-cv";
import { PanelPrompt } from "./panel-prompt";
import { ConvertirWord } from "./convertir-word";
import { VistaCv } from "./vista-cv";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { getCategoria } from "@/content/categorias";
import { CV_EJEMPLO_RESPUESTA } from "@/content/prompts/cv-ejemplo";
import { leerRespuestaIa } from "@/lib/cv/parser";
import type { PromptMeta } from "@/content/prompts";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_CV = [
  {
    q: "¿Es mejor entregar el CV en Word o en PDF?",
    a: "Sigue lo que pida la oferta. Si no dice nada, un PDF creado desde Word conserva el texto real y se ve igual en todos los equipos; un .docx también lo leen bien la mayoría de los sistemas. Evita los PDF que son una foto del documento (escaneados), porque no tienen texto que leer. Esta herramienta te da el .docx para que lo revises y, si quieres, lo guardes como PDF desde Word.",
  },
  {
    q: "¿Debo poner mi foto en el CV?",
    a: "El formato Harvard no lleva foto, y la guía de Harvard College recomienda no incluir imágenes, edad ni género. Aun así, las costumbres cambian según el país y el sector: si la oferta o la empresa piden foto, decide tú. Para los sistemas ATS, una imagen no suma y puede estorbar.",
  },
  {
    q: "¿Cuántas páginas debe tener mi hoja de vida?",
    a: "Con poca o mediana experiencia, una página. Si tienes muchos años de experiencia relevante, dos páginas son razonables. Lo importante no es llenar el espacio: es que lo más relevante para la oferta se vea primero. El prompt de esta herramienta ya le pide a la IA que respete ese límite.",
  },
  {
    q: "¿Puedo usarlo si no tengo experiencia laboral?",
    a: "Sí. Elige «Sin experiencia laboral» como nivel, deja vacío el bloque de trabajos y cuenta en «Proyectos, prácticas, voluntariado o actividades» lo que sí hiciste. La educación va primero y las viñetas se redactan igual, con verbos de acción y resultados reales.",
  },
  {
    q: "¿La IA va a inventar cosas en mi CV?",
    a: "El prompt le prohíbe inventar cifras, empresas, cargos, fechas y habilidades, y le pide separar en las notas lo que no pudo cubrir. Aun así, ninguna IA es infalible: revisa cada línea del resultado antes de enviarlo. Todo lo que aparezca en tu CV debe ser verdad y poder defenderse en una entrevista.",
  },
  {
    q: "¿Este CV garantiza que pase los filtros o que me llamen a una entrevista?",
    a: "No. Nadie puede garantizarlo: cada empresa usa un sistema distinto, con criterios propios, y en la decisión pesan tu experiencia real, la competencia y el momento. Lo que sí hace esta herramienta es evitar los errores de formato que dificultan la lectura automática y ayudarte a que tus palabras clave coincidan con la oferta, cuando de verdad las tienes.",
  },
  {
    q: "¿Qué pasa con mis datos personales?",
    a: "El formulario guarda lo que escribes solo en tu navegador (no lo enviamos a ningún servidor de este sitio) y el Word se crea en tu propio equipo. El único momento en que tus datos salen de tu equipo es cuando tú pegas el prompt en la IA que elijas: desde ahí se rigen por la política de esa empresa.",
  },
];

const PROMPT_PARTES = [
  ["Rol", "Le dice a la IA desde qué punto de vista trabajar: reclutador senior y experto en ATS. Sin rol, tiende a escribir textos genéricos."],
  ["Objetivo y nivel", "Puesto, idioma y nivel del candidato. Cambian el orden de las secciones (educación primero si tienes poca experiencia) y la extensión."],
  ["Oferta laboral", "Es la fuente de las palabras clave. La IA las usa solo si tus datos las respaldan."],
  ["Datos del candidato", "Tu información ordenada. Lo que falta aparece como «(no indicado)» para que la IA no lo rellene con suposiciones."],
  ["Reglas de contenido", "No inventar, viñetas con verbo de acción y resultado, sin pronombres, sin datos personales innecesarios."],
  ["Reglas de formato", "Una columna, encabezados estándar, fechas coherentes, sin tablas ni iconos: lo que un lector automático entiende mejor."],
  ["Formato de salida", "Una estructura exacta de texto. Gracias a ella esta página puede leer la respuesta y convertirla en Word."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: cifras, fechas, formato, palabras clave y extensión."],
];

const CHECKLIST = [
  "Todo lo que dice el CV es verdad y puedes explicarlo en una entrevista.",
  "El nombre, el correo y el teléfono están completos y sin errores.",
  "Los cargos y nombres de empresa son los oficiales, no versiones «creativas».",
  "Las fechas tienen el mismo formato en todo el documento y van de lo más reciente a lo más antiguo.",
  "Cada viñeta empieza con un verbo de acción y cuenta qué hiciste y qué resultó.",
  "Las cifras que aparecen son tuyas y las puedes justificar (si dudas de una, quítala).",
  "Las palabras clave de la oferta que sí dominas aparecen con las mismas palabras que usa el aviso.",
  "No hay tablas, columnas, cuadros de texto, iconos ni fotos, y los encabezados son los estándar.",
  "Cabe en una página (dos como máximo si tienes mucha experiencia relevante).",
  "El archivo se llama con tu nombre (por ejemplo, CV-Nombre-Apellido) y lo abriste una vez para verificar que se lee bien.",
];

const ERRORES = [
  ["Poner el contacto en el encabezado o pie de página de Word", "Algunos sistemas no leen esas zonas y pierden tu correo o tu teléfono.", "Ponlo al inicio del cuerpo del documento, como hace este Word."],
  ["Usar dos columnas, tablas o cuadros de texto", "El lector automático puede mezclar el orden de las líneas o saltarse el contenido.", "Una sola columna, de arriba abajo."],
  ["Encabezados «creativos» («Mi historia», «Lo que sé hacer»)", "El sistema busca secciones conocidas: experiencia, educación, habilidades.", "Usa los encabezados estándar."],
  ["Describir tareas sin resultados", "«Encargado de redes sociales» no dice si lo hiciste bien.", "Cuenta qué lograste y, si tienes el dato real, con cuánta magnitud."],
  ["Llenar el CV de palabras clave que no tienes", "Una entrevista lo deja en evidencia y pierdes credibilidad.", "Usa solo las que de verdad dominas; las demás, aprende o déjalas fuera."],
  ["Enviar el mismo CV a todas las ofertas", "Las palabras clave y las prioridades cambian de una vacante a otra.", "Cambia la oferta en el formulario y genera una versión para cada puesto."],
  ["Abreviaturas o siglas sin explicar", "La oferta puede buscar «Search Engine Optimization» y tú escribiste solo «SEO» (o al revés).", "La primera vez, forma completa y sigla entre paréntesis."],
];

const EJEMPLOS_LOGRO = [
  ["Encargada de las redes sociales.", "Programé y publiqué contenido para 6 cuentas de clientes en Instagram y Facebook."],
  ["Responsable de los reportes.", "Reduje el tiempo de armado del reporte semanal de 4 horas a 1 hora al automatizarlo con hojas de cálculo."],
  ["Escribía artículos para el blog.", "Publiqué y optimicé 24 artículos con investigación de palabras clave, y las visitas orgánicas subieron de 3.200 a 5.900 al mes."],
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#ats", "Qué es un ATS"],
  ["#harvard", "El formato Harvard"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#logros", "Cómo escribir buenos logros"],
  ["#oferta", "Cómo adaptar tu CV a cada oferta"],
  ["#ejemplo", "Ejemplo de resultado"],
  ["#checklist", "Lista de revisión"],
  ["#errores", "Errores frecuentes"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaCv({ prompt }: { prompt: PromptMeta }) {
  const categoria = getCategoria(prompt.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const ejemplo = leerRespuestaIa(CV_EJEMPLO_RESPUESTA);

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Crear CV" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.1] tracking-[var(--tracking-display)] sm:text-4xl lg:text-5xl">{prompt.titulo}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Escribe tus datos a la izquierda y mira cómo se arma tu prompt a la derecha. Pégalo en tu IA, trae la respuesta y descarga tu hoja de vida en Word, con formato Harvard y sin los elementos que los filtros ATS leen mal.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
            {[
              [Wallet, "Gratis, sin registro"],
              [FileCheck2, "Formato Harvard, una columna"],
              [Download, "Descarga en Word (.docx)"],
              [Lock, "Tus datos se quedan en tu navegador"],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof Wallet;
              return (
                <li key={texto as string} className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2">
                  <I aria-hidden className="size-4 text-brand" />
                  {texto as string}
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">
            Por <span className="font-semibold text-foreground">{autor.name}</span> · Publicado el <time dateTime={prompt.publicado}>{formatDate(prompt.publicado)}</time> · Actualizado el <time dateTime={prompt.actualizado}>{formatDate(prompt.actualizado)}</time> · Tiempo: {prompt.tiempo}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Generador de hoja de vida">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <h2 className="text-xl font-semibold">Escribe tus datos</h2>
              </div>
              <a href="#prompt-cv" className="btn btn-secundario mb-4 w-full lg:hidden">
                Ver mi prompt (abajo) ↓
              </a>
              <FormularioCv />
            </div>
            <div className="lg:sticky lg:top-20">
              <PanelPrompt />
            </div>
          </div>

          <div className="mt-8">
            <ConvertirWord />
          </div>
        </section>

        <div className="mx-auto mt-16 max-w-3xl">
          <nav aria-label="En esta página" className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">En esta página</p>
            <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {TOC.map(([href, texto]) => (
                <li key={href}>
                  <a href={href} className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                    <ArrowDown aria-hidden className="size-3.5" />
                    {texto}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-h2:mt-12 prose-a:text-brand">
            <h2 id="como-funciona">Cómo funciona esta herramienta</h2>
            <ol>
              <li>
                <strong>Escribes tus datos.</strong> Puesto, oferta laboral, contacto, experiencia, educación y habilidades. Cuanto más concretos sean tus logros, mejor saldrá el resultado.
              </li>
              <li>
                <strong>Copias el prompt.</strong> Se arma solo con lo que escribiste, con reglas de formato Harvard y de lectura por ATS. Lo pegas en ChatGPT, Gemini, Claude u otro asistente.
              </li>
              <li>
                <strong>Pegas la respuesta y descargas el Word.</strong> La página lee la respuesta, te muestra una vista previa y crea el archivo .docx en tu propio equipo.
              </li>
            </ol>
            <p>
              Si prefieres que tu IA te entregue el Word directamente (algunos asistentes pueden crear archivos), también puedes pedírselo. Pero pasar por esta página tiene una ventaja: ves la vista previa, lees las notas de la IA y el archivo siempre sale con el mismo formato ATS.
            </p>

            <h2 id="ats">Qué es un ATS y cómo lee tu hoja de vida</h2>
            <p>
              Un ATS (<em>Applicant Tracking System</em>, «sistema de seguimiento de candidatos») es el programa que muchas empresas usan para recibir, ordenar y buscar entre las postulaciones. Cuando subes tu CV, el sistema extrae el texto y lo reparte en campos: nombre, contacto, trabajos, estudios y habilidades. Después, quien recluta puede buscar por palabras clave y, en algunos sistemas, ver una comparación con lo que pide la oferta.
            </p>
            <p>
              No existe un único ATS: cada uno funciona distinto y cada empresa lo configura a su manera. Por eso conviene no creer en fórmulas mágicas. Lo que sí es razonable es evitar lo que suele dificultar la lectura automática:
            </p>
            <ul>
              <li>Tablas, columnas y cuadros de texto, que pueden desordenar el orden de lectura.</li>
              <li>Iconos, gráficos y barras de nivel de habilidades, que no son texto.</li>
              <li>Datos de contacto dentro del encabezado o del pie de página del documento.</li>
              <li>Encabezados poco habituales en lugar de «Experiencia» o «Educación».</li>
              <li>Archivos que son una imagen (un PDF escaneado, por ejemplo), sin texto real.</li>
            </ul>
            <p>
              Y hay otra parte igual de importante: al final, una persona lee tu CV. Tiene que ser claro para las dos audiencias.
            </p>

            <h2 id="harvard">El formato Harvard: qué es y cómo lo aplica esta herramienta</h2>
            <p>
              «Formato Harvard» es el nombre popular de un estilo clásico de hoja de vida: sobrio, en orden cronológico inverso, con viñetas que empiezan con verbos de acción. Se apoya en las recomendaciones del centro de carreras de Harvard College para armar un currículum (consultadas el 25 de septiembre de 2026, ver «Fuentes»). No es un formato oficial ni obligatorio: es una guía de buenas prácticas.
            </p>
            <div className="not-prose my-6 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">
                      Recomendación
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Cómo la aplica el prompt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    ["Secciones por orden de importancia y en orden cronológico inverso", "Educación primero si tienes poca experiencia; experiencia primero si tienes más. Lo más reciente, arriba."],
                    ["Viñetas con verbos de acción y resultados cuantificables", "Cada viñeta empieza con un verbo y usa solo las cifras que tú entregaste."],
                    ["Sin pronombres personales («yo», «nosotros»)", "El prompt lo prohíbe y lo revisa en su autoverificación."],
                    ["Sin foto, edad ni género", "El prompt pide no incluirlos; solo ciudad y país."],
                    ["Formato coherente en fechas y estilos", "Un único formato de fechas; negritas para la institución y cursivas para el cargo."],
                    ["No empezar líneas con fechas", "La fecha va a la derecha de la línea del cargo."],
                  ].map(([r, a]) => (
                    <tr key={r}>
                      <td className="p-3 align-top">{r}</td>
                      <td className="p-3 align-top text-muted-foreground">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt que se arma a la derecha no es un texto genérico: tiene ocho bloques, y cada uno resuelve un problema típico de pedirle un CV a una IA.</p>
            <div className="not-prose my-6 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">
                      Bloque
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Para qué sirve
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {PROMPT_PARTES.map(([b, t]) => (
                    <tr key={b}>
                      <th scope="row" className="whitespace-nowrap p-3 text-left align-top font-semibold">
                        {b}
                      </th>
                      <td className="p-3 align-top text-muted-foreground">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Lo más importante es la regla de honestidad: el prompt le indica a la IA que use solo tus datos, que deje fuera lo que no aparece y que anote en las «NOTAS» las brechas y las preguntas. Así ves qué te falta en lugar de recibir un CV bonito con datos inventados.
            </p>

            <h2 id="logros">Cómo escribir buenos logros</h2>
            <p>
              Un buen logro responde a tres preguntas: <strong>qué hiciste</strong>, <strong>cómo o con qué</strong> y <strong>qué pasó gracias a eso</strong>. Empieza con un verbo en pasado (o en presente si el trabajo continúa) y cuéntalo en una o dos líneas. Estos son ejemplos ficticios de cómo pasar de una tarea a un logro:
            </p>
            <div className="not-prose my-6 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">
                      Solo tarea
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Logro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {EJEMPLOS_LOGRO.map(([a, b]) => (
                    <tr key={a}>
                      <td className="p-3 align-top text-muted-foreground">{a}</td>
                      <td className="p-3 align-top">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">Ejemplos ilustrativos con cifras ficticias, escritos por el autor del sitio. Las tuyas deben ser reales.</p>
            <p>Si no recuerdas una cifra, busca datos que sí tengas: cuántas personas o clientes atendías, cuánto tiempo ahorraste, cuánto crecieron las ventas o las visitas, cuántos proyectos entregaste, o el tamaño del equipo o del presupuesto. Si de verdad no hay número, escribe el logro sin número: es mejor eso que inventarlo.</p>

            <h2 id="oferta">Cómo adaptar tu CV a cada oferta</h2>
            <ol>
              <li>Pega el texto de la oferta en el formulario. Es la fuente de las palabras clave.</li>
              <li>Lee las funciones y los requisitos y subraya lo que también hiciste tú, con las palabras del aviso (si dice «gestión de inventario», usa esa frase y no «control de cosas»).</li>
              <li>Revisa las «NOTAS» que devuelve la IA: te dirá qué palabras clave cubrió y cuáles no pudo cubrir por falta de datos.</li>
              <li>Si de verdad tienes esa experiencia y no la habías escrito, agrégala en el formulario y vuelve a generar. Si no la tienes, no la pongas.</li>
              <li>Guarda un archivo por vacante: cambia solo la oferta y el puesto, y el resto de tus datos ya quedó guardado en tu navegador.</li>
            </ol>

            <h2 id="ejemplo">Ejemplo de resultado</h2>
            <p>
              Así se ve una hoja de vida en este formato. Es un <strong>ejemplo ilustrativo</strong>: la persona, las empresas y las cifras son ficticias y el texto lo escribió el autor del sitio para mostrar el formato; no es una respuesta real de una IA ni un caso real.
            </p>
          </article>

          <div className="not-prose my-8">
            <p className="mb-3 inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
            <VistaCv cv={ejemplo.documento} etiqueta="Ejemplo ilustrativo de hoja de vida en formato Harvard, con datos ficticios" />
          </div>

          <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-h2:mt-12 prose-a:text-brand">
            <h2 id="checklist">Lista de revisión antes de enviar</h2>
            <p>La IA te da una primera versión; esta lista es tu revisión final:</p>
            <ul className="not-prose my-4 space-y-2">
              {CHECKLIST.map((c) => (
                <li key={c} className="flex gap-3 rounded-lg border bg-card p-3 text-sm">
                  <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border border-brand text-xs text-brand">
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <h2 id="errores">Errores frecuentes</h2>
            <div className="not-prose my-6 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">
                      Error
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Por qué es un problema
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Qué hacer
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ERRORES.map(([e, p, h]) => (
                    <tr key={e}>
                      <td className="p-3 align-top font-medium">{e}</td>
                      <td className="p-3 align-top text-muted-foreground">{p}</td>
                      <td className="p-3 align-top">{h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="limites">Límites y verificación humana</h2>
            <ul>
              <li>
                <strong>No garantiza una entrevista.</strong> Ni esta herramienta ni ninguna otra puede prometerlo. Te ayuda a presentar bien lo que ya eres.
              </li>
              <li>
                <strong>La IA puede equivocarse o inventar.</strong> El prompt lo intenta evitar, pero tú debes revisar nombres, fechas, cifras y cargos.
              </li>
              <li>
                <strong>Cada país y sector tiene sus costumbres</strong> (por ejemplo, sobre la foto, los datos personales o la extensión). Ajusta el resultado a las del lugar donde postulas.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El generador de prompts y la creación del Word se prueban automáticamente con datos ficticios (incluida la comprobación de que el .docx no lleva tablas ni imágenes). La calidad de la respuesta de cada asistente de IA no la controlamos: por eso existe la vista previa y las notas.
              </li>
            </ul>

            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>

          <div className="mt-4 divide-y rounded-2xl border bg-card">
            {PREGUNTAS_CV.map((p) => (
              <details key={p.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {p.q}
                  <span aria-hidden className="text-xl text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted-foreground">{p.a}</p>
              </details>
            ))}
          </div>

          <section aria-labelledby="fuentes" className="mt-12 rounded-2xl border bg-card p-5 text-sm">
            <h2 id="fuentes" className="text-base font-semibold">
              Fuentes y verificación
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/" target="_blank" rel="noopener noreferrer">
                  Harvard College Guide to Creating a Strong Resume
                </a>{" "}
                (Mignone Center for Career Success, Harvard FAS). Consultada el 25 de septiembre de 2026. De aquí salen las recomendaciones sobre orden, viñetas con verbos de acción, cifras y elementos que evitar.
              </li>
              <li>Las explicaciones sobre el funcionamiento general de un ATS son orientativas: cada sistema y cada empresa lo configuran de forma distinta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
