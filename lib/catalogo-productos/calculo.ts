import type { DatosCatalogo, FilaCatalogo } from "./tipos";

/** Mínimo para que el prompt tenga sentido: nombre de la empresa y al menos 1 producto con nombre y precio. */
export function datosMinimosCatalogo(d: DatosCatalogo): boolean {
  return Boolean(d.empresa.trim()) && d.productos.some((p) => p.nombre.trim() && p.precio.trim());
}

export interface Categoria {
  nombre: string;
  filas: FilaCatalogo[];
}

/** Agrupa las filas del catálogo generado por categoría, en el orden en que cada categoría aparece por primera vez (la página nunca reordena alfabéticamente: respeta cómo las organizó la IA). */
export function agruparPorCategoria(filas: FilaCatalogo[]): Categoria[] {
  const orden: string[] = [];
  const mapa = new Map<string, FilaCatalogo[]>();
  for (const f of filas) {
    const cat = f.categoria.trim() || "Sin categoría";
    if (!mapa.has(cat)) {
      mapa.set(cat, []);
      orden.push(cat);
    }
    mapa.get(cat)!.push(f);
  }
  return orden.map((nombre) => ({ nombre, filas: mapa.get(nombre)! }));
}

/** Limpia un número de WhatsApp a solo dígitos (con el código de país, sin «+» ni espacios): lo que exige el enlace wa.me. */
export function whatsappLimpio(numero: string): string {
  return numero.replace(/[^\d]/g, "");
}

/** Enlace wa.me con un mensaje prellenado para un producto (se arma en el navegador, no envía nada hasta que la persona pulsa «Enviar» en WhatsApp). */
export function enlaceWhatsapp(numero: string, empresa: string, producto: string, precio: string): string | null {
  const limpio = whatsappLimpio(numero);
  if (limpio.length < 8) return null;
  const mensaje = `Hola${empresa.trim() ? ` ${empresa.trim()}` : ""}, quiero consultar por «${producto}»${precio.trim() ? ` (${precio.trim()})` : ""}.`;
  return `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}`;
}
