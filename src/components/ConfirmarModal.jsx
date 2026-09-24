// ============================================================
// components/ConfirmarModal.jsx - Diálogo de confirmación
// ============================================================
// Equivalente mobile del modal de confirmación del Web ("¿Eliminar?").
// Evita borrados accidentales: exige un toque explícito en "Eliminar"
// antes de enviar el DELETE al backend (principio de confirmación).
import React from 'react';
import {
  View, Text, TouchableOpacity, Modal, ActivityIndicator
} from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';

// Props:
//  - visible: true para mostrar el diálogo
//  - titulo / mensaje: texto del aviso (qué se está por eliminar)
//  - alConfirmar: () => void (botón rojo "Eliminar")
//  - alCancelar: () => void (botón gris "Cancelar")
//  - cargando: true mientras el backend procesa el borrado (deshabilita botones)
export default function ConfirmarModal({
  visible,
  titulo,
  mensaje,
  alConfirmar,
  alCancelar,
  cargando = false,
}) {
  return (
    // Modal nativo: tap en "Cancelar" (onRequestClose) lo cierra como escape.
    <Modal
      visible={visible}
      transparent           // Fondo superpuesto para tapar la pantalla
      animationType="fade"  // Aparece con un fundido suave
      onRequestClose={alCancelar}
    >
      {/* Contenedor de toda la pantalla con fondo oscuro semitransparente */}
      <View style={{
        flex: 1,
        justifyContent: 'center', // Diálogo centrado verticalmente
        padding: 24,              // Márgenes laterales cómodos
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        {/* Tarjeta blanca del diálogo */}
        <View style={[styles.tarjeta, { marginBottom: 0 }]}>
          {/* Título del diálogo */}
          <Text style={[styles.titulo, { fontSize: 18 }]}>{titulo}</Text>
          {/* Mensaje que describe lo que se va a hacer */}
          <Text style={styles.texto}>{mensaje}</Text>

          {/* Botones lado a lado: Cancelar (gris) y Eliminar (rojo) */}
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
            {/* Cancela sin borrar: vuelve a la pantalla anterior */}
            <TouchableOpacity
              style={[styles.botonSecundario, styles.botonMitad]}
              onPress={alCancelar}
              disabled={cargando}
            >
              <Text style={{ fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>

            {/* Confirma el borrado: ejecuta el DELETE (rojo, botón de peligro) */}
            <TouchableOpacity
              style={[styles.botonPeligro, styles.botonMitad]}
              onPress={alConfirmar}
              disabled={cargando}
            >
              {/* Mientras borra se muestra la ruleta en lugar del texto */}
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonPeligroTexto}>Eliminar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}