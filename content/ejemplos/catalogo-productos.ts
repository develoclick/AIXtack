import { datosVaciosCatalogo, type DatosCatalogo, type Producto } from "@/lib/catalogo-productos/tipos";

export interface EjemploCatalogo {
  id: string;
  etiqueta: string;
  descripcion: string;
  datos: DatosCatalogo;
  /** Respuesta ilustrativa escrita por el autor siguiendo el prompt: NO viene de una IA real. El precio de cada fila es idéntico, número por número, al precio del producto correspondiente (se verifica con pruebas unitarias). */
  respuesta: string;
}

function datos(productos: Producto[], p: Partial<Omit<DatosCatalogo, "productos">>): DatosCatalogo {
  return { ...datosVaciosCatalogo(), ...p, productos };
}

function producto(id: string, nombre: string, precio: string, precioPromo: string, categoria: string, sku: string, descripcion = ""): Producto {
  return { id, nombre, precio, precioPromo, categoria, sku, descripcion };
}

interface FilaCsv {
  categoria: string;
  nombreOriginal: string;
  nombre: string;
  descripcion: string;
  especificaciones: string;
  variantes: string;
  precio: string;
  precioPromo: string;
  etiqueta: string;
  cta: string;
}

const campo = (t: string) => (/[",;\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
const fila = (f: FilaCsv) => [f.categoria, f.nombreOriginal, f.nombre, f.descripcion, f.especificaciones, f.variantes, f.precio, f.precioPromo, f.etiqueta, f.cta].map(campo).join(",");
const lista = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");

function armar(p: { filas: FilaCsv[]; faltantes: string[]; fotos: string[]; verificar: string[]; siguiente: string[] }): string {
  return `## Catálogo
\`\`\`csv
categoria,nombre_original,nombre,descripcion,especificaciones,variantes,precio,precio_promo,etiqueta,cta
${p.filas.map(fila).join("\n")}
\`\`\`

## Datos faltantes por producto
${lista(p.faltantes)}

## Sugerencias de fotos
${lista(p.fotos)}

## Qué debes verificar
${lista(p.verificar)}

## Siguiente paso
${lista(p.siguiente)}`;
}

/* ─────────────── Casacas Lima: ropa de abrigo (plantilla «Moda») ─────────────── */

const PRODUCTOS_CASACAS: Producto[] = [
  producto("c1", "Casaca impermeable talla M", "129.90", "99.90", "Casacas", "CAS-001"),
  producto("c2", "Casaca impermeable talla L", "139.90", "", "Casacas", "CAS-002"),
  producto("c3", "Gorro de lana", "25.00", "", "Accesorios", "GOR-001"),
  producto("c4", "Bufanda tejida", "35.00", "", "Accesorios", "BUF-001"),
  producto("c5", "Guantes térmicos", "28.00", "22.00", "Accesorios", "GUA-001"),
];

const DATOS_CASACAS: DatosCatalogo = datos(PRODUCTOS_CASACAS, {
  empresa: "Casacas Lima",
  rubro: "Ropa de abrigo para clima frío",
  publico: "Adultos jóvenes de Lima y la sierra que buscan ropa de abrigo resistente a buen precio",
  estilo: "Cercano y directo, sin tecnicismos",
  whatsapp: "+51 987 654 321",
  plantilla: "moda",
});

const RESPUESTA_CASACAS = armar({
  filas: [
    { categoria: "Casacas", nombreOriginal: "Casaca impermeable talla M", nombre: "Casaca impermeable con forro polar", descripcion: "Ideal para lluvia y frío intenso, en Lima o en la sierra.", especificaciones: "Tela impermeable;Forro polar interior;Bolsillos con cierre", variantes: "Talla M", precio: "129.90", precioPromo: "99.90", etiqueta: "", cta: "Escríbenos por esta casaca en talla M" },
    { categoria: "Casacas", nombreOriginal: "Casaca impermeable talla L", nombre: "Casaca impermeable con forro polar", descripcion: "La misma casaca en talla L, para un calce más holgado.", especificaciones: "Tela impermeable;Forro polar interior;Bolsillos con cierre", variantes: "Talla L", precio: "139.90", precioPromo: "", etiqueta: "", cta: "Consúltanos por la talla L" },
    { categoria: "Accesorios", nombreOriginal: "Gorro de lana", nombre: "Gorro de lana clásico", descripcion: "Gorro abrigador tejido para el frío de la sierra.", especificaciones: "Lana suave;Talla única", variantes: "—", precio: "25.00", precioPromo: "", etiqueta: "", cta: "Pregúntanos por el gorro de lana" },
    { categoria: "Accesorios", nombreOriginal: "Bufanda tejida", nombre: "Bufanda tejida a mano", descripcion: "Bufanda larga que combina con cualquier casaca.", especificaciones: "Tejido grueso;2 metros de largo", variantes: "—", precio: "35.00", precioPromo: "", etiqueta: "", cta: "Escríbenos por la bufanda tejida" },
    { categoria: "Accesorios", nombreOriginal: "Guantes térmicos", nombre: "Guantes térmicos antideslizantes", descripcion: "Guantes forrados que mantienen las manos calientes en exteriores.", especificaciones: "Forro térmico;Palma antideslizante", variantes: "Talla única", precio: "28.00", precioPromo: "22.00", etiqueta: "", cta: "Consúltanos por los guantes térmicos" },
  ],
  faltantes: ["Casaca impermeable (ambas tallas): no indicaste los colores disponibles; agrégalos si vendes más de uno."],
  fotos: ["Casacas: fondo liso claro, luz natural, de frente y un detalle de bolsillos y forro.", "Gorro y guantes: fondo liso, foto del producto solo y puesto por una persona.", "Bufanda: extendida sobre una superficie plana para mostrar el largo, y enrollada para mostrar la textura."],
  verificar: ["Confirma que el stock de cada talla está actualizado antes de publicar.", "Revisa que el precio promocional siga vigente en la fecha en que compartas el catálogo."],
  siguiente: ["Revisa el catálogo generado en esta página, elige la plantilla «Moda» y descarga el PDF o las fichas."],
});

/* ─────────────── Dulce Trigo: pastelería de barrio (plantilla «Alimentos») ─────────────── */

const PRODUCTOS_PASTELERIA: Producto[] = [
  producto("d1", "Torta de chocolate mediana", "45.00", "", "Tortas", "TOR-001"),
  producto("d2", "Torta de chocolate grande", "75.00", "65.00", "Tortas", "TOR-002"),
  producto("d3", "Alfajores por docena", "18.00", "", "Dulces", "ALF-001"),
  producto("d4", "Pan integral (unidad)", "2.50", "", "Panes", "PAN-001"),
  producto("d5", "Queque de plátano", "15.00", "", "Dulces", "QUE-001"),
];

const DATOS_PASTELERIA: DatosCatalogo = datos(PRODUCTOS_PASTELERIA, {
  empresa: "Dulce Trigo",
  rubro: "Pastelería y panadería de barrio",
  publico: "Familias del distrito que buscan pan y postres frescos para el día a día y ocasiones especiales",
  estilo: "Cálido y casero",
  whatsapp: "+51 912 345 678",
  plantilla: "alimentos",
});

const RESPUESTA_PASTELERIA = armar({
  filas: [
    { categoria: "Tortas", nombreOriginal: "Torta de chocolate mediana", nombre: "Torta de chocolate casera mediana", descripcion: "Torta húmeda de chocolate con relleno de manjar blanco.", especificaciones: "Rinde 8 porciones;Relleno de manjar blanco", variantes: "Mediana (8 porciones)", precio: "45.00", precioPromo: "", etiqueta: "", cta: "Escríbenos para encargar tu torta mediana" },
    { categoria: "Tortas", nombreOriginal: "Torta de chocolate grande", nombre: "Torta de chocolate casera grande", descripcion: "La misma receta en tamaño grande, ideal para reuniones numerosas.", especificaciones: "Rinde 16 porciones;Relleno de manjar blanco", variantes: "Grande (16 porciones)", precio: "75.00", precioPromo: "65.00", etiqueta: "", cta: "Consúltanos por la torta grande en oferta" },
    { categoria: "Dulces", nombreOriginal: "Alfajores por docena", nombre: "Alfajores rellenos de manjar blanco", descripcion: "Alfajores caseros con manjar blanco y una capa de chancaca.", especificaciones: "Docena;Manjar blanco casero", variantes: "—", precio: "18.00", precioPromo: "", etiqueta: "", cta: "Pide tu docena de alfajores" },
    { categoria: "Panes", nombreOriginal: "Pan integral (unidad)", nombre: "Pan integral artesanal", descripcion: "Pan integral horneado a diario con masa madre.", especificaciones: "Masa madre;100 % integral", variantes: "—", precio: "2.50", precioPromo: "", etiqueta: "", cta: "Pregúntanos por el pan integral del día" },
    { categoria: "Dulces", nombreOriginal: "Queque de plátano", nombre: "Queque casero de plátano", descripcion: "Queque húmedo hecho con plátanos maduros, sin conservantes.", especificaciones: "Sin conservantes;Plátano natural", variantes: "—", precio: "15.00", precioPromo: "", etiqueta: "", cta: "Escríbenos por el queque de plátano" },
  ],
  faltantes: ["Torta de chocolate (ambos tamaños): no indicaste si el relleno se puede cambiar; agrégalo si ofreces otras opciones."],
  fotos: ["Tortas: foto cenital sobre una mesa de madera, con una porción cortada para mostrar el relleno.", "Alfajores y queque: fondo claro, luz natural, de cerca para mostrar la textura.", "Pan: en una canasta o tabla de madera, con una pieza recién cortada al lado."],
  verificar: ["Confirma si el precio de las tortas incluye el delivery o acláralo aparte.", "Revisa que la promoción de la torta grande siga vigente."],
  siguiente: ["Revisa el catálogo en esta página, elige la plantilla «Alimentos» y descarga el PDF o las fichas para compartir por WhatsApp."],
});

/* ─────────────── Tornillos Express: ferretería de barrio (plantilla «Ferretería y técnico») ─────────────── */

const PRODUCTOS_FERRETERIA: Producto[] = [
  producto("f1", "Taladro percutor 650W", "189.90", "159.90", "Herramientas eléctricas", "TAL-001"),
  producto("f2", "Juego de destornilladores 6 piezas", "35.00", "", "Herramientas manuales", "DES-001"),
  producto("f3", "Cemento Sol tipo I (bolsa 42.5kg)", "32.50", "", "Materiales", "CEM-001"),
  producto("f4", "Cinta métrica 5m", "12.00", "", "Herramientas manuales", "CIN-001"),
  producto("f5", "Foco LED 9W", "8.50", "", "Eléctrico", "FOC-001"),
];

const DATOS_FERRETERIA: DatosCatalogo = datos(PRODUCTOS_FERRETERIA, {
  empresa: "Tornillos Express",
  rubro: "Ferretería de barrio",
  publico: "Maestros de obra, técnicos y vecinos que necesitan herramientas y materiales de construcción",
  estilo: "Directo y técnico, sin adornos",
  whatsapp: "+51 999 111 222",
  plantilla: "ferreteria",
});

const RESPUESTA_FERRETERIA = armar({
  filas: [
    { categoria: "Herramientas eléctricas", nombreOriginal: "Taladro percutor 650W", nombre: "Taladro percutor 650W con maletín", descripcion: "Taladro percutor para concreto y ladrillo, incluye 2 brocas.", especificaciones: "Potencia 650W;Incluye maletín;2 brocas incluidas", variantes: "—", precio: "189.90", precioPromo: "159.90", etiqueta: "", cta: "Consúltanos por el taladro en oferta" },
    { categoria: "Herramientas manuales", nombreOriginal: "Juego de destornilladores 6 piezas", nombre: "Juego de destornilladores 6 piezas", descripcion: "Juego con puntas plana y Phillips en distintos tamaños.", especificaciones: "6 piezas;Puntas plana y Phillips", variantes: "—", precio: "35.00", precioPromo: "", etiqueta: "", cta: "Pregúntanos por el juego de destornilladores" },
    { categoria: "Materiales", nombreOriginal: "Cemento Sol tipo I (bolsa 42.5kg)", nombre: "Cemento Sol tipo I", descripcion: "Bolsa de cemento para uso general en construcción.", especificaciones: "Bolsa de 42.5 kg;Tipo I", variantes: "—", precio: "32.50", precioPromo: "", etiqueta: "", cta: "Escríbenos por el precio por bolsa o por mayor" },
    { categoria: "Herramientas manuales", nombreOriginal: "Cinta métrica 5m", nombre: "Cinta métrica de 5 metros", descripcion: "Cinta métrica con cuerpo antideslizante y traba.", especificaciones: "5 metros;Cuerpo antideslizante", variantes: "—", precio: "12.00", precioPromo: "", etiqueta: "", cta: "Consúltanos por la cinta métrica" },
    { categoria: "Eléctrico", nombreOriginal: "Foco LED 9W", nombre: "Foco LED 9W luz blanca", descripcion: "Foco ahorrador de bajo consumo para uso doméstico.", especificaciones: "9W;Luz blanca;Rosca E27", variantes: "—", precio: "8.50", precioPromo: "", etiqueta: "", cta: "Pregúntanos por el foco LED" },
  ],
  faltantes: ["Cemento Sol: no indicaste si el precio es por bolsa individual o si hay descuento por compra al por mayor; acláralo si aplica."],
  fotos: ["Taladro y destornilladores: fondo liso, luz uniforme, mostrando el maletín o estuche abierto.", "Cemento: foto de la bolsa completa con la etiqueta legible.", "Cinta métrica y foco: de cerca, mostrando el empaque o la medida extendida."],
  verificar: ["Confirma que el precio del cemento no haya cambiado: es un insumo con precio volátil.", "Revisa que la oferta del taladro siga vigente en la fecha en que compartas el catálogo."],
  siguiente: ["Revisa el catálogo en esta página, elige la plantilla «Ferretería y técnico» y descarga el PDF o las fichas."],
});

export const EJEMPLOS_CATALOGO: EjemploCatalogo[] = [
  { id: "casacas", etiqueta: "Casacas Lima (ropa de abrigo)", descripcion: "El ejemplo de la especificación: catálogo de casacas y accesorios con precio promocional, plantilla «Moda».", datos: DATOS_CASACAS, respuesta: RESPUESTA_CASACAS },
  { id: "pasteleria", etiqueta: "Dulce Trigo (pastelería de barrio)", descripcion: "Tortas, dulces y pan del día, plantilla «Alimentos».", datos: DATOS_PASTELERIA, respuesta: RESPUESTA_PASTELERIA },
  { id: "ferreteria", etiqueta: "Tornillos Express (ferretería)", descripcion: "Herramientas y materiales de construcción, plantilla «Ferretería y técnico».", datos: DATOS_FERRETERIA, respuesta: RESPUESTA_FERRETERIA },
];
