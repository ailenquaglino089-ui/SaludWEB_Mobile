/**
 * logger.test.js - Pruebas del logger de la app móvil
 * ----------------------------------------------------
 * Módulo: "Calidad Profesional del Software - Testing"
 *
 * CASOS:
 *   • Camino feliz: línea JSON con los campos obligatorios.
 *   • Bordes:      filtrado por nivel, nivel desconocido, truncado.
 *   • Fallas:      los secretos NO se escriben, ni en objetos anidados.
 *
 * El caso de los secretos es el central: en un teléfono, un token que llega a
 * la consola queda en una pantalla que se puede fotografiar. La prueba verifica
 * el comportamiento contrario al habitual, que es que esa información
 * desaparezca antes de escribirse.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  configurar,
  info,
  warn,
  error,
  debug,
  registro,
  nivelActual,
  correlationId,
  restablecer,
  limpiarContexto,
} from './logger.js';
import { olvidar, inicializar } from './correlationId.js';

/**
 * Captura lo que el logger escribe, inyectando un destino propio en lugar de
 * espiar la consola: así la prueba no depende de cómo esté hecho el destino
 * real, solo de lo que el logger decide escribir.
 *
 * @returns {{lineas: Array<{etiqueta: string, texto: string}>, restaurar: Function}}
 */
function capturar() {
  const lineas = [];
  configurar({
    destino: (etiqueta, texto) => lineas.push({ etiqueta, texto }),
  });

  return { lineas, restaurar: restablecer };
}

test.beforeEach(() => {
  olvidar();
  restablecer();
});

test.afterEach(() => {
  olvidar();
  restablecer();
});

/** Camino feliz: la línea tiene la forma que el contrato promete. */
test('la línea de log es JSON con los campos obligatorios', () => {
  const cap = capturar();

  info('turnos cargados', { paciente_id: 12 });

  assert.equal(cap.lineas.length, 1);

  const { etiqueta, texto } = cap.lineas[0];
  const linea = JSON.parse(texto);

  assert.equal(etiqueta, 'INFO');
  assert.equal(linea.nivel, 'INFO');
  assert.equal(linea.mensaje, 'turnos cargados');
  assert.equal(linea.contexto.paciente_id, 12);
  assert.match(linea.ts, /^\d{4}-\d{2}-\d{2}T/, 'la fecha va en ISO');
  assert.match(linea.correlation_id, /^cid_[a-f0-9]{16}$/);

  cap.restaurar();
});

/** Los eventos de una sesión comparten identificador. */
test('todos los eventos comparten el identificador de correlación', () => {
  const cap = capturar();

  info('uno');
  warn('dos');

  const ids = cap.lineas.map((linea) => JSON.parse(linea.texto).correlation_id);

  assert.equal(ids[0], ids[1]);
  cap.restaurar();
});

/** Borde: el nivel mínimo filtra lo que queda por debajo. */
test('el nivel mínimo filtra por debajo y deja pasar por encima', () => {
  const cap = capturar();
  configurar({ nivel: 'warn' });

  debug('fuera');
  info('fuera');
  warn('dentro');
  error('dentro');

  assert.deepEqual(
    cap.lineas.map((linea) => JSON.parse(linea.texto).mensaje),
    ['dentro', 'dentro']
  );

  cap.restaurar();
});

/** Un nivel inexistente se ignora en vez de romper la aplicación. */
test('un nivel desconocido no se escribe', () => {
  const cap = capturar();

  registro('inventado', 'no es un nivel');

  assert.equal(cap.lineas.length, 0);
  cap.restaurar();
});

/** Un nivel mal escrito en la configuración no deja al sistema sin logs. */
test('un nivel mal configurado conserva el nivel anterior', () => {
  assert.equal(nivelActual(), 'info');

  configurar({ nivel: 'ERROR' });
  assert.equal(nivelActual(), 'error');

  configurar({ nivel: 'VERBOSE' });
  assert.equal(nivelActual(), 'error', 'un valor inválido no puede silenciar los errores');
});

/** Falla principal: las contraseñas no se escriben. */
test('una contraseña en el contexto queda redactada', () => {
  const cap = capturar();

  error('fallo en el login', { password: 'MiClave123', usuario_id: 7 });

  const linea = JSON.parse(cap.lineas[0].texto);

  assert.equal(linea.contexto.password, '[oculto]');
  assert.ok(!cap.lineas[0].texto.includes('MiClave123'));
  assert.equal(linea.contexto.usuario_id, 7);

  cap.restaurar();
});

/** Ninguna de las claves habituales de token deja pasar su valor. */
test('los tokens quedan redactados en todas sus formas', () => {
  const cap = capturar();

  error('falla', {
    token: 'eyJhbGciOiJIUzI1NiJ9.cuerpo.firma',
    jwt: 'abc.def.ghi',
    refresh_token: 'otro',
    authorization: 'Bearer abc',
  });

  const { texto } = cap.lineas[0];
  const linea = JSON.parse(texto);

  for (const clave of ['token', 'jwt', 'refresh_token', 'authorization']) {
    assert.equal(linea.contexto[clave], '[oculto]', `${clave} debe quedar redactada`);
  }
  assert.ok(!texto.includes('eyJhbGci'));
});

/**
 * El caso que hace necesaria la recursión: el token real viaja dentro de
 * `request.headers.Authorization` del error de fetch. Una redacción que solo
 * mirara el primer nivel lo dejaría pasar limpio.
 */
test('los secretos anidados también quedan redactados', () => {
  const cap = capturar();

  error('error de red', {
    request: {
      url: '/api/turnos',
      headers: { Authorization: 'Bearer token-secreto-123' },
    },
  });

  const { texto } = cap.lineas[0];
  const linea = JSON.parse(texto);

  assert.equal(linea.contexto.request.headers.Authorization, '[oculto]');
  assert.ok(!texto.includes('token-secreto-123'));
  // Lo que no es secreto se conserva: sin esto el log no serviría.
  assert.equal(linea.contexto.request.url, '/api/turnos');

  cap.restaurar();
});

/** Los datos personales se enmascaran a medias, para poder correlacionar. */
test('los datos personales quedan enmascarados parcialmente', () => {
  const cap = capturar();

  info('búsqueda', { email: 'paciente@mail.com', dni: '30111222' });

  const { contexto } = JSON.parse(cap.lineas[0].texto);

  assert.ok(contexto.email.startsWith('paci'));
  assert.ok(contexto.email.includes('*'));
  assert.ok(!contexto.email.includes('mail.com'));
  assert.ok(contexto.dni.startsWith('3011'));

  cap.restaurar();
});

/** Un valor corto se redacta entero: mostrar cuatro de cinco no protege nada. */
test('un dato personal muy corto se redacta completo', () => {
  const cap = capturar();

  info('dato corto', { email: 'a@b.c' });

  assert.equal(JSON.parse(cap.lineas[0].texto).contexto.email, '[oculto]');
  cap.restaurar();
});

/** El truncado evita que una respuesta gigante inunde el log. */
test('un valor gigante se trunca con aviso', () => {
  const cap = capturar();

  info('listado enorme', { datos: 'x'.repeat(900) });

  const { datos } = JSON.parse(cap.lineas[0].texto).contexto;

  assert.ok(datos.endsWith('...[truncado]'));
  assert.ok(datos.length < 900);

  cap.restaurar();
});

/** Los arrays se limpian elemento por elemento. */
test('los arrays se limpian elemento por elemento', () => {
  const cap = capturar();

  info('pacientes', { lista: [{ email: 'ana@mail.com' }, { email: 'beto@mail.com' }] });

  const { lista } = JSON.parse(cap.lineas[0].texto).contexto;

  assert.equal(lista.length, 2);
  assert.ok(lista[0].email.startsWith('ana'));
  assert.ok(!lista[1].email.includes('mail.com'));

  cap.restaurar();
});

/** Un error se reduce a su mensaje: el stack dentro de la app es ruido. */
test('un error se reduce a su mensaje', () => {
  assert.equal(limpiarContexto(new Error('no se pudo conectar')), 'no se pudo conectar');
});

/** Si el destino falla, la aplicación no se cae. */
test('un destino que lanza no rompe la aplicación', () => {
  configurar({
    destino: () => {
      throw new Error('consola bloqueada');
    },
  });

  assert.doesNotThrow(() => error('no importa dónde se escriba'));
});

/**
 * Particularidad de la app móvil: el identificador se regenera al cerrar
 * sesión, porque una sesión nueva no debe quedar pegada a los logs de la
 * anterior.
 */
test('olvidar genera una correlación nueva para la sesión siguiente', () => {
  olvidar();
  const idSesionUno = inicializar();

  olvidar();
  const idSesionDos = inicializar();

  assert.notEqual(idSesionUno, idSesionDos);
  assert.equal(correlationId(), idSesionDos);
});