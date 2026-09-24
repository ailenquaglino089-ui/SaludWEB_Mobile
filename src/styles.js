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
});