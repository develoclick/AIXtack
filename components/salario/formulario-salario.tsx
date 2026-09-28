"use client";

import { ArrowDown, ArrowUp, Briefcase, Coins, FileText, ListOrdered, Lock, Plus, Scale, Target, Trash2 } from "lucide-react";
import { Campo, Grupo } from "@/components/prompts/campo-formulario";
import { almacenSalario } from "./almacen";
import { formatoDinero, formatoPorcentaje, parsearNumero } from "@/lib/presupuesto/calculo";
import { calcularOferta, CIFRAS, contextoDe, evaluarCifras } from "@/lib/salario/calculo";
import { MODALIDADES, nuevoId, PRIORIDADES, TIPOS_VARIABLE, type Beneficio, type DatosSalario, type IdPrioridad, type Oferta, type Referencia } from "@/lib/salario/tipos";

/** Mensaje junto al campo cuando lo escrito no es un número válido (vacío no es error: los obligatorios se avisan en «Ver qué falta»). */
const errorNumero = (s: string, { entero = false, minimo = 0 }: { entero?: boolean; minimo?: number } = {}) => {
  if (!s.trim()) return undefined;
  const n = parsearNumero(s);
  if (n === null) return "Escribe un número, por ejemplo 4000 o 4,000.50.";
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

/** Campo numérico con su error junto al campo. */
function Numero({ etiqueta, valor, alCambiar, ayuda, placeholder, obligatorio, entero, minimo }: { etiqueta: string; valor: string; alCambiar: (v: string) => void; ayuda?: string; placeholder?: string; obligatorio?: boolean; entero?: boolean; minimo?: number }) {
  const err = errorNumero(valor, { entero, minimo });
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} obligatorio={obligatorio}>
      {(id, ay) => (
        <>
          <input id={id} inputMode="decimal" className="campo tabular" value={valor} onChange={(e) => alCambiar(e.target.value)} placeholder={placeholder} aria-invalid={Boolean(err)} aria-describedby={[ay, err ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined} />
          <Mensaje id={`${id}-err`} texto={err} />
        </>
      )}
    </Campo>
  );
}

function Texto({ etiqueta, valor, alCambiar, ayuda, placeholder, obligatorio, largo }: { etiqueta: string; valor: string; alCambiar: (v: string) => void; ayuda?: string; placeholder?: string; obligatorio?: boolean; largo?: boolean }) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} obligatorio={obligatorio}>
      {(id, ay) =>
        largo ? (
          <textarea id={id} aria-describedby={ay} className="campo min-h-24" value={valor} onChange={(e) => alCambiar(e.target.value)} placeholder={placeholder} />
        ) : (
          <input id={id} aria-describedby={ay} className="campo" value={valor} onChange={(e) => alCambiar(e.target.value)} placeholder={placeholder} />
        )
      }
    </Campo>
  );
}

function EditorDeOferta({ oferta, alCambiar, d }: { oferta: Oferta; alCambiar: (c: Partial<Oferta>) => void; d: DatosSalario }) {
  const moneda = d.moneda.trim() || "S/";
  const cambiarBeneficio = (id: string, c: Partial<Beneficio>) => alCambiar({ beneficios: oferta.beneficios.map((b) => (b.id === id ? { ...b, ...c } : b)) });
  const tipoVariable = TIPOS_VARIABLE.find((t) => t.valor === oferta.variableTipo)!;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Numero etiqueta={`Salario fijo mensual bruto (${moneda})`} valor={oferta.fijo} alCambiar={(v) => alCambiar({ fijo: v })} obligatorio ayuda="Antes de descuentos, tal como figura en la oferta." placeholder="Ej.: 4000" minimo={0} />
        <Numero etiqueta="Pagos al año" valor={oferta.pagos} alCambiar={(v) => alCambiar({ pagos: v })} obligatorio entero minimo={1} ayuda="12, 14, 15… Pregunta cuáles son las gratificaciones o pagos extra." placeholder="14" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Variable o bonos">
          {(id) => (
            <select id={id} className="campo" value={oferta.variableTipo} onChange={(e) => alCambiar({ variableTipo: e.target.value as Oferta["variableTipo"] })}>
              {TIPOS_VARIABLE.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          )}
        </Campo>
        {oferta.variableTipo !== "ninguno" && <Numero etiqueta={oferta.variableTipo === "porcentaje" ? "Porcentaje del fijo anual (%)" : oferta.variableTipo === "sueldos" ? "Número de sueldos" : `Monto anual máximo (${moneda})`} valor={oferta.variableValor} alCambiar={(v) => alCambiar({ variableValor: v })} ayuda={tipoVariable.ayuda} placeholder="Ej.: 1" />}
      </div>
      {oferta.variableTipo !== "ninguno" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Numero etiqueta="% del variable que consideras seguro" valor={oferta.variableSeguro} alCambiar={(v) => alCambiar({ variableSeguro: v })} ayuda="Escenario conservador. 0 % si depende de metas que no conoces." placeholder="0" />
          <Texto etiqueta="Condiciones del variable" valor={oferta.variableCondiciones} alCambiar={(v) => alCambiar({ variableCondiciones: v })} placeholder="Ej.: sujeto a metas trimestrales" ayuda="Copia lo que dice la oferta. Si no lo dice, anótalo como pregunta." />
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Beneficios</legend>
        <p className="text-xs leading-relaxed text-muted-foreground">Valoriza solo lo que usarías de verdad y que te ahorra un gasto. Los no monetarios (capacitación, flexibilidad) se listan pero no suman.</p>
        {oferta.beneficios.length > 0 && (
          <ul className="space-y-3">
            {oferta.beneficios.map((b, i) => (
              <li key={b.id} className="rounded-lg border bg-surface p-3">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <Texto etiqueta={`Beneficio ${i + 1}`} valor={b.nombre} alCambiar={(v) => cambiarBeneficio(b.id, { nombre: v })} placeholder="Ej.: EPS al 50 %" />
                  <Campo etiqueta="Tipo">
                    {(id) => (
                      <select id={id} className="campo" value={b.monetario ? "monetario" : "no"} onChange={(e) => cambiarBeneficio(b.id, { monetario: e.target.value === "monetario" })}>
                        <option value="monetario">Monetario</option>
                        <option value="no">No monetario</option>
                      </select>
                    )}
                  </Campo>
                  {b.monetario ? <Numero etiqueta={`Valor anual (${moneda})`} valor={b.valor} alCambiar={(v) => cambiarBeneficio(b.id, { valor: v })} placeholder="Opcional" /> : <div />}
                </div>
                <button type="button" className="btn btn-texto mt-1" onClick={() => alCambiar({ beneficios: oferta.beneficios.filter((x) => x.id !== b.id) })} aria-label={`Quitar el beneficio ${i + 1}${b.nombre ? `: ${b.nombre}` : ""}`}>
                  <Trash2 aria-hidden className="size-4" /> Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn-secundario" onClick={() => alCambiar({ beneficios: [...oferta.beneficios, { id: nuevoId("b"), nombre: "", valor: "", monetario: true }] })}>
          <Plus aria-hidden className="size-4" /> Agregar beneficio
        </button>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Texto etiqueta="Tipo de contrato" valor={oferta.contrato} alCambiar={(v) => alCambiar({ contrato: v })} placeholder="Ej.: plazo indeterminado" />
        <Texto etiqueta="Jornada" valor={oferta.jornada} alCambiar={(v) => alCambiar({ jornada: v })} placeholder="Ej.: lunes a viernes" />
        <Texto etiqueta="Vacaciones" valor={oferta.vacaciones} alCambiar={(v) => alCambiar({ vacaciones: v })} placeholder="Ej.: 30 días" />
        <Texto etiqueta="Período de prueba" valor={oferta.prueba} alCambiar={(v) => alCambiar({ prueba: v })} placeholder="Ej.: 3 meses" />
      </div>
      <Numero etiqueta="Días presenciales por semana" valor={oferta.diasPresencial} alCambiar={(v) => alCambiar({ diasPresencial: v })} ayuda="Vacío: 5 si eres presencial y 0 si eres remoto. Si eres híbrido, escríbelos." placeholder="Ej.: 3" entero minimo={0} />
    </div>
  );
}

function EditorDeReferencias({ d, poner }: { d: DatosSalario; poner: <K extends keyof DatosSalario>(k: K, v: DatosSalario[K]) => void }) {
  const cambiar = (id: string, c: Partial<Referencia>) => poner("referencias", d.referencias.map((r) => (r.id === id ? { ...r, ...c } : r)));
  const moneda = d.moneda.trim() || "S/";
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Esta herramienta <strong className="font-semibold text-foreground">no tiene cifras de mercado</strong> y no las inventa. Aquí anotas las referencias que tú encontraste (avisos públicos, portales de empleo, conversaciones con personas del rubro), siempre con su fuente y la fecha en que las consultaste.
      </p>
      {d.referencias.length > 0 && (
        <ul className="space-y-3" data-referencias>
          {d.referencias.map((r, i) => {
            const incompleta = (r.monto.trim() || r.fuente.trim() || r.fecha.trim()) && !(parsearNumero(r.monto) && r.fuente.trim() && r.fecha.trim());
            return (
              <li key={r.id} className="rounded-lg border bg-surface p-3">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
                  <Numero etiqueta={`Referencia ${i + 1}: salario mensual bruto (${moneda})`} valor={r.monto} alCambiar={(v) => cambiar(r.id, { monto: v })} placeholder="Ej.: 4300" />
                  <Texto etiqueta="Fuente" valor={r.fuente} alCambiar={(v) => cambiar(r.id, { fuente: v })} placeholder="Ej.: aviso público de un puesto similar" />
                  <Campo etiqueta="Fecha de consulta">{(id) => <input id={id} type="date" className="campo" value={r.fecha} onChange={(e) => cambiar(r.id, { fecha: e.target.value })} />}</Campo>
                </div>
                {incompleta && <p className="mt-2 text-xs font-medium text-warn">Esta referencia está incompleta (falta monto, fuente o fecha): no cuenta para comparar tus cifras.</p>}
                <button type="button" className="btn btn-texto mt-1" onClick={() => poner("referencias", d.referencias.filter((x) => x.id !== r.id))} aria-label={`Quitar la referencia ${i + 1}`}>
                  <Trash2 aria-hidden className="size-4" /> Quitar
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" className="btn btn-secundario" onClick={() => poner("referencias", [...d.referencias, { id: nuevoId("r"), monto: "", fuente: "", fecha: "" }])}>
        <Plus aria-hidden className="size-4" /> Agregar referencia
      </button>
    </div>
  );
}

export function FormularioSalario({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenSalario.useDatos();
  const modoEjemplo = almacenSalario.useModoEjemplo();
  const poner = <K extends keyof DatosSalario>(clave: K, valor: DatosSalario[K]) => almacenSalario.guardar({ ...d, [clave]: valor });
  const texto = (clave: keyof DatosSalario) => (v: string) => poner(clave, v as never);
  const a = calcularOferta(d.ofertaA, contextoDe(d));
  const ev = evaluarCifras(d, a);
  const moneda = d.moneda.trim() || "S/";
  const mover = (i: number, paso: -1 | 1) => {
    const j = i + paso;
    if (j < 0 || j >= d.prioridades.length) return;
    const copia = [...d.prioridades];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    poner("prioridades", copia);
  };
  const etiquetaPrioridad = (id: IdPrioridad) => PRIORIDADES.find((p) => p.id === id)!.etiqueta;

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de la oferta y de tu negociación" autoComplete="off">
      <Grupo icono={Briefcase} titulo="El puesto y tu perfil" descripcion="Los argumentos de la negociación salen solo de lo que escribas aquí.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Cargo" valor={d.cargo} alCambiar={texto("cargo")} obligatorio placeholder="Ej.: Analista de Operaciones" />
          <Texto etiqueta="País y ciudad" valor={d.ubicacion} alCambiar={texto("ubicacion")} obligatorio placeholder="Ej.: Lima, Perú" ayuda="Los impuestos y aportes dependen del país." />
        </div>
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold">
            Modalidad
            <span aria-hidden className="ml-1 text-destructive">
              *
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {MODALIDADES.map((m) => (
              <label key={m.valor} className={`tarjeta flex min-h-11 cursor-pointer items-center gap-2 p-3 text-sm font-semibold transition-colors ${d.modalidad === m.valor ? "border-brand-solid ring-1 ring-brand-solid/40" : ""}`}>
                <input type="radio" name="modalidad" value={m.valor} checked={d.modalidad === m.valor} onChange={() => poner("modalidad", m.valor)} className="size-4 accent-[var(--accent)]" />
                {m.etiqueta}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Texto etiqueta="Nivel" valor={d.nivel} alCambiar={texto("nivel")} obligatorio placeholder="Ej.: Semi senior" />
          <Numero etiqueta="Años de experiencia" valor={d.anios} alCambiar={texto("anios")} obligatorio placeholder="Ej.: 4" minimo={0} />
        </div>
        <Texto etiqueta="Formación" valor={d.formacion} alCambiar={texto("formacion")} placeholder="Ej.: Bachiller en Ingeniería Industrial" />
        <Texto largo etiqueta="Competencias y logros comprobables" valor={d.competencias} alCambiar={texto("competencias")} placeholder={"Ej.:\n- Lideré la migración del inventario a SAP en mi puesto actual."} ayuda="Una línea por logro, solo con hechos que puedas demostrar. No inventes: la IA usará únicamente esto para tus argumentos." />
        <Texto etiqueta="Moneda" valor={d.moneda} alCambiar={texto("moneda")} placeholder="S/" ayuda="Símbolo o código: S/, USD, EUR…" />
      </Grupo>

      <Grupo icono={FileText} titulo={d.comparar ? "La oferta A" : "La oferta"} descripcion="Regístrala tal como la recibiste. Si algo no está claro, déjalo vacío: la IA te dirá qué preguntar.">
        {d.comparar && <Texto etiqueta="Nombre de la oferta A" valor={d.ofertaA.nombre} alCambiar={(v) => poner("ofertaA", { ...d.ofertaA, nombre: v })} placeholder="Oferta A" />}
        <EditorDeOferta oferta={d.ofertaA} alCambiar={(c) => poner("ofertaA", { ...d.ofertaA, ...c })} d={d} />
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" checked={d.comparar} onChange={(e) => poner("comparar", e.target.checked)} />
          <span>
            <span className="font-semibold">Comparar con una segunda oferta</span>
            <span className="block text-xs text-muted-foreground">Verás el valor anual de las dos lado a lado, con la tabla de diferencias.</span>
          </span>
        </label>
      </Grupo>

      {d.comparar && (
        <Grupo icono={Scale} titulo="La oferta B" descripcion="La segunda oferta que quieres comparar. Solo úsala si es real.">
          <Texto etiqueta="Nombre de la oferta B" valor={d.ofertaB.nombre} alCambiar={(v) => poner("ofertaB", { ...d.ofertaB, nombre: v })} placeholder="Oferta B" />
          <EditorDeOferta oferta={d.ofertaB} alCambiar={(c) => poner("ofertaB", { ...d.ofertaB, ...c })} d={d} />
        </Grupo>
      )}

      <Grupo icono={Coins} titulo="Tu situación actual (opcional)" descripcion="No es obligatorio decirla en una negociación; aquí solo sirve para que prepares la respuesta.">
        <Texto etiqueta="Salario actual" valor={d.actualSalario} alCambiar={texto("actualSalario")} placeholder="Ej.: S/ 3,600 brutos mensuales, en 14 pagos" />
        <Texto etiqueta="Beneficios actuales" valor={d.actualBeneficios} alCambiar={texto("actualBeneficios")} placeholder="Ej.: EPS pagada por la empresa" />
      </Grupo>

      <Grupo icono={Scale} titulo="Referencias salariales que tú investigaste" descripcion="Con monto, fuente y fecha. Sin referencias, la herramienta te lo dirá y no comparará tus cifras con nada.">
        <EditorDeReferencias d={d} poner={poner} />
      </Grupo>

      <Grupo icono={Coins} titulo="Costo de ir a trabajar" descripcion="Se resta del valor anual según los días presenciales de cada oferta.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Numero etiqueta={`Transporte por día presencial (${moneda})`} valor={d.transporteDia} alCambiar={texto("transporteDia")} placeholder="Ej.: 12" />
          <Numero etiqueta={`Comida por día presencial (${moneda})`} valor={d.comidaDia} alCambiar={texto("comidaDia")} placeholder="Ej.: 8" />
          <Numero etiqueta="Semanas de trabajo al año" valor={d.semanas} alCambiar={texto("semanas")} entero minimo={1} ayuda="48 si tienes 4 semanas de vacaciones." placeholder="48" />
          <Numero etiqueta="Descuentos que estimas (%) (opcional)" valor={d.descuentoPct} alCambiar={texto("descuentoPct")} ayuda="Solo para ver un neto aproximado. Es tu estimación: no calculamos impuestos ni aportes." placeholder="Ej.: 18" />
        </div>
      </Grupo>

      <Grupo icono={Target} titulo="Tus 3 cifras (salario fijo mensual bruto)" descripcion="Mínimo ≤ objetivo ≤ ancla. Defínelas con tus referencias, no con un impulso.">
        <div className="grid gap-4 sm:grid-cols-3">
          {CIFRAS.map((c) => (
            <Numero key={c.clave} etiqueta={`${c.etiqueta} (${moneda})`} valor={d[c.clave]} alCambiar={texto(c.clave)} ayuda={c.ayuda} placeholder="Ej.: 4600" minimo={0} />
          ))}
        </div>
        <div role="status" aria-live="polite" className="space-y-2 text-sm">
          {ev.problemas.map((p) => (
            <p key={p} role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 font-medium" data-error-cifras>
              {p}
            </p>
          ))}
          {ev.problemas.length === 0 && ev.vsOferta.length > 0 && (
            <ul className="space-y-1 rounded-lg border bg-surface p-3 text-muted-foreground" data-cifras-vs-oferta>
              {ev.vsOferta.map((v) => (
                <li key={v.clave}>
                  <strong className="font-semibold text-foreground">{CIFRAS.find((c) => c.clave === v.clave)!.etiqueta}:</strong> {v.diferencia >= 0 ? "+" : "−"}
                  {formatoDinero(Math.abs(v.diferencia), moneda)} al mes ({v.porcentaje >= 0 ? "+" : "−"}
                  {formatoPorcentaje(Math.abs(v.porcentaje))}) frente al fijo de la oferta{v.impactoAnual !== null ? `; ${v.impactoAnual >= 0 ? "+" : "−"}${formatoDinero(Math.abs(v.impactoAnual), moneda)} al año` : ""}.
                </li>
              ))}
            </ul>
          )}
        </div>
      </Grupo>

      <Grupo icono={ListOrdered} titulo="Tus prioridades" descripcion="Ordénalas de la más a la menos importante. Ayudan a decidir qué negociar si no hay margen en el dinero.">
        <ol className="space-y-2" data-prioridades>
          {d.prioridades.map((p, i) => (
            <li key={p} className="flex items-center gap-3 rounded-lg border bg-surface p-2 pl-3 text-sm">
              <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-bold text-brand tabular">
                {i + 1}
              </span>
              <span className="flex-1 font-medium">{etiquetaPrioridad(p)}</span>
              <button type="button" className="btn btn-texto" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Subir «${etiquetaPrioridad(p)}»`}>
                <ArrowUp aria-hidden className="size-4" />
              </button>
              <button type="button" className="btn btn-texto" onClick={() => mover(i, 1)} disabled={i === d.prioridades.length - 1} aria-label={`Bajar «${etiquetaPrioridad(p)}»`}>
                <ArrowDown aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ol>
      </Grupo>

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
