"use client";

import { Campo } from "@/components/prompts/campo-formulario";
import { parsearNumero } from "@/lib/presupuesto/calculo";

/** Mensaje junto al campo cuando lo escrito no es un número válido (vacío no es error: los obligatorios se avisan en «Ver qué falta»). */
export const errorNumero = (s: string, { entero = false, minimo = 0, maximo }: { entero?: boolean; minimo?: number; maximo?: number } = {}) => {
  if (!s.trim()) return undefined;
  const n = parsearNumero(s);
  if (n === null) return "Escribe un número, por ejemplo 10 o 7,5.";
  if (entero && !Number.isInteger(n)) return "Usa un número entero.";
  if (n < minimo) return `El mínimo es ${minimo}.`;
  if (maximo !== undefined && n > maximo) return `El máximo es ${maximo}.`;
  return undefined;
};

export function Mensaje({ id, texto }: { id: string; texto?: string }) {
  return texto ? (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {texto}
    </p>
  ) : null;
}

/** Campo numérico con su error junto al campo. */
export function Numero({ etiqueta, valor, alCambiar, ayuda, placeholder, obligatorio, entero, minimo, maximo }: { etiqueta: string; valor: string; alCambiar: (v: string) => void; ayuda?: string; placeholder?: string; obligatorio?: boolean; entero?: boolean; minimo?: number; maximo?: number }) {
  const err = errorNumero(valor, { entero, minimo, maximo });
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

export function Texto({ etiqueta, valor, alCambiar, ayuda, placeholder, obligatorio, largo, tipo }: { etiqueta: string; valor: string; alCambiar: (v: string) => void; ayuda?: string; placeholder?: string; obligatorio?: boolean; largo?: boolean; tipo?: "text" | "date" }) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} obligatorio={obligatorio}>
      {(id, ay) =>
        largo ? (
          <textarea id={id} aria-describedby={ay} className="campo min-h-24" value={valor} onChange={(e) => alCambiar(e.target.value)} placeholder={placeholder} />
        ) : (
          <input id={id} type={tipo ?? "text"} aria-describedby={ay} className="campo" value={valor} onChange={(e) => alCambiar(e.target.value)} placeholder={placeholder} />
        )
      }
    </Campo>
  );
}

export function Selector<T extends string>({ etiqueta, valor, opciones, alCambiar, ayuda, obligatorio }: { etiqueta: string; valor: T; opciones: { valor: T; etiqueta: string }[]; alCambiar: (v: T) => void; ayuda?: string; obligatorio?: boolean }) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} obligatorio={obligatorio}>
      {(id, ay) => (
        <select id={id} aria-describedby={ay} className="campo" value={valor} onChange={(e) => alCambiar(e.target.value as T)}>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      )}
    </Campo>
  );
}
