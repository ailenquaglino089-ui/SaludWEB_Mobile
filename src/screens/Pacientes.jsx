// ============================================================
// Pacientes.jsx - Listado de pacientes (consume /api/pacientes)
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// Listado paginado genérico reutilizable.
import PagedList from './PagedList';
// Estilos compartidos.
import { styles } from '../styles';

// Pantalla de pacientes: solo configura el componente genérico.
export default function Pacientes({ volver }) {
  return (
    <View style={{ flex: 1 }}>
      {/* Botón para volver al Dashboard */}
      <TouchableOpacity onPress={volver} style={{ padding: 8 }}>
        <Text style={{ color: '#667eea', fontWeight: '600' }}>← Volver</Text>
      </TouchableOpacity>

      {/* Configuración del listado: ruta, título, búsqueda y columnas */}
      <PagedList
        url="/pacientes"                    // Ruta del backend (paginada)
        titulo="👤 Pacientes"
        placeholder="Buscar por nombre, DNI u obra social..."
        campos={[
          { clave: 'nombre', etiqueta: 'Nombre' },       // Nombre completo
          { clave: 'dni', etiqueta: 'DNI' },             // Número de documento
          { clave: 'obra_social', etiqueta: 'Obra Social' }, // Obra social (o null)
        ]}
      />
    </View>
  );
}