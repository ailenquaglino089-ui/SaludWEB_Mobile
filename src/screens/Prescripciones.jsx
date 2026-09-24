// ============================================================
// Prescripciones.jsx - Listado de prescripciones con filtro por estado
// ============================================================
import React from 'react';
import { View } from 'react-native';
// Listado paginado genérico reutilizable.
import PagedList from './PagedList';

// Devuelve la etiqueta con ícono del estado (igual que getStatusBadge del Web).
const etiquetaEstado = (estado) => {
  if (estado === 'activa') return '✓ Activa';          // Estado vigente
  if (estado === 'vencida') return '⚠ Vencida';        // Expirada
  if (estado === 'dispensada') return '✓ Dispensada';  // Entregada en farmacia
  if (estado === 'cancelada') return '✗ Cancelada';    // Anulada
  return estado; // Cualquier otro valor se muestra tal cual
};

// Devuelve el color de fondo del estado (igual que getStatusColor del Web).
const colorEstado = (estado) => {
  if (estado === 'activa') return '#22c55e';    // Verde
  if (estado === 'vencida') return '#f59e0b';   // Ámbar
  if (estado === 'dispensada') return '#3b82f6';   // Azul
  if (estado === 'cancelada') return '#ef4444'; // Rojo
  return '#6b7280'; // Gris para valores no previstos
};

// Pantalla de prescripciones: configura el listado genérico y agrega filtro.
// La vuelta al Dashboard la resuelve la barra inferior (BottomNav),
// por lo que ya no recibe la prop 'volver' (guía de navegación).
export default function Prescripciones() {
  return (
    <View style={{ flex: 1 }}>
      {/* Configuración del listado: ruta, título, búsqueda, columnas, filtro y badges */}
      <PagedList
        url="/prescripciones"            // Ruta del backend (paginada + filtro estado)
        titulo="💊 Prescripciones"
        placeholder="Buscar por medicamento, paciente o médico..."
        campos={[
          { clave: 'medicamentos', etiqueta: 'Medicamentos' }, // Lista de medicamentos
          { clave: 'nombre_paciente', etiqueta: 'Paciente' },  // Paciente al que se recetó
          { clave: 'nombre_medico', etiqueta: 'Médico' },       // Médico que recetó
          { clave: 'estado', etiqueta: 'Estado' },              // Estado vigente
        ]}
        // Filtros tipo chip para el campo "estado" (se envían como ?estado=...).
        filtros={[
          { valor: 'activa', etiqueta: '✓ Activa' },
          { valor: 'vencida', etiqueta: '⚠ Vencida' },
          { valor: 'dispensada', etiqueta: '✓ Dispensada' },
          { valor: 'cancelada', etiqueta: '✗ Cancelada' },
        ]}
        // Personaliza los valores: medicamentos se unen y el estado se pinta con color.
        renderValor={(registro, campo) => {
          // Medicamentos: array de {nombre, dosis} que se formatea "Nombre (Dosis)".
          if (campo.clave === 'medicamentos') {
            return (registro.medicamentos || [])
              .map((m) => `${m.nombre}${m.dosis ? ` (${m.dosis})` : ''}`)
              .join(', ');
          }
          // Estado: se muestra el badge coloreado con la etiqueta del estado.
          if (campo.clave === 'estado') {
            return etiquetaEstado(registro.estado);
          }
          // Cualquier otro campo se muestra con su valor por defecto.
          return registro[campo.clave] ?? '—';
        }}
      />
    </View>
  );
}