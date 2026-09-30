// ============================================================
// styles.js - Estilos compartidos de la app móvil
// ============================================================
// Paleta y estilos reutilizables por todas las pantallas, para que la
// identidad visual de SaludWEB sea la misma en el móvil y en la web.
//
// UNA PALETA, ESCRITA A MANO EN LOS DOS LADOS. React Native no lee
// custom properties de CSS: no hay var(--primario) ni un archivo de tokens
// que se pueda importar. Por eso los hex van escritos acá y también están
// escritos en SaludWEB_Web/src/tokens.css, y el trabajo de mantenerlos
// iguales es manual. Cuando se cambia un color hay que cambiarlo en los
// dos repos, o se rompe la paridad. Los valores que deben coincidir son
// los que aparecen al pie de este archivo.
//
// Los comentarios de cada bloque explican POR QUÉ se eligió el valor. Los
// que repiten lo que ya dice la propiedad (un "flex: 1" con un "ocupa todo
// el alto" al lado) se omiten a propósito: no aportan nada, se desactualizan
// apenas el valor cambia y tapan la decisión que sí importa, que es por qué
// ese valor y no otro.
import { StyleSheet } from 'react-native';

// Objeto de estilos exportado; se usa con styles.nombre en el código.
export const styles = StyleSheet.create({
  // Contenedor base de todas las pantallas.
  contenedor: {
    flex: 1,
    // Fondo de la app. El gris muy claro hace que las tarjetas blancas se
    // lean como superficies encima y no como texto perdido en un fondo liso.
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  // Tarjeta blanca con esquinas redondeadas (formularios y listados).
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // shadowColor/Opacity/Radius son la sombra en iOS; elevation es el
    // mismo efecto en Android. React Native NO unifica los dos: la sombra
    // solo aparece si se declaran los tres primeros, y en Android solo
    // si se declara elevation. Por eso van los dos, y no es repetición.
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Título principal de cada pantalla.
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333', // 12.63:1 sobre la tarjeta blanca.
    marginBottom: 12,
  },
  // Contenedor de la cabecera del login (marca + subtítulo centrados).
  tituloWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  // Etiqueta de los campos del formulario.
  label: {
    fontSize: 16,         // 16px: mínimo recomendado para mobile (guía: legibilidad)
    fontWeight: '600',    // Seminegrita
    color: '#333',        // Gris oscuro (contraste > 7:1 sobre blanco, WCAG AA)
  marginBottom: 6,
  },
  // Caja de texto/select del formulario.
  input: {
  borderWidth: 2,
  borderColor: '#e0e0e0',
  borderRadius: 8,
  padding: 12,
    minHeight: 44,           // Altura táctil mínima recomendada (guía: 44x44)
    fontSize: 16,            // 16px: mínimo recomendado para leer en mobile
  backgroundColor: '#fff',
  marginBottom: 12,
  },
  // Botón principal. Usa el mismo violeta que el Web.
  // Antes era #667eea, que con el texto blanco daba 3.66:1 y quedaba
  // fuera de AA. Pasa a #5a6fd0, que da 4.55:1: es el mismo color de
  // marca, un punto más oscuro, y ahora sí se lee.
  botonPrimario: {
    backgroundColor: '#5a6fd0', // Violeta de marca, verificado a 4.55:1 con blanco
    minHeight: 48,              // Target táctil alto: supera el mínimo 44px (guía)
  justifyContent: 'center',
  padding: 14,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 12,
  },
  // Texto del botón primario.
  botonPrimarioTexto: {
    color: '#fff',      // Texto blanco (contrasta con el fondo)
    fontWeight: '600',  // Seminegrita
  fontSize: 16,
  },
  // Botón primario atenuado (estado "deshabilitado" del candado biométrico).
  botonPrimarioOscurecido: {
    opacity: 0.6, // Reduce el contraste para indicar que no se puede tocar
  },
  // Botón de navegación secundario (paginación, volver).
  botonSecundario: {
  backgroundColor: '#e0e0e0',
    minHeight: 44,              // Altura táctil mínima recomendada 44px (guía)
  justifyContent: 'center',
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
  },
  // Botón de peligro (borrado). El rojo era #ef4444, que con el texto
  // blanco daba 3.76:1. Pasa a #b3261e, que da 6.54:1.
  botonPeligro: {
    backgroundColor: '#b3261e', // Rojo de peligro, verificado a 6.54:1 con blanco
    minHeight: 44,              // Altura táctil mínima recomendada 44px (guía)
  justifyContent: 'center',
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
  },
  // Texto común de la app.
  texto: {
    fontSize: 16,  // 16px: mínimo recomendado para cuerpo de texto en mobile (guía)
    color: '#555', // Gris medio (contraste > 7:1 sobre blanco, WCAG AA)
  },
  // Mensaje de error (rojo, igual que .alert-error del Web).
  error: {
    color: '#991b1b',      // Texto rojo oscuro
  backgroundColor: '#fef2f2',
  padding: 10,
  borderRadius: 8,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: '#fca5a5',
  },
  // Fila de la lista (cada registro del listado).
  fila: {
    flexDirection: 'row',      // Elementos en horizontal
    justifyContent: 'space-between', // Texto a izquierda, valor a derecha
  paddingVertical: 8,
    borderBottomWidth: 1,      // Línea separadora fina
  borderBottomColor: '#e0e0e0',
  },
  // Etiqueta de una fila de listado.
  filaLabel: {
    fontSize: 16,     // 16px: legibilidad en mobile (guía)
    color: '#555',    // Gris medio: cumple contraste WCAG AA (>= 4.5:1) sobre blanco
  flex: 1,
  },
  // Valor de una fila de listado.
  filaValor: {
    fontSize: 16,     // 16px: legibilidad en mobile (guía)
    color: '#333',    // Gris oscuro (alto contraste)
    fontWeight: '600',// Seminegrita
    textAlign: 'right', // Alineado a la derecha
  },

  // --- Estilos nuevos aplicados desde la guía "Adaptar el sistema a mobile" ---

  // Barra de navegación inferior fija (Bottom Navigation Bar).
  barraNavegacion: {
    flexDirection: 'row',        // Ítems en horizontal
  backgroundColor: '#ffffff',
  borderTopWidth: 1,
  borderTopColor: '#e0e0e0',
  paddingVertical: 6,
  paddingHorizontal: 4,
  },
  // Cada ítem de la barra inferior (zona natural del pulgar).
  navItem: {
    flex: 1,                     // Reparte el ancho en partes iguales
  alignItems: 'center',
  justifyContent: 'center',
    minHeight: 44,               // Altura táctil mínima 44px (guía)
  paddingVertical: 4,
  },
  // Etiqueta del ítem activo (resaltado en el color de la marca).
  navActivo: {
    fontSize: 12,                // Etiqueta compacta
    color: '#5a6fd0',            // Violeta de marca: 4.55:1 sobre blanco.
                                  // Antes #667eea daba 3.66:1 y no pasaba AA.
    fontWeight: '700',           // Negrita
  },
  // Etiqueta del ítem inactivo.
  navInactivo: {
    fontSize: 12,                // Etiqueta compacta
    color: '#555',               // Gris medio (contraste AA)
  },

  // Contenedor en fila del campo contraseña con botón mostrar/ocultar.
  contrasenaWrapper: {
    flexDirection: 'row',        // Input + botón en horizontal
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#e0e0e0',
  borderRadius: 8,
  backgroundColor: '#fff',
  marginBottom: 12,
  },
  // Botón mostrar/ocultar contraseña (toggle ocular).
  botonMostrar: {
  paddingHorizontal: 12,
    minHeight: 44,               // Altura táctil mínima 44px (guía)
  justifyContent: 'center',
  },
  // Ícono del botón mostrar/ocultar.
  botonMostrarTexto: {
  fontSize: 18,
  },
  // Mensaje de error específico de un campo (validación onBlur).
  errorCampo: {
    color: '#991b1b',            // Texto rojo oscuro (contraste alto)
  fontSize: 14,
    marginTop: -6,               // Se acerca al campo para asociarse visualmente
  marginBottom: 12,
  },

  // --- Estilos nuevos del CRUD completo (alta/edición/baja desde mobile) ---

  // Banner de éxito (verde): feedback positivo tras guardar o eliminar.
  exito: {
    color: '#166534',                // Texto verde oscuro (contraste alto)
  backgroundColor: '#dcfce7',
  padding: 10,
  borderRadius: 8,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: '#86efac',
  },

  // Botón verde "Nuevo" (alta de registros) al tope del listado.
  // El verde era #22c55e y con el texto blanco daba 2.28:1, el peor
  // contraste de toda la app: el botón que crea un registro era el que
  // menos se leía. Pasa a #166534, que da 7.13:1.
  botonNuevo: {
    backgroundColor: '#166534',
    minHeight: 48,                   // Altura táctil superior al mínimo 44px (guía)
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: 14,
  marginBottom: 12,
  },
  // Texto del botón "Nuevo".
  botonNuevoTexto: {
    color: '#fff',                   // Blanco (contrasta con el verde)
    fontWeight: '700',               // Negrita
    fontSize: 16,                    // 16px mínimo legible en mobile (guía)
  },

  // Botón pequeño de acción dentro de una tarjeta (Editar/Eliminar/Estado).
  botonAccion: {
    minHeight: 44,                   // Target táctil mínimo 44px (guía)
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginRight: 8,
  },
  // Variante visual de "Editar" (fondo índigo muy claro).
  botonAccionClaro: {
  backgroundColor: '#e0e7ff',
  },
  // Variante visual de "Eliminar" (fondo rojo muy claro).
  botonAccionPeligro: {
  backgroundColor: '#fee2e2',
  },
  // Texto índigo de las acciones "positivas" (Editar/Estado).
  textoAccion: {
    color: '#4338ca',                // Índigo oscuro (contraste alto)
    fontWeight: '600',               // Seminegrita
  fontSize: 14,
  },
  // Texto rojo de "Eliminar" (comunica peligro visualmente).
  textoAccionPeligro: {
    color: '#b91c1c',                // Rojo oscuro (contraste alto)
    fontWeight: '600',               // Seminegrita
  fontSize: 14,
  },
  // Fila horizontal que contiene los botones de acción de una tarjeta.
  pieAcciones: {
    flexDirection: 'row',            // Botones en horizontal
    justifyContent: 'flex-end',      // Alineados a la derecha de la tarjeta
  marginTop: 10,
  },

  // Pie FIJO de los formularios: acciones siempre visibles junto al pulgar
  // (punto "Pies fijos de formularios" de la guía de adaptación a mobile).
  pieFormulario: {
  backgroundColor: '#ffffff',
    borderTopWidth: 1,               // Línea separadora superior
  borderTopColor: '#e0e0e0',
  padding: 12,
    flexDirection: 'row',            // Botones lado a lado
  gap: 8,
  },
  // Botón que ocupa la mitad del ancho del pie (Cancelar / Guardar).
  botonMitad: {
    flex: 1,                         // Reparte el ancho en partes iguales
  },
  // Texto del botón de peligro (borrado): blanco sobre rojo.
  botonPeligroTexto: {
    color: '#fff',                   // Blanco (contrasta con el rojo)
    fontWeight: '600',               // Seminegrita
    fontSize: 16,                    // 16px mínimo legible (guía)
  },

  // Fila de un medicamento dinámico dentro de la prescripción.
  filaMedicamento: {
    flexDirection: 'row',            // Nombre + dosis + botón quitar en horizontal
  alignItems: 'center',
  marginBottom: 8,
  },
  // Campo "nombre" del medicamento (ocupa más ancho).
  campoMedicamentoNombre: {
    flex: 3,                         // Proporción 3/5 del ancho
  marginRight: 8,
    marginBottom: 0,                 // Anula el margen del input por defecto
  },
  // Campo "dosis" del medicamento (más angosto).
  campoMedicamentoDosis: {
    flex: 2,                         // Proporción 2/5 del ancho
  marginRight: 8,
    marginBottom: 0,                 // Anula el margen del input por defecto
  },
  // Botón para quitar un medicamento de la lista dinámica.
  botonQuitar: {
    minHeight: 44,                   // Target táctil mínimo 44px (guía)
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 8,
  },
  // Texto de ayuda bajo un campo (explica el formato esperado).
  ayuda: {
  fontSize: 14,
    color: '#6e6e6e',               // 4.68:1 sobre #f5f5f5, el fondo real de
                                    // las tarjetas. Antes era #777, que daba
                                    // 4.11:1 y no llegaba a 4.5:1.
    marginTop: -6,                   // Se acerca al campo al que ayuda
  marginBottom: 12,
  },
  // Fila separadora "o continuá con..." de la sección de SSO.
  separadorSso: {
    flexDirection: 'row',            // Línea - texto - línea en horizontal
    alignItems: 'center',            // Alinea el texto con las líneas
  marginVertical: 8,
  },
  // Línea del separador de SSO.
  lineaSso: {
  flex: 1,
  height: 1,
    backgroundColor: '#e0e0e0', // Gris claro, sutil
  },
  // Botón de acceso SSO (Google / Microsoft).
  botonSso: {
  backgroundColor: '#fff',
  borderWidth: 1,
    // El borde es lo único que separa este botón blanco del fondo
    // degradado de la pantalla, así que es un componente de interfaz y
    // WCAG 1.4.11 le exige 3:1. #d0d0d0 daba 1.5:1 contra el blanco: en
    // la práctica el botón se veía como un hueco sin borde.
    borderColor: '#767676',
    minHeight: 48,           // Target táctil alto: supera el mínimo 44px (guía)
  justifyContent: 'center',
  padding: 14,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 12,
  },
  // Texto del botón de acceso SSO.
  botonSsoTexto: {
    color: '#333',      // Gris oscuro (contraste > 7:1 sobre blanco, WCAG AA)
    fontWeight: '600',  // Seminegrita
    fontSize: 16,       // 16px: tamaño legible para el pulgar (guía)
  },
});