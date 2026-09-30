"use client";

import { useId, useRef, useState } from "react";
import { Building2, Download, PackagePlus, Palette, Phone, Upload } from "lucide-react";
import { Grupo } from "@/components/prompts/campo-formulario";
import { Selector, Texto } from "@/components/plan/campos";
import { almacenCatalogo } from "./almacen";
import { descargar } from "@/components/plan/descargar";
import { plantillaCsvVacia, productosDesdeCsv } from "@/lib/catalogo-productos/csv";
import { MAX_PRODUCTOS, nuevoId, PLANTILLAS, productoVacio, type DatosCatalogo, type Producto } from "@/lib/catalogo-productos/tipos";

function EditorProducto({ p, indice, alCambiar, alQuitar }: { p: Producto; indice: number; alCambiar: (c: Partial<Producto>) => void; alQuitar: () => void }) {
  return (
    <li className="tarjeta space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Producto {indice + 1}</p>
        <button type="button" onClick={alQuitar} className="btn btn-texto -mr-2" aria-label={`Quitar «${p.nombre.trim() || `producto ${indice + 1}`}»`}>
          Quitar
        </button>
      </div>
      <Texto etiqueta="Nombre" valor={p.nombre} alCambiar={(v) => alCambiar({ nombre: v })} obligatorio placeholder="Ej.: Casaca impermeable talla M" />
      <div className="grid grid-cols-2 gap-3">
        <Texto etiqueta="Precio (S/)" valor={p.precio} alCambiar={(v) => alCambiar({ precio: v })} obligatorio placeholder="Ej.: 129.90" />
        <Texto etiqueta="Precio promocional (opcional)" valor={p.precioPromo} alCambiar={(v) => alCambiar({ precioPromo: v })} placeholder="Ej.: 99.90" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Texto etiqueta="Categoría (opcional)" valor={p.categoria} alCambiar={(v) => alCambiar({ categoria: v })} placeholder="Ej.: Casacas" />
        <Texto etiqueta="SKU o código (opcional)" valor={p.sku} alCambiar={(v) => alCambiar({ sku: v })} placeholder="Ej.: CAS-001" />
      </div>
      <Texto etiqueta="Notas para la IA (opcional)" valor={p.descripcion} alCambiar={(v) => alCambiar({ descripcion: v })} placeholder="Material, talla, contenido, garantía…" ayuda="Lo que ya sepas del producto: la IA lo usa para redactar la ficha, nunca inventa lo que falte." />
    </li>
  );
}

export function FormularioCatalogo({ alBorrar }: { alBorrar: () => void }) {
  const d = almacenCatalogo.useDatos();
  const modoEjemplo = almacenCatalogo.useModoEjemplo();
  const [errorCsv, setErrorCsv] = useState<string | null>(null);
  const idCsv = useId();
  const inputCsv = useRef<HTMLInputElement>(null);
  const poner = <K extends keyof DatosCatalogo>(clave: K, valor: DatosCatalogo[K]) => almacenCatalogo.guardar({ ...d, [clave]: valor });

  async function importarCsv(archivo: File) {
    setErrorCsv(null);
    const texto = await archivo.text();
    const { productos, errores } = productosDesdeCsv(texto);
    if (productos.length === 0) {
      setErrorCsv(errores[0] ?? "No se pudo leer el archivo.");
      return;
    }
    poner("productos", productos.slice(0, MAX_PRODUCTOS));
    if (errores.length) setErrorCsv(`Se importaron ${productos.length} producto(s). ${errores.slice(0, 3).join(" ")}`);
  }

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Datos de tu negocio y tus productos" autoComplete="off">
      <Grupo icono={Building2} titulo="Tu negocio">
        <Texto etiqueta="Nombre de la empresa" valor={d.empresa} alCambiar={(v) => poner("empresa", v)} obligatorio placeholder="Ej.: Casacas Lima" />
        <Texto etiqueta="Rubro" valor={d.rubro} alCambiar={(v) => poner("rubro", v)} placeholder="Ej.: Ropa de abrigo para clima frío" />
        <Texto largo etiqueta="Público objetivo (opcional)" valor={d.publico} alCambiar={(v) => poner("publico", v)} placeholder="Ej.: adultos jóvenes que buscan ropa resistente a buen precio" />
        <Texto etiqueta="Estilo o tono de marca (opcional)" valor={d.estilo} alCambiar={(v) => poner("estilo", v)} placeholder="Ej.: cercano y directo" />
      </Grupo>

      <Grupo icono={Phone} titulo="WhatsApp" descripcion="Se usa para armar el enlace «escríbenos» de cada producto. No se guarda en ningún servidor: solo arma un enlace en tu navegador.">
        <Texto etiqueta="Número de WhatsApp (con código de país)" valor={d.whatsapp} alCambiar={(v) => poner("whatsapp", v)} placeholder="Ej.: +51 987 654 321" />
      </Grupo>

      <Grupo icono={PackagePlus} titulo="Productos" descripcion="Un producto por fila. El nombre y el precio son obligatorios: el precio se copia tal cual en el catálogo, nunca se recalcula.">
        <ul className="space-y-2">
          {d.productos.map((p, i) => (
            <EditorProducto key={p.id} p={p} indice={i} alCambiar={(c) => poner("productos", d.productos.map((x) => (x.id === p.id ? { ...x, ...c } : x)))} alQuitar={() => poner("productos", d.productos.filter((x) => x.id !== p.id))} />
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {d.productos.length < MAX_PRODUCTOS && (
            <button type="button" className="btn btn-secundario" onClick={() => poner("productos", [...d.productos, productoVacio(nuevoId("p"))])}>
              Agregar producto
            </button>
          )}
          <label htmlFor={idCsv} className="btn btn-secundario cursor-pointer">
            <Upload aria-hidden className="size-4" /> Importar .csv o Excel
            <input
              ref={inputCsv}
              id={idCsv}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importarCsv(f);
                e.target.value = "";
              }}
            />
          </label>
          <button type="button" className="btn btn-texto" onClick={() => descargar("plantilla-productos.csv", plantillaCsvVacia(), "text/csv;charset=utf-8")}>
            <Download aria-hidden className="size-4" /> Descargar plantilla .csv
          </button>
        </div>
        {errorCsv && (
          <p role="alert" className="text-xs font-medium text-warn">
            {errorCsv}
          </p>
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">
          El .csv debe traer una fila de encabezado con al menos <code>nombre</code> y <code>precio</code> (en cualquier orden; <code>precio_promo</code>, <code>categoria</code>, <code>sku</code> y <code>descripcion</code> son opcionales). Si tu archivo es de Excel, guárdalo primero como CSV (Archivo → Guardar como → CSV).
        </p>
      </Grupo>

      <Grupo icono={Palette} titulo="Plantilla del catálogo" descripcion="Cambia el color de acento del catálogo, del PDF y de las fichas para redes. Puedes cambiarla después de generar el catálogo.">
        <Selector etiqueta="Plantilla" valor={d.plantilla} opciones={PLANTILLAS.map((p) => ({ valor: p.valor, etiqueta: p.etiqueta }))} alCambiar={(v) => poner("plantilla", v)} />
      </Grupo>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <button
          type="button"
          className="btn btn-texto"
          onClick={() => {
            if (modoEjemplo || window.confirm("¿Borrar todos los datos del formulario? No se puede deshacer.")) alBorrar();
          }}
        >
          Borrar mis datos
        </button>
        <span>{modoEjemplo ? "Estás viendo datos de ejemplo: no se guardan en tu navegador." : "Lo que escribes se guarda solo en tu navegador."}</span>
      </div>
    </form>
  );
}
