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
> (ver [`GUIA_TIEMPO_REAL.md`](../SaludWEB_Backend/GUIA_TIEMPO_REAL.md)). En mobile el
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
  [AGENDA de trabajo del Backend](../SaludWEB_Backend/AGENDA_DE_TRABAJO.md) y en el
  [PROJECT_BRIEF](../SaludWEB_Backend/PROJECT_BRIEF.md).
- El backend trae sus propias suites de pruebas (`probar_roles.php`,
  `probar_vinculacion.php`, `probar_turnera.php`, `probar_tiempo_real.php`,
  `probar_seguridad.php`); la app móvil usa la **misma API**, así que las reglas verificadas
  ahí valen para esta app.
- La verificación en emulador/dispositivo real queda agendada en la fase **E3**
  (05–06/10): instalación con Expo Go, login, biometría y SSO contra el backend local.
- La revisión y prueba del proyecto (guía "de checklist a evidencia") está en
  [`REVISAR_Y_PROBAR_EL_PROYECTO.md`](REVISAR_Y_PROBAR_EL_PROYECTO.md), con los entregables de
  evidencia en `QA/`.

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
