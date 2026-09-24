// ============================================================
// styles.js - Estilos compartidos de la app móvil
// ============================================================
// Paleta y estilos reutilizables por todas las pantallas para
// mantener la identidad visual de SaludWEB (mismos colores que el Web).
import { StyleSheet } from 'react-native';

// Objeto de estilos exportado; se usa con styles.nombre en el código.
export const styles = StyleSheet.create({
  // Contenedor base de todas las pantallas (fondo claro con relleno).
  contenedor: {
    flex: 1,            // Ocupa todo el alto disponible de la pantalla
    backgroundColor: '#f5f5f5', // Fondo gris muy claro (igual que el Web)
    padding: 16,        // Relleno interno alrededor del contenido
  },
  // Tarjeta blanca con esquinas redondeadas (se usa en formularios y listados).
  tarjeta: {
    backgroundColor: '#ffffff', // Fondo blanco que destaca sobre el gris
    borderRadius: 12,           // Esquinas redondeadas
    padding: 16,                // Relleno interno
    marginBottom: 12,           // Separación entre tarjetas
    shadowColor: '#000',        // Color de la sombra
    shadowOpacity: 0.05,        // Sombra muy suave
    shadowRadius: 8,            // Radio de desenfoque de la sombra
    elevation: 2,               // Sombra en Android
  },
  // Título principal de cada pantalla.
  titulo: {
    fontSize: 22,       // Tamaño de letra grande
    fontWeight: '700',  // Negrita
    color: '#333',      // Gris oscuro legible
    marginBottom: 12,   // Separación con el contenido siguiente
  },
  // Contenedor de la cabecera del login (marca + subtítulo centrados).
  tituloWrapper: {
    alignItems: 'center', // Centra los textos horizontalmente
    marginBottom: 20,     // Separación con la tarjeta del formulario
  },
  // Etiqueta de los campos del formulario.
  label: {
    fontSize: 16,         // 16px: mínimo recomendado para mobile (guía: legibilidad)
    fontWeight: '600',    // Seminegrita
    color: '#333',        // Gris oscuro (contraste > 7:1 sobre blanco, WCAG AA)
    marginBottom: 6,      // Separación con el input
  },
  // Caja de texto/select del formulario.
  input: {
    borderWidth: 2,          // Borde visible
    borderColor: '#e0e0e0',  // Borde gris claro
    borderRadius: 8,         // Esquinas redondeadas
    padding: 12,             // Relleno interno cómodo (alto táctil >= 44px)
    minHeight: 44,           // Altura táctil mínima recomendada (guía: 44x44)
    fontSize: 16,            // 16px: mínimo recomendado para leer en mobile
    backgroundColor: '#fff', // Fondo blanco
    marginBottom: 12,        // Separación entre campos
  },
  // Botón principal (degradado igual al Web: .btn-primary).
  botonPrimario: {
    backgroundColor: '#667eea', // Azul índigo base del degradado
    minHeight: 48,              // Target táctil alto: supera el mínimo 44px (guía)
    justifyContent: 'center',   // Centra el contenido verticalmente
    padding: 14,                // Relleno táctil
    borderRadius: 8,            // Esquinas redondeadas
    alignItems: 'center',       // Centra el texto del botón
    marginBottom: 12,           // Separación inferior
  },
  // Texto del botón primario.
  botonPrimarioTexto: {
    color: '#fff',      // Texto blanco (contrasta con el fondo)
    fontWeight: '600',  // Seminegrita
    fontSize: 16,       // Tamaño legible para el pulgar
  },
  // Botón primario atenuado (estado "deshabilitado" del candado biométrico).
  botonPrimarioOscurecido: {
    opacity: 0.6, // Reduce el contraste para indicar que no se puede tocar
  },
  // Botón de navegación secundario (paginación, volver).
  botonSecundario: {
    backgroundColor: '#e0e0e0', // Fondo gris claro
    minHeight: 44,              // Altura táctil mínima recomendada 44px (guía)
    justifyContent: 'center',   // Centra el contenido verticalmente
    padding: 10,                // Relleno
    borderRadius: 8,            // Esquinas redondeadas
    alignItems: 'center',       // Centra el texto
  },
  // Botón de peligro (deshabilitado en esta versión de solo-consulta).
  botonPeligro: {
    backgroundColor: '#ef4444', // Rojo (mismo .btn-danger del Web)
    minHeight: 44,              // Altura táctil mínima recomendada 44px (guía)
    justifyContent: 'center',   // Centra el contenido verticalmente
    padding: 10,                // Relleno
    borderRadius: 8,            // Esquinas redondeadas
    alignItems: 'center',       // Centra el texto
  },
  // Texto común de la app.
  texto: {
    fontSize: 16,  // 16px: mínimo recomendado para cuerpo de texto en mobile (guía)
    color: '#555', // Gris medio (contraste > 7:1 sobre blanco, WCAG AA)
  },
  // Mensaje de error (rojo, igual que .alert-error del Web).
  error: {
    color: '#991b1b',      // Texto rojo oscuro
    backgroundColor: '#fef2f2', // Fondo rojo clarísimo
    padding: 10,           // Relleno
    borderRadius: 8,       // Esquinas redondeadas
    marginBottom: 12,      // Separación con el contenido siguiente
    borderWidth: 2,        // Borde visible
    borderColor: '#fca5a5',// Borde rojo suave
  },
  // Fila de la lista (cada registro del listado).
  fila: {
    flexDirection: 'row',      // Elementos en horizontal
    justifyContent: 'space-between', // Texto a izquierda, valor a derecha
    paddingVertical: 8,        // Relleno vertical cómodo
    borderBottomWidth: 1,      // Línea separadora fina
    borderBottomColor: '#e0e0e0', // Color de la línea
  },
  // Etiqueta de una fila de listado.
  filaLabel: {
    fontSize: 16,     // 16px: legibilidad en mobile (guía)
    color: '#555',    // Gris medio: cumple contraste WCAG AA (>= 4.5:1) sobre blanco
    flex: 1,          // Ocupa el espacio disponible
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
    backgroundColor: '#ffffff',  // Fondo blanco
    borderTopWidth: 1,           // Separador superior fino
    borderTopColor: '#e0e0e0',   // Color del separador
    paddingVertical: 6,          // Relleno vertical del contenedor
    paddingHorizontal: 4,        // Relleno horizontal del contenedor
  },
  // Cada ítem de la barra inferior (zona natural del pulgar).
  navItem: {
    flex: 1,                     // Reparte el ancho en partes iguales
    alignItems: 'center',        // Centra ícono + etiqueta
    justifyContent: 'center',    // Centrado vertical
    minHeight: 44,               // Altura táctil mínima 44px (guía)
    paddingVertical: 4,          // Relleno interno
  },
  // Etiqueta del ítem activo (resaltado en el color de la marca).
  navActivo: {
    fontSize: 12,                // Etiqueta compacta
    color: '#667eea',            // Azul índigo (ítem seleccionado)
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
    alignItems: 'center',        // Centrado vertical
    borderWidth: 2,              // Borde igual que el input normal
    borderColor: '#e0e0e0',      // Borde gris claro
    borderRadius: 8,             // Esquinas redondeadas
    backgroundColor: '#fff',     // Fondo blanco
    marginBottom: 12,            // Separación con el siguiente campo
  },
  // Botón mostrar/ocultar contraseña (toggle ocular).
  botonMostrar: {
    paddingHorizontal: 12,       // Relleno lateral cómodo
    minHeight: 44,               // Altura táctil mínima 44px (guía)
    justifyContent: 'center',    // Centra el ícono verticalmente
  },
  // Ícono del botón mostrar/ocultar.
  botonMostrarTexto: {
    fontSize: 18,                // Tamaño del ícono
  },
  // Mensaje de error específico de un campo (validación onBlur).
  errorCampo: {
    color: '#991b1b',            // Texto rojo oscuro (contraste alto)
    fontSize: 14,                // Tamaño de ayuda
    marginTop: -6,               // Se acerca al campo para asociarse visualmente
    marginBottom: 12,            // Separación con el siguiente elemento
  },

  // --- Estilos nuevos del CRUD completo (alta/edición/baja desde mobile) ---

  // Banner de éxito (verde): feedback positivo tras guardar o eliminar.
  exito: {
    color: '#166534',                // Texto verde oscuro (contraste alto)
    backgroundColor: '#dcfce7',      // Fondo verde muy claro
    padding: 10,                     // Relleno del banner
    borderRadius: 8,                 // Esquinas redondeadas
    marginBottom: 12,                // Separación con el contenido siguiente
    borderWidth: 2,                  // Borde visible
    borderColor: '#86efac',          // Borde verde suave
  },

  // Botón verde "Nuevo" (alta de registros) al tope del listado.
  botonNuevo: {
    backgroundColor: '#22c55e',      // Verde de éxito (acción de crear)
    minHeight: 48,                   // Altura táctil superior al mínimo 44px (guía)
    justifyContent: 'center',        // Centra el contenido verticalmente
    alignItems: 'center',            // Centra el texto
    borderRadius: 8,                 // Esquinas redondeadas
    padding: 14,                     // Relleno táctil cómodo
    marginBottom: 12,                // Separación con el buscador/lista
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
    justifyContent: 'center',        // Centra el contenido verticalmente
    alignItems: 'center',            // Centra el texto
    borderRadius: 8,                 // Esquinas redondeadas
    paddingHorizontal: 12,           // Relleno lateral cómodo
    paddingVertical: 8,              // Relleno vertical
    marginRight: 8,                  // Separación entre botones de acciones
  },
  // Variante visual de "Editar" (fondo índigo muy claro).
  botonAccionClaro: {
    backgroundColor: '#e0e7ff',      // Fondo índigo claro
  },
  // Variante visual de "Eliminar" (fondo rojo muy claro).
  botonAccionPeligro: {
    backgroundColor: '#fee2e2',      // Fondo rojo claro
  },
  // Texto índigo de las acciones "positivas" (Editar/Estado).
  textoAccion: {
    color: '#4338ca',                // Índigo oscuro (contraste alto)
    fontWeight: '600',               // Seminegrita
    fontSize: 14,                    // Tamaño legible del botón
  },
  // Texto rojo de "Eliminar" (comunica peligro visualmente).
  textoAccionPeligro: {
    color: '#b91c1c',                // Rojo oscuro (contraste alto)
    fontWeight: '600',               // Seminegrita
    fontSize: 14,                    // Tamaño legible del botón
  },
  // Fila horizontal que contiene los botones de acción de una tarjeta.
  pieAcciones: {
    flexDirection: 'row',            // Botones en horizontal
    justifyContent: 'flex-end',      // Alineados a la derecha de la tarjeta
    marginTop: 10,                   // Separación con los datos del registro
  },

  // Pie FIJO de los formularios: acciones siempre visibles junto al pulgar
  // (punto "Pies fijos de formularios" de la guía de adaptación a mobile).
  pieFormulario: {
    backgroundColor: '#ffffff',      // Fondo blanco (igual al Web)
    borderTopWidth: 1,               // Línea separadora superior
    borderTopColor: '#e0e0e0',       // Color de la línea
    padding: 12,                     // Relleno del pie
    flexDirection: 'row',            // Botones lado a lado
    gap: 8,                          // Separación entre los dos botones
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
    alignItems: 'center',            // Centrado vertical de los tres elementos
    marginBottom: 8,                 // Separación entre filas de medicamentos
  },
  // Campo "nombre" del medicamento (ocupa más ancho).
  campoMedicamentoNombre: {
    flex: 3,                         // Proporción 3/5 del ancho
    marginRight: 8,                  // Separación con el campo dosis
    marginBottom: 0,                 // Anula el margen del input por defecto
  },
  // Campo "dosis" del medicamento (más angosto).
  campoMedicamentoDosis: {
    flex: 2,                         // Proporción 2/5 del ancho
    marginRight: 8,                  // Separación con el botón quitar
    marginBottom: 0,                 // Anula el margen del input por defecto
  },
  // Botón para quitar un medicamento de la lista dinámica.
  botonQuitar: {
    minHeight: 44,                   // Target táctil mínimo 44px (guía)
    justifyContent: 'center',        // Centra el ícono verticalmente
    alignItems: 'center',            // Centra el ícono horizontalmente
    paddingHorizontal: 8,            // Relleno lateral cómodo
  },
  // Texto de ayuda bajo un campo (explica el formato esperado).
  ayuda: {
    fontSize: 14,                    // Tamaño de ayuda
    color: '#777',                   // Gris medio (accesible como texto secundario)
    marginTop: -6,                   // Se acerca al campo al que ayuda
    marginBottom: 12,                // Separación con el siguiente elemento
  },
  // Fila separadora "o continuá con..." de la sección de SSO.
  separadorSso: {
    flexDirection: 'row',            // Línea - texto - línea en horizontal
    alignItems: 'center',            // Alinea el texto con las líneas
    marginVertical: 8,               // Separación con el botón superior e inferior
  },
  // Línea del separador de SSO.
  lineaSso: {
    flex: 1,               // Ocupa el espacio disponible a cada lado del texto
    height: 1,             // Alto de 1px (línea fina)
    backgroundColor: '#e0e0e0', // Gris claro, sutil
  },
  // Botón de acceso SSO (Google / Microsoft).
  botonSso: {
    backgroundColor: '#fff', // Fondo blanco (contraste con el degradado principal)
    borderWidth: 1,          // Borde visible finito
    borderColor: '#d0d0d0',  // Gris medio del borde
    minHeight: 48,           // Target táctil alto: supera el mínimo 44px (guía)
    justifyContent: 'center',// Centra el contenido verticalmente
    padding: 14,             // Relleno táctil cómodo
    borderRadius: 8,         // Esquinas redondeadas
    alignItems: 'center',    // Centra el texto
    marginBottom: 12,        // Separación con el siguiente elemento
  },
  // Texto del botón de acceso SSO.
  botonSsoTexto: {
    color: '#333',      // Gris oscuro (contraste > 7:1 sobre blanco, WCAG AA)
    fontWeight: '600',  // Seminegrita
    fontSize: 16,       // 16px: tamaño legible para el pulgar (guía)
  },
});