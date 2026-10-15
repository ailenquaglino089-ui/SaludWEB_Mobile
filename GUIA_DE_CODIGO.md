# Guía de código — SaludWEB Mobile

> Mapa del código de la app, archivo por archivo. Para cómo levantar el proyecto ver el
> README; para la adaptación mobile (tu guía aplicada), GUIA_MOBILE.md; para la
> revisión/pruebas, REVISAR_Y_PROBAR_EL_PROYECTO.md y QA/.

## Cómo usar esta guía

- Orden de lectura recomendado: primero `App.js` (el esqueleto), después
  `src/context/AuthContext.jsx` (la sesión), después `src/api/client.js` (la salida a la
  red), y recién ahí las pantallas y los componentes. Con esos tres el resto se lee solo.
- Convención: "Lxx" = número de línea dentro de ESE archivo. Entre paréntesis, el total
  de líneas del archivo, para que se note cuando un cambio de código desalinea las citas.
- Las pantallas y los formularios siguen el mismo patrón entre sí. Cuando un archivo es
  casi igual a otro (por ejemplo `Pacientes.jsx` y `Medicos.jsx`), la explicación del
  primero sirve para los dos y la del segundo solo marca la diferencia.

## Arquitectura y flujo

- Cómo arranca: `expo/AppEntry.js` (declarado como `main` en `package.json`) carga
  `App.js`, que envuelve todo con `AuthProvider` y decide qué pantalla mostrar con estado
  local. `AuthContext` restaura la sesión guardada y, si corresponde, bloquea con
  biometría antes de dejar pasar a `screens/`.
- Cómo habla con el backend: `src/api/client.js` expone `api(path, opciones)`, que arma la
  URL con `API_URL` de `src/config.js`, adjunta el JWT en `Authorization`, agrega el
  `X-Correlation-Id`, aplica un timeout con `AbortController` y expulsa al usuario ante un
  401 llamando al callback que registró `AuthContext`.
- Navegación: no hay librería. `App.js` guarda la pantalla activa en un `useState` y
  `src/components/BottomNav.jsx` la cambia; la barra queda fija abajo, en la zona del
  pulgar (ver "Mejorar menú y navegación" en GUIA_MOBILE.md).
- Separación de responsabilidades, en cuatro capas: `api/` es la única puerta a la red;
  `screens/` son las pantallas con su estado y su lógica de pantalla; `components/` son
  piezas de interfaz reutilizables sin conocimiento del backend; `context/` guarda el
  estado global (la sesión) y `utils/` son funciones puras (biometría, correlación,
  logging).

## Mapa general (árbol)

```
SaludWEB_Mobile/
├─ App.js                 Entrada: AuthProvider + navegación por estado + BottomNav
├─ app.json               Configuración de Expo (nombre, slug, orientación, plugins)
├─ package.json           Dependencias y scripts (start, android/ios/web, export, test)
├─ .env.example           Plantilla de variables EXPO_PUBLIC_* (API_URL, timeout, SSO)
├─ GUIA_MOBILE.md         Guía del docente aplicada y comentada (adaptación mobile)
├─ README.md              Puesta en marcha, credenciales de prueba y calidad
├─ REVISAR_Y_PROBAR_EL_PROYECTO.md  Cómo revisar y probar el entregable
├─ CALIDAD_PROFESIONAL_SOFTWARE.md  Marco de trazabilidad, logging y testing
├─ QA/                    Checklists y reportes de calidad del entregable
├─ dist/                  Bundle generado por Expo (artefacto, no se edita a mano)
└─ src/
   ├─ config.js           Única fuente de URL de API, timeout, POR_PAGINA y SSO
   ├─ styles.js           Paleta y estilos compartidos (paridad con la web)
   ├─ api/                Cliente HTTP centralizado
   │  └─ client.js
   ├─ components/         Piezas reutilizables de interfaz
   │  ├─ BottomNav.jsx
   │  ├─ CampoInput.jsx
   │  ├─ ConfirmarModal.jsx
   │  ├─ Selector.jsx
   │  └─ formularios/     Formularios de alta/edición por entidad
   │     ├─ FormularioMedico.jsx
   │     ├─ FormularioPaciente.jsx
   │     └─ FormularioPrescripcion.jsx
   ├─ context/            Estado global de sesión
   │  └─ AuthContext.jsx
   ├─ screens/            Pantallas (una por sección + listado genérico)
   │  ├─ Login.jsx
   │  ├─ Bloqueo.jsx
   │  ├─ Dashboard.jsx
   │  ├─ Pacientes.jsx
   │  ├─ Medicos.jsx
   │  ├─ Prescripciones.jsx
   │  └─ PagedList.jsx
   └─ utils/              Utilidades puras (biometría, trazabilidad, logging)
      ├─ biometria.js
      ├─ correlationId.js
      ├─ correlationId.test.js
      ├─ logger.js
      └─ logger.test.js
```

## Archivo por archivo

### Raíz

#### `App.js` (131 líneas)

**Rol:** Punto de entrada de la app. Monta la sesión y resuelve la navegación con estado
en lugar de una librería.

**Props / estado principal:** estado `pantalla` (L48) y los valores del contexto
`autenticado, cargando, desbloqueado, logout` (L50). No recibe props; exporta el
componente `App`.

**Se conecta con:** `src/context/AuthContext` (L34), `src/components/BottomNav` (L36) y
las seis pantallas (L38-L43).

**Recorrido por bloques:**

- L1–L26: cabecera de comentario que justifica no usar `react-navigation` (4 secciones
  planas y una barra fija; el costo es no tener historial del botón "atrás").
- L27–L43: imports (React, `StatusBar`, `View`/`SafeAreaView`, contexto, barra y pantallas).
- L45–L50: `ContenidoApp` y sus dos estados (pantalla activa y sesión).
- L52–L77: los tres `return` tempranos, en orden deliberado: `cargando` (L64) muestra un
  `View` vacío, `!autenticado` (L67) muestra `Login`, `!desbloqueado` (L77) muestra
  `Bloqueo`. El orden evita el parpadeo del login.
- L79–L94: `pantallaActiva()`, un `switch` que devuelve Pacientes/Médicos/Prescripciones y
  por defecto el Dashboard.
- L96–L102: `cerrarSesion`, que hace `logout()` y vuelve a `dashboard`.
- L104–L119: render. `SafeAreaView` (L111) envuelve contenido y barra; el contenido ocupa
  el alto disponible (L113) y `BottomNav` recibe `pantalla`, `navegar` y `cerrarSesion` (L116).
- L121–L131: `App` exportado por defecto: `AuthProvider` (L125) + `StatusBar` (L127) +
  `ContenidoApp` (L128).

**Notas:** este archivo es el que hay que leer primero; todas las decisiones de "qué se ve"
viven acá. Ver "Mejorar menú y navegación" en GUIA_MOBILE.md.

#### `app.json` (19 líneas)

**Rol:** Configuración del proyecto Expo.

**Props / estado principal / exporta:** objeto JSON `expo` con `name` "SaludWEB" (L3),
`slug` (L4), `version` (L5), `orientation: portrait` (L6), `userInterfaceStyle: light` (L7),
`newArchEnabled: false` (L8), `android.package` (L10), `ios.bundleIdentifier` (L13) y
`plugins: ["expo-web-browser"]` (L16, requerido por `expo-auth-session` para el SSO).

**Se conecta con:** lo consume la CLI de Expo; no lo importa ningún archivo fuente.

**Notas:** `newArchEnabled` queda en `false` a propósito (compatibilidad con las librerías
del SDK 53 que usa la app).

#### `package.json` (26 líneas)

**Rol:** Dependencias y scripts del proyecto.

**Props / estado principal / exporta:** `main: "expo/AppEntry.js"` (L5); scripts `start`,
`android`, `ios`, `web`, `export` (L8-L12) y `test` (L13, corre los dos archivos de prueba
con `node --test`); dependencias clave: `@react-native-async-storage/async-storage` (L16),
`expo` (L17), `expo-auth-session` (L18), `expo-crypto` (L19), `expo-local-authentication`
(L20), `expo-status-bar` (L21), `expo-web-browser` (L22), `react` (L23) y `react-native` (L24).

**Se conecta con:** `expo/AppEntry.js` (entrada) y todos los módulos `expo-*` que importan
`Login.jsx`, `AuthContext.jsx` y `utils/`.

**Notas:** correr las pruebas es `npm test`, que ejecuta exactamente los dos `.test.js`.

### src/

#### `config.js` (62 líneas)

**Rol:** Única fuente de configuración; todo lo que apunta a la red o al entorno pasa por acá.

**Props / estado principal / exporta:** `API_URL` (L30-L32, con default
`http://127.0.0.1:8000/api`), `TIMEOUT_MS` (L38, default 15000), `POR_PAGINA` (L42,
default 10) y `SSO` (L55-L62: `googleClientId`, `microsoftClientId`, `microsoftTenant`).
Cada valor sale de una variable `EXPO_PUBLIC_*` y cae al default si no existe.

**Se conecta con:** `src/api/client.js` (importa `API_URL` y `TIMEOUT_MS`),
`src/screens/Login.jsx` (importa `SSO`), `src/screens/PagedList.jsx` (importa `POR_PAGINA`).

**Notas:** la referencia a `process.env.EXPO_PUBLIC_...` tiene que ser literal para que Expo
la reemplace en el bundle (comentado en L17-L21). El backend de log está en `src/utils/`.

#### `styles.js` (375 líneas)

**Rol:** Paleta y estilos compartidos por todas las pantallas, en un solo `StyleSheet`.

**Props / estado principal / exporta:** exporta el objeto `styles` creado con
`StyleSheet.create` (L23). Sin estado.

**Se conecta con:** lo importan todas las pantallas y casi todos los componentes
(`import { styles } from '../styles'`).

**Recorrido por bloques:**

- L1–L19: cabecera que explica que la paleta está escrita a mano y debe coincidir con
  `SaludWEB_Web/src/tokens.css`; L20 importa `StyleSheet`.
- L24–L31: `contenedor` (flex, fondo gris claro y padding base).
- L33–L46: `tarjeta` (superficie blanca con sombra iOS + `elevation` Android).
- L48–L58: `titulo` y `tituloWrapper` (cabecera de marca).
- L60–L76: `label` e `input` (16px y target de 44px, según la guía mobile).
- L78–L118: botones: `botonPrimario` (L81), su texto (L91), variante oscurecida (L97),
  `botonSecundario` (L101) y `botonPeligro` (L111). Los comentarios registran los ajustes
  de contraste WCAG.
- L120–L154: texto base (`texto` L120), mensaje de error (L125) y filas de listado
  (`fila` L135, `filaLabel` L143, `filaValor` L149).
- L156–L214: estilos nacidos de la guía "adaptar a mobile": `barraNavegacion` (L159),
  `navItem` (L168), `navActivo` (L176), `navInactivo` (L183), `contrasenaWrapper` (L189),
  `botonMostrar` (L199), `botonMostrarTexto` (L205) y `errorCampo` (L209).
- L216–L305: estilos del CRUD completo: `exito` (L219), `botonNuevo` (L233) y su texto
  (L243), `botonAccion` (L250) con variantes clara/peligro (L260, L264), textos de acción
  (L268, L274), `pieAcciones` (L280), `pieFormulario` (L288), `botonMitad` (L297) y
  `botonPeligroTexto` (L301).
- L307–L375: estilos de la prescripción y del SSO: `filaMedicamento` (L308),
  `campoMedicamentoNombre` (L314), `campoMedicamentoDosis` (L320), `botonQuitar` (L326),
  `ayuda` (L333), `separadorSso` (L342), `lineaSso` (L348), `botonSso` (L354) y
  `botonSsoTexto` (L370).

**Notas:** los hex de `botonPrimario`, `navActivo`, `botonNuevo`, `botonPeligro` y los
estados de prescripción son los mismos tokens que la web. Cambiar un color obliga a
cambiarlo en los dos repos (paridad manual, ver GUIA_MOBILE.md).

### src/api/

#### `client.js` (152 líneas)

**Rol:** Cliente HTTP central: URL base, JWT, timeout, trazabilidad, traducción de errores
y expulsión por 401. Es el equivalente móvil del interceptor de axios de la web.

**Props / estado principal / exporta:** exporta `setToken` (L25),
`setUnauthorizedCallback` (L28) y `api` (L47). Estado de módulo: `token` (L18) y
`onUnauthorized` (L22).

**Se conecta con:** `src/config` (L6), `src/utils/correlationId` (L8),
`src/utils/logger` (L11); lo importan `AuthContext` y todas las pantallas/formularios.

**Recorrido por bloques:**

- L1–L15: cabecera e imports (config, correlationId, logger).
- L17–L28: estado del módulo y los dos setters que usa `AuthContext`.
- L30–L43: `construirQuery`, que arma `?clave=valor&...` filtrando valores vacíos.
- L45–L58: firma de `api`; arma URL, cabeceras `Content-Type`, `Authorization` y
  `X-Correlation-Id` (L58).
- L60–L72: `AbortController` con timer de timeout (L61-L63) y el `fetch` (L67).
- L74–L90: parseo del JSON y manejo del 401 (registra con `logger.warn` y llama al
  callback `onUnauthorized`, L79-L90).
- L92–L108: respuesta no-ok: toma `mensaje`/`error` del backend, lo registra y lanza.
- L110–L111: éxito: devuelve `datos.data`.
- L112–L144: `catch` que traduce `AbortError` a mensaje de timeout (L120) y fallo de red a
  mensaje de conexión (L132); cualquier otra cosa se re-lanza (L144).
- L145–L151: `finally` que cancela el timer.

**Notas:** los mensajes de error que ve el usuario salen de acá y ya vienen en español. No
se loguea el cuerpo de la respuesta (puede traer datos de otros pacientes).

### src/components/

#### `BottomNav.jsx` (66 líneas)

**Rol:** Barra de navegación inferior fija con los 4 accesos críticos y "Salir".

**Props / estado principal:** props `pantalla`, `navegar`, `cerrarSesion` (L27). Sin estado
propio; usa la constante `ELEMENTOS` (L16-L21, Inicio/Pacientes/Médicos/Recetas).

**Se conecta con:** `src/styles` (L12) y `App.js` (que le pasa el estado de navegación).

**Notas:** máximo 5 ítems y targets de 44px, como pide la guía. El ítem activo se resalta
con `styles.navActivo` (L48). El logout es el último botón (L56-L63).

#### `CampoInput.jsx` (36 líneas)

**Rol:** Campo de formulario reutilizable: etiqueta + input + error.

**Props / estado principal:** props `etiqueta, valor, onChange, error` y `...rest` (L18),
que se pasan al `TextInput` nativo (L25-L30). Sin estado.

**Se conecta con:** `src/styles` (L11); lo usan los tres formularios.

**Notas:** principio DRY: la estructura del campo se escribe una vez y los formularios solo
declaran las props.

#### `ConfirmarModal.jsx` (79 líneas)

**Rol:** Diálogo de confirmación de borrado.

**Props / estado principal:** props `visible, titulo, mensaje, alConfirmar, alCancelar,
cargando = false` (L20-L27). Sin estado.

**Se conecta con:** `src/styles` (L12); lo usan `Pacientes`, `Medicos` y `Prescripciones`.

**Notas:** usa `Modal` nativo con `onRequestClose` para el escape (L30-L35). Mientras
`cargando` está en true, los botones se deshabilitan y el de borrar muestra un
`ActivityIndicator` (L62-L73).

#### `Selector.jsx` (138 líneas)

**Rol:** Selector tipo bottom sheet: equivale a un `<select>` de HTML.

**Props / estado principal:** props `etiqueta, opciones, valorSeleccionado, textoMuestra,
onSeleccionar, error, cargando = false, placeholder` (L25-L34). Estado `abierto` (L36).

**Se conecta con:** `src/styles` (L13); lo usan `FormularioPaciente` y
`FormularioPrescripcion`.

**Notas:** `opcionActual` (L39) busca la opción elegida y `texto` (L45-L47) decide qué
mostrar. El `FlatList` (L101) lista las opciones y el `ListEmptyComponent` (L122) cubre el
catálogo vacío.

### src/components/formularios/

#### `FormularioMedico.jsx` (157 líneas)

**Rol:** Alta (POST `/medicos`) y edición (PUT `/medicos/{id}`) de médicos.

**Props / estado principal:** props `inicial, onGuardado, onCancelar` (L26). Estado:
`nombre`, `matricula`, `especialidad` (L28-L32), `errores` (L34), `error` (L36) y
`cargando` (L38).

**Se conecta con:** `src/styles`, `src/api/client`, `CampoInput` (L16-L20); lo muestra
`Medicos.jsx`.

**Notas:** `validarNombre` (L41-L45) replica la regla del backend; `guardar` (L48-L81)
elige POST o PUT según exista `inicial` (L68-L72). Layout de campos en `ScrollView` con pie
fijo (L96-L154, ver "Ajustar formularios" en GUIA_MOBILE.md).

#### `FormularioPaciente.jsx` (181 líneas)

**Rol:** Alta (POST `/pacientes`) y edición (PUT `/pacientes/{id}`) de pacientes.

**Props / estado principal:** props `inicial, onGuardado, onCancelar` (L28). Estado:
`nombre`, `dni`, `idObraSocial` (L30-L34), `obrasSociales` y `cargandoObras` (L36-L38),
`errores`, `error`, `cargando` (L40-L44).

**Se conecta con:** `src/api/client`, `CampoInput` y `Selector` (L18-L22); lo muestra
`Pacientes.jsx`.

**Notas:** al montar descarga el catálogo `GET /obras-sociales` (L48-L56) y lo mapea a la
forma `{valor, etiqueta}` del `Selector` (L51). `validarDni` (L66) solo limita la longitud.
Igual que el médico, el pie del formulario es fijo (L154-L178).

#### `FormularioPrescripcion.jsx` (307 líneas)

**Rol:** Alta (POST `/prescripciones`) y edición (PUT `/prescripciones/{id}`) de recetas,
con lista dinámica de medicamentos.

**Props / estado principal:** props `inicial, onGuardado, onCancelar` (L32). Estado:
`idPaciente`/`nombrePaciente` (L37-L39), `medicamentos` (L42-L47), `indicaciones` (L49),
`fechaVencimiento` (L51-L53), `pacientes`/`cargandoPacientes` (L55-L57), `errores` (L59),
`error` (L61) y `cargando` (L63). Toma `usuario` del contexto (L34).

**Se conecta con:** `src/api/client`, `useAuth`, `CampoInput` y `Selector` (L20-L26); lo
muestra `Prescripciones.jsx`.

**Recorrido por bloques:**

- L1–L26: cabecera con los formatos de alta y edición, e imports.
- L28–L34: props y `useAuth` (el `id` del médico logueado firma la receta).
- L36–L63: todos los estados; el de medicamentos se inicializa con los existentes o con
  una fila vacía (L42-L47).
- L65–L82: `useEffect` que, solo en alta, descarga pacientes (`GET /pacientes?por_pagina=100`,
  L67-L82) y los mapea a `{valor, etiqueta}`.
- L84–L100: helpers de la lista dinámica: `actualizarMedicamento` (L85), `agregarMedicamento`
  (L90) y `quitarMedicamento` (L95, nunca deja cero filas).
- L102–L112: `validarFecha` (regex `AAAA-MM-DD`) y `medicamentosLimpios` (descarta filas sin
  nombre y recorta espacios).
- L114–L163: `guardar`: valida, y según `inicial` arma el `cuerpoAlta` (L138-L144) o el
  `cuerpoEdicion` (L148-L152). En edición no se manda el paciente.
- L165–L306: render.
  - L180–L205: paciente: `Selector` en alta (L182-L194) o caja de solo lectura en edición
    con la aclaración "no se puede cambiar" (L197-L204).
  - L207–L252: medicamentos: `medicamentos.map` (L209) dibuja nombre + dosis + botón quitar;
    el botón "Agregar medicamento" (L246-L252).
  - L254–L276: indicaciones (multilínea) y fecha de vencimiento.
  - L279–L304: pie fijo con Cancelar/Guardar y la ruleta mientras carga.

**Notas:** la separación alta/edición es la clave del archivo: el paciente solo se elige al
crear. Reglas espejo de `PrescripcionService` (comentadas en L116-L125).

### src/context/

#### `AuthContext.jsx` (173 líneas)

**Rol:** Estado global de sesión: login clásico y SSO, restauración desde `AsyncStorage`,
preferencia de huella y candado biométrico.

**Props / estado principal:** `AuthProvider` recibe `children` (L25). Estado: `token`
(L27), `usuario` (L29), `cargando` (L31), `bioPreferido` (L33) y `desbloqueado` (L36).
Exporta `AuthContext` (L22), `AuthProvider` (L25) y `useAuth` (L173).

**Se conecta con:** `src/api/client` (L12), `src/utils/biometria` (L14),
`@react-native-async-storage/async-storage` (L10); lo consumen `App.js`, `Login.jsx`,
`Bloqueo.jsx`, `Dashboard.jsx`, los listados y `FormularioPrescripcion`.

**Recorrido por bloques:**

- L1–L14: cabecera e imports.
- L16–L22: claves de almacenamiento (`TOKEN_KEY`, `BIO_KEY`) y `createContext`.
- L24–L36: `AuthProvider` y los cinco estados de sesión.
- L38–L51: `useEffect` inicial: lee la preferencia de huella, restaura la sesión y registra
  el callback de 401 (`setUnauthorizedCallback`, L48).
- L53–L86: `restablecerSesion`: lee el token (L58), lo inyecta al cliente (L66), valida con
  `GET /auth/me` (L68) y decide el bloqueo según `soporteBiometria` (L74-L75); ante error,
  borra el token (L76-L85).
- L88–L96: `cerrarSesionLocal`: limpia token y usuario localmente.
- L98–L110: `login` clásico (`POST /auth/login`): guarda el token en memoria y en el
  teléfono y desbloquea (L109).
- L112–L129: `loginSSO` (`POST /auth/sso`) con el `id_token` del proveedor.
- L131–L138: `toggleBioPreferido`: persiste la preferencia y desbloquea si se desactiva.
- L140–L141: `desbloquear`.
- L143–L152: `logout`: `POST /auth/logout` best-effort y limpieza local.
- L154–L169: objeto `valor` que se entrega por el `Provider` (L169).
- L172–L173: hook `useAuth`.

**Notas:** el bloqueo con huella se decide acá (`desbloqueado`), pero quién lo muestra es
`App.js`. Ver biometría en el README y en GUIA_MOBILE.md.

### src/screens/

#### `Login.jsx` (293 líneas)

**Rol:** Pantalla de login con validación en tiempo real, mostrar/ocultar contraseña y
botones de SSO (Google/Microsoft) que aparecen solo si están configurados.

**Props / estado principal:** sin props. Del contexto toma `login` y `loginSSO` (L44).
Estado: `email` (L46), `password` (L48), `verPassword` (L50), `cargando` (L52),
`cargandoSso` (L54), `error` (L56) y `erroresCampo` (L58).

**Se conecta con:** `expo-auth-session` (L20), `src/styles`, `useAuth` y `SSO` de config
(L22-L26).

**Recorrido por bloques:**

- L1–L26: cabecera que enuncia los puntos de la guía aplicados e imports.
- L28–L39: constantes: `EMAIL_REGEX` (L29) y los endpoints de descubrimiento de Google
  (L33-L35) y Microsoft (L37-L39).
- L41–L58: componente y estados.
- L60–L72: `validarEmail` y `validarPassword`.
- L74–L91: `validarCampoAlSalir` (validación `onBlur`) y `validarFormulario`.
- L93–L115: `handleLogin`: valida, llama a `login(email, password)` y maneja error/carga.
- L117–L126: `pedidoIdToken`, que crea el `AuthRequest` pidiendo solo el `id_token`
  (cliente público, sin secret).
- L128–L157: `iniciarSso`: elige clientId/endpoint, abre el navegador con `promptAsync`
  (L141) y entrega el `id_token` al backend vía `loginSSO` (L145).
- L159–L292: render.
  - L161–L170: `KeyboardAvoidingView` + `ScrollView` para que nada quede tapado por el
    teclado.
  - L171–L188: cabecera de marca (el color `#5669c6` se explica por contraste, L173-L182).
  - L190–L193: tarjeta y error general.
  - L195–L211: campo email con teclado de email, autocompletado y validación al salir.
  - L213–L239: campo contraseña con el botón mostrar/ocultar (L229-L236).
  - L241–L252: botón "Iniciar Sesión" con `ActivityIndicator` mientras carga.
  - L254–L288: bloque SSO: separador (L258-L262) y los botones de Google (L265-L274) y
    Microsoft (L277-L286), cada uno condicionado a que su clientId exista.

**Notas:** el flujo SSO usa `expo-auth-session` en el navegador del sistema; el backend
verifica la firma. Ver `loginSSO` en `AuthContext.jsx:115`.

#### `Bloqueo.jsx` (92 líneas)

**Rol:** Candado biométrico que aparece cuando hay sesión restaurada y "Proteger con
huella" está activo.

**Props / estado principal:** sin props. Del contexto toma `usuario, desbloquear, logout`
(L20). Estado: `validando` (L22), `error` (L24) y `etiqueta` (L26).

**Se conecta con:** `src/styles`, `useAuth` y `src/utils/biometria` (L11-L15); lo muestra
`App.js`.

**Notas:** `intentarDesbloquear` (L34-L48) llama a `autenticarBiometria` con el nombre del
usuario; si valida, ejecuta `desbloquear()`. "Usar otra cuenta" (L51-L53) hace `logout`
para volver al Login.

#### `Dashboard.jsx` (107 líneas)

**Rol:** Pantalla de inicio: saludo, rol y el interruptor "Proteger con huella".

**Props / estado principal:** sin props. Del contexto toma `usuario, bioPreferido,
toggleBioPreferido` (L35). Estado `soporte` (L37).

**Se conecta con:** `src/styles`, `useAuth` y `src/utils/biometria` (L11-L15); también
importa `switch` de `react-native` (L9).

**Notas:** `emojiRol` (L18-L22) y `textoRol` (L25-L29) traducen `tipo_usuario`. Al activar
la preferencia se pide una validación biométrica previa (L54). El `trackColor` del
interruptor está ajustado por contraste (L80-L84).

#### `Pacientes.jsx` (140 líneas)

**Rol:** Listado paginado + CRUD de pacientes. La gestión es solo para admin.

**Props / estado principal:** sin props. Del contexto toma `usuario` (L26) y calcula
`esAdmin` (L28). Estado: `modo` (L31), `editando` (L33), `borrar` (L35), `cargandoBorrado`
(L37), `mensajeExito` (L39), `mensajeError` (L41) y `claveLista` (L44).

**Se conecta con:** `PagedList` (L12), `FormularioPaciente` (L14), `ConfirmarModal` (L16),
`src/api/client` y `useAuth` (L20-L22).

**Notas:** patrón de la pantalla CRUD: `modo` decide entre listado y formulario (L79-L87);
`claveLista` incrementa para remontar `PagedList` y recargar (L42-L44, L51). `Medicos.jsx`
es casi idéntico, con las URLs `/medicos` y los textos "Médico".

#### `Medicos.jsx` (140 líneas)

**Rol:** Listado paginado + CRUD de médicos (solo admin).

**Props / estado principal:** mismo patrón que `Pacientes.jsx`: `esAdmin` (L29), `modo`
(L32), `editando` (L34), `borrar` (L36), `cargandoBorrado` (L38), `mensajeExito` (L40),
`mensajeError` (L42) y `claveLista` (L44).

**Se conecta con:** `PagedList`, `FormularioMedico`, `ConfirmarModal`, `api` y `useAuth`
(L13-L23).

**Notas:** diferencias con pacientes: `url="/medicos"` (L98), campos nombre/matrícula/
especialidad (L101-L105) y `FormularioMedico` (L81). La baja es `DELETE /medicos/{id}` (L64).

#### `Prescripciones.jsx` (305 líneas)

**Rol:** Listado paginado con filtro por estado + CRUD de prescripciones, con reglas de rol:
médico crea/edita, cualquier usuario cambia estado, admin elimina.

**Props / estado principal:** sin props. Del contexto toma `usuario` (L121) y deriva
`esMedico` (L123) y `esAdmin` (L125). Estado: `modo` (L128), `editando` (L130), `borrar`
(L132), `cambiarEstado` (L134), `cargandoBorrado` (L136), `cargandoEstado` (L138),
`mensajeExito` (L140), `mensajeError` (L142) y `claveLista` (L144). Además hay un
subcomponente local `ModalEstado` (L58).

**Se conecta con:** `PagedList`, `FormularioPrescripcion`, `ConfirmarModal`, `api` y
`useAuth` (L13-L23).

**Recorrido por bloques:**

- L1–L23: cabecera con las reglas de rol e imports.
- L25–L32: `etiquetaEstado`, que pone texto con ícono a cada estado.
- L34–L53: `colorEstado`, con los colores verificados por contraste (comentados L37-L46).
- L55–L117: `ModalEstado`: lista las cuatro opciones permitidas (L60) y marca la vigente
  (L91, L101); botón Cancelar (L106-L112).
- L119–L144: componente principal, roles y estados.
- L146–L152: `alGuardado`.
- L154–L157: `cancelarBorrado`.
- L159–L176: `confirmarBorrado`: `DELETE /prescripciones/{id}`.
- L178–L199: `confirmarEstado`: `PATCH /prescripciones/{id}/estado` (L184-L187).
- L201–L210: si `modo !== 'lista'`, renderiza `FormularioPrescripcion`.
- L212–L304: listado.
  - L219–L229: `PagedList` con URL y campos.
  - L231–L236: `filtros` tipo chip para el estado.
  - L238–L251: `renderValor`, que une los medicamentos en texto y pinta el estado.
  - L252–L283: `renderAcciones` con gating: Editar solo médico (L258), Estado para todos
    (L267), Eliminar solo admin (L274).
  - L286–L302: `ConfirmarModal` de borrado y `ModalEstado` de cambio de estado.

**Notas:** el cambio de estado tiene modal propio porque no es un borrado; separarlo de
`ConfirmarModal` evita mezclar dos intenciones distintas en un mismo diálogo.

#### `PagedList.jsx` (226 líneas)

**Rol:** Listado paginado con búsqueda (debounce) y filtros, reutilizado por las tres
pantallas de listado.

**Props / estado principal:** props `url, titulo, placeholder, campos, renderValor,
filtros = [], onNuevo = null, renderAcciones = null` (L29-L32). Estado: `pagina` (L34),
`datos` (L36), `total` (L38), `totalPaginas` (L40), `busqueda` (L42), `busquedaAplicada`
(L44), `filtro` (L46), `cargando` (L48) y `error` (L50).

**Se conecta con:** `src/styles` (L13), `src/api/client` (L15) y `POR_PAGINA` de config
(L17); lo usan `Pacientes`, `Medicos` y `Prescripciones`.

**Recorrido por bloques:**

- L1–L17: cabecera con el formato `GET /api/{url}?pagina=N&por_pagina=M&q=...` e imports.
- L19–L32: contrato de props, documentado.
- L33–L50: estados.
- L52–L59: debounce de 400 ms de la búsqueda (reinicia el timer por cada tecla).
- L61–L65: efecto que recarga al cambiar página, búsqueda aplicada o filtro.
- L67–L86: `cargarPagina`: llama a `api` con `pagina, por_pagina, q, estado` (L73-L75) y
  guarda `items`, `total` y `total_paginas`.
- L88–L93: `cambiarPagina` con límites.
- L95–L100: `mostrarValor`, que delega en `renderValor` o muestra el valor crudo.
- L102–L224: render.
  - L103–L113: título y buscador.
  - L115–L121: botón "Nuevo" condicionado a `onNuevo`.
  - L123–L150: chips de filtro (L128-L147), con colores de contraste corregidos.
  - L152–L153: error global.
  - L155–L194: indicador de carga (L157) o `FlatList` (L160) con las optimizaciones de la
    guía: `initialNumToRender`, `windowSize`, `removeClippedSubviews` (L164-L166) y
    `ListEmptyComponent` (L169).
  - L196–L220: barra de paginación Anterior/Siguiente con la página actual.
  - L222–L223: total de registros.

**Notas:** el par clave/`key` en las pantallas CRUD (`claveLista`) es lo que fuerza la
recarga después de guardar o borrar. Ver "Optimización de rendimiento" en GUIA_MOBILE.md.

### src/utils/

#### `biometria.js` (51 líneas)

**Rol:** Envuelve `expo-local-authentication` para saber si hay biometría y para
autenticar.

**Props / estado principal / exporta:** `soporteBiometria` (L13-L33), que devuelve
`{ disponible, etiqueta }` ("huella dactilar" o "Face ID"), y `autenticarBiometria`
(L37-L51), que devuelve `true`/`false`.

**Se conecta con:** `AuthContext` (al restaurar sesión), `Bloqueo.jsx` y `Dashboard.jsx`.

**Notas:** ante cualquier error, `soporteBiometria` devuelve `disponible: false` (L28-L32):
la app sigue funcionando con email y contraseña.

#### `correlationId.js` (128 líneas)

**Rol:** Identificador de correlación `cid_<hex>` que viaja en `X-Correlation-Id` y une el
error del teléfono con el log del backend (módulo "Trazabilidad").

**Props / estado principal / exporta:** constantes `PREFIJO` (L32), `BYTES` (L37) y
`CARACTERES_ADMITIDOS` (L43); estado de módulo `idActual` (L47); funciones `esValido`
(L55-L59), `generar` (L71-L88), `actual` (L98-L103), `inicializar` (L110-L115) y `olvidar`
(L126-L128).

**Se conecta con:** `src/api/client.js` (usa `actual`) y `src/utils/logger.js` (usa
`actual` como `idActual`).

**Notas:** no persiste en el dispositivo a propósito: cada sesión nueva tiene su propia
correlación (explicado en L14-L21). `generar` usa `expo-crypto` con caída a `Math.random`
(L74-L81).

#### `correlationId.test.js` (122 líneas)

**Rol:** Pruebas del identificador de correlación.

**Props / estado principal / exporta:** archivo de pruebas con `node:test` y
`node:assert/strict` (L12-L13). Se limpia con `beforeEach`/`afterEach` (L19-L20).

**Se conecta con:** importa `generar, esValido, actual, inicializar, olvidar` (L15).

**Notas:** cubre formato (L23), unicidad (L31), reutilización dentro de la sesión (L46),
`olvidar` (L54), UUID con guiones (L64), rechazo de saltos de línea (L73), espacios (L79),
etiquetas HTML (L85), tipos no texto (L91), longitud (L100) y generación sin `crypto`
(L110). Se ejecuta con `npm test`.

#### `logger.js` (338 líneas)

**Rol:** Logger estructurado: una línea JSON por evento, con redacción de secretos (módulo
"Logging").

**Props / estado principal / exporta:** constantes `PESOS` (L39-L44), `NIVELES` (L47),
`ETIQUETA` (L50-L55), `CLAVES_REDACTADAS` (L62-L80), `CLAVES_PARCIALES` (L85-L95),
`ETIQUETA_OCULTA` (L98), `CARACTERES_VISIBLES` (L101), `LARGO_MINIMO_ENMASCARABLE` (L106) y
`LARGO_MAXIMO` (L110); estado `nivelMinimo` (L196) y `destino` (L199); funciones internas
`enmascarar` (L118), `truncar` (L131), `limpiar` (L151), `lineaPorDefecto` (L212) y
`corresponde` (L263); API exportada: `configurar` (L230), `nivelActual` (L243),
`correlationId` (L250), `registro` (L276), `debug`/`info`/`warn`/`error` (L304, L309, L314,
L319), `restablecer` (L329) y `limpiarContexto` (L338).

**Se conecta con:** `src/utils/correlationId` (L29); lo usa `src/api/client.js` (warn/error)
y las pruebas.

**Recorrido por bloques:**

- L1–L31: cabecera (formato único, regla de "nada de secretos", destino inyectable) e
  import.
- L33–L55: niveles: pesos numéricos (comparar por número, no por palabra), lista de niveles
  válidos y etiquetas.
- L57–L106: redacción: claves que se ocultan enteras (tokens, contraseñas, datos clínicos),
  claves que se enmascaran a medias (email, DNI, nombre...) y sus constantes.
- L112–L123: `enmascarar`: deja `CARACTERES_VISIBLES` y tapa el resto con asteriscos; si el
  valor es muy corto, lo oculta entero.
- L125–L138: `truncar`: acota a `LARGO_MAXIMO` y agrega `...[truncado]`.
- L140–L189: `limpiar`: redacción recursiva; recorre objetos y arrays, reduce `Error` a su
  mensaje (L170) y deja pasar números y booleanos.
- L191–L199: estado del logger.
- L201–L222: `lineaPorDefecto`: escribe con `console.error/warn/debug/info` según el nivel,
  para que Metro pueda filtrar.
- L224–L238: `configurar`: cambia nivel (validando contra `NIVELES`) y destino.
- L240–L252: `nivelActual` y `correlationId`.
- L254–L266: `corresponde`: un nivel desconocido no se escribe.
- L268–L301: `registro`: arma la línea `{ ts, nivel, correlation_id, mensaje, contexto }`
  (L283-L292) y envuelve el `destino` en `try/catch` para que un fallo de logging no rompa
  la app (L294-L300).
- L303–L321: atajos `debug`, `info`, `warn` y `error`.
- L323–L332: `restablecer` (lo usan las pruebas).
- L334–L338: `limpiarContexto`, exportado para probar la redacción directamente.

**Notas:** los datos sensibles se redactan antes de escribir; las claves clínicas
(`motivo`, `notas`, `indicaciones`, `diagnostico`) también. Ver
CALIDAD_PROFESIONAL_SOFTWARE.md para el marco completo.

#### `logger.test.js` (279 líneas)

**Rol:** Pruebas del logger: formato, filtrado por nivel, truncado y redacción de secretos.

**Props / estado principal / exporta:** archivo de pruebas con `node:test`. Helper
`capturar` (L41) que inyecta un destino propio y devuelve las líneas escritas.

**Se conecta con:** importa la API de `logger.js` (L20-L31) y `olvidar, inicializar` de
`correlationId.js` (L32).

**Notas:** el caso central es la redacción: contraseña (L134), tokens en todas sus formas
(L149), secretos anidados (L173, el token dentro de `request.headers.Authorization`), datos
personales enmascarados (L195), dato corto oculto entero (L211), truncado (L221), arrays
(L235) y destino que lanza sin romper la app (L255). Se ejecuta con `npm test`.

## Orden de lectura recomendado

1. `App.js` — el esqueleto y la navegación.
2. `src/context/AuthContext.jsx` — la sesión y su persistencia.
3. `src/api/client.js` — la salida a la red (JWT, timeout, 401).
4. `src/config.js` — de dónde salen la URL y los parámetros.
5. `src/screens/Login.jsx` — la primera pantalla que se ve.
6. `src/screens/PagedList.jsx` — el listado que reutilizan tres pantallas.
7. `src/screens/Pacientes.jsx` — el patrón CRUD completo (listado + formulario + borrado).
8. `src/components/formularios/FormularioPaciente.jsx` — el patrón de formulario.
9. `src/components/BottomNav.jsx` y `src/styles.js` — navegación y estilos compartidos.
10. `src/utils/logger.js` y `src/utils/correlationId.js` — trazabilidad y logging.

## Glosario breve

- **Biometría:** validación de identidad con huella o rostro mediante
  `expo-local-authentication`; usada por el candado `Bloqueo.jsx`.
- **AsyncStorage:** almacenamiento local clave/valor del teléfono; guarda el JWT y la
  preferencia de huella.
- **Expo Go:** app de desarrollo que ejecuta el proyecto sin compilar nativo.
- **PKCE:** flujo OAuth para clientes públicos (móviles) que no pueden guardar un secret;
  lo usa el SSO de Login.
- **FlatList / listado paginado:** `FlatList` virtualiza la lista; la paginación es del
  backend (`pagina`/`por_pagina`) y la arma `PagedList`.
- **Debounce:** espera 400 ms desde la última tecla antes de buscar (en `PagedList`).
- **Bottom Navigation Bar:** barra inferior fija con los accesos principales, en la zona
  del pulgar.
- **JWT:** token que prueba la sesión; viaja en `Authorization: Bearer`.
- **Correlation ID:** `cid_<hex>` en `X-Correlation-Id` que une un error del teléfono con
  el log del backend.
- **SafeAreaView:** contenedor que evita el notch y la barra de estado; envuelve todo en
  `App.js`.
