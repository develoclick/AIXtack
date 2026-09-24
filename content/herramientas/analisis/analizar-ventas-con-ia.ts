import { defineHerramienta } from "@/lib/herramientas/tipos";

/**
 * /analisis/analizar-ventas-con-ia (Analizador). Fuente: la guía larga content/guias/analisis/analizar-ventas-con-ia
 * (calcular, interpretar y decidir son tres trabajos; hipótesis frente a causa; comparar de forma justa). Caso: Verde Hogar
 * (ficticio), tienda de plantas de interior.
 *
 * Principio 9: la IA NO suma. La página lee la tabla pegada (fecha, producto, cantidad, monto) y calcula totales, días con
 * ventas, promedio por día, totales por mes y por producto, con un total de control; la IA recibe esas cifras ya hechas
 * y solo interpreta. Sin pruebas reales todavía: `publicado` en `false`.
 */

const TABLA = [
  "fecha;producto;cantidad;monto",
  "2026-08-03;Monstera;2;36.00",
  "2026-08-03;Maceta;3;15.00",
  "2026-08-10;Helecho;4;40.00",
  "2026-08-10;Maceta;5;25.00",
  "2026-08-17;Pack de suculentas;3;45.00",
  "2026-08-17;Fertilizante;2;16.00",
  "2026-08-24;Monstera;1;18.00",
  "2026-08-24;Maceta;4;20.00",
  "2026-09-07;Monstera;1;18.00",
  "2026-09-07;Maceta;2;12.00",
  "2026-09-14;Helecho;3;30.00",
  "2026-09-14;Pack de suculentas;2;30.00",
  "2026-09-21;Fertilizante;3;24.00",
  "2026-09-21;Monstera;1;18.00",
].join("\n");

export default defineHerramienta({
  publicado: false,
  meta: {
    slug: "analizar-ventas-con-ia",
    area: "analisis",
    tipo: "analizador",
    titulo: "Entiende tus ventas sin confundir hechos con suposiciones",
    descripcion: "Pega tu tabla de ventas: la página calcula los totales y el prompt pide a la IA separar datos de hipótesis, qué comprobar y tres decisiones posibles.",
    tiempo: "5 min",
    probadoEn: null, // TODO: IA con la que se hace la prueba real. Sin prueba real no se publica.
    probadoFecha: null, // TODO: fecha real de la prueba (AAAA-MM-DD).
    actualizado: "2026-09-23",
    fechaPublicacion: "2026-09-18",
    ogImage: "/img/analisis/analizar-ventas-con-ia/og.webp", // TODO: subir og.webp (1200×630).
  },

  antesDespues: {
    antes: "«Aquí están mis ventas de los últimos tres meses. Dime qué pasó y qué debería hacer.» La IA no sabe qué pasó en tu negocio, calcula mientras redacta y elige por ti: suena a análisis y puede ser una lista de suposiciones (ejemplo ilustrativo).",
    despues: "**Totales calculados por la página**, y una lectura que separa cada **dato** de cada **hipótesis**, dice **qué comprobar** para confirmarla o descartarla y ofrece **tres decisiones posibles** sin decidir por ti.",
  },

  campos: [
    { id: "tabla", label: "Tabla de ventas (una venta por línea: fecha; producto; cantidad; monto)", tipo: "largo", ejemplo: TABLA, requerido: true, ayuda: "Sin datos de clientes. Separa con punto y coma, coma o tabulador. Puede llevar una primera línea con los títulos." },
    { id: "periodo", label: "Período que analizas", tipo: "texto", ejemplo: "Agosto y septiembre", requerido: true },
    { id: "contexto", label: "Lo que pasó en cada período", tipo: "largo", ejemplo: "Agosto: la maceta costó $5 en lugar de $6 todo el mes. Septiembre: tienda cerrada 3 días por una reforma (27 días abiertos), sin promoción. No se registró si hubo faltantes de stock.", requerido: true, ayuda: "Promociones, cierres, cambios de precio, faltantes. La IA no lo sabe si no se lo cuentas." },
    { id: "pregunta", label: "Lo que quieres entender", tipo: "texto", ejemplo: "Qué cambió en septiembre", requerido: true },
    { id: "decision", label: "Decisión pendiente (opcional)", tipo: "texto", ejemplo: "Repetir la promoción o cambiar el surtido", ayuda: "Sirve para ordenar las decisiones posibles; la IA no la toma por ti." },
  ],
  usaPerfil: ["nombre", "rubro", "moneda"],
  calculadora: null,

  preproceso: {
    tipo: "resumen-ventas",
    campos: { texto: "tabla" },
    casosDePrueba: [
      {
        nombre: "Verde Hogar: agosto y septiembre (14 ventas)",
        valores: { tabla: TABLA },
        esperado: { filas: 14, dias: 7, total: 347, unidades: 36, "mes:2026-08": 215, "mes:2026-09": 132, "producto:Maceta": 72, "producto:Monstera": 90, "producto:Pack de suculentas": 75, "producto:Helecho": 70, "producto:Fertilizante": 40, control: "Sí" },
      },
      {
        nombre: "Coma como separador, sin títulos y con fechas DD/MM/AAAA",
        valores: { tabla: "05/03/2026,Pan,2,3.50\n05/03/2026,Leche,1,1.25\n06/03/2026,Pan,3,5.25" },
        esperado: { filas: 3, dias: 2, total: 10, unidades: 6, "mes:2026-03": 10, "producto:Pan": 8.75, control: "Sí" },
      },
      {
        nombre: "Una línea mal formada se descarta y no se suma",
        valores: { tabla: "2026-01-01;Café;1;2.00\nesto no es una venta\n2026-01-02;Café;2;4.00" },
        esperado: { filas: 2, total: 6, "producto:Café": 6 },
      },
    ],
  },

  tarea: `Interpreta mis ventas. Los «Cálculos ya hechos» (totales, días con ventas, totales por mes y por producto) los hizo la página con mi tabla: son la única fuente de cifras. No sumes, no recalcules, no calcules porcentajes ni promedios nuevos y no corrijas esos números.

Período: {{periodo}}. Lo que quiero entender: {{pregunta}}. Decisión pendiente: {{decision}}.
Lo que pasó en cada período, que la tabla no muestra:
{{contexto}}

Entrega, en este orden y con estos títulos:
1. DATOS: lo que dicen las cifras, una frase por cifra relevante, copiando el número tal cual. Solo hechos.
2. HIPÓTESIS: para cada observación importante, al menos dos explicaciones posibles. Cada una empieza con «Hipótesis:». Ninguna se presenta como causa.
3. QUÉ COMPROBAR: para cada hipótesis, qué dato y qué cálculo la confirmarían o la descartarían, con datos que yo pueda conseguir.
4. COMPARACIÓN JUSTA: qué fue distinto en cada período (días abiertos, promociones, precios, faltantes) y qué dato falta para comparar de forma justa.
5. TRES DECISIONES POSIBLES: opciones para considerar, cada una con lo que habría que comprobar antes. No recomiendes una.
6. LO QUE NO SE PUEDE AFIRMAR con estos datos.

Reglas:
- Con pocos meses de datos no hay tendencias: habla de observaciones y preguntas, no de temporadas.
- Si falta un dato para comparar (por ejemplo, los días abiertos), dilo y márcalo [FALTA: el dato].
- No des consejos contables ni tributarios.
- Separa siempre lo que sale de mis cifras de lo que supones.

Formato de salida: DATOS, HIPÓTESIS, QUÉ COMPROBAR, COMPARACIÓN JUSTA, DECISIONES POSIBLES, LO QUE NO SE PUEDE AFIRMAR y FALTA.

Antes de responder, comprueba que cada cifra está en los cálculos de la página, que no hiciste cuentas nuevas, que toda explicación dice «Hipótesis» y que no recomendaste una decisión. Corrige lo que no cumpla.`,

  mejoras: [
    { label: "Más hipótesis", prompt: "Añade una hipótesis más para la observación principal y dime qué dato la confirmaría." },
    { label: "Solo lo comprobable", prompt: "Deja solo las hipótesis que pueda comprobar con datos que ya tengo y dime cómo." },
    { label: "Comparar por día", prompt: "Dime qué dato me falta para comparar los períodos por día abierto, sin calcularlo tú." },
    { label: "Separar hechos", prompt: "Reescribe la respuesta dejando en una columna los hechos y en otra las hipótesis." },
  ],

  ejemplo: {
    negocio: "Verde Hogar (ficticio), tienda de plantas de interior abierta todos los días",
    datos: {
      Productos: "Monstera, Helecho, Pack de suculentas, Maceta y Fertilizante",
      "Período": "Agosto y septiembre; en septiembre las ventas bajaron",
      "Lo que pasó": "Agosto: la maceta costó $5 en lugar de $6 todo el mes. Septiembre: tienda cerrada 3 días por una reforma, sin promoción; no se registró si hubo faltantes de stock",
      "Decisión pendiente": "Repetir la promoción o cambiar el surtido",
    },
    resultado: {
      "Total vendido (14 ventas)": "$347.00",
      "Agosto": "$215.00 · 4 días con ventas · $53.75 por día con ventas",
      "Septiembre": "$132.00 · 3 días con ventas · $44.00 por día con ventas",
      "Por producto": "Monstera $90.00 · Pack de suculentas $75.00 · Maceta $72.00 · Helecho $70.00 · Fertilizante $40.00",
    },
    capturas: [], // TODO: captura real del chat con la respuesta a este prompt (etiqueta «Prueba real»).
    queCorregi: [], // TODO: 3 líneas con lo que el autor corrigió de verdad en la respuesta real. No se escriben sin la prueba.
  },

  // Capturas por subir: solo se ven con `next dev` o MOSTRAR_BORRADORES=true (recuadro gris en el bloque 6). `npm run capturas` las lista.
  capturasPendientes: [
    {
      archivo: "prueba-01.webp",
      etiqueta: "Prueba real",
      muestra: "Chat nuevo: la respuesta de la IA al prompt de esta página con las ventas de Verde Hogar (ficticio) y los conteos ya hechos por la página. Debe verse la separación entre dato e hipótesis, lo que hay que verificar y las tres decisiones posibles.",
    },
  ],

  checklist: [
    "El total de control dice «Sí»: la suma por producto es igual al total.",
    "Cada cifra del análisis aparece en los cálculos de la página; ninguna es una cuenta nueva de la IA.",
    "Toda explicación dice «hipótesis», sin un peso que mis datos no muestran.",
    "Comparé períodos comparables: días abiertos, promociones y cambios de precio.",
    "Sé qué datos faltan y no decidí con eso pendiente; no compartí datos de clientes y, si hay dinero importante o impuestos, consulté a un contador.",
  ],

  porQueFunciona: [
    {
      titulo: "Calcular, interpretar y decidir son tres trabajos",
      texto: "Sumar tiene una única respuesta correcta, y la página la da siempre. Interpretar es leer los números y ver qué llama la atención, y ahí ayuda la IA. Decidir depende de tu negocio y no se delega.",
    },
    {
      titulo: "Una hipótesis no es una causa",
      texto: "«Bajó porque terminó la promoción» es una hipótesis. Solo será una causa si compruebas que la promoción movía esas ventas. El prompt exige al menos dos explicaciones por observación y cómo comprobar cada una.",
    },
    {
      titulo: "Compara de forma justa",
      texto: "Un mes con tres días de cierre no se compara con uno completo sin ajustar. Por eso pides contar lo que pasó en cada período y la página muestra el promedio por día con ventas, no solo el total.",
    },
    {
      titulo: "Con pocos datos no hay tendencia",
      texto: "Dos o tres meses sirven para observar y preguntar, no para afirmar temporadas. El prompt lo dice en cada respuesta: lo que no se puede afirmar con estos datos.",
    },
  ],

  rubros: [
    {
      rubro: "Restaurante",
      ejemplo: "Fonda El Sabor (ficticia): tabla de platos vendidos por día. Contexto: la primera semana llovió cuatro días. La página muestra el promedio por día con ventas; la IA propone hipótesis (lluvia, menú, horario) y qué comprobar de cada una.",
      consejo: "Anota el clima, los feriados y los cambios de carta en «lo que pasó»: son las diferencias que la tabla no muestra.",
    },
    {
      rubro: "Tienda",
      ejemplo: "Boutique Aldea (ficticia): ventas por producto en dos meses. Contexto: en el segundo mes se acabó la talla M de una camiseta que se vendía mucho. La IA plantea si la caída es de demanda o de stock, y qué dato lo distinguiría.",
      consejo: "Sin registro de faltantes de stock no puedes separar «se vendió menos» de «no había»: empieza a anotarlos.",
    },
    {
      rubro: "Servicios",
      ejemplo: "Estudio de uñas Brillo (ficticio): servicios por día con sus montos. Contexto: dos semanas con menos cupos por vacaciones de una estilista. La comparación justa es por día con ventas y por cupos disponibles.",
      consejo: "En servicios cambia «producto» por «servicio» en la tabla. Las cuentas y la lectura son las mismas.",
    },
  ],

  errores: [
    {
      error: "Pegar las ventas sueltas sin resumen",
      solucion: "Con cientos de filas, la IA mezcla cálculo y lectura y puede equivocarse. Aquí la página resume; tú pegas la tabla sin datos de clientes.",
    },
    {
      error: "Aceptar un «porque» sin comprobar",
      solucion: "Una explicación razonable no es cierta: puedes repetir una promoción por un motivo equivocado. Mantén varias hipótesis abiertas y comprueba cada una.",
    },
    {
      error: "Comparar períodos desiguales",
      solucion: "Un mes con menos días abiertos o con promoción no es comparable con uno normal. Compara por día y anota lo que hizo distinto a cada período.",
    },
    {
      error: "Hablar de tendencias con pocos datos",
      solucion: "En meses sueltos, un cambio pequeño parece tendencia y un porcentaje alto puede ser dos ventas de diferencia. Trabaja con cantidades y di lo que aún no se puede saber.",
    },
  ],

  faq: [
    { p: "¿Cuántos meses de datos necesito?", r: "Dos o tres meses sirven para observar y plantear preguntas. Para hablar de temporadas necesitas al menos un año, y aun así conviene tomarlo con cuidado." },
    { p: "¿Qué hago si mis datos están desordenados?", r: "Empieza por ordenarlos: una fila por venta, las mismas columnas y un solo nombre por producto. Si el desorden es muy grande, empieza con un mes y amplía después." },
    { p: "¿Sirve si vendo servicios y no productos?", r: "Sí: cambia «producto» por «servicio» en la tabla. Las cuentas y la lectura son las mismas." },
    { p: "¿Qué formato de fecha entiende la página?", r: "AAAA-MM-DD (2026-09-07) o DD/MM/AAAA (07/09/2026). Si alguna fecha no se entiende, la página no reparte por mes y lo indica." },
    { p: "¿Puede la IA decirme qué debo hacer?", r: "No decide por ti. Plantea hipótesis, dice cómo comprobarlas y ofrece decisiones posibles, y tú eliges cuando hayas comprobado lo que falta." },
    { p: "¿Reemplaza a un contador?", r: "No. Sirve para entender ventas, no para impuestos, contabilidad o decisiones financieras importantes." },
  ],

  relacionadas: ["marketing/crear-promociones-con-ia", "ventas/calcular-precios-y-margenes"],

  metodoCompleto: {
    titulo: "Método completo: el resumen, la rúbrica y los límites",
    parrafos: [
      "**El resumen que calcula la página.** Con tu tabla, la página cuenta las ventas leídas, los días distintos con ventas, el total vendido, las unidades, el promedio por día con ventas, el total por mes (con sus días con ventas y su promedio por día) y el total de cada producto con su parte del total. Al final, un total de control comprueba que la suma por producto es igual al total: si dice «No», hay una línea mal leída.",
      "**El caso completo.** En Verde Hogar (ficticio) se analizan cinco productos en agosto y septiembre. En agosto, la maceta costó 5 en lugar de 6 todo el mes; en septiembre la tienda cerró 3 días por una reforma (27 días abiertos) y no hubo promoción. El total de septiembre es menor, pero también tuvo menos días de venta: por eso el promedio por día con ventas importa más que el total. Aun así, con dos meses no se puede hablar de tendencia.",
      "**Cómo separar hechos de hipótesis.** Un hecho sale de las cifras («septiembre vendió menos que agosto»). Una hipótesis explica el hecho («bajó porque se acabó la promoción de la maceta» o «bajó porque hubo tres días cerrado»). Para cada hipótesis, la IA dice qué dato la confirmaría o la descartaría: por ejemplo, las ventas de maceta a $6 en septiembre, o las ventas por día abierto de agosto.",
      "**Cómo preparar tu tabla.** Exporta tus ventas de la hoja o del sistema de caja con una fila por venta y cuatro columnas: fecha, producto, cantidad y monto. Usa un solo nombre por producto («Maceta», no «maceta» y «Macetas»), porque la página los cuenta por nombre. Si una venta tiene varios productos, sepárala en una línea por producto. Quita los nombres de clientes: no hacen falta para el análisis.",
      "**Cómo contar lo que pasó.** La tabla no muestra que cerraste tres días, que bajaste un precio o que se agotó un producto. Anótalo en «Lo que pasó en cada período», con fechas si puedes. Es el dato más valioso del análisis: sin él, la IA solo puede plantear explicaciones genéricas y tú no puedes comparar de forma justa.",
      "**Rúbrica de seis criterios** para revisar la lectura de la IA (0, 1 o 2 puntos cada uno): cada cifra está en tu resumen; separa hechos de hipótesis; ofrece alternativas; compara de forma justa; dice cómo comprobar; dice lo que no se puede afirmar.",
      "**Lo que este método no hace.** No encuentra causas (solo propone explicaciones posibles), con pocos datos no hay conclusiones, depende de que tú cuentes lo que pasó en cada período y no sustituye a un contador.",
    ],
  },
});
