"use client";

import { Coins, Lock, Plane, Plus, Trash2 } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { almacenPresupuesto } from "./almacen";
import { calcular, diasDelViaje, formatoDinero, nochesDelViaje, parsearNumero, type Calculo } from "@/lib/presupuesto/calculo";
import { CATEGORIAS_GASTO, categoriaPorId, lineaVacia, TIPOS, UNIDADES, type CategoriaId, type DatosPresupuesto, type Linea } from "@/lib/presupuesto/tipos";

const MONEDAS = ["S/", "USD", "EUR", "CLP", "COP", "MXN", "ARS", "BRL", "BOB"];

/** Mensaje junto al campo cuando lo escrito no es un número válido (vacío no es error: los obligatorios se avisan en «Ver qué falta»). */
const errorNumero = (s: string, { entero = false, minimo = 0 }: { entero?: boolean; minimo?: number } = {}) => {
  if (!s.trim()) return undefined;
  const n = parsearNumero(s);
  if (n === null) return "Escribe un número, por ejemplo 150 o 150.50.";
  if (entero && !Number.isInteger(n)) return "Usa un número entero.";
  if (n < minimo) return `El mínimo es ${minimo}.`;
  return undefined;
};

function Mensaje({ id, texto }: { id: string; texto?: string }) {
  return texto ? (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {texto}
    </p>
  ) : null;
}

function EditorDeLinea({ linea, indice, calculo, hayAlterna, monedaPrincipal, monedaAlterna, alCambiar, alQuitar }: {
  linea: Linea;
  indice: number;
  calculo: Calculo;
  hayAlterna: boolean;
  monedaPrincipal: string;
  monedaAlterna: string;
  alCambiar: (cambios: Partial<Linea>) => void;
  alQuitar: () => void;
}) {
  const cl = calculo.lineas[indice];
  const nombre = linea.concepto.trim() || categoriaPorId(linea.categoria).nombre;
  const errMonto = errorNumero(linea.monto);
  const errMin = errorNumero(linea.minimo);
  const errMax = errorNumero(linea.maximo);
  const moneda = linea.enAlterna ? monedaAlterna || "moneda alterna" : monedaPrincipal;

  return (
    <li className="tarjeta space-y-3 p-4" data-linea>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Gasto {indice + 1}
          <span className="ml-2 font-normal text-muted-foreground">{categoriaPorId(linea.categoria).naturaleza === "fijo" ? "fijo" : "variable"}</span>
        </p>
        <button type="button" onClick={alQuitar} className="btn btn-texto -mr-2" aria-label={`Quitar el gasto «${nombre}»`}>
          <Trash2 aria-hidden className="size-4" /> Quitar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Categoría">
          {(id) => (
            <select
              id={id}
              className="campo"
              value={linea.categoria}
              onChange={(e) => {
                const categoria = e.target.value as CategoriaId;
                alCambiar(linea.monto.trim() ? { categoria } : { categoria, unidad: categoriaPorId(categoria).unidad });
              }}
            >
              {CATEGORIAS_GASTO.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo etiqueta="Concepto" ayuda="Qué es este gasto, con tus palabras.">
          {(id, ay) => <input id={id} aria-describedby={ay} className="campo" value={linea.concepto} onChange={(e) => alCambiar({ concepto: e.target.value })} placeholder="Ej.: Hostal, habitación doble" />}
        </Campo>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta={`Monto (${moneda})`}>
          {(id) => (
            <>
              <input id={id} inputMode="decimal" className="campo tabular" value={linea.monto} onChange={(e) => alCambiar({ monto: e.target.value })} placeholder="0.00" aria-invalid={Boolean(errMonto)} aria-describedby={errMonto ? `${id}-err` : undefined} />
              <Mensaje id={`${id}-err`} texto={errMonto} />
            </>
          )}
        </Campo>
        <Campo etiqueta="Unidad">
          {(id) => (
            <select id={id} className="campo" value={linea.unidad} onChange={(e) => alCambiar({ unidad: e.target.value as Linea["unidad"] })}>
              {UNIDADES.map((u) => (
                <option key={u.valor} value={u.valor}>
                  {u.etiqueta}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo etiqueta="Tipo" className={hayAlterna ? undefined : "col-span-2"}>
          {(id) => (
            <select id={id} className="campo" value={linea.tipo} onChange={(e) => alCambiar({ tipo: e.target.value as Linea["tipo"] })}>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          )}
        </Campo>
        {hayAlterna && (
          <Campo etiqueta="Moneda">
            {(id) => (
              <select id={id} className="campo" value={linea.enAlterna ? "alterna" : "principal"} onChange={(e) => alCambiar({ enAlterna: e.target.value === "alterna" })}>
                <option value="principal">{monedaPrincipal}</option>
                <option value="alterna">{monedaAlterna || "Alterna"} (se convierte)</option>
              </select>
            )}
          </Campo>
        )}
      </div>

      <p className={`text-sm tabular ${cl.problema ? "font-medium text-warn" : "text-muted-foreground"}`} data-formula>
        {cl.total !== null ? (
          <>
            <span className="font-semibold text-foreground">= {formatoDinero(cl.total, monedaPrincipal)}</span> <span>({cl.formula}{linea.enAlterna && calculo.tipoCambio ? ` × ${calculo.tipoCambio} de tipo de cambio` : ""})</span>
          </>
        ) : (
          cl.problema ?? (linea.monto.trim() ? "" : "Escribe el monto para que se sume.")
        )}
      </p>

      <details className="rounded-lg border bg-surface p-3 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold">Fuente, fecha y rango (opcional)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Fuente o enlace" ayuda={linea.tipo === "conocido" ? "Recomendado: dónde viste el precio." : "Dónde viste o cómo calculaste el precio."}>
            {(id, ay) => <input id={id} aria-describedby={ay} className="campo" value={linea.fuente} onChange={(e) => alCambiar({ fuente: e.target.value })} placeholder="Ej.: página del hostal" />}
          </Campo>
          <Campo etiqueta="Fecha de consulta" ayuda="Los precios cambian: anota cuándo lo viste.">
            {(id, ay) => <input id={id} aria-describedby={ay} type="date" className="campo" value={linea.fecha} onChange={(e) => alCambiar({ fecha: e.target.value })} />}
          </Campo>
          <Campo etiqueta="Mínimo (escenario económico)">
            {(id) => (
              <>
                <input id={id} inputMode="decimal" className="campo tabular" value={linea.minimo} onChange={(e) => alCambiar({ minimo: e.target.value })} placeholder="Opcional" aria-invalid={Boolean(errMin)} aria-describedby={errMin ? `${id}-err` : undefined} />
                <Mensaje id={`${id}-err`} texto={errMin} />
              </>
            )}
          </Campo>
          <Campo etiqueta="Máximo (escenario holgado)">
            {(id) => (
              <>
                <input id={id} inputMode="decimal" className="campo tabular" value={linea.maximo} onChange={(e) => alCambiar({ maximo: e.target.value })} placeholder="Opcional" aria-invalid={Boolean(errMax)} aria-describedby={errMax ? `${id}-err` : undefined} />
                <Mensaje id={`${id}-err`} texto={errMax} />
              </>
            )}
          </Campo>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Si no pones mínimo ni máximo, ese gasto vale lo mismo en los tres escenarios.</p>
      </details>
    </li>
  );
}

export function FormularioPresupuesto({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenPresupuesto.useDatos();
  const modoEjemplo = almacenPresupuesto.useModoEjemplo();
  const c = calcular(d);
  const poner = <K extends keyof DatosPresupuesto>(clave: K, valor: DatosPresupuesto[K]) => almacenPresupuesto.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosPresupuesto) => (e: { target: { value: string } }) => poner(clave, e.target.value as never);
  const cambiarLinea = (id: string, cambios: Partial<Linea>) => poner("lineas", d.lineas.map((l) => (l.id === id ? { ...l, ...cambios } : l)));
  const hayAlterna = d.monedaAlterna.trim() !== "";
  const moneda = d.moneda.trim() || "S/";

  const errNoches = errorNumero(d.noches, { entero: true, minimo: 1 });
  const errAdultos = errorNumero(d.adultos, { entero: true, minimo: 1 });
  const errNinos = errorNumero(d.ninos, { entero: true });
  const errCambio = errorNumero(d.tipoCambio, { minimo: 0.0001 });
  const errImprev = errorNumero(d.imprevistos);
  const errFechas = d.salida && d.regreso && nochesDelViaje({ noches: "", salida: d.salida, regreso: d.regreso }) === null ? "La fecha de regreso debe ser posterior a la de salida." : undefined;
  const nochesCalculadas = nochesDelViaje(d);
  const categoriasSinLinea = CATEGORIAS_GASTO.filter((cat) => cat.id !== "otros" && !d.lineas.some((l) => l.categoria === cat.id));

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos del viaje y tabla de gastos" autoComplete="off">
      <Grupo icono={Plane} titulo="Datos base del viaje" descripcion="Con estos datos la página calcula los gastos por noche, por persona y por día.">
        <Campo etiqueta="Destino" obligatorio ayuda="Ciudad o país; sirve para que la IA entienda el contexto.">
          {(id, ay) => <input id={id} aria-describedby={ay} className="campo" value={d.destino} onChange={texto("destino")} placeholder="Ej.: Cusco (Perú), saliendo de Lima" />}
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Fecha de salida">
            {(id) => <input id={id} type="date" className="campo" value={d.salida} onChange={texto("salida")} />}
          </Campo>
          <Campo etiqueta="Fecha de regreso">
            {(id) => (
              <>
                <input id={id} type="date" className="campo" value={d.regreso} onChange={texto("regreso")} aria-invalid={Boolean(errFechas)} aria-describedby={errFechas ? `${id}-err` : undefined} />
                <Mensaje id={`${id}-err`} texto={errFechas} />
              </>
            )}
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Noches" obligatorio ayuda="Si eliges las dos fechas, se calculan solas; si escribes las noches, tienen prioridad.">
            {(id, ay) => (
              <>
                <input id={id} inputMode="numeric" className="campo tabular" value={d.noches} onChange={texto("noches")} placeholder={nochesCalculadas && !d.noches ? String(nochesCalculadas) : "Ej.: 5"} aria-invalid={Boolean(errNoches)} aria-describedby={[ay, errNoches ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined} />
                <Mensaje id={`${id}-err`} texto={errNoches} />
              </>
            )}
          </Campo>
          <Campo etiqueta="Días de viaje (opcional)" ayuda={`Por defecto: noches + 1${diasDelViaje(d) ? ` (ahora ${diasDelViaje(d)})` : ""}. Cámbialo si llegas o sales de madrugada.`}>
            {(id, ay) => <input id={id} inputMode="numeric" className="campo tabular" value={d.dias} onChange={texto("dias")} aria-describedby={ay} placeholder="Automático" />}
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Adultos" obligatorio ayuda="Cuenta también a quien viaja contigo.">
            {(id, ay) => (
              <>
                <input id={id} inputMode="numeric" className="campo tabular" value={d.adultos} onChange={texto("adultos")} placeholder="Ej.: 2" aria-invalid={Boolean(errAdultos)} aria-describedby={[ay, errAdultos ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined} />
                <Mensaje id={`${id}-err`} texto={errAdultos} />
              </>
            )}
          </Campo>
          <Campo etiqueta="Niños" ayuda="Los gastos «por persona» se multiplican por adultos + niños. Si un niño paga otra tarifa, separa esa línea.">
            {(id, ay) => (
              <>
                <input id={id} inputMode="numeric" className="campo tabular" value={d.ninos} onChange={texto("ninos")} placeholder="0" aria-invalid={Boolean(errNinos)} aria-describedby={[ay, errNinos ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined} />
                <Mensaje id={`${id}-err`} texto={errNinos} />
              </>
            )}
          </Campo>
        </div>
      </Grupo>

      <Grupo icono={Coins} titulo="Moneda e imprevistos" descripcion="Todo el presupuesto se muestra en la moneda principal.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Moneda del presupuesto" obligatorio ayuda="Símbolo o código: S/, USD, EUR…">
            {(id, ay) => (
              <>
                <input id={id} list="monedas-presupuesto" className="campo" value={d.moneda} onChange={texto("moneda")} aria-describedby={ay} placeholder="S/" />
                <datalist id="monedas-presupuesto">
                  {MONEDAS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </>
            )}
          </Campo>
          <Campo etiqueta="Imprevistos (% del subtotal)" ayuda="Colchón para lo que no previste. Por defecto, 10.">
            {(id, ay) => (
              <>
                <input id={id} inputMode="decimal" className="campo tabular" value={d.imprevistos} onChange={texto("imprevistos")} aria-invalid={Boolean(errImprev)} aria-describedby={[ay, errImprev ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined} />
                <Mensaje id={`${id}-err`} texto={errImprev} />
              </>
            )}
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Moneda alterna (opcional)" ayuda="Si algunos precios los ves en otra moneda, por ejemplo USD.">
            {(id, ay) => <input id={id} list="monedas-presupuesto" className="campo" value={d.monedaAlterna} onChange={texto("monedaAlterna")} aria-describedby={ay} placeholder="Ej.: USD" />}
          </Campo>
          <Campo etiqueta={`Tipo de cambio: 1 ${d.monedaAlterna.trim() || "alterna"} = ? ${moneda}`} ayuda="Escríbelo tú, con el valor que te dé tu banco o casa de cambio. No lo consultamos.">
            {(id, ay) => (
              <>
                <input id={id} inputMode="decimal" className="campo tabular" value={d.tipoCambio} onChange={texto("tipoCambio")} placeholder="Ej.: 3.75" aria-invalid={Boolean(errCambio)} aria-describedby={[ay, errCambio ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined} disabled={!hayAlterna} />
                <Mensaje id={`${id}-err`} texto={errCambio} />
              </>
            )}
          </Campo>
        </div>
      </Grupo>

      <fieldset className="min-w-0 space-y-3">
        <legend className="sr-only">Tabla de gastos</legend>
        <div>
          <h3 className="text-lg font-semibold leading-tight">Tus gastos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Un gasto por línea. Marca cada uno como <strong className="font-semibold text-foreground">conocido</strong> (precio real que encontraste), <strong className="font-semibold text-foreground">estimado</strong> u <strong className="font-semibold text-foreground">opcional</strong>, y elige la unidad para no equivocarte al multiplicar.
          </p>
        </div>
        <ul className="space-y-3">
          {d.lineas.map((l, i) => (
            <EditorDeLinea
              key={l.id}
              linea={l}
              indice={i}
              calculo={c}
              hayAlterna={hayAlterna}
              monedaPrincipal={moneda}
              monedaAlterna={d.monedaAlterna.trim()}
              alCambiar={(cambios) => cambiarLinea(l.id, cambios)}
              alQuitar={() => poner("lineas", d.lineas.filter((x) => x.id !== l.id))}
            />
          ))}
        </ul>
        {d.lineas.length === 0 && <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Todavía no tienes gastos. Agrega uno o usa «Agregar las categorías que faltan».</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => poner("lineas", [...d.lineas, lineaVacia("otros")])}
          >
            <Plus aria-hidden className="size-4" /> Agregar otro gasto
          </button>
          {categoriasSinLinea.length > 0 && (
            <button type="button" className="btn btn-secundario" onClick={() => poner("lineas", [...d.lineas, ...categoriasSinLinea.map((cat) => lineaVacia(cat.id))])}>
              Agregar las categorías que faltan ({categoriasSinLinea.length})
            </button>
          )}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Lock aria-hidden className="size-4" />
          {modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que escribes se guarda solo en tu navegador, para que no lo pierdas si recargas."}
        </p>
        <button
          type="button"
          className="btn btn-texto"
          onClick={() => {
            if (modoEjemplo || window.confirm("¿Borrar todos los datos del formulario? No se puede deshacer.")) alBorrar();
          }}
        >
          Borrar mis datos
        </button>
      </div>
    </form>
  );
}
