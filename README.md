# Repositorio Mobile — SaludWEB

App móvil de **SaludWEB** (Programación IV) construida con **React Native + Expo**.
Consume la **misma API REST** que la SPA web (JWT, roles: admin / médico / paciente).

## Estado del proyecto

Guía del docente **"Adaptar el sistema a mobile: De escritorio a la palma de la mano"**
aplicada y comentada **línea por línea** en `GUIA_MOBILE.md`.

## Características

- ✅ **Login JWT** optimizado para mobile: teclado de email, mostrar/ocultar contraseña,
  validación en tiempo real (onBlur) y autocompletado del sistema operativo.
- ✅ **Bottom Navigation Bar** sticky (patrón de la guía): Inicio, Pacientes, Médicos,
  Recetas y Salir, siempre visibles en la zona del pulgar.
- ✅ **Listados paginados** server-side con búsqueda (debounce 400ms), filtros por estado
  y cards apilables (ya no tablas).
- ✅ **CRUD completo** (alta/edición/baja) en flujo único por módulo: formularios con
  pie fijo de Confirmar/Cancelar, confirmación de borrado y cambio de estado de
  prescripciones, todo con gating por rol.
- ✅ **Rol propio visible**: el Dashboard muestra el rol de la sesión (admin / médico /
  paciente) con su etiqueta y emoji, tomado de `tipo_usuario` que devuelve
  `/api/auth/me`; toda la navegación se adapta a ese rol.
- ✅ **Permisos por rol** (mismas reglas que el backend):
  - Pacientes y médicos: crear/editar/eliminar → **admin**.
  - Prescripciones: crear/editar → **médico**; cambiar estado → **cualquier rol**;
    eliminar → **admin**.
- ✅ **Usabilidad**: targets táctiles de 44px+, tipografía de 16px y contraste WCAG AA.
- ✅ **Rendimiento**: FlatList virtualizada, paginado y timeout de peticiones.
- ✅ **Persistencia de sesión** con AsyncStorage (no se vuelve a pedir login al reabrir).
- ✅ **Biometría (huella / Face ID)**: "Proteger con huella" activable desde el Dashboard;
  la próxima apertura restaura la sesión pero queda bloqueada (candado) hasta validar
  la identidad del dueño del teléfono con `expo-local-authentication`. Entrar con
  email+clave siempre desbloquea; si el dispositivo no tiene sensor, la opción se oculta.
- ✅ **SSO (Google / Microsoft)**: botones en el Login vía `expo-auth-session`
  (flujo público/PKCE, sin secret en el dispositivo). Cada botón solo se muestra si
  el proveedor está configurado en `src/config.js` (`SSO`). El `id_token` se valida
  en el backend (`POST /api/auth/sso`) contra las claves públicas del proveedor y
  emite el JWT propio; solo habilita cuentas locales existentes (email coincidente).
- ✅ **Login de una sola pantalla** con mostrar/ocultar contraseña, validación onBlur y
  autocompletado del SO, más separador "o continuá con" para los accesos rápidos.

> **Nota sobre tiempo real:** el canal SSE del backend se aplica por ahora a la **SPA web**
> (ver [`GUIA_TIEMPO_REAL.md`](https://github.com/ailenquaglino089-ui/SaludWEB_Backend/blob/main/GUIA_TIEMPO_REAL.md)). En mobile el
> equivalente es otra tecnología —EventSource no existe en React Native—; lo que sí se
> mantiene es el mismo contrato: el backend sigue siendo la única fuente de verdad y esta
> app consume los mismos endpoints REST.

### Qué haría falta para llevarlo a mobile

Como está implementado en la Web, el camino en mobile es este. **Ninguno de estos pasos está
hecho**, se anota para dejar la decisión registrada:

1. **Elegir el transporte**: en React Native no hay `EventSource`, así que el canal se
   consumiría con una librería como `react-native-sse`, o se reemplazaría por
   WebSocket (`socket.io`), que además permitiría enviar mensajes del cliente.
2. **Reutilizar el backend tal cual**: las rutas `/api/eventos`, los canales y la
   autorización por rol ya están. Solo habría que decidir si el token viaja en la query
   (como en la Web) o en una cabecera, porque las librerías móviles sí permiten cabeceras y
   eso sería más seguro.
3. **Sustituir el polling de las pantallas**: el mismo patrón que se aplicó en el
   `Dashboard` web — carga inicial por REST y refresco solo cuando llega un aviso.
4. **Probarlo igual que en la Web**: la suite `verificar_tiempo_real.mjs` cubre la lógica
   de canal y autorización, pero el consumo desde mobile necesita su propia prueba.

## Contenido

- `App.js` — Punto de entrada y navegación por estado + barra inferior.
- `src/components/` — `BottomNav.jsx` (barra de navegación inferior sticky),
  `CampoInput.jsx` (campo reutilizable), `Selector.jsx` (picker modal),
  `ConfirmarModal.jsx` (confirmación de borrado) y `formularios/` (FormularioPaciente,
  FormularioMedico, FormularioPrescripcion).
- `src/screens/` — Login, Bloqueo (candado biométrico), Dashboard, Pacientes, Medicos,
  Prescripciones y `PagedList` (genérico).
- `src/context/AuthContext.jsx` — Sesión (login/logout/loginSSO) persistida localmente
  + estado de bloqueo/desbloqueo biométrico.
- `src/config.js` — URL de la API, constantes y credenciales de SSO (`SSO`).
- `src/utils/biometria.js` — Soporte y autenticación biométrica (huella / Face ID).
- `src/api/client.js` — Cliente HTTP con token JWT, timeout y expulsión ante 401.
- `src/styles.js` — Paleta y estilos compartidos (mismos colores que el Web).
- `GUIA_MOBILE.md` — Guía de adaptación mobile comentada línea por línea + checklist.
- `GUIA_DE_CODIGO.md` — El mapa del código, archivo por archivo: qué hace cada uno y con qué se conecta.

## Puesta en marcha

```bash
npm install
npm start            # levanta Expo Go / emulador
```

> El backend tiene que estar corriendo (en `SaludWEB_Backend`: `composer run dev`,
> en `http://127.0.0.1:8000`; **sin XAMPP ni MySQL**, con el PHP nativo y SQLite).
> Hay un arranque de un solo clic en `SaludWEB_Web\scripts\iniciar_saludweb.bat`.
> En navegador alcanza con ese valor; en emulador Android o celular físico ajustá
> la URL según la sección siguiente.

### Cómo usarlo en teléfonos (paso a paso)

La app está hecha con **Expo SDK 53** (React Native) y hay tres caminos para
llevarla a un teléfono, del más rápido al más formal. Los tres comparten un
requisito: **el backend de SaludWEB tiene que estar corriendo**.

#### Opción 1 — Tu celular físico con Expo Go (la más rápida)

1. **En la PC, levantar el backend escuchando en la red** (no solo en la propia
   máquina):

   ```bash
   cd SaludWEB_Backend
   php -S 0.0.0.0:8000 index.php
   ```

   La ruta de `php` es la del PHP propio (`C:\Users\<usuario>\php83\php.exe`);
   el de XAMPP también sirve si ya lo tenés instalado.

2. **Descubrir la IP de la PC**: en Windows, `ipconfig` en la terminal y mirar
   "Dirección IPv4" (algo como `192.168.1.20`).

3. **Configurar la app** (solo la primera vez, o cada vez que cambie la IP):

   ```bash
   cd SaludWEB_Mobile
   copy .env.example .env
   ```

   y dentro del `.env`, con la IP de tu PC:

   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.20:8000/api
   ```

4. **Arrancar Expo** (la primera vez también `npm install`):

   ```bash
   npm start --clear
   ```

   El `--clear` hace falta si recién cambiaste el `.env`: Expo inyecta las
   variables en el momento de empaquetar, no las lee en caliente.

5. **En el celular**: instalar **Expo Go** (Play Store o App Store), conectarlo
   a **la misma red WiFi que la PC** y escanear el **código QR** que aparece en
   la terminal con la cámara (o con la propia Expo Go).

6. **Entrar**: registrar una cuenta desde la pantalla de Registro, o usar las
   credenciales de prueba (ver "Credenciales de prueba" más abajo).

> Si la app carga pero no conecta con el servidor, casi siempre es una de tres
> cosas: la IP está mal escrita, el backend no está escuchando en `0.0.0.0`, o
> el celular está en otra red (datos móviles en vez de WiFi).

#### Opción 2 — Emulador Android (en la PC, sin celular)

1. Tener **Android Studio** instalado y un emulador corriendo.
2. En el `.env`: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api`
   (`10.0.2.2` es como el emulador ve al `localhost` de la PC).
3. `npm start` y presionar **a** en la terminal (o `npm run android`).

#### Opción 3 — Simulador de iOS (en una Mac)

1. Con Xcode y un simulador corriendo.
2. En el `.env`: `EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api`.
3. `npm start` y presionar **i** en la terminal (o `npm run ios`).

#### Opción 4 — App instalable (para que la use cualquiera)

Expo Go sirve para desarrollo y demostración. Para que una persona la instale
como app normal hay que generar un **build** con **EAS Build** (el servicio de
compilación en la nube de Expo):

```bash
npm install -g eas-cli
eas login              # cuenta gratuita de Expo
eas init               # una sola vez, vincula el proyecto
eas build --platform android
```

Ese proceso devuelve un **link para descargar la app** compilada (APK de prueba
o AAB para la Play Store, según el perfil de build que se configure). Es un
paso manual: requiere una cuenta de Expo propia y todavía no está automatizado
en el repositorio.

### Variables de entorno (opcional)

```bash
copy .env.example .env
```

Expo (SDK 49 en adelante) inyecta en el bundle **solo** las variables que arrancan
con `EXPO_PUBLIC_`, y `src/config.js` es el único archivo que las lee. **Si no creás
el `.env`, la app funciona igual**, porque los defaults del código ya apuntan al
backend nativo (`http://127.0.0.1:8000/api`).

| Variable | Default | Qué controla |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://127.0.0.1:8000/api` | URL base de la API, **con `/api` final**. |
| `EXPO_PUBLIC_TIMEOUT_MS` | `15000` | Milisegundos antes de cortar una petición que no responde. |
| `EXPO_PUBLIC_POR_PAGINA` | `10` | Registros por página en los listados. |
| `EXPO_PUBLIC_SSO_GOOGLE_CLIENT_ID` | *(vacío)* | Vacío = el botón de Google queda oculto. |
| `EXPO_PUBLIC_SSO_MICROSOFT_CLIENT_ID` | *(vacío)* | Vacío = el botón de Microsoft queda oculto. |
| `EXPO_PUBLIC_SSO_MICROSOFT_TENANT` | `common` | Tenant de Microsoft. |

> Para probar contra el backend (nativo), según el dispositivo:
> `10.0.2.2` (emulador Android), `127.0.0.1` (navegador) o la IP local del equipo
> (celular físico). La URL es `http://127.0.0.1:8000/api` en navegador y
> `http://<IP-de-tu-PC>:8000/api` en el celular.

> **Si cambiás el `.env`, reiniciá Expo con `npm start --clear`.** El valor se
> inyecta en el momento del empaquetado por Metro, no se lee en caliente: con el
> servidor ya corriendo no se recarga solo.

> **En Expo nunca van secretos.** Todo lo que empieza con `EXPO_PUBLIC_` queda
> escrito dentro del JavaScript que baja el dispositivo y cualquiera puede leerlo.
> Acá solo va lo que ya es público (URLs y Client IDs de OAuth). El secreto real de
> la app es el `JWT_SECRET` del backend, y ese no sale del servidor.

### Credenciales de prueba

- Administradora: `admin@salud.com` (su contraseña es personal, no está acá)
- Médico: `medico@prueba.com` / `medico123`
- Paciente: `paciente@prueba.com` / `paciente123`

> Estas cuentas existen si migraste la base MySQL vieja. **En un clon nuevo no hay
> ninguna**: creala primero desde la SPA (pantalla de Registro) o por `POST
> /api/auth/registro` (ver el README del backend, sección "Primer acceso").
>
> **¿No recordás la clave de `admin@salud.com`?** En el backend:
> `php resetear_password.php admin@salud.com MiClaveNueva123` (solo consola/desarrollo).

> La cuenta administradora quedó como la única con ese rol. Antes había tres
> cuentas de prueba con permisos de administrador, lo que hacía que la pantalla
> de usuarios mostrara varias filas indistinguibles y que las pruebas
> automáticas tuvieran que dependir de una clave fija. Ahora las pruebas crean
> su propia cuenta temporal y la borran al terminar, así que no necesitan
> ninguna credencial de la base.

Para volver a dejar los datos de demostración como estaban, en el backend:
`php sembrar_datos_demo.php`. Ese script no toca ninguna contraseña.

## Pasos y verificación

- Todo el avance, los pasos y las decisiones (F1 a F4) están registrados en la
  [AGENDA de trabajo del Backend](https://github.com/ailenquaglino089-ui/SaludWEB_Backend/blob/main/AGENDA_DE_TRABAJO.md) y en el
  [PROJECT_BRIEF](https://github.com/ailenquaglino089-ui/SaludWEB_Backend/blob/main/PROJECT_BRIEF.md).
- El backend trae sus propias suites de pruebas (`probar_roles.php`,
  `probar_vinculacion.php`, `probar_turnera.php`, `probar_tiempo_real.php`,
  `probar_seguridad.php`); la app móvil usa la **misma API**, así que las reglas verificadas
  ahí valen para esta app.
- La verificación en emulador/dispositivo real queda agendada en la fase **E3**
  (05–06/10): instalación con Expo Go, login, biometría y SSO contra el backend local.
- La revisión y prueba del proyecto (guía "de checklist a evidencia") está en
  [`REVISAR_Y_PROBAR_EL_PROYECTO.md`](REVISAR_Y_PROBAR_EL_PROYECTO.md), con los entregables de
  evidencia en `QA/`.
- La cronología del trabajo reciente en los tres repositorios está en el
  [registro de cambios](https://github.com/ailenquaglino089-ui/SaludWEB_Web/blob/main/REGISTRO_DE_CAMBIOS.md).

## Calidad del software

Aplicacion de "Calidad Profesional del Software": logging estructurado, identificador de
correlacion de punta a punta con el backend y pruebas unitarias. El detalle completo esta en
**`CALIDAD_PROFESIONAL_SOFTWARE.md`**.

### Archivos nuevos

| Archivo | Responsabilidad |
|---|---|
| `src/utils/correlationId.js` | Genera el `X-Correlation-Id` de la sesion. |
| `src/utils/logger.js` | Logs en JSON con niveles, redaccion de secretos y correlacion. |
| `src/utils/logger.test.js` | 15 pruebas del logger. |
| `src/utils/correlationId.test.js` | 12 pruebas del identificador de correlacion. |

`src/api/client.js` ahora envia el identificador en cada peticion y registra los fallos con
metodo, ruta, estado y motivo.

### Correr las pruebas

```bash
npm test            # 27 pruebas con el runner nativo de Node (sin dependencias nuevas)
```

No hacen falta el emulador, el telefono ni el backend: cubren el logger y el identificador de
correlacion, que son los dos modulos que se pueden verificar de forma aislada.

### Correlacion con el backend

1. `client.js` manda `X-Correlation-Id` en cada peticion.
2. El backend lo copia en todas sus lineas de log.
3. Los errores de la app se registran con ese mismo identificador.

Un error reportado desde un telefono se localiza buscando el identificador en los logs del
servidor. El identificador se regenera al cerrar sesion, a proposito: dos sesiones distintas en
el mismo dispositivo no deben quedar mezcladas en el mismo contexto.

### Reglas fijadas

- Ningun secreto en el log: la redaccion vive en el logger, no en las pantallas, para que no se
  pueda olvidar.
- El cuerpo completo de un error de la API no se registra: puede traer datos de otros
  pacientes y el log no es el lugar para eso.
- Cada nivel se escribe con el metodo de consola que le corresponde, para que el filtrado de
  Metro y de las herramientas de desarrollo funcione.

## Comandos y verificaciones disponibles

Mapa completo de lo que se puede ejecutar en este repositorio, qué hace cada
comando y con qué cuidado.

| Comando | Qué hace | Riesgo / requisito |
|---|---|---|
| `npm start` | Levanta Metro/Expo y muestra el QR | Bloquea la terminal; el celular necesita el backend accesible en la red. |
| `npm run android` | Abre el emulador Android | Bloquea; requiere Android Studio y un emulador. |
| `npm run ios` | Abre el simulador de iOS | Bloquea; requiere macOS con Xcode. |
| `npm run web` | Intenta abrir la app en el navegador | **No funciona tal cual**: faltan `react-native-web` y `react-dom` en las dependencias del proyecto. |
| `npm run export` | Compila los bundles de iOS y Android a `dist/` | Escribe `dist/` (ignorado por git); tarda alrededor de un minuto. |
| `npm test` | 27 pruebas unitarias (logger y correlación) | Ninguno: no necesita emulador, celular ni backend. |

Última corrida (19/10/2026): **27/27 pruebas unitarias** y export **OK** (633
módulos iOS y 636 Android). Los comandos que abren un servidor interactivo se
usan a mano: no forman parte de una corrida automática.

## Cómo presentar el proyecto a alguien que no entiende de tecnología

Discurso armado sin jerga, para una demo, una defensa o una charla con alguien del
rubro salud que no programa. La regla: hablar de problemas y beneficios, nunca de
tecnologías. Esta app es la cara de SaludWEB que va en el bolsillo.

**En una frase:** SaludWEB es un sistema para gestionar turnos médicos en línea, y
esta app lleva esa misma gestión al celular del paciente y del médico: reservar,
consultar y administrar turnos desde cualquier lugar.

**El problema que resuelve:**

- Turnos tomados por teléfono, en horarios limitados.
- Agenda en papel o en Excel, con riesgo de turnos dobles y olvidos.
- El paciente espera sin saber si le quedó el turno.

**Qué gana cada persona:**

| Quién | Qué gana |
|---|---|
| Paciente | Reserva su turno las 24 horas desde el celular, sin llamar, y puede ver o cancelar los suyos. |
| Médico | Ve su agenda del día actualizada sola, desde el teléfono. |
| Administrador | Controla usuarios, profesionales y turnos desde una pantalla, donde esté. |

**Respuestas a las preguntas típicas, en criollo:**

| Pregunta | Respuesta |
|---|---|
| ¿Hay que instalar algo? | En desarrollo no: se usa Expo Go (una app gratuita) y se entra escaneando un código. Para distribuirla como app instalable hay que generar su build (por ejemplo, con EAS Build). |
| ¿Es una web o una app? | Las dos: SaludWEB tiene web para navegador y esta app para celular, y las dos hablan con el mismo sistema. |
| ¿Dónde están los datos? | En el servidor del sistema; la app solo los pide y los muestra. |
| ¿Es seguro? | La sesión se guarda localmente en el teléfono, cada usuario entra con su clave y, además, se puede proteger con la huella o el rostro del dueño del dispositivo. |
| ¿Cuánto cuesta? | El software no tiene licencias: está hecho con tecnología libre (React Native, Expo) y corre en un celular común. |

**Demo de 3 minutos (guion para mostrarlo en vivo):**

1. Abrir la app y mostrar la pantalla de login.
2. Entrar como paciente y mostrar que ve solo lo suyo.
3. Reservar un turno desde el celular y, en la web del consultorio, verlo aparecer.
4. Mostrar el bloqueo con huella o rostro, si el teléfono lo tiene.

**Analogía que funciona:** es como la app del banco: el celular es solo la ventana
desde la que se opera, y la caja fuerte (los datos y las reglas) está en el
servidor del sistema.

## ¿Se puede usar en otras computadoras (u otros celulares)?

**Sí.** La app no está atada a un dispositivo.

### En desarrollo

- **Celular físico:** Expo Go (app gratuita) escaneando el QR que imprime `npm start`.
- **Emulador Android:** la API se ve desde `http://10.0.2.2:8000/api`.
- **Navegador:** `http://127.0.0.1:8000/api`.

En los tres casos hace falta el backend corriendo (ver el README del Backend). Si
el celular es físico y va por WiFi, el backend tiene que escuchar en la red
(`php -S 0.0.0.0:8000`) y la URL es `http://<IP-de-tu-PC>:8000/api` (ver la
sección "Variables de entorno").

### Para distribuirla como app instalable

Hoy corre con Expo Go. Para que cualquier persona la instale hay que generar un
build (por ejemplo, con **EAS Build** de Expo) y publicarla o compartir el
instalador. Es un paso aparte, todavía no incluido en el proyecto.

### Lo que NO hace falta

- iOS ni Android "con licencia": el emulador y Expo Go son gratuitos.
- Un celular nuevo: la app es liviana (lista virtualizada, peticiones con tiempo máximo de espera).
- Instalar nada en la PC del usuario final que solo quiera usar la web.

## Base de datos de desarrollo

La app **no guarda los datos en el celular**: los pide al backend y los muestra.
La base de desarrollo del proyecto es un archivo **SQLite** del backend, en
`SaludWEB_Backend/storage/saludweb.sqlite`, que se crea solo en el primer
arranque de la API y **no se sube a GitHub** (cada clone genera el suyo, vacío de
cuentas). Detalle completo —qué contiene, cómo regenerar los datos de demo y
cómo moverla— en la sección **"Base de datos de desarrollo"** del
[README del Backend](https://github.com/ailenquaglino089-ui/SaludWEB_Backend/blob/main/README.md).

## Guía para preparar el sistema para producción y defensa

Guía práctica, comentada línea por línea, para llevar un proyecto al entorno de producción
con garantías de calidad y defenderlo con solidez: ambientes (desarrollo, prueba y
producción), variables de configuración, deploy, CI/CD, backups, README profesional,
documentación funcional y técnica, y los diagramas necesarios (ER, casos de uso,
arquitectura y flujo), con una lista de verificación final para la defensa. Está en la raíz
de los tres repositorios del proyecto (Backend, Web y Mobile):

- [PREPARAR_SISTEMA_PARA_PRODUCCION_Y_DEFENSA.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/PREPARAR_SISTEMA_PARA_PRODUCCION_Y_DEFENSA.md)

## Documentar y Publicar: El Camino al Éxito del Proyecto

Guía práctica comentada línea por línea para documentar, limpiar, preparar y publicar el proyecto con calidad profesional y lista para defensa. Incluye objetivos, revisión técnica, README, manual de instalación, arquitectura, diagrama de base de datos, preparación para el deploy, verificación y publicación, con el entregable El Paquete.

- [DOCUMENTAR_Y_PUBLICAR_EL_CAMINO_AL_EXITO.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/DOCUMENTAR_Y_PUBLICAR_EL_CAMINO_AL_EXITO.md)

## Arquitectura y Sistemas Operativos aplicada al proyecto

Correspondencia entre las consignas del trabajo práctico de Arquitectura y Sistemas Operativos y la implementación real de SaludWEB, con los ejercicios de planificación corregidos y la bibliografía de referencia.

- [ARQUITECTURA_Y_SISTEMAS_OPERATIVOS_APLICADO.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/ARQUITECTURA_Y_SISTEMAS_OPERATIVOS_APLICADO.md)

## Trabajos prácticos 2 e Integrador aplicados al proyecto

Resolución comentada del TP2 (planificación FCFS, SJF, SRTF, Round Robin y prioridad, y Algoritmo del Banquero) y del TP Integrador (19 consignas de arquitectura, sistemas operativos, memoria, archivos, interrupciones y redes), con la aplicación a SaludWEB y las correcciones para la entrega.

- [TRABAJO_PRACTICO_2_E_INTEGRADOR_APLICADO.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/TRABAJO_PRACTICO_2_E_INTEGRADOR_APLICADO.md)

## Matemática discreta y lógica aplicadas al proyecto

Aplicación del material de cátedra de Erika R. Aab (sistemas de numeración, lógica proposicional, conjuntos, relaciones, matrices, grafos y árboles) a SaludWEB: bases y conversiones en colores, permisos y trazabilidad; tablas de verdad y reglas de autorización; conjuntos y SQL; relaciones y claves foráneas; matrices, B-tree y árboles. Incluye las actividades resueltas, las correcciones al material y la trazabilidad `archivo:línea`.

- [MATEMATICA_DISCRETA_Y_LOGICA_APLICADAS.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/MATEMATICA_DISCRETA_Y_LOGICA_APLICADAS.md)

## Probabilidad y estadística aplicadas al proyecto

Aplicación del material de cátedra de Probabilidad y Estadística a SaludWEB: estadística descriptiva e inferencial, tablas de frecuencia, medidas de tendencia central y dispersión, boxplot, probabilidad, sucesos, probabilidad condicional, independencia, probabilidad total, Bayes, variables aleatorias y distribuciones binomial, normal y Poisson. Incluye la Guía N°1 verificada, la Guía N°2 resuelta con las 500 respuestas del formulario, el análisis de los datos reales de la base de desarrollo y el segundo recuperatorio, con trazabilidad de las consultas y las limitaciones de los datos.

- [PROBABILIDAD_Y_ESTADISTICA_APLICADAS.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/PROBABILIDAD_Y_ESTADISTICA_APLICADAS.md)

## Organización empresarial aplicada al proyecto

Aplicación del material de Organización Empresarial a SaludWEB: administración como ciencia, técnica y arte; proceso administrativo y previsión; organizaciones, recursos y clasificación; organigramas de Mercería SA y Design & Harmony; documentos comerciales; roles y habilidades del administrador; emprendedor; eficacia, eficiencia y economicidad; diseño de estructuras según Mintzberg; Trabajo Integrador Final y plan de negocios. Incluye la Actividad 1, la Actividad 2 y una propuesta de estructura para la etapa inicial del proyecto.

- [ORGANIZACION_EMPRESARIAL_APLICADA.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/ORGANIZACION_EMPRESARIAL_APLICADA.md)

## Bases de Datos I: gestión de pedidos y stock aplicada al proyecto

Aplicación del Parcial II de Bases de Datos I a SaludWEB: modelo de referencia de rubros, proveedores, clientes, productos, pedidos, ítems y movimientos de stock; DER y diccionario de datos; normalización hasta 3FN; DDL de referencia; trigger que impide stock negativo; índices; vistas `vw_stock_actual` y `vw_reportes_pedidos`; las 15 consultas obligatorias; carga masiva reproducible y verificación. Explica qué tablas actuales de SaludWEB cumplen cada rol y qué extensión de farmacia e insumos haría falta. No incluye el archivo `.sql` ni el PDF de entrega del parcial.

- [BASES_DE_DATOS_I_GESTION_DE_PEDIDOS_APLICADA.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/BASES_DE_DATOS_I_GESTION_DE_PEDIDOS_APLICADA.md)

## Metodología de Sistemas II aplicada al proyecto

Aplicación del material de Metodología de Sistemas II a SaludWEB: calidad de diseño y los diez principios, SOLID, arquitectura en capas, lógica de negocio, acceso a datos, patrones, UML, evaluación heurística, prueba de usabilidad, estrategia de pruebas y resolución de los TP 1 a 3. Incluye diagramas Mermaid, trazabilidad `archivo:línea` y una deuda prioritaria de autorización.

- [METODOLOGIA_DE_SISTEMAS_II_APLICADA.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/METODOLOGIA_DE_SISTEMAS_II_APLICADA.md)

## Análisis de Datos aplicado al proyecto

Aplicación del recorrido de Análisis de Datos a SaludWEB: fuentes, inventario, calidad, estadística descriptiva, probabilidad, indicadores, visualización y límites. Analiza la base real de desarrollo (223 pacientes, 8 médicos, 25 bloques, 1 cita y 17 triages), la Guía N°2 de 500 estudiantes y las precauciones para un tablero honesto.

- [ANALISIS_DE_DATOS_APLICADO.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/ANALISIS_DE_DATOS_APLICADO.md)

## Gestión de Desarrollo de Software aplicada al proyecto

Aplicación de Gestión de Desarrollo de Software a SaludWEB: alcance, EDT, fases, interesados, riesgos, calidad, configuración y el TP **Reportes e Indicadores en Proyectos de Software**. Audita el tablero publicado (85 %, 2 días, 1 bug, 9 historias y velocidad 8/10/9), lo contrasta con la evidencia del repositorio y propone un tablero con fórmula, fuente, fecha y dueño.

- [GESTION_DE_DESARROLLO_DE_SOFTWARE_APLICADA.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/GESTION_DE_DESARROLLO_DE_SOFTWARE_APLICADA.md)

## Derecho Aplicado a la Informática aplicado al proyecto

Aplicación de Derecho Aplicado a la Informática a SaludWEB: derecho público y privado, jerarquía normativa, derechos digitales, Ley 25.326, datos sensibles de salud, consentimiento, firma electrónica y digital, responsabilidad civil, prueba digital, trabajo informático, propiedad intelectual, consumidor, ciberdelitos, IA y casos de análisis. Incluye matriz legal y plan de cumplimiento. No constituye asesoramiento jurídico.

La sección **19.5** del documento deja la trazabilidad del material de cátedra: qué aportó cada archivo de la carpeta `LEGISLACIÓN`, los cinco grupos de contenido, los parciales, los trabajos prácticos y el repaso. También aclara que el PDF del Módulo 1 es un duplicado y que el archivo de asistencia es administrativo. Los archivos fuente no se copiaron al repositorio; la aplicación queda en el documento publicado.

| Archivo o grupo | Aplicación en SaludWEB | Secciones |
|---|---|---|
| Módulo 1 | Derecho público y privado, jerarquía normativa y estructura del Estado | 1, 3, 4 y 12 |
| Módulo 2 | Derecho civil y comercial aplicado a la informática | 5, 7, 10 y 11 |
| Unidad 2 | Personas, capacidad, obligaciones, contratos y responsabilidad; familia, sucesiones y derechos reales fuera de alcance | 5.1 a 5.3 y 7 |
| Unidad 3 | Subordinación, principios protectores, teletrabajo, pasantías y propiedad del código | 9.1 a 9.6 |
| Unidades 4 y 5 | Derecho informático, firma, prueba, ciberdelitos, propiedad intelectual, licencias, marcas, comercio electrónico e intermediarios | 2, 4, 6, 8, 10, 11, 12 y 13 |
| Examen conceptual Unidad 4 | Autoevaluación de conceptos | 17 |
| Trabajo áulico Unidad 4 | Libertad de expresión, medidas cautelares, intermediarios y habeas data | 14.4 a 14.6 |
| Caso 3 | IA en el empleo público | 14.2 |
| Caso 4 | Competencias nacionales y provinciales en ciberdelitos | 14.3 |
| Clase 25/09 | Tareas de cuidado, privacidad y reforma laboral Ley 27.742 | 9.2 y 9.3 |
| Actividad CloudNet | Nube, clickwrap, firma electrónica, responsabilidad y ciberseguridad | 14.1 |
| Repaso | Repaso integrador del Módulo 1 y jerarquía normativa | 1, 3, 4, 17 y 19.3 |

`ASISTENCIA Y CRITERIOS DE EVALUACIÓN` es material administrativo y no aporta contenido jurídico. `modulo 1 Alumnos (1).pdf` es el duplicado del Módulo 1.

- [DERECHO_APLICADO_A_LA_INFORMATICA_APLICADO.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/DERECHO_APLICADO_A_LA_INFORMATICA_APLICADO.md)

## Cómo defender un proyecto profesional aplicado al proyecto

Guía para preparar la defensa oral de SaludWEB: qué evalúa un tribunal, cómo explicar el problema antes del código, la arquitectura cliente-servidor, la justificación de las tecnologías, la seguridad y la autenticación, la base de datos, la integridad y el tiempo real, las decisiones por pantalla, un guion de 10 minutos, las preguntas difíciles, la lista de verificación, los límites y la deuda técnica, y la trazabilidad de cada afirmación. Incluye diagramas Mermaid, un plan B para la demo y una matriz de evidencia; complementa el discurso no técnico y la demo de 3 minutos del README y la guía de producción y defensa.

- [COMO_DEFENDER_UN_PROYECTO_PROFESIONAL_APLICADO.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/COMO_DEFENDER_UN_PROYECTO_PROFESIONAL_APLICADO.md)

## Simulación de Defensa Final

Guía de ensayo comentada línea por línea para llegar a la defensa con un recorrido probado: tres rondas de práctica, guion cronometrado de 12 minutos, transiciones memorizables, demo por roles, plan B, cuatro fragmentos de código explicados línea por línea, resultados verificados, límites declarados, preguntas técnicas y metodológicas, video de respaldo y checklist final. Se apoya en la evidencia del repositorio y no inventa métricas: distingue lo medido, lo propuesto y la deuda pendiente. Está en la raíz de los tres repositorios:

- [SIMULACION_DE_DEFENSA_FINAL.md](https://github.com/ailenquaglino089-ui/SaludWEB_Mobile/blob/main/SIMULACION_DE_DEFENSA_FINAL.md)

## Resumen del trabajo documental

En esta etapa se agregaron a la raíz de los tres repositorios y se enlazaron desde este README:

- La guía **Documentar y Publicar: El Camino al Éxito del Proyecto**, comentada línea por línea.
- **Arquitectura y Sistemas Operativos aplicada al proyecto**, con las consignas de la cátedra vinculadas al código y las tablas de planificación corregidas.
- **Trabajos prácticos 2 e Integrador aplicados**, con el TP2 resuelto (planificación y Algoritmo del Banquero) y las 19 consignas del TP Integrador corregidas y aplicadas.
- **Matemática discreta y lógica aplicadas**, con los sistemas de numeración, la lógica proposicional, los conjuntos, las relaciones, las matrices, los grafos y los árboles vinculados al código, las actividades resueltas y las correcciones al material.
- **Probabilidad y estadística aplicadas**, con la estadística descriptiva del proyecto, las probabilidades de los pacientes y la agenda, la Guía N°1 verificada, la Guía N°2 resuelta y las distribuciones binomial, normal y Poisson.
- **Organización empresarial aplicada**, con el proceso administrativo, los organigramas de la Actividad 2, los documentos comerciales, el diseño de estructuras, el Trabajo Integrador y el plan de negocios.
- **Bases de Datos I: gestión de pedidos y stock aplicada**, con el modelo relacional de referencia, la normalización, el DDL, las vistas, el control de stock y las 15 consultas del parcial.
- **Metodología de Sistemas II aplicada**, con calidad, SOLID, arquitectura, patrones, UML, UI/UX, pruebas y los TP 1 a 3.
- **Análisis de Datos aplicado**, con inventario, calidad, estadística descriptiva, probabilidad, indicadores y visualización sobre la base real y la Guía N°2.
- **Gestión de Desarrollo de Software aplicada**, con planificación, riesgos, calidad y la auditoría del tablero de reportes e indicadores.
- **Derecho Aplicado a la Informática aplicado**, con protección de datos de salud, consentimiento, firma, responsabilidad, prueba digital, propiedad intelectual, ciberdelitos y matriz de cumplimiento.
- **Cómo defender un proyecto profesional aplicado**, con el guion de 10 minutos, las preguntas difíciles, la matriz de evidencia, el plan B de la demo y la deuda técnica declarada.
- **Simulación de Defensa Final**, con tres rondas de ensayo, guion cronometrado, demo por roles, código explicado línea por línea, preguntas frecuentes y checklist de presentación.

No se modificó el código de la aplicación: los cambios son de documentación. También se corrigieron los acentos de las secciones nuevas de este README y se dejaron marcados los datos del TP2 que conviene confirmar con la tabla original. El detalle cronológico y los números de publicación están en el [registro de cambios](https://github.com/ailenquaglino089-ui/SaludWEB_Web/blob/main/REGISTRO_DE_CAMBIOS.md).
