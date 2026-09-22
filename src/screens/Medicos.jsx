// ============================================================
// Medicos.jsx - Listado de médicos (consume /api/medicos)
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// Listado paginado genérico reutilizable.
import PagedList from './PagedList';

// Pantalla de médicos: solo configura el componente genérico.
export default function Medicos({ volver }) {
  return (
    <View style={{ flex: 1 }}>
      {/* Botón para volver al Dashboard */}
      <TouchableOpacity onPress={volver} style={{ padding: 8 }}>
        <Text style={{ color: '#667eea', fontWeight: '600' }}>← Volver</Text>
      </TouchableOpacity>

      {/* Configuración del listado: ruta, título, búsqueda y columnas */}
      <PagedList
        url="/medicos"                          // Ruta del backend (paginada)
        titulo="👨‍⚕️ Médicos"
        placeholder="Buscar por nombre, matrícula o especialidad..."
        campos={[
          { clave: 'nombre', etiqueta: 'Nombre' },      // Nombre completo
          { clave: 'matricula', etiqueta: 'Matrícula' }, // Número de matrícula
          { clave: 'especialidad', etiqueta: 'Especialidad' }, // Área de especialidad
        ]}
      />
    </View>
  );
}