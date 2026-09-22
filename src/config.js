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