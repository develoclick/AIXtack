import { parsearNumero } from "@/lib/presupuesto/calculo";
import { MAX_CATEGORIAS, type FilaCatalogo, type Producto } from "./tipos";

const normalizarNombre = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");

/** ¿El monto que copió la IA coincide con el que escribió la persona? Si ambos son numéricos, compara con tolerancia de redondeo; si no, exige el mismo texto. Vacío contra vacío también coincide (por ejemplo, ningún precio_promo). */
function coincideMonto(original: string, leido: string): boolean {
  if (!original.trim() && !leido.trim()) return true;
  const a = parsearNumero(original);
  const b = parsearNumero(leido);
  if (a === null || b === null) return original.trim() === leido.trim();
  return Math.abs(a - b) < 0.011;
}

export interface ProblemaPrecio {
  fila: FilaCatalogo;
  motivo: string;
}

/**
 * Compara el precio (y el precio promocional) de cada fila del catálogo generado contra lo que la persona escribió en el
 * formulario, buscando el producto por su nombre EXACTO («nombre_original», que el prompt le pide a la IA devolver sin
 * modificar). La IA nunca recalcula ni redondea el precio: si no coincide con lo que la persona escribió, la descarga
 * queda bloqueada hasta que se revise, porque un precio equivocado en un catálogo es un error caro.
 */
export function preciosSinCoincidir(productos: Producto[], filas: FilaCatalogo[]): ProblemaPrecio[] {
  const problemas: ProblemaPrecio[] = [];
  for (const f of filas) {
    const p = productos.find((x) => normalizarNombre(x.nombre) === normalizarNombre(f.nombreOriginal));
    if (!p) {
      problemas.push({ fila: f, motivo: `No encuentro «${f.nombreOriginal}» entre los productos que escribiste: revisa si la IA cambió el nombre original.` });
      continue;
    }
    if (!coincideMonto(p.precio, f.precio)) {
      problemas.push({ fila: f, motivo: `El precio de «${f.nombre}» en la respuesta (${f.precio || "vacío"}) no coincide con el que escribiste (${p.precio || "vacío"}).` });
      continue;
    }
    if (!coincideMonto(p.precioPromo, f.precioPromo)) {
      problemas.push({ fila: f, motivo: `El precio promocional de «${f.nombre}» en la respuesta (${f.precioPromo || "vacío"}) no coincide con el que escribiste (${p.precioPromo || "vacío"}).` });
    }
  }
  return problemas;
}

/** Nombres de categorías, si la respuesta trae más del máximo permitido (la página nunca las fusiona por su cuenta: solo avisa). */
export function categoriasDeMas(categorias: string[]): string[] {
  return categorias.length > MAX_CATEGORIAS ? categorias : [];
}
