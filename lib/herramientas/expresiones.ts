/**
 * Evaluador de fórmulas de las calculadoras. No usa eval ni Function: analiza la expresión y la
 * calcula sobre un AST propio. Un valor no válido (dato ausente, división entre cero) da `null`, que
 * se propaga: la página muestra «—» y el prompt marca [FALTA] en vez de inventar una cifra.
 *
 * Gramática: números · ids · + − * / · ( ) · < <= > >= == != · && || ! · funciones
 *   min, max, abs, round(x; n), techo, piso, si(condición; sí; no)
 * Los argumentos se separan con «;» o «,». El decimal es siempre el punto.
 */

export class ErrorExpresion extends Error {}

type Nodo =
  | { t: "num"; v: number }
  | { t: "id"; nombre: string }
  | { t: "un"; op: "-" | "!"; a: Nodo }
  | { t: "bin"; op: string; a: Nodo; b: Nodo }
  | { t: "fn"; nombre: string; args: Nodo[] };

type Ficha = { k: "num"; v: number } | { k: "id"; v: string } | { k: "op"; v: string };

const FUNCIONES: Record<string, { min: number; max: number }> = {
  min: { min: 1, max: 8 },
  max: { min: 1, max: 8 },
  abs: { min: 1, max: 1 },
  round: { min: 1, max: 2 },
  techo: { min: 1, max: 1 },
  piso: { min: 1, max: 1 },
  si: { min: 3, max: 3 },
};

function tokenizar(texto: string): Ficha[] {
  const fichas: Ficha[] = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (/\s/.test(c)) {
      i++;
    } else if (/[0-9.]/.test(c)) {
      const m = /^(?:\d+\.?\d*|\.\d+)/.exec(texto.slice(i));
      if (!m) throw new ErrorExpresion(`Número no válido en «${texto}»`);
      fichas.push({ k: "num", v: Number(m[0]) });
      i += m[0].length;
    } else if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(texto.slice(i))!;
      fichas.push({ k: "id", v: m[0] });
      i += m[0].length;
    } else {
      const dos = texto.slice(i, i + 2);
      if (["<=", ">=", "==", "!=", "&&", "||"].includes(dos)) {
        fichas.push({ k: "op", v: dos });
        i += 2;
      } else if ("+-*/(),;<>!".includes(c)) {
        fichas.push({ k: "op", v: c === ";" ? "," : c });
        i++;
      } else {
        throw new ErrorExpresion(`Carácter no permitido «${c}» en «${texto}»`);
      }
    }
  }
  return fichas;
}

export function analizar(texto: string): Nodo {
  const fichas = tokenizar(texto);
  let p = 0;
  const ver = () => fichas[p];
  const esOp = (v: string) => ver()?.k === "op" && ver().v === v;
  const tomarOp = (v: string) => {
    if (!esOp(v)) throw new ErrorExpresion(`Se esperaba «${v}» en «${texto}»`);
    p++;
  };

  function o(): Nodo {
    let a = y();
    while (esOp("||")) {
      p++;
      a = { t: "bin", op: "||", a, b: y() };
    }
    return a;
  }
  function y(): Nodo {
    let a = comparar();
    while (esOp("&&")) {
      p++;
      a = { t: "bin", op: "&&", a, b: comparar() };
    }
    return a;
  }
  function comparar(): Nodo {
    const a = suma();
    const f = ver();
    if (f?.k === "op" && ["<", "<=", ">", ">=", "==", "!="].includes(f.v)) {
      p++;
      return { t: "bin", op: f.v, a, b: suma() };
    }
    return a;
  }
  function suma(): Nodo {
    let a = mult();
    while (esOp("+") || esOp("-")) {
      const op = String(ver().v);
      p++;
      a = { t: "bin", op, a, b: mult() };
    }
    return a;
  }
  function mult(): Nodo {
    let a = unario();
    while (esOp("*") || esOp("/")) {
      const op = String(ver().v);
      p++;
      a = { t: "bin", op, a, b: unario() };
    }
    return a;
  }
  function unario(): Nodo {
    if (esOp("-")) {
      p++;
      return { t: "un", op: "-", a: unario() };
    }
    if (esOp("!")) {
      p++;
      return { t: "un", op: "!", a: unario() };
    }
    return primario();
  }
  function primario(): Nodo {
    const f = ver();
    if (!f) throw new ErrorExpresion(`La expresión termina antes de tiempo: «${texto}»`);
    if (f.k === "num") {
      p++;
      return { t: "num", v: f.v };
    }
    if (f.k === "id") {
      p++;
      if (esOp("(")) {
        p++;
        const args: Nodo[] = [];
        if (!esOp(")")) {
          args.push(o());
          while (esOp(",")) {
            p++;
            args.push(o());
          }
        }
        tomarOp(")");
        const regla = FUNCIONES[f.v];
        if (!regla) throw new ErrorExpresion(`Función desconocida «${f.v}» en «${texto}»`);
        if (args.length < regla.min || args.length > regla.max) throw new ErrorExpresion(`«${f.v}» recibe ${regla.min}–${regla.max} argumentos en «${texto}»`);
        return { t: "fn", nombre: f.v, args };
      }
      return { t: "id", nombre: f.v };
    }
    if (f.v === "(") {
      p++;
      const dentro = o();
      tomarOp(")");
      return dentro;
    }
    throw new ErrorExpresion(`No se esperaba «${f.v}» en «${texto}»`);
  }

  const raiz = o();
  if (p < fichas.length) throw new ErrorExpresion(`Sobra «${(fichas[p] as { v: unknown }).v}» en «${texto}»`);
  return raiz;
}

/** Ids que usa una expresión (para comprobar que existen). */
export function idsUsados(texto: string): string[] {
  const ids = new Set<string>();
  const visitar = (n: Nodo): void => {
    if (n.t === "id") ids.add(n.nombre);
    else if (n.t === "un") visitar(n.a);
    else if (n.t === "bin") {
      visitar(n.a);
      visitar(n.b);
    } else if (n.t === "fn") n.args.forEach(visitar);
  };
  visitar(analizar(texto));
  return [...ids];
}

const bool = (b: boolean) => (b ? 1 : 0);

function evaluarNodo(n: Nodo, vars: Record<string, number | null | undefined>): number | null {
  switch (n.t) {
    case "num":
      return n.v;
    case "id": {
      const v = vars[n.nombre];
      return typeof v === "number" && Number.isFinite(v) ? v : null;
    }
    case "un": {
      const a = evaluarNodo(n.a, vars);
      if (a === null) return null;
      return n.op === "-" ? -a : bool(a === 0);
    }
    case "bin": {
      const a = evaluarNodo(n.a, vars);
      const b = evaluarNodo(n.b, vars);
      if (a === null || b === null) return null;
      switch (n.op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? null : a / b;
        case "<": return bool(a < b);
        case "<=": return bool(a <= b + 1e-12);
        case ">": return bool(a > b);
        case ">=": return bool(a >= b - 1e-12);
        case "==": return bool(Math.abs(a - b) <= 1e-12);
        case "!=": return bool(Math.abs(a - b) > 1e-12);
        case "&&": return bool(a !== 0 && b !== 0);
        case "||": return bool(a !== 0 || b !== 0);
      }
      throw new ErrorExpresion(`Operador desconocido ${n.op}`);
    }
    case "fn": {
      if (n.nombre === "si") {
        const c = evaluarNodo(n.args[0], vars);
        if (c === null) return null;
        return evaluarNodo(c !== 0 ? n.args[1] : n.args[2], vars);
      }
      const args = n.args.map((a) => evaluarNodo(a, vars));
      if (args.some((a) => a === null)) return null;
      const xs = args as number[];
      switch (n.nombre) {
        case "min": return Math.min(...xs);
        case "max": return Math.max(...xs);
        case "abs": return Math.abs(xs[0]);
        case "techo": return Math.ceil(xs[0] - 1e-12);
        case "piso": return Math.floor(xs[0] + 1e-12);
        case "round": {
          const d = xs[1] ?? 0;
          const f = 10 ** d;
          return Math.round((xs[0] + Number.EPSILON) * f) / f;
        }
      }
      throw new ErrorExpresion(`Función desconocida ${n.nombre}`);
    }
  }
}

export function evaluar(texto: string, vars: Record<string, number | null | undefined>): number | null {
  return evaluarNodo(analizar(texto), vars);
}
