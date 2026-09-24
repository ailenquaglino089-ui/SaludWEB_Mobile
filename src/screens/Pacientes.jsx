// ============================================================
// Pacientes.jsx - Listado de pacientes (consume /api/pacientes)
// ============================================================
import React from 'react';
import { View } from 'react-native';
// Listado paginado genérico reutilizable.
import PagedList from './PagedList';
// Estilos compartidos.
import { styles } from '../styles';

// Pantalla de pacientes: solo configura el componente genérico.
// La vuelta al Dashboard la resuelve la barra inferior (BottomNav),
// por lo que ya no recibe la prop 'volver' (guía de navegación).
export default function Pacientes() {
  return (
    <View style={{ flex: 1 }}>
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