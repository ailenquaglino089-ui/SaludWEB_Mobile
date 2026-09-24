// ============================================================
// config.js - Configuración central de la app móvil
// ============================================================
// Único lugar donde se define dónde vive la API de SaludWEB.
// Toda la app importa la URL desde aquí: si cambia el servidor,
// se cambia un solo archivo.

// Constante con la URL base de la API REST del backend.
// Notas para probar según el dispositivo:
//  - Emulador Android: el host se llama 10.0.2.2 en lugar de localhost.
//  - Celular físico: usar la IP local del equipo (ej: http://192.168.1.20).
//  - Navegador (expo start --web): funciona con localhost.
export const API_URL = 'http://localhost/Workspace_SaludWEB/SaludWEB_Backend/api';

// Umbral (en milisegundos) que espera el cliente antes de cortar una
// petición que no responde. Evita "cuelgues" infinitos en el celular.
export const TIMEOUT_MS = 15000;

// Cantidad de registros que muestra cada página de los listados.
// Debe coincidir con el por_pagina que acepta el backend.
export const POR_PAGINA = 10;

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
  googleClientId: '',
  // Application (client) ID de Microsoft Entra ID (vacío = ocultar el botón).
  microsoftClientId: '',
  // Tenant de Microsoft: 'common' acepta cuentas personales y corporativas.
  microsoftTenant: 'common',
};