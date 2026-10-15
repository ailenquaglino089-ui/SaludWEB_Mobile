# Guía de código — Mobile · Núcleo, api, context y utils

> Recorrido línea por línea del arranque, acceso a datos y utilidades.
> Índice general en ../GUIA_DE_CODIGO.md

## `App.js` (131 líneas)
- **Rol:** Punto de entrada de la app Expo. Monta `AuthProvider` y resuelve la navegación por estado (pantalla activa + barra inferior fija), sin react-navigation.
- **Recorrido línea por línea:**
  - L1–L26: cabecera de comentarios. Explica por qué NO se usa react-navigation: 4 secciones planas + una barra fija; el flujo de sesión se lee de punta a punta en este archivo; el costo es que el botón "atrás" del SO no funcione dentro de la app. Aclara que si aparece un flujo multi-paso habría que migrar a react-navigation.
  - L27–L28: importa `React, { useState }` y `StatusBar` de expo-status-bar.
  - L29–L32: comentario sobre SafeAreaView (notch) + import de `View, SafeAreaView` desde react-native.
  - L33–L34: comentario + import de `AuthProvider, useAuth` desde `./src/context/AuthContext`.
  - L35–L36: comentario + import del componente `BottomNav`.
  - L37–L43: comentario "Pantallas de la aplicación" + imports de `Login`, `Bloqueo`, `Dashboard`, `Pacientes`, `Medicos` y `Prescripciones`.
  - L44–L50: línea en blanco y arranque de `ContenidoApp()`. `useState('dashboard')` guarda la pantalla activa; `useAuth()` desestructura `autenticado, cargando, desbloqueado, logout`.
  - L51–L77: comentarios que justifican los tres `return` tempranos y su ORDEN (cargando → autenticado → desbloqueado). L64: `if (cargando) return <View style={{ flex: 1 }} />` (vacío, sin spinner). L66–L67: `if (!autenticado) return <Login />`. L69–L77: comentario de seguridad + `if (!desbloqueado) return <Bloqueo />` (sesión restaurada pero bloqueada por huella).
  - L78–L94: comentario + `pantallaActiva()`, un `switch` sobre `pantalla` (no un mapa de componentes). Devuelve `Pacientes` (L86), `Medicos` (L88), `Prescripciones` (L90) y `Dashboard` por defecto (L92).
  - L95–L102: comentario + `cerrarSesion()`, que llama a `logout()` y resetea la pantalla a `'dashboard'` (evita reabrir en la pantalla del usuario anterior).
  - L103–L109: comentario que explica por qué `SafeAreaView` envuelve TODO el contenido (el problema del notch es arriba).
  - L110–L119: `return` del `SafeAreaView` con `flex:1`; adentro, `<View>` con la pantalla activa y `<BottomNav pantalla={pantalla} navegar={setPantalla} cerrarSesion={cerrarSesion} />`. Cierra `ContenidoApp`.
  - L120–L131: línea en blanco + comentario y `export default function App()`, que envuelve todo en `<AuthProvider>`, renderiza `<StatusBar style="dark" />` y `<ContenidoApp />`.
- **Se conecta con:** `./src/context/AuthContext` (sesión), `./src/components/BottomNav` (navegación) y las seis pantallas en `./src/screens`.

## `app.json` (19 líneas)
- **Rol:** Configuración de Expo: identidad, orientación, arquitectura y plugins.
- **Recorrido línea por línea:**
  - L1: apertura del objeto JSON raíz.
  - L2–L8: bloque `expo` con `name: "SaludWEB"`, `slug: "saludweb-mobile"`, `version: "1.0.0"`, `orientation: "portrait"`, `userInterfaceStyle: "light"` y `newArchEnabled: false`.
  - L9–L11: bloque `android` con `package: "com.saludweb.mobile"`.
  - L12–L14: bloque `ios` con `bundleIdentifier: "com.saludweb.mobile"`.
  - L15–L17: array `plugins` con `"expo-web-browser"` (usado por el flujo SSO).
  - L18–L19: cierre del bloque `expo` y del JSON.
- **Se conecta con:** el flujo SSO del Login (depende de `expo-web-browser`) y con la configuración de build.

## `package.json` (26 líneas)
- **Rol:** Manifiesto del proyecto: metadatos, scripts y dependencias.
- **Recorrido línea por línea:**
  - L1: apertura del JSON.
  - L2–L6: `name: "saludweb-mobile"`, `version`, `description` (consume la misma API REST que el Web con roles JWT), `main: "expo/AppEntry.js"` y `private: true`.
  - L7–L14: `scripts`: `start`, `android`, `ios`, `web`, `export` y `test` (corre `node --test` sobre los dos archivos de prueba de utils).
  - L15–L25: `dependencies`: AsyncStorage, `expo ^53`, `expo-auth-session`, `expo-crypto`, `expo-local-authentication`, `expo-status-bar`, `expo-web-browser`, `react 19` y `react-native 0.79.6`.
  - L26: cierre del JSON.
- **Se conecta con:** `app.json` (build), el script `test` con `src/utils/logger.test.js` y `src/utils/correlationId.test.js`, y todos los imports de librerías del código.

## `src/config.js` (62 líneas)
- **Rol:** Configuración central. Único lugar donde se define la URL de la API, el timeout y el paginado, más las credenciales de SSO.
- **Recorrido línea por línea:**
  - L1–L21: cabecera de comentarios. Explica que cada constante sale de una variable `EXPO_PUBLIC_*` con default en código, y que Expo inyecta las variables en el bundle solo si la referencia es literal (no se puede iterar un objeto de entorno).
  - L22–L32: comentario con notas de prueba por dispositivo (emulador Android `10.0.2.2`, celular físico IP local, web localhost) + `export const API_URL`, que toma `process.env.EXPO_PUBLIC_API_URL` o el default `'http://127.0.0.1:8000/api'`.
  - L33–L38: comentario + `export const TIMEOUT_MS`, `Number(process.env.EXPO_PUBLIC_TIMEOUT_MS) || 15000` (el `Number` porque las variables de entorno llegan como texto).
  - L39–L42: comentario + `export const POR_PAGINA`, `Number(process.env.EXPO_PUBLIC_POR_PAGINA) || 10` (debe coincidir con el `por_pagina` del backend).
  - L43–L54: separador y comentario de SSO: cada botón se muestra solo si hay credencial; vacío = botón oculto y el backend responde 501. Aclara cómo crear el Client ID de Google (OAuth público/PKCE) y el de Microsoft (Entra ID, cliente público sin secret).
  - L55–L62: `export const SSO` con `googleClientId`, `microsoftClientId` (ambos con default `''`) y `microsoftTenant` (default `'common'`).
- **Se conecta con:** `src/api/client.js` (importa `API_URL` y `TIMEOUT_MS`), los listados (usan `POR_PAGINA`) y la pantalla de Login (usa `SSO`).

## `src/styles.js` (375 líneas)
- **Rol:** Estilos compartidos y paleta de la app. React Native no lee custom properties de CSS, así que los hex están escritos a mano y deben coincidir con `SaludWEB_Web/src/tokens.css`.
- **Recorrido línea por línea:**
  - L1–L19: cabecera. Explica que la paleta se mantiene a mano en los dos repos (móvil y web), que los comentarios registran el POR QUÉ de cada valor y que se omiten los comentarios obvios.
  - L20–L23: import de `StyleSheet` + comentario + `export const styles = StyleSheet.create({`.
  - L24–L31: `contenedor`: `flex:1`, fondo `#f5f5f5` (para que las tarjetas blancas se lean como superficies) y `padding:16`.
  - L32–L46: `tarjeta`: fondo blanco, `borderRadius:12`, `padding:16`, `marginBottom:12` y la sombra doble (`shadowColor/Opacity/Radius` para iOS y `elevation` para Android, que RN no unifica).
  - L47–L53: `titulo`: `fontSize:22`, `fontWeight:'700'`, color `#333` con nota de contraste 12.63:1 y `marginBottom:12`.
  - L54–L58: `tituloWrapper`: centra la cabecera del login (`alignItems:'center'`, `marginBottom:20`).
  - L59–L65: `label`: 16px (mínimo mobile), seminegrita, color `#333` (contraste > 7:1) y `marginBottom:6`.
  - L66–L76: `input`: borde 2px `#e0e0e0`, `borderRadius:8`, `padding:12`, `minHeight:44` (target táctil), 16px, fondo `#fff` y `marginBottom:12`.
  - L77–L89: comentario de contraste + `botonPrimario`: fondo `#5a6fd0` (violeta de marca a 4.55:1; antes `#667eea` daba 3.66:1 y fallaba AA), `minHeight:48`, centrado, `padding:14`, `borderRadius:8` y `marginBottom:12`.
  - L90–L95: `botonPrimarioTexto`: blanco, seminegrita, 16px.
  - L96–L99: `botonPrimarioOscurecido`: `opacity:0.6` para el estado deshabilitado del candado.
  - L100–L108: `botonSecundario`: fondo `#e0e0e0`, `minHeight:44`, centrado, `padding:10`, `borderRadius:8`.
  - L109–L118: comentario de contraste + `botonPeligro`: fondo `#b3261e` (rojo a 6.54:1; antes `#ef4444` daba 3.76:1), `minHeight:44`, centrado y `borderRadius:8`.
  - L119–L123: `texto`: 16px y color `#555` (contraste > 7:1).
  - L124–L133: `error`: texto `#991b1b`, fondo `#fef2f2`, `padding:10`, `borderRadius:8`, borde 2px `#fca5a5`.
  - L134–L141: `fila`: `flexDirection:'row'`, `justifyContent:'space-between'`, `paddingVertical:8` y borde inferior fino `#e0e0e0`.
  - L142–L147: `filaLabel`: 16px, color `#555`, `flex:1`.
  - L148–L154: `filaValor`: 16px, color `#333`, seminegrita, alineado a la derecha.
  - L155–L158: blanco + separador "Estilos nuevos aplicados desde la guía Adaptar el sistema a mobile" + comentario de la barra inferior.
  - L159–L166: `barraNavegacion`: fila horizontal, fondo blanco, borde superior, `paddingVertical:6` y `paddingHorizontal:4`.
  - L167–L174: `navItem`: `flex:1`, centrado, `minHeight:44` y `paddingVertical:4` (zona del pulgar).
  - L175–L181: `navActivo`: 12px, color `#5a6fd0` (4.55:1; antes `#667eea` no pasaba AA) y negrita.
  - L182–L186: `navInactivo`: 12px y color `#555`.
  - L187–L197: `contrasenaWrapper`: fila horizontal, centrado, borde 2px `#e0e0e0`, `borderRadius:8`, fondo `#fff` y `marginBottom:12`.
  - L198–L203: `botonMostrar`: `paddingHorizontal:12`, `minHeight:44`, centrado.
  - L204–L207: `botonMostrarTexto`: `fontSize:18`.
  - L208–L214: `errorCampo`: color `#991b1b`, 14px, `marginTop:-6` y `marginBottom:12`.
  - L215–L218: blanco + separador "Estilos nuevos del CRUD completo" + comentario del banner de éxito.
  - L219–L227: `exito`: texto `#166534`, fondo `#dcfce7`, `padding:10`, `borderRadius:8`, borde 2px `#86efac`.
  - L228–L241: comentario de contraste + `botonNuevo`: fondo `#166534` (verde a 7.13:1; antes `#22c55e` daba 2.28:1, el peor de la app), `minHeight:48`, centrado, `borderRadius:8`, `padding:14` y `marginBottom:12`.
  - L242–L247: `botonNuevoTexto`: blanco, negrita, 16px.
  - L248–L258: `botonAccion`: `minHeight:44`, centrado, `borderRadius:8`, `paddingHorizontal:12`, `paddingVertical:8` y `marginRight:8`.
  - L259–L262: `botonAccionClaro`: fondo índigo claro `#e0e7ff` (variante "Editar").
  - L263–L266: `botonAccionPeligro`: fondo rojo claro `#fee2e2` (variante "Eliminar").
  - L267–L272: `textoAccion`: color `#4338ca`, seminegrita, 14px.
  - L273–L278: `textoAccionPeligro`: color `#b91c1c`, seminegrita, 14px.
  - L279–L284: `pieAcciones`: fila, alineada a la derecha, `marginTop:10`.
  - L285–L295: comentario del pie fijo (punto de la guía) + `pieFormulario`: fondo blanco, borde superior, `padding:12`, fila y `gap:8`.
  - L296–L299: `botonMitad`: `flex:1` (botones Cancelar/Guardar lado a lado).
  - L300–L305: `botonPeligroTexto`: blanco, seminegrita, 16px.
  - L306–L312: comentario + `filaMedicamento`: fila, centrado y `marginBottom:8`.
  - L313–L318: `campoMedicamentoNombre`: `flex:3`, `marginRight:8` y `marginBottom:0`.
  - L319–L324: `campoMedicamentoDosis`: `flex:2`, `marginRight:8` y `marginBottom:0`.
  - L325–L331: `botonQuitar`: `minHeight:44`, centrado, `paddingHorizontal:8`.
  - L332–L340: `ayuda`: 14px, color `#6e6e6e` (4.68:1 sobre `#f5f5f5`; antes `#777` daba 4.11:1), `marginTop:-6` y `marginBottom:12`.
  - L341–L346: `separadorSso`: fila, centrado, `marginVertical:8`.
  - L347–L352: `lineaSso`: `flex:1`, alto 1px, color `#e0e0e0`.
  - L353–L368: `botonSso`: fondo `#fff`, borde 1px `#767676` (explica WCAG 1.4.11: 3:1 mínimo; `#d0d0d0` daba 1.5:1 y parecía un hueco), `minHeight:48`, centrado, `padding:14`, `borderRadius:8` y `marginBottom:12`.
  - L369–L375: `botonSsoTexto`: color `#333`, seminegrita, 16px, y cierre `});`.
- **Se conecta con:** todas las pantallas (importan `styles`), con `SaludWEB_Web/src/tokens.css` (paridad de paleta manual) y con las guías de legibilidad/adaptación a mobile citadas en los comentarios.

## `src/api/client.js` (152 líneas)
- **Rol:** Cliente HTTP central. Envuelve `fetch()` para unificar URL base, token JWT, timeout, identificador de correlación, logging, errores traducidos y logout automático en 401.
- **Recorrido línea por línea:**
  - L1–L6: cabecera + import de `API_URL, TIMEOUT_MS` desde `../config`.
  - L7–L11: línea en blanco + import del identificador de correlación (`actual` renombrado a `correlationId`) + comentario.
  - L12–L15: import del logger + comentario que explica que antes los fallos se perdían sin registro.
  - L16–L18: línea en blanco + comentario + `let token = null` (variable privada del JWT activo).
  - L19–L22: línea en blanco + comentario + `let onUnauthorized = null` (callback que registra AuthContext para el 401).
  - L23–L25: línea en blanco + comentario + `export const setToken`, que guarda el JWT en la variable privada.
  - L26–L28: línea en blanco + comentario + `export const setUnauthorizedCallback`, que registra el callback de expulsión.
  - L29–L43: línea en blanco + `construirQuery(params)`: sin params devuelve `''`; filtra null/undefined/vacío; mapea a `clave=valor` con `encodeURIComponent`; si no queda nada devuelve `''`; si no, antepone `?` y une con `&`.
  - L44–L46: línea en blanco + comentario + firma de `export const api`, con opciones `{ method = 'GET', body = null, params = null }`.
  - L47–L58: dentro de `api`: arma `url` (base + path + query, L49); `headers` con `Content-Type` JSON (L51); adjunta `Authorization: Bearer <token>` si hay token (L53); y setea `X-Correlation-Id` con `correlationId()` (L58), con comentario de trazabilidad.
  - L59–L63: línea en blanco + `AbortController` (L61) + `timer` que llama a `controller.abort()` a los `TIMEOUT_MS` (L63).
  - L64–L72: línea en blanco + arranque del `try` y `fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined, signal })`.
  - L73–L75: línea en blanco + parseo `respuesta.json().catch(() => ({}))`.
  - L76–L90: línea en blanco + manejo de 401: si `status === 401 && onUnauthorized`, loguea `warn` (L83–L87) y llama a `onUnauthorized()` (L89). El comentario explica que se loguea antes de cerrar sesión.
  - L91–L108: línea en blanco + si `!respuesta.ok`, calcula `msg` (`mensaje` || `error` || `Error <status>`), loguea `error` sin cuerpo completo (L100–L105) y lanza `new Error(msg)` (L107).
  - L109–L111: línea en blanco + `return datos.data` (contrato `{ok, mensaje, data}`).
  - L112–L131: `catch (err)` con el comentario de traducción de errores de red (L113–L119); si `err.name === 'AbortError'` loguea `warn` (L125–L128) y lanza el mensaje "La conexión tardó demasiado...".
  - L132–L143: si `err.message === 'Network request failed' || err.name === 'TypeError'` loguea `warn` (L136–L140) y lanza "No se pudo conectar con el servidor...".
  - L144: `throw err` para propagar cualquier otro error tal cual.
  - L145–L152: `finally` con `clearTimeout(timer)` (el comentario explica por qué va en `finally`) y cierre de la función.
- **Se conecta con:** `../config` (URL/timeout), `../utils/correlationId.js` y `../utils/logger.js`; y es consumido por `AuthContext` y por las pantallas que hacen llamadas a la API.

## `src/context/AuthContext.jsx` (173 líneas)
- **Rol:** Maneja la sesión (login clásico y SSO, logout), persiste el JWT en AsyncStorage, restaura la sesión al abrir y gestiona el bloqueo biométrico.
- **Recorrido línea por línea:**
  - L1–L8: cabecera. Explica que es el equivalente móvil del AuthContext del Web y que agrega el desbloqueo biométrico.
  - L9–L14: imports de React (hooks), AsyncStorage, el cliente HTTP (`api, setToken, setUnauthorizedCallback`) y `soporteBiometria`.
  - L15–L19: línea en blanco + `TOKEN_KEY = 'saludweb_token'` y `BIO_KEY = 'saludweb_biometria'`.
  - L20–L22: línea en blanco + `createContext(null)` exportado como `AuthContext`.
  - L23–L25: línea en blanco + comentario + `export function AuthProvider({ children })`.
  - L26–L36: estados: `token` (L27), `usuario` (L29), `cargando` inicial `true` (L31), `bioPreferido` (L33) y `desbloqueado` inicial `true` (L36), cada uno con su comentario.
  - L37–L51: línea en blanco + `useEffect` de montaje: lee la preferencia de huella (L43), la setea (L44), llama a `restablecerSesion(preferido)` (L46) y registra el callback `setUnauthorizedCallback(cerrarSesionLocal)` (L48); cierra con el disable de exhaustive-deps (L50) y deps vacías (L51).
  - L52–L86: línea en blanco + `restablecerSesion(preferBio)`: lee el token guardado (L58); si no hay, desbloquea y termina la carga (L60–L63); si hay, `setToken(guardado)` (L66), consulta `/auth/me` (L68), activa sesión (L70–L71); decide el bloqueo según `preferBio` y `soporteBiometria()` (L74–L75); en `catch` borra el token y deja sin sesión (L77–L81); en `finally` apaga `cargando` (L82–L84).
  - L87–L96: línea en blanco + `cerrarSesionLocal()`: remueve el token, limpia `token`, `tokenState`, `usuario` y libera el candado.
  - L97–L110: línea en blanco + `login(email, password)`: `POST /auth/login` (L101), guarda el token en memoria y AsyncStorage (L103–L104), activa usuario (L106–L107) y desbloquea (L109).
  - L111–L129: línea en blanco + comentario + `loginSSO(provider, idToken)`: `POST /auth/sso` con `provider` e `id_token` (L117–L120), guarda token (L122–L123), activa usuario (L125–L126) y desbloquea (L128).
  - L130–L138: línea en blanco + `toggleBioPreferido(nuevo)`: persiste `'si'`/`'no'` (L134), setea el estado (L135) y desbloquea si se desactiva (L137).
  - L139–L141: línea en blanco + `desbloquear = () => setDesbloqueado(true)`.
  - L142–L152: línea en blanco + `logout()`: intenta `POST /auth/logout` dentro de un `try` (L145–L147), ignora el error en `catch` (L148–L150) y siempre llama a `cerrarSesionLocal()` (L151).
  - L153–L167: línea en blanco + objeto `valor` con `usuario`, `autenticado: !!token`, `cargando`, `bioPreferido`, `desbloqueado`, `login`, `loginSSO`, `logout`, `desbloquear` y `toggleBioPreferido`.
  - L168–L170: `return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>` y cierre del componente.
  - L171–L173: línea en blanco + `export const useAuth = () => useContext(AuthContext)`.
- **Se conecta con:** `../api/client` (token y callback 401), `../utils/biometria` (disponibilidad), AsyncStorage (persistencia) y consume el contexto desde `App.js` y las pantallas (`useAuth`).

## `src/utils/biometria.js` (51 líneas)
- **Rol:** Envuelve `expo-local-authentication` para centralizar la detección de soporte biométrico y la autenticación.
- **Recorrido línea por línea:**
  - L1–L8: cabecera. Explica que el módulo cubre dos cosas: si el dispositivo tiene lector con identidades inscriptas, y la autenticación en sí.
  - L9–L33: línea en blanco + comentario de salida (`{ disponible, etiqueta }`) + `export const soporteBiometria = async () => {`. Consulta `hasHardwareAsync` (L16), `isEnrolledAsync` (L18), `supportedAuthenticationTypesAsync` (L20), calcula `esFacial` (L22) y devuelve `{ disponible: hardware && inscrito, etiqueta }` (L24–L27). El `catch` (L28) devuelve `{ disponible: false, etiqueta: 'biometría' }` (L31) para no romper el login normal.
  - L34–L51: línea en blanco + comentario + `export const autenticarBiometria = async (mensaje) => {`. Llama a `LocalAuthentication.authenticateAsync` con `promptMessage` y `cancelLabel` (L41–L44), devuelve `resultado.success` (L46) y en `catch` devuelve `false` (L47–L50).
- **Se conecta con:** `AuthContext` (`soporteBiometria` en la restauración) y la pantalla `Bloqueo` (usa `autenticarBiometria`).

## `src/utils/correlationId.js` (128 líneas)
- **Rol:** Genera y valida el identificador de correlación (`cid_...`) que viaja en `X-Correlation-Id` y une los errores del teléfono con el log del backend.
- **Recorrido línea por línea:**
  - L1–L29: docblock de cabecera. Explica qué resuelve, por qué NO persiste en el dispositivo (sesión nueva = contexto nuevo) y por qué es un archivo propio (lo usan el cliente HTTP y el logger, y deben compartir el mismo valor).
  - L30–L32: línea en blanco + comentario + `const PREFIJO = 'cid'`.
  - L33–L37: línea en blanco + comentario + `const BYTES = 8` (16 caracteres hexadecimales).
  - L38–L43: línea en blanco + comentario + `CARACTERES_ADMITIDOS = /^[A-Za-z0-9_-]{1,64}$/` (acepta UUID, rechaza espacios y saltos de línea).
  - L44–L47: línea en blanco + comentario + `let idActual = null` (vive en el módulo, antes de la primera pantalla).
  - L48–L59: línea en blanco + docblock de `esValido` + `export function esValido(id)` que devuelve `typeof id === 'string' && CARACTERES_ADMITIDOS.test(id)` (el `typeof` primero para no lanzar con objetos).
  - L60–L88: línea en blanco + docblock de `generar` (usa `expo-crypto`; cae a `Math.random` si no está, porque el id no es un secreto) + `export function generar()`: crea `Uint8Array(BYTES)` (L72), usa `globalThis.crypto.getRandomValues` si existe (L74–L76) o `Math.random` (L77–L81), convierte a hex con relleno de dos dígitos (L85) y devuelve `` `${PREFIJO}_${hex}` `` (L87).
  - L89–L103: línea en blanco + docblock de `actual` + `export function actual()`: si `idActual === null` llama a `inicializar()` (L99–L101) y devuelve `idActual` (L102).
  - L104–L115: línea en blanco + docblock de `inicializar` + `export function inicializar()`: genera solo si `idActual === null` (L111–L113) y devuelve `idActual` (L114).
  - L116–L128: línea en blanco + docblock de `olvidar` (lo usan el logout y las pruebas) + `export function olvidar()` que setea `idActual = null` (L127).
- **Se conecta con:** `src/api/client.js` (cabecera `X-Correlation-Id`) y `src/utils/logger.js` (campo `correlation_id`); probado por `correlationId.test.js`.

## `src/utils/correlationId.test.js` (122 líneas)
- **Rol:** Pruebas (con `node:test`) del identificador de correlación: formato, reutilización, validación y fallback sin crypto.
- **Recorrido línea por línea:**
  - L1–L10: docblock. Enumera los casos: camino feliz (formato), bordes (reutiliza, acepta UUID, no repite) y fallas (rechaza saltos de línea, espacios y valores no texto).
  - L11–L15: línea en blanco + imports de `node:test`, `node:assert/strict` y `{ generar, esValido, actual, inicializar, olvidar }`.
  - L16–L20: línea en blanco + `beforeEach`/`afterEach` que llaman a `olvidar()` para no depender del orden.
  - L21–L28: línea en blanco + test "el identificador generado tiene el formato del backend": `assert.match(id, /^cid_[a-f0-9]{16}$/)` y `esValido(id)`.
  - L29–L35: línea en blanco + test "los identificadores generados son distintos": un `Set` de 5 y `assert.equal(ids.size, 5)`.
  - L36–L43: línea en blanco + test "inicializar genera un identificador cuando no hay ninguno": valida prefijo `cid_` y que `actual() === id`.
  - L44–L51: línea en blanco + test "inicializar dos veces no cambia el identificador": compara con el primero y con `actual()`.
  - L52–L61: línea en blanco + test "olvidar limpia el identificador en memoria": tras `olvidar()`, `actual()` genera uno nuevo con formato válido.
  - L62–L67: línea en blanco + test "se aceptan identificadores con guiones y guiones bajos": valida un UUID y `mobile_2026_a1b2`.
  - L68–L76: línea en blanco + test "un identificador con salto de línea se rechaza": prueba `\n` y `\r\n`.
  - L77–L82: línea en blanco + test "un identificador con espacios se rechaza": `'abc def'` y `' abc'`.
  - L83–L88: línea en blanco + test "un identificador con etiquetas se rechaza": `<script>` y `a>b`.
  - L89–L97: línea en blanco + test "un valor que no es texto se rechaza": `null`, `undefined`, `12345`, `{}` y `['abc']`.
  - L98–L103: línea en blanco + test "un identificador demasiado largo se rechaza": 65 caracteres false, 64 true.
  - L104–L122: línea en blanco + test "sin crypto disponible igual se genera un identificador válido": guarda el descriptor de `crypto` (L114), lo reemplaza por `{}` con `defineProperty` (L116), valida el formato (L118) y restaura el descriptor en `finally` (L120).
- **Se conecta con:** `./correlationId.js` y con el script `test` de `package.json`.

## `src/utils/logger.js` (338 líneas)
- **Rol:** Logger estructurado de una línea JSON, con niveles, redacción de secretos, correlación y destino inyectable.
- **Recorrido línea por línea:**
  - L1–L27: docblock de cabecera. Explica qué resuelve, la regla "nada de secretos" y por qué el destino se pasa por parámetro (inversión de dependencia para las pruebas).
  - L28–L31: línea en blanco + import de `actual as idActual` + comentario de correlación.
  - L32–L44: línea en blanco + separador y comentario de niveles + `const PESOS = { debug:10, info:20, warn:30, error:40 }`.
  - L45–L47: línea en blanco + `const NIVELES = Object.keys(PESOS)`.
  - L48–L55: línea en blanco + `const ETIQUETA` con `DEBUG/INFO/WARN/ERROR`.
  - L56–L80: línea en blanco + separador y comentario + `const CLAVES_REDACTADAS` (secretos que se reemplazan enteros: password, token, jwt, authorization, motivo, notas, etc.).
  - L81–L95: línea en blanco + comentario + `const CLAVES_PARCIALES` (datos que se enmascaran a medias: email, dni, telefono, nombre, matricula, etc.).
  - L96–L98: línea en blanco + `const ETIQUETA_OCULTA = '[oculto]'`.
  - L99–L101: línea en blanco + `const CARACTERES_VISIBLES = 4`.
  - L102–L106: línea en blanco + comentario + `const LARGO_MINIMO_ENMASCARABLE = CARACTERES_VISIBLES * 2`.
  - L107–L110: línea en blanco + comentario + `const LARGO_MAXIMO = 500`.
  - L111–L123: línea en blanco + docblock + `function enmascarar(texto)`: si es más corto que el mínimo devuelve `ETIQUETA_OCULTA`, si no deja 4 caracteres y rellena con `*`.
  - L124–L138: línea en blanco + docblock + `function truncar(texto)`: devuelve el texto si entra en `LARGO_MAXIMO`, si no lo corta y agrega `...[truncado]`.
  - L139–L189: línea en blanco + docblock de `limpiar` (recursiva por el `request.headers.Authorization` del error de fetch) + `function limpiar(valor, clave = '')`: para strings aplica claves redactadas/parciales/truncado (L152–L162); deja pasar números, booleanos, null y undefined (L165–L167); los `Error` se reducen a su mensaje (L170–L172); los arrays se mapean (L174–L176); los objetos se recorren recursivamente (L178–L185); cualquier otro tipo devuelve `undefined` (L188).
  - L190–L196: línea en blanco + separador "Estado del logger" + comentario + `let nivelMinimo = 'info'`.
  - L197–L199: línea en blanco + `let destino = lineaPorDefecto`.
  - L200–L222: línea en blanco + docblock + `function lineaPorDefecto(etiqueta, linea)`: elige `console.error/warn/debug/info` según la etiqueta para que el filtrado de Metro funcione.
  - L223–L238: línea en blanco + docblock + `export function configurar({ nivel, destino: nuevoDestino } = {})`: valida el nivel contra `NIVELES` (L231–L233) y cambia el destino si es función (L235–L237).
  - L239–L245: línea en blanco + docblock + `export function nivelActual()` que devuelve `nivelMinimo`.
  - L246–L252: línea en blanco + docblock + `export function correlationId()` que devuelve `idActual()`.
  - L253–L266: línea en blanco + docblock + `function corresponde(nivel)`: un nivel desconocido no se escribe; devuelve `peso !== undefined && peso >= PESOS[nivelMinimo]`.
  - L267–L301: línea en blanco + docblock de `registro` + `export function registro(nivel, mensaje, contexto = {})`: normaliza el nombre (L277); corta si no corresponde (L279–L281); arma la línea con `ts` ISO (L286), `nivel`, `correlation_id` (L289), `mensaje` y `contexto: limpiar(contexto)` (L291); escribe por `destino` (L295) y, si el destino lanza, avisa por consola sin romper la app (L296–L300).
  - L302–L306: línea en blanco + `export function debug` que delega en `registro('debug', ...)`.
  - L307–L311: línea en blanco + `export function info` que delega en `registro('info', ...)`.
  - L312–L316: línea en blanco + `export function warn` que delega en `registro('warn', ...)`.
  - L317–L321: línea en blanco + `export function error` que delega en `registro('error', ...)`.
  - L322–L332: línea en blanco + docblock + `export function restablecer()` que vuelve `nivelMinimo` a `'info'` y `destino` a `lineaPorDefecto` (lo usan las pruebas).
  - L333–L338: línea en blanco + docblock + `export const limpiarContexto = limpiar` (expuesto para testear la redacción).
- **Se conecta con:** `./correlationId.js` (correlación), `src/api/client.js` (lo usa para loguear) y `logger.test.js` (lo prueba).

## `src/utils/logger.test.js` (279 líneas)
- **Rol:** Pruebas (con `node:test`) del logger: formato de línea, filtrado por nivel, redacción de secretos (incluidos anidados), enmascarado parcial, truncado y resistencia a fallos del destino.
- **Recorrido línea por línea:**
  - L1–L15: docblock. Enumera los casos y destaca que el de los secretos es el central (un token en consola queda en una pantalla fotografiable).
  - L16–L18: línea en blanco + imports de `node:test` y `node:assert/strict`.
  - L19–L31: línea en blanco + import múltiple del logger (`configurar, info, warn, error, debug, registro, nivelActual, correlationId, restablecer, limpiarContexto`).
  - L32–L33: import de `olvidar, inicializar` de correlationId + línea en blanco.
  - L34–L48: docblock + `function capturar()`: inyecta un destino propio que empuja `{ etiqueta, texto }` a un array y devuelve `{ lineas, restaurar }`.
  - L49–L58: línea en blanco + `beforeEach`/`afterEach` que llaman a `olvidar()` y `restablecer()`.
  - L59–L79: línea en blanco + test "la línea de log es JSON con los campos obligatorios": verifica `etiqueta`, `nivel`, `mensaje`, `contexto.paciente_id`, `ts` en ISO y `correlation_id` con formato `cid_...`.
  - L80–L92: línea en blanco + test "todos los eventos comparten el identificador de correlación": dos eventos y compara `correlation_id`.
  - L93–L110: línea en blanco + test "el nivel mínimo filtra por debajo y deja pasar por encima": con `nivel: 'warn'`, `debug`/`info` se descartan y `warn`/`error` pasan.
  - L111–L120: línea en blanco + test "un nivel desconocido no se escribe": `registro('inventado', ...)` no produce líneas.
  - L121–L131: línea en blanco + test "un nivel mal configurado conserva el nivel anterior": `'ERROR'` pasa a `error`, `'VERBOSE'` no cambia nada.
  - L132–L146: línea en blanco + test "una contraseña en el contexto queda redactada": `password` queda `[oculto]`, el texto no incluye el valor y `usuario_id` se conserva.
  - L147–L166: línea en blanco + test "los tokens quedan redactados en todas sus formas": `token`, `jwt`, `refresh_token` y `authorization` quedan `[oculto]` y el texto no incluye `eyJhbGci`.
  - L167–L192: línea en blanco + docblock y test "los secretos anidados también quedan redactados": el `Authorization` dentro de `request.headers` queda `[oculto]` y se conserva `request.url`.
  - L193–L208: línea en blanco + test "los datos personales quedan enmascarados parcialmente": `email` empieza con `paci`, incluye `*` y no incluye `mail.com`; `dni` empieza con `3011`.
  - L209–L218: línea en blanco + test "un dato personal muy corto se redacta completo": `a@b.c` queda `[oculto]`.
  - L219–L232: línea en blanco + test "un valor gigante se trunca con aviso": un texto de 900 caracteres termina en `...[truncado]` y mide menos que 900.
  - L233–L247: línea en blanco + test "los arrays se limpian elemento por elemento": lista de dos emails, largo 2 y ambos enmascarados.
  - L248–L252: línea en blanco + test "un error se reduce a su mensaje": `limpiarContexto(new Error(...))` devuelve solo el mensaje.
  - L253–L263: línea en blanco + test "un destino que lanza no rompe la aplicación": con un destino que lanza, `error(...)` no propaga (`assert.doesNotThrow`).
  - L264–L279: línea en blanco + docblock y test "olvidar genera una correlación nueva para la sesión siguiente": dos `inicializar()` separados por `olvidar()` dan ids distintos y `correlationId()` coincide con el segundo.
- **Se conecta con:** `./logger.js` y `./correlationId.js`; se ejecuta desde el script `test` de `package.json`.

---

Documentación generada a partir de la lectura directa de cada archivo (conteos y rangos verificados con `Read`).
