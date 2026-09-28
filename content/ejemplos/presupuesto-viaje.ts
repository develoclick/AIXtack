import type { DatosPresupuesto } from "@/lib/presupuesto/tipos";
import { DATOS_FAMILIA_PARACAS, DATOS_PAREJA_CUSCO, DATOS_SOLO_SANTIAGO } from "./presupuesto-viaje-datos";

export interface EjemploPresupuesto {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosPresupuesto;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. Solo usa cifras de los datos. */
  respuesta: string;
}

const CUSCO = `## Revisión de coherencia
- Las comidas están calculadas «por persona y día» (2 viajeros durante 6 días), que es la unidad correcta: no hay comidas contadas por viaje.
- Los vuelos están «por viaje» y marcados como conocidos: confirma que el monto es el total de los 2 pasajes y no el precio de uno solo.
- «Entradas a sitios turísticos» está «por viaje»: comprueba que cubra las entradas de las 2 personas en todos los sitios que piensas visitar.
- No veo líneas duplicadas.
- Faltan varias categorías: seguro de viaje, equipaje, compras y recuerdos, conectividad, propinas y comisiones bancarias (ver la sección siguiente).
- [SUPUESTO] Asumo que el alojamiento no incluye desayuno; si lo incluye, el gasto de comidas podría bajar.

## Gastos que faltan
- Seguro de viaje | Seguro de viaje | Cubre imprevistos médicos o cancelaciones, y ya tienes los vuelos pagados o por pagar | Páginas de las aseguradoras: compara coberturas y exclusiones, no solo el precio
- Equipaje | Equipaje de bodega o adicional | Algunas tarifas de vuelo no incluyen maleta y el cargo aparece al final de la compra | Condiciones de tu tarifa en la página de la aerolínea
- Propinas | Propinas | Aplican en restaurantes o con guías, según la costumbre del lugar | Guías de viajeros locales o consulta a tu alojamiento
- Conectividad | SIM o eSIM con datos | Ayuda a moverte y a pedir transporte sin depender del wifi | Tu operador o las tiendas de SIM del destino
- Comisiones bancarias y de cambio | Comisión por pagar con tarjeta o retirar en cajero | Se paga en cada compra y no se ve hasta el estado de cuenta | Tarifario de tu banco o de tu tarjeta
- Compras y recuerdos | Recuerdos (con tope) | Suelen aparecer al final del viaje y no estaban en el plan | No necesita consulta: define tú un tope y márcalo como opcional

## Necesidades vs extras
- Necesidad: Vuelos (Transporte principal) — sin ellos no hay viaje.
- Necesidad: Alojamiento — las 5 noches ya están cotizadas.
- Necesidad: Comidas — se come todos los días; lo que puedes ajustar es el gasto diario.
- Necesidad: Traslados y transporte local — hacen falta, aunque sus montos son solo estimados.
- Extra: Parte de las entradas (Actividades y entradas) — prioriza los sitios que más quieres ver; el resto es prescindible.
- Extra: Compras y recuerdos — todavía no está en la tabla; si los quieres, agrégalos como opcional con un tope.

## Ideas de ahorro
- Hacer un almuerzo sencillo y una cena más tranquila | Comidas | Cambia el ritmo de las comidas, no el destino ni las actividades
- Elegir un alojamiento con desayuno incluido | Alojamiento y comidas | Puede obligar a aceptar otra ubicación
- Priorizar las entradas de los 2 o 3 sitios que más te interesan | Actividades y entradas | Se visitan menos lugares
- Reservar el traslado con el alojamiento o comparar opciones antes de llegar | Traslados | Hay que coordinarlo con anticipación
- Caminar los tramos cortos en lugar de tomar taxi | Transporte local | Requiere más tiempo y esfuerzo

## Margen de imprevistos
Veredicto: Razonable
Tu margen es de 10 % del subtotal. El 28.9 % del total es estimado (comidas, traslados y transporte local) frente a un 62 % conocido, y con esa proporción la referencia práctica de la página es 10–15 %: estás en el mínimo aceptable. [HIPÓTESIS] Si confirmas con precios reales los 3 gastos estimados antes de reservar, este margen alcanza; si no, conviene subirlo.

## Antes de reservar
- Confirma el precio total de los vuelos para los 2 pasajeros y las condiciones de equipaje y de cambios.
- Pregunta al alojamiento si el desayuno está incluido y si ofrece traslado desde el aeropuerto.
- Consulta en las páginas oficiales las entradas de los sitios que vas a visitar (precios, horarios y días de cierre).
- Agrega a la tabla las líneas de seguro, equipaje, propinas, conectividad y comisiones, aunque sea con un monto provisional.
- Lee la política de cancelación de cada reserva antes de pagar.

## Qué debes verificar
- Que los montos conocidos (vuelos, hostal y entradas) sigan vigentes en su fuente el día en que reserves.
- Que el precio del hostal sea por habitación y no por persona.
- Cualquier tarifa, horario o requisito de los sitios turísticos: consúltalo solo en fuentes oficiales.
- Que los gastos de «Gastos que faltan» realmente apliquen a tu viaje.

## Siguiente paso
- Añade a tu tabla las líneas que faltan y revisa de nuevo el total.
- Confirma con precios reales los gastos estimados antes de reservar.`;

const PARACAS = `\`\`\`
## Revisión de coherencia
- «Paseo en bote» está «por persona» y multiplica por los 4 viajeros: si los niños pagan otra tarifa o no pagan, divide la línea en adultos y niños.
- Las comidas están «por persona y día» (4 viajeros durante 4 días), unidad correcta. [SUPUESTO] Asumo el mismo gasto diario para adultos y niños; puede ser menor para los niños.
- «Combustible y peajes» es una estimación y está en «Transporte principal». Es la línea más fácil de convertir en conocida consultando la ruta y las tarifas de los peajes.
- No hay líneas de traslados ni de transporte local: confirma que solo usarán su auto durante el viaje.
- Faltan seguro, propinas, comisiones y algunos cargos del alojamiento.

## Gastos que faltan
- Seguro de viaje | Seguro de viaje o asistencia | Con niños conviene revisar qué cubre la asistencia médica | Páginas de las aseguradoras y de tu propio seguro, si ya tienes uno
- Alojamiento | Cargos del alojamiento (limpieza, depósito de garantía) | El precio por noche puede no incluir todo lo que se paga al final | Resumen final de la reserva y condiciones del alojamiento
- Transporte local | Taxis o mototaxis dentro del destino | Si dejan el auto estacionado, algunos trayectos cortos pueden hacerse en transporte local | Tarifas que informe el alojamiento o el transporte del lugar
- Propinas | Propinas | Restaurantes y servicios turísticos, según la costumbre del lugar | Consulta a tu alojamiento o a guías de viajeros locales
- Otros gastos | Revisión del auto antes de salir | Un viaje por carretera puede requerir revisar llantas, frenos o combustible previamente | Un taller de confianza

## Necesidades vs extras
- Necesidad: Combustible y peajes (Transporte principal) — es la única forma de llegar en auto propio.
- Necesidad: Bungalow familiar (Alojamiento) — las 3 noches ya están cotizadas.
- Necesidad: Comidas — para los 4 viajeros durante los 4 días.
- Extra: Paseo en bote (Actividades y entradas) — es la actividad central del viaje, pero prescindible si el presupuesto se ajusta.
- Extra: Recuerdos y juguetes (Compras y recuerdos) — ya está marcado como opcional con un tope.

## Ideas de ahorro
- Preparar algunos desayunos o snacks en el bungalow, si tiene cocina | Comidas | Menos comidas fuera, con algo más de trabajo
- Llevar bebidas y meriendas desde Lima | Comidas | Ocupa espacio en el auto
- Preguntar si el paseo en bote tiene tarifa para niños | Actividades y entradas | Ninguna, si existe la tarifa; requiere consultar
- Bajar el tope de recuerdos o pedirles a los niños que elijan uno solo | Compras y recuerdos | Menos compras durante el viaje
- Comparar el bungalow con otras opciones de la misma zona antes de reservar | Alojamiento | Puede cambiar la ubicación o las comodidades

## Margen de imprevistos
Veredicto: Razonable
Elegiste 15 % del subtotal. El 38.9 % del total es estimado frente a un 42.3 % conocido, y la referencia práctica de la página para esa proporción es 10–15 %: estás en el extremo alto, lo que tiene sentido al viajar con niños. [HIPÓTESIS] Si conviertes el combustible y las comidas en cifras más firmes, podrías bajarlo, pero no es necesario.

## Antes de reservar
- Consulta la ruta y las tarifas de los peajes para convertir el combustible y los peajes en un monto más firme.
- Confirma en el alojamiento el precio final, los cargos adicionales y si admiten 4 personas en el bungalow.
- Pregunta al operador del paseo si hay tarifa para niños.
- Revisa la política de cancelación del alojamiento.
- Agrega a la tabla las líneas de seguro, propinas y transporte local, aunque sea con un monto provisional.

## Qué debes verificar
- Que el precio del bungalow sea por noche y no por persona, y que admita a los 4 viajeros.
- Que la tarifa del paseo en bote sea igual para adultos y niños.
- Las condiciones de la ruta y de los peajes en fuentes oficiales.
- Que los gastos de «Gastos que faltan» apliquen a tu viaje.

## Siguiente paso
- Añade a tu tabla las líneas que faltan y revisa de nuevo el total.
- Convierte los gastos estimados en precios reales antes de reservar.
\`\`\``;

const SANTIAGO = `## Revisión de coherencia
- Casi todas las líneas están en USD y se convierten con el tipo de cambio que escribiste (1 USD = 3.75 S/): ese dato es tuyo, comprueba que se parezca al que aplicará tu banco o tu casa de cambio.
- Comidas y transporte local están «por persona y día» (1 viajero durante 8 días), unidad correcta.
- «Hostal, cama en dormitorio compartido» está «por noche»: con 1 viajero está bien; si viajara alguien más habría que cambiarla a «por persona y día».
- Las líneas marcadas como conocidas tienen fuente y fecha de consulta. Buen respaldo.
- Faltan traslados, equipaje, propinas y comisiones bancarias y de cambio.

## Gastos que faltan
- Traslados | Traslado aeropuerto ↔ alojamiento | Es el primer y el último trayecto del viaje y no está en la tabla | Empresas de transporte del aeropuerto o el propio alojamiento
- Equipaje | Maleta de bodega | Algunas tarifas de vuelo no la incluyen | Condiciones de tu tarifa en la página de la aerolínea
- Documentos y trámites | Requisitos y tasas de entrada, si los hubiera | Depende de tu nacionalidad y del destino | Página oficial de migraciones del país de destino
- Comisiones bancarias y de cambio | Comisión por pagar con tarjeta, por retirar en cajero y por cambiar moneda | Como casi todo está en USD, esto se paga varias veces | Tarifario de tu banco o de tu tarjeta
- Propinas | Propinas | Restaurantes y servicios, según la costumbre del lugar | Guías de viajeros locales

## Necesidades vs extras
- Necesidad: Vuelo, alojamiento y comidas — forman el núcleo del viaje.
- Necesidad: Seguro de viaje (ya incluido) y transporte local.
- Necesidad: eSIM (Conectividad) — para moverte y pedir transporte sin depender del wifi, aunque puedes usar solo wifi.
- Extra: Excursión de un día (Actividades y entradas) — prescindible si el presupuesto aprieta.
- Extra: Compras y recuerdos — ya está marcado como opcional con un tope.

## Ideas de ahorro
- Elegir hostales con cocina compartida y preparar algunas comidas | Comidas | Menos comidas en restaurantes
- Comparar hostales cercanos a estaciones de metro | Alojamiento y transporte local | Puede cambiar la ubicación
- Decidir si necesitas la eSIM o si el wifi del hostal te alcanza | Conectividad | Menos conexión fuera del alojamiento
- Comparar más de una excursión antes de reservar | Actividades y entradas | Requiere tiempo de búsqueda
- Pagar con una tarjeta sin comisión por compras en el extranjero, si tu banco la ofrece | Comisiones bancarias y de cambio | Ninguna; depende de las condiciones de tu banco

## Margen de imprevistos
Veredicto: Razonable
Elegiste 12 % del subtotal. El 28.2 % del total es estimado frente a un 58.2 % conocido, y la referencia práctica de la página es 10–15 %: tu margen está dentro del rango. Como casi todo está en USD, un cambio en el tipo de cambio que escribiste afectaría a casi todo el presupuesto. [HIPÓTESIS] Si el tipo de cambio real fuera más alto que el tuyo, el margen se consumiría antes.

## Antes de reservar
- Confirma el tipo de cambio con tu banco o casa de cambio y actualiza el dato si difiere.
- Agrega las líneas de traslados, equipaje, propinas y comisiones, aunque sea con un monto provisional.
- Revisa en la página oficial de migraciones si hay algún requisito de entrada para tu nacionalidad.
- Verifica las condiciones de cancelación del vuelo y del hostal.
- Compara al menos dos opciones de excursión.

## Qué debes verificar
- El tipo de cambio: es un dato tuyo y no fue verificado.
- Que los precios conocidos sigan vigentes en su fuente el día en que reserves.
- Cualquier requisito de entrada, tasa o documento del destino: consúltalo solo en fuentes oficiales.

## Siguiente paso
- Añade a tu tabla las líneas que faltan y revisa de nuevo el total.
- Confirma el tipo de cambio antes de reservar.`;

export const EJEMPLOS_PRESUPUESTO: EjemploPresupuesto[] = [
  { id: "pareja-cusco", etiqueta: "Pareja · Cusco · 5 noches", descripcion: "2 adultos, gastos por viaje, por noche y por persona y día.", datos: DATOS_PAREJA_CUSCO, respuesta: CUSCO },
  { id: "familia-paracas", etiqueta: "Familia · Paracas · 3 noches", descripcion: "2 adultos y 2 niños, en auto propio, con un gasto opcional.", datos: DATOS_FAMILIA_PARACAS, respuesta: PARACAS },
  { id: "solo-santiago", etiqueta: "Viaje solo · Santiago · 7 noches", descripcion: "Precios en USD convertidos con un tipo de cambio ficticio.", datos: DATOS_SOLO_SANTIAGO, respuesta: SANTIAGO },
];
