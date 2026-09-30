import Link from "next/link";
import { ArrowRight, Calculator, Clock, FileDown, ListTree, Lock, Sparkles } from "lucide-react";
import { Anuncio } from "@/components/ads/anuncio";
import { PROSE } from "@/components/articulos/plantilla-articulo";
import { HerramientasRelacionadas } from "@/components/prompts/herramientas-relacionadas";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabla } from "@/components/shared/tabla";
import { GeneradorPlanNegocio } from "./generador-plan-negocio";
import { AUTOR_POR_DEFECTO, getAuthor } from "@/content/autores";
import { articulos, rutaDeArticulo } from "@/content/articulos";
import { catalogo, getCategoria, type HerramientaPublicada } from "@/content/catalogo";
import { EJEMPLOS_PLAN_NEGOCIO } from "@/content/ejemplos/plan-negocio";
import { formatoMonto } from "@/lib/presupuesto/calculo";
import { gastosFijosTotal, inversionTotal, margenContribucion, puntoEquilibrio } from "@/lib/plan-negocio/calculo";
import { formatDate } from "@/lib/utils/format";

export const PREGUNTAS_PLAN_NEGOCIO = [
  {
    q: "¿Esta página redacta el plan por mí?",
    a: "No. Arma el prompt con tus datos y tus cálculos (inversión, costos, margen y punto de equilibrio); tú lo pegas en un asistente de IA de texto, y esta página lee esa respuesta para armar los paneles, el resumen imprimible y el Word.",
  },
  {
    q: "¿Por qué el prompt tiene 2 fases?",
    a: "Porque pedirle a una IA «hazme un plan de negocio» de un tiro suele producir un texto genérico que rellena lo que no sabe. La Fase A le pide primero que identifique qué datos faltan y te haga preguntas; recién con tus respuestas, la Fase B redacta el plan completo.",
  },
  {
    q: "¿De dónde salen el margen y el punto de equilibrio?",
    a: "Los calcula esta página con tu precio de venta, tu costo variable y tus gastos fijos, no la IA. El prompt le pide explícitamente a la IA que cite esos cálculos tal cual, sin recalcularlos ni corregirlos: por eso nunca vas a ver 2 cifras distintas para el mismo dato.",
  },
  {
    q: "¿Qué significan las etiquetas «dato», «cálculo» y «supuesto»?",
    a: "Cada cifra del plan debe traer entre corchetes de dónde sale: «[DATO DEL USUARIO]» es algo que tú escribiste, «[CÁLCULO]» es algo que calculó esta página a partir de tus datos, y «[SUPUESTO]» es una estimación de la IA que todavía no está validada. Revisa primero los supuestos antes de usar el plan para pedir un préstamo o un socio.",
  },
  {
    q: "¿Sirve para pedir un préstamo o buscar un socio?",
    a: "Puede ser un punto de partida, si tus números son reales y no supuestos. Este plan no es un documento oficial de ninguna entidad financiera: antes de presentarlo, revisa los requisitos específicos de quien vaya a leerlo (banco, inversionista, concurso) y confirma cada supuesto marcado como tal.",
  },
  {
    q: "¿Necesito saber contabilidad para usar esta herramienta?",
    a: "No. Solo necesitas 2 números por unidad (cuánto cobras y cuánto te cuesta producir esa unidad) y tu lista de gastos fijos mensuales. La página hace las cuentas de margen y punto de equilibrio con la misma fórmula que usaría un contador.",
  },
  {
    q: "¿Puedo guardar mi avance y continuar en otro dispositivo?",
    a: "Sí. En el paso 3 puedes descargar una copia de tu proyecto en un archivo .json y volver a importarla después, en este mismo navegador o en otro. Esa copia guarda tus datos del formulario, no la respuesta de la IA.",
  },
  {
    q: "¿Mis datos se guardan o se envían a algún servidor de este sitio?",
    a: "No. El formulario se guarda solo en tu navegador. Tus datos salen únicamente cuando tú pegas el prompt en la IA que elijas, o si decides descargar el archivo .json o .docx a tu computadora. Más detalles en la política de privacidad.",
  },
];

const PARTES_DEL_PROMPT = [
  ["Rol", "Consultor de planes de negocio para pequeñas empresas."],
  ["Objetivo", "En la Fase A, diagnosticar qué falta; en la Fase B, redactar el plan completo con cada cifra identificada."],
  ["Fuente", "Tus datos y los cálculos ya hechos por la página, entre etiquetas y declarados como información, no como instrucciones."],
  ["Datos del usuario", "Negocio, mercado, competencia, operación, equipo, inversión, costos, precio, costo variable y finalidad del plan."],
  ["Reglas de contenido", "Usar solo tus datos, citar los cálculos de la página tal cual (nunca recalcularlos) y etiquetar cada cifra."],
  ["Reglas de formato", "«Competencia» y «Proyección de ingresos» en tablas markdown; el resto en viñetas, sin símbolos # fuera de los títulos."],
  ["Formato de salida", "2 títulos en la Fase A (diagnóstico); 19 títulos exactos y en orden en la Fase B (el plan completo)."],
  ["Autoverificación", "Una lista que la IA revisa antes de responder: cada cifra etiquetada, los cálculos citados sin recalcular, los títulos exactos."],
];

const CHECKLIST = [
  "Revisaste cada cifra marcada «[SUPUESTO]»: son las que todavía no están validadas con datos reales.",
  "El precio de venta y el costo variable que escribiste corresponden a la misma unidad (por kilo, por cliente, por servicio…).",
  "Los gastos fijos mensuales incluyen todo lo que pagas aunque no vendas nada ese mes (alquiler, sueldos, servicios).",
  "Si el plan es para pedir un préstamo o buscar un socio, alguien más (idealmente con conocimiento financiero) lo revisó contigo.",
  "Confirmaste el precio de tu competencia antes de fijar el tuyo: los precios de la tabla de competencia también pueden estar desactualizados.",
  "Si tu negocio ya opera, comparaste el escenario pesimista con tus ventas reales del último mes.",
  "El plan en Word no tiene ninguna cifra sin su etiqueta de origen (dato, cálculo o supuesto).",
  "Definiste un siguiente paso concreto (validar demanda, cerrar una alianza, cotizar un seguro) antes de comprometer toda la inversión.",
];

const TOC = [
  ["#como-funciona", "Cómo funciona"],
  ["#para-que-sirve", "Para qué sirve un plan de negocio"],
  ["#numeros-que-necesitas", "Los números que necesitas antes de empezar"],
  ["#margen-y-equilibrio", "Cómo se calculan el margen y el punto de equilibrio"],
  ["#dos-fases", "Las 2 fases del prompt"],
  ["#dato-calculo-supuesto", "Dato, cálculo y supuesto: cómo leer tu plan"],
  ["#errores-frecuentes", "Errores frecuentes al pedirle un plan a una IA"],
  ["#ejemplo", "Ejemplo completo"],
  ["#prompt", "Cómo está hecho el prompt"],
  ["#checklist", "Checklist antes de presentar tu plan"],
  ["#limites", "Límites y verificación"],
  ["#preguntas", "Preguntas frecuentes"],
];

export function PaginaPlanNegocio({ herramienta }: { herramienta: HerramientaPublicada }) {
  const p = herramienta.pagina;
  const categoria = getCategoria(herramienta.categoria)!;
  const autor = getAuthor(AUTOR_POR_DEFECTO)!;
  const apoyo = articulos.filter((a) => a.categoria === herramienta.categoria);
  const pendientes = catalogo.datos.herramientas.filter((h) => h.estado === "pendiente" && herramienta.relacionadas.includes(h.slug));

  // Ejemplo de la guía: sus cifras salen del mismo código que usa la herramienta, así que nunca se desalinean.
  const ej = EJEMPLOS_PLAN_NEGOCIO[0];
  const inv = inversionTotal(ej.datos);
  const fijos = gastosFijosTotal(ej.datos);
  const margen = margenContribucion(ej.datos)!;
  const eq = puntoEquilibrio(ej.datos)!;

  return (
    <>
      <div className="border-b fondo-portada">
        <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Breadcrumbs items={[{ nombre: "Inicio", href: "/" }, { nombre: categoria.nombre, href: `/${categoria.slug}` }, { nombre: "Crear un plan de negocio" }]} />
          <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-5xl">{p.h1}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">Ordena tu idea en un plan completo: la IA redacta el texto, pero la inversión, los costos, el margen y el punto de equilibrio los calcula esta página con tus propios números, no la IA.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[
              [Sparkles, "Gratis, sin registro"],
              [Calculator, "Cálculos hechos por la página, no por la IA"],
              [FileDown, "Descarga en Word (.docx)"],
              [Lock, "Tus datos, en tu navegador"],
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
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">Este plan se genera con ayuda de IA y no sustituye asesoría legal, financiera ni contable profesional. Revísalo antes de usarlo para pedir un préstamo, buscar un socio o presentarlo a un concurso.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
        <section id="herramienta" aria-label="Creador de plan de negocio con IA">
          <GeneradorPlanNegocio />
        </section>

        <aside aria-labelledby="ejemplo-corto" className="tarjeta mx-auto mt-12 max-w-3xl bg-surface p-5 sm:p-6">
          <p className="inline-flex rounded-full bg-warn-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-warn">Ejemplo ilustrativo · negocio ficticio</p>
          <h2 id="ejemplo-corto" className="mt-3 text-lg font-semibold">
            «{ej.datos.nombreEmpresa}» necesita vender {eq.unidades} kg/mes solo para cubrir sus costos
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Con una inversión de S/ {formatoMonto(inv)} y costos fijos de S/ {formatoMonto(fijos)} al mes, un margen de S/ {formatoMonto(margen)} por kilo da un punto de equilibrio de {eq.unidades} kg/mes (S/ {formatoMonto(eq.monto)}). Esa cuenta la hace esta página, nunca la IA.{" "}
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
            <p>Escribir «hazme un plan de negocio» sin más suele devolver un texto genérico, con cifras de mercado inventadas y un margen que nadie calculó de verdad. Esta herramienta separa lo que puede calcular una hoja de cálculo de lo que solo puede redactar una IA, en 3 pasos.</p>
            <ol>
              <li>
                <strong>Cuentas tu negocio y tus números</strong>: qué vendes, a quién, tu competencia, tu equipo, tu inversión inicial, tus gastos fijos, tu precio de venta y tu costo variable por unidad.
              </li>
              <li>
                <strong>Copias un prompt en 2 fases</strong>: primero un diagnóstico (qué te falta, qué preguntarte), y luego, con tus respuestas, el plan completo de 19 secciones.
              </li>
              <li>
                <strong>Pegas la respuesta y descargas tu plan</strong> en un documento Word, con cada cifra identificada como dato tuyo, cálculo de la página o supuesto de la IA.
              </li>
            </ol>
            <p>
              La regla que atraviesa toda la herramienta: <strong>la IA nunca calcula tu margen ni tu punto de equilibrio.</strong> Esta página los calcula con tus propios números y se los entrega a la IA ya resueltos, para que los cite en vez de inventarlos.
            </p>

            <Anuncio posicion="intro" />

            <h2 id="para-que-sirve">Para qué sirve un plan de negocio (y para qué no)</h2>
            <p>Un plan de negocio ordena una idea antes de invertir en ella: obliga a poner en números lo que hasta ahora era una intuición. Sirve para decisiones distintas según a quién se lo muestres:</p>
            <Tabla
              resumen="Para qué usar el plan de negocio, según la finalidad"
              columnas={["Finalidad", "Qué revisar con más cuidado"]}
              primeraColumnaEnNegrita
              filas={[
                ["Organizar mis ideas", "Un plan corto te basta: enfócate en el problema, el cliente y el punto de equilibrio."],
                ["Pedir un préstamo", "La entidad revisará tu inversión, tus costos y tu capacidad de pago: confirma cada supuesto antes de presentarlo."],
                ["Buscar un socio", "Detalla bien el modelo de negocio y qué rol específico necesitas cubrir en el equipo."],
                ["Presentarlo a un concurso", "Revisa el formato que pidan las bases: esta herramienta no sigue el formato de ningún concurso en particular."],
              ]}
            />
            <p>Lo que no es: un plan de negocio hecho aquí no es un documento oficial de ninguna entidad financiera ni un sustituto de la evaluación que haga un banco, un inversionista o un jurado de concurso. Es un punto de partida ordenado, con tus cifras reales separadas de las estimaciones.</p>

            <h2 id="numeros-que-necesitas">Los números que necesitas antes de empezar</h2>
            <p>No necesitas saber contabilidad, pero sí estos 4 datos. Sin ellos, la página no puede calcular tu margen ni tu punto de equilibrio, y la IA tendría que inventarlos (algo que el prompt le prohíbe hacer).</p>
            <Tabla
              resumen="Los 4 números que activan los cálculos del plan"
              columnas={["Dato", "Ejemplo", "Para qué se usa"]}
              primeraColumnaEnNegrita
              filas={[
                ["Inversión inicial (por ítem)", "Lavadoras S/ 24.000, local S/ 4.000…", "Suma la inversión total que necesitas para arrancar."],
                ["Gastos fijos mensuales (por ítem)", "Alquiler S/ 2.200, sueldo S/ 1.500…", "Suma tus costos fijos: lo que pagas aunque no vendas nada."],
                ["Precio de venta por unidad", "S/ 6 por kilo", "Junto al costo variable, calcula tu margen de contribución."],
                ["Costo variable por unidad", "S/ 2,40 por kilo", "Lo que te cuesta cada unidad extra: insumos, empaque, comisión."],
              ]}
            />

            <h2 id="margen-y-equilibrio">Cómo se calculan el margen y el punto de equilibrio</h2>
            <p>Estas son las 2 fórmulas que usa la página. Son las mismas que usaría un contador, y las mismas que la IA recibe ya resueltas para citarlas en tu plan:</p>
            <ul>
              <li>
                <strong>Margen de contribución</strong> = precio de venta − costo variable, por unidad. Es lo que te queda de cada venta para pagar tus gastos fijos.
              </li>
              <li>
                <strong>Punto de equilibrio</strong> = gastos fijos mensuales ÷ margen de contribución. Es cuántas unidades necesitas vender al mes para no perder ni ganar.
              </li>
            </ul>
            <p>Con el punto de equilibrio calculado, la página arma 3 escenarios (pesimista, medio y optimista) moviendo tu demanda mensual estimada hacia arriba y hacia abajo según el porcentaje de variación que definas (30 % por defecto), para que veas de un vistazo si tu supuesto de ventas te deja por encima o por debajo de cubrir tus costos.</p>

            <Anuncio posicion="medio" />

            <h2 id="dos-fases">Las 2 fases del prompt: por qué primero pregunta y después redacta</h2>
            <p>El mismo botón «Copiar prompt» del paso 2 cambia de contenido según si ya escribiste tus respuestas o no, sin que tengas que ir a otra pantalla:</p>
            <Tabla
              resumen="Diferencia entre la Fase A y la Fase B del prompt"
              columnas={["", "Qué hace", "Cuándo se usa"]}
              primeraColumnaEnNegrita
              filas={[
                ["Fase A", "Diagnóstico: qué datos faltan y hasta 10 preguntas priorizadas, sin redactar el plan todavía.", "Mientras el campo «Tus respuestas» del paso 2 esté vacío."],
                ["Fase B", "El plan completo: 19 secciones, con cada cifra citando su origen.", "En cuanto pegas tus respuestas de la Fase A en ese mismo campo."],
              ]}
            />
            <p>Esto evita 2 problemas frecuentes de pedir un plan de un tiro: que la IA rellene con supuestos genéricos lo que no sabe, y que la respuesta se corte por su extensión antes de terminar las 19 secciones.</p>

            <h2 id="dato-calculo-supuesto">Dato, cálculo y supuesto: cómo leer tu plan</h2>
            <p>Cada cifra del plan trae una etiqueta entre corchetes, para que sepas cuánto puedes confiar en ella sin tener que adivinarlo:</p>
            <Tabla
              resumen="Las 3 etiquetas que trae cada cifra del plan"
              columnas={["Etiqueta", "Qué significa", "Qué hacer con ella"]}
              primeraColumnaEnNegrita
              filas={[
                ["[DATO DEL USUARIO]", "Algo que tú escribiste en el formulario.", "Confía en ella si tus datos originales eran correctos."],
                ["[CÁLCULO]", "Algo que calculó esta página con tus datos (margen, punto de equilibrio, escenarios).", "Es aritmética directa sobre tus datos: revisa solo si tus datos de origen cambiaron."],
                ["[SUPUESTO]", "Una estimación de la IA para lo que no le diste (tamaño de mercado, riesgos, tácticas).", "Revísala siempre antes de presentar el plan: es la parte menos confiable."],
              ]}
            />
            <p>En el paso 3, el panel «Números» cuenta cuántas etiquetas de cada tipo trae tu respuesta, y el panel «Riesgos y siguiente paso» avisa si detecta una cifra que no viene ni de tus datos ni de los cálculos de la página (una posible cifra inventada).</p>

            <h2 id="errores-frecuentes">Errores frecuentes al pedirle un plan de negocio a una IA</h2>
            <Tabla
              resumen="Errores frecuentes al generar un plan de negocio con IA, por qué ocurren y cómo corregirlos"
              columnas={["Error", "Por qué ocurre", "Corrección"]}
              primeraColumnaEnNegrita
              filas={[
                ["Cifras de mercado inventadas", "Sin datos reales, un modelo de lenguaje suele generar un número plausible en vez de decir que no lo sabe.", "Esta herramienta le exige separar lo que sabe de lo que no en «Análisis de mercado», y marcar cada estimación como [SUPUESTO]."],
                ["El margen no coincide con el punto de equilibrio", "Si le pides a la IA que calcule ambos, a veces usa datos distintos en cada sección.", "Aquí ambos los calcula la misma función, una sola vez: nunca pueden desalinearse entre secciones."],
                ["Un plan genérico, igual para cualquier rubro", "Pedir «hazme un plan de negocio» sin brief obliga a la IA a promediar lo típico del rubro.", "El formulario reúne tu problema, tu cliente y tu competencia antes de redactar una sola palabra."],
                ["Se corta antes de terminar", "19 secciones completas en una sola respuesta pueden exceder el límite de longitud del asistente.", "La Fase A resuelve las preguntas primero, para que la Fase B se enfoque solo en redactar."],
              ]}
            />

            <h2 id="ejemplo">Ejemplo completo: lavandería con recojo a domicilio ficticia</h2>
            <p>
              «{ej.datos.nombreEmpresa}», negocio ficticio en {ej.datos.ubicacion}. Cliente objetivo: {ej.datos.clienteObjetivo}
            </p>
            <h3>1. Los números de partida</h3>
            <Tabla
              resumen="Números de partida del ejemplo"
              columnas={["Dato", "Valor"]}
              primeraColumnaEnNegrita
              filas={[
                ["Inversión inicial", `S/ ${formatoMonto(inv)}`],
                ["Costos fijos mensuales", `S/ ${formatoMonto(fijos)}`],
                ["Precio de venta", `S/ ${ej.datos.precioVenta} por kilo`],
                ["Costo variable", `S/ ${ej.datos.costoVariable} por kilo`],
              ]}
            />
            <h3>2. El cálculo, hecho por la página</h3>
            <p>
              Margen de contribución: S/ {formatoMonto(margen)} por kilo (precio − costo variable). Punto de equilibrio: {eq.formula.replace("÷", " ÷ ")}, es decir, S/ {formatoMonto(eq.monto)} al mes solo para cubrir los costos fijos.
            </p>
            <h3>3. Lo que hizo la IA (Fase B)</h3>
            <p>Con esos cálculos ya resueltos, la IA redactó el resumen ejecutivo, el análisis de mercado (marcando como supuesto que la demanda de 1.800 kg/mes es una proyección propia, no una preventa), la tabla de competencia y el plan de acción de 90 días, todo citando los mismos números de arriba.</p>

            <h2 id="prompt">Cómo está hecho el prompt (y por qué funciona)</h2>
            <p>El prompt tiene ocho bloques, repetidos en cada una de las 2 fases. Cada uno resuelve un riesgo de pedirle a una IA «hazme un plan de negocio»:</p>
            <Tabla resumen="Bloques del prompt de crear un plan de negocio y para qué sirve cada uno" columnas={["Bloque", "Para qué sirve"]} filas={PARTES_DEL_PROMPT} primeraColumnaEnNegrita />
            <p>La decisión clave es que la IA nunca calcula tu margen, tu punto de equilibrio ni tus escenarios: solo los cita, ya resueltos por esta página, y los usa para redactar el resto del plan.</p>

            <h2 id="checklist">Checklist antes de presentar tu plan</h2>
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
                <strong>No sustituye asesoría legal, financiera ni contable.</strong> Es un punto de partida ordenado, no una evaluación profesional de viabilidad.
              </li>
              <li>
                <strong>No verifica tus cifras de mercado.</strong> El «Análisis de mercado» que redacta la IA es, en su mayoría, supuesto: valídalo con datos propios antes de decidir con él.
              </li>
              <li>
                <strong>No conoce los requisitos de tu banco, inversionista o concurso.</strong> Revisa esos requisitos específicos aparte; esta herramienta no los reemplaza.
              </li>
              <li>
                <strong>Tus datos, siempre en tu navegador.</strong> El formulario nunca se envía a este sitio; revisa el detalle en la <Link href="/politica-de-privacidad">política de privacidad</Link>.
              </li>
              <li>
                <strong>La IA puede equivocarse,</strong> aunque el prompt se lo prohíba: puede etiquetar mal una cifra o repetir un supuesto sin marcarlo. La revisión final es tuya.
              </li>
              <li>
                <strong>Cómo lo comprobamos.</strong> Las fórmulas de margen, punto de equilibrio y escenarios, el lector de la respuesta y el detector de cifras sin respaldo se prueban automáticamente contra datos ficticios verificados con código, no a mano. Conoce el proyecto en <Link href="/sobre-nosotros">Sobre nosotros</Link>, o <Link href="/contacto">escríbenos</Link> si encuentras un error.
              </li>
            </ul>
            <p>
              Si además necesitas la identidad visual de tu negocio, esta herramienta se complementa con{" "}
              <Link href="/emprendimiento/crear-logo-profesional-para-mi-empresa" className="text-brand underline underline-offset-2">
                crear un logo profesional para tu empresa
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
            {PREGUNTAS_PLAN_NEGOCIO.map((q) => (
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
            <p className="mt-3 text-muted-foreground">Esta página oficial peruana se localizó y se consultó el 30 de septiembre de 2026; su contenido no cargó completo de forma automática (bloquea la lectura automatizada), por eso esta guía no cita ningún costo, plazo ni requisito exacto de ella:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <a className="text-brand underline underline-offset-2" href="https://www.gob.pe/producemas" target="_blank" rel="noopener noreferrer">
                  Produce Más (Ministerio de la Producción): plataforma de orientación y servicios para emprendedores y MYPE
                </a>
                : úsala para verificar formalización, financiamiento y asesoría gratuita en tu caso concreto.
              </li>
            </ul>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Las fórmulas de margen de contribución y punto de equilibrio son estándares de contabilidad de gestión, no una interpretación de la IA; las aplica el código de esta página, verificado con pruebas automáticas.</li>
              <li>Esta herramienta no calcula impuestos, licencias ni trámites de formalización: para eso, consulta a SUNAT o a la entidad correspondiente en tu país.</li>
              <li>No usamos el nombre de ningún banco, inversionista ni concurso real como parte de la herramienta ni de sus ejemplos.</li>
              <li>Todos los ejemplos (empresas, cifras y competidores) son ficticios y de elaboración propia; sus cálculos se recalculan con el mismo código de la herramienta, nunca a mano.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
