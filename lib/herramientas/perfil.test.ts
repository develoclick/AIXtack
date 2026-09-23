import assert from "node:assert/strict";
import { test } from "node:test";
import { CAMPOS_PERFIL, limpiarPerfil, parsearPerfil, perfilVacio } from "./perfil";
import { PERFIL_CLAVES } from "./tipos";

test("el perfil del documento tiene los 11 campos y coincide con las claves del esquema", () => {
  assert.equal(CAMPOS_PERFIL.length, 11);
  assert.deepEqual(CAMPOS_PERFIL.map((c) => c.clave), [...PERFIL_CLAVES]);
});

test("limpiarPerfil descarta claves desconocidas, valores que no son texto y recorta espacios", () => {
  const p = limpiarPerfil({ nombre: "  La Espiga  ", rubro: 5, hackeo: "x", tono: "", moneda: "S/" });
  assert.deepEqual(p, { nombre: "La Espiga", moneda: "S/" });
  assert.deepEqual(limpiarPerfil(null), {});
  assert.deepEqual(limpiarPerfil("texto"), {});
  assert.equal(limpiarPerfil({ nombre: "x".repeat(900) }).nombre!.length, 400);
});

test("parsearPerfil tolera JSON roto o vacío", () => {
  assert.deepEqual(parsearPerfil(null), {});
  assert.deepEqual(parsearPerfil("{no es json"), {});
  assert.deepEqual(parsearPerfil('{"nombre":"A"}'), { nombre: "A" });
});

test("perfilVacio", () => {
  assert.equal(perfilVacio({}), true);
  assert.equal(perfilVacio({ nombre: "A" }), false);
});

test("sin localStorage (bloqueado o modo privado) el perfil funciona en memoria y nada lanza errores", async () => {
  const { borrarPerfil, guardarPerfil, leerPerfilCrudo } = await import("./perfil");
  const g = globalThis as unknown as { window?: unknown };
  const previo = g.window;
  const bloqueado = () => {
    throw new Error("SecurityError");
  };
  g.window = { localStorage: { getItem: bloqueado, setItem: bloqueado, removeItem: bloqueado }, dispatchEvent: () => true };
  try {
    assert.doesNotThrow(() => guardarPerfil({ nombre: "La Espiga", rubro: "  " }));
    assert.deepEqual(parsearPerfil(leerPerfilCrudo()), { nombre: "La Espiga" });
    assert.doesNotThrow(() => borrarPerfil());
    assert.equal(leerPerfilCrudo(), null);
  } finally {
    g.window = previo;
  }
});
