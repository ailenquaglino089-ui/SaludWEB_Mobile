// ============================================================
// client.js - Cliente HTTP de la app (equivalente al interceptor axios del Web)
// ============================================================
// Envuelve fetch() para centralizar: URL base, token JWT, timeouts,
// manejo de errores y expulsión automática cuando el token no es válido (401).
import { API_URL, TIMEOUT_MS } from '../config';

import { actual as correlationId } from '../utils/correlationId.js';
// Importa el identificador de correlación de la app (módulo "Trazabilidad")

import * as logger from '../utils/logger.js';
// Importa el logger estructurado (módulo "Logging"). Antes de este cambio,
// cualquier fallo se traducía a un mensaje para la pantalla y se perdía: sin
// registro, un error que el usuario reporta no tiene con qué compararse en el
// log del servidor.

// Variable privada que guarda el token JWT de la sesión activa.
let token = null;

// Función que se ejecuta cuando la API responde 401 (token inválido/expirado).
// La registra AuthContext para poder cerrar la sesión desde afuera del cliente.
let onUnauthorized = null;

// Permite que AuthContext almacene el token actual en esta variable.
export const setToken = (jwt) => { token = jwt; };

// Permite que AuthContext registre el callback de expulsión (logout forzado en 401).
export const setUnauthorizedCallback = (callback) => { onUnauthorized = callback; };

// Convierte un objeto {clave: valor} en la cadena "?clave=valor&..." de la URL.
const construirQuery = (params) => {
  // Sin parámetros no se agrega nada a la URL.
  if (!params) return '';
  // Se conservan solo los valores que no sean null/vacío (ej: busqueda vacía).
  const partes = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    // encodeURIComponent escapa caracteres especiales del valor (busqueda con espacios, ñ, etc.)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  // Si quedó vacío, no se agrega la cadena de consulta.
  if (partes.length === 0) return '';
  // Al inicio de los parámetros se antepone el símbolo "?".
  return '?' + partes.join('&');
};

// Función principal: realiza una petición a la API y devuelve el objeto "data".
// Opciones: { method, body (objeto), params (objeto de query) }.
export const api = async (path, { method = 'GET', body = null, params = null } = {}) => {
  // Arma la URL final: base + ruta + parámetros de consulta.
  const url = API_URL + path + construirQuery(params);
  // Cabeceras comunes: JSON para enviar/recibir datos.
  const headers = { 'Content-Type': 'application/json' };
  // Si hay sesión, se adjunta el token con el esquema "Bearer <token>".
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Identificador de la petición. El backend lo copia en todas sus líneas de
  // log, así que un error reportado desde el teléfono se localiza con una
  // búsqueda en lugar de depender de la memoria de quien lo reporta. El logger
  // redacta el token si alguna vez se lo pasa, así que esto no filtra nada.
  headers['X-Correlation-Id'] = correlationId();

  // AbortController permite cancelar la petición si pasa el tiempo límite.
  const controller = new AbortController();
  // El timer corta la petición transcurrido TIMEOUT_MS milisegundos.
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // fetch realiza la petición HTTP con método, cabeceras y cuerpo (si existe).
    const respuesta = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    // Se intenta parsear la respuesta como JSON (los mensajes de la API son JSON).
    const datos = await respuesta.json().catch(() => ({}));

    // Si el backend responde 401, el token dejó de ser válido:
    // se informa a AuthContext para cerrar la sesión y volver al login.
    if (respuesta.status === 401 && onUnauthorized) {
      // Se deja registro antes de cerrar sesión: cerrar sesión borra el token
      // local, y sin esta línea el 401 más difícil de diagnosticar (el del
      // primer fallo tras una caída de servidor) se quedaría sin rastro.
      logger.warn('el servidor rechazó el token: se cierra la sesión', {
        metodo: method,
        ruta: path,
        motivo: datos.mensaje || datos.error
      });

      onUnauthorized();
    }

    // Si el status NO es de éxito, se lanza un error con el mensaje del backend.
    if (!respuesta.ok) {
      // El backend usa {mensaje} en errores de negocio y {error} en fallos internos.
      const msg = datos.mensaje || datos.error || `Error ${respuesta.status}`;

      // Se registra el rechazo con método, ruta y estado. No se pasa el cuerpo
      // completo: puede traer datos de otros pacientes, y el log no es el lugar
      // para eso.
      logger.error('la API rechazó la petición', {
        metodo: method,
        ruta: path,
        estado: respuesta.status,
        motivo: msg
      });

      throw new Error(msg);
    }

    // Éxito: se devuelve el campo "data" de la respuesta estandar {ok, mensaje, data}.
    return datos.data;
  } catch (err) {
    // Traducción de los errores que NO vienen del backend.
    //
    // Sin este bloque, una caída de red o un timeout llegaban a la pantalla
    // con el texto crudo de fetch ("Network request failed" o "Aborted"),
    // que viene en inglés y no le dice a la persona usuaria qué hacer. El
    // mensaje del backend ya está en español y se propaga sin tocar; acá solo
    // se interceptan los fallos de la red, que no son del servidor.
    if (err.name === 'AbortError') {
      // Se traduce el "aborted" de fetch a un mensaje entendible. Ojo: este
      // catch también ve los abort que dispara la propia pantalla al
      // desmontarse. No se distingue un caso del otro porque no hace falta:
      // en ambos la petición llegó tarde y el mensaje es el mismo.
      logger.warn('la petición se canceló por tiempo de espera', {
        metodo: method,
        ruta: path
      });

      throw new Error('La conexión tardó demasiado. Revisá tu red e intentá de nuevo.');
    }
    if (err.message === 'Network request failed' || err.name === 'TypeError') {
      // fetch NO lanza un error propio cuando no hay red: falla la lectura y
      // se manifiesta como TypeError. Sin este caso, quedarse sin conexión
      // se leía como un error de servidor.
      logger.warn('la petición no llegó al servidor', {
        metodo: method,
        ruta: path,
        motivo: err.message
      });

      throw new Error('No se pudo conectar con el servidor. Revisá tu conexión a internet.');
    }
    throw err;
  } finally {
    // Siempre se cancela el timer del timeout para no dejar timers colgados.
    // Va en finally y no después del try: si el try lanza, sin el finally el
    // timer quedaría vivo hasta completar TIMEOUT_MS aunque la petición ya
    // terminó, y en una lista que recarga seguido se acumulan timers.
    clearTimeout(timer);
  }
};