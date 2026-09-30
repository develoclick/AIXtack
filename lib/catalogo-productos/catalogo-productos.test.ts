import assert from "node:assert/strict";
import { test } from "node:test";
import { agruparPorCategoria, datosMinimosCatalogo, enlaceWhatsapp, whatsappLimpio } from "./calculo";
import { csvDeCatalogo, plantillaCsvVacia, productosDesdeCsv } from "./csv";
import { leerRespuestaCatalogo, TITULOS_RESPUESTA } from "./lector";
import { construirPromptCatalogo, progresoCatalogo } from "./prompt";
import { datosVaciosCatalogo, normalizarDatosCatalogo, nuevoId, productoVacio, type DatosCatalogo, type FilaCatalogo, type Producto } from "./tipos";
import { categoriasDeMas, preciosSinCoincidir } from "./verificar";

function datosNegocio(): DatosCatalogo {
  return {
    ...datosVaciosCatalogo(),
    empresa: "Casacas Lima",
    rubro: "Ropa de abrigo",
    publico: "Adultos jóvenes que buscan ropa impermeable a buen precio",
    estilo: "Cercano y directo",
    whatsapp: "+51 987 654 321",
    productos: [
      { id: "p1", nombre: "Casaca impermeable talla M", descripcion: "Tela impermeable, forro polar", precio: "129.90", precioPromo: "99.90", categoria: "Casacas", sku: "CAS-001" },
      { id: "p2", nombre: "Gorro de lana", descripcion: "", precio: "25.00", precioPromo: "", categoria: "Accesorios", sku: "" },
    ],
  };
}

const CSV_CATALOGO = `\`\`\`csv
categoria,nombre_original,nombre,descripcion,especificaciones,variantes,precio,precio_promo,etiqueta,cta
Casacas,Casaca impermeable talla M,Casaca impermeable con forro polar,Casaca ideal para lluvia y frío intenso,Tela impermeable;Forro polar;Bolsillos con cierre,Talla M,129.90,99.90,,Escríbenos por esta casaca
Accesorios,Gorro de lana,Gorro de lana clásico,Gorro abrigador para el invierno,Lana suave;Talla única,—,25.00,,,Consúltanos por el gorro
\`\`\`
`;

function respuestaCompleta(): string {
  return `## Catálogo\n${CSV_CATALOGO}\n## Datos faltantes por producto\n- Ningún producto tiene datos faltantes relevantes.\n\n## Sugerencias de fotos\n- Casaca: fondo liso claro, luz natural, de frente y en detalle de bolsillos.\n- Gorro: fondo liso, foto de producto solo y puesto.\n\n## Qué debes verificar\n- Confirma que el stock de tallas está actualizado.\n\n## Siguiente paso\n- Revisa el catálogo generado en esta página y elige una plantilla.`;
}

test("datosMinimosCatalogo exige empresa y al menos 1 producto con nombre y precio", () => {
  assert.equal(datosMinimosCatalogo(datosNegocio()), true);
  assert.equal(datosMinimosCatalogo(datosVaciosCatalogo()), false);
  assert.equal(datosMinimosCatalogo({ ...datosNegocio(), empresa: "" }), false);
});

test("agruparPorCategoria conserva el orden de primera aparición de cada categoría (no alfabético)", () => {
  const filas: FilaCatalogo[] = [
    { categoria: "Zapatos", nombreOriginal: "A", nombre: "A", descripcion: "", especificaciones: "", variantes: "", precio: "10", precioPromo: "", etiqueta: "", cta: "" },
    { categoria: "Accesorios", nombreOriginal: "B", nombre: "B", descripcion: "", especificaciones: "", variantes: "", precio: "10", precioPromo: "", etiqueta: "", cta: "" },
    { categoria: "Zapatos", nombreOriginal: "C", nombre: "C", descripcion: "", especificaciones: "", variantes: "", precio: "10", precioPromo: "", etiqueta: "", cta: "" },
  ];
  const c = agruparPorCategoria(filas);
  assert.deepEqual(c.map((x) => x.nombre), ["Zapatos", "Accesorios"]);
  assert.equal(c[0].filas.length, 2);
  assert.equal(c[1].filas.length, 1);
});

test("agruparPorCategoria usa «Sin categoría» cuando la fila no trae ninguna", () => {
  const filas: FilaCatalogo[] = [{ categoria: "", nombreOriginal: "A", nombre: "A", descripcion: "", especificaciones: "", variantes: "", precio: "10", precioPromo: "", etiqueta: "", cta: "" }];
  assert.equal(agruparPorCategoria(filas)[0].nombre, "Sin categoría");
});

test("whatsappLimpio y enlaceWhatsapp arman un enlace wa.me válido", () => {
  assert.equal(whatsappLimpio("+51 987 654 321"), "51987654321");
  const url = enlaceWhatsapp("+51 987 654 321", "Casacas Lima", "Casaca impermeable", "S/ 99.90");
  assert.ok(url?.startsWith("https://wa.me/51987654321?text="));
  assert.ok(decodeURIComponent(url!).includes("Casaca impermeable"));
  assert.equal(enlaceWhatsapp("123", "X", "Y", "Z"), null);
});

test("construirPromptCatalogo incluye los datos del negocio, los productos en CSV y los 5 títulos de salida", () => {
  const p = construirPromptCatalogo(datosNegocio());
  assert.ok(p.includes("Casacas Lima"));
  assert.ok(p.includes("Casaca impermeable talla M,129.90,99.90,Casacas,CAS-001"));
  for (const t of TITULOS_RESPUESTA) assert.ok(p.includes(`## ${t.titulo}`), `falta ${t.titulo}`);
  assert.ok(p.includes("nombre_original"));
  assert.ok(p.includes("máximo de 8 categorías"));
});

test("progresoCatalogo llega a 100 % con el negocio y 3+ productos completos, y 0 % vacío", () => {
  const conTres: DatosCatalogo = { ...datosNegocio(), productos: [...datosNegocio().productos, { id: "p3", nombre: "Bufanda", descripcion: "", precio: "15", precioPromo: "", categoria: "", sku: "" }] };
  assert.equal(progresoCatalogo(conTres).porcentaje, 100);
  assert.equal(progresoCatalogo(datosVaciosCatalogo()).porcentaje, 0);
});

test("leerRespuestaCatalogo lee el bloque CSV y las 4 secciones de texto", () => {
  const l = leerRespuestaCatalogo(respuestaCompleta());
  assert.equal(l.valido, true);
  assert.equal(l.filas.length, 2);
  assert.equal(l.filas[0].nombreOriginal, "Casaca impermeable talla M");
  assert.equal(l.filas[0].nombre, "Casaca impermeable con forro polar");
  assert.equal(l.filas[0].precio, "129.90");
  assert.equal(l.filas[0].precioPromo, "99.90");
  assert.deepEqual(l.categorias, ["Casacas", "Accesorios"]);
  assert.equal(l.fotos.length, 2);
  assert.equal(l.verificar.length, 1);
  assert.equal(l.siguiente.length, 1);
  assert.equal(l.advertencias.length, 0);
});

test("leerRespuestaCatalogo sin «## Catálogo» no es válida", () => {
  const l = leerRespuestaCatalogo("No puedo ayudarte con eso.");
  assert.equal(l.valido, false);
  assert.ok(l.problema);
});

test("leerRespuestaCatalogo avisa si hay más de 8 categorías", () => {
  const filas = Array.from({ length: 9 }, (_, i) => `Cat${i},Prod ${i},Prod ${i},desc,esp,—,10.00,,,cta`).join("\n");
  const respuesta = `## Catálogo\n\`\`\`csv\ncategoria,nombre_original,nombre,descripcion,especificaciones,variantes,precio,precio_promo,etiqueta,cta\n${filas}\n\`\`\`\n## Qué debes verificar\n- x\n## Siguiente paso\n- x`;
  const l = leerRespuestaCatalogo(respuesta);
  assert.equal(l.valido, true);
  assert.ok(l.advertencias.some((a) => a.includes("9 categorías")));
  assert.deepEqual(categoriasDeMas(l.categorias).length, 9);
});

test("preciosSinCoincidir no reporta nada cuando el precio y el precio_promo coinciden exactamente (verificado a mano)", () => {
  const l = leerRespuestaCatalogo(respuestaCompleta());
  assert.equal(preciosSinCoincidir(datosNegocio().productos, l.filas).length, 0);
});

test("preciosSinCoincidir bloquea cuando el precio de la respuesta no coincide con el del formulario", () => {
  const l = leerRespuestaCatalogo(respuestaCompleta());
  const productosConOtroPrecio: Producto[] = datosNegocio().productos.map((p) => (p.id === "p1" ? { ...p, precio: "150.00" } : p));
  const problemas = preciosSinCoincidir(productosConOtroPrecio, l.filas);
  assert.equal(problemas.length, 1);
  assert.ok(problemas[0].motivo.includes("no coincide"));
});

test("preciosSinCoincidir bloquea cuando la IA no devuelve el nombre_original exacto (no encuentra el producto)", () => {
  const l = leerRespuestaCatalogo(respuestaCompleta());
  const filasConNombreCambiado = l.filas.map((f) => ({ ...f, nombreOriginal: f.nombreOriginal + " XL" }));
  const problemas = preciosSinCoincidir(datosNegocio().productos, filasConNombreCambiado);
  assert.equal(problemas.length, 2);
  assert.ok(problemas.every((p) => p.motivo.includes("No encuentro")));
});

test("preciosSinCoincidir tolera diferencias de mayúsculas y espacios en el nombre (coincidencia por nombre normalizado)", () => {
  const l = leerRespuestaCatalogo(respuestaCompleta());
  const filasConEspacios = l.filas.map((f) => ({ ...f, nombreOriginal: `  ${f.nombreOriginal.toUpperCase()}  ` }));
  assert.equal(preciosSinCoincidir(datosNegocio().productos, filasConEspacios).length, 0);
});

test("productosDesdeCsv lee nombre, precio, precio_promo, categoria, sku y descripcion en cualquier orden", () => {
  const csv = "sku,nombre,precio\nCAS-001,Casaca impermeable,129.90\n,Gorro de lana,25.00";
  const { productos, errores } = productosDesdeCsv(csv);
  assert.equal(productos.length, 2);
  assert.equal(productos[0].nombre, "Casaca impermeable");
  assert.equal(productos[0].sku, "CAS-001");
  assert.equal(errores.length, 0);
});

test("productosDesdeCsv exige al menos nombre y precio", () => {
  const { productos, errores } = productosDesdeCsv("categoria,sku\nCasacas,CAS-001");
  assert.equal(productos.length, 0);
  assert.ok(errores[0].includes("nombre y precio"));
});

test("csvDeCatalogo y plantillaCsvVacia generan un .csv legible con encabezado", () => {
  const l = leerRespuestaCatalogo(respuestaCompleta());
  const csv = csvDeCatalogo(l.filas);
  assert.ok(csv.startsWith("categoria,nombre,descripcion,especificaciones,variantes,precio,precio_promo,etiqueta,cta"));
  assert.ok(csv.includes("Casaca impermeable con forro polar"));
  assert.ok(plantillaCsvVacia().startsWith("nombre,precio,precio_promo,categoria,sku,descripcion"));
});

test("normalizarDatosCatalogo tolera datos vacíos o de otra forma sin romperse", () => {
  const n = normalizarDatosCatalogo({ empresa: "X", plantilla: "no-existe", productos: [{ nombre: "A" }] });
  assert.equal(n.empresa, "X");
  assert.equal(n.plantilla, "minimalista");
  assert.equal(n.productos[0].nombre, "A");
  assert.equal(normalizarDatosCatalogo(null).empresa, "");
});

test("nuevoId y productoVacio generan ids distintos", () => {
  const a = nuevoId("p");
  const b = nuevoId("p");
  assert.notEqual(a, b);
  assert.equal(productoVacio(a).id, a);
});
