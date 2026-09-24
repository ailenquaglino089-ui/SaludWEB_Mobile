// ============================================================
// components/CampoInput.jsx - Campo de formulario reutilizable
// ============================================================
// Encapsula la estructura "label + caja de texto + mensaje de error"
// para que todos los formularios del CRUD compartan la MISMA
// apariencia y la MISMA validación por campo (principio DRY:
// no repetir la estructura del campo en cada pantalla).
import React from 'react';
import { View, Text, TextInput } from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';

// Props:
//  - etiqueta: texto del label del campo
//  - valor / onChange: valor controlado y la función que lo actualiza
//  - error: mensaje específico del campo (cadena vacía = sin error)
//  - rest: props nativas del TextInput (placeholder, keyboardType, etc.)
export default function CampoInput({ etiqueta, valor, onChange, error, ...rest }) {
  return (
    <View>
      {/* Etiqueta del campo: explica qué dato se espera */}
      <Text style={styles.label}>{etiqueta}</Text>

      {/* Caja de texto con el estilo compartido y las props extra del usuario */}
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={onChange}
        {...rest}
      />

      {/* Mensaje de error específico: solo aparece cuando el campo tiene error */}
      {error ? <Text style={styles.errorCampo}>{error}</Text> : null}
    </View>
  );
}