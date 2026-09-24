// ============================================================
// Medicos.jsx - Listado de médicos (consume /api/medicos)
// ============================================================
import React from 'react';
import { View } from 'react-native';
// Listado paginado genérico reutilizable.
import PagedList from './PagedList';

// Pantalla de médicos: solo configura el componente genérico.
// La vuelta al Dashboard la resuelve la barra inferior (BottomNav),
// por lo que ya no recibe la prop 'volver' (guía de navegación).
export default function Medicos() {
  return (
    <View style={{ flex: 1 }}>
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