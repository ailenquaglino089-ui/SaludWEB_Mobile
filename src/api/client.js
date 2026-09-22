// ============================================================
// client.js - Cliente HTTP de la app (equivalente al interceptor axios del Web)
// ============================================================
// Envuelve fetch() para centralizar: URL base, token JWT, timeouts,
// manejo de errores y expulsión automática cuando el token no es válido (401).
import { API_URL, TIMEOUT_MS } from '../config';

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
      onUnauthorized();
    }

    // Si el status NO es de éxito, se lanza un error con el mensaje del backend.
    if (!respuesta.ok) {
      // El backend usa {mensaje} en errores de negocio y {error} en fallos internos.
      const msg = datos.mensaje || datos.error || `Error ${respuesta.status}`;
      throw new Error(msg);
    }

    // Éxito: se devuelve el campo "data" de la respuesta estandar {ok, mensaje, data}.
    return datos.data;
  } finally {
    // Siempre se cancela el timer del timeout para no dejar timers colgados.
    clearTimeout(timer);
  }
};