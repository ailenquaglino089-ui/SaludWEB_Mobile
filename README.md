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
- ✅ **Usabilidad**: targets táctiles de 44px+, tipografía de 16px y contraste WCAG AA.
- ✅ **Rendimiento**: FlatList virtualizada, paginado y timeout de peticiones.
- ✅ **Persistencia de sesión** con AsyncStorage (no se vuelve a pedir login al reabrir).

## Contenido

- `App.js` — Punto de entrada y navegación por estado + barra inferior.
- `src/components/` — `BottomNav.jsx` (barra de navegación inferior sticky).
- `src/screens/` — Login, Dashboard, Pacientes, Medicos, Prescripciones y `PagedList` (genérico).
- `src/context/AuthContext.jsx` — Sesión (login/logout) persistida localmente.
- `src/api/client.js` — Cliente HTTP con token JWT, timeout y expulsión ante 401.
- `src/styles.js` — Paleta y estilos compartidos (mismos colores que el Web).
- `src/config.js` — URL de la API y constantes.
- `GUIA_MOBILE.md` — Guía de adaptación mobile comentada línea por línea + checklist.

## Puesta en marcha

```bash
npm install
npm start            # levanta Expo Go / emulador
```

> Para probar contra el backend: en `src/config.js` usá `10.0.2.2` (emulador Android),
> `localhost` (navegador) o la IP local del equipo (celular físico).

### Credenciales de prueba

- Admin: `admin@prueba.com` / `admin123`
- Médico: `medico@prueba.com` / `medico123`
- Paciente: `paciente@prueba.com` / `paciente123`