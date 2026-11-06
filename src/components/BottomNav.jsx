// ============================================================
// BottomNav.jsx - Barra de navegación inferior fija (sticky)
// ============================================================
// Implementa el patrón "Bottom Navigation Bar" del punto "Mejorar
// menú y navegación" de la guía de adaptación mobile: las acciones
// más frecuentes quedan FIJAS en la parte inferior, en la zona
// natural de alcance del pulgar (90% de los usuarios usa el pulgar
// derecho). Máximo 5 elementos críticos visibles, como indica la guía.
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// Estilos compartidos de la app (barraNavegacion, navItem, navActivo...).
import { styles } from '../styles';
// Rol de la sesión: define qué secciones tiene sentido mostrar.
import { useAuth } from '../context/AuthContext';

// Elementos críticos del menú principal (máx. 5 según la guía).
// texto: etiqueta visible | icono: emoji | pantalla: destino en App.js
//
// El paciente NO ve Pacientes ni Médicos: son secciones de gestión que no le
// corresponden. Ve Inicio, Turnos y sus propias Recetas, que es lo que necesita
// para pedir y seguir su turno y consultar sus prescripciones.
const ELEMENTOS_PACIENTE = [
  { texto: 'Inicio', icono: '🏠', pantalla: 'dashboard' },
  { texto: 'Turnos', icono: '📅', pantalla: 'turnos' },
  { texto: 'Recetas', icono: '💊', pantalla: 'mis-recetas' },
];

// Recetas es una pantalla clínica de uso exclusivo médico. El admin conserva
// la gestión de pacientes y profesionales, pero no el listado de recetas.
const ELEMENTOS_ADMIN = [
  { texto: 'Inicio', icono: '🏠', pantalla: 'dashboard' },
  { texto: 'Pacientes', icono: '👤', pantalla: 'pacientes' },
  { texto: 'Médicos', icono: '👨‍⚕️', pantalla: 'medicos' },
];

const ELEMENTOS_MEDICO = [
  ...ELEMENTOS_ADMIN,
  { texto: 'Recetas', icono: '💊', pantalla: 'prescripciones' },
];

// Barra inferior fija. Recibe:
//  - pantalla: clave de la pantalla activa (para resaltarla)
//  - navegar: función para cambiar de pantalla (setPantalla de App.js)
//  - cerrarSesion: función de logout (último acceso de la barra)
export default function BottomNav({ pantalla, navegar, cerrarSesion }) {
  // El rol decide el conjunto de ítems. Si todavía no hay usuario (primer
  // render), se usa el menú administrativo para no mostrar una barra vacía.
  const { usuario } = useAuth();
  const rol = usuario?.tipo_usuario;
  const ELEMENTOS = rol === 'paciente'
    ? ELEMENTOS_PACIENTE
    : rol === 'medico'
      ? ELEMENTOS_MEDICO
      : ELEMENTOS_ADMIN;

  return (
    // Contenedor horizontal con borde superior (se dibuja siempre sobre el contenido)
    <View style={styles.barraNavegacion}>
      {/* Cada acceso crítico del menú principal */}
      {ELEMENTOS.map((elem) => {
        // True si este ítem es la pantalla activa (se resalta con otro color).
        const activo = pantalla === elem.pantalla;

        return (
          // Ítem táctil: altura >= 44px (guía: tamaño mínimo de elementos táctiles).
          <TouchableOpacity
            key={elem.pantalla}
            style={styles.navItem}
            onPress={() => navegar(elem.pantalla)} // Cambia la pantalla activa
            accessibilityRole="button"              // Rol correcto para accesibilidad
            accessibilityState={{ selected: activo }} // Estado anunciado a lectores
          >
            {/* Ícono del ítem */}
            <Text style={{ fontSize: 20 }}>{elem.icono}</Text>
            {/* Etiqueta: activa = negrita índigo; inactiva = gris */}
            <Text style={activo ? styles.navActivo : styles.navInactivo}>
              {elem.texto}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Acción de cierre de sesión (siempre visible en la barra) */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={cerrarSesion} // Cierra la sesión y vuelve al Login
        accessibilityRole="button"
      >
        <Text style={{ fontSize: 20 }}>🚪</Text>
        <Text style={styles.navInactivo}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}