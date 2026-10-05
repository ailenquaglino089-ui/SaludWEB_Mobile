/**
 * correlationId.js - Identificador de correlación de la app móvil
 * -------------------------------------------------------------
 * Módulo: "Calidad Profesional del Software - Trazabilidad"
 *
 * QUÉ RESUELVE
 * ------------
 * Cuando alguien reporta desde el teléfono que "no le cargan los turnos", hace
 * falta encontrar la petición exacta que falló. El identificador de correlación
 * viaja en la cabecera `X-Correlation-Id` y el backend lo copia en todas sus
 * líneas de log, así que un solo identificador une el error que se ve en la
 * pantalla con el log del servidor.
 *
 * POR QUÉ NO PERSISTE EN EL DISPOSITIVO
 * -------------------------------------
 * En la Web el identificador se guarda en localStorage para sobrevivir a una
 * recarga. En la app móvil no hace falta, y hay una razón concreta: al abrirla
 * de nuevo se crea una sesión nueva, con su propio contexto y su propio
 * historial de peticiones. Reutilizar un identificador de una sesión anterior
 * mezclaría en el log dos sesiones que no tienen relación, que es exactamente
 * el problema que este módulo viene a evitar.
 *
 * POR QUÉ ES UN ARCHIVO PROPIO Y NO UNA LÍNEA EN EL CLIENTE HTTP
 * --------------------------------------------------------------
 * Porque el identificador lo necesitan dos módulos distintos: el cliente HTTP
 * que lo manda en la cabecera y el logger que lo escribe en cada línea. Si cada
 * uno generara el suyo, los dos valores serían distintos y la correlación no
 * serviría de nada.
 */

// Prefijo que identifica de qué sistema salió el identificador.
const PREFIJO = 'cid';

// Cantidad de bytes aleatorios que se pasan a hexadecimal.
// 8 bytes son 16 caracteres: suficiente para que dos instalaciones del
// proyecto no generen el mismo identificador en la práctica.
const BYTES = 8;

// Caracteres admitidos en la cabecera. Se aceptan los de un UUID (guiones y
// guiones bajos) porque es lo que ya usan otros clientes. Se rechazan los
// espacios, que romperían la cabecera, y el salto de línea, que permitiría
// escribir una línea falsa en el archivo de log del backend.
const CARACTERES_ADMITIDOS = /^[A-Za-z0-9_-]{1,64}$/;

// Identificador de la sesión en curso. Vive en el módulo y no en un
// componente: tiene que existir antes de que se monte la primera pantalla.
let idActual = null;

/**
 * Dice si un identificador sirve para viajar en una cabecera.
 *
 * @param {*} id Valor a inspeccionar
 * @returns {boolean} true si el valor es un texto con los caracteres permitidos
 */
export function esValido(id) {
  // El typeof va primero a propósito: pasar un objeto a la expresión regular
  // lanzaría un error de tipo en lugar de devolver false.
  return typeof id === 'string' && CARACTERES_ADMITIDOS.test(id);
}

/**
 * Genera un identificador nuevo.
 *
 * Se usa expo-crypto, que es la fuente criptográfica del entorno móvil. Si no
 * estuviera disponible se cae a Math.random de forma explícita: el
 * identificador no es un secreto ni protege nada, solo ordena logs, así que
 * perder trazabilidad por romper la aplicación sería un mal negocio.
 *
 * @returns {string} Identificador con el formato que usa el backend
 */
export function generar() {
  const bytes = new Uint8Array(BYTES);

  const cripto = globalThis.crypto;
  if (cripto && typeof cripto.getRandomValues === 'function') {
    cripto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < BYTES; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Cada byte se convierte a hexadecimal de dos dígitos: sin el relleno, los
  // identificadores quedarían de longitudes distintas.
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return `${PREFIJO}_${hex}`;
}

/**
 * Devuelve el identificador vigente y lo crea si todavía no existe.
 *
 * No devuelve nunca vacío: cualquier línea de log tiene que poder decir a qué
 * petición pertenece.
 *
 * @returns {string} Identificador de la sesión
 */
export function actual() {
  if (idActual === null) {
    inicializar();
  }
  return idActual;
}

/**
 * Fija el identificador de la sesión, o reutiliza el ya fijado.
 *
 * @returns {string} Identificador de la sesión
 */
export function inicializar() {
  if (idActual === null) {
    idActual = generar();
  }
  return idActual;
}

/**
 * Borra el identificador en memoria.
 *
 * Lo usan el cierre de sesión y las pruebas. Que un mismo teléfono cambie de
 * usuario tiene que generar un contexto de log nuevo: si no, los logs de dos
 * usuarios distintos quedan mezclados en la misma correlación.
 *
 * @returns {void}
 */
export function olvidar() {
  idActual = null;
}