# Guía de código — Mobile · components y formularios

> Recorrido línea por línea de los componentes reutilizables y formularios.
> Índice general en ../GUIA_DE_CODIGO.md

## `src/components/BottomNav.jsx` (66 líneas)
- **Rol:** Barra de navegación inferior fija (sticky) con los 4 accesos críticos del menú principal y el botón de salir. Implementa el patrón "Bottom Navigation Bar" en la zona natural del pulgar.
- **Recorrido línea por línea:**
  - L1–L8: Comentario de cabecera. Explica que es la barra inferior fija, que las acciones frecuentes quedan en la zona del pulgar y que se muestran como máximo 5 elementos críticos.
  - L9–L12: Imports. `React` (L9), `View`, `Text`, `TouchableOpacity` de `react-native` (L10) y los estilos compartidos `styles` desde `../styles` (L12).
  - L13–L21: Comentario y constante `ELEMENTOS`. Cada ítem tiene `texto` (L17–L20: Inicio, Pacientes, Médicos, Recetas), un `icono` (emoji) y `pantalla` (destino en App.js).
  - L22–L27: Comentario de props y firma del componente `BottomNav({ pantalla, navegar, cerrarSesion })`. `pantalla` es la clave activa, `navegar` cambia de pantalla y `cerrarSesion` es el logout.
  - L28–L30: `return` y apertura del `View` contenedor con `styles.barraNavegacion` (borde superior sobre el contenido).
  - L31–L34: `ELEMENTOS.map(...)` que recorre cada acceso y calcula `activo` comparando `pantalla === elem.pantalla`.
  - L36–L44: `TouchableOpacity` de cada ítem: `key`, `styles.navItem`, `onPress` que llama a `navegar(elem.pantalla)`, `accessibilityRole="button"` y `accessibilityState` con `selected`.
  - L45–L50: Ícono del ítem (`Text` con `fontSize` 20) y etiqueta, que usa `styles.navActivo` si está activo o `styles.navInactivo` si no.
  - L51–L53: Cierre del `TouchableOpacity`, `return` del map y cierre del `.map`.
  - L54–L63: Bloque de cierre de sesión: `TouchableOpacity` siempre visible que llama a `cerrarSesion` (L58), con ícono de puerta (L61) y etiqueta "Salir" (L62).
  - L64–L66: Cierre del `View`, `return` y cierre de la función.
- **Se conecta con:** `src/styles` (L12) y `App.js` (le pasa `pantalla`, `navegar` y `cerrarSesion`).

## `src/components/CampoInput.jsx` (36 líneas)
- **Rol:** Campo de formulario reutilizable: encapsula etiqueta + caja de texto + mensaje de error, para que todos los formularios compartan apariencia y validación por campo (DRY).
- **Recorrido línea por línea:**
  - L1–L7: Comentario de cabecera. Describe la estructura "label + caja de texto + mensaje de error" y el principio DRY.
  - L8–L11: Imports. `React` (L8), `View`, `Text`, `TextInput` de `react-native` (L9) y `styles` (L11).
  - L12–L18: Comentario de props y firma `CampoInput({ etiqueta, valor, onChange, error, ...rest })`. `valor`/`onChange` controlan el campo; `error` es el mensaje específico y `...rest` son props nativas del `TextInput`.
  - L19–L22: `return` y apertura del `View`; `Text` con `styles.label` que muestra la etiqueta.
  - L23–L30: `TextInput` con `styles.input`, `value={valor}`, `onChangeText={onChange}` y el spread `{...rest}` (placeholder, keyboardType, etc.).
  - L31–L36: Mensaje de error con `styles.errorCampo`, que solo aparece cuando `error` tiene valor (L33); cierre del `View` y de la función.
- **Se conecta con:** `src/styles` (L11); lo usan los tres formularios.

## `src/components/ConfirmarModal.jsx` (79 líneas)
- **Rol:** Diálogo de confirmación de borrado (equivalente mobile del modal "¿Eliminar?" del Web), que exige un toque explícito antes de enviar el DELETE.
- **Recorrido línea por línea:**
  - L1–L6: Comentario de cabecera. Explica que evita borrados accidentales pidiendo confirmación antes del DELETE.
  - L7–L12: Imports. `React` (L7), `View`, `Text`, `TouchableOpacity`, `Modal` y `ActivityIndicator` de `react-native` (L8–L10) y `styles` (L12).
  - L13–L27: Comentario de props y firma `ConfirmarModal({ visible, titulo, mensaje, alConfirmar, alCancelar, cargando = false })`. `cargando` deshabilita botones mientras el backend procesa.
  - L28–L35: `return` y `Modal` nativo con `visible`, `transparent`, `animationType="fade"` y `onRequestClose={alCancelar}` (escape).
  - L36–L42: `View` de pantalla completa con fondo oscuro semitransparente, diálogo centrado y `padding` 24.
  - L43–L48: Tarjeta blanca del diálogo (`styles.tarjeta`), título (`styles.titulo`, `fontSize` 18) y mensaje (`styles.texto`).
  - L49–L51: `View` de botones en fila con `marginTop` 16 y separación `gap` 8.
  - L52–L59: Botón "Cancelar" (`styles.botonSecundario` + `styles.botonMitad`) que llama a `alCancelar` y se deshabilita con `cargando`.
  - L60–L66: Botón "Eliminar" (`styles.botonPeligro` + `styles.botonMitad`) que llama a `alConfirmar` y se deshabilita con `cargando`.
  - L67–L73: Contenido del botón de borrado: si `cargando` muestra `ActivityIndicator` blanco; si no, el texto "Eliminar" (`styles.botonPeligroTexto`).
  - L74–L79: Cierres de los `View`, del `Modal`, del `return` y de la función.
- **Se conecta con:** `src/styles` (L12); lo usan `Pacientes`, `Medicos` y `Prescripciones`.

## `src/components/Selector.jsx` (138 líneas)
- **Rol:** Selector desplegable tipo bottom sheet: equivale a un `<select>` de HTML. Al tocar el campo se abre un `Modal` con las opciones en lista vertical. Sin dependencias externas.
- **Recorrido línea por línea:**
  - L1–L7: Comentario de cabecera. Describe el patrón bottom sheet y que se cierra al elegir, avisando al formulario.
  - L8–L13: Imports. `React` y `useState` (L8), `View`, `Text`, `TouchableOpacity`, `Modal`, `FlatList`, `ActivityIndicator` (L9–L11) y `styles` (L13).
  - L14–L24: Comentario de props. `etiqueta`, `opciones` (`[{valor, etiqueta}]`), `valorSeleccionado`, `textoMuestra` (valor forzado en edición), `onSeleccionar`, `error`, `cargando` y `placeholder`.
  - L25–L36: Firma del componente con las props y estado `abierto` (`useState(false)`, L36) que controla si el `Modal` está visible.
  - L37–L39: `opcionActual`: busca en `opciones` la que coincide con `valorSeleccionado` para resaltarla.
  - L40–L50: Cálculo del `texto` a mostrar (L45–L47: opción del catálogo, texto forzado o placeholder/#id) y `colorTexto` (L50: oscuro si hay selección, gris si no).
  - L51–L55: `return`, apertura del `View` y `Text` con la etiqueta (`styles.label`).
  - L56–L65: `TouchableOpacity` que abre el `Modal` (`onPress` → `setAbierto(true)`), con `styles.input`, `accessibilityRole` y `accessibilityLabel`; adentro el `Text` con el valor o placeholder.
  - L66–L73: `Modal` con `visible={abierto}`, `transparent`, `animationType="slide"` y `onRequestClose` que lo cierra.
  - L74–L83: `TouchableOpacity` de fondo semitransparente que al tocarlo cierra el selector (`activeOpacity={1}`, hoja pegada al borde inferior).
  - L84–L92: Hoja inferior blanca (border radius superior, `padding` 16, `maxHeight` 70%) con el título de la etiqueta.
  - L93–L100: Comentario sobre el color de la ruleta (no aplica contraste de texto de WCAG) y el ternario: si `cargando`, muestra `ActivityIndicator`.
  - L101–L121: `FlatList` del catálogo: `data`, `keyExtractor`, `style` y `renderItem` que dibuja cada opción como `TouchableOpacity` (resalta la seleccionada); al tocarla llama a `onSeleccionar(item)` y cierra el modal.
  - L122–L129: `ListEmptyComponent` que muestra "Sin opciones" cuando el catálogo llega vacío, y cierre del ternario.
  - L130–L138: Cierres de la hoja, del fondo, del `Modal`; mensaje de error del campo (L135) y cierre del `View` y la función.
- **Se conecta con:** `src/styles` (L13); lo usan `FormularioPaciente` y `FormularioPrescripcion`.

## `src/components/formularios/FormularioMedico.jsx` (157 líneas)
- **Rol:** Formulario reutilizado para crear (POST `/api/medicos`) y editar (PUT `/api/medicos/{id}`) médicos. Campos: nombre, matrícula y especialidad. Validaciones de cliente espejo de `MedicoService`. Layout con campos en `ScrollView` y pie fijo.
- **Recorrido línea por línea:**
  - L1–L9: Comentario de cabecera. Detalla las operaciones, los campos, que el backend exige rol admin y el layout de pie fijo.
  - L10–L14: Imports. `React` y `useState` (L10), `View`, `Text`, `ScrollView`, `TouchableOpacity`, `ActivityIndicator`, `KeyboardAvoidingView`, `Platform` (L11–L14).
  - L15–L26: Imports `styles` (L16), `api` (L18), `CampoInput` (L20); comentario de props y firma `FormularioMedico({ inicial, onGuardado, onCancelar })`.
  - L27–L38: Estados: `nombre` (L28), `matricula` (L30), `especialidad` (L32), `errores` (L34), `error` (L36) y `cargando` (L38). Se precargan con `inicial`.
  - L39–L45: `validarNombre`: exige no vacío (L42) y máximo 150 caracteres (L43); devuelve `''` si es válido (L44).
  - L46–L55: Comienzo de `guardar` con validación de cliente: arma `nuevoError`, lo setea y, si el nombre falla, muestra "Corregí el campo marcado" y sale sin llamar la API.
  - L56–L66: Activa `cargando` y limpia `error` (L58–L59); arma el `cuerpo` con nombre, matrícula y especialidad recortados con `.trim()`.
  - L67–L81: Selección del método: `PUT /medicos/{id}` si existe `inicial` (L69) o `POST /medicos` si no (L71); en éxito llama `onGuardado` (L74); en `catch` muestra el mensaje del backend (L77); `finally` apaga `cargando` (L79).
  - L82–L90: `return` y `KeyboardAvoidingView` (L85–L88, `behavior` padding en iOS); título según modo ("Editar médico" o "Nuevo médico", L90).
  - L91–L96: Error general de envío (L93) y apertura del `ScrollView` con `keyboardShouldPersistTaps="handled"` (L96).
  - L97–L107: `CampoInput` de Nombre (obligatorio): valor, onChange, error, placeholder, `maxLength` 150, `autoCapitalize` y `editable` según `cargando`.
  - L108–L116: `CampoInput` de Matrícula (opcional): placeholder y `maxLength` 50.
  - L117–L126: `CampoInput` de Especialidad (opcional): placeholder, `maxLength` 100 y `autoCapitalize`.
  - L127–L130: Cierre del `ScrollView` y apertura del pie fijo `styles.pieFormulario`.
  - L131–L138: Botón "Cancelar" (`styles.botonSecundario` + `botonMitad`) que llama a `onCancelar` y se deshabilita con `cargando`.
  - L139–L154: Botón de guardar (`styles.botonPrimario` + `botonMitad`): muestra `ActivityIndicator` si `cargando` o el texto "Guardar cambios"/"Guardar" según el modo; cierre del `View` del pie.
  - L155–L157: Cierre del `KeyboardAvoidingView`, del `return` y de la función.
- **Se conecta con:** `src/styles`, `src/api/client` y `CampoInput` (L16–L20); lo muestra `Medicos.jsx`.

## `src/components/formularios/FormularioPaciente.jsx` (181 líneas)
- **Rol:** Formulario reutilizado para crear (POST `/api/pacientes`) y editar (PUT `/api/pacientes/{id}`) pacientes. Campos: nombre, DNI y obra social. Validaciones de cliente espejo de `PacienteService`. Pie fijo de formulario.
- **Recorrido línea por línea:**
  - L1–L9: Comentario de cabecera. Detalla operaciones, campos, que replica las validaciones del backend y el layout de pie fijo.
  - L10–L14: Imports. `React`, `useState` y `useEffect` (L10); componentes de `react-native` (L11–L14).
  - L15–L28: Imports `styles` (L16), `api` (L18), `CampoInput` (L20), `Selector` (L22); comentario de props y firma `FormularioPaciente({ inicial, onGuardado, onCancelar })`.
  - L29–L44: Estados: `nombre` (L30), `dni` (L32), `idObraSocial` (L34, por defecto 1), `obrasSociales` (L36), `cargandoObras` (L38), `errores` (L40), `error` (L42) y `cargando` (L44).
  - L45–L56: `useEffect` de montaje: descarga `GET /obras-sociales` (L49), mapea cada obra a `{valor, etiqueta}` (L51), en `catch` deja la lista vacía (L53) y en `finally` apaga `cargandoObras` (L55).
  - L57–L63: `validarNombre`: no vacío (L60) y máximo 150 caracteres (L61); devuelve `''` si es válido.
  - L64–L66: `validarDni`: solo limita la longitud a 50 caracteres (L66).
  - L67–L77: Comienzo de `guardar` con validación de nombre y DNI: arma `nuevoError` (L71), lo setea y, si alguno falla, muestra "Corregí los campos marcados" y sale (L74–L77).
  - L78–L88: Activa `cargando` y limpia `error` (L80–L81); arma el `cuerpo` con nombre, DNI y `id_obra_social` (o 1) recortados.
  - L89–L104: `PUT /pacientes/{id}` si existe `inicial` (L91) o `POST /pacientes` si no (L93); éxito llama `onGuardado` (L96); `catch` muestra el mensaje del backend (L100); `finally` apaga `cargando` (L102).
  - L105–L113: `return` y `KeyboardAvoidingView` (L108–L111); título según modo ("Editar paciente" o "Nuevo paciente", L113).
  - L114–L119: Error general de envío (L116) y apertura del `ScrollView` (L119).
  - L120–L130: `CampoInput` de Nombre (obligatorio): valor, onChange, error, `maxLength` 150 y `autoCapitalize`.
  - L131–L141: `CampoInput` de DNI (opcional): `keyboardType="number-pad"`, `maxLength` 50 y `editable` según `cargando`.
  - L142–L150: `Selector` de Obra social: `opciones={obrasSociales}`, `valorSeleccionado`, `onSeleccionar` que guarda el id, `cargando` y placeholder.
  - L151–L154: Cierre del `ScrollView` y apertura del pie fijo `styles.pieFormulario`.
  - L155–L162: Botón "Cancelar" (`botonSecundario` + `botonMitad`) que llama a `onCancelar` y se deshabilita con `cargando`.
  - L163–L178: Botón de guardar (`botonPrimario` + `botonMitad`): `ActivityIndicator` si `cargando` o texto "Guardar cambios"/"Guardar"; cierre del `View` del pie.
  - L179–L181: Cierre del `KeyboardAvoidingView`, del `return` y de la función.
- **Se conecta con:** `src/api/client`, `CampoInput` y `Selector` (L18–L22); lo muestra `Pacientes.jsx`.

## `src/components/formularios/FormularioPrescripcion.jsx` (307 líneas)
- **Rol:** Formulario de prescripciones. Alta (POST `/api/prescripciones`) y edición (PUT `/api/prescripciones/{id}`). El backend exige rol `medico`. El paciente no se puede cambiar en edición y los medicamentos se editan dinámicamente.
- **Recorrido línea por línea:**
  - L1–L11: Comentario de cabecera. Detalla los endpoints con sus cuerpos, la restricción de rol y que los medicamentos se agregan/quitan.
  - L12–L16: Imports. `React`, `useState`, `useEffect` (L12); componentes de `react-native` incluido `TextInput` (L13–L16).
  - L17–L26: Imports `styles` (L18), `api` (L20), `useAuth` (L22), `CampoInput` (L24) y `Selector` (L26).
  - L27–L34: Comentario de props, firma `FormularioPrescripcion({ inicial, onGuardado, onCancelar })` y `const { usuario } = useAuth()` que firma la receta con el id del médico logueado.
  - L35–L63: Estados: `idPaciente` (L37), `nombrePaciente` (L39), `medicamentos` (L42–L47, precarga los existentes o una fila vacía), `indicaciones` (L49), `fechaVencimiento` (L51–L53), `pacientes` (L55), `cargandoPacientes` (L57), `errores` (L59), `error` (L61) y `cargando` (L63).
  - L64–L82: `useEffect` de montaje: en edición sale temprano (L68); en alta descarga `GET /pacientes?por_pagina=100` (L69), mapea a `{valor: id, etiqueta: "Nombre (DNI)"}` (L71–L76), en `catch` deja lista vacía (L79) y en `finally` apaga `cargandoPacientes` (L81).
  - L83–L87: `actualizarMedicamento(indice, campo, valor)`: actualiza un solo campo de un medicamento por índice.
  - L88–L92: `agregarMedicamento`: agrega una fila vacía al final.
  - L93–L100: `quitarMedicamento(indice)`: quita la fila; si era la única, deja una vacía (nunca quedan cero filas).
  - L101–L106: `validarFecha`: si viene, debe cumplir el formato `AAAA-MM-DD` (regex); devuelve `''` si es válida.
  - L107–L112: `medicamentosLimpios`: filtra las filas sin nombre y recorta espacios de nombre y dosis.
  - L113–L130: Comienzo de `guardar` con validación: `paciente` obligatorio solo en alta (L120), al menos un medicamento (L122) y fecha válida (L124); si hay errores avisa y sale (L127–L130).
  - L131–L145: Activa `cargando` y limpia `error` (L133–L134); en modo alta arma `cuerpoAlta` con `id_paciente`, `id_medico` (firma), medicamentos, indicaciones y fecha (L138–L144) y hace `POST`.
  - L146–L163: En edición arma `cuerpoEdicion` (medicamentos, indicaciones, fecha; sin paciente) y hace `PUT` (L148–L153); en éxito llama `onGuardado` (L156); `catch` muestra el mensaje del backend (L159); `finally` apaga `cargando` (L161).
  - L164–L177: `return` y `KeyboardAvoidingView` (L167–L170); título según modo (L172–L174) y error general de envío (L177).
  - L178–L180: Apertura del `ScrollView` con `keyboardShouldPersistTaps="handled"`.
  - L181–L205: Bloque del paciente: en alta `Selector` (L183–L194) que al elegir guarda id y nombre; en edición `View` de solo lectura con el nombre (L197–L204) y la ayuda "El paciente de una receta no se puede cambiar".
  - L206–L208: Etiqueta "Medicamentos *" (`styles.label`).
  - L209–L241: `medicamentos.map` que dibuja cada fila: `TextInput` de nombre (L213–L220), `TextInput` de dosis (L222–L229) y botón de quitar (`botonQuitar`, L231–L239) con accesibilidad.
  - L242–L252: Error de medicamentos si quedó vacío (L243) y botón "＋ Agregar medicamento" (`botonSecundario`) que llama a `agregarMedicamento`.
  - L253–L264: `CampoInput` de Indicaciones: multilínea (`numberOfLines` 3, `maxLength` 1000), opcional.
  - L265–L276: `CampoInput` de Fecha de vencimiento: error, placeholder `AAAA-MM-DD`, `keyboardType` de números/puntuación y `maxLength` 10.
  - L277–L280: Cierre del `ScrollView` y apertura del pie fijo `styles.pieFormulario`.
  - L281–L288: Botón "Cancelar" (`botonSecundario` + `botonMitad`) que llama a `onCancelar` y se deshabilita con `cargando`.
  - L289–L303: Botón de guardar (`botonPrimario` + `botonMitad`): `ActivityIndicator` si `cargando` o texto "Guardar cambios"/"Guardar"; cierre del `View`.
  - L304–L307: Cierre del `View`, del `KeyboardAvoidingView`, del `return` y de la función.
- **Se conecta con:** `src/styles`, `src/api/client`, `src/context/AuthContext`, `CampoInput` y `Selector` (L18–L26); lo muestra `Prescripciones.jsx`.
