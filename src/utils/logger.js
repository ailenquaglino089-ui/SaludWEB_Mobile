/**
 * logger.js - Registro estructurado de eventos en la app móvil
 * ------------------------------------------------------------
 * Módulo: "Calidad Profesional del Software - Logging"
 *
 * QUÉ RESUELVE
 * ------------
 * Un `console.log('error aqui')` no permite diagnosticar nada: no tiene
 * fecha, no dice a qué petición corresponde y no distingue un aviso de un
 * fallo. Este logger escribe siempre el mismo formato, una línea JSON con los
 * mismos campos, para que un registro se pueda filtrar y pegar en un ticket
 * sin editarlo antes.
 *
 * LA REGLA INNEGOCIABLE: NADA DE SECRETOS
 * ---------------------------------------
 * Los logs de un teléfono quedan accesibles en una pantalla compartida, en un
 * video de soporte o en un reporte de error. Por eso contraseñas, tokens y
 * datos clínicos se redactan ANTES de escribir, y la redacción vive en este
 * archivo para que ningún módulo tenga que acordarse de hacerla.
 *
 * POR QUÉ EL DESTINO SE PASA POR PARÁMETRO
 * -----------------------------------------
 * En el dispositivo el destino natural es la consola. Para comprobar el
 * enmascarado en las pruebas hace falta capturar lo que se escribe, así que
 * `configurar()` acepta un destino propio. La dependencia se invierte donde se
 * necesita, en vez de atar la lógica de negocio a `console`.
 */

import { actual as idActual } from './correlationId.js';
// Importa el identificador de correlación: cada línea dice a qué petición
// pertenece, que es lo que permite unirla con los logs del backend.

// ------------------------------------------------------------------
// Niveles
// ------------------------------------------------------------------
// Peso por nivel para comparar sin comparar palabras: "WARN" > "INFO" con `>`
// es una comparación de strings que no significa nada, y un nivel mal
// comparado termina ocultando justo los errores que había que ver.
const PESOS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

// Niveles aceptados, para descartar lo que venga de la configuración.
const NIVELES = Object.keys(PESOS);

// Etiquetas que se escriben en la línea de log.
const ETIQUETA = {
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
};

// ------------------------------------------------------------------
// Redacción de datos sensibles
// ------------------------------------------------------------------
// Claves cuyo valor se reemplaza COMPLETAMENTE. Son secretos: un token
// "enmascarado" sigue siendo medio token, y medio token es un token.
const CLAVES_REDACTADAS = [
  'password',
  'passwd',
  'pwd',
  'contrasena',
  'contrasenia',
  'token',
  'jwt',
  'refresh_token',
  'authorization',
  'secret',
  'apikey',
  'api_key',
  'cookie',
  'motivo',
  'notas',
  'indicaciones',
  'diagnostico',
];

// Claves que se enmascaran PARCIALMENTE: quedan cuatro caracteres para poder
// correlacionar sin exponer el dato. Sirve para distinguir dos registros del
// mismo paciente sin mostrar el DNI completo.
const CLAVES_PARCIALES = [
  'email',
  'correo',
  'dni',
  'documento',
  'telefono',
  'celular',
  'nombre',
  'apellido',
  'matricula',
];

// Etiqueta que reemplaza a los secretos.
const ETIQUETA_OCULTA = '[oculto]';

// Cuántos caracteres se dejan visibles de un dato parcial.
const CARACTERES_VISIBLES = 4;

// Largo mínimo para que el enmascarado parcial tenga sentido. Con menos
// caracteres que el doble de lo visible, tapar "algo" no oculta nada: de
// "a@b.c" se vería "a@b.*", o sea casi el dato entero.
const LARGO_MINIMO_ENMASCARABLE = CARACTERES_VISIBLES * 2;

// Tope de longitud por valor: una respuesta de mil registros no puede quedar
// entera en el log ni en un ticket.
const LARGO_MAXIMO = 500;

/**
 * Deja los primeros caracteres y reemplaza el resto por asteriscos.
 *
 * @param {string} texto Valor a enmascarar
 * @returns {string} Texto parcialmente visible o etiqueta de ocultamiento
 */
function enmascarar(texto) {
  if (texto.length < LARGO_MINIMO_ENMASCARABLE) {
    return ETIQUETA_OCULTA;
  }
  return `${texto.slice(0, CARACTERES_VISIBLES)}${'*'.repeat(texto.length - CARACTERES_VISIBLES)}`;
}

/**
 * Recorta un texto largo y avisa que se recortó.
 *
 * @param {string} texto Valor a recortar
 * @returns {string} Texto acotado
 */
function truncar(texto) {
  if (texto.length <= LARGO_MAXIMO) {
    return texto;
  }
  // El aviso importa: un log truncado en silencio hace creer que el dato
  // terminaba ahí.
  return `${texto.slice(0, LARGO_MAXIMO)}...[truncado]`;
}

/**
 * Aplica la redacción a un contexto, entrando a los objetos anidados.
 *
 * Es recursiva porque el contexto real viene del error de fetch, que trae
 * `{ request: { headers: { Authorization } } }`. Si solo mirara el primer nivel,
 * el token pasaría limpio, porque la clave está tres niveles más abajo.
 *
 * @param {*} valor Dato a limpiar
 * @param {string} clave Clave del dato en su nivel (vacía en la raíz)
 * @returns {*} Dato limpio, con la misma forma
 */
function limpiar(valor, clave = '') {
  if (typeof valor === 'string') {
    const nombre = clave.toLowerCase();

    if (CLAVES_REDACTADAS.includes(nombre)) {
      return ETIQUETA_OCULTA;
    }
    if (CLAVES_PARCIALES.includes(nombre)) {
      return enmascarar(truncar(valor));
    }
    return truncar(valor);
  }

  // Números, booleanos, null y undefined no tienen nada que ocultar.
  if (typeof valor === 'number' || typeof valor === 'boolean' || valor === null || valor === undefined) {
    return valor;
  }

  // Un error se reduce a su mensaje: el stack dentro de la app es ruido.
  if (valor instanceof Error) {
    return truncar(valor.message);
  }

  if (Array.isArray(valor)) {
    return valor.map((elemento) => limpiar(elemento));
  }

  if (typeof valor === 'object') {
    const resultado = {};

    for (const [nombre, contenido] of Object.entries(valor)) {
      resultado[nombre] = limpiar(contenido, nombre);
    }
    return resultado;
  }

  // Cualquier otro tipo (funciones, símbolos) no aporta al diagnóstico.
  return undefined;
}

// ------------------------------------------------------------------
// Estado del logger
// ------------------------------------------------------------------

// Nivel mínimo que se escribe.
let nivelMinimo = 'info';

// Destino de las líneas. En el dispositivo es la consola.
let destino = lineaPorDefecto;

/**
 * Escribe una línea ya formateada.
 *
 * Cada nivel usa un método de consola distinto a propósito: Metro y las
 * herramientas de desarrollo permiten filtrar por "error" y "warning", y ese
 * filtro solo funciona si el mensaje se escribió con el método correspondiente.
 *
 * @param {string} etiqueta Nivel en mayúsculas
 * @param {string} linea Línea JSON completa
 * @returns {void}
 */
function lineaPorDefecto(etiqueta, linea) {
  if (etiqueta === ETIQUETA.error) {
    console.error(linea);
  } else if (etiqueta === ETIQUETA.warn) {
    console.warn(linea);
  } else if (etiqueta === ETIQUETA.debug) {
    console.debug(linea);
  } else {
    console.info(linea);
  }
}

/**
 * Cambia la configuración del logger.
 *
 * @param {{nivel?: string, destino?: Function}} opciones Configuración parcial
 * @returns {void}
 */
export function configurar({ nivel, destino: nuevoDestino } = {}) {
  if (typeof nivel === 'string' && NIVELES.includes(nivel.toLowerCase())) {
    nivelMinimo = nivel.toLowerCase();
  }

  if (typeof nuevoDestino === 'function') {
    destino = nuevoDestino;
  }
}

/**
 * @returns {string} Nivel mínimo que se está escribiendo
 */
export function nivelActual() {
  return nivelMinimo;
}

/**
 * @returns {string} Identificador de correlación vigente
 */
export function correlationId() {
  return idActual();
}

/**
 * Decide si un nivel se escribe.
 *
 * Un nivel desconocido NO se escribe. Perder un mensaje es aceptable; inventar
 * una severidad equivocada, no.
 *
 * @param {string} nivel Nivel a comprobar
 * @returns {boolean} true si corresponde escribirlo
 */
function corresponde(nivel) {
  const peso = PESOS[nivel];
  return peso !== undefined && peso >= PESOS[nivelMinimo];
}

/**
 * Escribe un evento.
 *
 * @param {string} nivel Uno de debug, info, warn o error
 * @param {string} mensaje Texto corto que describe qué pasó
 * @param {object} contexto Datos extra, que se limpian antes de escribirse
 * @returns {void}
 */
export function registro(nivel, mensaje, contexto = {}) {
  const nombre = String(nivel).toLowerCase();

  if (!corresponde(nombre)) {
    return;
  }

  const linea = {
    // Fecha en ISO 8601: ordenable con un simple sort y con zona horaria
    // explícita, que es lo que hace comparables los logs de dos dispositivos.
    ts: new Date().toISOString(),
    nivel: ETIQUETA[nombre],
    // La columna que permite unir esta línea con las del backend.
    correlation_id: correlationId(),
    mensaje,
    contexto: limpiar(contexto),
  };

  try {
    destino(ETIQUETA[nombre], JSON.stringify(linea));
  } catch (error) {
    // Un destino que falla no puede romper la pantalla del usuario. Un logger
    // no puede ser la causa del problema que ayuda a diagnosticar.
    console.warn('[saludweb] no se pudo escribir el log:', error);
  }
}

/** Evento de detalle interno, de desarrollo. @param {string} mensaje @param {object} contexto @returns {void} */
export function debug(mensaje, contexto) {
  registro('debug', mensaje, contexto);
}

/** Evento normal del sistema. @param {string} mensaje @param {object} contexto @returns {void} */
export function info(mensaje, contexto) {
  registro('info', mensaje, contexto);
}

/** Situación anómala pero recuperable. @param {string} mensaje @param {object} contexto @returns {void} */
export function warn(mensaje, contexto) {
  registro('warn', mensaje, contexto);
}

/** Fallo que requiere atención. @param {string} mensaje @param {object} contexto @returns {void} */
export function error(mensaje, contexto) {
  registro('error', mensaje, contexto);
}

/**
 * Deja el logger como estaba. Lo usan las pruebas, que necesitan partir siempre
 * del mismo estado y no arrastrar el nivel o el destino de otra prueba.
 *
 * @returns {void}
 */
export function restablecer() {
  nivelMinimo = 'info';
  destino = lineaPorDefecto;
}

/**
 * Se exporta para que las pruebas comprueben la redacción sin descifrar una
 * línea JSON.
 */
export const limpiarContexto = limpiar;