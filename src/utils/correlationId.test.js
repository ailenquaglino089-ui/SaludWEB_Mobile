/**
 * correlationId.test.js - Pruebas del identificador de correlación móvil
 * --------------------------------------------------------------------
 * Módulo: "Calidad Profesional del Software - Testing"
 *
 * CASOS:
 *   • Camino feliz: se genera un id con el formato que espera el backend.
 *   • Bordes:      reutiliza el id dentro de la sesión, acepta UUID, no repite.
 *   • Fallas:      rechaza saltos de línea, espacios y valores que no son texto.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { generar, esValido, actual, inicializar, olvidar } from './correlationId.js';

// Cada prueba arranca sin identificador, para que el resultado no dependa del
// orden en que corran.
test.beforeEach(() => olvidar());
test.afterEach(() => olvidar());

/** Camino feliz: el formato es el mismo que usa el backend. */
test('el identificador generado tiene el formato del backend', () => {
  const id = generar();

  assert.match(id, /^cid_[a-f0-9]{16}$/);
  assert.ok(esValido(id));
});

/** Dos ids distintos: si se repitieran, se mezclarían los logs de dos sesiones. */
test('los identificadores generados son distintos', () => {
  const ids = new Set([generar(), generar(), generar(), generar(), generar()]);

  assert.equal(ids.size, 5);
});

/** Sin nada previo, se genera uno y queda disponible. */
test('inicializar genera un identificador cuando no hay ninguno', () => {
  const id = inicializar();

  assert.match(id, /^cid_/);
  assert.equal(actual(), id, 'actual() devuelve el mismo id');
});

/** Dentro de una sesión el id no cambia: es lo que correlaciona los eventos. */
test('inicializar dos veces no cambia el identificador', () => {
  const primero = inicializar();

  assert.equal(inicializar(), primero);
  assert.equal(actual(), primero);
});

/** Cerrar sesión reinicia la correlación, a propósito. */
test('olvidar limpia el identificador en memoria', () => {
  inicializar();
  olvidar();

  // actual() tiene que funcionar igual: genera uno nuevo en lugar de devolver
  // vacío, porque un log sin correlación no sirve para nada.
  assert.match(actual(), /^cid_[a-f0-9]{16}$/);
});

/** Borde: se acepta un id con guiones, como los UUID que ya usan otros. */
test('se aceptan identificadores con guiones y guiones bajos', () => {
  assert.ok(esValido('550e8400-e29b-41d4-a716-446655440000'));
  assert.ok(esValido('mobile_2026_a1b2'));
});

/**
 * Seguridad: un salto de línea en el id permitiría escribir una línea falsa en
 * el archivo de log del backend.
 */
test('un identificador con salto de línea se rechaza', () => {
  assert.equal(esValido('abc\n{"nivel":"INFO"}'), false);
  assert.equal(esValido('abc\r\ndef'), false);
});

/** Un espacio rompería la cabecera HTTP. */
test('un identificador con espacios se rechaza', () => {
  assert.equal(esValido('abc def'), false);
  assert.equal(esValido(' abc'), false);
});

/** Las etiquetas rompen los visores de logs que interpretan HTML. */
test('un identificador con etiquetas se rechaza', () => {
  assert.equal(esValido('<script>'), false);
  assert.equal(esValido('a>b'), false);
});

/** Cualquier tipo que no sea texto se rechaza sin lanzar excepción. */
test('un valor que no es texto se rechaza', () => {
  assert.equal(esValido(null), false);
  assert.equal(esValido(undefined), false);
  assert.equal(esValido(12345), false);
  assert.equal(esValido({}), false);
  assert.equal(esValido(['abc']), false);
});

/** El límite de longitud se respeta en el borde. */
test('un identificador demasiado largo se rechaza', () => {
  assert.equal(esValido('a'.repeat(65)), false);
  assert.equal(esValido('a'.repeat(64)), true);
});

/**
 * La app corre sobre navegadores embebidos y motores que pueden no exponer
 * crypto. El identificador tiene que generarse igual: no es un secreto y solo
 * ordena logs.
 */
test('sin crypto disponible igual se genera un identificador válido', () => {
  // crypto es una propiedad de solo lectura en Node, así que se reemplaza con
  // defineProperty en lugar de asignarla. El objetivo es simular el motor
  // embebido que no expone la API criptográfica.
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  try {
    Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });

    assert.match(generar(), /^cid_[a-f0-9]{16}$/);
  } finally {
    Object.defineProperty(globalThis, 'crypto', descriptor);
  }
});