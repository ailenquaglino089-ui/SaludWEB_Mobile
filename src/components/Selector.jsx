// ============================================================
// components/Selector.jsx - Selector desplegable (picker modal)
// ============================================================
// Equivalente mobile del <select> de HTML: un campo que al tocarlo
// abre un Modal con las opciones en forma de lista vertical
// (patrón bottom sheet). Al elegir una opción se cierra y avisa
// al formulario. Sin dependencias externas (nativa de React Native).
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator
} from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';

// Props:
//  - etiqueta: texto del label del campo
//  - opciones: [{valor, etiqueta}] candidatas a elegir
//  - valorSeleccionado: id actualmente elegido (o null)
//  - textoMuestra: texto forzado cuando el id no está en 'opciones'
//    (usado al editar un registro cuyo valor no vino en el catálogo)
//  - onSeleccionar: (opcion) => void (se llama con la opción tocada)
//  - error: mensaje específico del campo (cadena vacía = sin error)
//  - cargando: true mientras llega el catálogo (muestra ruleta)
//  - placeholder: texto cuando no hay nada elegido
export default function Selector({
  etiqueta,
  opciones,
  valorSeleccionado,
  textoMuestra,
  onSeleccionar,
  error,
  cargando = false,
  placeholder,
}) {
  // True mientras el Modal está abierto.
  const [abierto, setAbierto] = useState(false);

  // Busca la opción marcada actualmente dentro del catálogo (para resaltarla).
  const opcionActual = opciones.find((o) => o.valor === valorSeleccionado);

  // Texto que muestra el campo:
  //  1) la opción elegida del catálogo, si existe
  //  2) el texto forzado (edición sin catálogo), si se pasó
  //  3) el placeholder (o un texto genérico) cuando no hay selección
  const texto = opcionActual
    ? opcionActual.etiqueta
    : (textoMuestra || (valorSeleccionado ? `#${valorSeleccionado}` : placeholder || 'Seleccionar...'));

  // Si hay un valor elegido el texto se pinta oscuro; si no, gris de "placeholder".
  const colorTexto = opcionActual || textoMuestra ? '#333' : '#999';

  return (
    <View>
      {/* Etiqueta del campo */}
      <Text style={styles.label}>{etiqueta}</Text>

      {/* Botón que abre el Modal: muestra el valor elegido (o el placeholder) */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setAbierto(true)}
        accessibilityRole="button"
        accessibilityLabel={etiqueta}
      >
        <Text style={{ fontSize: 16, color: colorTexto }}>{texto}</Text>
      </TouchableOpacity>

      {/* Modal: se superpone a la pantalla con la lista de opciones */}
      <Modal
        visible={abierto}
        transparent           // Fondo visible para poder distinguir la superposición
        animationType="slide" // La hoja de opciones sube desde abajo (estilo mobile)
        onRequestClose={() => setAbierto(false)}
      >
        {/* Fondo semitransparente: al tocarlo se cierra el selector */}
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'flex-end', // La hoja queda pegada al borde inferior
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          onPress={() => setAbierto(false)}
          activeOpacity={1}
        >
          {/* Hoja inferior blanca con la lista de opciones (bottom sheet) */}
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            maxHeight: '70%',
          }}>
            <Text style={[styles.titulo, { fontSize: 18 }]}>{etiqueta}</Text>

            {/* Mientras llega el catálogo se muestra la ruleta giratoria */}
            {cargando ? (
              <ActivityIndicator color="#667eea" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={opciones}
                keyExtractor={(o, i) => String(o.valor ?? i)}
                style={{ maxHeight: 300 }}
                renderItem={({ item }) => (
                  // Opción tocable: se resalta la que está elegida actualmente
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#e0e0e0',
                      backgroundColor: item.valor === valorSeleccionado ? '#eef2ff' : '#fff',
                    }}
                    onPress={() => {
                      onSeleccionar(item); // Avisa al formulario la opción elegida
                      setAbierto(false);   // Cerra el Modal al elegir
                    }}
                  >
                    <Text style={{ fontSize: 16, color: '#333' }}>{item.etiqueta}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  // Mensaje amable cuando el catálogo llega vacío
                  <Text style={[styles.texto, { textAlign: 'center', paddingVertical: 20 }]}>
                    Sin opciones
                  </Text>
                }
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Error específico del campo (solo si existe) */}
      {error ? <Text style={styles.errorCampo}>{error}</Text> : null}
    </View>
  );
}