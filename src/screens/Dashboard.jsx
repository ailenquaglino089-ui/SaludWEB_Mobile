// ============================================================
// Dashboard.jsx - Panel inicial con datos del usuario
// ============================================================
// Aplicando el punto "Simplificación radical del menú principal"
// de la guía: la navegación a Módulos se movió a la barra inferior
// (BottomNav) y en el Dashboard solo queda el saludo y el rol.
import React from 'react';
import { View, Text } from 'react-native';
// Estilos compartidos de la app.
import { styles } from '../styles';
// Contexto de autenticación (usuario logueado).
import { useAuth } from '../context/AuthContext';

// Devuelve el emoji del rol para el saludo.
const emojiRol = (rol) => {
  if (rol === 'medico') return '👨‍⚕️';  // Médico
  if (rol === 'admin') return '🛡️';      // Administrador
  return '👤';                            // Paciente (por defecto)
};

// Devuelve la etiqueta en español del rol.
const textoRol = (rol) => {
  if (rol === 'medico') return 'Médico';
  if (rol === 'admin') return 'Administrador';
  return 'Paciente';
};

// Pantalla principal: saluda al usuario y resume su contexto.
// No recibe props: la navegación la resuelve BottomNav en App.js.
export default function Dashboard() {
  // Datos del usuario logueado (nombre y rol).
  const { usuario } = useAuth();

  return (
    <View style={styles.contenedor}>
      {/* Saludo con el nombre y el rol del usuario */}
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>
          👋 Hola, {usuario?.nombre || 'Usuario'}
        </Text>
        <Text style={styles.texto}>
          {emojiRol(usuario?.tipo_usuario)} Rol: {textoRol(usuario?.tipo_usuario)}
        </Text>
      </View>

      {/* Aviso de navegación: las opciones críticas están en la barra inferior */}
      <View style={styles.tarjeta}>
        <Text style={styles.texto}>
          📱 Usá la barra inferior para acceder a Pacientes, Médicos, Recetas y Salir.
        </Text>
      </View>
    </View>
  );
}