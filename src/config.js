// ============================================================
// config.js - Configuración central de la app móvil
// ============================================================
// Único lugar donde se define dónde vive la API de SaludWEB.
// Toda la app importa la URL desde aquí: si cambia el servidor,
// se cambia un solo archivo.
//
// ------------------------------------------------------------
// DE DÓNDE SALEN LOS VALORES
// ------------------------------------------------------------
// Cada constante se toma de una variable de entorno con prefijo
// EXPO_PUBLIC_ y, si no está definida, de un valor por defecto
// escrito acá. Por eso:
//   - No hay .env -> la app usa los defaults del código.
//   - Sí hay .env -> mandan los valores de ese archivo.
//
// Expo (SDK 49+) inyecta estas variables en el bundle en el momento
// del empaquetado: la referencia tiene que ser literal
// (process.env.EXPO_PUBLIC_API_URL), no puede armarse el nombre con
// una variable o no se reemplaza. Por eso no se itera un objeto
// genérico de entorno: Metro no lo podría detectar.

// Constante con la URL base de la API REST del backend.
// Notas para probar según el dispositivo:
//  - Emulador Android: el host se llama 10.0.2.2 en lugar de localhost.
//  - Celular físico: usar la IP local del equipo (ej: http://192.168.1.20).
//  - Navegador (expo start --web): funciona con localhost.
// La URL lleva /api final porque la app arma las rutas como
// `${API_URL}/auth/login`.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api';

// Umbral (en milisegundos) que espera el cliente antes de cortar una
// petición que no responde. Evita "cuelgues" infinitos en el celular.
// (Number(...) por si la variable llega como texto, que es siempre el
// caso en las variables de entorno: venden strings, no números.)
export const TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_TIMEOUT_MS) || 15000;

// Cantidad de registros que muestra cada página de los listados.
// Debe coincidir con el por_pagina que acepta el backend.
export const POR_PAGINA = Number(process.env.EXPO_PUBLIC_POR_PAGINA) || 10;

// ============================================================
// Configuración de SSO (Google / Microsoft)
// ============================================================
// Cada botón de la pantalla de Login se muestra SOLO si se completó
// la credencial del proveedor. Vacío = botón oculto (y el backend
// responde 501 si alguien intenta usarlo igual).
//
// • Google: creá un proyecto OAuth en Google Cloud Console y usá el
//   "Client ID de aplicación web" (el flujo es de tipo público/PKCE).
// • Microsoft: registrá una app en Entra ID (portal.azure.com) y usá
//   su "Application (client) ID" como cliente público (sin secret).
export const SSO = {
  // Client ID de Google (vacío = ocultar el botón "Continuar con Google").
  googleClientId: process.env.EXPO_PUBLIC_SSO_GOOGLE_CLIENT_ID || '',
  // Application (client) ID de Microsoft Entra ID (vacío = ocultar el botón).
  microsoftClientId: process.env.EXPO_PUBLIC_SSO_MICROSOFT_CLIENT_ID || '',
  // Tenant de Microsoft: 'common' acepta cuentas personales y corporativas.
  microsoftTenant: process.env.EXPO_PUBLIC_SSO_MICROSOFT_TENANT || 'common',
};
