import Link from "next/link";
import { ArrowRight, Clock, Download, ListChecks, ListTree, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorAnalisis } from "./generador-analisis";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_ANALISIS } from "@/content/ejemplos/analisis-oferta";
import { RUTA_CV } from "@/content/prompts";
import { calcularPuntaje, decidir } from "@/lib/analisis/calculo";
import { leerRespuestaAnalisis } from "@/lib/analisis/lector";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_ANALISIS = [
  {
    q: "¿El porcentaje es mi probabilidad de ser contratado?",
    a: "No. Mide cuánta evidencia hay en tu CV para los requisitos del anuncio, según la fórmula que ves en pantalla. No conoce a los demás candidatos, ni lo que la empresa valora de verdad, ni cómo decide. Úsalo para comparar y para ver qué reforzar, no como pronóstico.",
  },
  {
    q: "¿Debo postular con 60 %?",
    a: "El porcentaje solo no decide. Mira el semáforo: si te faltan requisitos obligatorios, la pregunta es si los tienes y no los escribiste, si son bloqueantes o si puedes explicar la brecha con honestidad. Con los obligatorios críticos cubiertos y las brechas explicables, puede valer la pena postular.",
  },
  {
    q: "¿Por qué «no identificado» y no «no cumple»?",
    a: "Porque el análisis solo lee tu CV. Quizá tienes el requisito y no lo escribiste, o lo escribiste con otras palabras. «No identificado» te obliga a preguntarte si es una brecha real o un problema de redacción; «no cumple» daría por hecho lo primero.",
  },
  {
    q: "¿Sirve para ofertas de LinkedIn, Computrabajo u otros portales?",
    a: "Sí. Sirve para cualquier anuncio que puedas copiar en texto: pega el aviso completo, con las funciones, los requisitos y lo deseable. Cuanto más completo el texto, mejor la lectura. No sirve para ofertas que solo existen como imagen, salvo que las transcribas.",
  },
  {
    q: "¿Puedo cambiar los pesos?",
    a: "Sí. El deslizador va de 0 a 100 % para los obligatorios y el resto se asigna a los deseables. El porcentaje se actualiza al instante, en tu navegador. Si la oferta no distingue obligatorios de deseables, todos los requisitos pesan igual y el deslizador no cambia el resultado.",
  },
  {
    q: "¿Y si la oferta no distingue obligatorios de deseables?",
    a: "Elige «No los distingue». La IA marcará todos los requisitos como «no especificado», el porcentaje los promediará por igual y el semáforo los tratará con el criterio de los obligatorios, que es el más prudente. Si puedes, confirma con la empresa cuáles son imprescindibles.",
  },
  {
    q: "¿La IA calcula el porcentaje?",
    a: "No. La IA extrae y clasifica los requisitos y cita la evidencia; el porcentaje y el semáforo los calcula esta página en tu navegador. Así el cálculo no depende de la aritmética de un asistente de chat y puedes ver y cambiar cada dato que interviene.",
  },
  {
    q: "¿Puedo corregir lo que dice la IA?",
    a: "Sí, y conviene. En la tabla puedes cambiar el tipo y el estado de cualquier fila: el porcentaje y el semáforo se recalculan. La página también avisa cuando un requisito figura como «no identificado» pero sus términos aparecen en tu CV.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario se guarda solo en tu navegador y el cálculo, la tabla y las verificaciones se hacen en tu equipo. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas: desde ahí se rigen por la política de esa empresa. Más detalles en la política de privacidad.",
  },
  {
    q: "¿Garantiza que mi CV pase el filtro de un ATS?",
    a: "No. Nadie fuera de una empresa sabe cómo configura su sistema, y esta herramienta no lo simula. Compara el texto de tu CV con el de la oferta y te dice qué evidencia falta; el resultado de cada proceso depende de la empresa.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Analista de selección de personal con experiencia en Perú y Latinoamérica, que compara solo con evidencia textual."],
  ["Objetivo", "Extraer todos los requisitos, evaluar cada uno con evidencia del CV y proponer palabras clave, fortalezas, brechas y un plan."],
  ["Fuente", "Tu CV y la oferta, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Tus años de experiencia, si la oferta distingue obligatorios de deseables y los pesos elegidos (que aplica la página, no la IA)."],
  ["Reglas de contenido", "No inventar requisitos ni evidencia, citar el CV de forma literal, usar las cuatro etiquetas de estado, no calcular porcentajes ni probabilidades y no afirmar nada sobre un ATS."],
  ["Reglas de formato", "La tabla en un bloque CSV con cabecera exacta y valores permitidos, y un plan de acción con las áreas [CV], [ENTREVISTA] y [APRENDER]."],
  ["Formato de salida", "Ocho títulos exactos y en orden, para que la página separe la tabla y los paneles."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: cada requisito está en la oferta, cada cita está en el CV, los valores son los permitidos y no hay porcentajes."],
];

const REVISION = [
  "Leíste la oferta original completa y comprobaste que la tabla no omite requisitos ni inventa otros.",
  "Cada evidencia que cita la tabla existe de verdad en tu CV.",
  "Revisaste los «no identificados»: ¿los tienes y no los escribiste, o son brechas reales?",
  "Corregiste en la tabla los estados con los que no estás de acuerdo.",
  "Los «parciales» tienen un plan: qué escribirás en el CV o cómo lo explicarás.",
  "Sabes qué requisitos obligatorios son bloqueantes para ti y cuáles son salvables.",
  "Tomaste tu decisión con el semáforo y las brechas, no solo con el porcentaje.",
  "Todo lo que agregues a tu CV es verdad y lo puedes explicar en una entrevista.",
  "Preparaste cómo hablar de tus brechas con honestidad.",
  "Guardaste la tabla (CSV) junto con el nombre de la empresa, para la próxima postulación.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#anatomia", "Anatomía de un anuncio"],
  ["#lenguaje", "Obligatorios vs deseables"],
  ["#palabras-clave", "Palabras clave y competencia"],
  ["#estados", "Las 4 clasificaciones"],
  ["#porcentaje", "Cómo se calcula el porcentaje"],
  ["#ejemplo", "Ejemplo completo"],
  ["#brechas", "Brechas: bloqueantes o salvables"],
  ["#postular", "¿Postular sin cumplir el 100 %?"],
  ["#accion", "Del análisis a la acción"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#revision", "Lista de revisión"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaAnalisis({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen de la misma lectura y del mismo cálculo que usa la herramienta.
  const ana = EJEMPLOS_ANALISIS[0];
  const lectura = leerRespuestaAnalisis(ana.respuesta);
  const puntaje = calcularPuntaje(lectura.requisitos, 70);
  const decision = decidir(lectura.requisitos)!;
  const [obl, des] = puntaje.grupos;
  const con = (peso: number) => calcularPuntaje(lectura.requisitos, peso).porcentaje;
  const d2 = (n: number) => n.toFixed(2);

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Comparar CV con oferta" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Para comparar tu CV con una oferta laboral hay que ir requisito por requisito. Pega tu CV y el anuncio: recibes una tabla con la evidencia de cada requisito, un semáforo para decidir si postular y un porcentaje orientativo que esta página calcula, con la fórmula a la vista.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Wallet, "Gratis, sin registro"],
              [ListChecks, "Tabla requisito por requisito"],
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
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Comparador de CV y oferta laboral">
          <GeneradorAnalisis />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · datos ficticios</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            Ana y una oferta de marketing digital: {puntaje.porcentaje} % orientativo
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            De {lectura.requisitos.length} requisitos, {puntaje.porEstado.CUMPLE} cumple, {puntaje.porEstado.PARCIAL} cumple a medias, {puntaje.porEstado["NO IDENTIFICADO"]} no aparece y {puntaje.porEstado["NO EVALUABLE"]} no se puede evaluar. Con pesos 70/30, el cálculo da {puntaje.porcentaje} %, y el semáforo dice «{decision.titulo}»: ningún obligatorio falta del todo, pero dos están a medias. Ese % no es una probabilidad de ser contratada.{" "}
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
              Comparar tu CV con una oferta laboral significa preguntarte, requisito por requisito, si tu CV muestra evidencia. Esta herramienta ordena esa comparación y la vuelve medible, sin prometer nada que no pueda medir.
            </p>
            <ol>
              <li>
                <strong>Pegas tu CV y la oferta completa.</strong> Opcionalmente ajustas los pesos (obligatorios 70 %, deseables 30 % por defecto), indicas tus años de experiencia y si la oferta distingue lo indispensable de lo deseable.
              </li>
              <li>
                <strong>Copias el prompt</strong> y lo pegas en ChatGPT, Gemini, Claude u otro asistente. La IA extrae los requisitos, los clasifica y cita la evidencia; no calcula ningún porcentaje.
              </li>
              <li>
                <strong>Pegas la respuesta.</strong> La página lee la tabla, recalcula el porcentaje en tu navegador con la fórmula a la vista, muestra el semáforo de decisión y te permite filtrar, corregir y exportar la tabla. También verifica que las citas existan en tu CV.
              </li>
            </ol>
            <p>
              El porcentaje es orientativo: mide cuánta evidencia hay en tu CV para los requisitos del anuncio. No es una probabilidad de contratación ni una garantía de nada.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="anatomia">Cómo leer una oferta laboral: anatomía de un anuncio</h2>
            <p>
              Antes de comparar hay que leer bien el anuncio. Casi todos comparten las mismas partes, aunque cada empresa las nombra a su manera. Saber dónde mirar te ahorra confundir una función con un requisito:
            </p>
            <Tabla
              resumen="Partes habituales de una oferta laboral, qué suelen decir y qué buscar en cada una"
              columnas={["Parte", "Qué suele decir", "Qué buscar"]}
              primeraColumnaEnNegrita
              filas={[
                ["Título del puesto", "El nombre del cargo y a veces el nivel (junior, semi senior).", "El nivel: condiciona los años y la autonomía que se esperan."],
                ["Sobre la empresa", "A qué se dedica y cómo se presenta.", "El contexto: sirve para tu carta y para la entrevista."],
                ["Funciones o responsabilidades", "Lo que harás en el día a día.", "Verbos y herramientas: te dicen qué evidencia mostrar."],
                ["Requisitos", "Lo que debes tener para postular.", "Palabras como «indispensable» o «requisito»: son los candidatos a obligatorios."],
                ["Deseables o valorables", "Lo que suma, pero no descarta.", "Palabras como «deseable», «valorable» o «plus»."],
                ["Condiciones", "Modalidad, horario, beneficios.", "Datos que descartan la oferta para ti antes de analizar nada más."],
                ["Proceso", "Cómo y hasta cuándo postular.", "Plazos y qué documentos piden."],
              ]}
            />
            <p>
              Un error frecuente es tratar las funciones como requisitos: «coordinar reuniones» es lo que harás; «experiencia coordinando equipos» es lo que debes tener. Para ver cómo extraer los términos importantes de un anuncio, lee <Link href="/carrera-y-empleo/palabras-clave-cv-oferta-laboral">cómo encontrar las palabras clave de una oferta laboral</Link>.
            </p>

            <h2 id="lenguaje">Obligatorios vs deseables: el lenguaje que los delata</h2>
            <p>
              Muchos anuncios no separan sus requisitos con títulos claros; lo hacen con el lenguaje. Estas son señales habituales, no reglas: cada empresa escribe distinto, y algunas flexibilizan lo que llaman «indispensable».
            </p>
            <Tabla
              resumen="Palabras que suelen indicar requisitos obligatorios, deseables o ambiguos"
              columnas={["Suele indicar obligatorio", "Suele indicar deseable", "Ambiguo (confirma)"]}
              primeraColumnaEnNegrita
              filas={[
                ["«Indispensable», «requisito», «excluyente»", "«Deseable», «valorable», «se valorará»", "«Se requiere conocimiento de…» en una lista sin títulos"],
                ["«Debe contar con…», «mínimo…»", "«Plus», «suma», «ideal»", "«Experiencia en… (ideal)»"],
                ["«Es necesario…», «obligatorio»", "«Conocimientos de… serán una ventaja»", "Un requisito con años («3 años») sin decir si es mínimo"],
              ]}
            />
            <p>
              Cuando el lenguaje no aclara, la herramienta usa «no especificado» y, en el semáforo, trata esos requisitos con el criterio prudente de los obligatorios. Si puedes, pregunta a la empresa. Y si el anuncio no distingue en absoluto, indícalo en el formulario: todos los requisitos pesan igual.
            </p>

            <h2 id="palabras-clave">Qué es una palabra clave y por qué coincidir no significa ser competente</h2>
            <p>
              Una palabra clave es un término de la oferta que resume una herramienta, una habilidad o una exigencia («Meta Ads», «conciliaciones bancarias», «Excel intermedio»). Repetirla en tu CV puede ayudar a que se lea que encajas, sobre todo si quien revisa busca por términos. Pero coincidir no equivale a ser competente:
            </p>
            <Tabla
              resumen="Situaciones al comparar palabras clave entre el CV y la oferta, ejemplos y qué hacer"
              columnas={["Situación", "Ejemplo", "Qué hacer"]}
              primeraColumnaEnNegrita
              filas={[
                ["Coincide literalmente y hay evidencia", "La oferta dice «Meta Ads» y tu CV cuenta una campaña en Meta Ads.", "Es la mejor situación: déjala clara y con un resultado real."],
                ["Coincide el sentido, no la palabra", "La oferta dice «conciliaciones bancarias» y tu CV dice «cuadre de bancos».", "Usa el término de la oferta si describe lo mismo."],
                ["Coincide la palabra, sin evidencia", "Tu CV lista «Power BI» sin contar qué hiciste con él.", "Agrega un ejemplo real o quítalo: una palabra sola no demuestra nada."],
                ["Se llenó de palabras", "Un bloque de 30 términos copiados de la oferta.", "Evítalo: en la entrevista te preguntarán por cada uno."],
              ]}
            />
            <p>
              La herramienta lista las palabras clave que no aparecen literalmente y te dice si hay un equivalente en tu CV, pero nunca te sugiere agregar una que no puedas respaldar.
            </p>

            <Anuncio posicion="medio" />

            <h2 id="estados">Las 4 clasificaciones explicadas con ejemplos</h2>
            <p>Cada requisito recibe uno de cuatro estados. La diferencia entre ellos es lo que hace útil la tabla:</p>
            <Tabla
              resumen="Los cuatro estados de un requisito, qué significan, un ejemplo ficticio y su valor en el cálculo"
              columnas={["Estado", "Qué significa", "Ejemplo (ficticio)", "Valor"]}
              primeraColumnaEnNegrita
              filas={[
                ["CUMPLE", "Tu CV lo muestra explícitamente.", "«Manejo de Meta Ads» con una campaña real descrita.", "1"],
                ["PARCIAL", `Hay evidencia relacionada pero incompleta.`, "«1 año de experiencia» y tu CV muestra 8 meses; o «Google Analytics» sin decir la versión.", "0.5"],
                ["NO IDENTIFICADO", "No aparece en tu CV. No significa que no lo tengas.", "«Inglés intermedio» sin ninguna mención.", "0"],
                ["NO EVALUABLE", "Es subjetivo o no se puede verificar por texto.", "«Creatividad», «proactivo».", "se excluye"],
              ]}
            />
            <p>
              Fíjate en que no existe «no cumple». Un análisis de texto solo puede decir qué muestra tu CV; decidir que no tienes algo es una conclusión que solo tú puedes sacar.
            </p>

            <h2 id="porcentaje">Cómo se calcula el porcentaje orientativo (y por qué no es una probabilidad)</h2>
            <p>El cálculo es el mismo que ves en la herramienta, paso a paso:</p>
            <ol>
              <li>
                Cada requisito evaluable vale <strong>1</strong> (CUMPLE), <strong>0.5</strong> (PARCIAL) o <strong>0</strong> (NO IDENTIFICADO). Los NO EVALUABLE se excluyen.
              </li>
              <li>
                Se promedia cada grupo: obligatorios, deseables y, si la oferta no los distingue, «no especificados».
              </li>
              <li>
                Se combinan los promedios con los pesos: <strong>(peso obligatorios × promedio obligatorios + peso deseables × promedio deseables) ÷ (suma de los pesos)</strong>. Un grupo sin requisitos evaluables no entra y sus pesos se reparten entre los que sí.
              </li>
            </ol>
            <p>
              Promediar por grupo evita que una oferta con muchos requisitos deseables «diluya» a los obligatorios. Los «no especificados» pesan 0.5 (la media de los dos pesos por defecto).
            </p>
            <p>
              <strong>Por qué no es una probabilidad:</strong> la fórmula solo suma evidencia de tu CV. No tiene datos de los demás candidatos, del criterio de la empresa, de la entrevista ni de la suerte. Dos personas con el mismo 62 % pueden tener situaciones muy distintas (una sin un requisito bloqueante, otra con todo a medias). Por eso el semáforo mira los obligatorios aparte.
            </p>
            <p>
              Los pesos importan. Con la misma tabla de Ana, el porcentaje cambia así:
            </p>
            <Tabla
              resumen="El porcentaje orientativo del ejemplo con distintos pesos para obligatorios y deseables"
              columnas={["Peso obligatorios / deseables", "Cálculo", "Porcentaje"]}
              primeraColumnaEnNegrita
              filas={[
                ["100 % / 0 %", `${d2(obl.promedio!)} (solo cuentan los obligatorios)`, `${con(100)} %`],
                ["70 % / 30 % (por defecto)", `(0.70 × ${d2(obl.promedio!)} + 0.30 × ${d2(des.promedio!)}) ÷ 1.00`, `${con(70)} %`],
                ["50 % / 50 %", `(0.50 × ${d2(obl.promedio!)} + 0.50 × ${d2(des.promedio!)}) ÷ 1.00`, `${con(50)} %`],
                ["0 % / 100 %", `${d2(des.promedio!)} (solo cuentan los deseables)`, `${con(0)} %`],
              ]}
            />

            <h2 id="ejemplo">Ejemplo completo: oferta ficticia vs CV ficticio, requisito por requisito</h2>
            <p>
              <strong>Ejemplo ilustrativo (ficticio).</strong> Ana Torres Paredes, estudiante de Marketing en Lima, postula a «Asistente de Marketing Digital» en una agencia ficticia. Ella declara unos 0,7 años de experiencia (8 meses de prácticas). Puedes cargar este ejemplo con «Llenar con datos de ejemplo».
            </p>
            <h3>1. La oferta y el CV</h3>
            <ul>
              <li>La oferta pide como indispensables Meta Ads, Google Analytics 4 y 1 año de experiencia en marketing digital; se valorará Canva, inglés intermedio y creatividad.</li>
              <li>El CV cuenta prácticas de enero a agosto de 2026 (8 meses) con campañas en Meta Ads, análisis en Google Analytics y piezas en Canva. No menciona inglés.</li>
            </ul>
            <h3>2. Lo que devuelve la IA (la tabla)</h3>
            <Tabla
              resumen="Tabla de requisitos del ejemplo de Ana con tipo, estado y evidencia"
              columnas={["Requisito", "Tipo", "Estado", "Evidencia"]}
              primeraColumnaEnNegrita
              filas={lectura.requisitos.map((r) => [r.requisito, r.tipo ?? "", r.estado ?? "", r.evidencia])}
            />
            <h3>3. Lo que calcula la página</h3>
            <ul>
              <li>
                Obligatorios: (0.5 + 1 + 0.5) ÷ 3 = {d2(obl.promedio!)}. Deseables: (1 + 0) ÷ 2 = {d2(des.promedio!)}. «Creatividad» no se evalúa y queda fuera.
              </li>
              <li>
                Porcentaje: 0.70 × {d2(obl.promedio!)} + 0.30 × {d2(des.promedio!)} = {d2(puntaje.fraccion!)} → <strong>{puntaje.porcentaje} %</strong> orientativo.
              </li>
              <li>
                Semáforo: no hay obligatorios «no identificados» y hay dos parciales, así que dice <strong>«{decision.titulo}»</strong>.
              </li>
            </ul>
            <h3>4. Cómo lo lee Ana y qué hace</h3>
            <p>
              Si en sus prácticas usó Google Analytics 4, escribe «Google Analytics 4» en su CV; si no, no lo cambia. Agrega su nivel de inglés real, solo si lo tiene. Prepara para la entrevista un ejemplo concreto de una campaña en Meta Ads y una respuesta honesta sobre sus 8 meses frente al año que piden.
            </p>

            <h2 id="brechas">Cómo evaluar brechas: ¿bloqueantes o salvables?</h2>
            <p>Una brecha es un requisito que tu CV no muestra del todo. No todas pesan igual. Hazte estas preguntas:</p>
            <Tabla
              resumen="Criterios para decidir si una brecha es bloqueante o salvable, con ejemplos"
              columnas={["Pregunta", "Si la respuesta es sí…", "Ejemplo (ficticio)"]}
              primeraColumnaEnNegrita
              filas={[
                ["¿Lo tienes y no lo escribiste?", "Es salvable: solo falta redactarlo.", "Usas Google Analytics 4 pero tu CV dice «Google Analytics»."],
                ["¿Tienes algo equivalente?", "Suele ser salvable: explícalo con honestidad.", "Sabes Tableau y piden Power BI."],
                ["¿Se puede aprender rápido y comprobar?", "Puede ser salvable si te comprometes a aprenderlo.", "Una herramienta de oficina que ya usas en parte."],
                ["¿Es una exigencia formal o legal?", "Es probable que sea bloqueante.", "Una colegiatura o una licencia que se exige para ejercer."],
                ["¿Exige años que no tienes?", "Depende de cuánto falte; suele ser negociable si el resto encaja.", "Piden 3 años y tienes 2,5."],
                ["¿Es el corazón del puesto?", "Si es la función principal y no la has hecho, pesa mucho.", "Un puesto de ventas y nunca vendiste."],
              ]}
            />
            <p>
              La herramienta no decide por ti: te muestra las brechas y el semáforo, y tú aplicas estas preguntas.
            </p>

            <h2 id="postular">¿Postular si no cumples el 100 %? Criterios prácticos</h2>
            <p>
              Casi ningún candidato cumple todo, y las ofertas suelen describir un perfil ideal. Lo importante no es llegar al 100 %, sino entender qué te falta. Estos criterios, propios de esta guía, ayudan a decidir:
            </p>
            <Tabla
              resumen="Cómo interpretar cada resultado del semáforo y qué hacer antes de postular"
              columnas={["Semáforo", "Qué significa", "Qué hacer"]}
              primeraColumnaEnNegrita
              filas={[
                ["Postula", "Los obligatorios evaluables aparecen con evidencia.", "Postula, con tu CV ajustado a la oferta y tus historias listas."],
                ["Postula ajustando", "Ningún obligatorio falta, pero alguno está a medias.", "Refuerza en el CV la evidencia que ya tienes y prepara cómo explicar lo parcial."],
                ["Postula si cumples…", "Al menos un obligatorio no aparece.", "Confirma si lo tienes y escríbelo; si no, decide si es bloqueante o salvable antes de postular."],
              ]}
            />
            <p>
              Además: postula solo a lo que estás dispuesto a defender con honestidad; no agregues a tu CV nada que no hayas hecho; y prefiere ofertas donde tus brechas sean salvables. Si te quedas con dudas, el porcentaje no las resuelve: una conversación con alguien del rubro sí.
            </p>

            <h2 id="accion">Del análisis a la acción: CV, carta y entrevista</h2>
            <p>El análisis solo sirve si cambia lo que haces. Cada salida tiene un destino:</p>
            <Tabla
              resumen="Qué hacer con cada resultado del análisis: en el CV, en la carta y en la entrevista"
              columnas={["Resultado del análisis", "Dónde usarlo", "Cómo"]}
              primeraColumnaEnNegrita
              filas={[
                ["Parciales y palabras clave con equivalente", "CV", "Reescribe la evidencia con los términos de la oferta, sin inventar; hazlo con la herramienta de optimización de CV."],
                ["Fortalezas diferenciales", "Carta de presentación", "Conecta tus logros con lo que pide la oferta. La guía de Harvard recomienda referenciar habilidades de la descripción del puesto y conectarlas con tus credenciales."],
                ["Brechas y lo «no identificado»", "Entrevista", "Prepara una respuesta honesta para cada una (qué sabes, qué harías para cerrarla)."],
                ["Requisitos por aprender", "Tu plan de estudio", "Prioriza los obligatorios y practica antes de postular."],
              ]}
            />
            <p>
              Tienes dos atajos: «Llevar a Optimizar CV» abre esa herramienta con tu CV y la oferta ya pegados, y «Llevar a Preparar entrevista» además pasa tus brechas a «Temas que te preocupan». Para partir de cero, usa la <Link href={RUTA_CV}>herramienta de CV en formato Harvard</Link>. Si es tu primera postulación, mira la guía de <Link href="/carrera-y-empleo/cv-sin-experiencia">CV sin experiencia</Link>.
            </p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques. Cada uno resuelve un riesgo típico de pedirle a una IA que «compare mi CV con esta oferta»:</p>
            <Tabla resumen="Bloques del prompt de comparación de CV y oferta y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>
              La decisión clave es que la IA no calcula: clasifica y cita. La aritmética la hace la página con tus pesos, así puedes verificar cada número. La tabla va en CSV, un formato tabular que se lee con precisión.
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
                <strong>El porcentaje no es una probabilidad ni una garantía.</strong> Mide evidencia en tu CV; no predice contrataciones ni simula un ATS.
              </li>
              <li>
                <strong>Es un análisis de texto.</strong> No entiende sinónimos ni competencias implícitas con la sutileza de una persona, y trata como no evaluables los requisitos subjetivos. Por eso puedes corregir los estados.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíbe: por eso la página comprueba que las citas existan en tu CV, avisa de requisitos que no están en la oferta y de años que no cuadran con los que declaraste.
              </li>
              <li>
                <strong>Una oferta incompleta da un análisis incompleto.</strong> Si copiaste solo una parte del anuncio, faltarán requisitos.
              </li>
              <li>
                <strong>Es una ayuda para decidir y preparar tu postulación,</strong> no asesoría laboral ni una promesa de resultado.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> El armado del prompt, el lector de la tabla, el cálculo con su semáforo, las verificaciones y la exportación se prueban automáticamente con datos ficticios. La calidad de la respuesta de cada asistente no la controlamos. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>.
              </li>
            </ul>
          </article>

          <Anuncio posicion="final" />

          <article className={PROSE}>
            <h2 id="preguntas">Preguntas frecuentes</h2>
          </article>
          <div className="tarjeta mt-4 divide-y">
            {PREGUNTAS_ANALISIS.map((q) => (
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
                <a className="text-brand underline underline-offset-2" href="https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/" target="_blank" rel="noopener noreferrer">
                  Harvard College Guide to Creating a Strong Resume
                </a>{" "}
                (Mignone Center for Career Success, Harvard FAS). Consultada el 26 de septiembre de 2026. De aquí salen la recomendación de adaptar el CV al tipo de puesto que buscas y la de referenciar, en la carta de presentación, habilidades de la descripción del puesto conectándolas con tus credenciales.
              </li>
              <li>Las señales de lenguaje de las ofertas, la fórmula del porcentaje, los pesos, la regla del semáforo y los criterios de brechas son criterio propio de esta herramienta, no un estándar ni una estadística.</li>
              <li>Cada empresa configura y usa sus procesos de forma distinta: esta página no describe ni simula ningún sistema de seguimiento de candidatos.</li>
              <li>Todos los ejemplos (personas, empresas, ofertas, CV y cifras) son ficticios y de elaboración propia; sus cifras se recalculan con el mismo código de la herramienta.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
